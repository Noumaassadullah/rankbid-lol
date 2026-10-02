import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Reset day_votes to 0 for all listings
    const response = await fetch(
      `${supabaseUrl}/rest/v1/listings?day_votes=gt.-1`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          day_votes: 0,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Supabase update error:', error);
      throw new Error(error.message || 'Failed to reset daily votes');
    }

    const result = await response.json();
    const updatedCount = Array.isArray(result) ? result.length : 0;

    console.log(`Cron job: Reset day_votes for ${updatedCount} listings at ${new Date().toISOString()}`);

    return NextResponse.json(
      {
        success: true,
        message: `Reset day_votes for ${updatedCount} listings`,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json(
      {
        error: 'Failed to reset daily votes',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
