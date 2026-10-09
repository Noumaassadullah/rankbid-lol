import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/server/session';

export async function GET(request: NextRequest) {
  try {
    // Only ever the signed-in user's own data.
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = encodeURIComponent(user.id);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { votes: [] },
        { status: 200 }
      );
    }

    // Fetch user votes from Supabase
    const queryUrl = `${supabaseUrl}/rest/v1/user_votes?user_id=eq.${userId}&order=voted_at.desc`;

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

    // Get listing details for each vote
    const formattedVotes = await Promise.all(
      userVotes.map(async (vote: any) => {
        let listing = null;

        try {
          const response = await fetch(
            `${supabaseUrl}/rest/v1/listings?id=eq.${encodeURIComponent(vote.listing_id)}`,
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
