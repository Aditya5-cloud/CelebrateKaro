import { getDb, getNextSequence, nowIso } from './db';
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function enrichEventWithStats(db: any, event: Event): Promise<EventWithStats> {
  const [budgetDocs, milestoneDocs, vendorCount, checklistDocs] = await Promise.all([
    db.collection('budget_categories').find({ event_id: event.id }).toArray(),
    db.collection('milestones').find({ event_id: event.id }).toArray(),
    db.collection('vendors').countDocuments({ event_id: event.id }),
    db.collection('checklist_items').find({ event_id: event.id }).toArray(),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const total_planned_budget = budgetDocs.reduce((acc: number, b: any) => acc + (b.planned_amount || 0), 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const total_spent_budget = budgetDocs.reduce((acc: number, b: any) => acc + (b.actual_amount || 0), 0);
  const milestones_count = milestoneDocs.length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const milestones_completed = milestoneDocs.filter((m: any) => Boolean(m.completed)).length;
  const vendors_count = vendorCount;
  const checklist_count = checklistDocs.length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const checklist_completed = checklistDocs.filter((c: any) => Boolean(c.completed)).length;

  return {
    ...event,
    total_planned_budget,
    total_spent_budget,
    milestones_count,
    milestones_completed,
    vendors_count,
    checklist_count,
    checklist_completed,
  };
}

/**
 * Retrieve all events, optionally filtered by event_type.
 * Ordered by upcoming event_date ASC, then created_at DESC.
 */
export async function getEvents(filter?: { type?: EventType }): Promise<EventWithStats[]> {
  const db = await getDb();
  const query: Record<string, unknown> = {};
  if (filter?.type) {
    query.event_type = filter.type;
  }

  const events: Event[] = await db
    .collection('events')
    .find(query)
    .sort({ event_date: 1, created_at: -1 })
    .toArray();

  return Promise.all(events.map((e) => enrichEventWithStats(db, e)));
}

/**
 * Retrieve a single event by ID.
 */
export async function getEventById(id: number): Promise<EventWithStats | null> {
  const db = await getDb();
  const event = await db.collection('events').findOne({ id });
  if (!event) return null;
  return enrichEventWithStats(db, event as Event);
}

/**
 * Create a new event.
 * Expects validated input where total_budget is in dollars, and converts to cents for DB storage.
 */
export async function createEvent(input: CreateEventSchemaInput): Promise<Event> {
  const db = await getDb();
  const id = await getNextSequence('events');
  const cents = toCents(input.total_budget);
  const now = nowIso();

  const doc: Event = {
    id,
    name: input.name.trim(),
    event_type: input.event_type,
    event_date: input.event_date,
    guest_count: input.guest_count,
    total_budget: cents,
    description: (input.description ?? '').trim(),
    created_at: now,
    updated_at: now,
  };

  await db.collection('events').insertOne(doc);
  return doc;
}

/**
 * Update an existing event by ID.
 * Returns the updated event, or null if the event was not found.
 */
export async function updateEvent(id: number, input: UpdateEventSchemaInput): Promise<Event | null> {
  const db = await getDb();
  const existing = await db.collection('events').findOne({ id });
  if (!existing) {
    return null;
  }

  const updates: Record<string, unknown> = {};

  if (input.name !== undefined) {
    updates.name = input.name.trim();
  }
  if (input.event_type !== undefined) {
    updates.event_type = input.event_type;
  }
  if (input.event_date !== undefined) {
    updates.event_date = input.event_date;
  }
  if (input.guest_count !== undefined) {
    updates.guest_count = input.guest_count;
  }
  if (input.total_budget !== undefined) {
    updates.total_budget = toCents(input.total_budget);
  }
  if (input.description !== undefined) {
    updates.description = input.description.trim();
  }

  if (Object.keys(updates).length === 0) {
    return existing as Event;
  }

  updates.updated_at = nowIso();

  await db.collection('events').updateOne({ id }, { $set: updates });
  const updated = await db.collection('events').findOne({ id });
  return updated as Event;
}

/**
 * Delete an event by ID. Cascading deletion removes all related records in MongoDB.
 * Returns true if an event was deleted, false if no event matched the ID.
 */
export async function deleteEvent(id: number): Promise<boolean> {
  const db = await getDb();
  const result = await db.collection('events').deleteOne({ id });
  if (!result || result.deletedCount === 0) return false;

  // Cascading deletion
  await Promise.all([
    db.collection('budget_categories').deleteMany({ event_id: id }),
    db.collection('milestones').deleteMany({ event_id: id }),
    db.collection('vendors').deleteMany({ event_id: id }),
    db.collection('checklist_items').deleteMany({ event_id: id }),
    db.collection('chat_messages').deleteMany({ event_id: id }),
  ]);

  return true;
}
