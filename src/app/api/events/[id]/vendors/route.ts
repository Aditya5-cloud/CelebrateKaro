import { NextResponse } from 'next/server';
import { getVendors, getVendorStats, createVendor, seedVendorTemplate } from '@/lib/vendors';
import { getEventById } from '@/lib/events';
import { createVendorSchema, vendorStatusEnum } from '@/lib/validations/vendor';
import type { VendorStatus } from '@/types';

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

    const event = await getEventById(eventId);
    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found.' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const categoryParam = searchParams.get('category') || undefined;

    let statusFilter: VendorStatus | undefined;
    if (statusParam) {
      const parsedStatus = vendorStatusEnum.safeParse(statusParam);
      if (parsedStatus.success) {
        statusFilter = parsedStatus.data;
      }
    }

    const vendors = await getVendors(eventId, { status: statusFilter, category: categoryParam });
    const stats = await getVendorStats(eventId);

    return NextResponse.json({
      success: true,
      data: {
        vendors,
        stats,
      },
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve vendors.' }, { status: 500 });
  }
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

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    // Auto-generate celebration vendor checklist
    if (body && typeof body === 'object' && 'action' in body && body.action === 'template') {
      const vendors = await seedVendorTemplate(eventId, event.event_type);
      const stats = await getVendorStats(eventId);
      return NextResponse.json(
        {
          success: true,
          data: {
            vendors,
            stats,
            message: `Vendor checklist generated for ${event.event_type}.`,
          },
        },
        { status: 201 }
      );
    }

    // Single vendor creation
    const validationResult = createVendorSchema.safeParse(body);
    if (!validationResult.success) {
      const issues = validationResult.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json(
        {
          success: false,
          error: issues || 'Invalid vendor parameters.',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const newVendor = await createVendor(eventId, validationResult.data);
    const stats = await getVendorStats(eventId);

    return NextResponse.json(
      {
        success: true,
        data: {
          vendor: newVendor,
          stats,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating vendor:', error);
    return NextResponse.json({ success: false, error: 'Failed to create vendor.' }, { status: 500 });
  }
}
