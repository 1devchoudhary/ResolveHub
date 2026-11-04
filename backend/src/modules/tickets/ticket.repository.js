import pool from '../../config/db.js';

// All ticket SQL. Functions take an optional `db` (a transaction client or the pool).

// The ticket as the API returns it: related records nested as JSON objects
const TICKET_COLUMNS = `
    t.id,
    'RH-' || t.id AS number,
    t.subject,
    t.description,
    t.status,
    t.priority,
    t.customer_id AS "customerId",
    t.assignee_id AS "assigneeId",
    t.first_response_at AS "firstResponseAt",
    t.resolved_at AS "resolvedAt",
    t.closed_at AS "closedAt",
    t.created_at AS "createdAt",
    t.updated_at AS "updatedAt",
    json_build_object('id', c.id, 'name', c.name) AS category,
    json_build_object('id', cu.id, 'name', cu.name, 'email', cu.email, 'mobile', cu.mobile)
      AS customer,
    CASE WHEN a.id IS NULL THEN NULL
         ELSE json_build_object('id', a.id, 'name', a.name) END AS assignee`;

const TICKET_FROM = `
  FROM tickets t
  JOIN categories c ON c.id = t.category_id
  JOIN users cu ON cu.id = t.customer_id
  LEFT JOIN users a ON a.id = t.assignee_id`;

export const findById = async (id, db = pool) => {
  const { rows } = await db.query(`SELECT ${TICKET_COLUMNS} ${TICKET_FROM} WHERE t.id = $1`, [id]);
  return rows[0] ?? null;
};

// Row lock for read-modify-write flows (reply, status change): concurrent updates to the
// same ticket queue up instead of overwriting each other
export const lockById = async (id, db) => {
  const { rows } = await db.query(
    `SELECT id, status, priority,
            customer_id AS "customerId",
            assignee_id AS "assigneeId",
            first_response_at AS "firstResponseAt",
            resolved_at AS "resolvedAt"
     FROM tickets WHERE id = $1 FOR UPDATE`,
    [id],
  );
  return rows[0] ?? null;
};

export const insertTicket = async (
  { customerId, categoryId, subject, description, priority },
  db = pool,
) => {
  const { rows } = await db.query(
    `INSERT INTO tickets (customer_id, category_id, subject, description, priority)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [customerId, categoryId, subject, description, priority],
  );
  return rows[0].id;
};

// Partial update through an allow-list of columns (names never come from user input)
const UPDATABLE = {
  status: 'status',
  priority: 'priority',
  assigneeId: 'assignee_id',
  firstResponseAt: 'first_response_at',
  resolvedAt: 'resolved_at',
  closedAt: 'closed_at',
};

export const updateTicket = async (id, changes, db = pool) => {
  const entries = Object.entries(changes).filter(
    ([key, value]) => UPDATABLE[key] && value !== undefined,
  );
  // Even with nothing to change, touch the row so updated_at reflects new activity
  const assignments = entries.map(([key], index) => `${UPDATABLE[key]} = $${index + 2}`);
  await db.query(
    `UPDATE tickets SET ${assignments.length ? assignments.join(', ') : 'updated_at = now()'}
     WHERE id = $1`,
    [id, ...entries.map(([, value]) => value)],
  );
};

/**
 * Least-loaded active agent, for auto-assignment. Must run inside a transaction.
 * FOR UPDATE OF u SKIP LOCKED: if another ticket is being assigned to an agent right now,
 * that agent's row is locked and skipped, so two simultaneous tickets spread across agents
 * instead of both piling onto the same "least loaded" one.
 */
export const pickLeastLoadedAgent = async (db) => {
  const { rows } = await db.query(
    `SELECT u.id, u.name, u.email, u.email_notifications AS "emailNotifications"
     FROM users u
     CROSS JOIN LATERAL (
       SELECT count(*) AS load
       FROM tickets t
       WHERE t.assignee_id = u.id AND t.status IN ('open', 'in-progress', 'pending')
     ) workload
     WHERE u.role = 'agent' AND u.is_active
     ORDER BY workload.load, u.id
     LIMIT 1
     FOR UPDATE OF u SKIP LOCKED`,
  );
  return rows[0] ?? null;
};

export const insertEvent = (
  { ticketId, actorId = null, type, from = null, to = null },
  db = pool,
) =>
  db.query(
    `INSERT INTO ticket_events (ticket_id, actor_id, type, from_value, to_value)
     VALUES ($1, $2, $3, $4, $5)`,
    [ticketId, actorId, type, from === null ? null : String(from), to === null ? null : String(to)],
  );

export const insertMessage = async ({ ticketId, authorId, body, isInternal }, db = pool) => {
  const { rows } = await db.query(
    `INSERT INTO ticket_messages (ticket_id, author_id, body, is_internal)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [ticketId, authorId, body, isInternal],
  );
  return rows[0].id;
};

