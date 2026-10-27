import { NextResponse } from 'next/server';
import { getEvents, createEvent } from '@/lib/events';
import { createEventSchema, eventTypeEnum } from '@/lib/validations/event';
import type { EventType } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get('type');
    const userIdParam = searchParams.get('userId') || request.headers.get('x-user-id') || undefined;

    let filter: { type?: EventType; userId?: string } | undefined;
    if (typeParam) {
      const parsedType = eventTypeEnum.safeParse(typeParam);
      if (!parsedType.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid event type filter. Must be wedding, birthday, community, or other.',
          },
          { status: 400 }
        );
      }
      filter = { type: parsedType.data };
    }
    if (userIdParam) {
      filter = { ...filter, userId: userIdParam };
    }

    const events = await getEvents(filter);
    return NextResponse.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve events. Please try again later.',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON request payload.',
        },
        { status: 400 }
      );
    }

    const validationResult = createEventSchema.safeParse(body);
    if (!validationResult.success) {
      const issues = validationResult.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json(
        {
          success: false,
          error: issues || 'Invalid event parameters.',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const headerUserId = request.headers.get('x-user-id') || undefined;
    const eventPayload = {
      ...validationResult.data,
      user_id: validationResult.data.user_id || headerUserId,
    };

    const newEvent = await createEvent(eventPayload);

    return NextResponse.json(
      {
        success: true,
        data: newEvent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create event. Please verify all details and try again.',
      },
      { status: 500 }
    );
  }
}
