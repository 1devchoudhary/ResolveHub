import { withTransaction } from '../../config/db.js';
import logger from '../../lib/logger.js';
import { sendEmail } from '../../lib/mailer.js';
import * as emails from '../../lib/emailTemplates.js';
import AppError from '../../utils/AppError.js';
import * as tickets from './ticket.repository.js';
import * as categories from '../categories/category.repository.js';
import * as users from '../users/user.repository.js';
import {
  ACTIVE_STATUSES,
  allowedTransitions,
  assertTransition,
  statusAfterReply,
  timestampsForStatus,
} from './ticket.stateMachine.js';

const isStaff = (user) => user.role === 'agent' || user.role === 'admin';

// Customers only ever see their own tickets. Someone else's ticket is a 404, not a 403:
// a 403 would confirm that the ticket number exists.
const assertCanAccess = (user, ticket) => {
  if (!ticket || (!isStaff(user) && ticket.customerId !== user.id)) {
    throw AppError.notFound('Ticket not found');
  }
};

// ---- Notifications (sent after the transaction commits, never blocking the response) ----

const notify = (recipient, template) => {
  if (recipient?.email && recipient.emailNotifications) {
    sendEmail({ to: recipient.email, ...template });
  }
};

const notifyAfterChange = async (ticketId, { actor, created, assignedTo, resolved, reply }) => {
  const ticket = await tickets.findParticipants(ticketId);
  if (!ticket) return;
  const { customer, assignee } = ticket;

  if (created) notify(customer, emails.ticketCreatedEmail({ name: customer.name, ticket }));
  if (assignedTo && assignee && assignee.id !== actor.id) {
    notify(assignee, emails.ticketAssignedEmail({ name: assignee.name, ticket }));
  }
  if (reply && !reply.isInternal) {
    if (isStaff(actor)) {
      notify(
        customer,
        emails.agentReplyEmail({
          name: customer.name,
          ticket,
          agentName: actor.name,
          body: reply.body,
        }),
      );
    } else if (assignee) {
      notify(
        assignee,
        emails.customerReplyEmail({
          name: assignee.name,
          ticket,
          customerName: customer.name,
          body: reply.body,
        }),
      );
    }
  }
  if (resolved) notify(customer, emails.ticketResolvedEmail({ name: customer.name, ticket }));
};

// Fire-and-forget: a notification problem must never fail the request that triggered it
const notifyInBackground = (ticketId, change) => {
  notifyAfterChange(ticketId, change).catch((err) =>
    logger.error({ err, ticketId }, 'Failed to prepare ticket notifications'),
  );
};

// ---- Status / assignment helpers shared by update and reply --------------------------------

const applyStatus = async (tx, { ticket, to, actorId }) => {
  if (!to || to === ticket.status) return {};
  await tickets.insertEvent(
    { ticketId: ticket.id, actorId, type: 'status_changed', from: ticket.status, to },
    tx,
  );
  return { status: to, ...timestampsForStatus(to) };
};

const resolveAssignee = async (assigneeId, tx) => {
  if (assigneeId === null) return null;
  const agent = await users.findById(assigneeId, tx);
  if (!agent || agent.role !== 'agent' || !agent.isActive) {
    throw AppError.badRequest('Validation failed', {
      assigneeId: 'Choose an active agent',
    });
  }
  return agent;
};

const applyAssignment = async (tx, { ticket, assigneeId, actorId }) => {
  if (assigneeId === undefined || assigneeId === ticket.assigneeId) return {};
  await resolveAssignee(assigneeId, tx);
  await tickets.insertEvent(
    {
      ticketId: ticket.id,
      actorId,
      type: assigneeId === null ? 'unassigned' : 'assigned',
      from: ticket.assigneeId,
      to: assigneeId,
    },
    tx,
  );
  return { assigneeId };
};

// ---- Queries --------------------------------------------------------------------------------

const STATUS_GROUPS = { active: ACTIVE_STATUSES, done: ['resolved', 'closed'] };

// "RH-1042" or "1042" searches by number; anything else is full-text
const parseSearch = (q) => {
  if (!q) return null;
  const number = q.match(/^(?:RH-)?(\d{1,9})$/i);
  return number ? { ticketId: Number(number[1]) } : { text: q };
};

export const listTickets = async (user, filters) => {
  const { items, total } = await tickets.listTickets({
    customerId: isStaff(user) ? undefined : user.id,
    statuses: filters.status ? (STATUS_GROUPS[filters.status] ?? [filters.status]) : undefined,
    priority: filters.priority,
    assigneeId: isStaff(user)
      ? filters.assignee === 'me'
        ? user.id
        : typeof filters.assignee === 'number'
          ? filters.assignee
          : undefined
      : undefined,
    unassigned: isStaff(user) && filters.assignee === 'unassigned',
    categoryId: filters.categoryId,
    search: parseSearch(filters.q),
    sort: filters.sort,
    page: filters.page,
    limit: filters.limit,
  });
  return { items, page: filters.page, limit: filters.limit, total };
};

