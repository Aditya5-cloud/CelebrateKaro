import { clearDatabase, closeDb } from '../db';
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

  beforeEach(async () => {
    await clearDatabase();

    const event = await createEvent({
      name: 'Sarah & Alex Summer Wedding',
      event_type: 'wedding',
      event_date: '2027-06-18',
      guest_count: 150,
      total_budget: 35000,
      description: 'Elegant outdoor garden ceremony',
    });
    eventId = event.id;
  });

  afterAll(async () => {
    await closeDb();
  });

  it('creates and retrieves vendors with price quotes in cents', async () => {
    const created = await createVendor(eventId, {
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

    const fetched = await getVendorById(created.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.name).toBe('Bloom & Petal Florals');
    expect(fetched?.price_quote).toBe(245050);

    const list = await getVendors(eventId);
    expect(list).toHaveLength(1);
  });

  it('filters vendors by status and category', async () => {
    await createVendor(eventId, {
      name: 'Grand Ballroom Plaza',
      category: 'venue',
      status: 'booked',
      price_quote: 8000,
    });
    await createVendor(eventId, {
      name: 'Sunset Manor Garden',
      category: 'venue',
      status: 'considering',
      price_quote: 6500,
    });
    await createVendor(eventId, {
      name: 'DJ Pulse Sound',
      category: 'music',
      status: 'contacted',
      price_quote: 1200,
    });

    const venueVendors = await getVendors(eventId, { category: 'venue' });
    expect(venueVendors).toHaveLength(2);

    const bookedVendors = await getVendors(eventId, { status: 'booked' });
    expect(bookedVendors).toHaveLength(1);
    expect(bookedVendors[0].name).toBe('Grand Ballroom Plaza');

    const musicConsidering = await getVendors(eventId, { category: 'music', status: 'considering' });
    expect(musicConsidering).toHaveLength(0);
  });

  it('updates vendor information and status', async () => {
    const vendor = await createVendor(eventId, {
      name: 'Gourmet Catering Co',
      category: 'catering',
      status: 'contacted',
      price_quote: 5000,
    });

    const updated = await updateVendor(vendor.id, {
      status: 'booked',
      price_quote: 4800,
      notes: 'Signed contract with 10% seasonal discount.',
    });

    expect(updated).not.toBeNull();
    expect(updated?.status).toBe('booked');
    expect(updated?.price_quote).toBe(480000); // 4800 in cents
    expect(updated?.notes).toContain('Signed contract');
  });

  it('deletes a vendor', async () => {
    const vendor = await createVendor(eventId, {
      name: 'Sample Vendor',
      category: 'other',
      status: 'considering',
    });

    expect(await deleteVendor(vendor.id)).toBe(true);
    expect(await getVendorById(vendor.id)).toBeNull();
  });

  it('computes accurate vendor statistics including financial totals', async () => {
    await createVendor(eventId, {
      name: 'Venue Plaza',
      category: 'venue',
      status: 'booked',
      price_quote: 10000,
    });
    await createVendor(eventId, {
      name: 'Live Band',
      category: 'music',
      status: 'paid',
      price_quote: 2500,
    });
    await createVendor(eventId, {
      name: 'Baker Dreams',
      category: 'bakery',
      status: 'contacted',
      price_quote: 800,
    });
    await createVendor(eventId, {
      name: 'Ice Sculpture Co',
      category: 'decoration',
      status: 'considering',
      price_quote: 500,
    });
    await createVendor(eventId, {
      name: 'Cancelled Service',
      category: 'other',
      status: 'cancelled',
      price_quote: 1000, // should not be counted in active quotes
    });

    const stats = await getVendorStats(eventId);
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

  it('seeds standard vendor checklist tailored to wedding event', async () => {
    const seeded = await seedVendorTemplate(eventId, 'wedding');
    expect(seeded.length).toBeGreaterThanOrEqual(6);

    const categories = seeded.map((v) => v.category);
    expect(categories).toContain('venue');
    expect(categories).toContain('catering');
    expect(categories).toContain('photography');
    expect(categories).toContain('music');

    const stats = await getVendorStats(eventId);
    expect(stats.total).toBe(seeded.length);
    expect(stats.considering).toBe(seeded.length);
  });
});
