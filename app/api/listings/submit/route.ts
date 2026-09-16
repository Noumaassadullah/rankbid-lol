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

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not configured', listings: [] },
        { status: 500 }
      );
    }

    const normalizedUrl = url || getPlatformUrl(platform, handle);

    let listing = await prisma.listing.findUnique({
      where: { url: normalizedUrl },
    });

    if (listing) {
      return NextResponse.json(
        { listing, isNew: false, listings: [], isFreeUser: false }
      );
    }

    // Count existing listings for free tier check
    let isFreeUser = false;
    try {
      const totalListings = await prisma.listing.count();
      isFreeUser = totalListings < 10;
    } catch (countError) {
      console.warn('Could not count listings:', countError);
      isFreeUser = false;
    }

    listing = await prisma.listing.create({
      data: {
        url: normalizedUrl,
        handle: handle || undefined,
        title: description || normalizedUrl,
        description: description || normalizedUrl,
        category: (category as any) || 'Other',
        platform: platform || 'website',
        totalPaid: isFreeUser ? 100 : 0, // $1 for free users so they appear ranked
        dayPaid: isFreeUser ? 100 : 0,
        clickCount: 0,
      },
    });

    // If free user, create a payment record to mark it as completed
    if (isFreeUser) {
      try {
        await prisma.payment.create({
          data: {
            listingId: listing.id,
            amount: 100, // $1
            status: 'completed',
            provider: 'free',
            transactionId: `free-user-${listing.id}`,
            paidAt: new Date(),
          },
        });

        // Create daily rank for today
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        await prisma.dailyRank.create({
          data: {
            listingId: listing.id,
            date: today,
            amount: 100,
          },
        });
      } catch (freeUserError) {
        console.warn('Error creating payment for free user:', freeUserError);
        // Still return success even if payment creation fails
      }
    }

    return NextResponse.json(
      { listing, isNew: true, isFreeUser, listings: [] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting listing:', error);

    // Check if it's a database connection error
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not configured. Please set DATABASE_URL in environment variables.', listings: [] },
        { status: 503 }
      );
    }

    // For other errors, return a generic message
    return NextResponse.json(
      {
        error: 'Failed to submit listing. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        listings: []
      },
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { listings: [], listing: null, warning: 'Database not configured' },
        { status: 200 }
      );
    }

    // Fetch from Supabase REST API instead of Prisma
    const orderBy = sort === 'dayPaid' ? 'price.desc' : 'price.desc';
    const query = `order=${orderBy}&limit=${limit}`;

    const response = await fetch(`${supabaseUrl}/rest/v1/listings?${query}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ listings: [], listing: null });
    }

    let supabaseListings = await response.json();

    // Map Supabase schema to expected schema
    const listings = supabaseListings.map((item: any) => {
      // For LinkedIn profiles, use location field as URL; for others use title or create listing link
      let url = item.location;
      if (!url || url === 'LinkedIn' || !url.startsWith('http')) {
        // Generate listing detail page URL for marketplace items
        url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://rankbid-lol.vercel.app'}/listing/${item.id}`;
      }

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        url: url,
        category: item.category || 'Other',
        platform: item.platform || 'website',
        totalPaid: item.price || 0,
        dayPaid: item.price || 0,
        clickCount: item.views || 0,
        createdAt: item.created_at,
        lastRaisedAt: item.created_at,
        updatedAt: item.updated_at || item.created_at,
        imageUrl: item.image_url || null,
      };
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
