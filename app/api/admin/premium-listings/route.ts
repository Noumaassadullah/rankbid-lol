import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/server/admin';
import { sbHeaders, sbUrl } from '@/lib/server/votes';
import { activatePremiumBid, getPremiumListing, updatePremiumListing } from '@/lib/server/premium';

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    // An empty ?status= lists every row.
    const status = searchParams.get('status') ?? 'pending';

    const filter = status ? `&payment_status=eq.${encodeURIComponent(status)}` : '';
    const res = await fetch(
      sbUrl(`premium_listings?select=*,listing:listings(title,description,category,total_votes,day_votes)&order=created_at.desc${filter}`),
      { headers: sbHeaders(), cache: 'no-store' }
    );
    if (!res.ok) {
      throw new Error(`${res.status} ${await res.text()}`);
    }
    const rows: any[] = await res.json();

    return NextResponse.json({
      premiumListings: rows.map(({ listing, ...row }) => ({
        ...row,
        listing_title: listing?.title ?? null,
        listing_description: listing?.description ?? null,
        category: listing?.category ?? null,
        total_votes: listing?.total_votes ?? 0,
        day_votes: listing?.day_votes ?? 0,
      })),
    });
  } catch (error) {
    console.error('Error fetching premium listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch premium listings' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { premiumListingId, status, approvedBy } = await req.json();

    if (!premiumListingId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const premium = await getPremiumListing(premiumListingId);
    if (!premium) {
      return NextResponse.json(
        { error: 'Premium listing not found' },
        { status: 404 }
      );
    }
    if (premium.payment_status !== 'pending') {
      return NextResponse.json(
        { error: `Already ${premium.payment_status}` },
        { status: 409 }
      );
    }

    await updatePremiumListing(premiumListingId, {
      approved_at: new Date().toISOString(),
      approved_by: approvedBy || 'admin',
      ...(status === 'rejected' ? { payment_status: 'rejected' } : {}),
    });

    // Approval puts the bid on the ladder, pushing lower holders down a spot.
    const result = status === 'approved' ? await activatePremiumBid(premiumListingId) : { status: 'rejected' };

    return NextResponse.json({
      success: true,
      result,
      premiumListing: await getPremiumListing(premiumListingId),
    });
  } catch (error) {
    console.error('Error updating premium listing:', error);
    return NextResponse.json(
      { error: 'Failed to update premium listing' },
      { status: 500 }
    );
  }
}
