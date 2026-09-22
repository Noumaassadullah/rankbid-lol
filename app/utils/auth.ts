import { cookies } from 'next/headers';

export function createSessionToken() {
  return 'session_' + Math.random().toString(36).substr(2, 32);
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });
}

export async function getAuthCookie() {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value;
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}
