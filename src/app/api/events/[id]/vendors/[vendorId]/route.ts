import { NextResponse } from 'next/server';
import { updateVendor, deleteVendor, getVendorById, getVendorStats } from '@/lib/vendors';
import { updateVendorSchema } from '@/lib/validations/vendor';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string; vendorId: string }>;
}

function parseIds(rawEventId: string, rawVendorId: string) {
  const eventId = parseInt(rawEventId, 10);
  const vendorId = parseInt(rawVendorId, 10);
  if (isNaN(eventId) || eventId <= 0 || isNaN(vendorId) || vendorId <= 0) {
    return null;
  }
  return { eventId, vendorId };
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id: rawEventId, vendorId: rawVendorId } = await context.params;
    const parsed = parseIds(rawEventId, rawVendorId);
    if (!parsed) {
      return NextResponse.json({ success: false, error: 'Invalid ID parameters.' }, { status: 400 });
    }

    const existing = await getVendorById(parsed.vendorId);
    if (!existing || existing.event_id !== parsed.eventId) {
      return NextResponse.json({ success: false, error: 'Vendor not found for this event.' }, { status: 404 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    const validationResult = updateVendorSchema.safeParse(body);
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

    const updated = await updateVendor(parsed.vendorId, validationResult.data);
    const stats = await getVendorStats(parsed.eventId);

    return NextResponse.json({
      success: true,
      data: {
        vendor: updated,
        stats,
      },
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    return NextResponse.json({ success: false, error: 'Failed to update vendor.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id: rawEventId, vendorId: rawVendorId } = await context.params;
    const parsed = parseIds(rawEventId, rawVendorId);
    if (!parsed) {
      return NextResponse.json({ success: false, error: 'Invalid ID parameters.' }, { status: 400 });
    }

    const existing = await getVendorById(parsed.vendorId);
    if (!existing || existing.event_id !== parsed.eventId) {
      return NextResponse.json({ success: false, error: 'Vendor not found for this event.' }, { status: 404 });
    }

    const deleted = await deleteVendor(parsed.vendorId);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Failed to delete vendor.' }, { status: 500 });
    }

    const stats = await getVendorStats(parsed.eventId);

    return NextResponse.json({
      success: true,
      data: {
        id: parsed.vendorId,
        stats,
        message: 'Vendor removed.',
      },
    });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete vendor.' }, { status: 500 });
  }
}
