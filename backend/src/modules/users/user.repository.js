import pool from '../../config/db.js';

// Every function takes an optional `db` so it can run inside a transaction (withTransaction)
// or on the shared pool. All SQL is parameterised; column names are aliased to camelCase.

// Columns that are safe to send to the client. password_hash is never part of this list.
export const PUBLIC_USER_COLUMNS = `
  id, name, email, mobile, role,
  is_active AS "isActive",
  is_demo AS "isDemo",
  email_notifications AS "emailNotifications",
  last_login_at AS "lastLoginAt",
  created_at AS "createdAt"`;

export const createUser = async (
  { name, email, mobile, passwordHash, role = 'customer', isDemo = false },
  db = pool,
) => {
  const { rows } = await db.query(
    `INSERT INTO users (name, email, mobile, password_hash, role, is_demo)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${PUBLIC_USER_COLUMNS}`,
    [name, email, mobile, passwordHash, role, isDemo],
  );
  return rows[0];
};

export const findById = async (id, db = pool) => {
  const { rows } = await db.query(`SELECT ${PUBLIC_USER_COLUMNS} FROM users WHERE id = $1`, [id]);
  return rows[0] ?? null;
};

// The only query that reads password_hash: used to verify a password, never returned to clients
export const findCredentialsByEmail = async (email, db = pool) => {
  const { rows } = await db.query(
    `SELECT ${PUBLIC_USER_COLUMNS}, password_hash AS "passwordHash" FROM users WHERE email = $1`,
    [email],
  );
  return rows[0] ?? null;
};

export const findCredentialsById = async (id, db = pool) => {
  const { rows } = await db.query(
    `SELECT ${PUBLIC_USER_COLUMNS}, password_hash AS "passwordHash" FROM users WHERE id = $1`,
    [id],
  );
  return rows[0] ?? null;
};

export const findByEmail = async (email, db = pool) => {
  const { rows } = await db.query(`SELECT ${PUBLIC_USER_COLUMNS} FROM users WHERE email = $1`, [
    email,
  ]);
  return rows[0] ?? null;
};

export const touchLastLogin = (id, db = pool) =>
  db.query('UPDATE users SET last_login_at = now() WHERE id = $1', [id]);

// Partial update: only the keys present in `changes` are written.
// Keys are mapped through a fixed allow-list, so a column name can never come from user input.
const UPDATABLE = {
  name: 'name',
  mobile: 'mobile',
  emailNotifications: 'email_notifications',
  role: 'role',
  isActive: 'is_active',
};

export const updateUser = async (id, changes, db = pool) => {
  const entries = Object.entries(changes).filter(
    ([key, value]) => UPDATABLE[key] && value !== undefined,
  );
  if (entries.length === 0) return findById(id, db);

  const assignments = entries.map(([key], index) => `${UPDATABLE[key]} = $${index + 2}`);
  const { rows } = await db.query(
    `UPDATE users SET ${assignments.join(', ')} WHERE id = $1 RETURNING ${PUBLIC_USER_COLUMNS}`,
    [id, ...entries.map(([, value]) => value)],
  );
  return rows[0] ?? null;
};

export const updatePassword = (id, passwordHash, db = pool) =>
  db.query('UPDATE users SET password_hash = $2 WHERE id = $1', [id, passwordHash]);
