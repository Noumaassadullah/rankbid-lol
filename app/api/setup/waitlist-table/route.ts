import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create waitlist table
    const { error: createError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS waitlist (
          id BIGSERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          notified BOOLEAN DEFAULT FALSE,
          notifiedAt TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
        CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist("createdAt" DESC);
      `,
    });

    if (createError) {
      // Try direct SQL approach
      const { data, error } = await supabase.from('waitlist').select('count', { count: 'exact' });

      if (error && error.code === 'PGRST116') {
        // Table doesn't exist, we need to create it manually
        return NextResponse.json(
          {
            error: 'Table creation failed. Please run the SQL manually in Supabase console.',
            sql: `
              CREATE TABLE IF NOT EXISTS waitlist (
                id BIGSERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                notified BOOLEAN DEFAULT FALSE,
                notifiedAt TIMESTAMP
              );

              CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
              CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist("createdAt" DESC);

              ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

              CREATE POLICY "Anyone can insert to waitlist" ON waitlist
                FOR INSERT
                WITH CHECK (true);
            `,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Waitlist table created successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: error.message || 'Setup failed' },
      { status: 500 }
    );
  }
}
