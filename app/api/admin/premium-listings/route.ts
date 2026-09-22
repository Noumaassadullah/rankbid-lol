import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Simple admin key check - replace with proper auth
const ADMIN_KEY = process.env.ADMIN_KEY || 'admin-secret-key';

function verifyAdminKey(req: NextRequest): boolean {
  const adminKey = req.headers.get('x-admin-key');
  return adminKey === ADMIN_KEY;
}

export async function GET(req: NextRequest) {
  if (!verifyAdminKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';

    let query_str = `SELECT
        pl.*,
        l.title as listing_title,
        l.description as listing_description,
        l.category,
        l.total_votes,
        l.day_votes
      FROM premium_listings pl
      JOIN listings l ON pl.listing_id = l.id`;

    const params: any[] = [];

    if (status) {
      query_str += ` WHERE pl.payment_status = $1`;
      params.push(status);
    }

    query_str += ` ORDER BY pl.created_at DESC`;

    const result = await query(query_str, params);

    return NextResponse.json({
      premiumListings: result.rows
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
  if (!verifyAdminKey(req)) {
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

    const result = await query(
      `UPDATE premium_listings
       SET payment_status = $1, approved_at = NOW(), approved_by = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, approvedBy || 'admin', premiumListingId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Premium listing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      premiumListing: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating premium listing:', error);
    return NextResponse.json(
      { error: 'Failed to update premium listing' },
      { status: 500 }
    );
  }
}
