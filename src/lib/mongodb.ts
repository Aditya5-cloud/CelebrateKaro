/**
 * MongoDB Atlas Connection and Database Singleton.
 *
 * This module is SERVER-ONLY. It must never be imported from client components.
 *
 * Configuration:
 * - MONGODB_URI: The MongoDB Atlas connection string (e.g. mongodb+srv://user:pass@cluster.mongodb.net/eventplanner?retryWrites=true&w=majority)
 * - MONGODB_DB_NAME: Optional database name override (defaults to database in URI, or 'eventplanner')
 *
 * If MONGODB_URI is not set (e.g. in test suites or offline local development),
 * a fully functional in-memory database adapter is utilized so that the application
 * and test suite execute without external cloud dependencies.
 */

import { MongoClient, Db } from 'mongodb';

export const DEFAULT_DB_NAME = process.env.MONGODB_DB_NAME || 'eventplanner';

// ─── Global State for Connection Pooling ─────────────────────────────────────

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _mongoMemoryDb: InMemoryDb | undefined;
  var _mongoIndexesInitialized: boolean | undefined;
}

// ─── Production MongoDB Atlas Connection ──────────────────────────────────────

let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> | null {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
    return null;
  }

  if (!global._mongoClientPromise) {
    try {
      const client = new MongoClient(uri, {
        maxPoolSize: 10,
        minPoolSize: 1,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      // Attach catch handler to prevent unhandled rejection and reset global state on failure
      const p = client.connect().catch((err) => {
        console.warn('[MongoDB Atlas] Connection attempt failed:', err?.message || err);
        global._mongoClientPromise = undefined;
        throw err;
      });
      global._mongoClientPromise = p;
    } catch (err) {
      console.warn('[MongoDB Atlas] Client creation error:', err);
      global._mongoClientPromise = undefined;
      return null;
    }
  }
  return global._mongoClientPromise;
}

/**
 * Initialize indexes for all collections in MongoDB Atlas.
 */
async function initIndexes(db: Db): Promise<void> {
  if (global._mongoIndexesInitialized) return;
  global._mongoIndexesInitialized = true;
  try {
    await Promise.all([
      db.collection('users').createIndex({ id: 1 }, { unique: true }),
      db.collection('users').createIndex({ email: 1 }, { unique: true }),
      db.collection('events').createIndex({ id: 1 }, { unique: true }),
      db.collection('events').createIndex({ user_id: 1, event_date: 1 }),
      db.collection('events').createIndex({ event_date: 1, created_at: -1 }),
      db.collection('budget_categories').createIndex({ id: 1 }, { unique: true }),
      db.collection('budget_categories').createIndex({ event_id: 1, planned_amount: -1 }),
      db.collection('milestones').createIndex({ id: 1 }, { unique: true }),
      db.collection('milestones').createIndex({ event_id: 1, due_date: 1 }),
      db.collection('vendors').createIndex({ id: 1 }, { unique: true }),
      db.collection('vendors').createIndex({ event_id: 1 }),
      db.collection('checklist_items').createIndex({ id: 1 }, { unique: true }),
      db.collection('checklist_items').createIndex({ event_id: 1, sort_order: 1 }),
      db.collection('chat_messages').createIndex({ id: 1 }, { unique: true }),
      db.collection('chat_messages').createIndex({ event_id: 1, created_at: 1 }),
    ]);
  } catch (err) {
    console.warn('[MongoDB] Index initialization notice:', err);
  }
}

// ─── In-Memory Database Fallback (for tests and offline development) ─────────

export type DocRecord = Record<string, unknown>;

class InMemoryCursor {
  private docs: DocRecord[];

  constructor(docs: DocRecord[]) {
    this.docs = [...docs];
  }

  sort(sortObj?: Record<string, number | 'asc' | 'desc'>): this {
    if (!sortObj) return this;
    const entries = Object.entries(sortObj);
    this.docs.sort((a, b) => {
      for (const [key, dir] of entries) {
        const isAsc = dir === 1 || dir === 'asc';
        const valA = a[key] as string | number | boolean | null | undefined;
        const valB = b[key] as string | number | boolean | null | undefined;
        if (valA === valB) continue;
        if (valA === undefined) return isAsc ? 1 : -1;
        if (valB === undefined) return isAsc ? -1 : 1;
        if (valA !== null && valB !== null && valA < valB) return isAsc ? -1 : 1;
        if (valA !== null && valB !== null && valA > valB) return isAsc ? 1 : -1;
      }
      return 0;
    });
    return this;
  }

  limit(n: number): this {
    if (n > 0) {
      this.docs = this.docs.slice(0, n);
    }
    return this;
  }

  skip(n: number): this {
    if (n > 0) {
      this.docs = this.docs.slice(n);
    }
    return this;
  }

  async toArray(): Promise<DocRecord[]> {
    return this.docs.map((d) => ({ ...d }));
  }
}

export class InMemoryCollection {
  private items: DocRecord[] = [];
  public name: string;

  constructor(name: string) {
    this.name = name;
  }

  private matches(doc: DocRecord, filter?: Record<string, unknown>): boolean {
    if (!filter || Object.keys(filter).length === 0) return true;
    for (const [key, val] of Object.entries(filter)) {
      if (key === '$or' && Array.isArray(val)) {
        const orMatches = val.some((subFilter) => this.matches(doc, subFilter));
        if (!orMatches) return false;
        continue;
      }
      if (val && typeof val === 'object' && '$in' in (val as Record<string, unknown>) && Array.isArray((val as { $in: unknown[] }).$in)) {
        if (!(val as { $in: unknown[] }).$in.includes(doc[key])) {
          return false;
        }
        continue;
      }
      if (doc[key] !== val) {
        return false;
      }
    }
    return true;
  }

  find(filter?: Record<string, unknown>): InMemoryCursor {
    const matched = this.items.filter((item) => this.matches(item, filter));
    return new InMemoryCursor(matched);
  }

  async findOne(filter?: Record<string, unknown>): Promise<DocRecord | null> {
    const matched = this.items.find((item) => this.matches(item, filter));
    return matched ? { ...matched } : null;
  }

  async insertOne(doc: DocRecord): Promise<{ insertedId: unknown; acknowledged: boolean }> {
    const copy = { ...doc };
    if (copy._id === undefined) {
      copy._id = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }
    this.items.push(copy);
    return { insertedId: copy._id, acknowledged: true };
  }

  async insertMany(docs: DocRecord[]): Promise<{ insertedCount: number; acknowledged: boolean }> {
    for (const doc of docs) {
      await this.insertOne(doc);
    }
    return { insertedCount: docs.length, acknowledged: true };
  }

  async updateOne(
    filter: Record<string, unknown>,
    update: { $set?: Record<string, unknown>; $inc?: Record<string, number> }
  ): Promise<{ matchedCount: number; modifiedCount: number; acknowledged: boolean }> {
    const item = this.items.find((doc) => this.matches(doc, filter));
    if (!item) return { matchedCount: 0, modifiedCount: 0, acknowledged: true };

    if (update.$set) {
      Object.assign(item, update.$set);
    }
    if (update.$inc) {
      for (const [key, incVal] of Object.entries(update.$inc)) {
        const currentVal = typeof item[key] === 'number' ? (item[key] as number) : 0;
        item[key] = currentVal + incVal;
      }
    }
    return { matchedCount: 1, modifiedCount: 1, acknowledged: true };
  }

  async updateMany(
    filter: Record<string, unknown>,
    update: { $set?: Record<string, unknown>; $inc?: Record<string, number> }
  ): Promise<{ matchedCount: number; modifiedCount: number; acknowledged: boolean }> {
    let count = 0;
    for (const item of this.items) {
      if (this.matches(item, filter)) {
        if (update.$set) Object.assign(item, update.$set);
        if (update.$inc) {
          for (const [key, incVal] of Object.entries(update.$inc)) {
            const currentVal = typeof item[key] === 'number' ? (item[key] as number) : 0;
            item[key] = currentVal + incVal;
          }
        }
        count++;
      }
    }
    return { matchedCount: count, modifiedCount: count, acknowledged: true };
  }

  async deleteOne(filter: Record<string, unknown>): Promise<{ deletedCount: number; acknowledged: boolean }> {
    const idx = this.items.findIndex((doc) => this.matches(doc, filter));
    if (idx === -1) return { deletedCount: 0, acknowledged: true };
    this.items.splice(idx, 1);
    return { deletedCount: 1, acknowledged: true };
  }

  async deleteMany(filter: Record<string, unknown>): Promise<{ deletedCount: number; acknowledged: boolean }> {
    const initialLen = this.items.length;
    this.items = this.items.filter((doc) => !this.matches(doc, filter));
    return { deletedCount: initialLen - this.items.length, acknowledged: true };
  }

  async countDocuments(filter?: Record<string, unknown>): Promise<number> {
    return this.items.filter((doc) => this.matches(doc, filter)).length;
  }

  async findOneAndUpdate(
    filter: Record<string, unknown>,
    update: { $set?: Record<string, unknown>; $inc?: Record<string, number> },
    options?: { upsert?: boolean; returnDocument?: 'before' | 'after' }
  ): Promise<DocRecord | null> {
    let item = this.items.find((doc) => this.matches(doc, filter));
    if (!item && options?.upsert) {
      item = { ...filter };
      this.items.push(item);
    }
    if (!item) return null;

    if (update.$set) {
      Object.assign(item, update.$set);
    }
    if (update.$inc) {
      for (const [key, incVal] of Object.entries(update.$inc)) {
        const currentVal = typeof item[key] === 'number' ? (item[key] as number) : 0;
        item[key] = currentVal + incVal;
      }
    }
    return { ...item };
  }

  async createIndex(): Promise<string> {
    return 'idx_ok';
  }

  async drop(): Promise<void> {
    this.items = [];
  }
}

export class InMemoryDb {
  private collections: Map<string, InMemoryCollection> = new Map();

  collection(name: string): InMemoryCollection {
    if (!this.collections.has(name)) {
      this.collections.set(name, new InMemoryCollection(name));
    }
    return this.collections.get(name)!;
  }

  async dropDatabase(): Promise<void> {
    this.collections.clear();
  }
}

function getMemoryDb(): InMemoryDb {
  if (!global._mongoMemoryDb) {
    global._mongoMemoryDb = new InMemoryDb();
  }
  return global._mongoMemoryDb;
}

// ─── Primary API ─────────────────────────────────────────────────────────────

/**
 * Obtain the database connection instance.
 * Connects to MongoDB Atlas if MONGODB_URI is configured; otherwise uses memory fallback.
 */
export async function getDb(): Promise<Db> {
  const promise = getClientPromise();
  if (promise) {
    try {
      const client = await promise;
      const db = client.db(DEFAULT_DB_NAME);
      if (!global._mongoIndexesInitialized) {
        await initIndexes(db);
      }
      return db;
    } catch (err) {
      console.warn(
        '[MongoDB Atlas] Connection unavailable, falling back to memory database:',
        err instanceof Error ? err.message : err
      );
      global._mongoClientPromise = undefined;
      return getMemoryDb() as unknown as Db;
    }
  }
  return getMemoryDb() as unknown as Db;
}

/**
 * Obtain next auto-increment sequence ID for a given collection.
 * Uses atomic findOneAndUpdate in the 'counters' collection.
 */
export async function getNextSequence(name: string): Promise<number> {
  try {
    const db = await getDb();
    const counterColl = db.collection<{ _id: string; seq: number }>('counters');
    const res = await counterColl.findOneAndUpdate(
      { _id: name },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
    return res?.seq ?? 1;
  } catch (err) {
    console.warn('[MongoDB Atlas] getNextSequence fallback:', err);
    return Date.now();
  }
}

/**
 * Close database connection (for tests or graceful shutdown).
 */
export async function closeDb(): Promise<void> {
  if (clientPromise) {
    const client = await clientPromise;
    await client.close();
    clientPromise = null;
  }
  if (global._mongoClientPromise) {
    const client = await global._mongoClientPromise;
    await client.close();
    global._mongoClientPromise = undefined;
  }
  global._mongoIndexesInitialized = false;
}

/**
 * Clear all data from the database (useful for isolated unit testing).
 */
export async function clearDatabase(): Promise<void> {
  const db = await getDb();
  const collections = [
    'events',
    'budget_categories',
    'milestones',
    'vendors',
    'checklist_items',
    'chat_messages',
    'counters',
  ];
  await Promise.all(
    collections.map(async (name) => {
      try {
        await db.collection(name).deleteMany({});
      } catch {
        // ignore if collection does not exist
      }
    })
  );
}

/**
 * Helper to get current UTC timestamp.
 */
export function nowIso(): string {
  return new Date().toISOString();
}

export { toCents, fromCents } from './currency';
