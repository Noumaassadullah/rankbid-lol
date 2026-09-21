import { NextRequest, NextResponse } from 'next/server';
import { extractMetadata } from '@/lib/metadata';

async function isURLAccessible(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RankBid/1.0)' },
    });

    clearTimeout(timeout);
    return response.status >= 200 && response.status < 400;
  } catch {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RankBid/1.0)' },
      });

      clearTimeout(timeout);
      return response.status >= 200 && response.status < 400;
    } catch {
      return false;
    }
  }
}

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

    // Check if listing already exists (by location field where URLs are stored)
    const checkResponse = await fetch(
      `${supabaseUrl}/rest/v1/listings?location=eq.${encodeURIComponent(normalizedUrl)}&select=id`,
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
          { error: 'URL already listed. No duplicate submissions allowed.' },
          { status: 409 }
        );
      }
    }

    // Check if URL is accessible
    const isAccessible = await isURLAccessible(normalizedUrl);
    if (!isAccessible) {
      return NextResponse.json(
        { error: 'URL is not accessible or does not exist. Please verify the URL is correct and accessible.' },
        { status: 400 }
      );
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

    // Fetch metadata to get website title, description, image, and platform-specific data
    let imageUrl: string | null = null;
    let metaTitle = normalizedUrl;
    let metaDescription = description || normalizedUrl;
    let metaPlatform = platform || 'website';
    let metaFollowers: string | null = null;
    let metaPosts: string | null = null;
    try {
      const metadata = await extractMetadata(normalizedUrl);
      imageUrl = metadata.image;
      metaTitle = metadata.title || normalizedUrl;
      metaDescription = metadata.description || metaDescription;
      metaPlatform = metadata.platform || platform || 'website';
      metaFollowers = metadata.followers || null;
      metaPosts = metadata.posts || null;
    } catch (err) {
      console.warn('Could not fetch metadata:', err);
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
        title: metaTitle,
        description: metaDescription,
        category: category || 'Other',
        status: 'active',
        location: normalizedUrl,
        price: 0,  // No longer used, kept for backward compatibility
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
      { listing: listing[0] || listing, isNew: true, listings: [] },
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
    const sort = searchParams.get('sort') || 'totalVotes';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { listings: [], listing: null, warning: 'Database not configured' },
        { status: 200 }
      );
    }

    // Fetch from Supabase REST API instead of Prisma
    // For now, we'll sort by views as a placeholder until we migrate to vote columns
    const orderBy = sort === 'dayVotes' ? 'views.desc' : 'views.desc';
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
        totalVotes: item.views || 0,
        dayVotes: item.views || 0,
        clickCount: item.views || 0,
        createdAt: item.created_at,
        updatedAt: item.updated_at || item.created_at,
        imageUrl: item.image_url || null,
      };
    });

    return NextResponse.json({ listings, listing: null }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { listings: [], listing: null, error: 'Database error' },
      { status: 200 }
    );
  }
}
