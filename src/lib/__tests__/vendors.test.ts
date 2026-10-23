import path from 'path';
import fs from 'fs';
import os from 'os';

const testDbPath = path.join(os.tmpdir(), `test-vendors-${Date.now()}-${Math.random().toString(36).slice(2)}.db`);
process.env.DATABASE_PATH = testDbPath;

import { getDb, closeDb } from '../db';
import { createEvent } from '../events';
import {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  getVendorStats,
  seedVendorTemplate,
} from '../vendors';

describe('Vendors Service Layer', () => {
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
    db.prepare('DELETE FROM vendors').run();

    const event = createEvent({
      name: 'Sarah & Alex Summer Wedding',
      event_type: 'wedding',
      event_date: '2027-06-18',
      guest_count: 150,
      total_budget: 35000,
      description: 'Elegant outdoor garden ceremony',
    });
    eventId = event.id;
  });

  it('creates and retrieves vendors with price quotes in cents', () => {
    const created = createVendor(eventId, {
      name: 'Bloom & Petal Florals',
      category: 'florist',
      status: 'considering',
      contact_name: 'Jessica Daisy',
      contact_email: 'jessica@bloomandpetal.com',
      contact_phone: '555-0192',
      price_quote: 2450.5,
      notes: 'Includes ceremony arch and 15 table centerpieces',
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe('Bloom & Petal Florals');
    expect(created.category).toBe('florist');
    expect(created.status).toBe('considering');
    expect(created.contact_name).toBe('Jessica Daisy');
    expect(created.contact_email).toBe('jessica@bloomandpetal.com');
    expect(created.contact_phone).toBe('555-0192');
    expect(created.price_quote).toBe(245050); // in integer cents

    const fetched = getVendorById(created.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.name).toBe('Bloom & Petal Florals');
    expect(fetched?.price_quote).toBe(245050);

    const list = getVendors(eventId);
    expect(list).toHaveLength(1);
  });

  it('filters vendors by status and category', () => {
    createVendor(eventId, {
      name: 'Grand Ballroom Plaza',
      category: 'venue',
      status: 'booked',
      price_quote: 8000,
    });
    createVendor(eventId, {
      name: 'Sunset Manor Garden',
      category: 'venue',
      status: 'considering',
      price_quote: 6500,
    });
    createVendor(eventId, {
      name: 'DJ Pulse Sound',
      category: 'music',
      status: 'contacted',
      price_quote: 1200,
    });

    const venueVendors = getVendors(eventId, { category: 'venue' });
    expect(venueVendors).toHaveLength(2);

    const bookedVendors = getVendors(eventId, { status: 'booked' });
    expect(bookedVendors).toHaveLength(1);
    expect(bookedVendors[0].name).toBe('Grand Ballroom Plaza');

    const musicConsidering = getVendors(eventId, { category: 'music', status: 'considering' });
    expect(musicConsidering).toHaveLength(0);
  });

  it('updates vendor information and status', () => {
    const vendor = createVendor(eventId, {
      name: 'Gourmet Catering Co',
      category: 'catering',
      status: 'contacted',
      price_quote: 5000,
    });

    const updated = updateVendor(vendor.id, {
      status: 'booked',
      price_quote: 4800,
      notes: 'Signed contract with 10% seasonal discount.',
    });

    expect(updated).not.toBeNull();
    expect(updated?.status).toBe('booked');
    expect(updated?.price_quote).toBe(480000); // 4800 in cents
    expect(updated?.notes).toContain('Signed contract');
  });

  it('deletes a vendor', () => {
    const vendor = createVendor(eventId, {
      name: 'Sample Vendor',
      category: 'other',
      status: 'considering',
    });

    expect(deleteVendor(vendor.id)).toBe(true);
    expect(getVendorById(vendor.id)).toBeNull();
  });

  it('computes accurate vendor statistics including financial totals', () => {
    createVendor(eventId, {
      name: 'Venue Plaza',
      category: 'venue',
      status: 'booked',
      price_quote: 10000,
    });
    createVendor(eventId, {
      name: 'Live Band',
      category: 'music',
      status: 'paid',
      price_quote: 2500,
    });
    createVendor(eventId, {
      name: 'Baker Dreams',
      category: 'bakery',
      status: 'contacted',
      price_quote: 800,
    });
    createVendor(eventId, {
      name: 'Ice Sculpture Co',
      category: 'decoration',
      status: 'considering',
      price_quote: 500,
    });
    createVendor(eventId, {
      name: 'Cancelled Service',
      category: 'other',
      status: 'cancelled',
      price_quote: 1000, // should not be counted in active quotes
    });

    const stats = getVendorStats(eventId);
    expect(stats.total).toBe(5);
    expect(stats.booked).toBe(1);
    expect(stats.paid).toBe(1);
    expect(stats.contacted).toBe(1);
    expect(stats.considering).toBe(1);
    expect(stats.cancelled).toBe(1);

    // active quotes = 10000 + 2500 + 800 + 500 = 13800 * 100 = 1380000 cents
    expect(stats.totalQuotes).toBe(1380000);

    // percent booked or paid = (1 + 1) / 5 = 40%
    expect(stats.percentBookedOrPaid).toBe(40);
  });

  it('seeds standard vendor checklist tailored to wedding event', () => {
    const seeded = seedVendorTemplate(eventId, 'wedding');
    expect(seeded.length).toBeGreaterThanOrEqual(6);

    const categories = seeded.map((v) => v.category);
    expect(categories).toContain('venue');
    expect(categories).toContain('catering');
    expect(categories).toContain('photography');
    expect(categories).toContain('music');

    const stats = getVendorStats(eventId);
    expect(stats.total).toBe(seeded.length);
    expect(stats.considering).toBe(seeded.length);
  });
});
