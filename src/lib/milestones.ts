import { getDb, nowIso } from './db';
import type { Milestone, EventType } from '@/types';
import type { CreateMilestoneSchemaInput, UpdateMilestoneSchemaInput } from './validations/milestone';

export interface MilestoneStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  percentCompleted: number;
}

interface RawMilestoneRow {
  id: number;
  event_id: number;
  title: string;
  description: string;
  due_date: string;
  completed: number;
  created_at: string;
  updated_at: string;
}

function mapRowToMilestone(row: RawMilestoneRow): Milestone {
  return {
    ...row,
    completed: Boolean(row.completed),
  };
}

export function getMilestones(eventId: number): Milestone[] {
  const db = getDb();
  const rows = db
    .prepare('SELECT * FROM milestones WHERE event_id = ? ORDER BY due_date ASC, created_at ASC')
    .all(eventId) as RawMilestoneRow[];

  return rows.map(mapRowToMilestone);
}

export function getMilestoneById(id: number): Milestone | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM milestones WHERE id = ?').get(id) as RawMilestoneRow | undefined;
  return row ? mapRowToMilestone(row) : null;
}

export function createMilestone(
  eventId: number,
  input: CreateMilestoneSchemaInput
): Milestone {
  const db = getDb();
  const now = nowIso();
  const completedInt = input.completed ? 1 : 0;

  const info = db.prepare(`
    INSERT INTO milestones (event_id, title, description, due_date, completed, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    eventId,
    input.title.trim(),
    (input.description ?? '').trim(),
    input.due_date,
    completedInt,
    now,
    now
  );

  const rowId = Number(info.lastInsertRowid);
  const created = db.prepare('SELECT * FROM milestones WHERE id = ?').get(rowId) as RawMilestoneRow;
  return mapRowToMilestone(created);
}

export function updateMilestone(
  id: number,
  input: UpdateMilestoneSchemaInput
): Milestone | null {
  const db = getDb();
  const existing = getMilestoneById(id);
  if (!existing) return null;

  const updates: string[] = [];
  const params: unknown[] = [];

  if (input.title !== undefined) {
    updates.push('title = ?');
    params.push(input.title.trim());
  }
  if (input.description !== undefined) {
    updates.push('description = ?');
    params.push(input.description.trim());
  }
  if (input.due_date !== undefined) {
    updates.push('due_date = ?');
    params.push(input.due_date);
  }
  if (input.completed !== undefined) {
    updates.push('completed = ?');
    params.push(input.completed ? 1 : 0);
  }

  if (updates.length === 0) return existing;

  updates.push('updated_at = ?');
  params.push(nowIso());
  params.push(id);

  db.prepare(`UPDATE milestones SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  return getMilestoneById(id);
}

export function deleteMilestone(id: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM milestones WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getMilestoneStats(eventId: number): MilestoneStats {
  const db = getDb();
  const todayStr = new Date().toISOString().split('T')[0];

  const total = (
    db.prepare('SELECT COUNT(*) as count FROM milestones WHERE event_id = ?').get(eventId) as { count: number }
  ).count;

  const completed = (
    db.prepare('SELECT COUNT(*) as count FROM milestones WHERE event_id = ? AND completed = 1').get(eventId) as {
      count: number;
    }
  ).count;

  const overdue = (
    db
      .prepare(
        'SELECT COUNT(*) as count FROM milestones WHERE event_id = ? AND completed = 0 AND due_date < ?'
      )
      .get(eventId, todayStr) as { count: number }
  ).count;

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
 * If subtracted date is before today, clamps to today plus reasonable offset.
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
export function seedTimelineTemplate(
  eventId: number,
  eventType: EventType,
  eventDateStr: string
): Milestone[] {
  const db = getDb();

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
  db.prepare('DELETE FROM milestones WHERE event_id = ?').run(eventId);

  const insertStmt = db.prepare(`
    INSERT INTO milestones (event_id, title, description, due_date, completed, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertTransaction = db.transaction(() => {
    for (const item of list) {
      const calculatedDate = offsetDate(eventDateStr, item.daysBefore);
      insertStmt.run(eventId, item.title, item.description, calculatedDate, 0, now, now);
    }
  });

  insertTransaction();

  return getMilestones(eventId);
}
