import { getDb, nowIso } from './db';
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

export function getVendors(
  eventId: number,
  filter?: { status?: VendorStatus; category?: string }
): Vendor[] {
  const db = getDb();
  let query = 'SELECT * FROM vendors WHERE event_id = ?';
  const params: unknown[] = [eventId];

  if (filter?.status) {
    query += ' AND status = ?';
    params.push(filter.status);
  }
  if (filter?.category) {
    query += ' AND category = ?';
    params.push(filter.category);
  }

  query += `
    ORDER BY 
      CASE status 
        WHEN 'booked' THEN 1 
        WHEN 'paid' THEN 2 
        WHEN 'contacted' THEN 3 
        WHEN 'considering' THEN 4 
        WHEN 'cancelled' THEN 5 
        ELSE 6 
      END,
      name ASC
  `;

  return db.prepare(query).all(...params) as Vendor[];
}

export function getVendorById(id: number): Vendor | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM vendors WHERE id = ?').get(id) as Vendor | undefined;
  return row ?? null;
}

export function createVendor(
  eventId: number,
  input: CreateVendorSchemaInput
): Vendor {
  const db = getDb();
  const quoteCents = toCents(Number(input.price_quote) || 0);
  const now = nowIso();

  const info = db.prepare(`
    INSERT INTO vendors (
      event_id, name, category, status, contact_name, contact_email, contact_phone, price_quote, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    eventId,
    input.name.trim(),
    (input.category || 'other').trim(),
    input.status || 'considering',
    (input.contact_name ?? '').trim(),
    (input.contact_email ?? '').trim(),
    (input.contact_phone ?? '').trim(),
    quoteCents,
    (input.notes ?? '').trim(),
    now,
    now
  );

  const rowId = Number(info.lastInsertRowid);
  return db.prepare('SELECT * FROM vendors WHERE id = ?').get(rowId) as Vendor;
}

export function updateVendor(
  id: number,
  input: UpdateVendorSchemaInput
): Vendor | null {
  const db = getDb();
  const existing = getVendorById(id);
  if (!existing) return null;

  const updates: string[] = [];
  const params: unknown[] = [];

  if (input.name !== undefined) {
    updates.push('name = ?');
    params.push(input.name.trim());
  }
  if (input.category !== undefined) {
    updates.push('category = ?');
    params.push(input.category.trim());
  }
  if (input.status !== undefined) {
    updates.push('status = ?');
    params.push(input.status);
  }
  if (input.contact_name !== undefined) {
    updates.push('contact_name = ?');
    params.push(input.contact_name.trim());
  }
  if (input.contact_email !== undefined) {
    updates.push('contact_email = ?');
    params.push(input.contact_email.trim());
  }
  if (input.contact_phone !== undefined) {
    updates.push('contact_phone = ?');
    params.push(input.contact_phone.trim());
  }
  if (input.price_quote !== undefined) {
    updates.push('price_quote = ?');
    params.push(toCents(Number(input.price_quote) || 0));
  }
  if (input.notes !== undefined) {
    updates.push('notes = ?');
    params.push(input.notes.trim());
  }

  if (updates.length === 0) return existing;

  updates.push('updated_at = ?');
  params.push(nowIso());
  params.push(id);

  db.prepare(`UPDATE vendors SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  return getVendorById(id);
}

export function deleteVendor(id: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM vendors WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getVendorStats(eventId: number): VendorStats {
  const db = getDb();

  const counts = db.prepare(`
    SELECT
      COUNT(*) AS total,
      COALESCE(SUM(CASE WHEN status = 'considering' THEN 1 ELSE 0 END), 0) AS considering,
      COALESCE(SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END), 0) AS contacted,
      COALESCE(SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END), 0) AS booked,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END), 0) AS paid,
      COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) AS cancelled,
      COALESCE(SUM(CASE WHEN status != 'cancelled' THEN price_quote ELSE 0 END), 0) AS total_quotes
    FROM vendors
    WHERE event_id = ?
  `).get(eventId) as {
    total: number;
    considering: number;
    contacted: number;
    booked: number;
    paid: number;
    cancelled: number;
    total_quotes: number;
  };

  const bookedOrPaid = counts.booked + counts.paid;
  const percentBookedOrPaid = counts.total > 0 ? Math.round((bookedOrPaid / counts.total) * 100) : 0;

  return {
    total: counts.total,
    considering: counts.considering,
    contacted: counts.contacted,
    booked: counts.booked,
    paid: counts.paid,
    cancelled: counts.cancelled,
    totalQuotes: counts.total_quotes,
    percentBookedOrPaid,
  };
}

/**
 * Seed a comprehensive vendor checklist tailored to the event type.
 */
export function seedVendorTemplate(eventId: number, eventType: EventType): Vendor[] {
  const db = getDb();

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
  db.prepare('DELETE FROM vendors WHERE event_id = ?').run(eventId);

  const insertStmt = db.prepare(`
    INSERT INTO vendors (
      event_id, name, category, status, contact_name, contact_email, contact_phone, price_quote, notes, created_at, updated_at
    ) VALUES (?, ?, ?, 'considering', '', '', '', 0, ?, ?, ?)
  `);

  const insertTransaction = db.transaction(() => {
    for (const item of list) {
      insertStmt.run(eventId, item.name, item.category, item.notes, now, now);
    }
  });

  insertTransaction();

  return getVendors(eventId);
}
