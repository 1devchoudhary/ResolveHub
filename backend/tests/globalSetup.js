import 'dotenv/config';
import { runner } from 'node-pg-migrate';

// Runs once before the whole suite: bring the test database schema up to date
export default async function setup() {
  const databaseUrl = process.env.DATABASE_URL_TEST;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL_TEST is not set. See backend/.env.example');
  }

  await runner({
    databaseUrl,
    dir: 'migrations',
    migrationsTable: 'pgmigrations',
    direction: 'up',
    count: Infinity,
    log: () => {},
  });
}
