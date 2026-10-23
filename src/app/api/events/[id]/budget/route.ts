import { NextResponse } from 'next/server';
import { getBudgetCategories, getBudgetSummary, createBudgetCategory, seedBudgetTemplate } from '@/lib/budget';
import { getEventById } from '@/lib/events';
import { createBudgetCategorySchema } from '@/lib/validations/budget';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const eventId = parseInt(rawId, 10);
    if (isNaN(eventId) || eventId <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid event ID.' }, { status: 400 });
    }

    const event = getEventById(eventId);
    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found.' }, { status: 404 });
    }

    const categories = getBudgetCategories(eventId);
    const summary = getBudgetSummary(eventId);

    return NextResponse.json({
      success: true,
      data: {
        categories,
        summary,
      },
    });
  } catch (error) {
    console.error('Error fetching budget:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve budget details.' }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const eventId = parseInt(rawId, 10);
    if (isNaN(eventId) || eventId <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid event ID.' }, { status: 400 });
    }

    const event = getEventById(eventId);
    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found.' }, { status: 404 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    // Handle template auto-population request
    if (body.action === 'template') {
      const generated = seedBudgetTemplate(eventId, event.event_type, event.total_budget);
      const summary = getBudgetSummary(eventId);
      return NextResponse.json(
        {
          success: true,
          data: {
            categories: generated,
            summary,
            message: 'Default budget template generated successfully.',
          },
        },
        { status: 201 }
      );
    }

    // Standard single category creation
    const validationResult = createBudgetCategorySchema.safeParse(body);
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

    const newCategory = createBudgetCategory(eventId, validationResult.data);
    const summary = getBudgetSummary(eventId);

    return NextResponse.json(
      {
        success: true,
        data: {
          category: newCategory,
          summary,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating budget category:', error);
    return NextResponse.json({ success: false, error: 'Failed to create budget category.' }, { status: 500 });
  }
}
