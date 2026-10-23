import path from 'path';
import fs from 'fs';
import os from 'os';

const testDbPath = path.join(os.tmpdir(), `test-milestones-${Date.now()}-${Math.random().toString(36).slice(2)}.db`);
process.env.DATABASE_PATH = testDbPath;

import { getDb, closeDb } from '../db';
import { createEvent } from '../events';
import {
  getMilestones,
  getMilestoneById,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  getMilestoneStats,
  seedTimelineTemplate,
} from '../milestones';

describe('Milestones Service Layer', () => {
  let eventId: number;

  beforeAll(() => {
    getDb();
  });

  afterAll(() => {
    closeDb();
    try {
      if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
      const wal = `${testDbPath}-wal`;
      const shm = `${testDbPath}-shm`;
      if (fs.existsSync(wal)) fs.unlinkSync(wal);
      if (fs.existsSync(shm)) fs.unlinkSync(shm);
    } catch {
      // ignore
    }
  });

  beforeEach(() => {
    const db = getDb();
    db.prepare('DELETE FROM events').run();
    db.prepare('DELETE FROM milestones').run();

    const event = createEvent({
      name: 'Autumn Harvest Community Gala',
      event_type: 'community',
      event_date: '2027-10-20',
      guest_count: 300,
      total_budget: 15000,
      description: 'Community fall festival',
    });
    eventId = event.id;
  });

  it('creates and retrieves milestones with boolean completed status', () => {
    const created = createMilestone(eventId, {
      title: 'Obtain Park Permit',
      due_date: '2027-08-15',
      description: 'Submit application to parks department',
      completed: false,
    });

    expect(created.id).toBeDefined();
    expect(created.title).toBe('Obtain Park Permit');
    expect(created.due_date).toBe('2027-08-15');
    expect(created.completed).toBe(false);

    const fetched = getMilestoneById(created.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.title).toBe('Obtain Park Permit');
    expect(fetched?.completed).toBe(false);

    const list = getMilestones(eventId);
    expect(list).toHaveLength(1);
  });

  it('updates milestone fields and toggles completed state', () => {
    const created = createMilestone(eventId, {
      title: 'Book Live Band',
      due_date: '2027-09-01',
      description: '',
      completed: false,
    });

    const updated = updateMilestone(created.id, {
      completed: true,
      title: 'Book The Groove Collective (Confirmed)',
    });

    expect(updated).not.toBeNull();
    expect(updated?.completed).toBe(true);
    expect(updated?.title).toBe('Book The Groove Collective (Confirmed)');
  });

  it('deletes a milestone', () => {
    const created = createMilestone(eventId, {
      title: 'Temporary Task',
      due_date: '2027-07-01',
      description: '',
      completed: false,
    });

    expect(deleteMilestone(created.id)).toBe(true);
    expect(getMilestoneById(created.id)).toBeNull();
  });

  it('calculates completion statistics and flags overdue items', () => {
    // 1 completed task
    createMilestone(eventId, {
      title: 'Completed Task',
      due_date: '2027-01-01',
      description: '',
      completed: true,
    });

    // 1 future pending task
    createMilestone(eventId, {
      title: 'Future Pending Task',
      due_date: '2027-10-01',
      description: '',
      completed: false,
    });

    // 1 overdue pending task (due date in 2020)
    createMilestone(eventId, {
      title: 'Overdue Task',
      due_date: '2020-01-01',
      description: '',
      completed: false,
    });

    const stats = getMilestoneStats(eventId);
    expect(stats.total).toBe(3);
    expect(stats.completed).toBe(1);
    expect(stats.pending).toBe(2);
    expect(stats.overdue).toBe(1);
    expect(stats.percentCompleted).toBe(33); // 1/3 = 33%
  });

  it('seeds standard chronological timeline roadmap tailored to event', () => {
    const seeded = seedTimelineTemplate(eventId, 'community', '2027-10-20');
    expect(seeded.length).toBeGreaterThanOrEqual(5);

    // Verify chronological ordering
    for (let i = 0; i < seeded.length - 1; i++) {
      expect(seeded[i].due_date <= seeded[i + 1].due_date).toBe(true);
    }

    const stats = getMilestoneStats(eventId);
    expect(stats.total).toBe(seeded.length);
    expect(stats.completed).toBe(0);
  });
});
