import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL_POOLED;

// Fail fast: without a database the API can't do anything useful
if (!connectionString) {
  throw new Error("DATABASE_URL_POOLED is not set. Add it to backend/.env");
}

const pool = new Pool({
  connectionString,
  // Neon's pooler (PgBouncer) multiplexes these, so a small per-instance pool is enough
  max: Number(process.env.DB_POOL_MAX) || 10,
  // Close idle clients well before Neon suspends an idle compute (~5 min)
  idleTimeoutMillis: 10_000,
  // Neon's free tier cold-starts in a few seconds after being idle
  connectionTimeoutMillis: 10_000,
});

// An idle client lost its connection (e.g. network blip, Neon restart).
// The pool discards that client and opens a fresh one on the next query,
// so log it instead of crashing the whole server.
pool.on("error", (err) => {
  console.error("❌ Idle PostgreSQL client error:", err.message);
});

// Single entry point for queries — always pass values as params ($1, $2…), never in the SQL string
export const query = (text, params) => pool.query(text, params);

// Startup check: retries cover Neon waking up from scale-to-zero
export const checkDatabaseConnection = async ({ retries = 3, delayMs = 2_000 } = {}) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { rows } = await pool.query("SELECT NOW() AS now");
      console.log(`✅ PostgreSQL connected (server time ${rows[0].now.toISOString()})`);
      return;
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`⚠️  PostgreSQL connection attempt ${attempt} failed: ${err.message}. Retrying…`);
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
};

// Let in-flight queries finish and release every connection (used on shutdown)
export const closePool = () => pool.end();

export default pool;
