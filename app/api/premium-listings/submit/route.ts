import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
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
    } = await req.json();

    if (!listingId || !position || !founderName || !founderEmail || !founderPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (![1, 2, 3].includes(position)) {
      return NextResponse.json(
        { error: 'Invalid position' },
        { status: 400 }
      );
    }

    const PRICES: { [key: number]: number } = {
      1: 5,
      2: 3,
      3: 1,
    };

    const price = PRICES[position];

    const result = await query(
      `INSERT INTO premium_listings (
        listing_id,
        position,
        founder_name,
        founder_email,
        founder_phone,
        founder_website,
        founder_twitter,
        founder_linkedin,
        founder_instagram,
        founder_facebook,
        founder_tiktok,
        founder_youtube,
        founder_github,
        payment_status,
        payment_amount,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
      RETURNING *`,
      [
        listingId,
        position,
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
        'pending',
        price,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create premium listing' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      premiumListing: result.rows[0],
      message: 'Premium listing submitted successfully',
    });
  } catch (error: any) {
    console.error('Submit error:', error);

    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'A premium listing already exists for this item' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to submit premium listing' },
      { status: 500 }
    );
  }
}
