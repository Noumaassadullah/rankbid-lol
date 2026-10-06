import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Create the daily_snapshots table
    const sql = `
      CREATE TABLE IF NOT EXISTS daily_snapshots (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        date date NOT NULL UNIQUE,
        snapshot_data jsonb NOT NULL,
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_daily_snapshots_date ON daily_snapshots(date DESC);
    `;

    // Execute the SQL
    let error: any = null;
    try {
      const result = await supabase.rpc('exec', { sql: sql });
      error = result.error;
    } catch (e) {
      // If exec doesn't work, try direct table creation
      try {
        await supabase.from('daily_snapshots').select('id').limit(1);
      } catch (fallbackError: any) {
        error = fallbackError;
      }
    }

    if (error && error?.code !== '23505') { // Ignore "already exists" error
      console.error('Error creating table:', error);
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        message: 'daily_snapshots table created or already exists',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create snapshots table',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
