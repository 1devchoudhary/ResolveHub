import pool from '../../config/db.js';

// Every function takes an optional `db` so it can run inside a transaction (withTransaction)
// or on the shared pool. All SQL is parameterised; column names are aliased to camelCase.

// Columns that are safe to send to the client. password_hash is never part of this list.
export const PUBLIC_USER_COLUMNS = `
  id, name, email, mobile, role,
  is_active AS "isActive",
  created_at AS "createdAt"`;

export const createUser = async ({ name, email, mobile, passwordHash }, db = pool) => {
  const { rows } = await db.query(
    `INSERT INTO users (name, email, mobile, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING ${PUBLIC_USER_COLUMNS}`,
    [name, email, mobile, passwordHash],
  );
  return rows[0];
};
