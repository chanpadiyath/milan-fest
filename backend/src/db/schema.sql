-- Milan API schema. Constraints live in the database as well as in the app,
-- so bad data cannot get in even if a code path forgets to validate.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  description TEXT    NOT NULL,
  category    TEXT    NOT NULL CHECK (category IN ('Dance', 'Music', 'Drama', 'Fashion', 'Technical', 'Literary', 'Art')),
  venue       TEXT    NOT NULL,
  start_time  TEXT    NOT NULL,              -- ISO 8601, UTC
  capacity    INTEGER NOT NULL CHECK (capacity > 0),
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_events_category   ON events (category);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events (start_time);

CREATE TABLE IF NOT EXISTS registrations (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id   INTEGER NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL,             -- stored lower-cased
  college    TEXT    NOT NULL,
  phone      TEXT,
  created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (event_id, email)                 -- one registration per person per event
);

CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations (event_id);
