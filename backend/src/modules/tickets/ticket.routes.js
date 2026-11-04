import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { rateLimit } from '../../middleware/rateLimit.js';
import {
  activitySchema,
  createTicketSchema,
  listTicketsSchema,
  replySchema,
  ticketParamsSchema,
  updateTicketSchema,
} from './ticket.schema.js';
import * as tickets from './ticket.controller.js';

const router = Router();

// Every ticket route needs a signed-in user; per-ticket access is checked in the service
router.use(authenticate);

// Stops a script from flooding the queue (per user, not per IP)
const createLimit = rateLimit({
  name: 'ticket-create',
  max: 20,
  windowSeconds: 60 * 60,
  key: (req) => `user:${req.user.id}`,
});

router.get('/', validate({ query: listTicketsSchema }), tickets.list);
router.get('/stats', tickets.stats);
router.get('/activity', validate({ query: activitySchema }), tickets.activity);
router.post(
  '/',
  authorize('customer'),
  createLimit,
  validate({ body: createTicketSchema }),
  tickets.create,
);
router.get('/:number', validate({ params: ticketParamsSchema }), tickets.get);
router.post(
  '/:number/messages',
  validate({ params: ticketParamsSchema, body: replySchema }),
  tickets.reply,
);
router.patch(
  '/:number',
  validate({ params: ticketParamsSchema, body: updateTicketSchema }),
  tickets.update,
);

export default router;
