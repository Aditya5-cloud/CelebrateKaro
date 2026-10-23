import path from 'path';
import fs from 'fs';
import os from 'os';

const testDbPath = path.join(os.tmpdir(), `test-checklist-${Date.now()}-${Math.random().toString(36).slice(2)}.db`);
process.env.DATABASE_PATH = testDbPath;

import { getDb, closeDb } from '../db';
import { createEvent } from '../events';
import {
  getChecklistItems,
  getChecklistItemById,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  saveGeneratedChecklist,
  getChecklistStats,
} from '../checklist';

describe('Checklist Service Layer', () => {
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
    db.prepare('DELETE FROM checklist_items').run();

    const event = createEvent({
      name: 'Maya 30th Birthday Bash',
      event_type: 'birthday',
      event_date: '2027-11-20',
      guest_count: 60,
      total_budget: 5000,
      description: 'Retro 80s arcade party',
    });
    eventId = event.id;
  });

  it('creates and retrieves checklist items', () => {
    const item = createChecklistItem(eventId, {
      task: 'Rent retro arcade machines',
      category: 'entertainment',
      completed: false,
      ai_generated: false,
    });

    expect(item.id).toBeDefined();
    expect(item.task).toBe('Rent retro arcade machines');
    expect(item.category).toBe('entertainment');
    expect(item.completed).toBe(false);
    expect(item.ai_generated).toBe(false);

    const fetched = getChecklistItemById(item.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.task).toBe('Rent retro arcade machines');

    const list = getChecklistItems(eventId);
    expect(list).toHaveLength(1);
  });

  it('updates task completion status and content', () => {
    const item = createChecklistItem(eventId, {
      task: 'Order 80s themed cake',
      category: 'catering',
      completed: false,
    });

    const updated = updateChecklistItem(item.id, {
      completed: true,
      task: 'Order 80s Pac-Man themed cake (Ordered from Sugar Bakery)',
    });

    expect(updated).not.toBeNull();
    expect(updated?.completed).toBe(true);
    expect(updated?.task).toContain('Pac-Man');
  });

  it('deletes a checklist item', () => {
    const item = createChecklistItem(eventId, {
      task: 'Temporary item',
      category: 'general',
    });

    expect(deleteChecklistItem(item.id)).toBe(true);
    expect(getChecklistItemById(item.id)).toBeNull();
  });

  it('calculates comprehensive completion and AI metrics', () => {
    createChecklistItem(eventId, {
      task: 'Task 1 (Manual, Done)',
      category: 'general',
      completed: true,
      ai_generated: false,
    });
    createChecklistItem(eventId, {
      task: 'Task 2 (AI, Done)',
      category: 'catering',
      completed: true,
      ai_generated: true,
    });
    createChecklistItem(eventId, {
      task: 'Task 3 (AI, Pending)',
      category: 'decor',
      completed: false,
      ai_generated: true,
    });
    createChecklistItem(eventId, {
      task: 'Task 4 (Manual, Pending)',
      category: 'music',
      completed: false,
      ai_generated: false,
    });

    const stats = getChecklistStats(eventId);
    expect(stats.total).toBe(4);
    expect(stats.completed).toBe(2);
    expect(stats.pending).toBe(2);
    expect(stats.aiGeneratedCount).toBe(2);
    expect(stats.percentCompleted).toBe(50); // 2/4 = 50%
  });

  it('saves batch AI-generated checklist items with append and replace options', () => {
    // Initial batch
    const initialTasks = [
      { task: 'Initial Task A', category: 'venue', sort_order: 1 },
      { task: 'Initial Task B', category: 'music', sort_order: 2 },
    ];
    saveGeneratedChecklist(eventId, initialTasks, false);
    expect(getChecklistItems(eventId)).toHaveLength(2);

    // Append new batch
    const additionalTasks = [
      { task: 'Additional Task C', category: 'catering', sort_order: 1 },
    ];
    saveGeneratedChecklist(eventId, additionalTasks, false);
    expect(getChecklistItems(eventId)).toHaveLength(3);

    // Replace with fresh checklist
    const freshTasks = [
      { task: 'Fresh AI Task 1', category: 'general', sort_order: 1 },
      { task: 'Fresh AI Task 2', category: 'decor', sort_order: 2 },
    ];
    const replaced = saveGeneratedChecklist(eventId, freshTasks, true);
    expect(replaced).toHaveLength(2);
    expect(replaced[0].task).toBe('Fresh AI Task 1');
  });
});
