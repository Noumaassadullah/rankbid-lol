import { NextRequest, NextResponse } from 'next/server';
import { extractMetadata } from '@/lib/metadata';
import { query } from '@/lib/db';
import { extractSocialHandle, formatSocialMediaUrl, isSocialMediaUrl } from '@/lib/social-utils';

async function verifySocialMediaAccount(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    clearTimeout(timeout);
    // Accept 200-399 range as valid, skip 429 (rate limit) for now
    if (response.status >= 200 && response.status < 400) {
      return true;
    }

    // If 429 (rate limited) or 403 (forbidden), assume profile exists but is protected
    if (response.status === 429 || response.status === 403) {
      return true;
    }

    // Only reject clear 404s
    return response.status !== 404 && response.status !== 410;
  } catch (error) {
    console.warn(`Social media verification failed for ${url}:`, error);
    // If fetch fails, assume the profile might exist (network issues)
    return true;
  }
}

async function isURLAccessible(url: string, platform?: string): Promise<boolean> {
  if (isSocialMediaUrl(url)) {
    return verifySocialMediaAccount(url);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

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
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      });

      clearTimeout(timeout);
      return response.status >= 200 && response.status < 400;
    } catch (error) {
      console.warn(`URL accessibility check failed for ${url}:`, error);
      // If timeout or network error occurs, allow the submission but log it
      // This prevents legitimate submissions from being rejected due to temporary network issues
      return true;
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
        // Relaxed validation for websites - just ensure we have some title
        if (!metaTitle || metaTitle.length < 2) {
          metaTitle = new URL(normalizedUrl).hostname;
        }
        if (!metaDescription || metaDescription.length < 3) {
          metaDescription = 'Website';
        }
      }
    } catch (err) {
      console.error('Metadata extraction failed:', err);
      try {
        const urlObj = new URL(normalizedUrl);
        metaTitle = urlObj.hostname;
        metaDescription = 'Website';
        // Preserve the platform field even if metadata extraction fails
        const hostname = urlObj.hostname.toLowerCase();
        if (hostname.includes('linkedin.com')) {
          metaPlatform = 'linkedin';
        } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
          metaPlatform = 'twitter';
        } else if (hostname.includes('facebook.com')) {
          metaPlatform = 'facebook';
        } else if (hostname.includes('instagram.com')) {
          metaPlatform = 'instagram';
        } else if (hostname.includes('tiktok.com')) {
          metaPlatform = 'tiktok';
        } else {
          metaPlatform = platform || 'website';
        }
      } catch {
        metaTitle = 'Listing';
        metaDescription = 'Website listing';
        metaPlatform = platform || 'website';
      }
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
      // Validate that title exists and is reasonable length
      if (!metaTitle || metaTitle.length < 1) {
        metaTitle = new URL(normalizedUrl).pathname.split('/').filter(p => p)[0] || 'Account';
      }

      // Check for explicit deleted/suspended indicators
      const badIndicators = ['not found', 'deleted', 'suspended', 'unavailable', 'account suspended'];
      if (metaTitle && badIndicators.some(indicator => metaTitle.toLowerCase().includes(indicator))) {
        return NextResponse.json(
          { error: 'Social media account is deleted, suspended, or unavailable.' },
          { status: 400 }
        );
      }

      // Allow submission even if description is minimal (some profiles don't have bios)
      if (!metaDescription || metaDescription === normalizedUrl) {
        metaDescription = 'Social Media Profile';
      }

      // Use favicon if profile image not found
      if (!imageUrl) {
        const urlObj = new URL(normalizedUrl);
        imageUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=256`;
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
        platform: metaPlatform,
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
    x: (h) => `https://x.com/${h.replace('@', '')}`,
    facebook: (h) => `https://facebook.com/${h.replace('@', '')}`,
    instagram: (h) => `https://instagram.com/${h.replace('@', '')}`,
    tiktok: (h) => `https://www.tiktok.com/@${h.replace('@', '')}`,
    linkedin: (h) => `https://linkedin.com/in/${h.replace('@', '').replace(/\//g, '')}`,
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
    const platforms = searchParams.getAll('platform') || [];

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

    if (platforms.length > 0) {
      const platformFilter = platforms.map(p => `platform.eq.${encodeURIComponent(p)}`).join(',');
      queryUrl += `&or=(${platformFilter})`;
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
