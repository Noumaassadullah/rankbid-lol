import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url, handle, description, category, platform } = await req.json();

    if (!url && !handle) {
      return NextResponse.json(
        { error: 'URL or handle required', listings: [] },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Category required', listings: [] },
        { status: 400 }
      );
    }

    const normalizedUrl = url || getPlatformUrl(platform, handle);

    let listing = await prisma.listing.findUnique({
      where: { url: normalizedUrl },
    });

    if (listing) {
      return NextResponse.json(
        { listing, isNew: false, listings: [] }
      );
    }

    listing = await prisma.listing.create({
      data: {
        url: normalizedUrl,
        handle: handle || undefined,
        title: description || normalizedUrl,
        description: description || normalizedUrl,
        category: (category as any) || 'Other',
        platform: platform || 'website',
        totalPaid: 0,
        dayPaid: 0,
        clickCount: 0,
      },
    });

    return NextResponse.json(
      { listing, isNew: true, listings: [] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting listing:', error);
    return NextResponse.json(
      { error: 'Internal server error', listings: [] },
      { status: 500 }
    );
  }
}

function getPlatformUrl(platform: string, handle: string | undefined): string {
  const baseUrls: { [key: string]: (handle: string) => string } = {
    twitter: (h) => `https://twitter.com/${h}`,
    facebook: (h) => `https://facebook.com/${h}`,
    instagram: (h) => `https://instagram.com/${h}`,
    tiktok: (h) => `https://tiktok.com/@${h}`,
  };

  if (platform && handle && baseUrls[platform]) {
    return baseUrls[platform](handle);
  }

  return handle ? `https://twitter.com/${handle}` : 'https://example.com';
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '100');
    const sort = searchParams.get('sort') || 'totalPaid';

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { listings: [], listing: null, warning: 'Database not configured' },
        { status: 200 }
      );
    }

    if (url) {
      try {
        const listing = await prisma.listing.findUnique({
          where: { url },
          include: {
            payments: {
              where: { status: 'completed' },
              orderBy: { paidAt: 'desc' },
            },
          },
        });
        return NextResponse.json({ listing, listings: [] });
      } catch (dbError) {
        console.error('Database error:', dbError);
        return NextResponse.json({ listing: null, listings: [] });
      }
    }

    const where: any = {};
    if (category && category !== 'All') {
      where.category = category;
    }

    const listings = await prisma.listing.findMany({
      where,
      orderBy: sort === 'dayPaid'
        ? { dayPaid: 'desc' }
        : { totalPaid: 'desc' },
      take: limit,
      include: {
        payments: {
          where: { status: 'completed' },
          select: { amount: true, paidAt: true },
          orderBy: { paidAt: 'desc' },
          take: 5,
        },
      },
    });

    return NextResponse.json({ listings, listing: null });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { listings: [], listing: null, error: 'Database error' },
      { status: 200 }
    );
  }
}
