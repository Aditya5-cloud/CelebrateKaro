import { NextResponse } from 'next/server';
import { updateChecklistItem, deleteChecklistItem, getChecklistItemById, getChecklistStats } from '@/lib/checklist';
import { updateChecklistItemSchema } from '@/lib/validations/checklist';
import { parseNestedNumericIds } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string; itemId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id: rawEventId, itemId: rawItemId } = await context.params;
    const ids = parseNestedNumericIds(rawEventId, rawItemId);
    if (!ids) {
      return NextResponse.json({ success: false, error: 'Invalid ID parameters.' }, { status: 400 });
    }
    const [eventId, itemId] = ids;

    const existing = await getChecklistItemById(itemId);
    if (!existing || existing.event_id !== eventId) {
      return NextResponse.json({ success: false, error: 'Checklist item not found for this event.' }, { status: 404 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    const validationResult = updateChecklistItemSchema.safeParse(body);
    if (!validationResult.success) {
      const issues = validationResult.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json(
        {
          success: false,
          error: issues || 'Invalid checklist item parameters.',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const updated = await updateChecklistItem(itemId, validationResult.data);
    const stats = await getChecklistStats(eventId);

    return NextResponse.json({
      success: true,
      data: {
        item: updated,
        stats,
      },
    });
  } catch (error) {
    console.error('Error updating checklist item:', error);
    return NextResponse.json({ success: false, error: 'Failed to update checklist item.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id: rawEventId, itemId: rawItemId } = await context.params;
    const ids = parseNestedNumericIds(rawEventId, rawItemId);
    if (!ids) {
      return NextResponse.json({ success: false, error: 'Invalid ID parameters.' }, { status: 400 });
    }
    const [eventId, itemId] = ids;

    const existing = await getChecklistItemById(itemId);
    if (!existing || existing.event_id !== eventId) {
      return NextResponse.json({ success: false, error: 'Checklist item not found for this event.' }, { status: 404 });
    }

    const deleted = await deleteChecklistItem(itemId);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Failed to delete checklist item.' }, { status: 500 });
    }

    const stats = await getChecklistStats(eventId);

    return NextResponse.json({
      success: true,
      data: {
        id: itemId,
        stats,
        message: 'Checklist item removed.',
      },
    });
  } catch (error) {
    console.error('Error deleting checklist item:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete checklist item.' }, { status: 500 });
  }
}
