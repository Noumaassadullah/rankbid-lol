import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Premium listing request received:', {
      listingId: body.listingId,
      position: body.position,
      founderName: body.founderName,
      founderEmail: body.founderEmail,
      founderPhone: body.founderPhone,
    });

    const {
      listingId,
      position,
      founderName,
      founderEmail,
      founderPhone,
      founderWebsite,
      founderTwitter,
      founderLinkedin,
      founderInstagram,
      founderFacebook,
      founderTiktok,
      founderYoutube,
      founderGithub,
      paymentMethod,
      amountPaid,
    } = body;

    // Validate required fields
    if (!listingId || !position || !founderName || !founderEmail || !founderPhone) {
      const missing = [];
      if (!listingId) missing.push('listingId');
      if (!position) missing.push('position');
      if (!founderName) missing.push('founderName');
      if (!founderEmail) missing.push('founderEmail');
      if (!founderPhone) missing.push('founderPhone');
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate position is 1, 2, or 3
    const positionNum = parseInt(position);
    if ([1, 2, 3].indexOf(positionNum) === -1) {
      return NextResponse.json(
        { error: 'Invalid position' },
        { status: 400 }
      );
    }

    // Calculate amount paid based on position
    const PRICES: { [key: number]: number } = {
      1: 5,
      2: 3,
      3: 1,
    };
    const calculatedAmount = PRICES[positionNum] || amountPaid;

    // Validate listing exists
    const listingCheck = await query('SELECT id FROM listings WHERE id = $1', [listingId]);
    if (listingCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Check if listing already has premium status
    const premiumCheck = await query(
      'SELECT id FROM premium_listings WHERE listing_id = $1 AND payment_status IN ($2, $3)',
      [listingId, 'approved', 'pending']
    );
    if (premiumCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'This listing already has a premium request' },
        { status: 409 }
      );
    }

    // Create premium listing request
    const id = `premium_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const insertResult = await query(
      `INSERT INTO premium_listings (
        id, listing_id, position, founder_name, founder_email, founder_phone,
        founder_website, founder_twitter, founder_linkedin, founder_instagram,
        founder_facebook, founder_tiktok, founder_youtube, founder_github,
        payment_method, amount_paid, payment_status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())
      RETURNING id`,
      [
        id,
        listingId,
        positionNum,
        founderName,
        founderEmail,
        founderPhone,
        founderWebsite || null,
        founderTwitter || null,
        founderLinkedin || null,
        founderInstagram || null,
        founderFacebook || null,
        founderTiktok || null,
        founderYoutube || null,
        founderGithub || null,
        paymentMethod || 'manual',
        calculatedAmount,
        'pending'
      ]
    );

    console.log('Premium listing created successfully:', {
      premiumListingId: insertResult.rows[0]?.id,
      listingId,
      position: positionNum,
      amount: calculatedAmount,
    });

    return NextResponse.json(
      { success: true, message: 'Premium listing request submitted. Awaiting admin approval.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating premium listing:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create premium listing';
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return NextResponse.json(
      { error: errorMessage, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get('listingId');

    if (!listingId) {
      return NextResponse.json(
        { error: 'listingId required' },
        { status: 400 }
      );
    }

    const result = await query(
      'SELECT * FROM premium_listings WHERE listing_id = $1',
      [listingId]
    );

    return NextResponse.json({
      premium: result.rows[0] || null
    });
  } catch (error) {
    console.error('Error fetching premium listing:', error);
    return NextResponse.json(
      { premium: null, error: 'Failed to fetch premium status' },
      { status: 500 }
    );
  }
}
