import { NextRequest, NextResponse } from 'next/server';
import { extractMetadata } from '@/lib/metadata';
import { query } from '@/lib/db';
import { extractSocialHandle, formatSocialMediaUrl, isSocialMediaUrl } from '@/lib/social-utils';

async function verifySocialMediaAccount(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    clearTimeout(timeout);
    if (response.status === 404 || response.status === 410 || response.status === 451 || response.status === 429 || response.status === 403) {
      return false;
    }

    if (response.status === 200) {
      const text = await response.text();
      const notFoundPatterns = ['user not found', 'page not found', 'account not found', 'does not exist', 'no longer exists', 'been deleted', 'been suspended', 'been banned', 'this account is suspended', 'this page is not available'];
      const lowerText = text.toLowerCase();
      if (notFoundPatterns.some(pattern => lowerText.includes(pattern))) {
        return false;
      }
    }

    return response.status >= 200 && response.status < 400;
  } catch {
    return false;
  }
}

async function isURLAccessible(url: string, platform?: string): Promise<boolean> {
  if (isSocialMediaUrl(url)) {
    return verifySocialMediaAccount(url);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
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
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
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
    const { url, handle, description, category, platform, userId } = await req.json();

    if (!url && !handle) {
      return NextResponse.json(
        { error: 'URL or handle required', listings: [] },
        { status: 400 }
      );
    }

    if (['facebook', 'instagram', 'tiktok', 'twitter', 'x', 'linkedin'].includes(platform) && url && !url.startsWith('http')) {
      return NextResponse.json(
        { error: `Please enter the full profile URL for ${platform}. Example: https://${platform}.com/username`, listings: [] },
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
    let displayHandle = handle;

    if (normalizedUrl && !normalizedUrl.startsWith('http')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    if (['facebook', 'instagram', 'tiktok', 'twitter', 'x'].includes(platform)) {
      const extracted = extractSocialHandle(normalizedUrl, platform);
      if (extracted) {
        displayHandle = extracted;
      }
    }

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

    const isAccessible = await isURLAccessible(normalizedUrl);
    if (!isAccessible) {
      return NextResponse.json(
        { error: 'URL is not accessible or does not exist. Please verify the URL is correct and accessible.' },
        { status: 400 }
      );
    }

    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    const id = generateUUID();
    const now = new Date().toISOString();

    let imageUrl: string | null = null;
    let metaTitle = normalizedUrl;
    let metaDescription = description || normalizedUrl;
    let metaPlatform = platform || 'website';

    try {
      const metadata = await extractMetadata(normalizedUrl);
      imageUrl = metadata.image;
      metaTitle = metadata.title || normalizedUrl;
      metaDescription = metadata.description || metaDescription;
      metaPlatform = metadata.platform || platform || 'website';

      if (platform === 'website' || !isSocialMediaUrl(normalizedUrl)) {
        if (!metadata.title || metadata.title.length < 3) {
          return NextResponse.json(
            { error: 'Could not verify website content. Please ensure the URL is a valid, accessible website.' },
            { status: 400 }
          );
        }
        if (!metadata.description || metadata.description.length < 10) {
          return NextResponse.json(
            { error: 'Website must have a meaningful description. Please provide more details.' },
            { status: 400 }
          );
        }
      }
    } catch (err) {
      console.error('Metadata extraction failed:', err);
      return NextResponse.json(
        { error: 'Could not verify website. Please ensure the URL is valid and accessible.' },
        { status: 400 }
      );
    }

    const titleLower = metaTitle.toLowerCase();
    const descLower = metaDescription.toLowerCase();
    const spamKeywords = ['viagra', 'casino', 'lottery', 'prize', 'click here', 'buy now'];
    if (spamKeywords.some(keyword => titleLower.includes(keyword) || descLower.includes(keyword))) {
      return NextResponse.json(
        { error: 'Submission rejected: Content appears to be spam or promotional.' },
        { status: 400 }
      );
    }

    if (metaTitle === normalizedUrl || metaTitle.includes('https://') || metaTitle.includes('http://')) {
      return NextResponse.json(
        { error: 'Website must have a proper title. Please check that the URL is valid.' },
        { status: 400 }
      );
    }

    if (isSocialMediaUrl(normalizedUrl)) {
      if (!metaTitle || metaTitle.length < 2) {
        return NextResponse.json(
          { error: 'Social media account does not exist or is not accessible. Please verify the profile URL.' },
          { status: 400 }
        );
      }

      if (metaTitle.toLowerCase().includes('not found') || metaTitle.toLowerCase().includes('deleted') || metaTitle.toLowerCase().includes('suspended') || metaTitle.toLowerCase().includes('unavailable')) {
        return NextResponse.json(
          { error: 'Social media account is deleted, suspended, or unavailable.' },
          { status: 400 }
        );
      }

      if (!metaDescription || metaDescription === normalizedUrl || metaDescription.length < 2) {
        return NextResponse.json(
          { error: 'Social media profile appears to be empty or fake. Ensure the profile is real and has a bio.' },
          { status: 400 }
        );
      }

      if (!imageUrl) {
        return NextResponse.json(
          { error: 'Social media profile could not be verified. Please ensure the profile is real and publicly accessible.' },
          { status: 400 }
        );
      }
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
        user_id: userId || '550e8400-e29b-41d4-a716-446655440000',
        title: metaTitle,
        description: metaDescription,
        category: category || 'Other',
        status: 'active',
        location: normalizedUrl,
        price: 0,
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
    const responseData = listing[0] || listing;

    return NextResponse.json(
      {
        id: responseData.id,
        listing: responseData,
        isNew: true,
        listings: [],
        displayHandle: displayHandle,
        platform: platform
      },
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
  if (handle && (handle.startsWith('http://') || handle.startsWith('https://'))) {
    return handle;
  }

  const baseUrls: { [key: string]: (handle: string) => string } = {
    twitter: (h) => `https://twitter.com/${h.replace('@', '')}`,
    facebook: (h) => `https://facebook.com/${h.replace('@', '')}`,
    instagram: (h) => `https://instagram.com/${h.replace('@', '')}`,
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
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '15');
    const sort = searchParams.get('sort') || 'totalVotes';
    const category = searchParams.get('category') || '';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { listings: [], listing: null, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const orderColumn = sort === 'dayVotes' ? 'day_votes' : 'total_votes';
    const offset = (page - 1) * pageSize;

    let queryUrl = `${supabaseUrl}/rest/v1/listings?order=${orderColumn}.desc&limit=${pageSize}&offset=${offset}`;

    if (category && category !== 'All') {
      queryUrl += `&category=eq.${encodeURIComponent(category)}`;
    }

    const response = await fetch(queryUrl, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { listings: [], listing: null, error: 'Failed to fetch listings' },
        { status: 500 }
      );
    }

    const listings = await response.json();

    const mappedListings = listings.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      url: item.location,
      handle: item.handle,
      category: item.category || 'Other',
      platform: item.platform || 'website',
      totalVotes: item.total_votes || 0,
      dayVotes: item.day_votes || 0,
      clickCount: item.views || 0,
      createdAt: item.created_at,
      updatedAt: item.updated_at || item.created_at,
      imageUrl: item.image_url || null,
      isPremium: false,
      premiumPosition: null,
    }));

    const countResponse = await fetch(
      `${supabaseUrl}/rest/v1/listings?select=count()`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'count=exact',
        },
      }
    );

    let total = 0;
    if (countResponse.ok) {
      const countHeader = countResponse.headers.get('content-range');
      if (countHeader) {
        const totalStr = countHeader.split('/')[1];
        total = parseInt(totalStr) || 0;
      }
    }

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json(
      { listings: mappedListings, listing: null, pagination: { page, pageSize, total, totalPages } },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { listings: [], listing: null, error: 'Database error' },
      { status: 500 }
    );
  }
}
