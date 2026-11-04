-- Up Migration

CREATE TABLE tickets (
  -- Shown to people as "RH-<id>"; starting at 1001 keeps references a consistent length
  id INTEGER GENERATED ALWAYS AS IDENTITY (START WITH 1001) PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  assignee_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  category_id INTEGER NOT NULL REFERENCES categories (id) ON DELETE RESTRICT,
  subject TEXT NOT NULL CHECK (length(subject) BETWEEN 3 AND 150),
  description TEXT NOT NULL CHECK (length(description) BETWEEN 10 AND 5000),
  -- pending = waiting on the customer
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in-progress', 'pending', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  -- Stored (not computed from messages) so reporting stays a cheap single-table scan
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Full-text search document, maintained by Postgres on every insert/update.
  -- Subject matches rank above description matches (weight A vs B).
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', subject), 'A') ||
    setweight(to_tsvector('english', description), 'B')
  ) STORED
);

CREATE TRIGGER tickets_set_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- One index per main access path
CREATE INDEX tickets_search_idx ON tickets USING GIN (search_vector);
CREATE INDEX tickets_customer_idx ON tickets (customer_id, updated_at DESC);  -- "my tickets"
CREATE INDEX tickets_assignee_idx ON tickets (assignee_id, status);           -- agent queue, load
CREATE INDEX tickets_status_idx ON tickets (status, priority, created_at DESC); -- triage views
CREATE INDEX tickets_category_idx ON tickets (category_id);

-- Conversation on a ticket. Internal notes are visible to staff only.
CREATE TABLE ticket_messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
  author_id INTEGER NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 5000),
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ticket_messages_ticket_idx ON ticket_messages (ticket_id, created_at);

-- Append-only audit trail: who changed what, and when. actor_id NULL means the system
-- (e.g. auto-assignment). For assignment events, from/to hold user ids.
CREATE TABLE ticket_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
  actor_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  type TEXT NOT NULL
    CHECK (type IN ('created', 'assigned', 'unassigned', 'status_changed', 'priority_changed')),
  from_value TEXT,
  to_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ticket_events_ticket_idx ON ticket_events (ticket_id, created_at);

-- Down Migration

DROP TABLE ticket_events;
DROP TABLE ticket_messages;
DROP TABLE tickets;
