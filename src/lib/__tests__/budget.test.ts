import { clearDatabase, closeDb } from '../db';
import { createEvent } from '../events';
import {
  getBudgetCategories,
  getBudgetCategoryById,
  createBudgetCategory,
  updateBudgetCategory,
  deleteBudgetCategory,
  getBudgetSummary,
  seedBudgetTemplate,
} from '../budget';

describe('Budget Service Layer', () => {
  let eventId: number;

  beforeEach(async () => {
    await clearDatabase();

    const event = await createEvent({
      name: 'Summer Wedding Celebration',
      event_type: 'wedding',
      event_date: '2027-08-14',
      guest_count: 120,
      total_budget: 20000, // $20,000 in dollars -> 2,000,000 cents
      description: 'Test wedding',
    });
    eventId = event.id;
  });

  afterAll(async () => {
    await closeDb();
  });

  it('creates and retrieves budget categories', async () => {
    const cat = await createBudgetCategory(eventId, {
      name: 'Venue & Banquet Hall',
      planned_amount: 7000, // $7,000
      actual_amount: 3500,  // $3,500
      notes: 'Deposit paid',
    });

    expect(cat.id).toBeDefined();
    expect(cat.name).toBe('Venue & Banquet Hall');
    expect(cat.planned_amount).toBe(700000); // in cents
    expect(cat.actual_amount).toBe(350000);   // in cents
    expect(cat.notes).toBe('Deposit paid');

    const fetched = await getBudgetCategoryById(cat.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.name).toBe('Venue & Banquet Hall');

    const all = await getBudgetCategories(eventId);
    expect(all).toHaveLength(1);
  });

  it('updates planned and actual amounts correctly', async () => {
    const cat = await createBudgetCategory(eventId, {
      name: 'Catering',
      planned_amount: 5000,
      actual_amount: 0,
      notes: '',
    });

    const updated = await updateBudgetCategory(cat.id, {
      actual_amount: 5200, // went slightly over
      notes: 'Final invoice received',
    });

    expect(updated).not.toBeNull();
    expect(updated?.planned_amount).toBe(500000);
    expect(updated?.actual_amount).toBe(520000);
    expect(updated?.notes).toBe('Final invoice received');
  });

  it('deletes a budget category', async () => {
    const cat = await createBudgetCategory(eventId, {
      name: 'Decorations',
      planned_amount: 1500,
      actual_amount: 0,
      notes: '',
    });

    expect(await deleteBudgetCategory(cat.id)).toBe(true);
    expect(await getBudgetCategoryById(cat.id)).toBeNull();
  });

  it('calculates budget summary metrics accurately', async () => {
    // Total budget: $20,000 (2,000,000 cents)
    await createBudgetCategory(eventId, {
      name: 'Venue',
      planned_amount: 8000, // $8,000
      actual_amount: 8000,  // $8,000
      notes: '',
    });

    await createBudgetCategory(eventId, {
      name: 'Catering',
      planned_amount: 6000, // $6,000
      actual_amount: 4000,  // $4,000
      notes: '',
    });

    const summary = await getBudgetSummary(eventId);

    expect(summary.totalTargetBudget).toBe(2000000);
    expect(summary.totalPlanned).toBe(1400000); // 8,000 + 6,000 = $14,000
    expect(summary.totalSpent).toBe(1200000);   // 8,000 + 4,000 = $12,000
    expect(summary.remainingFromTarget).toBe(800000); // 20,000 - 12,000 = $8,000
    expect(summary.unallocatedTarget).toBe(600000);   // 20,000 - 14,000 = $6,000
    expect(summary.isOverBudget).toBe(false);
    expect(summary.isOverPlanned).toBe(false);
    expect(summary.percentSpent).toBe(60); // 12,000 / 20,000 = 60%
    expect(summary.categoryCount).toBe(2);
  });

  it('flags over-budget scenarios when spending exceeds target', async () => {
    await createBudgetCategory(eventId, {
      name: 'Extravaganza',
      planned_amount: 25000,
      actual_amount: 22000, // $22,000 spent on $20,000 budget
      notes: '',
    });

    const summary = await getBudgetSummary(eventId);
    expect(summary.isOverBudget).toBe(true);
    expect(summary.isOverPlanned).toBe(true);
    expect(summary.remainingFromTarget).toBe(-200000); // -$2,000
  });

  it('seeds standard template categories summing to the total budget', async () => {
    const seeded = await seedBudgetTemplate(eventId, 'wedding', 2000000); // $20,000
    expect(seeded.length).toBeGreaterThanOrEqual(5);

    const sumPlanned = seeded.reduce((sum, c) => sum + c.planned_amount, 0);
    expect(sumPlanned).toBe(2000000); // exactly matches total budget without rounding loss

    const summary = await getBudgetSummary(eventId);
    expect(summary.totalPlanned).toBe(2000000);
    expect(summary.unallocatedTarget).toBe(0);
    expect(summary.isOverPlanned).toBe(false);
  });
});
