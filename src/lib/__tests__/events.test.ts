import path from 'path';
import fs from 'fs';
import os from 'os';

// Setup isolated test database before importing db or events
const testDbPath = path.join(os.tmpdir(), `test-events-${Date.now()}-${Math.random().toString(36).slice(2)}.db`);
process.env.DATABASE_PATH = testDbPath;

import { getDb, closeDb } from '../db';
import { getEvents, getEventById, createEvent, updateEvent, deleteEvent } from '../events';

describe('Events Service Layer', () => {
  beforeAll(() => {
    // initialize db schema
    getDb();
  });

  afterAll(() => {
    closeDb();
    try {
      if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
      const walPath = `${testDbPath}-wal`;
      const shmPath = `${testDbPath}-shm`;
      if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
      if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
    } catch {
      // ignore test cleanup errors
    }
  });

  beforeEach(() => {
    const db = getDb();
    db.prepare('DELETE FROM events').run();
  });

  it('creates an event with budget in cents and retrieves it', () => {
    const created = createEvent({
      name: 'Maya & Liam Wedding',
      event_type: 'wedding',
      event_date: '2027-09-18',
      guest_count: 140,
      total_budget: 25000, // $25,000
      description: 'Outdoor ceremony followed by reception',
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe('Maya & Liam Wedding');
    expect(created.event_type).toBe('wedding');
    expect(created.total_budget).toBe(2500000); // 25,000 * 100 cents

    const fetched = getEventById(created.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.name).toBe('Maya & Liam Wedding');
    expect(fetched?.guest_count).toBe(140);
    expect(fetched?.milestones_count).toBe(0);
    expect(fetched?.vendors_count).toBe(0);
  });

  it('lists events and respects type filtering', () => {
    createEvent({
      name: 'Wedding 1',
      event_type: 'wedding',
      event_date: '2027-06-01',
      guest_count: 100,
      total_budget: 10000,
      description: '',
    });

    createEvent({
      name: 'Birthday Bash',
      event_type: 'birthday',
      event_date: '2027-04-10',
      guest_count: 30,
      total_budget: 1500,
      description: '',
    });

    createEvent({
      name: 'Community Clean-up Day',
      event_type: 'community',
      event_date: '2027-05-15',
      guest_count: 200,
      total_budget: 3000,
      description: '',
    });

    const allEvents = getEvents();
    expect(allEvents).toHaveLength(3);
    // Ordered by event_date ASC: Birthday (April), Community (May), Wedding (June)
    expect(allEvents[0].event_type).toBe('birthday');
    expect(allEvents[1].event_type).toBe('community');
    expect(allEvents[2].event_type).toBe('wedding');

    const weddingsOnly = getEvents({ type: 'wedding' });
    expect(weddingsOnly).toHaveLength(1);
    expect(weddingsOnly[0].name).toBe('Wedding 1');

    const birthdaysOnly = getEvents({ type: 'birthday' });
    expect(birthdaysOnly).toHaveLength(1);
    expect(birthdaysOnly[0].name).toBe('Birthday Bash');
  });

  it('updates an event and preserves non-updated fields', () => {
    const created = createEvent({
      name: 'Original Event',
      event_type: 'other',
      event_date: '2027-08-01',
      guest_count: 50,
      total_budget: 5000,
      description: 'Original note',
    });

    const updated = updateEvent(created.id, {
      name: 'Updated Event Title',
      total_budget: 7500,
    });

    expect(updated).not.toBeNull();
    expect(updated?.name).toBe('Updated Event Title');
    expect(updated?.total_budget).toBe(750000); // $7,500 in cents
    expect(updated?.event_type).toBe('other');
    expect(updated?.guest_count).toBe(50);
    expect(updated?.description).toBe('Original note');
  });

  it('returns null when updating non-existent event', () => {
    const updated = updateEvent(99999, { name: 'Ghost' });
    expect(updated).toBeNull();
  });

  it('deletes an event and cascades to related records', () => {
    const created = createEvent({
      name: 'Event to Delete',
      event_type: 'birthday',
      event_date: '2027-11-11',
      guest_count: 20,
      total_budget: 800,
      description: '',
    });

    const db = getDb();
    // Add a child milestone to verify foreign key cascade
    db.prepare('INSERT INTO milestones (event_id, title, due_date) VALUES (?, ?, ?)').run(
      created.id,
      'Order cake',
      '2027-11-01'
    );

    const deleted = deleteEvent(created.id);
    expect(deleted).toBe(true);

    expect(getEventById(created.id)).toBeNull();

    // Verify milestone was cascaded
    const remainingMilestones = db
      .prepare('SELECT * FROM milestones WHERE event_id = ?')
      .all(created.id);
    expect(remainingMilestones).toHaveLength(0);
  });

  it('returns false when deleting a non-existent event', () => {
    const result = deleteEvent(88888);
    expect(result).toBe(false);
  });
});
