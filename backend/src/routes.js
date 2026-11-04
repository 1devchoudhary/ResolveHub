import { Router } from 'express';
import { query } from './config/db.js';
import authRouter from './modules/auth/auth.routes.js';
import usersRouter from './modules/users/users.routes.js';

const router = Router();

// Liveness + database check, used by uptime monitors and after deploys
router.get('/health', async (_req, res) => {
  const startedAt = Date.now();
  await query('SELECT 1');
  res.json({ status: 'ok', database: 'ok', latencyMs: Date.now() - startedAt });
});

router.use('/auth', authRouter);
router.use('/users', usersRouter);

export default router;
