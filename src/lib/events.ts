import { getDb, nowIso } from './db';
import { toCents } from './currency';
import type { Event, EventType } from '@/types';
import type { CreateEventSchemaInput, UpdateEventSchemaInput } from './validations/event';

export interface EventWithStats extends Event {
  total_planned_budget: number; // sum of categories planned (cents)
  total_spent_budget: number;   // sum of categories actual (cents)
  milestones_count: number;
  milestones_completed: number;
  vendors_count: number;
  checklist_count: number;
  checklist_completed: number;
}

/**
 * Retrieve all events, optionally filtered by event_type.
 * Ordered by upcoming event_date ASC, then created_at DESC.
 */
export function getEvents(filter?: { type?: EventType }): EventWithStats[] {
  const db = getDb();
  let query = `
    SELECT 
      e.*,
      COALESCE((SELECT SUM(planned_amount) FROM budget_categories WHERE event_id = e.id), 0) AS total_planned_budget,
      COALESCE((SELECT SUM(actual_amount) FROM budget_categories WHERE event_id = e.id), 0) AS total_spent_budget,
      COALESCE((SELECT COUNT(*) FROM milestones WHERE event_id = e.id), 0) AS milestones_count,
      COALESCE((SELECT COUNT(*) FROM milestones WHERE event_id = e.id AND completed = 1), 0) AS milestones_completed,
      COALESCE((SELECT COUNT(*) FROM vendors WHERE event_id = e.id), 0) AS vendors_count,
      COALESCE((SELECT COUNT(*) FROM checklist_items WHERE event_id = e.id), 0) AS checklist_count,
      COALESCE((SELECT COUNT(*) FROM checklist_items WHERE event_id = e.id AND completed = 1), 0) AS checklist_completed
    FROM events e
  `;

  const params: unknown[] = [];
  if (filter?.type) {
    query += ` WHERE e.event_type = ?`;
    params.push(filter.type);
  }

  query += ` ORDER BY e.event_date ASC, e.created_at DESC`;

  const rows = db.prepare(query).all(...params) as EventWithStats[];
  return rows;
}

/**
 * Retrieve a single event by ID.
 */
export function getEventById(id: number): EventWithStats | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT 
      e.*,
      COALESCE((SELECT SUM(planned_amount) FROM budget_categories WHERE event_id = e.id), 0) AS total_planned_budget,
      COALESCE((SELECT SUM(actual_amount) FROM budget_categories WHERE event_id = e.id), 0) AS total_spent_budget,
      COALESCE((SELECT COUNT(*) FROM milestones WHERE event_id = e.id), 0) AS milestones_count,
      COALESCE((SELECT COUNT(*) FROM milestones WHERE event_id = e.id AND completed = 1), 0) AS milestones_completed,
      COALESCE((SELECT COUNT(*) FROM vendors WHERE event_id = e.id), 0) AS vendors_count,
      COALESCE((SELECT COUNT(*) FROM checklist_items WHERE event_id = e.id), 0) AS checklist_count,
      COALESCE((SELECT COUNT(*) FROM checklist_items WHERE event_id = e.id AND completed = 1), 0) AS checklist_completed
    FROM events e
    WHERE e.id = ?
  `).get(id) as EventWithStats | undefined;

  return row ?? null;
}

/**
 * Create a new event.
 * Expects validated input where total_budget is in dollars, and converts to cents for DB storage.
 */
export function createEvent(input: CreateEventSchemaInput): Event {
  const db = getDb();
  const cents = toCents(input.total_budget);
  const now = nowIso();

  const info = db.prepare(`
    INSERT INTO events (name, event_type, event_date, guest_count, total_budget, description, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.name.trim(),
    input.event_type,
    input.event_date,
    input.guest_count,
    cents,
    (input.description ?? '').trim(),
    now,
    now
  );

  const created = db.prepare(`SELECT * FROM events WHERE id = ?`).get(info.lastInsertRowid) as Event;
  return created;
}

/**
 * Update an existing event by ID.
 * Returns the updated event, or null if the event was not found.
 */
export function updateEvent(id: number, input: UpdateEventSchemaInput): Event | null {
  const db = getDb();
  const existing = db.prepare(`SELECT * FROM events WHERE id = ?`).get(id) as Event | undefined;
  if (!existing) {
    return null;
  }

  const updates: string[] = [];
  const params: unknown[] = [];

  if (input.name !== undefined) {
    updates.push('name = ?');
    params.push(input.name.trim());
  }
  if (input.event_type !== undefined) {
    updates.push('event_type = ?');
    params.push(input.event_type);
  }
  if (input.event_date !== undefined) {
    updates.push('event_date = ?');
    params.push(input.event_date);
  }
  if (input.guest_count !== undefined) {
    updates.push('guest_count = ?');
    params.push(input.guest_count);
  }
  if (input.total_budget !== undefined) {
    updates.push('total_budget = ?');
    params.push(toCents(input.total_budget));
  }
  if (input.description !== undefined) {
    updates.push('description = ?');
    params.push(input.description.trim());
  }

  if (updates.length === 0) {
    return existing;
  }

  updates.push('updated_at = ?');
  params.push(nowIso());

  params.push(id);

  db.prepare(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  const updated = db.prepare(`SELECT * FROM events WHERE id = ?`).get(id) as Event;
  return updated;
}

/**
 * Delete an event by ID. Cascading deletion is handled by SQLite foreign keys.
 * Returns true if an event was deleted, false if no event matched the ID.
 */
export function deleteEvent(id: number): boolean {
  const db = getDb();
  const result = db.prepare(`DELETE FROM events WHERE id = ?`).run(id);
  return result.changes > 0;
}
