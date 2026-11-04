import { describe, expect, it } from 'vitest';
import {
  allowedTransitions,
  assertTransition,
  statusAfterReply,
  timestampsForStatus,
} from '../src/modules/tickets/ticket.stateMachine.js';

const daysAgo = (days) => new Date(Date.now() - days * 86_400_000);

describe('ticket state machine', () => {
  it('lets staff move an open ticket anywhere except back to open', () => {
    expect(allowedTransitions({ status: 'open' }, 'agent')).toEqual([
      'in-progress',
      'pending',
      'resolved',
      'closed',
    ]);
  });

  it('treats closed as final, except for admins', () => {
    expect(allowedTransitions({ status: 'closed' }, 'agent')).toEqual([]);
    expect(allowedTransitions({ status: 'closed' }, 'customer')).toEqual([]);
    expect(allowedTransitions({ status: 'closed' }, 'admin')).toEqual(['open']);
  });

  it('only lets customers close, or reopen a recent resolution', () => {
    expect(allowedTransitions({ status: 'in-progress' }, 'customer')).toEqual(['closed']);
    expect(allowedTransitions({ status: 'resolved', resolvedAt: daysAgo(2) }, 'customer')).toEqual([
      'open',
      'closed',
    ]);
    expect(allowedTransitions({ status: 'resolved', resolvedAt: daysAgo(8) }, 'customer')).toEqual([
      'closed',
    ]);
  });

  it('rejects illegal transitions with a 409', () => {
    expect(() => assertTransition({ status: 'open' }, 'resolved', 'customer')).toThrow(
      expect.objectContaining({ statusCode: 409 }),
    );
    expect(() => assertTransition({ status: 'open' }, 'open', 'customer')).not.toThrow();
  });

  it('starts work when an agent replies to an open ticket', () => {
    expect(statusAfterReply({ status: 'open' }, 'agent')).toBe('in-progress');
    expect(statusAfterReply({ status: 'pending' }, 'agent')).toBeNull();
  });

  it('hands a pending ticket back to the agent when the customer replies', () => {
    expect(statusAfterReply({ status: 'pending', assigneeId: 7 }, 'customer')).toBe('in-progress');
    expect(statusAfterReply({ status: 'pending', assigneeId: null }, 'customer')).toBe('open');
  });

  it('reopens a resolved ticket on a customer reply, but only within 7 days', () => {
    expect(
      statusAfterReply({ status: 'resolved', resolvedAt: daysAgo(1), assigneeId: 3 }, 'customer'),
    ).toBe('in-progress');
    expect(() =>
      statusAfterReply({ status: 'resolved', resolvedAt: daysAgo(9) }, 'customer'),
    ).toThrow(expect.objectContaining({ statusCode: 409 }));
  });

  it('sets and clears the lifecycle timestamps', () => {
    const now = new Date();
    expect(timestampsForStatus('resolved', now)).toEqual({ resolvedAt: now, closedAt: null });
    // Closing keeps the original resolution time
    expect(timestampsForStatus('closed', now)).toEqual({ resolvedAt: undefined, closedAt: now });
    expect(timestampsForStatus('in-progress', now)).toEqual({ resolvedAt: null, closedAt: null });
  });
});
