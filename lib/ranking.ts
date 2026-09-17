import { prisma } from './prisma';
import { Category } from '@prisma/client';

export interface RankedListing {
  id: string;
  title: string;
  description: string;
  url: string;
  handle?: string;
  category: Category;
  favicon?: string;
  logo?: string;
  totalPaid: number;
  dayPaid: number;
  clickCount: number;
  createdAt: Date;
  lastRaisedAt: Date;
  rank: number;
  amountToOutrank: number;
}

export async function getRankedListings(
  category: Category | 'All' = 'All',
  timeWindow: 'alltime' | 'today' | 'daily' = 'alltime',
  dailyDate?: Date
): Promise<RankedListing[]> {
  let listings;

  if (timeWindow === 'alltime') {
    listings = await prisma.listing.findMany({
      where: category !== 'All' ? { category } : {},
      orderBy: { totalPaid: 'desc' },
    });

    return listings.map((listing, index) => ({
      ...listing,
      handle: listing.handle || undefined,
      rank: index + 1,
      amountToOutrank: listing.totalPaid + 500, // $5 in cents
    }));
  }

  if (timeWindow === 'today') {
    listings = await prisma.listing.findMany({
      where: category !== 'All' ? { category } : {},
      orderBy: { dayPaid: 'desc' },
    });

    return listings.map((listing, index) => ({
      ...listing,
      handle: listing.handle || undefined,
      rank: index + 1,
      amountToOutrank: listing.dayPaid + 500,
    }));
  }

  if (timeWindow === 'daily' && dailyDate) {
    const midnight = new Date(dailyDate);
    midnight.setUTCHours(0, 0, 0, 0);
    const nextMidnight = new Date(midnight);
    nextMidnight.setUTCDate(nextMidnight.getUTCDate() + 1);

    const dailyRanks = await prisma.dailyRank.findMany({
      where: {
        date: { gte: midnight, lt: nextMidnight },
        ...(category !== 'All' && { listing: { category } }),
      },
      include: { listing: true },
      orderBy: { amount: 'desc' },
    });

    return dailyRanks.map((dr, index) => ({
      ...dr.listing,
      handle: dr.listing.handle || undefined,
      rank: index + 1,
      amountToOutrank: dr.amount + 500,
      dayPaid: dr.amount,
    }));
  }

  return [];
}

export async function calculateDayPaid(listingId: string): Promise<number> {
  // Calculate dayPaid as the sum of all 'daily' bids from today (UTC midnight to now)
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const result = await prisma.payment.aggregate({
    where: {
      listingId,
      status: 'completed',
      bidType: 'daily',
      paidAt: { gte: today },
    },
    _sum: { amount: true },
  });

  return result._sum.amount || 0;
}

export async function getTotalPaid(listingId: string): Promise<number> {
  const result = await prisma.payment.aggregate({
    where: {
      listingId,
      status: 'completed',
      bidType: 'alltime',
    },
    _sum: { amount: true },
  });

  return result._sum.amount || 0;
}

export async function getAllPayments(listingId: string): Promise<number> {
  // Get total of all payments regardless of bidType (for Supabase sync)
  const result = await prisma.payment.aggregate({
    where: {
      listingId,
      status: 'completed',
    },
    _sum: { amount: true },
  });

  return result._sum.amount || 0;
}

export async function updateRankingCache() {
  // This runs periodically to update day-paid values
  const listings = await prisma.listing.findMany();

  for (const listing of listings) {
    const dayPaid = await calculateDayPaid(listing.id);
    const totalPaid = await getTotalPaid(listing.id);

    await prisma.listing.update({
      where: { id: listing.id },
      data: {
        dayPaid,
        totalPaid,
      },
    });
  }
}
