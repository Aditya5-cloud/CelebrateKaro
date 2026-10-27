import { NextResponse } from 'next/server';
import { getEventById } from '@/lib/events';
import { generatePersonalizedChecklist } from '@/lib/gemini';
import { saveGeneratedChecklist, getChecklistStats } from '@/lib/checklist';
import { generateChecklistSchema } from '@/lib/validations/checklist';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const eventId = parseInt(rawId, 10);
    if (isNaN(eventId) || eventId <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid event ID.' }, { status: 400 });
    }

    const event = await getEventById(eventId);
    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found.' }, { status: 404 });
    }

    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is acceptable
      body = {};
    }

    const validationResult = generateChecklistSchema.safeParse(body);
    if (!validationResult.success) {
      const issues = validationResult.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json(
        {
          success: false,
          error: issues || 'Invalid generation parameters.',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { focus, replaceExisting } = validationResult.data;

    // Call Gemini (or fallback mock)
    const result = await generatePersonalizedChecklist(event, focus);

    // Persist items to database
    const items = await saveGeneratedChecklist(eventId, result.items, replaceExisting);
    const stats = await getChecklistStats(eventId);

    return NextResponse.json(
      {
        success: true,
        data: {
          items,
          stats,
          isMock: result.isMock,
          model: result.model,
          message: result.isMock
            ? `Generated ${result.items.length} recommendations using domain planner (Set GEMINI_API_KEY in .env.local for live Gemini generation).`
            : `Generated ${result.items.length} personalized recommendations using ${result.model}.`,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error generating AI checklist:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate AI checklist.' }, { status: 500 });
  }
}
