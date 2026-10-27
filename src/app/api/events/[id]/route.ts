import { NextResponse } from 'next/server';
import { getEventById, updateEvent, deleteEvent } from '@/lib/events';
import { updateEventSchema } from '@/lib/validations/event';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

function parseId(rawId: string): number | null {
  const parsed = parseInt(rawId, 10);
  if (isNaN(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const id = parseId(rawId);
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID.' },
        { status: 400 }
      );
    }

    const event = await getEventById(id);
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Error fetching event details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve event.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const id = parseId(rawId);
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID.' },
        { status: 400 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request payload.' },
        { status: 400 }
      );
    }

    const validationResult = updateEventSchema.safeParse(body);
    if (!validationResult.success) {
      const issues = validationResult.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json(
        {
          success: false,
          error: issues || 'Invalid update parameters.',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const updated = await updateEvent(id, validationResult.data);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Event not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update event.' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const id = parseId(rawId);
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID.' },
        { status: 400 }
      );
    }

    const deleted = await deleteEvent(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Event not found or already deleted.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id, message: 'Event successfully deleted.' },
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete event.' },
      { status: 500 }
    );
  }
}
