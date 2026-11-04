-- Up Migration

CREATE TABLE categories (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE CHECK (length(btrim(name)) BETWEEN 1 AND 60),
  -- Retired categories stay on old tickets but can't be picked for new ones
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER categories_set_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Reference data the app needs from day one (admins can add more)
INSERT INTO categories (name) VALUES
  ('Billing & payments'),
  ('Account & login'),
  ('Technical issue'),
  ('Feature request'),
  ('Other');

-- Down Migration

DROP TABLE categories;
