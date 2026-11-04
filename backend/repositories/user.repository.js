import { query } from '../config/db.js';

// Columns that are safe to send to the client. password_hash is never selected.
const PUBLIC_COLUMNS = 'id, name, email, mobile, role, created_at';

// Inserts a new user. role, is_active and timestamps come from the column defaults.
// Errors (e.g. 23505 unique violation) are left for the caller to interpret.
export const createUser = async ({ name, email, mobile, passwordHash }) => {
  const { rows } = await query(
    `INSERT INTO users (name, email, mobile, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING ${PUBLIC_COLUMNS}`,
    [name, email, mobile, passwordHash]
  );
  return rows[0];
};
