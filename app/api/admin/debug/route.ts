import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAdminRequest } from '@/lib/server/admin';

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Test database connection
    const testResult = await query('SELECT COUNT(*) as count FROM listings');
    const listingCount = testResult.rows[0]?.count || 0;

    const usersResult = await query('SELECT COUNT(*) as count FROM users');
    const userCount = usersResult.rows[0]?.count || 0;

    const votesResult = await query('SELECT COUNT(*) as count FROM user_votes');
    const voteCount = votesResult.rows[0]?.count || 0;

    return NextResponse.json({
      status: 'success',
      database: {
        listings: listingCount,
        users: userCount,
        votes: voteCount
      },
      adminKey: {
        configured: Boolean(process.env.ADMIN_KEY),
      },
      debug: {
        message: 'Database connected successfully'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
