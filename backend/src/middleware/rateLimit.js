import { query } from '../config/db.js';
import AppError from '../utils/AppError.js';

/**
 * Fixed-window rate limiter backed by Postgres, so the limit is shared by every serverless
 * instance (an in-memory counter would reset on each cold start and differ per instance).
 *
 *   router.post('/login', rateLimit({ name: 'login', max: 10, windowSeconds: 900 }), login);
 *
 * One atomic UPSERT per request: it either starts a new window or increments the current one.
 */
export const rateLimit = ({ name, max, windowSeconds, key = (req) => req.ip }) => {
  return async (req, res, next) => {
    const bucket = `${name}:${key(req)}`;

    let row;
    try {
      const { rows } = await query(
        `INSERT INTO rate_limits AS rl (key, count, window_start)
         VALUES ($1, 1, now())
         ON CONFLICT (key) DO UPDATE SET
           count = CASE
             WHEN rl.window_start <= now() - make_interval(secs => $2) THEN 1
             ELSE rl.count + 1
           END,
           window_start = CASE
             WHEN rl.window_start <= now() - make_interval(secs => $2) THEN now()
             ELSE rl.window_start
           END
         RETURNING count,
           GREATEST(0, CEIL(EXTRACT(EPOCH FROM (window_start + make_interval(secs => $2) - now()))))::int
             AS "resetSeconds"`,
        [bucket, windowSeconds],
      );
      row = rows[0];
    } catch (err) {
      // Fail open: a rate-limiter outage shouldn't take login down with it
      req.log?.error({ err }, 'Rate limiter unavailable');
      return next();
    }

    const remaining = Math.max(0, max - row.count);
    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', row.resetSeconds);

    if (row.count > max) {
      res.setHeader('Retry-After', row.resetSeconds);
      return next(new AppError(429, 'Too many attempts. Please try again later.'));
    }

    return next();
  };
};

// Housekeeping: drop counters whose window ended long ago (called by the daily cron)
export const pruneRateLimits = () =>
  query(`DELETE FROM rate_limits WHERE window_start < now() - interval '1 day'`);
