import { z } from 'zod';
import { pagination } from '../../utils/schemas.js';
import { PRIORITIES, STATUSES } from './ticket.stateMachine.js';

// "RH-1042" or "1042" -> 1042
export const ticketParamsSchema = z.object({
  number: z
    .string()
    .trim()
    .regex(/^(RH-)?\d{1,9}$/i, 'Invalid ticket number')
    .transform((value) => Number(value.replace(/^RH-/i, ''))),
});

export const listTicketsSchema = z.object({
  // "active" = open/in-progress/pending, "done" = resolved/closed
  status: z.enum([...STATUSES, 'active', 'done']).optional(),
  priority: z.enum(PRIORITIES).optional(),
  assignee: z.union([z.enum(['me', 'unassigned']), z.coerce.number().int().positive()]).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  q: z.string().trim().max(100).optional(),
  sort: z.enum(['updated', 'newest', 'oldest', 'priority']).default('updated'),
  ...pagination,
});

export const activitySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const createTicketSchema = z.object({
  subject: z
    .string({ error: 'Subject is required' })
    .trim()
    .min(3, 'Subject must be at least 3 characters')
    .max(150, 'Subject must be at most 150 characters'),
  description: z
    .string({ error: 'Description is required' })
    .trim()
    .min(10, 'Please describe the problem in at least 10 characters')
    .max(5000, 'Description must be at most 5000 characters'),
  categoryId: z.coerce.number({ error: 'Choose a category' }).int().positive('Choose a category'),
  priority: z.enum(PRIORITIES, { error: 'Choose a priority' }).default('medium'),
});

export const replySchema = z.object({
  body: z
    .string({ error: 'Message is required' })
    .trim()
    .min(1, 'Message is required')
    .max(5000, 'Message must be at most 5000 characters'),
  // Staff only: a note the customer never sees
  isInternal: z.boolean().default(false),
  // Staff only: change the status in the same action ("Reply & mark pending")
  status: z.enum(STATUSES).optional(),
});

export const updateTicketSchema = z
  .object({
    status: z.enum(STATUSES).optional(),
    priority: z.enum(PRIORITIES).optional(),
    // null unassigns
    assigneeId: z.number().int().positive().nullable().optional(),
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    error: 'Nothing to update',
    path: ['body'],
  });
