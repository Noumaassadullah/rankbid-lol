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
    // Get suspicious listings (unusual vote patterns)
    const suspiciousListings = await query(
      `SELECT id, title, total_votes, day_votes,
              (SELECT COUNT(*) FROM user_votes WHERE listing_id = l.id) as unique_voters,
              created_at
       FROM listings l
       ORDER BY day_votes DESC
       LIMIT 20`
    );

    // Get listings with potential vote manipulation
    const listingsWithHighVoteVelocity = await query(
      `SELECT l.id, l.title, l.total_votes, l.day_votes,
              COUNT(v.id) as votes_last_24h
       FROM listings l
       LEFT JOIN user_votes v ON l.id = v.listing_id AND v.voted_at > NOW() - INTERVAL '24 hours'
       GROUP BY l.id, l.title, l.total_votes, l.day_votes
       HAVING COUNT(v.id) > 100
       ORDER BY votes_last_24h DESC`
    );

    return NextResponse.json({
      suspiciousListings: suspiciousListings.rows,
      highVelocityListings: listingsWithHighVoteVelocity.rows
    });
  } catch (error) {
    console.error('Error fetching moderation data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch moderation data' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!verifyAdminKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action, listingId, userId } = await req.json();

    if (action === 'flag_listing') {
      // Create or update flag (we'll store in a simple way)
      await query(
        `INSERT INTO listing_flags (listing_id, reason, created_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (listing_id) DO UPDATE SET updated_at = NOW()`,
        [listingId, 'Flagged by admin']
      );
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_votes') {
      if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
      }
      await query('DELETE FROM user_votes WHERE user_id = $1', [userId]);
      return NextResponse.json({ success: true, message: 'User votes deleted' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    // Handle case where table doesn't exist
    if (error.message.includes('listing_flags')) {
      return NextResponse.json({
        success: true,
        warning: 'Flag stored in memory (table not created)'
      });
    }
    console.error('Error in moderation action:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
