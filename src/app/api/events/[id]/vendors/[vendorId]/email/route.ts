import { NextResponse } from 'next/server';
import { getEventById } from '@/lib/events';
import { getVendorById } from '@/lib/vendors';
import { generateVendorEmail } from '@/lib/gemini';
import { draftVendorEmailSchema } from '@/lib/validations/vendor';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string; vendorId: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id: rawEventId, vendorId: rawVendorId } = await context.params;
    const eventId = parseInt(rawEventId, 10);
    const vendorId = parseInt(rawVendorId, 10);

    if (isNaN(eventId) || eventId <= 0 || isNaN(vendorId) || vendorId <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid ID parameters.' }, { status: 400 });
    }

    const event = getEventById(eventId);
    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found.' }, { status: 404 });
    }

    const vendor = getVendorById(vendorId);
    if (!vendor || vendor.event_id !== event.id) {
      return NextResponse.json({ success: false, error: 'Vendor not found for this event.' }, { status: 404 });
    }

    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is acceptable (uses defaults)
      body = {};
    }

    const validationResult = draftVendorEmailSchema.safeParse(body);
    if (!validationResult.success) {
      const issues = validationResult.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json(
        {
          success: false,
          error: issues || 'Invalid email draft parameters.',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const draft = await generateVendorEmail(event, vendor, validationResult.data);

    return NextResponse.json({
      success: true,
      data: {
        subject: draft.subject,
        body: draft.body,
        isMock: draft.isMock,
        model: draft.model,
        vendor: {
          id: vendor.id,
          name: vendor.name,
          category: vendor.category,
          contact_email: vendor.contact_email,
        },
      },
    });
  } catch (error) {
    console.error('Error drafting vendor email:', error);
    return NextResponse.json({ success: false, error: 'Failed to draft vendor email.' }, { status: 500 });
  }
}
