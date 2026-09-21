import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Create votes table via Supabase SQL API
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS votes (
        id TEXT PRIMARY KEY,
        listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
        voter_id TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        UNIQUE(listing_id, voter_id)
      );

      CREATE INDEX IF NOT EXISTS idx_votes_listing_id ON votes(listing_id);
      CREATE INDEX IF NOT EXISTS idx_votes_voter_id ON votes(voter_id);
      CREATE INDEX IF NOT EXISTS idx_votes_created_at ON votes(created_at);
    `;

    const response = await fetch(
      `${supabaseUrl}/rest/v1/rpc/exec_sql`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql: createTableSQL }),
      }
    );

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Votes table created successfully',
      });
    } else {
      const error = await response.json();
      // Table might already exist, which is fine
      if (error.message?.includes('already exists')) {
        return NextResponse.json({
          success: true,
          message: 'Votes table already exists',
        });
      }
      return NextResponse.json(
        { error: error.message || 'Failed to create table' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Setup failed' },
      { status: 500 }
    );
  }
}
