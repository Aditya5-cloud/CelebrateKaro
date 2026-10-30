import { getDb, getNextSequence, nowIso } from './db';
import { toCents } from './currency';
import type { Db } from 'mongodb';
import type { Event, EventType, BudgetCategory, Milestone, ChecklistItem, Vendor } from '@/types';
import type { CreateEventSchemaInput, UpdateEventSchemaInput } from './validations/event';
import { seedBudgetTemplate } from './budget';
import { seedTimelineTemplate } from './milestones';
import { seedVendorTemplate } from './vendors';

export interface EventWithStats extends Event {
  total_planned_budget: number; // sum of categories planned (cents)
  total_spent_budget: number;   // sum of categories actual (cents)
  milestones_count: number;
  milestones_completed: number;
  vendors_count: number;
  checklist_count: number;
  checklist_completed: number;
}

async function enrichEventWithStats(db: Db, event: Event): Promise<EventWithStats> {
  const [budgetDocs, milestoneDocs, vendorCount, checklistDocs] = await Promise.all([
    db.collection<BudgetCategory>('budget_categories').find({ event_id: event.id }).toArray(),
    db.collection<Milestone>('milestones').find({ event_id: event.id }).toArray(),
    db.collection('vendors').countDocuments({ event_id: event.id }),
    db.collection<ChecklistItem>('checklist_items').find({ event_id: event.id }).toArray(),
  ]);

  const total_planned_budget = budgetDocs.reduce((acc: number, b: BudgetCategory) => acc + (b.planned_amount || 0), 0);
  const total_spent_budget = budgetDocs.reduce((acc: number, b: BudgetCategory) => acc + (b.actual_amount || 0), 0);
  const milestones_count = milestoneDocs.length;
  const milestones_completed = milestoneDocs.filter((m: Milestone) => Boolean(m.completed)).length;
  const vendors_count = vendorCount;
  const checklist_count = checklistDocs.length;
  const checklist_completed = checklistDocs.filter((c: ChecklistItem) => Boolean(c.completed)).length;

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
 * Retrieve all events, optionally filtered by event_type and/or userId.
 * Ordered by upcoming event_date ASC, then created_at DESC.
 * Employs high-performance parallel batch retrieval to eliminate N+1 latency.
 */
export async function getEvents(filter?: { type?: EventType; userId?: string }): Promise<EventWithStats[]> {
  const db = await getDb();
  if (filter?.userId && filter.userId.startsWith('usr_demo_')) {
    await ensureDemoEvents(filter.userId);
  }

  const query: Record<string, unknown> = {};
  if (filter?.type) {
    query.event_type = filter.type;
  }
  if (filter?.userId) {
    query.user_id = filter.userId;
  }

  const events = await db
    .collection<Event>('events')
    .find(query)
    .sort({ event_date: 1, created_at: -1 })
    .toArray();

  if (events.length === 0) {
    return [];
  }

  const eventIds = events.map((e) => e.id);

  // Parallel batch queries for all matched events to avoid N+1 WAN round trips
  const [allBudgets, allMilestones, allVendors, allChecklists] = await Promise.all([
    db.collection<BudgetCategory>('budget_categories').find({ event_id: { $in: eventIds } }).toArray(),
    db.collection<Milestone>('milestones').find({ event_id: { $in: eventIds } }).toArray(),
    db.collection<Vendor>('vendors').find({ event_id: { $in: eventIds } }).toArray(),
    db.collection<ChecklistItem>('checklist_items').find({ event_id: { $in: eventIds } }).toArray(),
  ]);

  const budgetStats = new Map<number, { planned: number; spent: number }>();
  for (const b of allBudgets) {
    const cur = budgetStats.get(b.event_id) || { planned: 0, spent: 0 };
    cur.planned += b.planned_amount || 0;
    cur.spent += b.actual_amount || 0;
    budgetStats.set(b.event_id, cur);
  }

  const milestoneStats = new Map<number, { count: number; completed: number }>();
  for (const m of allMilestones) {
    const cur = milestoneStats.get(m.event_id) || { count: 0, completed: 0 };
    cur.count += 1;
    if (m.completed) cur.completed += 1;
    milestoneStats.set(m.event_id, cur);
  }

  const vendorCounts = new Map<number, number>();
  for (const v of allVendors) {
    vendorCounts.set(v.event_id, (vendorCounts.get(v.event_id) || 0) + 1);
  }

  const checklistStats = new Map<number, { count: number; completed: number }>();
  for (const c of allChecklists) {
    const cur = checklistStats.get(c.event_id) || { count: 0, completed: 0 };
    cur.count += 1;
    if (c.completed) cur.completed += 1;
    checklistStats.set(c.event_id, cur);
  }

  return events.map((event) => {
    const b = budgetStats.get(event.id) || { planned: 0, spent: 0 };
    const m = milestoneStats.get(event.id) || { count: 0, completed: 0 };
    const v = vendorCounts.get(event.id) || 0;
    const c = checklistStats.get(event.id) || { count: 0, completed: 0 };

    return {
      ...event,
      total_planned_budget: b.planned,
      total_spent_budget: b.spent,
      milestones_count: m.count,
      milestones_completed: m.completed,
      vendors_count: v,
      checklist_count: c.count,
      checklist_completed: c.completed,
    };
  });
}

const seededDemoUsers = new Set<string>();

export function getRelativeFutureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

/**
 * Automatically seeds pre-configured starter celebrations for official demo accounts
 * so evaluators and reviewers have immediate rich workflows out-of-the-box.
 * Real registered users always start with an empty, completely isolated workspace.
 */
export async function ensureDemoEvents(userId: string): Promise<void> {
  if (!userId || !userId.startsWith('usr_demo_')) return;
  if (seededDemoUsers.has(userId)) return;
  const db = await getDb();
  const existingEvents = await db.collection('events').find({ user_id: userId }).toArray();
  const todayStr = new Date().toISOString().split('T')[0];

  if (existingEvents.length > 0) {
    // If any demo event date has drifted into the past, refresh it to an upcoming real-time date
    for (const evt of existingEvents) {
      if (evt.event_date < todayStr) {
        const offsetDays = evt.event_type === 'wedding' ? 45 : evt.event_type === 'birthday' ? 18 : 75;
        const newDate = getRelativeFutureDate(offsetDays);
        await db.collection('events').updateOne({ id: evt.id }, { $set: { event_date: newDate, updated_at: nowIso() } });
        await seedTimelineTemplate(evt.id, evt.event_type, newDate);
      }
    }
    seededDemoUsers.add(userId);
    return;
  }

  if (userId === 'usr_demo_1') {
    const wedding = await createEvent(
      {
        name: 'Rachel & Liam Garden Wedding',
        event_type: 'wedding',
        event_date: getRelativeFutureDate(45),
        guest_count: 140,
        total_budget: 25000,
        description: 'Intimate outdoor garden ceremony with live acoustic quartet and farm-to-table banquet.',
      },
      userId
    );
    await Promise.all([
      seedBudgetTemplate(wedding.id, 'wedding', wedding.total_budget),
      seedTimelineTemplate(wedding.id, 'wedding', wedding.event_date),
      seedVendorTemplate(wedding.id, 'wedding'),
    ]);
  } else if (userId === 'usr_demo_2') {
    const birthday = await createEvent(
      {
        name: "Marcus's 30th Rooftop Birthday Celebration",
        event_type: 'birthday',
        event_date: getRelativeFutureDate(18),
        guest_count: 50,
        total_budget: 6500,
        description: 'Sunset cocktail hour, live DJ set, and retro arcade station.',
      },
      userId
    );
    await Promise.all([
      seedBudgetTemplate(birthday.id, 'birthday', birthday.total_budget),
      seedTimelineTemplate(birthday.id, 'birthday', birthday.event_date),
      seedVendorTemplate(birthday.id, 'birthday'),
    ]);
  } else if (userId === 'usr_demo_3') {
    const gala = await createEvent(
      {
        name: 'Metropolitan Harvest Charity Gala',
        event_type: 'community',
        event_date: getRelativeFutureDate(75),
        guest_count: 280,
        total_budget: 35000,
        description: 'Annual autumn banquet raising scholarships with keynote speakers and silent auction.',
      },
      userId
    );
    await Promise.all([
      seedBudgetTemplate(gala.id, 'community', gala.total_budget),
      seedTimelineTemplate(gala.id, 'community', gala.event_date),
      seedVendorTemplate(gala.id, 'community'),
    ]);
  }
  seededDemoUsers.add(userId);
}

/**
 * Retrieve a single event by ID.
 */
export async function getEventById(id: number): Promise<EventWithStats | null> {
  const db = await getDb();
  const event = await db.collection<Event>('events').findOne({ id });
  if (!event) return null;
  return enrichEventWithStats(db, event);
}

/**
 * Create a new event.
 * Expects validated input where total_budget is in dollars, and converts to cents for DB storage.
 */
export async function createEvent(input: CreateEventSchemaInput, userId?: string): Promise<Event> {
  const db = await getDb();
  const id = await getNextSequence('events');
  const cents = toCents(input.total_budget);
  const now = nowIso();

  const doc: Event = {
    id,
    user_id: input.user_id || userId || undefined,
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
  const existing = await db.collection<Event>('events').findOne({ id });
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
    return existing;
  }

  updates.updated_at = nowIso();

  await db.collection('events').updateOne({ id }, { $set: updates });
  const updated = await db.collection<Event>('events').findOne({ id });
  return updated;
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
