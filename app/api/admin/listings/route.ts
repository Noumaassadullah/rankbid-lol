import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params: any[] = [];

    if (search) {
      whereClause += ` WHERE title ILIKE $1 OR description ILIKE $1`;
      params.push(`%${search}%`);
    }

    if (category) {
      const paramNum = params.length + 1;
      whereClause += whereClause ? ` AND category = $${paramNum}` : ` WHERE category = $${paramNum}`;
      params.push(category);
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as count FROM listings ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get listings
    const listingsResult = await query(
      `SELECT id, title, description, url, category, total_votes, day_votes, click_count, created_at, updated_at
       FROM listings ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      listings: listingsResult.rows,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!verifyAdminKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { listingId } = await req.json();

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID required' },
        { status: 400 }
      );
    }

    // Delete associated votes first
    await query('DELETE FROM user_votes WHERE listing_id = $1', [listingId]);
    await query('DELETE FROM votes WHERE listing_id = $1', [listingId]);

    // Delete the listing
    const result = await query(
      'DELETE FROM listings WHERE id = $1 RETURNING id',
      [listingId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Listing deleted' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  if (!verifyAdminKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { listingId, title, description, category } = await req.json();

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID required' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE listings
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [title, description, category, listingId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      listing: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}
