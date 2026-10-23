import { NextResponse } from 'next/server';
import { getMilestones, getMilestoneStats, createMilestone, seedTimelineTemplate } from '@/lib/milestones';
import { getEventById } from '@/lib/events';
import { createMilestoneSchema } from '@/lib/validations/milestone';

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

    const milestones = getMilestones(eventId);
    const stats = getMilestoneStats(eventId);

    return NextResponse.json({
      success: true,
      data: {
        milestones,
        stats,
      },
    });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve milestones.' }, { status: 500 });
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

    // Auto-generate celebration timeline template
    if (body && typeof body === 'object' && 'action' in body && body.action === 'template') {
      const milestones = seedTimelineTemplate(eventId, event.event_type, event.event_date);
      const stats = getMilestoneStats(eventId);
      return NextResponse.json(
        {
          success: true,
          data: {
            milestones,
            stats,
            message: `Timeline roadmap generated for ${event.event_type}.`,
          },
        },
        { status: 201 }
      );
    }

    // Single milestone creation
    const validationResult = createMilestoneSchema.safeParse(body);
    if (!validationResult.success) {
      const issues = validationResult.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json(
        {
          success: false,
          error: issues || 'Invalid milestone parameters.',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const newMilestone = createMilestone(eventId, validationResult.data);
    const stats = getMilestoneStats(eventId);

    return NextResponse.json(
      {
        success: true,
        data: {
          milestone: newMilestone,
          stats,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating milestone:', error);
    return NextResponse.json({ success: false, error: 'Failed to create milestone.' }, { status: 500 });
  }
}
