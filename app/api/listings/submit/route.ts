import { NextRequest, NextResponse } from 'next/server';
import { extractMetadata } from '@/lib/metadata';

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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Database not configured', listings: [] },
        { status: 500 }
      );
    }

    let normalizedUrl = url || getPlatformUrl(platform, handle);

    // Ensure URL has protocol
    if (normalizedUrl && !normalizedUrl.startsWith('http')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // Check if listing already exists
    const checkResponse = await fetch(
      `${supabaseUrl}/rest/v1/listings?title=eq.${encodeURIComponent(normalizedUrl)}&select=id`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (checkResponse.ok) {
      const existing = await checkResponse.json();
      if (existing.length > 0) {
        return NextResponse.json(
          { listing: existing[0], isNew: false, listings: [], isFreeUser: false }
        );
      }
    }

    // Count existing listings for free tier check
    const countResponse = await fetch(
      `${supabaseUrl}/rest/v1/listings?select=id&limit=1&offset=10`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    let isFreeUser = false;
    if (countResponse.ok) {
      const listings = await countResponse.json();
      isFreeUser = listings.length === 0; // If we can't fetch 11th item, means < 10 exist
    }

    // Create new listing with UUID format
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    const id = generateUUID();
    const now = new Date().toISOString();

    // Fetch metadata to get the website image/favicon
    let imageUrl: string | null = null;
    try {
      const metadata = await extractMetadata(normalizedUrl);
      imageUrl = metadata.image;
    } catch (err) {
      console.warn('Could not fetch metadata for image:', err);
    }

    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/listings`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        id,
        user_id: '550e8400-e29b-41d4-a716-446655440000', // Default user for new submissions
        title: normalizedUrl,
        description: description || normalizedUrl,
        category: category || 'Other',
        status: 'active',
        location: normalizedUrl,
        price: isFreeUser ? 100 : 0,
        views: 0,
        image_url: imageUrl || null,
        created_at: now,
        updated_at: now,
      }),
    });

    if (!insertResponse.ok) {
      const error = await insertResponse.json();
      console.error('Supabase insert error:', error);
      throw new Error(error.message || 'Failed to create listing');
    }

    const listing = await insertResponse.json();

    return NextResponse.json(
      { listing: listing[0] || listing, isNew: true, isFreeUser, listings: [] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting listing:', error);

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
  // If handle is already a full URL, return it as-is
  if (handle && (handle.startsWith('http://') || handle.startsWith('https://'))) {
    return handle;
  }

  const baseUrls: { [key: string]: (handle: string) => string } = {
    twitter: (h) => `https://twitter.com/${h.replace('@', '')}`,
    facebook: (h) => `https://facebook.com/${h.replace('@', '')}`,
    instagram: (h) => `https://www.instagram.com/${h.replace('@', '')}/`,
    tiktok: (h) => `https://www.tiktok.com/@${h.replace('@', '')}`,
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
