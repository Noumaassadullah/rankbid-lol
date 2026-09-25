import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daysBack = parseInt(searchParams.get('daysBack') || '30');

    let snapshots: any[] = [];

    // Get today's date
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    try {
      // Fetch listings from the submissions API which includes URLs
      const origin = new URL(request.url).origin;
      const listingsRes = await fetch(
        `${origin}/api/listings/submit?limit=1000&sort=dayVotes`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!listingsRes.ok) {
        console.warn('Failed to fetch listings');
        return NextResponse.json({ snapshots: [], totalDays: 0 });
      }

      const data = await listingsRes.json();
      const listings = data.listings || [];

      // Filter listings with day_votes > 0 and sort by day_votes descending
      const topListingsToday = listings
        .filter((l: any) => (l.dayVotes || 0) > 0)
        .sort((a: any, b: any) => (b.dayVotes || 0) - (a.dayVotes || 0))
        .slice(0, 100);

      // If there are listings with votes, create today's snapshot
      if (topListingsToday && topListingsToday.length > 0) {
        const todaySnapshotData = {
          id: 'today-temp',
          date: today,
          data: topListingsToday.map((listing: any, idx: number) => ({
            rank: idx + 1,
            listing: {
              id: listing.id,
              title: listing.title,
              url: listing.url || `https://rankbid-lol.vercel.app/listing/${listing.id}`,
            },
            votes: listing.dayVotes || 0,
          })),
          frozen: false,
          createdAt: today,
          updatedAt: today,
        };

        snapshots = [todaySnapshotData];
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      return NextResponse.json({ snapshots: [], totalDays: 0 });
    }

    return NextResponse.json({
      snapshots: snapshots,
      totalDays: snapshots.length,
    });
  } catch (error) {
    console.error('Error fetching daily snapshots:', error);
    return NextResponse.json(
      {
        snapshots: [],
        error: 'Failed to fetch daily snapshots',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 200 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // This endpoint could be used by a cron job to create permanent snapshots
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const origin = new URL(request.url).origin;

    try {
      // Get today's top listings
      const listingsRes = await fetch(
        `${origin}/api/listings/submit?limit=1000&sort=dayVotes`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!listingsRes.ok) {
        return NextResponse.json({ message: 'Could not fetch listings' }, { status: 200 });
      }

      const data = await listingsRes.json();
      const listings = data.listings || [];
      const topListings = listings
        .filter((l: any) => (l.dayVotes || 0) > 0)
        .sort((a: any, b: any) => (b.dayVotes || 0) - (a.dayVotes || 0))
        .slice(0, 100);

      return NextResponse.json({
        message: 'Daily snapshot data available',
        count: topListings.length
      });
    } catch (error) {
      console.error('Error creating snapshot:', error);
      return NextResponse.json({ message: 'Could not create snapshot' }, { status: 200 });
    }
  } catch (error) {
    console.error('Error in POST daily snapshots:', error);
    return NextResponse.json(
      { error: 'Failed to create daily snapshot' },
      { status: 500 }
    );
  }
}
