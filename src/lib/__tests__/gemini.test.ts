import { generatePersonalizedChecklist, getMockChecklist } from '../gemini';
import type { Event } from '@/types';

describe('Gemini Checklist Generation Service', () => {
  const originalKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  afterAll(() => {
    process.env.GEMINI_API_KEY = originalKey;
  });

  const sampleWedding: Event = {
    id: 1,
    name: 'Emma & Noah Seaside Nuptials',
    event_type: 'wedding',
    event_date: '2027-08-14',
    guest_count: 120,
    total_budget: 2500000,
    description: 'Beachfront ceremony with seafood dinner',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  const sampleCommunity: Event = {
    id: 2,
    name: 'Riverside Fall Carnival',
    event_type: 'community',
    event_date: '2027-10-05',
    guest_count: 500,
    total_budget: 1200000,
    description: 'Local neighborhood festival with live bands',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  it('generates domain fallback checklist when GEMINI_API_KEY is not configured', async () => {
    const result = await generatePersonalizedChecklist(sampleWedding);

    expect(result.isMock).toBe(true);
    expect(result.model).toBe('fallback-planner');
    expect(result.items.length).toBeGreaterThanOrEqual(8);

    const categories = result.items.map((i) => i.category);
    expect(categories).toContain('venue');
    expect(categories).toContain('catering');
    expect(categories).toContain('decor');
  });

  it('tailors recommendations specifically to event type', () => {
    const weddingItems = getMockChecklist(sampleWedding);
    const weddingText = weddingItems.map((i) => i.task.toLowerCase()).join(' ');
    expect(weddingText).toContain('marriage');
    expect(weddingText).toContain('reception');

    const communityItems = getMockChecklist(sampleCommunity);
    const communityText = communityItems.map((i) => i.task.toLowerCase()).join(' ');
    expect(communityText).toContain('permit');
    expect(communityText).toContain('volunteer');
  });

  it('includes custom focus requirements when specified', async () => {
    const focusRequirement = 'Strict vegan menu and zero-waste decor';
    const result = await generatePersonalizedChecklist(sampleWedding, focusRequirement);

    expect(result.items.length).toBeGreaterThanOrEqual(9);
    const hasFocus = result.items.some((i) => i.task.includes(focusRequirement));
    expect(hasFocus).toBe(true);
  });
});
