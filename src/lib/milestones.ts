import { getDb, getNextSequence, nowIso } from './db';
import type { Milestone, EventType } from '@/types';
import type { CreateMilestoneSchemaInput, UpdateMilestoneSchemaInput } from './validations/milestone';

export interface MilestoneStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  percentCompleted: number;
}

export async function getMilestones(eventId: number): Promise<Milestone[]> {
  const db = await getDb();
  const rows = await db
    .collection('milestones')
    .find({ event_id: eventId })
    .sort({ due_date: 1, created_at: 1 })
    .toArray();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows.map((row: any) => ({
    id: row.id,
    event_id: row.event_id,
    title: row.title,
    description: row.description || '',
    due_date: row.due_date,
    completed: Boolean(row.completed),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export async function getMilestoneById(id: number): Promise<Milestone | null> {
  const db = await getDb();
  const row = await db.collection('milestones').findOne({ id });
  if (!row) return null;
  return {
    id: row.id,
    event_id: row.event_id,
    title: row.title,
    description: row.description || '',
    due_date: row.due_date,
    completed: Boolean(row.completed),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function createMilestone(
  eventId: number,
  input: CreateMilestoneSchemaInput
): Promise<Milestone> {
  const db = await getDb();
  const id = await getNextSequence('milestones');
  const now = nowIso();

  const doc: Milestone = {
    id,
    event_id: eventId,
    title: input.title.trim(),
    description: (input.description ?? '').trim(),
    due_date: input.due_date,
    completed: Boolean(input.completed),
    created_at: now,
    updated_at: now,
  };

  await db.collection('milestones').insertOne(doc);
  return doc;
}

export async function updateMilestone(
  id: number,
  input: UpdateMilestoneSchemaInput
): Promise<Milestone | null> {
  const db = await getDb();
  const existing = await getMilestoneById(id);
  if (!existing) return null;

  const updates: Record<string, unknown> = {};

  if (input.title !== undefined) {
    updates.title = input.title.trim();
  }
  if (input.description !== undefined) {
    updates.description = input.description.trim();
  }
  if (input.due_date !== undefined) {
    updates.due_date = input.due_date;
  }
  if (input.completed !== undefined) {
    updates.completed = Boolean(input.completed);
  }

  if (Object.keys(updates).length === 0) return existing;

  updates.updated_at = nowIso();

  await db.collection('milestones').updateOne({ id }, { $set: updates });
  return getMilestoneById(id);
}

export async function deleteMilestone(id: number): Promise<boolean> {
  const db = await getDb();
  const result = await db.collection('milestones').deleteOne({ id });
  return Boolean(result && result.deletedCount > 0);
}

export async function getMilestoneStats(eventId: number): Promise<MilestoneStats> {
  const milestones = await getMilestones(eventId);
  const todayStr = new Date().toISOString().split('T')[0];

  const total = milestones.length;
  const completed = milestones.filter((m) => m.completed).length;
  const overdue = milestones.filter((m) => !m.completed && m.due_date < todayStr).length;
  const pending = total - completed;
  const percentCompleted = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    pending,
    overdue,
    percentCompleted,
  };
}

/**
 * Helper to compute an ISO YYYY-MM-DD date by subtracting days from target date.
 */
function offsetDate(targetDateStr: string, daysBefore: number): string {
  const [year, month, day] = targetDateStr.split('-').map(Number);
  const targetDate = new Date(Date.UTC(year, month - 1, day));
  const milestoneDate = new Date(targetDate.getTime() - daysBefore * 24 * 60 * 60 * 1000);

  return milestoneDate.toISOString().split('T')[0];
}

/**
 * Seed an intelligent celebration timeline tailored to event type.
 */
export async function seedTimelineTemplate(
  eventId: number,
  eventType: EventType,
  eventDateStr: string
): Promise<Milestone[]> {
  const db = await getDb();

  interface TemplateMilestone {
    title: string;
    description: string;
    daysBefore: number;
  }

  const templates: Record<EventType, TemplateMilestone[]> = {
    wedding: [
      {
        title: 'Finalize Guest Count & Book Ceremony/Reception Venue',
        description: 'Secure dates and contracts with venue. Establish preliminary guest count.',
        daysBefore: 180,
      },
      {
        title: 'Hire Core Vendors (Photographer, Caterer, DJ/Band)',
        description: 'Interview vendors, sample catering menus, and place deposits.',
        daysBefore: 120,
      },
      {
        title: 'Order Wedding Attire & Send Save-the-Dates',
        description: 'Outfit wedding party and notify guests of the date.',
        daysBefore: 90,
      },
      {
        title: 'Mail Formal Invitations & Finalize Floral/Decor',
        description: 'Include RSVP deadline (4 weeks prior to wedding) and gift registry info.',
        daysBefore: 60,
      },
      {
        title: 'Confirm Final RSVPs & Finalize Seating Chart',
        description: 'Submit guaranteed meal headcount to catering and venue.',
        daysBefore: 21,
      },
      {
        title: 'Rehearsal Ceremony & Final Vendor Coordination',
        description: 'Confirm arrival times, setup logistics, and run-of-show schedule.',
        daysBefore: 2,
      },
      {
        title: 'Wedding Day Celebration!',
        description: 'Say your vows, celebrate with loved ones, and enjoy every moment.',
        daysBefore: 0,
      },
    ],
    birthday: [
      {
        title: 'Choose Party Theme & Book Venue / Entertainer',
        description: 'Select venue or home layout, and reserve entertainment or DJ if desired.',
        daysBefore: 30,
      },
      {
        title: 'Send Invitations & Order Custom Cake',
        description: 'Notify guests and order themed cake or desserts.',
        daysBefore: 21,
      },
      {
        title: 'Confirm RSVPs & Buy Decorations and Party Favors',
        description: 'Finalize party games, balloons, table settings, and goodie bags.',
        daysBefore: 10,
      },
      {
        title: 'Food & Beverage Shopping & Playlist Setup',
        description: 'Buy drinks, snacks, paper goods, and curate music playlist.',
        daysBefore: 3,
      },
      {
        title: 'Decorate & Celebrate Birthday!',
        description: 'Set up party area, welcome guests, cut cake, and make memories.',
        daysBefore: 0,
      },
    ],
    community: [
      {
        title: 'Secure City Permits, Park Reservations & Insurance',
        description: 'Submit street closure or park permits and verify liability coverage.',
        daysBefore: 60,
      },
      {
        title: 'Recruit Volunteers & Solicit Community Sponsors',
        description: 'Form planning committee, assign roles, and gather local sponsors.',
        daysBefore: 45,
      },
      {
        title: 'Public Announcements, Social Flyers & Posters',
        description: 'Distribute posters to local businesses and post in community boards.',
        daysBefore: 30,
      },
      {
        title: 'Confirm Staging, Audio Equipment & Sanitation',
        description: 'Ensure stage, microphone, porta-potties, and trash bins are booked.',
        daysBefore: 14,
      },
      {
        title: 'Volunteer Walkthrough & Safety Check',
        description: 'Brief volunteers on logistics, emergency contacts, and booth assignments.',
        daysBefore: 3,
      },
      {
        title: 'Community Event Day!',
        description: 'Open gates, run community games, food stalls, and festivities.',
        daysBefore: 0,
      },
    ],
    other: [
      {
        title: 'Set Date, Theme & Secure Space',
        description: 'Reserve gathering space and outline celebration schedule.',
        daysBefore: 30,
      },
      {
        title: 'Send Invitations & Confirm Food Arrangements',
        description: 'Coordinate catering, potluck, or refreshment orders.',
        daysBefore: 18,
      },
      {
        title: 'Final Supplies & Playlist Preparation',
        description: 'Gather party supplies, audio setup, and activities.',
        daysBefore: 5,
      },
      {
        title: 'Event Day Celebration!',
        description: 'Host, celebrate, and enjoy with all attendees.',
        daysBefore: 0,
      },
    ],
  };

  const list = templates[eventType] || templates.other;
  const now = nowIso();

  // Clear existing milestones if generating fresh template
  await db.collection('milestones').deleteMany({ event_id: eventId });

  const docs: Milestone[] = [];
  for (const item of list) {
    const calculatedDate = offsetDate(eventDateStr, item.daysBefore);
    const id = await getNextSequence('milestones');
    docs.push({
      id,
      event_id: eventId,
      title: item.title,
      description: item.description,
      due_date: calculatedDate,
      completed: false,
      created_at: now,
      updated_at: now,
    });
  }

  if (docs.length > 0) {
    await db.collection('milestones').insertMany(docs);
  }

  return getMilestones(eventId);
}
