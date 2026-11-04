import { query } from '../../src/config/db.js';

// Tables that hold reference data seeded by migrations, plus the migration bookkeeping
const KEEP = ['pgmigrations', 'categories'];

export const resetDatabase = async () => {
  const { rows } = await query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND NOT (tablename = ANY($1))`,
    [KEEP],
  );
  if (rows.length === 0) return;

  const tables = rows.map((row) => `"${row.tablename}"`).join(', ');
  await query(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`);
};
