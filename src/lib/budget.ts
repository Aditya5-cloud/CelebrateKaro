import { getDb, nowIso } from './db';
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

export function getBudgetCategories(eventId: number): BudgetCategory[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM budget_categories WHERE event_id = ? ORDER BY planned_amount DESC, name ASC')
    .all(eventId) as BudgetCategory[];
}

export function getBudgetCategoryById(id: number): BudgetCategory | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM budget_categories WHERE id = ?').get(id) as BudgetCategory | undefined;
  return row ?? null;
}

export function createBudgetCategory(
  eventId: number,
  input: CreateBudgetCategorySchemaInput
): BudgetCategory {
  const db = getDb();
  const plannedCents = toCents(input.planned_amount);
  const actualCents = toCents(input.actual_amount ?? 0);
  const now = nowIso();

  const info = db.prepare(`
    INSERT INTO budget_categories (event_id, name, planned_amount, actual_amount, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    eventId,
    input.name.trim(),
    plannedCents,
    actualCents,
    (input.notes ?? '').trim(),
    now,
    now
  );

  const rowId = Number(info.lastInsertRowid);
  return db.prepare('SELECT * FROM budget_categories WHERE id = ?').get(rowId) as BudgetCategory;
}

export function updateBudgetCategory(
  id: number,
  input: UpdateBudgetCategorySchemaInput
): BudgetCategory | null {
  const db = getDb();
  const existing = getBudgetCategoryById(id);
  if (!existing) return null;

  const updates: string[] = [];
  const params: unknown[] = [];

  if (input.name !== undefined) {
    updates.push('name = ?');
    params.push(input.name.trim());
  }
  if (input.planned_amount !== undefined) {
    updates.push('planned_amount = ?');
    params.push(toCents(input.planned_amount));
  }
  if (input.actual_amount !== undefined) {
    updates.push('actual_amount = ?');
    params.push(toCents(input.actual_amount));
  }
  if (input.notes !== undefined) {
    updates.push('notes = ?');
    params.push(input.notes.trim());
  }

  if (updates.length === 0) return existing;

  updates.push('updated_at = ?');
  params.push(nowIso());
  params.push(id);

  db.prepare(`UPDATE budget_categories SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  return getBudgetCategoryById(id);
}

export function deleteBudgetCategory(id: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM budget_categories WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getBudgetSummary(eventId: number): BudgetSummary {
  const db = getDb();
  const event = db.prepare('SELECT total_budget FROM events WHERE id = ?').get(eventId) as
    | { total_budget: number }
    | undefined;

  const totalTargetBudget = event ? event.total_budget : 0;

  const totals = db.prepare(`
    SELECT 
      COALESCE(SUM(planned_amount), 0) AS total_planned,
      COALESCE(SUM(actual_amount), 0)  AS total_spent,
      COUNT(*) AS category_count
    FROM budget_categories
    WHERE event_id = ?
  `).get(eventId) as { total_planned: number; total_spent: number; category_count: number };

  const totalPlanned = totals.total_planned;
  const totalSpent = totals.total_spent;
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
    categoryCount: totals.category_count,
  };
}

/**
 * Seed intelligent default budget allocations tailored to the specific celebration type.
 */
export function seedBudgetTemplate(
  eventId: number,
  eventType: EventType,
  totalTargetCents: number
): BudgetCategory[] {
  const db = getDb();

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
  db.prepare('DELETE FROM budget_categories WHERE event_id = ?').run(eventId);

  const insertStmt = db.prepare(`
    INSERT INTO budget_categories (event_id, name, planned_amount, actual_amount, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction(() => {
    let allocatedSoFar = 0;
    profile.forEach((item, index) => {
      let plannedAmount: number;
      if (index === profile.length - 1) {
        // Assign remainder to avoid 1-cent rounding discrepancies
        plannedAmount = Math.max(0, totalTargetCents - allocatedSoFar);
      } else {
        plannedAmount = Math.round((totalTargetCents * item.pct) / 100);
        allocatedSoFar += plannedAmount;
      }

      insertStmt.run(
        eventId,
        item.name,
        plannedAmount,
        0,
        `Recommended default allocation (${item.pct}%)`,
        now,
        now
      );
    });
  });

  insertMany();

  return getBudgetCategories(eventId);
}
