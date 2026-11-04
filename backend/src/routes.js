import { Router } from 'express';
import { query } from './config/db.js';
import authRouter from './modules/auth/auth.routes.js';
import usersRouter from './modules/users/users.routes.js';
import agentsRouter from './modules/users/agents.routes.js';
import ticketsRouter from './modules/tickets/ticket.routes.js';
import categoriesRouter from './modules/categories/categories.routes.js';

const router = Router();

// Liveness + database check, used by uptime monitors and after deploys
router.get('/health', async (_req, res) => {
  const startedAt = Date.now();
  await query('SELECT 1');
  res.json({ status: 'ok', database: 'ok', latencyMs: Date.now() - startedAt });
});

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/agents', agentsRouter);
router.use('/tickets', ticketsRouter);
router.use('/categories', categoriesRouter);

export default router;
