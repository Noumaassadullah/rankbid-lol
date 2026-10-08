import { NextRequest, NextResponse } from 'next/server';
import { sbHeaders, sbUrl } from '@/lib/server/votes';
import { isAdminRequest, sbSelect, submissionCountsByUser, toAdminUser } from '@/lib/server/admin';

const cleanSearch = (s: string) => s.replace(/[,()*\\]/g, ' ').trim();

// GET ?page&limit&search — users, newest first, with how many listings each submitted.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20') || 20));
    const search = cleanSearch(searchParams.get('search') || '');

    let path = `users?select=*&order=created_at.desc&limit=${limit}&offset=${(page - 1) * limit}`;
    if (search) {
      const q = encodeURIComponent(`*${search}*`);
      path += `&or=(email.ilike.${q},name.ilike.${q})`;
    }

    const [{ rows, total }, counts] = await Promise.all([
      sbSelect<Record<string, unknown>>(path),
      submissionCountsByUser(),
    ]);

    return NextResponse.json({
      users: rows.map((row) => toAdminUser(row, counts.get(String(row.id)))),
      pagination: { total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// DELETE { userId } — deletes the account, its sessions and its votes. Their listings stay.
export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const id = encodeURIComponent(userId);
    const del = (path: string) => fetch(sbUrl(path), { method: 'DELETE', headers: sbHeaders() });
    await Promise.all([del(`user_votes?user_id=eq.${id}`), del(`sessions?user_id=eq.${id}`)]);
    const res = await del(`users?id=eq.${id}`);
    if (!res.ok) throw new Error(await res.text());

    return NextResponse.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
