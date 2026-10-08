import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, isAdminRequest, isValidAdminKey } from '@/lib/server/admin';

// GET: is this browser an admin (admin key cookie, or signed in with an admin email)?
export async function GET(req: NextRequest) {
  return NextResponse.json({ admin: await isAdminRequest(req) });
}

// POST { key }: exchange the admin key for an httpOnly cookie.
export async function POST(req: NextRequest) {
  const { key } = await req.json().catch(() => ({ key: null }));
  if (!isValidAdminKey(key)) {
    return NextResponse.json({ error: 'Invalid admin key' }, { status: 401 });
  }
  const res = NextResponse.json({ admin: true });
  res.cookies.set(ADMIN_COOKIE, key, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });
  return res;
}

// DELETE: sign the admin key out.
export async function DELETE() {
  const res = NextResponse.json({ admin: false });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
