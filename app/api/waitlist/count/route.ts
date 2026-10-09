import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Supabase count error:', error.message);
      return NextResponse.json({ count: null });
    }

    // The real number of signups; never padded.
    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error('Count error:', error);
    return NextResponse.json({ count: null });
  }
}
