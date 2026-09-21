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

    // Create votes table via SQL
    const sql = `
      CREATE TABLE IF NOT EXISTS votes (
        id TEXT PRIMARY KEY,
        listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
        voter_id TEXT NOT NULL,
        voted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        UNIQUE(listing_id, voter_id)
      );

      CREATE INDEX IF NOT EXISTS idx_votes_listing_id ON votes(listing_id);
      CREATE INDEX IF NOT EXISTS idx_votes_voter_id ON votes(voter_id);
      CREATE INDEX IF NOT EXISTS idx_votes_voted_at ON votes(voted_at);
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
        body: JSON.stringify({ sql }),
      }
    ).catch(() => null);

    if (!response) {
      // Fallback: try creating via direct table API
      const createVotesRes = await fetch(
        `${supabaseUrl}/rest/v1/votes`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: 'test_init',
            listing_id: '',
            voter_id: '',
          }),
        }
      );

      if (createVotesRes.status === 404) {
        return NextResponse.json(
          { error: 'Votes table does not exist - need manual SQL creation' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database initialized',
    });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json(
      {
        error: 'Initialization failed',
        details: String(error),
      },
      { status: 500 }
    );
  }
}
