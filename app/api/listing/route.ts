import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('id');
    const url = searchParams.get('url');

    if (!listingId && !url) {
      return NextResponse.json(
        { error: 'Listing ID or URL required' },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: listingId ? { id: listingId } : { url: url || '' },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Calculate all-time rank based on votes
    const higherRankedListings = await prisma.listing.count({
      where: { totalVotes: { gt: listing.totalVotes } },
    });

    // Calculate daily rank for today based on votes
    const dailyHigherRanked = await prisma.listing.count({
      where: {
        dayVotes: { gt: listing.dayVotes },
      },
    });

    return NextResponse.json({
      listing: {
        ...listing,
        allTimeRank: higherRankedListings + 1,
        dailyRank: dailyHigherRanked + 1,
        stats: {
          totalVotes: listing.totalVotes,
          dayVotes: listing.dayVotes,
          clickCount: listing.clickCount,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}
