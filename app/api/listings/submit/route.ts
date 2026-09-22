import { NextRequest, NextResponse } from 'next/server';
import { extractMetadata } from '@/lib/metadata';
import { query } from '@/lib/db';
import { extractSocialHandle, formatSocialMediaUrl, isSocialMediaUrl } from '@/lib/social-utils';

async function verifySocialMediaAccount(url: string): Promise<boolean> {
  // Verify social media accounts actually exist
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

    // 404 means account doesn't exist
    if (response.status === 404) {
      return false;
    }

    // 410 Gone means account was deleted
    if (response.status === 410) {
      return false;
    }

    // 451 Unavailable for Legal Reasons (banned/suspended)
    if (response.status === 451) {
      return false;
    }

    // 429 Too Many Requests - might be temp, but we should reject
    if (response.status === 429) {
      return false;
    }

    // 403 Forbidden - private or blocked
    if (response.status === 403) {
      return false;
    }

    // Check for common "user not found" patterns in response
    if (response.status === 200) {
      const text = await response.text();
      const notFoundPatterns = [
        'user not found',
        'page not found',
        'account not found',
        'does not exist',
        'no longer exists',
        'been deleted',
        'been suspended',
        'been banned',
        'this account is suspended',
        'this page is not available',
      ];

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
  // Verify social media accounts with stricter checks
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
    const { url, handle, description, category, platform } = await req.json();

    if (!url && !handle) {
      return NextResponse.json(
        { error: 'URL or handle required', listings: [] },
        { status: 400 }
      );
    }

    // For social platforms, require full URL - no usernames/handles allowed
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

    // Ensure URL has protocol and extract handle for social platforms
    if (normalizedUrl && !normalizedUrl.startsWith('http')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // Extract social media handle from URL
    if (['facebook', 'instagram', 'tiktok', 'twitter', 'x'].includes(platform)) {
      const extracted = extractSocialHandle(normalizedUrl, platform);
      if (extracted) {
        displayHandle = extracted;
      }
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

      // Validate metadata extraction for websites (not social media)
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

    // Reject spam indicators
    const titleLower = metaTitle.toLowerCase();
    const descLower = metaDescription.toLowerCase();
    const spamKeywords = ['viagra', 'casino', 'lottery', 'prize', 'click here', 'buy now'];
    if (spamKeywords.some(keyword => titleLower.includes(keyword) || descLower.includes(keyword))) {
      return NextResponse.json(
        { error: 'Submission rejected: Content appears to be spam or promotional.' },
        { status: 400 }
      );
    }

    // Reject if title is just the URL
    if (metaTitle === normalizedUrl || metaTitle.includes('https://') || metaTitle.includes('http://')) {
      return NextResponse.json(
        { error: 'Website must have a proper title. Please check that the URL is valid.' },
        { status: 400 }
      );
    }

    // Strict validation for social media accounts
    if (isSocialMediaUrl(normalizedUrl)) {
      // Social media account must have valid title (username/handle)
      if (!metaTitle || metaTitle.length < 2) {
        return NextResponse.json(
          { error: 'Social media account does not exist or is not accessible. Please verify the profile URL.' },
          { status: 400 }
        );
      }

      // Reject suspicious/empty social media profiles
      if (metaTitle.toLowerCase().includes('not found') ||
          metaTitle.toLowerCase().includes('deleted') ||
          metaTitle.toLowerCase().includes('suspended') ||
          metaTitle.toLowerCase().includes('unavailable')) {
        return NextResponse.json(
          { error: 'Social media account is deleted, suspended, or unavailable.' },
          { status: 400 }
        );
      }

      // Profile should have description/bio
      if (!metaDescription || metaDescription === normalizedUrl || metaDescription.length < 2) {
        return NextResponse.json(
          { error: 'Social media profile appears to be empty or fake. Ensure the profile is real and has a bio.' },
          { status: 400 }
        );
      }

      // For social media, we should have a profile image
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
  // If handle is already a full URL, return it as-is
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
    const searchQuery = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const timeFilter = searchParams.get('timeFilter') || 'alltime';
    const platforms = searchParams.getAll('platform') || [];

    // Build WHERE clause based on filters
    let whereConditions = [];
    let params: any[] = [];
    let paramIndex = 1;

    // Search filter
    if (searchQuery) {
      whereConditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      params.push(`%${searchQuery}%`);
      paramIndex++;
    }

    // Category filter
    if (category && category !== 'All') {
      whereConditions.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    // Platform filter
    if (platforms.length > 0) {
      const platformPlaceholders = platforms.map(() => `$${paramIndex++}`).join(',');
      whereConditions.push(`platform IN (${platformPlaceholders})`);
      params.push(...platforms);
    }

    // Time filter
    if (timeFilter === 'today') {
      whereConditions.push(`created_at >= NOW() - INTERVAL '24 hours'`);
    } else if (timeFilter === 'weekly') {
      whereConditions.push(`created_at >= NOW() - INTERVAL '7 days'`);
    } else if (timeFilter === 'monthly') {
      whereConditions.push(`created_at >= NOW() - INTERVAL '30 days'`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count for pagination
    const countSql = `SELECT COUNT(*) as total FROM listings ${whereClause}`;
    const countResult = await query(countSql, params);
    const total = parseInt(countResult.rows[0]?.total || '0');
    const totalPages = Math.ceil(total / pageSize);

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;

    // Fetch listings from PostgreSQL with vote counts
    const orderColumn = sort === 'dayVotes' ? 'day_votes' : 'total_votes';
    const sql = `
      SELECT *
      FROM listings
      ${whereClause}
      ORDER BY ${orderColumn} DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `;

    const result = await query(sql, params);

    // Map database schema to expected schema
    const listings = result.rows.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      url: item.location || item.url,
      category: item.category || 'Other',
      platform: item.platform || 'website',
      totalVotes: item.total_votes || 0,
      dayVotes: item.day_votes || 0,
      clickCount: item.click_count || 0,
      createdAt: item.created_at,
      updatedAt: item.updated_at || item.created_at,
      imageUrl: item.image_url || null,
      isPremium: false,
      premiumPosition: null,
      founderName: item.founder_name || null,
      founderEmail: item.founder_email || null,
      founderPhone: item.founder_phone || null,
      founderWebsite: item.founder_website || null,
      founderTwitter: item.founder_twitter || null,
      founderLinkedin: item.founder_linkedin || null,
      founderInstagram: item.founder_instagram || null,
      founderFacebook: item.founder_facebook || null,
      founderTiktok: item.founder_tiktok || null,
      founderYoutube: item.founder_youtube || null,
      founderGithub: item.founder_github || null,
    }));

    return NextResponse.json({ listings, listing: null, pagination: { page, pageSize, total, totalPages } }, {
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
