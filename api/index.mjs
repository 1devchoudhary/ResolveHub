// Vercel serverless entry point. Every /api/* request is rewritten here (see /vercel.json),
// so the React app and the Express API share one domain and the refresh cookie is first-party.
// The database pool connects lazily on the first query, so there's no startup check here.
import app from '../backend/src/app.js';

export default app;
