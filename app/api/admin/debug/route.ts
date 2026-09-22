import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Test database connection
    const testResult = await query('SELECT COUNT(*) as count FROM listings');
    const listingCount = testResult.rows[0]?.count || 0;

    const usersResult = await query('SELECT COUNT(*) as count FROM users');
    const userCount = usersResult.rows[0]?.count || 0;

    const votesResult = await query('SELECT COUNT(*) as count FROM user_votes');
    const voteCount = votesResult.rows[0]?.count || 0;

    const adminKey = process.env.ADMIN_KEY || 'admin-secret-key';
    const headerKey = req.headers.get('x-admin-key');

    return NextResponse.json({
      status: 'success',
      database: {
        listings: listingCount,
        users: userCount,
        votes: voteCount
      },
      adminKey: {
        expected: adminKey,
        received: headerKey,
        matches: adminKey === headerKey
      },
      debug: {
        message: 'Database connected successfully'
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
}
