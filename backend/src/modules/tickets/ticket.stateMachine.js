import AppError from '../../utils/AppError.js';

// Pure functions, no database: the ticket lifecycle rules in one place, easy to unit-test.
//
//   open ──► in-progress ──► resolved ──► closed
//     │           ▲  │           │
//     └──► pending ◄─┘           └──► reopened (customer, within 7 days)
//
// pending = the agent is waiting on the customer.

export const STATUSES = ['open', 'in-progress', 'pending', 'resolved', 'closed'];
export const ACTIVE_STATUSES = ['open', 'in-progress', 'pending'];
export const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export const REOPEN_WINDOW_DAYS = 7;

const STAFF_TRANSITIONS = {
  open: ['in-progress', 'pending', 'resolved', 'closed'],
  'in-progress': ['open', 'pending', 'resolved', 'closed'],
  pending: ['open', 'in-progress', 'resolved', 'closed'],
  resolved: ['in-progress', 'closed'],
  closed: [],
};

// Customers can give up on a ticket, or accept/reject a resolution
const CUSTOMER_TRANSITIONS = {
  open: ['closed'],
  'in-progress': ['closed'],
  pending: ['closed'],
  resolved: ['open', 'closed'],
  closed: [],
};

const isStaff = (role) => role === 'agent' || role === 'admin';

export const isWithinReopenWindow = (resolvedAt, now = new Date()) =>
  Boolean(resolvedAt) &&
  now.getTime() - new Date(resolvedAt).getTime() <= REOPEN_WINDOW_DAYS * 86_400_000;

export const allowedTransitions = (ticket, role, now = new Date()) => {
  if (isStaff(role)) {
    // Only admins can bring a closed ticket back
    if (ticket.status === 'closed') return role === 'admin' ? ['open'] : [];
    return STAFF_TRANSITIONS[ticket.status];
  }
  const options = CUSTOMER_TRANSITIONS[ticket.status] ?? [];
  if (ticket.status === 'resolved' && !isWithinReopenWindow(ticket.resolvedAt, now)) {
    return options.filter((status) => status !== 'open');
  }
  return options;
};

export const assertTransition = (ticket, to, role, now = new Date()) => {
  if (ticket.status === to) return;
  if (!allowedTransitions(ticket, role, now).includes(to)) {
    throw AppError.conflict(`A ${ticket.status} ticket can't be moved to ${to}`);
  }
};

// Timestamp columns that change along with the status
export const timestampsForStatus = (to, now = new Date()) => ({
  resolvedAt: to === 'resolved' ? now : to === 'closed' ? undefined : null,
  closedAt: to === 'closed' ? now : null,
});

// The status a ticket should move to when someone replies, or null to leave it alone
export const statusAfterReply = (ticket, role, now = new Date()) => {
  const workingStatus = ticket.assigneeId ? 'in-progress' : 'open';

  if (isStaff(role)) {
    // An agent picking up a fresh ticket starts working on it
    return ticket.status === 'open' ? 'in-progress' : null;
  }

  // The customer answered the agent's question: back to the agent
  if (ticket.status === 'pending') return workingStatus;

  // Replying to a resolved ticket reopens it (if still within the window)
  if (ticket.status === 'resolved') {
    if (!isWithinReopenWindow(ticket.resolvedAt, now)) {
      throw AppError.conflict(
        `This ticket was resolved more than ${REOPEN_WINDOW_DAYS} days ago. Please open a new ticket.`,
      );
    }
    return workingStatus;
  }

  return null;
};
