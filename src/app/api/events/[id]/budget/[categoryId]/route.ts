import { NextResponse } from 'next/server';
import { updateBudgetCategory, deleteBudgetCategory, getBudgetCategoryById, getBudgetSummary } from '@/lib/budget';
import { updateBudgetCategorySchema } from '@/lib/validations/budget';
import { parseNestedNumericIds } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string; categoryId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id: rawEventId, categoryId: rawCatId } = await context.params;
    const ids = parseNestedNumericIds(rawEventId, rawCatId);
    if (!ids) {
      return NextResponse.json({ success: false, error: 'Invalid ID parameters.' }, { status: 400 });
    }
    const [eventId, categoryId] = ids;

    const existing = await getBudgetCategoryById(categoryId);
    if (!existing || existing.event_id !== eventId) {
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

    const updated = await updateBudgetCategory(categoryId, validationResult.data);
    const summary = await getBudgetSummary(eventId);

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
    const ids = parseNestedNumericIds(rawEventId, rawCatId);
    if (!ids) {
      return NextResponse.json({ success: false, error: 'Invalid ID parameters.' }, { status: 400 });
    }
    const [eventId, categoryId] = ids;

    const existing = await getBudgetCategoryById(categoryId);
    if (!existing || existing.event_id !== eventId) {
      return NextResponse.json({ success: false, error: 'Budget category not found for this event.' }, { status: 404 });
    }

    const deleted = await deleteBudgetCategory(categoryId);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Failed to delete category.' }, { status: 500 });
    }

    const summary = await getBudgetSummary(eventId);

    return NextResponse.json({
      success: true,
      data: {
        id: categoryId,
        summary,
        message: 'Budget category removed.',
      },
    });
  } catch (error) {
    console.error('Error deleting budget category:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete budget category.' }, { status: 500 });
  }
}
