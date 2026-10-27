import { getDb, getNextSequence, nowIso } from './db';
import type { ChatMessage, ChatRole } from '@/types';
import { getEventById } from './events';
import { getBudgetSummary, getBudgetCategories } from './budget';
import { getMilestones, getMilestoneStats } from './milestones';
import { getVendors, getVendorStats } from './vendors';
import { getChecklistItems, getChecklistStats } from './checklist';
import { formatCurrency, getRelativeDays } from './formatters';

export async function getChatMessages(eventId: number, limit = 50): Promise<ChatMessage[]> {
  const db = await getDb();
  const rows = await db
    .collection('chat_messages')
    .find({ event_id: eventId })
    .sort({ id: 1 })
    .limit(limit)
    .toArray();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows.map((r: any) => ({
    id: r.id,
    event_id: r.event_id,
    role: r.role,
    content: r.content,
    created_at: r.created_at,
  }));
}

export async function saveChatMessage(
  eventId: number,
  role: ChatRole,
  content: string
): Promise<ChatMessage> {
  const db = await getDb();
  const id = await getNextSequence('chat_messages');
  const now = nowIso();

  const doc: ChatMessage = {
    id,
    event_id: eventId,
    role,
    content: content.trim(),
    created_at: now,
  };

  await db.collection('chat_messages').insertOne(doc);
  return doc;
}

export async function clearChatHistory(eventId: number): Promise<boolean> {
  const db = await getDb();
  await db.collection('chat_messages').deleteMany({ event_id: eventId });
  return true;
}

/**
 * Builds a comprehensive, real-time snapshot of the event to ground the AI model.
 */
export async function buildEventContextSummary(eventId: number): Promise<string> {
  const event = await getEventById(eventId);
  if (!event) return 'Event details unavailable.';

  const relative = getRelativeDays(event.event_date);
  const [
    budgetSummary,
    budgetCategories,
    milestoneStats,
    milestones,
    vendorStats,
    vendors,
    checklistStats,
    checklist,
  ] = await Promise.all([
    getBudgetSummary(eventId),
    getBudgetCategories(eventId),
    getMilestoneStats(eventId),
    getMilestones(eventId),
    getVendorStats(eventId),
    getVendors(eventId),
    getChecklistStats(eventId),
    getChecklistItems(eventId),
  ]);

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
