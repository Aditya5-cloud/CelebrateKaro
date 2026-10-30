import { NextResponse } from 'next/server';
import { getEventById } from '@/lib/events';
import {
  getChatMessages,
  saveChatMessage,
  clearChatHistory,
  buildEventContextSummary,
  getUserQuestionCount,
  incrementUserQuestionCount,
  MAX_USER_QUESTIONS,
} from '@/lib/chat';
import { generateChatResponse } from '@/lib/gemini';
import { sendChatMessageSchema } from '@/lib/validations/chat';
import { parseNumericId } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const eventId = parseNumericId(rawId);
    if (!eventId) {
      return NextResponse.json({ success: false, error: 'Invalid event ID.' }, { status: 400 });
    }

    const event = await getEventById(eventId);
    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found.' }, { status: 404 });
    }

    const headerUserId = request.headers.get('x-user-id');
    if (event.user_id && headerUserId && event.user_id !== headerUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized celebration access.' }, { status: 403 });
    }

    const messages = await getChatMessages(eventId, 100);
    const contextSummary = await buildEventContextSummary(eventId);
    const effectiveUserId = headerUserId || event.user_id || null;
    const questionCount = await getUserQuestionCount(eventId, effectiveUserId);
    const questionsRemaining = Math.max(0, MAX_USER_QUESTIONS - questionCount);

    return NextResponse.json({
      success: true,
      data: {
        messages,
        eventContextSummary: contextSummary,
        questionCount,
        questionLimit: MAX_USER_QUESTIONS,
        questionsRemaining,
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
    const eventId = parseNumericId(rawId);
    if (!eventId) {
      return NextResponse.json({ success: false, error: 'Invalid event ID.' }, { status: 400 });
    }

    const event = await getEventById(eventId);
    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found.' }, { status: 404 });
    }

    const headerUserId = request.headers.get('x-user-id');
    if (event.user_id && headerUserId && event.user_id !== headerUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized celebration access.' }, { status: 403 });
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
    const userName = validationResult.data.userName;
    const effectiveUserId = headerUserId || event.user_id || null;

    // Check 5-question limit per user
    const currentQuestionCount = await getUserQuestionCount(eventId, effectiveUserId);
    if (currentQuestionCount >= MAX_USER_QUESTIONS) {
      return NextResponse.json(
        {
          success: false,
          error: `You have reached the limit of ${MAX_USER_QUESTIONS} questions for the AI assistant.`,
          questionCount: currentQuestionCount,
          questionLimit: MAX_USER_QUESTIONS,
          questionsRemaining: 0,
        },
        { status: 403 }
      );
    }

    // 1. Save user message to database & increment counter
    const userMessage = await saveChatMessage(eventId, 'user', userText, effectiveUserId);
    await incrementUserQuestionCount(eventId, effectiveUserId);
    const newQuestionCount = currentQuestionCount + 1;

    // 2. Fetch history and build live event context
    const history = await getChatMessages(eventId, 20);
    const eventContextSummary = await buildEventContextSummary(eventId);

    // 3. Generate response with Gemini (or grounded assistant)
    const aiResult = await generateChatResponse(
      event,
      userText,
      history,
      eventContextSummary,
      userName
    );

    // 4. Save assistant response to database
    const assistantMessage = await saveChatMessage(eventId, 'assistant', aiResult.response, effectiveUserId);

    return NextResponse.json(
      {
        success: true,
        data: {
          userMessage,
          assistantMessage,
          isMock: aiResult.isMock,
          model: aiResult.model,
          questionCount: newQuestionCount,
          questionLimit: MAX_USER_QUESTIONS,
          questionsRemaining: Math.max(0, MAX_USER_QUESTIONS - newQuestionCount),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in chat assistant:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate assistant response.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const eventId = parseNumericId(rawId);
    if (!eventId) {
      return NextResponse.json({ success: false, error: 'Invalid event ID.' }, { status: 400 });
    }

    const event = await getEventById(eventId);
    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found.' }, { status: 404 });
    }

    const headerUserId = request.headers.get('x-user-id');
    if (event.user_id && headerUserId && event.user_id !== headerUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized celebration access.' }, { status: 403 });
    }

    await clearChatHistory(eventId);

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
