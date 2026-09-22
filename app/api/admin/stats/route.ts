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
    let totalUsers = 0;
    try {
      const usersResult = await query('SELECT COUNT(*) as count FROM users');
      if (usersResult.rows[0]) {
        totalUsers = parseInt(usersResult.rows[0].count);
      }
    } catch (e) {
      console.error('Error counting users:', e);
    }

    // Total listings
    let totalListings = 0;
    try {
      const listingsResult = await query('SELECT COUNT(*) as count FROM listings');
      if (listingsResult.rows[0]) {
        totalListings = parseInt(listingsResult.rows[0].count);
      }
    } catch (e) {
      console.error('Error counting listings:', e);
    }

    // Total votes
    let totalVotes = 0;
    try {
      const votesResult = await query('SELECT COUNT(*) as count FROM user_votes');
      if (votesResult.rows[0]) {
        totalVotes = parseInt(votesResult.rows[0].count);
      }
    } catch (e) {
      console.error('Error counting votes:', e);
    }

    // Top listings
    let topListingsResult = { rows: [] };
    try {
      topListingsResult = await query(
        'SELECT id, title, total_votes, category FROM listings ORDER BY total_votes DESC LIMIT 10'
      );
    } catch (e) {
      console.error('Error fetching top listings:', e);
    }

    // Recent listings
    let recentListingsResult = { rows: [] };
    try {
      recentListingsResult = await query(
        'SELECT id, title, created_at, category FROM listings ORDER BY created_at DESC LIMIT 10'
      );
    } catch (e) {
      console.error('Error fetching recent listings:', e);
    }

    // Category breakdown
    let categoryResult = { rows: [] };
    try {
      categoryResult = await query(
        'SELECT category, COUNT(*) as count, AVG(total_votes) as avg_votes FROM listings GROUP BY category ORDER BY count DESC'
      );
    } catch (e) {
      console.error('Error fetching category breakdown:', e);
    }

    // Premium listings
    let premiumListings = { total: 0, approved: 0, pending: 0 };
    try {
      const premiumResult = await query(
        `SELECT COUNT(*) as count,
                SUM(CASE WHEN payment_status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending
         FROM premium_listings`
      );
      if (premiumResult.rows[0]) {
        premiumListings = {
          total: parseInt(premiumResult.rows[0].count || 0),
          approved: parseInt(premiumResult.rows[0].approved || 0),
          pending: parseInt(premiumResult.rows[0].pending || 0),
        };
      }
    } catch (e) {
      console.error('Error fetching premium listings:', e);
    }

    // Daily stats for last 7 days
    let dailyStatsResult = { rows: [] };
    try {
      dailyStatsResult = await query(
        `SELECT DATE(created_at)::text as date, COUNT(*) as votes
         FROM user_votes
         WHERE created_at >= NOW() - INTERVAL '7 days'
         GROUP BY DATE(created_at)
         ORDER BY DATE(created_at)`
      );
    } catch (e) {
      console.error('Error fetching daily stats:', e);
    }

    return NextResponse.json({
      stats: {
        totalUsers,
        totalListings,
        totalVotes,
        premiumListings
      },
      topListings: topListingsResult.rows,
      recentListings: recentListingsResult.rows,
      categoryBreakdown: categoryResult.rows,
      dailyStats: dailyStatsResult.rows
    });
  } catch (error) {
    console.error('Error in admin stats endpoint:', error);
    return NextResponse.json({
      stats: {
        totalUsers: 0,
        totalListings: 0,
        totalVotes: 0,
        premiumListings: { total: 0, approved: 0, pending: 0 }
      },
      topListings: [],
      recentListings: [],
      categoryBreakdown: [],
      dailyStats: []
    }, { status: 500 });
  }
}
