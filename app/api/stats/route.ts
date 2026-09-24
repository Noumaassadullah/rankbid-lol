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

    console.log('[STATS GET] Fetching stats...');

    const { count: onlineCount, error: onlineError, data: onlineData } = await sb
      .from('visitor_sessions')
      .select('id', { count: 'exact', head: false })
      .eq('is_active', true)
      .gt('last_activity', fiveMinutesAgo);

    console.log('[STATS GET] Online:', onlineCount, onlineError);

    if (onlineError) throw onlineError;

    // Get total visitors (count distinct sessions from today)
    const today = new Date().toISOString().split('T')[0];
    const { count: todayCount, error: todayError } = await sb
      .from('visitor_sessions')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00`);

    console.log('[STATS GET] Today:', todayCount, todayError);

    if (todayError) throw todayError;

    // Get all-time visitors
    const { count: allCount, error: allError } = await sb
      .from('visitor_sessions')
      .select('id', { count: 'exact', head: true });

    console.log('[STATS GET] All time:', allCount, allError);

    if (allError) throw allError;

    const result = {
      onlineNow: onlineCount || 0,
      todayVisitors: todayCount || 0,
      allTimeVisitors: allCount || 0,
      timestamp: new Date().toISOString(),
    };

    console.log('[STATS GET] Result:', result);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[STATS GET] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch stats',
        onlineNow: 0,
        todayVisitors: 0,
        allTimeVisitors: 0,
        details: error.message
      },
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

    console.log('[STATS POST] Tracking:', { sessionId, pageUrl, ip });

    // Try to insert or update session
    const { data, error } = await sb
      .from('visitor_sessions')
      .insert({
        session_id: sessionId,
        ip_address: ip,
        user_agent: userAgent,
        page_url: pageUrl,
        last_activity: new Date().toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('[STATS POST] Error:', error);
      throw error;
    }

    console.log('[STATS POST] Success:', data);
    return NextResponse.json({ success: true, session: data });
  } catch (error: any) {
    console.error('[STATS POST] Catch error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to track visitor',
      details: error
    }, { status: 500 });
  }
}
