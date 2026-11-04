-- Up Migration

-- Shared trigger function: keeps updated_at correct without relying on every UPDATE to set it
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- "customer" says what the role means; "user" was ambiguous (agents are users too)
ALTER TABLE users DROP CONSTRAINT users_role_check;
UPDATE users SET role = 'customer' WHERE role = 'user';
ALTER TABLE users
  ALTER COLUMN role SET DEFAULT 'customer',
  ADD CONSTRAINT users_role_check CHECK (role IN ('customer', 'agent', 'admin')),
  ADD COLUMN last_login_at TIMESTAMPTZ,
  ADD COLUMN email_notifications BOOLEAN NOT NULL DEFAULT true,
  -- Public demo accounts: their password and profile can't be changed
  ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Down Migration

DROP TRIGGER users_set_updated_at ON users;

ALTER TABLE users
  DROP CONSTRAINT users_role_check,
  DROP COLUMN is_demo,
  DROP COLUMN email_notifications,
  DROP COLUMN last_login_at;
UPDATE users SET role = 'user' WHERE role = 'customer';
ALTER TABLE users
  ALTER COLUMN role SET DEFAULT 'user',
  ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'agent', 'admin'));

DROP FUNCTION set_updated_at();
