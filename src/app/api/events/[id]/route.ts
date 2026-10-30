import { NextResponse } from 'next/server';
import { getEventById, updateEvent, deleteEvent } from '@/lib/events';
import { updateEventSchema } from '@/lib/validations/event';
import { parseNumericId } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const id = parseNumericId(rawId);
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

    const headerUserId = request.headers.get('x-user-id');
    if (event.user_id && headerUserId && event.user_id !== headerUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized celebration access.' },
        { status: 403 }
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
    const id = parseNumericId(rawId);
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID.' },
        { status: 400 }
      );
    }

    const existing = await getEventById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Event not found.' },
        { status: 404 }
      );
    }

    const headerUserId = request.headers.get('x-user-id');
    if (existing.user_id && headerUserId && existing.user_id !== headerUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized celebration access.' },
        { status: 403 }
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

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const id = parseNumericId(rawId);
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID.' },
        { status: 400 }
      );
    }

    const existing = await getEventById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Event not found or already deleted.' },
        { status: 404 }
      );
    }

    const headerUserId = request.headers.get('x-user-id');
    if (existing.user_id && headerUserId && existing.user_id !== headerUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized celebration access.' },
        { status: 403 }
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
