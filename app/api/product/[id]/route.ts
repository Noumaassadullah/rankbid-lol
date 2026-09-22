import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function query(text: string, params: any[] = []) {
  const url = `${supabaseUrl}/rest/v1/rpc/sql`;
  const res = await fetch(`${supabaseUrl}/rest/v1/listings?id=eq.${encodeURIComponent(params[0])}`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
  });

  return res.json();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID required', product: null },
        { status: 400 }
      );
    }

    // Fetch specific product by ID
    const res = await fetch(
      `${supabaseUrl}/rest/v1/listings?id=eq.${encodeURIComponent(id)}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch product', product: null },
        { status: res.status }
      );
    }

    const listings = await res.json();
    const product = listings[0] || null;

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found', product: null },
        { status: 404 }
      );
    }

    // Map database schema to expected schema
    const mappedProduct = {
      id: product.id,
      title: product.title,
      description: product.description,
      url: product.location || product.url,
      category: product.category || 'Other',
      platform: product.platform || 'website',
      totalVotes: product.total_votes || 0,
      dayVotes: product.day_votes || 0,
      totalPaid: product.price || 0,
      dayPaid: 0,
      clickCount: product.click_count || 0,
      createdAt: product.created_at,
    };

    // Also fetch all listings for ranking
    const allRes = await fetch(
      `${supabaseUrl}/rest/v1/listings?select=id,price,total_votes,day_votes`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    let allListings = [];
    if (allRes.ok) {
      allListings = await allRes.json();
    }

    return NextResponse.json({
      product: mappedProduct,
      allListings: allListings,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error', product: null },
      { status: 500 }
    );
  }
}
