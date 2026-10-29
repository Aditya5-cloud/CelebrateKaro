import { NextResponse } from 'next/server';
import { createUser } from '@/lib/users';
import type { UserRole } from '@/types';

export const dynamic = 'force-dynamic';

const VALID_ROLES: readonly UserRole[] = ['host', 'coordinator', 'community', 'planner'];

export async function POST(request: Request) {
  try {
    let body: { name?: string; email?: string; password?: string; role?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request payload.' },
        { status: 400 }
      );
    }

    const { name, email, password, role } = body;
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    const parsedRole: UserRole | undefined =
      role && (VALID_ROLES as readonly string[]).includes(role)
        ? (role as UserRole)
        : undefined;

    const result = await createUser({
      name,
      email,
      password,
      role: parsedRole,
    });

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create user account.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: { user: result.user },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error during registration. Please try again.' },
      { status: 500 }
    );
  }
}
