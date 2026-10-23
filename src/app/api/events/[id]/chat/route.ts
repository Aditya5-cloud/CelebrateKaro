import { NextResponse } from 'next/server';
import { getEventById } from '@/lib/events';
import { getChatMessages, saveChatMessage, clearChatHistory, buildEventContextSummary } from '@/lib/chat';
import { generateChatResponse } from '@/lib/gemini';
import { sendChatMessageSchema } from '@/lib/validations/chat';

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

    const messages = getChatMessages(eventId, 100);
    const contextSummary = buildEventContextSummary(eventId);

    return NextResponse.json({
      success: true,
      data: {
        messages,
        eventContextSummary: contextSummary,
      },
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json({ success: false, error: 'Failed to load chat history.' }, { status: 500 });
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

    const validationResult = sendChatMessageSchema.safeParse(body);
    if (!validationResult.success) {
      const issues = validationResult.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json(
        {
          success: false,
          error: issues || 'Invalid chat message parameters.',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const userText = validationResult.data.message;

    // 1. Save user message to database
    const userMessage = saveChatMessage(eventId, 'user', userText);

    // 2. Fetch history and build live event context
    const history = getChatMessages(eventId, 20);
    const eventContextSummary = buildEventContextSummary(eventId);

    // 3. Generate response with Gemini (or grounded assistant)
    const aiResult = await generateChatResponse(
      event,
      userText,
      history,
      eventContextSummary
    );

    // 4. Save assistant response to database
    const assistantMessage = saveChatMessage(eventId, 'assistant', aiResult.response);

    return NextResponse.json(
      {
        success: true,
        data: {
          userMessage,
          assistantMessage,
          isMock: aiResult.isMock,
          model: aiResult.model,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in chat assistant:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate assistant response.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
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

    clearChatHistory(eventId);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Chat history cleared.',
      },
    });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    return NextResponse.json({ success: false, error: 'Failed to clear chat history.' }, { status: 500 });
  }
}