export const listMessages = async (ticketId, { includeInternal }, db = pool) => {
  const { rows } = await db.query(
    `SELECT m.id, m.body, m.is_internal AS "isInternal", m.created_at AS "createdAt",
            json_build_object('id', u.id, 'name', u.name, 'role', u.role) AS author
     FROM ticket_messages m
     JOIN users u ON u.id = m.author_id
     WHERE m.ticket_id = $1 AND ($2 OR NOT m.is_internal)
     ORDER BY m.created_at, m.id`,
    [ticketId, includeInternal],
  );
  return rows;
};

// Assignment events store user ids; resolve them to names for display
export const listEvents = async (ticketId, db = pool) => {
  const { rows } = await db.query(
    `SELECT e.id, e.type, e.created_at AS "createdAt",
            CASE WHEN e.type IN ('assigned', 'unassigned') THEN fu.name ELSE e.from_value END AS "from",
            CASE WHEN e.type IN ('assigned', 'unassigned') THEN tu.name ELSE e.to_value END AS "to",
            CASE WHEN actor.id IS NULL THEN NULL
                 ELSE json_build_object('id', actor.id, 'name', actor.name, 'role', actor.role)
            END AS actor
     FROM ticket_events e
     LEFT JOIN users actor ON actor.id = e.actor_id
     LEFT JOIN users fu ON e.type IN ('assigned', 'unassigned') AND fu.id::text = e.from_value
     LEFT JOIN users tu ON e.type IN ('assigned', 'unassigned') AND tu.id::text = e.to_value
     WHERE e.ticket_id = $1
     ORDER BY e.created_at, e.id`,
    [ticketId],
  );
  return rows;
};

const SORTS = {
  updated: 't.updated_at DESC, t.id DESC',
  newest: 't.created_at DESC, t.id DESC',
  oldest: 't.created_at ASC, t.id ASC',
  // Most urgent first, then the ones that have waited longest
  priority: `array_position(ARRAY['urgent','high','medium','low'], t.priority), t.created_at ASC`,
};

/**
 * Filtered, sorted, paginated list. Every filter is optional and parameterised; the WHERE
 * clause is assembled from fixed fragments only. COUNT(*) OVER() returns the total match
 * count in the same query, so pagination needs one round trip, not two.
 */
