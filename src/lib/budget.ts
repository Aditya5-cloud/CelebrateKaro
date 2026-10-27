import { getDb, getNextSequence, nowIso } from './db';
import { toCents } from './currency';
import type { BudgetCategory, EventType } from '@/types';
import type { CreateBudgetCategorySchemaInput, UpdateBudgetCategorySchemaInput } from './validations/budget';

export interface BudgetSummary {
  eventId: number;
  totalTargetBudget: number;  // cents
  totalPlanned: number;       // cents
  totalSpent: number;         // cents
  remainingFromTarget: number;// cents (totalTargetBudget - totalSpent)
  unallocatedTarget: number;  // cents (totalTargetBudget - totalPlanned)
  isOverBudget: boolean;      // totalSpent > totalTargetBudget
  isOverPlanned: boolean;     // totalPlanned > totalTargetBudget
  percentSpent: number;       // 0 to 100+
  percentPlanned: number;     // 0 to 100+
  categoryCount: number;
}

export async function getBudgetCategories(eventId: number): Promise<BudgetCategory[]> {
  const db = await getDb();
  const rows: BudgetCategory[] = await db
    .collection('budget_categories')
    .find({ event_id: eventId })
    .sort({ planned_amount: -1, name: 1 })
    .toArray();
  return rows;
}

export async function getBudgetCategoryById(id: number): Promise<BudgetCategory | null> {
  const db = await getDb();
  const row = await db.collection('budget_categories').findOne({ id });
  return (row as BudgetCategory) ?? null;
}

export async function createBudgetCategory(
  eventId: number,
  input: CreateBudgetCategorySchemaInput
): Promise<BudgetCategory> {
  const db = await getDb();
  const id = await getNextSequence('budget_categories');
  const plannedCents = toCents(input.planned_amount);
  const actualCents = toCents(input.actual_amount ?? 0);
  const now = nowIso();

  const doc: BudgetCategory = {
    id,
    event_id: eventId,
    name: input.name.trim(),
    planned_amount: plannedCents,
    actual_amount: actualCents,
    notes: (input.notes ?? '').trim(),
    created_at: now,
    updated_at: now,
  };

  await db.collection('budget_categories').insertOne(doc);
  return doc;
}

export async function updateBudgetCategory(
  id: number,
  input: UpdateBudgetCategorySchemaInput
): Promise<BudgetCategory | null> {
  const db = await getDb();
  const existing = await getBudgetCategoryById(id);
  if (!existing) return null;

  const updates: Record<string, unknown> = {};

  if (input.name !== undefined) {
    updates.name = input.name.trim();
  }
  if (input.planned_amount !== undefined) {
    updates.planned_amount = toCents(input.planned_amount);
  }
  if (input.actual_amount !== undefined) {
    updates.actual_amount = toCents(input.actual_amount);
  }
  if (input.notes !== undefined) {
    updates.notes = input.notes.trim();
  }

  if (Object.keys(updates).length === 0) return existing;

  updates.updated_at = nowIso();

  await db.collection('budget_categories').updateOne({ id }, { $set: updates });
  return getBudgetCategoryById(id);
}

export async function deleteBudgetCategory(id: number): Promise<boolean> {
  const db = await getDb();
  const result = await db.collection('budget_categories').deleteOne({ id });
  return Boolean(result && result.deletedCount > 0);
}

export async function getBudgetSummary(eventId: number): Promise<BudgetSummary> {
  const db = await getDb();
  const event = await db.collection('events').findOne({ id: eventId });
  const totalTargetBudget = event ? event.total_budget : 0;

  const categories: BudgetCategory[] = await db
    .collection('budget_categories')
    .find({ event_id: eventId })
    .toArray();

  let totalPlanned = 0;
  let totalSpent = 0;
  for (const cat of categories) {
    totalPlanned += cat.planned_amount || 0;
    totalSpent += cat.actual_amount || 0;
  }

  const remainingFromTarget = totalTargetBudget - totalSpent;
  const unallocatedTarget = totalTargetBudget - totalPlanned;
  const percentSpent = totalTargetBudget > 0 ? (totalSpent / totalTargetBudget) * 100 : 0;
  const percentPlanned = totalTargetBudget > 0 ? (totalPlanned / totalTargetBudget) * 100 : 0;

  return {
    eventId,
    totalTargetBudget,
    totalPlanned,
    totalSpent,
    remainingFromTarget,
    unallocatedTarget,
    isOverBudget: totalSpent > totalTargetBudget,
    isOverPlanned: totalPlanned > totalTargetBudget,
    percentSpent: Math.round(percentSpent * 10) / 10,
    percentPlanned: Math.round(percentPlanned * 10) / 10,
    categoryCount: categories.length,
  };
}

/**
 * Seed intelligent default budget allocations tailored to the specific celebration type.
 */
export async function seedBudgetTemplate(
  eventId: number,
  eventType: EventType,
  totalTargetCents: number
): Promise<BudgetCategory[]> {
  const db = await getDb();

  // Template distribution profiles (percentages must sum to 100)
  const distributions: Record<EventType, Array<{ name: string; pct: number }>> = {
    wedding: [
      { name: 'Venue & Rentals', pct: 35 },
      { name: 'Catering & Food', pct: 30 },
      { name: 'Photography & Video', pct: 12 },
      { name: 'Music & Entertainment', pct: 8 },
      { name: 'Decorations & Floral', pct: 8 },
      { name: 'Miscellaneous & Contingency', pct: 7 },
    ],
    birthday: [
      { name: 'Catering & Food', pct: 35 },
      { name: 'Venue & Rentals', pct: 25 },
      { name: 'Music & Entertainment', pct: 15 },
      { name: 'Decorations & Floral', pct: 10 },
      { name: 'Activities & Favors', pct: 10 },
      { name: 'Miscellaneous & Contingency', pct: 5 },
    ],
    community: [
      { name: 'Catering & Refreshments', pct: 25 },
      { name: 'Venue, Staging & Rentals', pct: 25 },
      { name: 'Permits, Safety & Security', pct: 15 },
      { name: 'Music & Audio Equipment', pct: 15 },
      { name: 'Signage & Marketing', pct: 10 },
      { name: 'Contingency & Supplies', pct: 10 },
    ],
    other: [
      { name: 'Venue & Space', pct: 30 },
      { name: 'Food & Beverage', pct: 30 },
      { name: 'Entertainment', pct: 15 },
      { name: 'Decor & Ambience', pct: 15 },
      { name: 'Contingency Fund', pct: 10 },
    ],
  };

  const profile = distributions[eventType] || distributions.other;
  const now = nowIso();

  // Delete existing categories if any to avoid duplication
  await db.collection('budget_categories').deleteMany({ event_id: eventId });

  let allocatedSoFar = 0;
  const docs: BudgetCategory[] = [];

  for (let index = 0; index < profile.length; index++) {
    const item = profile[index];
    let plannedAmount: number;
    if (index === profile.length - 1) {
      plannedAmount = Math.max(0, totalTargetCents - allocatedSoFar);
    } else {
      plannedAmount = Math.round((totalTargetCents * item.pct) / 100);
      allocatedSoFar += plannedAmount;
    }

    const id = await getNextSequence('budget_categories');
    docs.push({
      id,
      event_id: eventId,
      name: item.name,
      planned_amount: plannedAmount,
      actual_amount: 0,
      notes: `Recommended default allocation (${item.pct}%)`,
      created_at: now,
      updated_at: now,
    });
  }

  if (docs.length > 0) {
    await db.collection('budget_categories').insertMany(docs);
  }

  return getBudgetCategories(eventId);
}
