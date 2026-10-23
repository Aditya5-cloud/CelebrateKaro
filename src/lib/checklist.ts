import { getDb, nowIso } from './db';
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

interface RawChecklistRow {
  id: number;
  event_id: number;
  category: string;
  task: string;
  completed: number;
  ai_generated: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function mapRowToChecklistItem(row: RawChecklistRow): ChecklistItem {
  return {
    id: row.id,
    event_id: row.event_id,
    category: row.category,
    task: row.task,
    completed: Boolean(row.completed),
    ai_generated: Boolean(row.ai_generated),
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function getChecklistItems(
  eventId: number,
  filter?: { category?: string; completed?: boolean }
): ChecklistItem[] {
  const db = getDb();
  let query = 'SELECT * FROM checklist_items WHERE event_id = ?';
  const params: unknown[] = [eventId];

  if (filter?.category) {
    query += ' AND category = ?';
    params.push(filter.category);
  }
  if (filter?.completed !== undefined) {
    query += ' AND completed = ?';
    params.push(filter.completed ? 1 : 0);
  }

  query += ' ORDER BY completed ASC, sort_order ASC, id ASC';

  const rows = db.prepare(query).all(...params) as RawChecklistRow[];
  return rows.map(mapRowToChecklistItem);
}

export function getChecklistItemById(id: number): ChecklistItem | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM checklist_items WHERE id = ?').get(id) as RawChecklistRow | undefined;
  return row ? mapRowToChecklistItem(row) : null;
}

export function createChecklistItem(
  eventId: number,
  input: CreateChecklistItemSchemaInput
): ChecklistItem {
  const db = getDb();
  const now = nowIso();

  const maxOrderRow = db
    .prepare('SELECT MAX(sort_order) AS max_order FROM checklist_items WHERE event_id = ?')
    .get(eventId) as { max_order: number | null };
  const sortOrder = input.sort_order ?? ((maxOrderRow.max_order ?? 0) + 1);

  const info = db.prepare(`
    INSERT INTO checklist_items (
      event_id, category, task, completed, ai_generated, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    eventId,
    (input.category || 'general').trim(),
    input.task.trim(),
    input.completed ? 1 : 0,
    input.ai_generated ? 1 : 0,
    sortOrder,
    now,
    now
  );

  const rowId = Number(info.lastInsertRowid);
  return getChecklistItemById(rowId)!;
}

export function updateChecklistItem(
  id: number,
  input: UpdateChecklistItemSchemaInput
): ChecklistItem | null {
  const db = getDb();
  const existing = getChecklistItemById(id);
  if (!existing) return null;

  const updates: string[] = [];
  const params: unknown[] = [];

  if (input.task !== undefined) {
    updates.push('task = ?');
    params.push(input.task.trim());
  }
  if (input.category !== undefined) {
    updates.push('category = ?');
    params.push(input.category.trim());
  }
  if (input.completed !== undefined) {
    updates.push('completed = ?');
    params.push(input.completed ? 1 : 0);
  }
  if (input.ai_generated !== undefined) {
    updates.push('ai_generated = ?');
    params.push(input.ai_generated ? 1 : 0);
  }
  if (input.sort_order !== undefined) {
    updates.push('sort_order = ?');
    params.push(input.sort_order);
  }

  if (updates.length === 0) return existing;

  updates.push('updated_at = ?');
  params.push(nowIso());
  params.push(id);

  db.prepare(`UPDATE checklist_items SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  return getChecklistItemById(id);
}

export function deleteChecklistItem(id: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM checklist_items WHERE id = ?').run(id);
  return result.changes > 0;
}

/**
 * Persist AI-generated checklist items.
 */
export function saveGeneratedChecklist(
  eventId: number,
  tasks: GeneratedTask[],
  replaceExisting = false
): ChecklistItem[] {
  const db = getDb();
  const now = nowIso();

  const transaction = db.transaction(() => {
    if (replaceExisting) {
      db.prepare('DELETE FROM checklist_items WHERE event_id = ?').run(eventId);
    }

    const insertStmt = db.prepare(`
      INSERT INTO checklist_items (
        event_id, category, task, completed, ai_generated, sort_order, created_at, updated_at
      ) VALUES (?, ?, ?, 0, 1, ?, ?, ?)
    `);

    let currentOrder = 1;
    if (!replaceExisting) {
      const maxOrderRow = db
        .prepare('SELECT MAX(sort_order) AS max_order FROM checklist_items WHERE event_id = ?')
        .get(eventId) as { max_order: number | null };
      currentOrder = (maxOrderRow.max_order ?? 0) + 1;
    }

    for (const item of tasks) {
      insertStmt.run(
        eventId,
        (item.category || 'general').trim(),
        item.task.trim(),
        currentOrder++,
        now,
        now
      );
    }
  });

  transaction();

  return getChecklistItems(eventId);
}

export function getChecklistStats(eventId: number): ChecklistStats {
  const db = getDb();
  const counts = db.prepare(`
    SELECT
      COUNT(*) AS total,
      COALESCE(SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END), 0) AS completed,
      COALESCE(SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END), 0) AS pending,
      COALESCE(SUM(CASE WHEN ai_generated = 1 THEN 1 ELSE 0 END), 0) AS ai_generated_count
    FROM checklist_items
    WHERE event_id = ?
  `).get(eventId) as {
    total: number;
    completed: number;
    pending: number;
    ai_generated_count: number;
  };

  const percentCompleted = counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0;

  return {
    total: counts.total,
    completed: counts.completed,
    pending: counts.pending,
    aiGeneratedCount: counts.ai_generated_count,
    percentCompleted,
  };
}
