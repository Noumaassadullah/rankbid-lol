import { NextRequest, NextResponse } from 'next/server';
import { sbHeaders, sbUrl, supabaseConfigured } from '@/lib/server/votes';
import { getLadder, usdToPkr } from '@/lib/server/premium';
import { ipHash, rateLimit } from '@/lib/server/rate-limit';
import { httpUrlOrNull, staticUrlProblem } from '@/lib/server/url-safety';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9][0-9 ()-]{6,19}$/;
const HANDLE_RE = /^@?[A-Za-z0-9_.-]{1,50}$/;
const URL_FIELDS = ['founderWebsite', 'founderLinkedin', 'founderFacebook', 'founderYoutube'] as const;
const HANDLE_FIELDS = ['founderTwitter', 'founderInstagram', 'founderTiktok', 'founderGithub'] as const;

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

/** Validated founder fields, or an error message. Links shown on the homepage must be safe http(s) URLs. */
function validateFounder(item: CartItem): { error: string } | { links: Record<string, string | null> } {
  const name = str(item.founderName);
  if (name.length < 2 || name.length > 80) return { error: 'Please enter your name (2–80 characters)' };
  const email = str(item.founderEmail);
  if (!EMAIL_RE.test(email) || email.length > 254) return { error: 'Please enter a valid email address' };
  if (!PHONE_RE.test(str(item.founderPhone))) return { error: 'Please enter a valid phone number' };

  const links: Record<string, string | null> = {};
  for (const field of URL_FIELDS) {
    const raw = str(item[field]);
    if (!raw) { links[field] = null; continue; }
    const url = httpUrlOrNull(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`, 300);
    if (!url || staticUrlProblem(url)) return { error: `That ${field.replace('founder', '')} link isn't allowed` };
    links[field] = url;
  }
  for (const field of HANDLE_FIELDS) {
    // Accept a pasted profile URL ("x.com/handle") and keep just the handle.
    const raw = str(item[field]).replace(/^https?:\/\//i, '').replace(/^(www\.)?[a-z]+\.com\/@?/i, '').replace(/\/+$/, '');
    if (!raw) { links[field] = null; continue; }
    if (!HANDLE_RE.test(raw)) return { error: `Enter just the ${field.replace('founder', '')} username, e.g. @handle` };
    links[field] = raw;
  }
  return { links };
}

interface CartItem {
  listingId: string;
  position: number;
  /** What the buyer offers (USD). Defaults to the spot's current minimum. */
  bidUsd?: number;
  founderName: string;
  founderEmail: string;
  founderPhone: string;
  founderWebsite?: string;
  founderTwitter?: string;
  founderLinkedin?: string;
  founderInstagram?: string;
  founderFacebook?: string;
  founderTiktok?: string;
  founderYoutube?: string;
  founderGithub?: string;
}

interface CheckoutRequest {
  items: CartItem[];
  paymentMethod: 'rapid-gateway' | 'jazzcash' | 'easypaisa' | 'stripe' | 'manual';
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    if (!(await rateLimit(`checkout-ip:${ipHash(req)}`, 10, 60 * 60))) {
      return NextResponse.json({ error: 'Too many checkout attempts. Please try again later.' }, { status: 429 });
    }

    const { items, paymentMethod = 'manual' } = await req.json() as CheckoutRequest;
    if (!['rapid-gateway', 'jazzcash', 'easypaisa', 'stripe', 'manual'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }

    // One spot per checkout: the gateway charges a single amount for a single bid.
    if (!Array.isArray(items) || items.length !== 1) {
      return NextResponse.json({ error: 'Choose one premium spot per checkout' }, { status: 400 });
    }

    const item = items[0];
    const position = Number(item.position);
    if (typeof item?.listingId !== 'string' || !item.listingId || !item.founderName || !item.founderEmail || !item.founderPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (![1, 2, 3].includes(position)) {
      return NextResponse.json({ error: 'Invalid position. Must be 1, 2, or 3' }, { status: 400 });
    }
    const founder = validateFounder(item);
    if ('error' in founder) {
      return NextResponse.json({ error: founder.error }, { status: 400 });
    }

    const listingRes = await fetch(sbUrl(`listings?id=eq.${encodeURIComponent(item.listingId)}&select=id`), {
      headers: sbHeaders(),
      cache: 'no-store',
    });
    const [listing] = listingRes.ok ? await listingRes.json() : [];
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const spot = (await getLadder()).find(s => s.position === position)!;
    if (spot.holder?.listingId === item.listingId) {
      return NextResponse.json({ error: `This product already holds #${position}` }, { status: 409 });
    }

    const bidUsd = item.bidUsd == null ? spot.minBidUsd : Math.round(Number(item.bidUsd) * 100) / 100;
    if (!Number.isFinite(bidUsd) || bidUsd < spot.minBidUsd) {
      return NextResponse.json(
        { error: `#${position} now needs at least $${spot.minBidUsd}`, minBidUsd: spot.minBidUsd },
        { status: 409 }
      );
    }
    const amountPkr = usdToPkr(bidUsd);

    const insertRes = await fetch(sbUrl('premium_listings'), {
      method: 'POST',
      headers: sbHeaders({ 'Content-Type': 'application/json', Prefer: 'return=representation' }),
      body: JSON.stringify({
        listing_id: item.listingId,
        position,
        founder_name: str(item.founderName),
        founder_email: str(item.founderEmail).toLowerCase(),
        founder_phone: str(item.founderPhone),
        founder_website: founder.links.founderWebsite,
        founder_twitter: founder.links.founderTwitter,
        founder_linkedin: founder.links.founderLinkedin,
        founder_instagram: founder.links.founderInstagram,
        founder_facebook: founder.links.founderFacebook,
        founder_tiktok: founder.links.founderTiktok,
        founder_youtube: founder.links.founderYoutube,
        founder_github: founder.links.founderGithub,
        payment_method: paymentMethod,
        payment_status: 'pending',
        bid_usd: bidUsd,
        amount_pkr: amountPkr,
        payment_amount: bidUsd,
      }),
    });

    if (!insertRes.ok) {
      console.error('Failed to create premium listing:', insertRes.status, await insertRes.text());
      return NextResponse.json({ error: 'Failed to create premium listing' }, { status: 500 });
    }
    const [premiumListing] = await insertRes.json();

    if (paymentMethod === 'rapid-gateway') {
      return NextResponse.json({
        success: true,
        paymentRequired: true,
        paymentMethod: 'rapid-gateway',
        initiatePaymentUrl: '/api/payment/rapid-gateway/initiate',
        // The initiate route reads the amount from the database; only the id matters here.
        paymentData: {
          premiumListingId: premiumListing.id,
          email: str(item.founderEmail).toLowerCase(),
          phone: str(item.founderPhone),
          name: str(item.founderName),
        },
        premiumListings: [premiumListing],
        totalPrice: bidUsd,
        amountPkr,
        itemCount: 1,
      });
    }

    return NextResponse.json({
      success: true,
      paymentRequired: false,
      message: 'Premium listing submitted for review',
      premiumListings: [premiumListing],
      totalPrice: bidUsd,
      amountPkr,
      itemCount: 1,
      nextSteps: `An admin will verify your payment of PKR ${amountPkr.toLocaleString()} and activate #${position}. If someone outbids you first, you'll be contacted about a refund.`,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed. Please try again.' }, { status: 500 });
  }
}
