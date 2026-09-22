import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

const ADMIN_KEY = process.env.ADMIN_KEY || 'admin-secret-key';

function verifyAdminKey(req: NextRequest): boolean {
  const adminKey = req.headers.get('x-admin-key');
  return adminKey === ADMIN_KEY;
}

export async function GET(req: NextRequest) {
  if (!verifyAdminKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params: any[] = [];

    if (search) {
      whereClause = ` WHERE email ILIKE $1 OR name ILIKE $1`;
      params.push(`%${search}%`);
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as count FROM users ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get users with vote stats
    const usersResult = await query(
      `SELECT u.id, u.email, u.name, u.created_at,
              COUNT(DISTINCT v.id) as vote_count,
              COUNT(DISTINCT s.id) as session_count
       FROM users u
       LEFT JOIN user_votes v ON u.id = v.user_id
       LEFT JOIN sessions s ON u.id = s.user_id
       ${whereClause}
       GROUP BY u.id, u.email, u.name, u.created_at
       ORDER BY u.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      users: usersResult.rows,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!verifyAdminKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Delete related data
    await query('DELETE FROM user_votes WHERE user_id = $1', [userId]);
    await query('DELETE FROM sessions WHERE user_id = $1', [userId]);
    await query('DELETE FROM users WHERE id = $1', [userId]);

    return NextResponse.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
