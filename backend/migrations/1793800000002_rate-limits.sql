-- Up Migration

-- Fixed-window rate-limit counters, shared by every serverless instance.
-- UNLOGGED skips the write-ahead log: much cheaper writes, and losing the counters on a crash
-- is harmless (the worst case is that a window starts over).
CREATE UNLOGGED TABLE rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  window_start TIMESTAMPTZ NOT NULL
);

-- Down Migration

DROP TABLE rate_limits;
