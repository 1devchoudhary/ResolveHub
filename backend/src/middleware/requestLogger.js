import { randomUUID } from 'node:crypto';
import pinoHttp from 'pino-http';
import logger from '../lib/logger.js';

// Accept an incoming id (from a proxy) only if it looks sane, otherwise generate one
const isSafeId = (value) => typeof value === 'string' && /^[\w-]{1,100}$/.test(value);

// One log line per request with method, url, status and duration. Every log written through
// req.log during that request carries the same id, and the id is returned in X-Request-Id
// so a user-reported error can be matched to the server logs.
export const requestLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const incoming = req.headers['x-request-id'];
    const id = isSafeId(incoming) ? incoming : randomUUID();
    res.setHeader('X-Request-Id', id);
    return id;
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  // Keep request logs short: the full headers are noise (and are redacted anyway)
  serializers: {
    req: (req) => ({ id: req.id, method: req.method, url: req.url }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
  // Health checks would drown out real traffic
  autoLogging: { ignore: (req) => req.url === '/api/health' },
});
