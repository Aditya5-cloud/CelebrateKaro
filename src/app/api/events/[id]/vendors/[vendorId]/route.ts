import { NextResponse } from 'next/server';
import { updateVendor, deleteVendor, getVendorById, getVendorStats } from '@/lib/vendors';
import { updateVendorSchema } from '@/lib/validations/vendor';
import { parseNestedNumericIds } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string; vendorId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id: rawEventId, vendorId: rawVendorId } = await context.params;
    const ids = parseNestedNumericIds(rawEventId, rawVendorId);
    if (!ids) {
      return NextResponse.json({ success: false, error: 'Invalid ID parameters.' }, { status: 400 });
    }
    const [eventId, vendorId] = ids;

    const existing = await getVendorById(vendorId);
    if (!existing || existing.event_id !== eventId) {
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

    const updated = await updateVendor(vendorId, validationResult.data);
    const stats = await getVendorStats(eventId);

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
    const ids = parseNestedNumericIds(rawEventId, rawVendorId);
    if (!ids) {
      return NextResponse.json({ success: false, error: 'Invalid ID parameters.' }, { status: 400 });
    }
    const [eventId, vendorId] = ids;

    const existing = await getVendorById(vendorId);
    if (!existing || existing.event_id !== eventId) {
      return NextResponse.json({ success: false, error: 'Vendor not found for this event.' }, { status: 404 });
    }

    const deleted = await deleteVendor(vendorId);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Failed to delete vendor.' }, { status: 500 });
    }

    const stats = await getVendorStats(eventId);

    return NextResponse.json({
      success: true,
      data: {
        id: vendorId,
        stats,
        message: 'Vendor removed.',
      },
    });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete vendor.' }, { status: 500 });
  }
}
