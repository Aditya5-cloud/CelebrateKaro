import { NextResponse } from 'next/server';
import { verifyUserCredentials } from '@/lib/users';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    let body: { email?: string; password?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request payload.' },
        { status: 400 }
      );
    }

    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const result = await verifyUserCredentials(email, password);

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, error: result.error || 'Authentication failed.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user: result.user },
    });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error during login. Please try again.' },
      { status: 500 }
    );
  }
}
