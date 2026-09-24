import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: NextRequest) {
  try {
    const { listingId, voterId, userId } = await req.json();

    console.log('Vote request received:', { listingId, voterId });

    if (!listingId || !voterId) {
      return NextResponse.json(
        { error: 'Missing listingId or voterId' },
        { status: 400 }
      );
    }

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase config missing');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Check if vote already exists
    console.log('Checking for existing vote...');
    const checkRes = await fetch(
      `${supabaseUrl}/rest/v1/votes?listing_id=eq.${listingId}&voter_id=eq.${voterId}`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const existingVotes = await checkRes.json();
    if (existingVotes.length > 0) {
      console.log('Vote already exists');
      return NextResponse.json(
        { error: 'Already voted', voted: true },
        { status: 400 }
      );
    }

    // Create vote record
    console.log('Creating vote...');
    const voteId = `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/votes`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        id: voteId,
        listing_id: listingId,
        voter_id: voterId,
        voted_at: new Date().toISOString(),
      }),
    });

    if (!insertRes.ok) {
      console.error('Failed to insert vote:', await insertRes.text());
      throw new Error('Failed to insert vote');
    }
    console.log('Vote created successfully');

    // Also create UserVote record if userId is provided
    if (userId) {
      try {
        console.log('Creating UserVote for userId:', userId, 'listingId:', listingId);
        const userVoteId = `uv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const userVoteRes = await fetch(`${supabaseUrl}/rest/v1/user_votes`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            id: userVoteId,
            user_id: userId,
            listing_id: listingId,
            voted_at: new Date().toISOString(),
          }),
        });

        if (userVoteRes.ok) {
          console.log('UserVote created successfully');
        } else {
          const errorText = await userVoteRes.text();
          console.error('Failed to insert user vote:', userVoteRes.status, errorText);
          // If it's a duplicate key error, that's okay
          if (!errorText.includes('duplicate') && !errorText.includes('P0001')) {
            console.warn('UserVote creation had an issue but vote was recorded');
          }
        }
      } catch (error) {
        console.error('Error creating user vote:', error);
      }
    }

    // Get vote counts
    console.log('Counting votes...');
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayIso = today.toISOString();

    const countRes = await fetch(
      `${supabaseUrl}/rest/v1/votes?listing_id=eq.${listingId}&select=id`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'count=exact',
        },
      }
    );
    const totalVoteCount = parseInt(countRes.headers.get('content-range')?.split('/')[1] || '0');
    console.log('Total votes:', totalVoteCount);

    const dayCountRes = await fetch(
      `${supabaseUrl}/rest/v1/votes?listing_id=eq.${listingId}&voted_at=gte.${todayIso}&select=id`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'count=exact',
        },
      }
    );
    const dayVoteCount = parseInt(dayCountRes.headers.get('content-range')?.split('/')[1] || '0');
    console.log('Today votes:', dayVoteCount);

    // Update listing
    console.log('Updating listing vote counts...');
    const updateRes = await fetch(
      `${supabaseUrl}/rest/v1/listings?id=eq.${listingId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          total_votes: totalVoteCount,
          day_votes: dayVoteCount,
        }),
      }
    );

    if (!updateRes.ok) {
      console.error('Failed to update listing:', await updateRes.text());
    }
    console.log('Listing updated');

    return NextResponse.json(
      { success: true, voted: true, totalVotes: totalVoteCount, dayVotes: dayVoteCount },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json(
      { error: 'Failed to record vote. Please try again later.' },
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

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { voteCount: 0, userVoted: false },
        { status: 200 }
      );
    }

    // Get vote count
    const countRes = await fetch(
      `${supabaseUrl}/rest/v1/votes?listing_id=eq.${listingId}&select=id`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'count=exact',
        },
      }
    );
    const voteCount = parseInt(countRes.headers.get('content-range')?.split('/')[1] || '0');

    let userVoted = false;
    if (voterId) {
      const checkRes = await fetch(
        `${supabaseUrl}/rest/v1/votes?listing_id=eq.${listingId}&voter_id=eq.${voterId}`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );
      const votes = await checkRes.json();
      userVoted = votes.length > 0;
    }

    return NextResponse.json({ voteCount, userVoted });
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json(
      { voteCount: 0, userVoted: false },
      { status: 200 }
    );
  }
}
