import { timingSafeEqual } from 'node:crypto';
import { Router } from 'express';
import env from '../../config/env.js';
import AppError from '../../utils/AppError.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { pruneRateLimits } from '../../middleware/rateLimit.js';
import { seedDemoData } from './demo.seed.js';

const router = Router();

// Vercel Cron calls this with "Authorization: Bearer <CRON_SECRET>". Constant-time comparison,
// so the secret can't be guessed byte by byte from response timings.
const requireCronSecret = (req, _res, next) => {
  const expected = env.CRON_SECRET ? Buffer.from(`Bearer ${env.CRON_SECRET}`) : null;
  const given = Buffer.from(req.get('authorization') ?? '');

  if (!expected || given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return next(AppError.unauthorized('Invalid cron secret'));
  }
  return next();
};

// Daily: put the public demo back to its original state (see vercel.json "crons")
router.get('/reset-demo', requireCronSecret, async (req, res) => {
  const summary = await seedDemoData();
  await pruneRateLimits();
  req.log.info(summary, 'Demo data reset');
  sendSuccess(res, { message: 'Demo data reset', data: summary });
});

export default router;
