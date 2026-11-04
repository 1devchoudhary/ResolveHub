import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import env from './config/env.js';
import { requestLogger } from './middleware/requestLogger.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import apiRouter from './routes.js';

const app = express();

// Behind Vercel's proxy: trust its X-Forwarded-* headers so req.ip and secure cookies work
app.set('trust proxy', 1);

// Order matters: logging first (so every request gets an id), then security headers,
// CORS and body parsing, then the routes, then the 404 and error handlers.
app.use(requestLogger);
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.use('/api', apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
