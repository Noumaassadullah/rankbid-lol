// Example API routes for Supabase integration
// Copy and adapt these patterns for your actual routes

import { createClient } from '@/app/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/examples/listings-example
 * Fetch paginated listings with optional filters
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'active';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // Cap at 100 for free tier

    const offset = (page - 1) * limit;

    // Build query with filters
    let query = supabase
      .from('listings')
      .select(
        `
        *,
        users:user_id (
          id,
          username,
          avatar_url,
          rating,
          is_verified
        )
        `,
        { count: 'exact' }
      )
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    // Apply pagination
    const { data: listings, count, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        data: listings,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/examples/listings-example
 * Create a new listing (requires authentication)
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validate required fields
    if (!body.user_id || !body.title || !body.description || !body.price) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, title, description, price' },
        { status: 400 }
      );
    }

    const { data: listing, error } = await supabase
      .from('listings')
      .insert([
        {
          user_id: body.user_id,
          title: body.title,
          description: body.description,
          category: body.category || 'general',
          price: parseFloat(body.price),
          location: body.location || 'Pakistan',
          status: 'active',
        } as any,
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create listing' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/examples/listings-example?id=UUID
 * Update a listing
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    const { data: listing, error } = await supabase
      .from('listings')
      .update({
        title: body.title,
        description: body.description,
        price: body.price ? parseFloat(body.price) : undefined,
        status: body.status,
        category: body.category,
        location: body.location,
        is_featured: body.is_featured,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(listing);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update listing' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/examples/listings-example?id=UUID
 * Delete a listing
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete listing' },
      { status: 500 }
    );
  }
}
