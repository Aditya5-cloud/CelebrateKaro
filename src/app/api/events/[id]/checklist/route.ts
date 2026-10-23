import { NextResponse } from 'next/server';
import { getChecklistItems, getChecklistStats, createChecklistItem } from '@/lib/checklist';
import { getEventById } from '@/lib/events';
import { createChecklistItemSchema } from '@/lib/validations/checklist';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
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

    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get('category') || undefined;
    const completedParam = searchParams.get('completed');
    const completedFilter = completedParam !== null ? completedParam === 'true' : undefined;

    const items = getChecklistItems(eventId, {
      category: categoryParam,
      completed: completedFilter,
    });
    const stats = getChecklistStats(eventId);

    return NextResponse.json({
      success: true,
      data: {
        items,
        stats,
      },
    });
  } catch (error) {
    console.error('Error fetching checklist items:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve checklist.' }, { status: 500 });
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

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    const validationResult = createChecklistItemSchema.safeParse(body);
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

    const item = createChecklistItem(eventId, validationResult.data);
    const stats = getChecklistStats(eventId);

    return NextResponse.json(
      {
        success: true,
        data: {
          item,
          stats,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating checklist item:', error);
    return NextResponse.json({ success: false, error: 'Failed to create checklist item.' }, { status: 500 });
  }
}