export const getTicket = async (user, ticketId) => {
  const ticket = await tickets.findById(ticketId);
  assertCanAccess(user, ticket);

  const [messages, events] = await Promise.all([
    tickets.listMessages(ticketId, { includeInternal: isStaff(user) }),
    tickets.listEvents(ticketId),
  ]);

  // Tell the UI which status buttons to show for this viewer
  return { ...ticket, messages, events, allowedStatuses: allowedTransitions(ticket, user.role) };
};

export const getStats = async (user) => {
  const [counts, byStatus, medianFirstResponseMinutes] = await Promise.all([
    isStaff(user) ? tickets.statsForStaff(user.id) : tickets.statsForCustomer(user.id),
    tickets.countByStatus({ customerId: isStaff(user) ? undefined : user.id }),
    tickets.medianFirstResponseMinutes(),
  ]);
  return { ...counts, byStatus, medianFirstResponseMinutes };
};

export const getRecentActivity = (user, { limit }) =>
  tickets.listRecentEvents({ customerId: isStaff(user) ? undefined : user.id, limit });

// ---- Commands -------------------------------------------------------------------------------

/**
 * Creates a ticket and auto-assigns it to the least-loaded agent, atomically: the insert,
 * the "created" event, the assignment and its event all commit together or not at all.
 */
export const createTicket = async (customer, input) => {
  const category = await categories.findById(input.categoryId);
  if (!category || !category.isActive) {
    throw AppError.badRequest('Validation failed', { categoryId: 'Choose a category' });
  }

  const { ticketId, agent } = await withTransaction(async (tx) => {
    const id = await tickets.insertTicket({ ...input, customerId: customer.id }, tx);
    await tickets.insertEvent({ ticketId: id, actorId: customer.id, type: 'created' }, tx);

    const picked = await tickets.pickLeastLoadedAgent(tx);
    if (picked) {
      await tickets.updateTicket(id, { assigneeId: picked.id }, tx);
      // actorId null = done by the system
      await tickets.insertEvent({ ticketId: id, type: 'assigned', to: picked.id }, tx);
    }
    return { ticketId: id, agent: picked };
  });

  // actor null: the system assigned it, so the agent is notified too
  notifyInBackground(ticketId, { actor: { id: null }, created: true, assignedTo: agent?.id });
  // Same shape as every other ticket mutation (with messages, events and allowed statuses)
  return getTicket(customer, ticketId);
};

export const addReply = async (user, ticketId, { body, isInternal, status }) => {
  if (!isStaff(user) && (isInternal || status)) {
    throw AppError.forbidden('Only support staff can add internal notes or set the status');
  }

  const outcome = await withTransaction(async (tx) => {
    const ticket = await tickets.lockById(ticketId, tx);
    assertCanAccess(user, ticket);

    if (ticket.status === 'closed') {
      throw AppError.conflict('This ticket is closed. Please open a new ticket.');
    }

    await tickets.insertMessage({ ticketId, authorId: user.id, body, isInternal }, tx);

    const changes = {};
    let assignedTo = null;

    if (isStaff(user) && !isInternal) {
      // The first public staff reply is what "first response time" measures
      if (!ticket.firstResponseAt) changes.firstResponseAt = new Date();
      // An agent answering an unassigned ticket takes ownership of it
      if (!ticket.assigneeId && user.role === 'agent') {
        Object.assign(
          changes,
          await applyAssignment(tx, { ticket, assigneeId: user.id, actorId: user.id }),
        );
        assignedTo = user.id;
      }
    }

    // An explicit status wins; otherwise the lifecycle rules decide (e.g. pending -> in-progress)
    const nextStatus = status ?? (isInternal ? null : statusAfterReply(ticket, user.role));
    if (status) assertTransition(ticket, status, user.role);
    Object.assign(changes, await applyStatus(tx, { ticket, to: nextStatus, actorId: user.id }));

    await tickets.updateTicket(ticketId, changes, tx);
    return { assignedTo, resolved: changes.status === 'resolved' };
  });

  notifyInBackground(ticketId, { actor: user, ...outcome, reply: { body, isInternal } });
  return getTicket(user, ticketId);
};

export const updateTicket = async (user, ticketId, input) => {
  if (!isStaff(user) && (input.priority !== undefined || input.assigneeId !== undefined)) {
    throw AppError.forbidden('Only support staff can change priority or assignment');
  }

  const outcome = await withTransaction(async (tx) => {
    const ticket = await tickets.lockById(ticketId, tx);
    assertCanAccess(user, ticket);

    const changes = {};

    if (input.status) {
      assertTransition(ticket, input.status, user.role);
      Object.assign(changes, await applyStatus(tx, { ticket, to: input.status, actorId: user.id }));
    }

    if (input.priority && input.priority !== ticket.priority) {
      await tickets.insertEvent(
        {
          ticketId,
          actorId: user.id,
          type: 'priority_changed',
          from: ticket.priority,
          to: input.priority,
        },
        tx,
      );
      changes.priority = input.priority;
    }

    Object.assign(
      changes,
      await applyAssignment(tx, { ticket, assigneeId: input.assigneeId, actorId: user.id }),
    );

    await tickets.updateTicket(ticketId, changes, tx);
    return { assignedTo: changes.assigneeId ?? null, resolved: changes.status === 'resolved' };
  });

  notifyInBackground(ticketId, { actor: user, ...outcome });
  return getTicket(user, ticketId);
};
