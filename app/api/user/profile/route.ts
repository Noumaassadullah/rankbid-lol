import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/server/session';
import { NextRequest, NextResponse } from 'next/server';

// The profile is always the signed-in user's own, identified by the session cookie.

export async function GET(request: NextRequest) {
  const session = await getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(session);
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json().catch(() => ({}));
    if (name !== undefined && (typeof name !== 'string' || name.length > 80)) {
      return NextResponse.json({ error: 'Name must be 80 characters or fewer' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.id },
      data: { ...(name !== undefined && { name: name.trim() || null }) },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
