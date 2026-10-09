import { NextRequest, NextResponse } from 'next/server';
import { extractMetadata } from '@/lib/metadata';
import { query } from '@/lib/db';
import { extractSocialHandle, formatSocialMediaUrl, isSocialMediaUrl } from '@/lib/social-utils';
import { sendNewSubmissionEmail } from '@/lib/email';
import { getActiveHolders, type PremiumHolder } from '@/lib/server/premium';
import { CATEGORIES, LEGACY_CATEGORIES } from '@/lib/categories';
import { getSessionUser } from '@/lib/server/session';
import { ipHash, rateLimit } from '@/lib/server/rate-limit';
import { safeFetch, UnsafeUrlError } from '@/lib/server/safe-fetch';
import { isDownloadResponse, isFlaggedBySafeBrowsing, staticUrlProblem } from '@/lib/server/url-safety';

const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };

/** null if the URL can be listed, otherwise the reason it can't. */
async function accessibilityProblem(url: string): Promise<string | null> {
  const social = isSocialMediaUrl(url);
  let res: Response;
  try {
    res = await safeFetch(url, { method: 'HEAD', headers: UA });
    if (res.status === 405 || res.status === 501) res = await safeFetch(url, { method: 'GET', headers: UA });
  } catch (error) {
    if (error instanceof UnsafeUrlError) return 'This URL is not allowed.';
    // Network hiccups and timeouts: allow, as before, rather than reject real sites.
    console.warn(`URL accessibility check failed for ${url}:`, error);
    return null;
  }
  if (isDownloadResponse(res)) return 'Direct download links are not allowed. Link to a web page instead.';
  if (res.status >= 200 && res.status < 400) return null;
  // Social networks often answer bots with 403/429 for profiles that do exist.
  if (social && res.status !== 404 && res.status !== 410) return null;
  return 'URL is not accessible or does not exist. Please verify the URL is correct and accessible.';
}

