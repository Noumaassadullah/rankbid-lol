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
    // Total users
    const usersResult = await query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(usersResult.rows[0].count);

    // Total listings
    const listingsResult = await query('SELECT COUNT(*) as count FROM listings');
    const totalListings = parseInt(listingsResult.rows[0].count);

    // Total votes
    const votesResult = await query('SELECT COUNT(*) as count FROM user_votes');
    const totalVotes = parseInt(votesResult.rows[0].count);

    // Top listings
    const topListingsResult = await query(
      'SELECT id, title, total_votes, category FROM listings ORDER BY total_votes DESC LIMIT 10'
    );

    // Recent listings
    const recentListingsResult = await query(
      'SELECT id, title, created_at, category FROM listings ORDER BY created_at DESC LIMIT 10'
    );

    // Category breakdown
    const categoryResult = await query(
      'SELECT category, COUNT(*) as count, AVG(total_votes) as avg_votes FROM listings GROUP BY category ORDER BY count DESC'
    );

    // Premium listings
    const premiumResult = await query(
      `SELECT COUNT(*) as count,
              SUM(CASE WHEN payment_status = 'approved' THEN 1 ELSE 0 END) as approved,
              SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending
       FROM premium_listings`
    );

    // Daily stats for last 7 days
    const dailyStatsResult = await query(
      `SELECT DATE(created_at)::text as date, COUNT(*) as votes
       FROM user_votes
       WHERE created_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at)`
    );

    return NextResponse.json({
      stats: {
        totalUsers,
        totalListings,
        totalVotes,
        premiumListings: {
          total: parseInt(premiumResult.rows[0].count),
          approved: parseInt(premiumResult.rows[0].approved || 0),
          pending: parseInt(premiumResult.rows[0].pending || 0),
        }
      },
      topListings: topListingsResult.rows,
      recentListings: recentListingsResult.rows,
      categoryBreakdown: categoryResult.rows,
      dailyStats: dailyStatsResult.rows
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
