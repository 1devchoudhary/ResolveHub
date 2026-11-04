import { withTransaction } from '../../config/db.js';
import { hashPassword } from '../auth/auth.service.js';
import { CUSTOMERS, DEMO_PASSWORD, STAFF, TICKETS } from './demo.data.js';

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

const DEFAULT_CATEGORIES = [
  'Billing & payments',
  'Account & login',
  'Technical issue',
  'Feature request',
  'Other',
];

// Small deterministic PRNG: every reset produces exactly the same dataset
const createRandom = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
};

// The demo customer's tickets cover every state a visitor should see, newest first
const DEMO_CUSTOMER_STATUSES = [
  'open',
  'pending',
  'in-progress',
  'resolved',
  'in-progress',
  'closed',
  'resolved',
  'closed',
  'closed',
];

const statusForAge = (ageDays, random) => {
  if (ageDays < 1.5) return ['open', 'open', 'in-progress', 'pending'][Math.floor(random() * 4)];
  if (ageDays < 5)
    return ['in-progress', 'pending', 'resolved', 'resolved'][Math.floor(random() * 4)];
  return random() < 0.15 ? 'in-progress' : random() < 0.55 ? 'resolved' : 'closed';
};

/**
 * Replaces ALL data with a realistic, deterministic demo dataset: staff, customers and ~36
 * tickets spread over the last 30 days with conversations, internal notes and a consistent
 * audit trail. Used by `npm run seed` and by the daily demo reset.
 */
