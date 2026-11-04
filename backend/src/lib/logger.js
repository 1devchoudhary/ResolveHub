import pino from 'pino';

// Read directly (not via config/env.js) so the logger can be used while env is being validated
const nodeEnv = process.env.NODE_ENV ?? 'development';
const level = process.env.LOG_LEVEL ?? (nodeEnv === 'test' ? 'silent' : 'info');

const logger = pino({
  level,
  // Never write credentials to the logs, even by accident
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      '*.password',
      '*.passwordHash',
      '*.token',
      '*.refreshToken',
    ],
    censor: '[redacted]',
  },
  // Human-readable logs locally; structured JSON in production (what Vercel's log viewer wants)
  transport:
    nodeEnv === 'development' ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
});

export default logger;
