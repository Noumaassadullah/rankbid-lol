// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

let supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (supabase) return supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials');
  }

  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return supabase;
}

export async function GET() {
  try {
    const sb = getSupabase();
    // Get online users (active sessions in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data: onlineSessions, error: onlineError } = await sb
      .from('visitor_sessions')
      .select('id', { count: 'exact', head: false })
      .eq('is_active', true)
      .gt('last_activity', fiveMinutesAgo);

    if (onlineError) throw onlineError;

    // Get total visitors (count distinct sessions from today)
    const today = new Date().toISOString().split('T')[0];
    const { data: todaySessions, error: todayError } = await sb
      .from('visitor_sessions')
      .select('id', { count: 'exact', head: false })
      .gte('created_at', `${today}T00:00:00`);

    if (todayError) throw todayError;

    // Get all-time visitors
    const { data: allSessions, error: allError } = await sb
      .from('visitor_sessions')
      .select('id', { count: 'exact', head: false });

    if (allError) throw allError;

    return NextResponse.json({
      onlineNow: onlineSessions?.length || 0,
      todayVisitors: todaySessions?.length || 0,
      allTimeVisitors: allSessions?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', onlineNow: 0, todayVisitors: 0, allTimeVisitors: 0 },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sb = getSupabase();
    const { sessionId, pageUrl } = await request.json();
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Try to insert or update session
    const { data, error } = await sb
      .from('visitor_sessions')
      .upsert(
        {
          session_id: sessionId,
          ip_address: ip,
          user_agent: userAgent,
          page_url: pageUrl,
          last_activity: new Date().toISOString(),
          is_active: true,
        },
        { onConflict: 'session_id' }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, session: data });
  } catch (error) {
    console.error('Error tracking visitor:', error);
    return NextResponse.json({ success: false, error: 'Failed to track visitor' }, { status: 500 });
  }
}
