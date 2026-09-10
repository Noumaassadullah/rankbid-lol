import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function GET() {
  try {
    // Get online users (active sessions in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data: onlineSessions, error: onlineError } = await supabase
      .from('visitor_sessions')
      .select('id', { count: 'exact', head: false })
      .eq('is_active', true)
      .gt('last_activity', fiveMinutesAgo);

    if (onlineError) throw onlineError;

    // Get total visitors (count distinct sessions from today)
    const today = new Date().toISOString().split('T')[0];
    const { data: todaySessions, error: todayError } = await supabase
      .from('visitor_sessions')
      .select('id', { count: 'exact', head: false })
      .gte('created_at', `${today}T00:00:00`);

    if (todayError) throw todayError;

    // Get all-time visitors
    const { data: allSessions, error: allError } = await supabase
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
    const { sessionId, pageUrl } = await request.json();
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Try to insert or update session
    const { data, error } = await supabase
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
