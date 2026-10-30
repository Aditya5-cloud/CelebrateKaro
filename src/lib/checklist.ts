import { getDb, getNextSequence, nowIso } from './db';
import type { ChecklistItem } from '@/types';
import type { CreateChecklistItemSchemaInput, UpdateChecklistItemSchemaInput } from './validations/checklist';
import type { GeneratedTask } from './gemini';

export interface ChecklistStats {
  total: number;
  completed: number;
  pending: number;
  aiGeneratedCount: number;
  percentCompleted: number;
}

/** Retrieve checklist items for an event, with optional category and completion filters. */
export async function getChecklistItems(
  eventId: number,
  filter?: { category?: string; completed?: boolean }
): Promise<ChecklistItem[]> {
  const db = await getDb();
  const query: Record<string, unknown> = { event_id: eventId };

  if (filter?.category) {
    query.category = filter.category;
  }
  if (filter?.completed !== undefined) {
    query.completed = filter.completed;
  }

  const items = await db.collection<ChecklistItem>('checklist_items').find(query).toArray();

  const mapped: ChecklistItem[] = items.map((row) => ({
    id: row.id,
    event_id: row.event_id,
    category: row.category,
    task: row.task,
    completed: Boolean(row.completed),
    ai_generated: Boolean(row.ai_generated),
    sort_order: row.sort_order || 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  return mapped.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }
    return a.id - b.id;
  });
}

/** Retrieve a single checklist item by ID, or null if not found. */
export async function getChecklistItemById(id: number): Promise<ChecklistItem | null> {
  const db = await getDb();
  const row = await db.collection('checklist_items').findOne({ id });
  if (!row) return null;
  return {
    id: row.id,
    event_id: row.event_id,
    category: row.category,
    task: row.task,
    completed: Boolean(row.completed),
    ai_generated: Boolean(row.ai_generated),
    sort_order: row.sort_order || 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/** Create a new checklist item for an event, auto-assigning sort order if not provided. */
export async function createChecklistItem(
  eventId: number,
  input: CreateChecklistItemSchemaInput
): Promise<ChecklistItem> {
  const db = await getDb();
  const id = await getNextSequence('checklist_items');
  const now = nowIso();

  let sortOrder: number;
  if (input.sort_order !== undefined && !isNaN(Number(input.sort_order))) {
    sortOrder = Number(input.sort_order);
  } else {
    const existing = await db.collection<ChecklistItem>('checklist_items').find({ event_id: eventId }).toArray();
    const maxOrder = existing.reduce((max: number, item: ChecklistItem) => Math.max(max, item.sort_order || 0), 0);
    sortOrder = maxOrder + 1;
  }

  const doc: ChecklistItem = {
    id,
    event_id: eventId,
    category: (input.category || 'general').trim(),
    task: input.task.trim(),
    completed: Boolean(input.completed),
    ai_generated: Boolean(input.ai_generated),
    sort_order: sortOrder,
    created_at: now,
    updated_at: now,
  };

  await db.collection('checklist_items').insertOne(doc);
  return doc;
}

/** Update a checklist item by ID. Returns the updated record, or null if not found. */
export async function updateChecklistItem(
  id: number,
  input: UpdateChecklistItemSchemaInput
): Promise<ChecklistItem | null> {
  const db = await getDb();
  const existing = await getChecklistItemById(id);
  if (!existing) return null;

  const updates: Record<string, unknown> = {};

  if (input.task !== undefined) {
    updates.task = input.task.trim();
  }
  if (input.category !== undefined) {
    updates.category = input.category.trim();
  }
  if (input.completed !== undefined) {
    updates.completed = Boolean(input.completed);
  }
  if (input.ai_generated !== undefined) {
    updates.ai_generated = Boolean(input.ai_generated);
  }
  if (input.sort_order !== undefined) {
    updates.sort_order = input.sort_order;
  }

  if (Object.keys(updates).length === 0) return existing;

  updates.updated_at = nowIso();

  await db.collection('checklist_items').updateOne({ id }, { $set: updates });
  return getChecklistItemById(id);
}

/** Delete a checklist item by ID. Returns true if deleted, false if not found. */
export async function deleteChecklistItem(id: number): Promise<boolean> {
  const db = await getDb();
  const result = await db.collection('checklist_items').deleteOne({ id });
  return Boolean(result && result.deletedCount > 0);
}

/**
 * Persist AI-generated checklist items.
 */
export async function saveGeneratedChecklist(
  eventId: number,
  tasks: GeneratedTask[],
  replaceExisting = false
): Promise<ChecklistItem[]> {
  const db = await getDb();
  const now = nowIso();

  if (replaceExisting) {
    await db.collection('checklist_items').deleteMany({ event_id: eventId });
  }

  let currentOrder = 1;
  if (!replaceExisting) {
    const existing = await db.collection<ChecklistItem>('checklist_items').find({ event_id: eventId }).toArray();
    const maxOrder = existing.reduce((max: number, item: ChecklistItem) => Math.max(max, item.sort_order || 0), 0);
    currentOrder = maxOrder + 1;
  }

  const docs: ChecklistItem[] = [];
  for (const item of tasks) {
    const id = await getNextSequence('checklist_items');
    docs.push({
      id,
      event_id: eventId,
      category: (item.category || 'general').trim(),
      task: item.task.trim(),
      completed: false,
      ai_generated: true,
      sort_order: currentOrder++,
      created_at: now,
      updated_at: now,
    });
  }

  if (docs.length > 0) {
    await db.collection('checklist_items').insertMany(docs);
  }

  return getChecklistItems(eventId);
}

/** Calculate aggregate checklist stats including AI-generated count and completion percentage. */
export async function getChecklistStats(eventId: number): Promise<ChecklistStats> {
  const items = await getChecklistItems(eventId);

  let completed = 0;
  let pending = 0;
  let aiGeneratedCount = 0;

  for (const item of items) {
    if (item.completed) completed++;
    else pending++;

    if (item.ai_generated) aiGeneratedCount++;
  }

  const total = items.length;
  const percentCompleted = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    pending,
    aiGeneratedCount,
    percentCompleted,
  };
}
