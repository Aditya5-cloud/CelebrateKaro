import { generateVendorEmail, getMockVendorEmail } from '../gemini';
import type { Event, Vendor } from '@/types';

describe('AI Vendor Email Drafter Service', () => {
  const originalKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  afterAll(() => {
    process.env.GEMINI_API_KEY = originalKey;
  });

  const mockEvent: Event = {
    id: 1,
    name: 'Olivia & Liam Summer Wedding',
    event_type: 'wedding',
    event_date: '2027-07-24',
    guest_count: 140,
    total_budget: 3500000,
    description: 'Outdoor vineyard wedding ceremony',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  const mockVendor: Vendor = {
    id: 101,
    event_id: 1,
    name: 'Gourmet Vineyard Catering',
    category: 'catering',
    status: 'considering',
    contact_name: 'Chef Antoine',
    contact_email: 'antoine@vineyardcatering.com',
    contact_phone: '555-4321',
    price_quote: 650000,
    notes: 'Inquired about vegan and gluten-free alternatives',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  it('generates an availability inquiry email draft', async () => {
    const draft = await generateVendorEmail(mockEvent, mockVendor, {
      emailType: 'inquiry',
      tone: 'warm',
    });

    expect(draft.isMock).toBe(true);
    expect(draft.subject).toContain('Inquiry: Availability');
    expect(draft.subject).toContain('Olivia & Liam Summer Wedding');
    expect(draft.body).toContain('Chef Antoine');
    expect(draft.body).toContain('140 guests');
    expect(draft.body).toContain('2027-07-24');
  });

  it('generates an RFQ pricing quote request with questions', async () => {
    const draft = await generateVendorEmail(mockEvent, mockVendor, {
      emailType: 'quote',
      specificQuestions: 'Do you provide table linens, glassware, and cleanup staff?',
    });

    expect(draft.subject).toContain('RFQ / Price Quote Request');
    expect(draft.body).toContain('table linens');
    expect(draft.body).toContain('cleanup staff');
    expect(draft.body).toContain('itemized quote');
  });

  it('generates a tasting / tour consultation request', () => {
    const draft = getMockVendorEmail(mockEvent, mockVendor, {
      emailType: 'tasting_tour',
    });

    expect(draft.subject).toContain('Tasting');
    expect(draft.body).toContain('menu tasting session');
    expect(draft.body).toContain('Gourmet Vineyard Catering');
  });

  it('generates a polite budget negotiation request', () => {
    const draft = getMockVendorEmail(mockEvent, mockVendor, {
      emailType: 'negotiation',
      specificQuestions: 'Could we reduce bar service hours to save 10%?',
    });

    expect(draft.subject).toContain('Budget Alignment');
    expect(draft.body).toContain('₹6,500');
    expect(draft.body).toContain('reduce bar service hours');
  });
});
