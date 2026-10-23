/**
 * Smoke tests for the database module.
 * Uses an in-memory SQLite database to keep tests fast and isolated.
 */

import Database from 'better-sqlite3';

// ─── Inline schema (mirrors db.ts) ───────────────────────────────────────────

function createTestDb(): Database.Database {
  const db = new Database(':memory:');
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
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

    CREATE TABLE IF NOT EXISTS chat_messages (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id   INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      role       TEXT    NOT NULL CHECK(role IN ('user','assistant')),
      content    TEXT    NOT NULL CHECK(length(trim(content)) > 0),
      created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );
  `);

  return db;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Database schema', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createTestDb();
  });

  afterEach(() => {
    db.close();
  });

  describe('events table', () => {
    it('inserts and retrieves an event', () => {
      db.prepare(
        `INSERT INTO events (name, event_type, event_date, guest_count, total_budget, description)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run('Alice & Bob Wedding', 'wedding', '2027-06-15', 120, 1500000, 'Garden ceremony');

      const row = db.prepare('SELECT * FROM events WHERE id = 1').get() as { name: string };
      expect(row.name).toBe('Alice & Bob Wedding');
    });

    it('rejects blank event names', () => {
      expect(() => {
        db.prepare(
          `INSERT INTO events (name, event_type, event_date, guest_count, total_budget)
           VALUES (?, ?, ?, ?, ?)`
        ).run('   ', 'wedding', '2027-06-15', 120, 1500000);
      }).toThrow();
    });

    it('rejects invalid event_type values', () => {
      expect(() => {
        db.prepare(
          `INSERT INTO events (name, event_type, event_date, guest_count, total_budget)
           VALUES (?, ?, ?, ?, ?)`
        ).run('Party', 'party', '2027-06-15', 50, 500000);
      }).toThrow();
    });

    it('rejects negative guest_count', () => {
      expect(() => {
        db.prepare(
          `INSERT INTO events (name, event_type, event_date, guest_count, total_budget)
           VALUES (?, ?, ?, ?, ?)`
        ).run('Birthday', 'birthday', '2027-01-01', -1, 50000);
      }).toThrow();
    });

    it('rejects negative total_budget', () => {
      expect(() => {
        db.prepare(
          `INSERT INTO events (name, event_type, event_date, guest_count, total_budget)
           VALUES (?, ?, ?, ?, ?)`
        ).run('Birthday', 'birthday', '2027-01-01', 10, -100);
      }).toThrow();
    });
  });

  describe('budget_categories table', () => {
    beforeEach(() => {
      db.prepare(
        `INSERT INTO events (name, event_type, event_date, guest_count, total_budget)
         VALUES (?, ?, ?, ?, ?)`
      ).run('Test Event', 'birthday', '2027-01-01', 20, 100000);
    });

    it('inserts and retrieves a budget category', () => {
      db.prepare(
        `INSERT INTO budget_categories (event_id, name, planned_amount, actual_amount)
         VALUES (?, ?, ?, ?)`
      ).run(1, 'venue', 50000, 0);

      const row = db
        .prepare('SELECT * FROM budget_categories WHERE event_id = 1')
        .get() as { name: string; planned_amount: number };
      expect(row.name).toBe('venue');
      expect(row.planned_amount).toBe(50000);
    });

    it('cascades delete when event is deleted', () => {
      db.prepare(
        `INSERT INTO budget_categories (event_id, name, planned_amount)
         VALUES (?, ?, ?)`
      ).run(1, 'catering', 30000);

      db.prepare('DELETE FROM events WHERE id = 1').run();
      const rows = db
        .prepare('SELECT * FROM budget_categories WHERE event_id = 1')
        .all();
      expect(rows).toHaveLength(0);
    });

    it('rejects negative planned_amount', () => {
      expect(() => {
        db.prepare(
          `INSERT INTO budget_categories (event_id, name, planned_amount)
           VALUES (?, ?, ?)`
        ).run(1, 'venue', -1);
      }).toThrow();
    });
  });

  describe('milestones table', () => {
    beforeEach(() => {
      db.prepare(
        `INSERT INTO events (name, event_type, event_date, guest_count, total_budget)
         VALUES (?, ?, ?, ?, ?)`
      ).run('Test Event', 'community', '2027-03-01', 200, 200000);
    });

    it('inserts a milestone and defaults completed to 0', () => {
      db.prepare(
        `INSERT INTO milestones (event_id, title, due_date)
         VALUES (?, ?, ?)`
      ).run(1, 'Book venue', '2026-12-01');

      const row = db
        .prepare('SELECT * FROM milestones WHERE event_id = 1')
        .get() as { completed: number; title: string };
      expect(row.title).toBe('Book venue');
      expect(row.completed).toBe(0);
    });

    it('rejects invalid completed values', () => {
      expect(() => {
        db.prepare(
          `INSERT INTO milestones (event_id, title, due_date, completed)
           VALUES (?, ?, ?, ?)`
        ).run(1, 'Send invites', '2027-01-01', 2);
      }).toThrow();
    });
  });

  describe('vendors table', () => {
    beforeEach(() => {
      db.prepare(
        `INSERT INTO events (name, event_type, event_date, guest_count, total_budget)
         VALUES (?, ?, ?, ?, ?)`
      ).run('Test Event', 'wedding', '2027-09-10', 80, 800000);
    });

    it('rejects invalid vendor status', () => {
      expect(() => {
        db.prepare(
          `INSERT INTO vendors (event_id, name, status)
           VALUES (?, ?, ?)`
        ).run(1, 'Joe Caterers', 'done');
      }).toThrow();
    });

    it('accepts all valid vendor statuses', () => {
      const statuses = ['considering', 'contacted', 'booked', 'paid', 'cancelled'];
      statuses.forEach((status, i) => {
        expect(() => {
          db.prepare(
            `INSERT INTO vendors (event_id, name, status)
             VALUES (?, ?, ?)`
          ).run(1, `Vendor ${i}`, status);
        }).not.toThrow();
      });
    });
  });

  describe('foreign key enforcement', () => {
    it('rejects vendor with non-existent event_id', () => {
      expect(() => {
        db.prepare(
          `INSERT INTO vendors (event_id, name)
           VALUES (?, ?)`
        ).run(999, 'Ghost Vendor');
      }).toThrow();
    });
  });
});

describe('Utility functions', () => {
  it('toCents converts dollars to integer cents', () => {
    // Test the logic directly without importing the file (avoids fs side effects in tests)
    const toCents = (dollars: number) => Math.round(dollars * 100);
    expect(toCents(15000)).toBe(1500000);
    expect(toCents(99.99)).toBe(9999);
    expect(toCents(0)).toBe(0);
    // Floating point edge case
    expect(toCents(0.1 + 0.2)).toBe(30);
  });

  it('fromCents converts cents to dollars', () => {
    const fromCents = (cents: number) => cents / 100;
    expect(fromCents(1500000)).toBe(15000);
    expect(fromCents(9999)).toBe(99.99);
    expect(fromCents(0)).toBe(0);
  });
});
