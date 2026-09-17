import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daysBack = parseInt(searchParams.get('daysBack') || '30');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);

    // Get daily snapshots for the past N days
    const startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);
    startDate.setUTCDate(startDate.getUTCDate() - daysBack);

    const endDate = new Date();
    endDate.setUTCHours(23, 59, 59, 999);

    // Get all listings with their daily paid amounts for each day
    const dailyRanks = await prisma.dailyRank.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            url: true,
            description: true,
            category: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Group by date and calculate rankings
    const groupedByDate: { [key: string]: typeof dailyRanks } = {};
    dailyRanks.forEach(rank => {
      const dateKey = rank.date.toISOString().split('T')[0];
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(rank);
    });

    // Format response
    const snapshots = Object.entries(groupedByDate).map(([date, ranks]) => {
      const sorted = ranks.sort((a, b) => b.amount - a.amount).slice(0, limit);
      return {
        date,
        listings: sorted.map((rank, idx) => ({
          rank: idx + 1,
          listing: rank.listing,
          amount: rank.amount,
        })),
      };
    });

    return NextResponse.json({
      snapshots,
      totalDays: Object.keys(groupedByDate).length,
    });
  } catch (error) {
    console.error('Error fetching daily snapshots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily snapshots' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Create a snapshot of current daily rankings at UTC midnight
    // This should be called by a cron job daily
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Check if snapshot for today already exists
    const existing = await prisma.dailySnapshot.findUnique({
      where: { date: today },
    });

    if (existing) {
      return NextResponse.json({ message: 'Snapshot already exists for today' }, { status: 200 });
    }

    // Get top 10 listings by daily paid amount
    const topListings = await prisma.listing.findMany({
      where: {
        dayPaid: { gt: 0 },
      },
      orderBy: { dayPaid: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        url: true,
        dayPaid: true,
      },
    });

    // Create snapshot
    const snapshot = await prisma.dailySnapshot.create({
      data: {
        date: today,
        data: topListings.map((listing, idx) => ({
          rank: idx + 1,
          listing: listing,
          amount: listing.dayPaid,
        })) as any,
        frozen: true,
      },
    });

    return NextResponse.json({ snapshot, message: 'Daily snapshot created' });
  } catch (error) {
    console.error('Error creating daily snapshot:', error);
    return NextResponse.json(
      { error: 'Failed to create daily snapshot' },
      { status: 500 }
    );
  }
}