export async function POST(req: NextRequest) {
  try {
    // Submissions are tied to the signed-in account (never to a user id sent by the browser).
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to submit', listings: [] }, { status: 401 });
    }

    if (
      !(await rateLimit(`submit-user:${user.id}`, 5, 60 * 60)) ||
      !(await rateLimit(`submit-user-day:${user.id}`, 20, 24 * 60 * 60)) ||
      !(await rateLimit(`submit-ip:${ipHash(req)}`, 10, 60 * 60))
    ) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.', listings: [] },
        { status: 429 }
      );
    }

    const { url, handle, description, category, platform } = await req.json();

    if (
      (url !== undefined && typeof url !== 'string') ||
      (handle !== undefined && typeof handle !== 'string') ||
      (description !== undefined && typeof description !== 'string') ||
      (platform !== undefined && typeof platform !== 'string')
    ) {
      return NextResponse.json({ error: 'Invalid submission', listings: [] }, { status: 400 });
    }

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

    if (!category || ![...CATEGORIES, ...LEGACY_CATEGORIES].includes(category)) {
      return NextResponse.json(
        { error: 'Category required', listings: [] },
        { status: 400 }
      );
    }

    if ((description || '').length > 500 || (handle || '').length > 200) {
      return NextResponse.json({ error: 'Description is too long (500 characters max)', listings: [] }, { status: 400 });
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

    // Malware, phishing, adult, gambling, shorteners, downloads.
    const urlProblem = staticUrlProblem(normalizedUrl);
    if (urlProblem) {
      return NextResponse.json({ error: urlProblem, listings: [] }, { status: 400 });
    }
    if (await isFlaggedBySafeBrowsing(normalizedUrl)) {
      console.warn('Submission blocked by Safe Browsing:', normalizedUrl, 'user', user.id);
      return NextResponse.json(
        { error: 'This site is flagged as unsafe (malware or phishing) and cannot be listed.', listings: [] },
        { status: 400 }
      );
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

    const accessProblem = await accessibilityProblem(normalizedUrl);
    if (accessProblem) {
      return NextResponse.json({ error: accessProblem }, { status: 400 });
    }

    const id = crypto.randomUUID();
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
    const spamKeywords = [
      'viagra', 'cialis', 'casino', 'lottery', 'prize', 'click here', 'buy now', 'porn', 'xxx', 'escort',
      'betting', 'jackpot', 'free money', 'crack download', 'keygen', 'giveaway', 'airdrop', 'seed phrase',
    ];
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
        user_id: user.id,
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

    await sendNewSubmissionEmail({
      id: responseData.id,
      title: metaTitle,
      description: metaDescription,
      category: category || 'Other',
      platform: metaPlatform,
      url: normalizedUrl,
      imageUrl: imageUrl || undefined,
    });

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
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '15') || 15));
    const sort = searchParams.get('sort') || 'totalVotes';
    const category = searchParams.get('category') || '';
    const platforms = searchParams.getAll('platform') || [];
    const timeFilter = searchParams.get('timeFilter') || '';
    // ?activeToday=1: any listing that got votes today, however old (the /today trending view).
    const activeToday = searchParams.get('activeToday') === '1';
    // An explicit ?limit= returns that many rows (non-paged views); otherwise return one page of pageSize.
    const limitParam = searchParams.get('limit');
    const rowLimit = limitParam ? Math.min(1000, Math.max(1, parseInt(limitParam) || pageSize)) : pageSize;

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

    // Ties go to whoever reached that vote count most recently (updated_at is stamped on each vote).
    let queryUrl = `${supabaseUrl}/rest/v1/listings?order=${orderColumn}.desc,updated_at.desc.nullslast&limit=${rowLimit}&offset=${offset}`;

    // Filter by time - only today's submissions for daily page
    if (timeFilter === 'today') {
      const now = new Date();
      const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
      const today = new Date(utcNow.getFullYear(), utcNow.getMonth(), utcNow.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayISO = today.toISOString();
      const tomorrowISO = tomorrow.toISOString();

      // Use AND filter syntax for multiple conditions
      queryUrl += `&created_at=gte.${encodeURIComponent(todayISO)}&created_at=lt.${encodeURIComponent(tomorrowISO)}`;
    }

    if (activeToday) {
      queryUrl += '&day_votes=gt.0';
    }

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
        'Prefer': 'count=exact',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase fetch failed:', response.status, errorText);
      return NextResponse.json(
        { listings: [], listing: null, error: 'Failed to fetch listings' },
        { status: 500 }
      );
    }

    const listings = await response.json();

    const mapListing = (item: any) => ({
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
      premiumPosition: null as number | null,
    });
    const mappedListings = listings.map(mapListing);

    // Paid #1-#3 holders. Votes still order the main list; these also come back as `premium`
    // so the featured strip shows every holder, whichever page they fall on.
    const holders = await getActiveHolders();
    const withPremium = (listing: ReturnType<typeof mapListing>, holder: PremiumHolder) => ({
      ...listing,
      isPremium: true,
      premiumPosition: holder.position,
      founderName: holder.founderName,
      founderEmail: holder.founderEmail,
      founderPhone: holder.founderPhone,
      founderWebsite: holder.founderWebsite,
      founderTwitter: holder.founderTwitter,
      founderLinkedin: holder.founderLinkedin,
      founderInstagram: holder.founderInstagram,
      founderFacebook: holder.founderFacebook,
      founderTiktok: holder.founderTiktok,
      founderYoutube: holder.founderYoutube,
      founderGithub: holder.founderGithub,
    });
    const holderByListing = new Map(holders.map(h => [h.listingId, h]));
    const pageListings = mappedListings.map((l: ReturnType<typeof mapListing>) => {
      const holder = holderByListing.get(l.id);
      return holder ? withPremium(l, holder) : l;
    });

    let premium: ReturnType<typeof withPremium>[] = [];
    if (holders.length > 0) {
      const ids = encodeURIComponent(holders.map(h => `"${h.listingId.replace(/"/g, '')}"`).join(','));
      const premiumRes = await fetch(`${supabaseUrl}/rest/v1/listings?id=in.(${ids})`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
      });
      const rows: any[] = premiumRes.ok ? await premiumRes.json() : [];
      premium = holders.flatMap(h => {
        const row = rows.find(r => r.id === h.listingId);
        return row ? [withPremium(mapListing(row), h)] : [];
      });
    }

    // Get total from the content-range header of the main response
    let total = 0;
    const contentRange = response.headers.get('content-range');
    if (contentRange) {
      const parts = contentRange.split('/');
      if (parts[1]) {
        total = parseInt(parts[1]) || 0;
      }
    }

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json(
      { listings: pageListings, premium, listing: null, pagination: { page, pageSize, total, totalPages } },
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
