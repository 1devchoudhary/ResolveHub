import pool from '../../config/db.js';
import { PUBLIC_USER_COLUMNS } from '../users/user.repository.js';

// Reporting queries. Every one is a single aggregate over indexed columns; at this scale
// they run in milliseconds, so there's no need for a separate analytics store yet.

export const summary = async ({ days }, db = pool) => {
  const { rows } = await db.query(
    `SELECT
       count(*) FILTER (WHERE status IN ('open', 'in-progress', 'pending')) AS active,
       count(*) FILTER (WHERE status IN ('open', 'in-progress', 'pending') AND assignee_id IS NULL)
         AS unassigned,
       count(*) FILTER (WHERE created_at > now() - make_interval(days => $1)) AS created,
       count(*) FILTER (WHERE resolved_at > now() - make_interval(days => $1)) AS resolved,
       round(percentile_cont(0.5) WITHIN GROUP (
         ORDER BY extract(epoch FROM first_response_at - created_at) / 60)
         FILTER (WHERE created_at > now() - make_interval(days => $1)))::int
         AS "medianFirstResponseMinutes",
       round(percentile_cont(0.5) WITHIN GROUP (
         ORDER BY extract(epoch FROM resolved_at - created_at) / 60)
         FILTER (WHERE resolved_at > now() - make_interval(days => $1)))::int
         AS "medianResolutionMinutes"
     FROM tickets`,
    [days],
  );
  return rows[0];
};

// One row per day, including days with zero tickets (generate_series fills the gaps)
export const dailyVolume = async ({ days }, db = pool) => {
  const { rows } = await db.query(
    `WITH day AS (
       SELECT generate_series(current_date - ($1::int - 1), current_date, interval '1 day')::date AS d
     )
     SELECT to_char(day.d, 'YYYY-MM-DD') AS date,
            (SELECT count(*) FROM tickets t WHERE t.created_at::date = day.d) AS created,
            (SELECT count(*) FROM tickets t WHERE t.resolved_at::date = day.d) AS resolved
     FROM day
     ORDER BY day.d`,
    [days],
  );
  return rows;
};

export const byCategory = async ({ days }, db = pool) => {
  const { rows } = await db.query(
    `SELECT c.name, count(t.id) AS tickets
     FROM categories c
     LEFT JOIN tickets t ON t.category_id = c.id AND t.created_at > now() - make_interval(days => $1)
     GROUP BY c.id
     ORDER BY tickets DESC, c.name`,
    [days],
  );
  return rows;
};

export const byStatus = async (db = pool) => {
  const { rows } = await db.query(`SELECT status, count(*) AS n FROM tickets GROUP BY status`);
  return Object.fromEntries(rows.map((row) => [row.status, row.n]));
};

// Per-agent workload and performance over the period
export const agentPerformance = async ({ days }, db = pool) => {
  const { rows } = await db.query(
    `SELECT u.id, u.name, u.email, u.is_active AS "isActive",
            count(t.id) FILTER (WHERE t.status IN ('open', 'in-progress', 'pending')) AS active,
            count(t.id) FILTER (WHERE t.resolved_at > now() - make_interval(days => $1)) AS resolved,
            round(percentile_cont(0.5) WITHIN GROUP (
              ORDER BY extract(epoch FROM t.first_response_at - t.created_at) / 60)
              FILTER (WHERE t.created_at > now() - make_interval(days => $1)))::int
              AS "medianFirstResponseMinutes"
     FROM users u
     LEFT JOIN tickets t ON t.assignee_id = u.id
     WHERE u.role = 'agent'
     GROUP BY u.id
     ORDER BY resolved DESC, u.name`,
    [days],
  );
  return rows;
};

// ---- Team / user management -----------------------------------------------------------

export const listUsers = async ({ role, search, page, limit }, db = pool) => {
  const { rows } = await db.query(
    `SELECT ${PUBLIC_USER_COLUMNS},
            (SELECT count(*) FROM tickets t WHERE t.customer_id = users.id) AS "ticketsOpened",
            (SELECT count(*) FROM tickets t
              WHERE t.assignee_id = users.id AND t.status IN ('open', 'in-progress', 'pending'))
              AS "activeAssigned",
            count(*) OVER () AS "totalCount"
     FROM users
     WHERE ($1::text IS NULL OR role = $1)
       AND ($2::text IS NULL OR name ILIKE '%' || $2 || '%' OR email ILIKE '%' || $2 || '%')
     ORDER BY CASE role WHEN 'admin' THEN 0 WHEN 'agent' THEN 1 ELSE 2 END, name
     LIMIT $3 OFFSET $4`,
    [role ?? null, search || null, limit, (page - 1) * limit],
  );
  const total = rows[0]?.totalCount ?? 0;
  return { items: rows.map(({ totalCount: _totalCount, ...user }) => user), total };
};

// When an agent leaves, their open work goes back to the unassigned queue (with an audit event)
export const releaseActiveTickets = async ({ agentId, actorId }, db) => {
  const { rows } = await db.query(
    `UPDATE tickets SET assignee_id = NULL
     WHERE assignee_id = $1 AND status IN ('open', 'in-progress', 'pending')
     RETURNING id`,
    [agentId],
  );
  for (const { id } of rows) {
    await db.query(
      `INSERT INTO ticket_events (ticket_id, actor_id, type, from_value)
       VALUES ($1, $2, 'unassigned', $3)`,
      [id, actorId, String(agentId)],
    );
  }
  return rows.length;
};