export const seedDemoData = async ({ now = new Date(), ticketCount = 36 } = {}) => {
  const random = createRandom(20_261_104);
  const between = (min, max) => min + random() * (max - min);
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const latest = now.getTime() - 5 * MINUTE;
  const clamp = (time) => new Date(Math.min(time, latest));

  return withTransaction(async (tx) => {
    await tx.query(
      `TRUNCATE ticket_events, ticket_messages, tickets, refresh_tokens, password_reset_tokens,
                rate_limits, users, categories
       RESTART IDENTITY CASCADE`,
    );

    const { rows: categoryRows } = await tx.query(
      `INSERT INTO categories (name) SELECT unnest($1::text[]) RETURNING id, name`,
      [DEFAULT_CATEGORIES],
    );
    const categoryId = Object.fromEntries(categoryRows.map((row) => [row.name, row.id]));

    // Every seeded account is a demo account: visitors can use them but not change them
    const people = [...STAFF, ...CUSTOMERS.map((c) => ({ ...c, role: 'customer' }))];
    const ids = {};
    for (const [index, person] of people.entries()) {
      const { rows } = await tx.query(
        `INSERT INTO users (name, email, mobile, password_hash, role, is_demo, created_at)
         VALUES ($1, $2, $3, $4, $5, true, $6)
         RETURNING id`,
        [
          person.name,
          person.email,
          `+9190000${String(index + 1).padStart(5, '0')}`,
          passwordHash,
          person.role,
          new Date(now.getTime() - 60 * DAY),
        ],
      );
      ids[person.key] = rows[0].id;
    }

    // Priya (the demo agent) carries the biggest queue so her view is the most interesting
    const pickAgent = () => {
      const roll = random();
      return roll < 0.45 ? ids.priya : roll < 0.75 ? ids.marcus : ids.aisha;
    };

    const otherCustomers = CUSTOMERS.slice(1);
    let demoIndex = 0;
    let otherIndex = 0;

    for (let i = 0; i < ticketCount; i++) {
      const forDemoCustomer = i % 4 === 0 && demoIndex < DEMO_CUSTOMER_STATUSES.length;
      // Stepping by 5 (coprime with 12) gives the demo customer nine different subjects
      const template = forDemoCustomer
        ? TICKETS[(demoIndex * 5) % TICKETS.length]
        : TICKETS[i % TICKETS.length];
      const customerId = forDemoCustomer
        ? ids.rohan
        : ids[otherCustomers[otherIndex++ % otherCustomers.length].key];

      // Spread creation times over the last 30 days, the demo customer's newest first
      const ageDays = forDemoCustomer
        ? demoIndex * 3.2 + between(0.1, 1)
        : 29.5 * Math.pow(random(), 1.8) + 0.05; // skewed towards recent days
      let status = forDemoCustomer
        ? DEMO_CUSTOMER_STATUSES[demoIndex++]
        : statusForAge(ageDays, random);

      const createdAt = new Date(now.getTime() - ageDays * DAY);
      const assigneeId = status === 'open' && random() < 0.6 ? null : pickAgent();

      const messages = [];
      const events = [
        { actorId: customerId, type: 'created', at: createdAt },
        ...(assigneeId
          ? [
              {
                actorId: null,
                type: 'assigned',
                to: assigneeId,
                at: new Date(createdAt.getTime() + 2000),
              },
            ]
          : []),
      ];

      let firstResponseAt = null;
      let resolvedAt = null;
      let closedAt = null;
      let lastActivity = createdAt;

      if (status !== 'open') {
        firstResponseAt = clamp(createdAt.getTime() + between(12, 240) * MINUTE);
        messages.push({ authorId: assigneeId, body: template.reply, at: firstResponseAt });
        if (random() < 0.6) {
          messages.push({
            authorId: assigneeId,
            body: template.note,
            internal: true,
            at: clamp(firstResponseAt.getTime() + 4 * MINUTE),
          });
        }
        events.push({
          actorId: assigneeId,
          type: 'status_changed',
          from: 'open',
          to: status === 'pending' ? 'pending' : 'in-progress',
          at: firstResponseAt,
        });
        lastActivity = firstResponseAt;
      }

      if (['in-progress', 'resolved', 'closed'].includes(status)) {
        const followUpAt = clamp(firstResponseAt.getTime() + between(20, 600) * MINUTE);
        messages.push({ authorId: customerId, body: template.followUp, at: followUpAt });
        lastActivity = followUpAt;

        if (status !== 'in-progress') {
          resolvedAt = clamp(followUpAt.getTime() + between(60, 2_400) * MINUTE);
          messages.push({ authorId: assigneeId, body: template.resolution, at: resolvedAt });
          events.push({
            actorId: assigneeId,
            type: 'status_changed',
            from: 'in-progress',
            to: 'resolved',
            at: resolvedAt,
          });
          lastActivity = resolvedAt;
        }

        if (status === 'closed') {
          const closeTime = resolvedAt.getTime() + between(0.5, 2) * DAY;
          if (closeTime < latest) {
            closedAt = new Date(closeTime);
            events.push({
              actorId: customerId,
              type: 'status_changed',
              from: 'resolved',
              to: 'closed',
              at: closedAt,
            });
            lastActivity = closedAt;
          } else {
            status = 'resolved';
          }
        }
      }

      const { rows } = await tx.query(
        `INSERT INTO tickets (customer_id, assignee_id, category_id, subject, description, status,
                              priority, first_response_at, resolved_at, closed_at, created_at,
                              updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id`,
        [
          customerId,
          assigneeId,
          categoryId[template.category],
          template.subject,
          template.description,
          status,
          template.priority,
          firstResponseAt,
          resolvedAt,
          closedAt,
          createdAt,
          lastActivity,
        ],
      );
      const ticketId = rows[0].id;

      for (const message of messages) {
        await tx.query(
          `INSERT INTO ticket_messages (ticket_id, author_id, body, is_internal, created_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [ticketId, message.authorId, message.body, Boolean(message.internal), message.at],
        );
      }
      for (const event of events) {
        await tx.query(
          `INSERT INTO ticket_events (ticket_id, actor_id, type, from_value, to_value, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            ticketId,
            event.actorId,
            event.type,
            event.from ?? null,
            event.to === undefined ? null : String(event.to),
            event.at,
          ],
        );
      }
    }

    return { users: people.length, tickets: ticketCount, categories: DEFAULT_CATEGORIES.length };
  });
};
