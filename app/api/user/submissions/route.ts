import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

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

    // Query Supabase listings table for user's submissions
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/listings?user_id=eq.${userId}&order=created_at.desc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { listings: [] },
        { status: 200 }
      );
    }

    const listings = await response.json();

    // Transform Supabase response to match expected format
    const transformedListings = listings.map((listing: any) => ({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      url: listing.location,
      handle: listing.handle,
      platform: listing.platform || 'website',
      totalVotes: listing.total_votes || 0,
      dayVotes: listing.day_votes || 0,
      category: listing.category,
      createdAt: listing.created_at,
    }));

    return NextResponse.json(
      { listings: transformedListings },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions', listings: [] },
      { status: 500 }
    );
  }
}