export const listTickets = async (
  { customerId, statuses, priority, assigneeId, unassigned, categoryId, search, sort, page, limit },
  db = pool,
) => {
  const where = [];
  const params = [];
  const add = (fragment, value) => {
    params.push(value);
    where.push(fragment.replace('?', `$${params.length}`));
  };

  if (customerId) add('t.customer_id = ?', customerId);
  if (statuses?.length) add('t.status = ANY(?)', statuses);
  if (priority) add('t.priority = ?', priority);
  if (assigneeId) add('t.assignee_id = ?', assigneeId);
  if (unassigned) where.push('t.assignee_id IS NULL');
  if (categoryId) add('t.category_id = ?', categoryId);
  if (search?.ticketId) {
    add('t.id = ?', search.ticketId);
  } else if (search?.text) {
    // websearch_to_tsquery understands "quoted phrases", OR and -exclusions, and never throws
    add(`t.search_vector @@ websearch_to_tsquery('english', ?)`, search.text);
  }

  params.push(limit, (page - 1) * limit);
  const limitParam = `$${params.length - 1}`;
  const offsetParam = `$${params.length}`;
  const { rows } = await db.query(
    `SELECT ${TICKET_COLUMNS},
            replies.n AS "replyCount",
            count(*) OVER () AS "totalCount"
     ${TICKET_FROM}
     CROSS JOIN LATERAL (
       SELECT count(*) AS n FROM ticket_messages m
       WHERE m.ticket_id = t.id AND NOT m.is_internal
     ) replies
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY ${SORTS[sort] ?? SORTS.updated}
     LIMIT ${limitParam} OFFSET ${offsetParam}`,
    params,
  );

  const total = rows[0]?.totalCount ?? 0;
  return { items: rows.map(({ totalCount: _totalCount, ...ticket }) => ticket), total };
};

export const statsForCustomer = async (customerId, db = pool) => {
  const { rows } = await db.query(
    `SELECT
       count(*) AS total,
       count(*) FILTER (WHERE status IN ('open', 'in-progress', 'pending')) AS active,
       count(*) FILTER (WHERE status = 'pending') AS "awaitingCustomer",
       count(*) FILTER (WHERE status IN ('resolved', 'closed')) AS resolved
     FROM tickets WHERE customer_id = $1`,
    [customerId],
  );
  return rows[0];
};

export const statsForStaff = async (agentId, db = pool) => {
  const { rows } = await db.query(
    `SELECT
       count(*) FILTER (WHERE status IN ('open', 'in-progress', 'pending')) AS active,
       count(*) FILTER (WHERE status IN ('open', 'in-progress', 'pending') AND assignee_id IS NULL)
         AS unassigned,
       count(*) FILTER (WHERE status IN ('open', 'in-progress', 'pending') AND assignee_id = $1)
         AS mine,
       count(*) FILTER (WHERE status IN ('open', 'in-progress', 'pending') AND priority = 'urgent')
         AS urgent,
       count(*) FILTER (WHERE status = 'pending') AS "awaitingCustomer",
       count(*) FILTER (WHERE resolved_at > now() - interval '7 days') AS "resolvedThisWeek"
     FROM tickets`,
    [agentId],
  );
  return rows[0];
};

// Median minutes from ticket creation to the first agent reply, over the last 30 days.
// Median rather than average: one ticket that waited all weekend shouldn't skew it.
export const medianFirstResponseMinutes = async (db = pool) => {
  const { rows } = await db.query(
    `SELECT round(percentile_cont(0.5) WITHIN GROUP (
              ORDER BY extract(epoch FROM first_response_at - created_at) / 60))::int AS minutes
     FROM tickets
     WHERE first_response_at IS NOT NULL AND created_at > now() - interval '30 days'`,
  );
  return rows[0].minutes;
};

// Who to notify about a ticket, and whether they want emails
export const findParticipants = async (ticketId, db = pool) => {
  const { rows } = await db.query(
    `SELECT 'RH-' || t.id AS number, t.subject, t.priority,
            json_build_object('id', cu.id, 'name', cu.name, 'email', cu.email,
                              'emailNotifications', cu.email_notifications) AS customer,
            CASE WHEN a.id IS NULL THEN NULL
                 ELSE json_build_object('id', a.id, 'name', a.name, 'email', a.email,
                                        'emailNotifications', a.email_notifications) END AS assignee
     FROM tickets t
     JOIN users cu ON cu.id = t.customer_id
     LEFT JOIN users a ON a.id = t.assignee_id
     WHERE t.id = $1`,
    [ticketId],
  );
  return rows[0] ?? null;
};
