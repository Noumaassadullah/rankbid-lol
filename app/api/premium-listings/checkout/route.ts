import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface CartItem {
  listingId: string;
  position: number;
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

const PRICES: { [key: number]: number } = {
  1: 5,
  2: 3,
  3: 1,
};

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty or invalid' },
        { status: 400 }
      );
    }

    const results = [];
    let totalPrice = 0;

    for (const item of items) {
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
      } = item;

      if (!listingId || !position || !founderName || !founderEmail || !founderPhone) {
        return NextResponse.json(
          { error: 'Missing required fields for one or more items' },
          { status: 400 }
        );
      }

      if (![1, 2, 3].includes(position)) {
        return NextResponse.json(
          { error: 'Invalid position. Must be 1, 2, or 3' },
          { status: 400 }
        );
      }

      const price = PRICES[position];
      totalPrice += price;

      try {
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

        if (result.rows.length > 0) {
          results.push(result.rows[0]);
        }
      } catch (err: any) {
        console.error(`Error creating premium listing for ${listingId}:`, err);

        if (err.code === '23505') {
          return NextResponse.json(
            { error: `A premium listing already exists for this item` },
            { status: 409 }
          );
        }

        throw err;
      }
    }

    if (results.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create premium listings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully submitted ${results.length} premium listing${results.length !== 1 ? 's' : ''} for review`,
      premiumListings: results,
      totalPrice,
      itemCount: results.length,
      nextSteps: 'An admin will verify your payment and activate your premium listings within 24 hours. Check your email for confirmation.',
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Checkout failed' },
      { status: 500 }
    );
  }
}
