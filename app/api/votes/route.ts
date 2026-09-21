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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Check if vote already exists
    const checkResponse = await fetch(
      `${supabaseUrl}/rest/v1/votes?listingId=eq.${listingId}&voterId=eq.${voterId}`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (checkResponse.ok) {
      const existing = await checkResponse.json();
      if (existing.length > 0) {
        return NextResponse.json(
          { error: 'Already voted', voted: true },
          { status: 400 }
        );
      }
    }

    // Create vote record
    const voteId = 'vote_' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();

    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/votes`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        id: voteId,
        listing_id: listingId,
        voter_id: voterId,
        created_at: now,
      }),
    });

    if (!insertResponse.ok) {
      const error = await insertResponse.json();
      console.error('Vote insert error:', error);
      throw new Error(error.message || 'Failed to record vote');
    }

    // Update listing view count as a proxy for votes (until we migrate to proper vote columns)
    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/listings?id=eq.${listingId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          views: 'views + 1',  // Will increment by 1
        }),
      }
    );

    if (!updateResponse.ok) {
      console.error('Vote count update error');
    }

    return NextResponse.json(
      { success: true, voted: true },
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    if (!listingId) {
      return NextResponse.json(
        { error: 'Missing listingId' },
        { status: 400 }
      );
    }

    // Get vote count for listing
    const response = await fetch(
      `${supabaseUrl}/rest/v1/votes?listing_id=eq.${listingId}&select=id`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ voteCount: 0, userVoted: false });
    }

    const votes = await response.json();
    const voteCount = votes.length;

    let userVoted = false;
    if (voterId) {
      const userVoteResponse = await fetch(
        `${supabaseUrl}/rest/v1/votes?listing_id=eq.${listingId}&voter_id=eq.${voterId}`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      if (userVoteResponse.ok) {
        const userVotes = await userVoteResponse.json();
        userVoted = userVotes.length > 0;
      }
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
