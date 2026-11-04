import 'dotenv/config';
import { z } from 'zod';

// Comma-separated list -> array of trimmed, non-empty strings
const csv = z.string().transform((value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
);

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).optional(),

  // Database: pooled URL at runtime; tests always use their own database
  DATABASE_URL_POOLED: z.string().min(1).optional(),
  DATABASE_URL_TEST: z.string().min(1).optional(),
  DB_POOL_MAX: z.coerce.number().int().positive().default(10),

  // Auth
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),

  // Browser origins allowed to call the API directly (the Vercel rewrite makes it same-origin)
  CORS_ORIGINS: csv.default(['http://localhost:5173']),
  // Public URL of the frontend, used for links in emails
  APP_URL: z.url().default('http://localhost:5173'),

  // Email: without an API key, emails are logged instead of sent
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('ResolveHub <onboarding@resend.dev>'),

  // Shared secret for the scheduled demo-data reset
  CRON_SECRET: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

// Fail fast with a readable list instead of crashing later on an undefined value
if (!parsed.success) {
  const problems = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid environment configuration:\n${problems}`);
}

const env = parsed.data;

const databaseUrl = env.NODE_ENV === 'test' ? env.DATABASE_URL_TEST : env.DATABASE_URL_POOLED;
if (!databaseUrl) {
  throw new Error(
    env.NODE_ENV === 'test'
      ? 'DATABASE_URL_TEST is not set. Tests never run against the main database.'
      : 'DATABASE_URL_POOLED is not set. Add it to backend/.env',
  );
}

export default Object.freeze({
  ...env,
  DATABASE_URL: databaseUrl,
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
});
