// Server-only: who is signed in, read from the httpOnly auth_token cookie.
// Never trust a user id sent by the browser (body, query or header); use this instead.
import { randomBytes } from 'crypto';
import type { NextRequest } from 'next/server';
import { sbHeaders, sbUrl, supabaseConfigured } from '@/lib/server/votes';

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
}

/** 256-bit random session token. */
export function createSessionToken(): string {
  return 'session_' + randomBytes(32).toString('base64url');
}

export async function getSessionUser(req: NextRequest): Promise<SessionUser | null> {
  const token = req.cookies.get('auth_token')?.value;
  if (!token || !supabaseConfigured()) return null;
  try {
    const sessionRes = await fetch(
      sbUrl(`sessions?token=eq.${encodeURIComponent(token)}&select=user_id,expires_at`),
      { headers: sbHeaders(), cache: 'no-store' }
    );
    if (!sessionRes.ok) return null;
    const [session] = await sessionRes.json();
    if (!session || new Date(session.expires_at) < new Date()) return null;

    const userRes = await fetch(
      sbUrl(`users?id=eq.${encodeURIComponent(session.user_id)}&select=id,email,name`),
      { headers: sbHeaders(), cache: 'no-store' }
    );
    if (!userRes.ok) return null;
    const [user] = await userRes.json();
    if (!user) return null;
    return { id: String(user.id), email: String(user.email).toLowerCase(), name: user.name ?? null };
  } catch {
    return null;
  }
}
