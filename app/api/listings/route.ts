import { prisma } from '@/lib/prisma';
import { normalizeURL, isValidPaymentURL, extractDomain } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') || 'All';
  const timeWindow = searchParams.get('window') || 'alltime';
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    let listings;

    if (timeWindow === 'alltime') {
      listings = await prisma.listing.findMany({
        ...(category !== 'All' && { where: { category: category as any } }),
        orderBy: { totalVotes: 'desc' },
        take: limit,
        skip: offset,
      });
    } else if (timeWindow === 'today') {
      listings = await prisma.listing.findMany({
        ...(category !== 'All' && { where: { category: category as any } }),
        orderBy: { dayVotes: 'desc' },
        take: limit,
        skip: offset,
      });
    } else {
      return NextResponse.json({ error: 'Invalid time window' }, { status: 400 });
    }

    const rankedListings = listings.map((listing, index) => ({
      ...listing,
      rank: offset + index + 1,
      votesToOutrank: (timeWindow === 'today' ? listing.dayVotes : listing.totalVotes) + 1,
    }));

    return NextResponse.json(rankedListings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, url, category } = body;

    // Validation
    if (!title || !url || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!isValidPaymentURL(url)) {
      return NextResponse.json({ error: 'URL not allowed on this platform' }, { status: 400 });
    }

    const normalizedURL = normalizeURL(url);
    const existingListing = await prisma.listing.findUnique({
      where: { url: normalizedURL },
    });

    if (existingListing) {
      return NextResponse.json({ error: 'URL already listed' }, { status: 409 });
    }

    const newListing = await prisma.listing.create({
      data: {
        title,
        description: description || '',
        url: normalizedURL,
        category,
      },
    });

    return NextResponse.json(newListing, { status: 201 });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
