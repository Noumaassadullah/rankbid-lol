import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const revalidate = 0; // Don't cache

export async function GET() {
  try {
    // Get active sessions in the last 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data: activeSessions, error } = await supabase
      .from('visitor_sessions')
      .select('id', { count: 'exact', head: true })
      .gte('last_activity', thirtyMinutesAgo)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching live viewers:', error);
      throw error;
    }

    const count = activeSessions?.length || 0;
    console.log(`[LIVE VIEWERS] Current: ${count}`);

    return NextResponse.json({
      liveViewers: count,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching live viewers:', error);
    return NextResponse.json(
      { liveViewers: 0, error: String(error) },
      { status: 500 }
    );
  }
}
