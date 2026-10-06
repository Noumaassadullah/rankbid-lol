import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET() {
  const diagnostic: any = {
    timestamp: new Date().toISOString(),
    supabaseUrl: supabaseUrl ? '✓ Set' : '✗ Missing',
    supabaseKey: supabaseKey ? '✓ Set' : '✗ Missing',
    checks: [],
  };

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(diagnostic, { status: 400 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try to query waitlist table
    const { data, error, status } = await supabase
      .from('waitlist')
      .select('count', { count: 'exact', head: true });

    if (error) {
      diagnostic.checks.push({
        name: 'Waitlist table exists',
        status: '✗ Failed',
        error: error.message,
        code: error.code,
        details: error.details,
      });

      if (error.code === 'PGRST116') {
        diagnostic.solution = 'Table does not exist. Run the SQL setup in Supabase console.';
      }
    } else {
      diagnostic.checks.push({
        name: 'Waitlist table exists',
        status: '✓ OK',
        rowCount: data?.length || 0,
      });

      // Try to insert test record
      const testEmail = `test-${Date.now()}@example.com`;
      const { error: insertError } = await supabase
        .from('waitlist')
        .insert([{ email: testEmail, createdAt: new Date().toISOString() }])
        .select()
        .single();

      if (insertError) {
        diagnostic.checks.push({
          name: 'Insert permission',
          status: '✗ Failed',
          error: insertError.message,
        });
      } else {
        diagnostic.checks.push({
          name: 'Insert permission',
          status: '✓ OK',
        });

        // Cleanup: delete test record
        await supabase.from('waitlist').delete().eq('email', testEmail);
      }
    }
  } catch (error: any) {
    diagnostic.checks.push({
      name: 'Connection test',
      status: '✗ Failed',
      error: error.message,
    });
  }

  return NextResponse.json(diagnostic, { status: 200 });
}
