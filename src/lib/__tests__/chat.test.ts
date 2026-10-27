import { clearDatabase, closeDb } from '../db';
import { createEvent } from '../events';
import { createBudgetCategory } from '../budget';
import { createMilestone } from '../milestones';
import { createVendor } from '../vendors';
import {
  getChatMessages,
  saveChatMessage,
  clearChatHistory,
  buildEventContextSummary,
} from '../chat';

describe('Chat Service Layer & Grounding', () => {
  let eventId: number;

  beforeEach(async () => {
    await clearDatabase();

    const event = await createEvent({
      name: 'Autumn Harvest Gala',
      event_type: 'community',
      event_date: '2027-10-15',
      guest_count: 250,
      total_budget: 18000,
      description: 'Community outdoor festival with live music',
    });
    eventId = event.id;
  });

  afterAll(async () => {
    await closeDb();
  });

  it('saves and retrieves chat messages in chronological order', async () => {
    await saveChatMessage(eventId, 'user', 'Where can I reduce costs?');
    await saveChatMessage(eventId, 'assistant', 'Consider looking at your catering and decor budgets.');

    const messages = await getChatMessages(eventId);
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('user');
    expect(messages[0].content).toBe('Where can I reduce costs?');
    expect(messages[1].role).toBe('assistant');
    expect(messages[1].content).toContain('catering');
  });

  it('clears chat history for an event', async () => {
    await saveChatMessage(eventId, 'user', 'Hello');
    expect(await getChatMessages(eventId)).toHaveLength(1);

    await clearChatHistory(eventId);
    expect(await getChatMessages(eventId)).toHaveLength(0);
  });

  it('builds real-time event context summary with budget, timeline, and vendors', async () => {
    // Add budget category
    await createBudgetCategory(eventId, {
      name: 'venue',
      planned_amount: 5000,
      actual_amount: 4800,
      notes: 'Main pavilion rent',
    });

    // Add milestone
    await createMilestone(eventId, {
      title: 'Finalize Sound Permits',
      due_date: '2027-08-01',
      description: '',
      completed: false,
    });

    // Add vendor
    await createVendor(eventId, {
      name: 'City Tent Rentals',
      category: 'venue',
      status: 'booked',
      price_quote: 2500,
    });

    const summary = await buildEventContextSummary(eventId);

    // Verify context grounding
    expect(summary).toContain('Autumn Harvest Gala');
    expect(summary).toContain('250 attendees');
    expect(summary).toContain('$18,000');
    expect(summary).toContain('Finalize Sound Permits');
    expect(summary).toContain('City Tent Rentals');
  });
});
