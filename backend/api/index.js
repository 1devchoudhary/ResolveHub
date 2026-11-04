// Vercel serverless entry point: every /api/* request is routed here (see vercel.json).
// The database pool connects lazily on the first query, so there is no startup check.
import app from '../src/app.js';

export default app;
