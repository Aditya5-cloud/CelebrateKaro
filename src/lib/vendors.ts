import { getDb, getNextSequence, nowIso } from './db';
import { toCents } from './currency';
import type { Vendor, VendorStatus, EventType } from '@/types';
import type { CreateVendorSchemaInput, UpdateVendorSchemaInput } from './validations/vendor';

export interface VendorStats {
  total: number;
  considering: number;
  contacted: number;
  booked: number;
  paid: number;
  cancelled: number;
  totalQuotes: number; // in cents
  percentBookedOrPaid: number;
}

const STATUS_ORDER: Record<VendorStatus, number> = {
  booked: 1,
  paid: 2,
  contacted: 3,
  considering: 4,
  cancelled: 5,
};

export async function getVendors(
  eventId: number,
  filter?: { status?: VendorStatus; category?: string }
): Promise<Vendor[]> {
  const db = await getDb();
  const query: Record<string, unknown> = { event_id: eventId };

  if (filter?.status) {
    query.status = filter.status;
  }
  if (filter?.category) {
    query.category = filter.category;
  }

  const vendors: Vendor[] = await db.collection('vendors').find(query).toArray();

  return vendors.sort((a, b) => {
    const orderA = STATUS_ORDER[a.status] || 6;
    const orderB = STATUS_ORDER[b.status] || 6;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name);
  });
}

export async function getVendorById(id: number): Promise<Vendor | null> {
  const db = await getDb();
  const row = await db.collection('vendors').findOne({ id });
  return (row as Vendor) ?? null;
}

export async function createVendor(
  eventId: number,
  input: CreateVendorSchemaInput
): Promise<Vendor> {
  const db = await getDb();
  const id = await getNextSequence('vendors');
  const quoteCents = toCents(Number(input.price_quote) || 0);
  const now = nowIso();

  const doc: Vendor = {
    id,
    event_id: eventId,
    name: input.name.trim(),
    category: (input.category || 'other').trim(),
    status: input.status || 'considering',
    contact_name: (input.contact_name ?? '').trim(),
    contact_email: (input.contact_email ?? '').trim(),
    contact_phone: (input.contact_phone ?? '').trim(),
    price_quote: quoteCents,
    notes: (input.notes ?? '').trim(),
    created_at: now,
    updated_at: now,
  };

  await db.collection('vendors').insertOne(doc);
  return doc;
}

export async function updateVendor(
  id: number,
  input: UpdateVendorSchemaInput
): Promise<Vendor | null> {
  const db = await getDb();
  const existing = await getVendorById(id);
  if (!existing) return null;

  const updates: Record<string, unknown> = {};

  if (input.name !== undefined) {
    updates.name = input.name.trim();
  }
  if (input.category !== undefined) {
    updates.category = input.category.trim();
  }
  if (input.status !== undefined) {
    updates.status = input.status;
  }
  if (input.contact_name !== undefined) {
    updates.contact_name = input.contact_name.trim();
  }
  if (input.contact_email !== undefined) {
    updates.contact_email = input.contact_email.trim();
  }
  if (input.contact_phone !== undefined) {
    updates.contact_phone = input.contact_phone.trim();
  }
  if (input.price_quote !== undefined) {
    updates.price_quote = toCents(Number(input.price_quote) || 0);
  }
  if (input.notes !== undefined) {
    updates.notes = input.notes.trim();
  }

  if (Object.keys(updates).length === 0) return existing;

  updates.updated_at = nowIso();

  await db.collection('vendors').updateOne({ id }, { $set: updates });
  return getVendorById(id);
}

export async function deleteVendor(id: number): Promise<boolean> {
  const db = await getDb();
  const result = await db.collection('vendors').deleteOne({ id });
  return Boolean(result && result.deletedCount > 0);
}

export async function getVendorStats(eventId: number): Promise<VendorStats> {
  const vendors = await getVendors(eventId);

  let considering = 0;
  let contacted = 0;
  let booked = 0;
  let paid = 0;
  let cancelled = 0;
  let totalQuotes = 0;

  for (const v of vendors) {
    if (v.status === 'considering') considering++;
    else if (v.status === 'contacted') contacted++;
    else if (v.status === 'booked') booked++;
    else if (v.status === 'paid') paid++;
    else if (v.status === 'cancelled') cancelled++;

    if (v.status !== 'cancelled') {
      totalQuotes += v.price_quote || 0;
    }
  }

  const total = vendors.length;
  const bookedOrPaid = booked + paid;
  const percentBookedOrPaid = total > 0 ? Math.round((bookedOrPaid / total) * 100) : 0;

  return {
    total,
    considering,
    contacted,
    booked,
    paid,
    cancelled,
    totalQuotes,
    percentBookedOrPaid,
  };
}

