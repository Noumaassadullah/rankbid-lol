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
      include: {
        payments: {
          where: { status: 'completed' },
          select: {
            amount: true,
            paidAt: true,
          },
          orderBy: { paidAt: 'desc' },
          take: 10,
        },
        dailyRanks: {
          orderBy: { date: 'desc' },
          take: 7,
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Calculate additional stats
    const totalPayments = listing.payments.length;
    const averageBid = totalPayments > 0
      ? listing.payments.reduce((sum, p) => sum + p.amount, 0) / totalPayments
      : 0;

    // Calculate all-time rank
    const higherRankedListings = await prisma.listing.count({
      where: { totalPaid: { gt: listing.totalPaid } },
    });

    // Calculate daily rank for today
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const dailyHigherRanked = await prisma.listing.count({
      where: {
        dayPaid: { gt: listing.dayPaid },
      },
    });

    return NextResponse.json({
      listing: {
        ...listing,
        allTimeRank: higherRankedListings + 1,
        dailyRank: dailyHigherRanked + 1,
        stats: {
          totalPayments,
          averageBid: Math.round(averageBid),
          recentPayments: listing.payments,
          weeklyTrend: listing.dailyRanks,
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
