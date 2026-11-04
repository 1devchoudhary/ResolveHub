import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { checkDatabaseConnection, closePool } from './config/db.js';
import authRouter from './routes/auth.routes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const PORT = process.env.PORT;

const app = express();

// Middleware (must run before the routes so req.body is parsed)
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => res.send("ResolveHub Backend "));
app.use('/api/auth', authRouter);

// Must come after all routes
app.use(notFound);
app.use(errorHandler);

// Only start accepting requests once the database is reachable
try {
  await checkDatabaseConnection();
} catch (err) {
  console.error("❌ Could not connect to PostgreSQL:", err.message);
  process.exit(1);
}

const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Graceful shutdown: stop taking new requests, then release DB connections
const shutdown = (signal) => {
  console.log(`${signal} received, shutting down…`);
  server.close(async () => {
    await closePool();
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
