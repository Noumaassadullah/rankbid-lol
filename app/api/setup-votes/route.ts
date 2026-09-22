import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Add total_votes and day_votes columns to listings if they don't exist
    await query(`
      ALTER TABLE listings
      ADD COLUMN IF NOT EXISTS total_votes INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS day_votes INTEGER DEFAULT 0
    `);

    // Create index on vote columns for faster sorting
    await query(`
      CREATE INDEX IF NOT EXISTS idx_listings_total_votes ON listings(total_votes DESC)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_listings_day_votes ON listings(day_votes DESC)
    `);

    // Recalculate votes for all listings from the votes table
    const listingsResult = await query('SELECT DISTINCT listing_id FROM votes');

    for (const row of listingsResult.rows) {
      const listingId = row.listing_id;

      // Count total votes
      const totalResult = await query(
        'SELECT COUNT(*) as count FROM votes WHERE listing_id = $1',
        [listingId]
      );
      const totalVotes = parseInt(totalResult.rows[0]?.count || '0');

      // Count today's votes
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const dayResult = await query(
        'SELECT COUNT(*) as count FROM votes WHERE listing_id = $1 AND voted_at >= $2',
        [listingId, today]
      );
      const dayVotes = parseInt(dayResult.rows[0]?.count || '0');

      // Update listing
      await query(
        'UPDATE listings SET total_votes = $1, day_votes = $2 WHERE id = $3',
        [totalVotes, dayVotes, listingId]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Database setup complete. Votes tracked for all listings.'
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
