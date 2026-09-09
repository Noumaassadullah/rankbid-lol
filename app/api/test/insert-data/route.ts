// Test endpoint to insert sample data (uses admin client to bypass RLS)
// ⚠️ For testing only - remove in production

import { createAdminClientInstance } from '@/app/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const admin = createAdminClientInstance();

    // Create test user first
    // @ts-expect-error - Supabase type inference issue
    const { data: userData, error: userError } = await admin
      .from('users')
      .insert([
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'test@rankbid.com',
          username: 'testuser',
          full_name: 'Test User',
          country: 'Pakistan',
          rating: 4.5,
          is_verified: true,
          listings_count: 0,
        },
      ])
      .select();

    if (userError && !userError.message.includes('duplicate')) {
      throw userError;
    }

    // Create test listings
    // @ts-expect-error - Supabase type inference issue
    const { data: listings, error: listingsError } = await admin
      .from('listings')
      .insert([
        {
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'iPhone 15 Pro - 256GB',
          description: 'Excellent condition, original box and accessories included',
          category: 'electronics',
          price: 180000,
          location: 'Karachi',
          status: 'active',
          views: 0,
        },
        {
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Gaming Laptop - RTX 4060',
          description: 'Dell XPS 15, 16GB RAM, 512GB SSD, 1 year old',
          category: 'electronics',
          price: 220000,
          location: 'Lahore',
          status: 'active',
          views: 0,
        },
        {
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Mountain Bike - Trek Marlin',
          description: 'Good condition, recently serviced',
          category: 'sports',
          price: 45000,
          location: 'Islamabad',
          status: 'active',
          views: 0,
        },
      ])
      .select();

    if (listingsError) {
      throw listingsError;
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Test data inserted successfully',
        user: userData ? userData[0] : { id: '550e8400-e29b-41d4-a716-446655440000' },
        listings: listings,
        count: listings?.length || 0,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to insert test data',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const admin = createAdminClientInstance();

    const { data, error } = await admin
      .from('listings')
      .select(
        `
        *,
        users:user_id (
          username,
          avatar_url,
          rating,
          is_verified
        )
        `
      )
      .eq('status', 'active');

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        count: data?.length || 0,
        listings: data,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch listings',
      },
      { status: 500 }
    );
  }
}
