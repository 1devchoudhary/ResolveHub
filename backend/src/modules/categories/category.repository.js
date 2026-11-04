import pool from '../../config/db.js';

const COLUMNS = `id, name, is_active AS "isActive", created_at AS "createdAt"`;

export const findById = async (id, db = pool) => {
  const { rows } = await db.query(`SELECT ${COLUMNS} FROM categories WHERE id = $1`, [id]);
  return rows[0] ?? null;
};

// With ticket counts, so admins can see which categories are actually used
export const listCategories = async ({ includeInactive = false } = {}, db = pool) => {
  const { rows } = await db.query(
    `SELECT c.id, c.name, c.is_active AS "isActive", c.created_at AS "createdAt",
            count(t.id) AS "ticketCount"
     FROM categories c
     LEFT JOIN tickets t ON t.category_id = c.id
     WHERE $1 OR c.is_active
     GROUP BY c.id
     ORDER BY c.name`,
    [includeInactive],
  );
  return rows;
};

export const createCategory = async ({ name }, db = pool) => {
  const { rows } = await db.query(
    `INSERT INTO categories (name) VALUES ($1) RETURNING ${COLUMNS}`,
    [name],
  );
  return rows[0];
};

export const updateCategory = async (id, { name, isActive }, db = pool) => {
  const { rows } = await db.query(
    `UPDATE categories
     SET name = COALESCE($2, name), is_active = COALESCE($3, is_active)
     WHERE id = $1
     RETURNING ${COLUMNS}`,
    [id, name ?? null, isActive ?? null],
  );
  return rows[0] ?? null;
};
