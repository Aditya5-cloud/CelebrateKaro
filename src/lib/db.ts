/**
 * Database singleton for better-sqlite3.
 *
 * This module is SERVER-ONLY. It must never be imported from client components.
 * Next.js enforces this via the `serverExternalPackages` config and the fact
 * that better-sqlite3 is a native module incompatible with the browser bundle.
 *
 * The DB file lives at DATA_DIR/eventplanner.db.
 * On first run, the schema migration runs automatically.
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// ─── Path Resolution ─────────────────────────────────────────────────────────

function getDbPath(): string {
  const dataDir = process.env.DATABASE_PATH
    ? path.dirname(process.env.DATABASE_PATH)
    : path.join(process.cwd(), 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  return process.env.DATABASE_PATH ?? path.join(dataDir, 'eventplanner.db');
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    const dbPath = getDbPath();
    _db = new Database(dbPath);
    // Enable WAL mode for better read concurrency and crash safety
    _db.pragma('journal_mode = WAL');
    // Enforce foreign key constraints
    _db.pragma('foreign_keys = ON');
    runMigrations(_db);
  }
  return _db;
}

/**
 * Close the current database connection (useful for tests and graceful shutdown).
 */
export function closeDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}

// ─── Schema Migrations ────────────────────────────────────────────────────────

/**
 * All DDL is idempotent (IF NOT EXISTS). For a challenge submission, a single
 * migration block is appropriate. A production app would use numbered migrations.
 */
function runMigrations(db: Database.Database): void {
  db.exec(`
    -- Events table
    CREATE TABLE IF NOT EXISTS events (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT    NOT NULL CHECK(length(trim(name)) > 0),
      event_type   TEXT    NOT NULL CHECK(event_type IN ('wedding','birthday','community','other')),
      event_date   TEXT    NOT NULL,
      guest_count  INTEGER NOT NULL CHECK(guest_count >= 0),
      total_budget INTEGER NOT NULL CHECK(total_budget >= 0),
      description  TEXT    NOT NULL DEFAULT '',
      created_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      updated_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );

    -- Budget categories per event
    CREATE TABLE IF NOT EXISTS budget_categories (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id       INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      name           TEXT    NOT NULL CHECK(length(trim(name)) > 0),
      planned_amount INTEGER NOT NULL DEFAULT 0 CHECK(planned_amount >= 0),
      actual_amount  INTEGER NOT NULL DEFAULT 0 CHECK(actual_amount >= 0),
      notes          TEXT    NOT NULL DEFAULT '',
      created_at     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      updated_at     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );

    -- Timeline milestones per event
    CREATE TABLE IF NOT EXISTS milestones (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id    INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      title       TEXT    NOT NULL CHECK(length(trim(title)) > 0),
      description TEXT    NOT NULL DEFAULT '',
      due_date    TEXT    NOT NULL,
      completed   INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0,1)),
      created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      updated_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );

    -- Vendors per event
    CREATE TABLE IF NOT EXISTS vendors (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id      INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      name          TEXT    NOT NULL CHECK(length(trim(name)) > 0),
      category      TEXT    NOT NULL DEFAULT 'other',
      status        TEXT    NOT NULL DEFAULT 'considering'
                    CHECK(status IN ('considering','contacted','booked','paid','cancelled')),
      contact_name  TEXT    NOT NULL DEFAULT '',
      contact_email TEXT    NOT NULL DEFAULT '',
      contact_phone TEXT    NOT NULL DEFAULT '',
      price_quote   INTEGER NOT NULL DEFAULT 0 CHECK(price_quote >= 0),
      notes         TEXT    NOT NULL DEFAULT '',
      created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      updated_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );

    -- AI-generated (and manual) checklist items per event
    CREATE TABLE IF NOT EXISTS checklist_items (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id     INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      category     TEXT    NOT NULL DEFAULT 'general',
      task         TEXT    NOT NULL CHECK(length(trim(task)) > 0),
      completed    INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0,1)),
      ai_generated INTEGER NOT NULL DEFAULT 0 CHECK(ai_generated IN (0,1)),
      sort_order   INTEGER NOT NULL DEFAULT 0,
      created_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      updated_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );

    -- Chat history per event (AI planning assistant)
    CREATE TABLE IF NOT EXISTS chat_messages (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id   INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      role       TEXT    NOT NULL CHECK(role IN ('user','assistant')),
      content    TEXT    NOT NULL CHECK(length(trim(content)) > 0),
      created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );

    -- Indexes for common query patterns
    CREATE INDEX IF NOT EXISTS idx_budget_categories_event ON budget_categories(event_id);
    CREATE INDEX IF NOT EXISTS idx_milestones_event        ON milestones(event_id);
    CREATE INDEX IF NOT EXISTS idx_milestones_due_date     ON milestones(event_id, due_date);
    CREATE INDEX IF NOT EXISTS idx_vendors_event           ON vendors(event_id);
    CREATE INDEX IF NOT EXISTS idx_checklist_event         ON checklist_items(event_id, sort_order);
    CREATE INDEX IF NOT EXISTS idx_chat_event              ON chat_messages(event_id, created_at);
  `);
}

// ─── Utility helpers ──────────────────────────────────────────────────────────

export { toCents, fromCents } from './currency';

/**
 * Return current UTC timestamp as ISO 8601 string.
 */
export function nowIso(): string {
  return new Date().toISOString();
}
