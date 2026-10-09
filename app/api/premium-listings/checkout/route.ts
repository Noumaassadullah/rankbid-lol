import { NextRequest, NextResponse } from 'next/server';
import { sbHeaders, sbUrl, supabaseConfigured } from '@/lib/server/votes';
import { getLadder, usdToPkr } from '@/lib/server/premium';

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

    const { items, paymentMethod = 'manual' } = await req.json() as CheckoutRequest;

    // One spot per checkout: the gateway charges a single amount for a single bid.
    if (!Array.isArray(items) || items.length !== 1) {
      return NextResponse.json({ error: 'Choose one premium spot per checkout' }, { status: 400 });
    }

    const item = items[0];
    const position = Number(item.position);
    if (!item.listingId || !item.founderName || !item.founderEmail || !item.founderPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (![1, 2, 3].includes(position)) {
      return NextResponse.json({ error: 'Invalid position. Must be 1, 2, or 3' }, { status: 400 });
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
        founder_name: item.founderName,
        founder_email: item.founderEmail,
        founder_phone: item.founderPhone,
        founder_website: item.founderWebsite || null,
        founder_twitter: item.founderTwitter || null,
        founder_linkedin: item.founderLinkedin || null,
        founder_instagram: item.founderInstagram || null,
        founder_facebook: item.founderFacebook || null,
        founder_tiktok: item.founderTiktok || null,
        founder_youtube: item.founderYoutube || null,
        founder_github: item.founderGithub || null,
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
          email: item.founderEmail,
          phone: item.founderPhone,
          name: item.founderName,
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
    return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 });
  }
}
