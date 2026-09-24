import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { votes: [] },
        { status: 200 }
      );
    }

    // Fetch user votes from Supabase
    console.log('Fetching votes for userId:', userId);
    const queryUrl = `${supabaseUrl}/rest/v1/user_votes?user_id=eq.${userId}&order=voted_at.desc`;
    console.log('Query URL:', queryUrl);

    const votesRes = await fetch(queryUrl, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    if (!votesRes.ok) {
      console.error('Failed to fetch votes from Supabase:', votesRes.status, await votesRes.text());
      return NextResponse.json(
        { votes: [] },
        { status: 200 }
      );
    }

    const userVotes = await votesRes.json();
    console.log('Found user votes:', userVotes.length);
    if (userVotes.length > 0) {
      console.log('First vote:', userVotes[0]);
    }

    // Get listing details for each vote
    const formattedVotes = await Promise.all(
      userVotes.map(async (vote: any) => {
        let listing = null;

        try {
          const response = await fetch(
            `${supabaseUrl}/rest/v1/listings?id=eq.${vote.listing_id}`,
            {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
              },
            }
          );

          if (response.ok) {
            const listings = await response.json();
            if (listings.length > 0) {
              const listingData = listings[0];
              listing = {
                id: listingData.id,
                title: listingData.title,
                description: listingData.description,
                url: listingData.location || listingData.url,
                totalVotes: listingData.total_votes || 0,
              };
            }
          }
        } catch (err) {
          console.error('Error fetching listing:', err);
        }

        return {
          id: vote.id,
          listingId: vote.listing_id,
          votedAt: vote.voted_at,
          listing,
        };
      })
    );

    return NextResponse.json(
      { votes: formattedVotes },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user votes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch votes', votes: [] },
      { status: 500 }
    );
  }
}
