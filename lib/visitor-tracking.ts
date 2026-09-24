import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function trackVisitor(
  sessionId: string,
  userAgent: string,
  ipAddress: string,
  pageUrl: string
) {
  try {
    // Check if session exists
    const { data: existingSession } = await supabase
      .from('visitor_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    if (existingSession) {
      // Update last activity
      await supabase
        .from('visitor_sessions')
        .update({
          last_activity: new Date().toISOString(),
          page_url: pageUrl,
          is_active: true,
        })
        .eq('session_id', sessionId);
    } else {
      // Create new session
      await supabase
        .from('visitor_sessions')
        .insert({
          session_id: sessionId,
          user_agent: userAgent,
          ip_address: ipAddress,
          page_url: pageUrl,
          last_activity: new Date().toISOString(),
          is_active: true,
        });
    }

    // Update daily analytics
    const today = new Date().toISOString().split('T')[0];
    const { data: analyticsData } = await supabase
      .from('visitor_analytics')
      .select('*')
      .eq('date', today)
      .single();

    if (analyticsData) {
      // Update existing day record
      await supabase
        .from('visitor_analytics')
        .update({
          total_visitors: (analyticsData.total_visitors || 0) + 1,
          page_views: (analyticsData.page_views || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('date', today);
    } else {
      // Create new day record
      await supabase
        .from('visitor_analytics')
        .insert({
          date: today,
          total_visitors: 1,
          unique_visitors: 1,
          page_views: 1,
        });
    }

    return { success: true };
  } catch (error) {
    console.error('Visitor tracking error:', error);
    return { success: false, error };
  }
}

export async function cleanupInactiveSessions() {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from('visitor_sessions')
      .update({ is_active: false })
      .lt('last_activity', thirtyMinutesAgo);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Cleanup error:', error);
    return { success: false, error };
  }
}
