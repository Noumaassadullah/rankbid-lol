import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { listingId, voterId } = await req.json();

    if (!listingId || !voterId) {
      return NextResponse.json(
        { error: 'Missing listingId or voterId' },
        { status: 400 }
      );
    }

    // Check if vote already exists
    const existingResult = await query(
      'SELECT id FROM votes WHERE listing_id = $1 AND voter_id = $2 LIMIT 1',
      [listingId, voterId]
    );

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Already voted', voted: true },
        { status: 400 }
      );
    }

    // Create vote record
    const voteId = `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await query(
      'INSERT INTO votes (id, listing_id, voter_id, voted_at) VALUES ($1, $2, $3, NOW())',
      [voteId, listingId, voterId]
    );

    // Update listing vote counts
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const dayVotesResult = await query(
      'SELECT COUNT(*) as count FROM votes WHERE listing_id = $1 AND voted_at >= $2',
      [listingId, today]
    );
    const dayVoteCount = parseInt(dayVotesResult.rows[0]?.count || '0');

    const totalVotesResult = await query(
      'SELECT COUNT(*) as count FROM votes WHERE listing_id = $1',
      [listingId]
    );
    const totalVoteCount = parseInt(totalVotesResult.rows[0]?.count || '0');

    await query(
      'UPDATE listings SET total_votes = $1, day_votes = $2 WHERE id = $3',
      [totalVoteCount, dayVoteCount, listingId]
    );

    return NextResponse.json(
      { success: true, voted: true, totalVotes: totalVoteCount, dayVotes: dayVoteCount },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json(
      {
        error: 'Failed to record vote. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get('listingId');
    const voterId = searchParams.get('voterId');

    if (!listingId) {
      return NextResponse.json(
        { error: 'Missing listingId' },
        { status: 400 }
      );
    }

    // Get vote count
    const voteResult = await query(
      'SELECT COUNT(*) as count FROM votes WHERE listing_id = $1',
      [listingId]
    );
    const voteCount = parseInt(voteResult.rows[0]?.count || '0');

    let userVoted = false;
    if (voterId) {
      const userVoteResult = await query(
        'SELECT id FROM votes WHERE listing_id = $1 AND voter_id = $2 LIMIT 1',
        [listingId, voterId]
      );
      userVoted = userVoteResult.rows.length > 0;
    }

    return NextResponse.json({ voteCount, userVoted });
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json(
      { voteCount: 0, userVoted: false, error: 'Failed to fetch votes' },
      { status: 200 }
    );
  }
}
