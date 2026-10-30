import { NextResponse } from 'next/server';
import { updateMilestone, deleteMilestone, getMilestoneById, getMilestoneStats } from '@/lib/milestones';
import { updateMilestoneSchema } from '@/lib/validations/milestone';
import { parseNestedNumericIds } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string; milestoneId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id: rawEventId, milestoneId: rawMilestoneId } = await context.params;
    const ids = parseNestedNumericIds(rawEventId, rawMilestoneId);
    if (!ids) {
      return NextResponse.json({ success: false, error: 'Invalid ID parameters.' }, { status: 400 });
    }
    const [eventId, milestoneId] = ids;

    const existing = await getMilestoneById(milestoneId);
    if (!existing || existing.event_id !== eventId) {
      return NextResponse.json({ success: false, error: 'Milestone not found for this event.' }, { status: 404 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    const validationResult = updateMilestoneSchema.safeParse(body);
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

    const updated = await updateMilestone(milestoneId, validationResult.data);
    const stats = await getMilestoneStats(eventId);

    return NextResponse.json({
      success: true,
      data: {
        milestone: updated,
        stats,
      },
    });
  } catch (error) {
    console.error('Error updating milestone:', error);
    return NextResponse.json({ success: false, error: 'Failed to update milestone.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id: rawEventId, milestoneId: rawMilestoneId } = await context.params;
    const ids = parseNestedNumericIds(rawEventId, rawMilestoneId);
    if (!ids) {
      return NextResponse.json({ success: false, error: 'Invalid ID parameters.' }, { status: 400 });
    }
    const [eventId, milestoneId] = ids;

    const existing = await getMilestoneById(milestoneId);
    if (!existing || existing.event_id !== eventId) {
      return NextResponse.json({ success: false, error: 'Milestone not found for this event.' }, { status: 404 });
    }

    const deleted = await deleteMilestone(milestoneId);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Failed to delete milestone.' }, { status: 500 });
    }

    const stats = await getMilestoneStats(eventId);

    return NextResponse.json({
      success: true,
      data: {
        id: milestoneId,
        stats,
        message: 'Milestone removed.',
      },
    });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete milestone.' }, { status: 500 });
  }
}