/**
 * Seed a comprehensive vendor checklist tailored to the event type.
 */
export async function seedVendorTemplate(eventId: number, eventType: EventType): Promise<Vendor[]> {
  const db = await getDb();

  interface TemplateVendor {
    name: string;
    category: string;
    notes: string;
  }

  const templates: Record<EventType, TemplateVendor[]> = {
    wedding: [
      {
        name: 'Ceremony & Reception Venue',
        category: 'venue',
        notes: 'Inquire on guest capacity, curfew, liquor license, and setup access.',
      },
      {
        name: 'Wedding Caterer & Bar Service',
        category: 'catering',
        notes: 'Request tasting session, dietary menu options, and staff ratios.',
      },
      {
        name: 'Wedding Photographer & Videographer',
        category: 'photography',
        notes: 'Check style portfolio, package hours, and turnaround time for album.',
      },
      {
        name: 'DJ & Live Music Entertainment',
        category: 'music',
        notes: 'Review audio equipment, microphone for vows, and custom do-not-play list.',
      },
      {
        name: 'Floral Designer & Centerpieces',
        category: 'florist',
        notes: 'Bouquets, boutonnieres, ceremony arch, and table runners.',
      },
      {
        name: 'Wedding Cake Designer / Bakery',
        category: 'bakery',
        notes: 'Tasting box, tiered design, delivery and temperature storage logistics.',
      },
      {
        name: 'Wedding Officiant',
        category: 'officiant',
        notes: 'Personalized ceremony vows, legal marriage license filing.',
      },
      {
        name: 'Guest Shuttle & Limousine',
        category: 'transportation',
        notes: 'Shuttle between hotel and venue for out-of-town guests.',
      },
    ],
    birthday: [
      {
        name: 'Party Venue or Private Room',
        category: 'venue',
        notes: 'Verify availability, cleanup rules, and music volume limits.',
      },
      {
        name: 'Themed Birthday Cake Bakery',
        category: 'bakery',
        notes: 'Custom themed cake or cupcakes with flavor choice.',
      },
      {
        name: 'Food Truck or Catering Service',
        category: 'catering',
        notes: 'Finger foods, buffet trays, or taco/pizza catering.',
      },
      {
        name: 'DJ or Party Entertainer',
        category: 'music',
        notes: 'Live DJ, acoustic artist, magician, or children’s entertainer.',
      },
      {
        name: 'Balloon Decorator & Photo Backdrop',
        category: 'decoration',
        notes: 'Organic balloon arch, marquee numbers, and selfie station backdrop.',
      },
    ],
    community: [
      {
        name: 'Tent, Canopy & Staging Rentals',
        category: 'venue',
        notes: 'Weather cover, tables, chairs, staging, and trash cans.',
      },
      {
        name: 'PA Audio System & Sound Engineer',
        category: 'music',
        notes: 'Wireless microphones for speakers, speakers for field coverage, generator.',
      },
      {
        name: 'Food Trucks & Refreshment Stalls',
        category: 'catering',
        notes: 'Coordinate truck permits, electrical needs, and diverse cuisine offerings.',
      },
      {
        name: 'Event Security & Medical First Aid',
        category: 'other',
        notes: 'First aid tent, licensed security personnel, emergency exit plans.',
      },
      {
        name: 'Portable Restrooms & Handwash Stations',
        category: 'other',
        notes: 'ADA compliant units, servicing schedule during the event.',
      },
      {
        name: 'Event Photographer',
        category: 'photography',
        notes: 'Document community participation for social recap and local press.',
      },
    ],
    other: [
      {
        name: 'Venue & Space Provider',
        category: 'venue',
        notes: 'Space rental, furniture layout, and accessibility.',
      },
      {
        name: 'Catering & Beverages',
        category: 'catering',
        notes: 'Food selections and beverage bar.',
      },
      {
        name: 'Audio & Music Entertainment',
        category: 'music',
        notes: 'Sound system, background music, or performers.',
      },
      {
        name: 'Decorations & Signage',
        category: 'decoration',
        notes: 'Welcome signage and festive decor.',
      },
    ],
  };

  const list = templates[eventType] || templates.other;
  const now = nowIso();

  // Clear existing vendors if generating fresh checklist
  await db.collection('vendors').deleteMany({ event_id: eventId });

  const docs: Vendor[] = [];
  for (const item of list) {
    const id = await getNextSequence('vendors');
    docs.push({
      id,
      event_id: eventId,
      name: item.name,
      category: item.category,
      status: 'considering',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      price_quote: 0,
      notes: item.notes,
      created_at: now,
      updated_at: now,
    });
  }

  if (docs.length > 0) {
    await db.collection('vendors').insertMany(docs);
  }

  return getVendors(eventId);
}
