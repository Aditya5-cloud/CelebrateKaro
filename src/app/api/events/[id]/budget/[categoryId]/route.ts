import { NextResponse } from 'next/server';
import { updateBudgetCategory, deleteBudgetCategory, getBudgetCategoryById, getBudgetSummary } from '@/lib/budget';
import { updateBudgetCategorySchema } from '@/lib/validations/budget';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string; categoryId: string }>;
}

function parseIds(rawEventId: string, rawCatId: string) {
  const eventId = parseInt(rawEventId, 10);
  const categoryId = parseInt(rawCatId, 10);
  if (isNaN(eventId) || eventId <= 0 || isNaN(categoryId) || categoryId <= 0) {
    return null;
  }
  return { eventId, categoryId };
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id: rawEventId, categoryId: rawCatId } = await context.params;
    const parsed = parseIds(rawEventId, rawCatId);
    if (!parsed) {
      return NextResponse.json({ success: false, error: 'Invalid ID parameters.' }, { status: 400 });
    }

    const existing = getBudgetCategoryById(parsed.categoryId);
    if (!existing || existing.event_id !== parsed.eventId) {
      return NextResponse.json({ success: false, error: 'Budget category not found for this event.' }, { status: 404 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    const validationResult = updateBudgetCategorySchema.safeParse(body);
    if (!validationResult.success) {
      const issues = validationResult.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json(
        {
          success: false,
          error: issues || 'Invalid budget category parameters.',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const updated = updateBudgetCategory(parsed.categoryId, validationResult.data);
    const summary = getBudgetSummary(parsed.eventId);

    return NextResponse.json({
      success: true,
      data: {
        category: updated,
        summary,
      },
    });
  } catch (error) {
    console.error('Error updating budget category:', error);
    return NextResponse.json({ success: false, error: 'Failed to update budget category.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id: rawEventId, categoryId: rawCatId } = await context.params;
    const parsed = parseIds(rawEventId, rawCatId);
    if (!parsed) {
      return NextResponse.json({ success: false, error: 'Invalid ID parameters.' }, { status: 400 });
    }

    const existing = getBudgetCategoryById(parsed.categoryId);
    if (!existing || existing.event_id !== parsed.eventId) {
      return NextResponse.json({ success: false, error: 'Budget category not found for this event.' }, { status: 404 });
    }

    const deleted = deleteBudgetCategory(parsed.categoryId);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Failed to delete category.' }, { status: 500 });
    }

    const summary = getBudgetSummary(parsed.eventId);

    return NextResponse.json({
      success: true,
      data: {
        id: parsed.categoryId,
        summary,
        message: 'Budget category removed.',
      },
    });
  } catch (error) {
    console.error('Error deleting budget category:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete budget category.' }, { status: 500 });
  }
}
