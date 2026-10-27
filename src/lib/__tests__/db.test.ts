/**
 * Smoke and unit tests for the MongoDB database layer.
 * Validates connection initialization, atomic sequence generation,
 * CRUD operations, and utility helpers.
 */

import { getDb, getNextSequence, clearDatabase, closeDb, toCents, fromCents, nowIso } from '../db';

describe('MongoDB Database Layer', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDb();
  });

  describe('Database Connection & Collections', () => {
    it('initializes db and accesses collections', async () => {
      const db = await getDb();
      expect(db).toBeDefined();

      const eventsCollection = db.collection('events');
      expect(eventsCollection).toBeDefined();

      const doc = {
        id: 1,
        name: 'Grand Celebration',
        event_type: 'wedding',
        event_date: '2027-09-20',
        guest_count: 100,
        total_budget: 1500000,
        description: 'Test celebration',
        created_at: nowIso(),
        updated_at: nowIso(),
      };

      await eventsCollection.insertOne(doc);

      const found = await eventsCollection.findOne({ id: 1 });
      expect(found).not.toBeNull();
      expect(found?.name).toBe('Grand Celebration');
    });

    it('generates atomic sequential IDs via getNextSequence', async () => {
      const id1 = await getNextSequence('events');
      const id2 = await getNextSequence('events');
      const id3 = await getNextSequence('events');

      expect(id1).toBe(1);
      expect(id2).toBe(2);
      expect(id3).toBe(3);

      const budgetId1 = await getNextSequence('budget_categories');
      expect(budgetId1).toBe(1);
    });

    it('clears all collections on clearDatabase', async () => {
      const db = await getDb();
      await db.collection('events').insertOne({ id: 99, name: 'Sample' });
      await db.collection('vendors').insertOne({ id: 101, name: 'Baker' });

      await clearDatabase();

      const countEvents = await db.collection('events').countDocuments();
      const countVendors = await db.collection('vendors').countDocuments();

      expect(countEvents).toBe(0);
      expect(countVendors).toBe(0);
    });
  });

  describe('Utility functions', () => {
    it('toCents converts dollars to integer cents correctly', () => {
      expect(toCents(15000)).toBe(1500000);
      expect(toCents(99.99)).toBe(9999);
      expect(toCents(0)).toBe(0);
      // Floating point edge case: 0.1 + 0.2 = 0.30000000000000004
      expect(toCents(0.1 + 0.2)).toBe(30);
    });

    it('fromCents converts cents to dollars', () => {
      expect(fromCents(1500000)).toBe(15000);
      expect(fromCents(9999)).toBe(99.99);
      expect(fromCents(0)).toBe(0);
    });

    it('nowIso produces valid ISO 8601 timestamps', () => {
      const iso = nowIso();
      expect(typeof iso).toBe('string');
      expect(new Date(iso).toISOString()).toBe(iso);
    });
  });
});
