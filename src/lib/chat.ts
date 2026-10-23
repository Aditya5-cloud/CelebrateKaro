import { getDb, nowIso } from './db';
import type { ChatMessage, ChatRole } from '@/types';
import { getEventById } from './events';
import { getBudgetSummary, getBudgetCategories } from './budget';
import { getMilestones, getMilestoneStats } from './milestones';
import { getVendors, getVendorStats } from './vendors';
import { getChecklistItems, getChecklistStats } from './checklist';
import { formatCurrency, getRelativeDays } from './formatters';

interface RawChatRow {
  id: number;
  event_id: number;
  role: ChatRole;
  content: string;
  created_at: string;
}

export function getChatMessages(eventId: number, limit = 50): ChatMessage[] {
  const db = getDb();
  const rows = db
    .prepare('SELECT * FROM chat_messages WHERE event_id = ? ORDER BY id ASC LIMIT ?')
    .all(eventId, limit) as RawChatRow[];

  return rows.map((r) => ({
    id: r.id,
    event_id: r.event_id,
    role: r.role,
    content: r.content,
    created_at: r.created_at,
  }));
}

export function saveChatMessage(
  eventId: number,
  role: ChatRole,
  content: string
): ChatMessage {
  const db = getDb();
  const now = nowIso();

  const info = db.prepare(`
    INSERT INTO chat_messages (event_id, role, content, created_at)
    VALUES (?, ?, ?, ?)
  `).run(eventId, role, content.trim(), now);

  const rowId = Number(info.lastInsertRowid);
  const row = db.prepare('SELECT * FROM chat_messages WHERE id = ?').get(rowId) as RawChatRow;

  return {
    id: row.id,
    event_id: row.event_id,
    role: row.role,
    content: row.content,
    created_at: row.created_at,
  };
}

export function clearChatHistory(eventId: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM chat_messages WHERE event_id = ?').run(eventId);
  return result.changes >= 0;
}

/**
 * Builds a comprehensive, real-time snapshot of the event to ground the AI model.
 */
export function buildEventContextSummary(eventId: number): string {
  const event = getEventById(eventId);
  if (!event) return 'Event details unavailable.';

  const relative = getRelativeDays(event.event_date);
  const budgetSummary = getBudgetSummary(eventId);
  const budgetCategories = getBudgetCategories(eventId);
  const milestoneStats = getMilestoneStats(eventId);
  const milestones = getMilestones(eventId);
  const vendorStats = getVendorStats(eventId);
  const vendors = getVendors(eventId);
  const checklistStats = getChecklistStats(eventId);
  const checklist = getChecklistItems(eventId);

  const bookedVendors = vendors.filter((v) => v.status === 'booked' || v.status === 'paid');
  const pendingVendors = vendors.filter((v) => v.status === 'considering' || v.status === 'contacted');

  const pendingMilestones = milestones.filter((m) => !m.completed).slice(0, 4);
  const pendingChecklist = checklist.filter((c) => !c.completed).slice(0, 4);

  return `
[EVENT PROFILE]
- Name: ${event.name}
- Type: ${event.event_type}
- Target Date: ${event.event_date} (${relative.label})
- Guest Count: ${event.guest_count} attendees
- Description / Preferences: ${event.description || 'None provided'}

[FINANCIAL BUDGET SUMMARY]
- Total Allocated Budget: ${formatCurrency(budgetSummary.totalTargetBudget)}
- Planned Across Categories: ${formatCurrency(budgetSummary.totalPlanned)}
- Actual Spend To Date: ${formatCurrency(budgetSummary.totalSpent)}
- Remaining Unspent Budget: ${formatCurrency(budgetSummary.remainingFromTarget)}
- Categories Breakdown: ${budgetCategories.map((c) => `${c.name}: Planned ${formatCurrency(c.planned_amount)}, Spent ${formatCurrency(c.actual_amount)}`).join('; ') || 'No categories created yet'}

[TIMELINE & MILESTONES]
- Progress: ${milestoneStats.completed} of ${milestoneStats.total} completed (${milestoneStats.percentCompleted}%)
- Overdue Deadlines: ${milestoneStats.overdue}
- Immediate Next Milestones: ${pendingMilestones.map((m) => `"${m.title}" (Due: ${m.due_date})`).join(', ') || 'No pending milestones'}

[VENDORS STATUS]
- Secured / Booked: ${vendorStats.booked + vendorStats.paid} vendors (${bookedVendors.map((v) => `${v.name} [${v.category}]`).join(', ') || 'None yet'})
- In Negotiation: ${vendorStats.considering + vendorStats.contacted} vendors (${pendingVendors.map((v) => `${v.name} [${v.category}]`).join(', ') || 'None'})
- Total Committed Vendor Quotes: ${formatCurrency(vendorStats.totalQuotes)}

[CHECKLIST PROGRESS]
- Progress: ${checklistStats.completed} of ${checklistStats.total} tasks completed (${checklistStats.percentCompleted}%)
- Next Actionable Tasks: ${pendingChecklist.map((c) => c.task).join('; ') || 'Checklist complete or empty'}
`.trim();
}
