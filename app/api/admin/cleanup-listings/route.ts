import { NextRequest, NextResponse } from 'next/server';

async function checkUrlAccessible(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    clearTimeout(timeout);
    return response.status >= 200 && response.status < 400;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Fetch all listings
    const response = await fetch(`${supabaseUrl}/rest/v1/listings?select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
    }

    const listings = await response.json();
    const invalidListings: string[] = [];
    const validListings: string[] = [];

    // Check each URL
    for (const listing of listings) {
      const url = listing.location;
      if (!url) {
        invalidListings.push(listing.id);
        continue;
      }

      const isValid = await checkUrlAccessible(url);
      if (!isValid) {
        invalidListings.push(listing.id);
      } else {
        validListings.push(listing.id);
      }
    }

    // Delete invalid listings
    let deletedCount = 0;
    for (const id of invalidListings) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/listings?id=eq.${id}`, {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        });
        deletedCount++;
      } catch (err) {
        console.error(`Failed to delete listing ${id}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      totalListings: listings.length,
      validListings: validListings.length,
      invalidListings: invalidListings.length,
      deletedCount,
      invalidIds: invalidListings,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
