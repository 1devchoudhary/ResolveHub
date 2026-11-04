import pg from 'pg';
import { attachDatabasePool } from '@vercel/functions';
import env from './env.js';
import logger from '../lib/logger.js';

const { Pool, types } = pg;

// Return BIGINT/COUNT(*) as JS numbers instead of strings (our counts stay far below 2^53)
types.setTypeParser(types.builtins.INT8, (value) => Number(value));
// NUMERIC (e.g. AVG results) as numbers as well
types.setTypeParser(types.builtins.NUMERIC, (value) => Number(value));

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  // Neon's pooler (PgBouncer) multiplexes these, so a small per-instance pool is enough
  max: env.DB_POOL_MAX,
  // Close idle clients well before Neon suspends an idle compute (~5 min)
  idleTimeoutMillis: 10_000,
  // Neon's free tier cold-starts in a few seconds after being idle
  connectionTimeoutMillis: 10_000,
});

// An idle client lost its connection (network blip, Neon restart). The pool discards it and
// opens a fresh one on the next query, so log it instead of crashing the process.
pool.on('error', (err) => {
  logger.error({ err }, 'Idle PostgreSQL client error');
});

// On Vercel, lets the platform close idle connections before an instance is suspended
if (process.env.VERCEL) attachDatabasePool(pool);

// Single entry point for queries: always pass values as params ($1, $2…), never in the SQL string
export const query = (text, params) => pool.query(text, params);

/**
 * Runs `work` inside a transaction on one dedicated client.
 * Commits when it resolves, rolls back when it throws, and always releases the client.
 *   await withTransaction(async (tx) => { await tx.query(...); await tx.query(...); });
 */
export const withTransaction = async (work) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
};

// Startup check: retries cover Neon waking up from scale-to-zero
export const checkDatabaseConnection = async ({ retries = 3, delayMs = 2_000 } = {}) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (err) {
      if (attempt === retries) throw err;
      logger.warn({ attempt, err: err.message }, 'PostgreSQL connection failed, retrying');
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
};

// Let in-flight queries finish and release every connection (used on shutdown and in tests)
export const closePool = () => pool.end();

export default pool;
