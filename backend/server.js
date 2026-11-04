// Local / long-running entry point. On Vercel, /api/index.mjs (repo root) exports the same app.
import app from './src/app.js';
import env from './src/config/env.js';
import logger from './src/lib/logger.js';
import { checkDatabaseConnection, closePool } from './src/config/db.js';

// Only start accepting requests once the database is reachable
try {
  await checkDatabaseConnection();
  logger.info('PostgreSQL connected');
} catch (err) {
  logger.fatal({ err: err.message }, 'Could not connect to PostgreSQL');
  process.exit(1);
}

const server = app.listen(env.PORT, () => {
  logger.info(`API listening on http://localhost:${env.PORT}`);
});

// Graceful shutdown: stop taking new requests, let in-flight ones finish, then release DB connections
const shutdown = (signal) => {
  logger.info(`${signal} received, shutting down`);
  server.close(async () => {
    await closePool();
    process.exit(0);
  });
  // Don't hang forever on a stuck connection
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
