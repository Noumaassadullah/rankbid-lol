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
    const now = new Date().toISOString();
    const today = now.split('T')[0];
    let isNewSession = false;

    // Check if session exists
    const { data: existingSession, error: checkError } = await supabase
      .from('visitor_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    if (existingSession) {
      // Update last activity
      const { error: updateError } = await supabase
        .from('visitor_sessions')
        .update({
          last_activity: now,
          page_url: pageUrl,
          is_active: true,
        })
        .eq('session_id', sessionId);

      if (updateError) {
        console.error('Error updating session:', updateError);
      }
    } else {
      // Create new session
      isNewSession = true;
      const { error: insertError } = await supabase
        .from('visitor_sessions')
        .insert({
          session_id: sessionId,
          user_agent: userAgent,
          ip_address: ipAddress,
          page_url: pageUrl,
          last_activity: now,
          is_active: true,
        });

      if (insertError) {
        console.error('Error creating session:', insertError);
      }
    }

    // Update daily analytics - only increment when new session created
    if (isNewSession) {
      const { data: analyticsData, error: selectError } = await supabase
        .from('visitor_analytics')
        .select('id, total_visitors, page_views')
        .eq('date', today)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error selecting analytics:', selectError);
      }

      if (analyticsData) {
        // Update existing day record
        const { error: updateError } = await supabase
          .from('visitor_analytics')
          .update({
            total_visitors: (analyticsData.total_visitors || 0) + 1,
            page_views: (analyticsData.page_views || 0) + 1,
            updated_at: now,
          })
          .eq('date', today);

        if (updateError) {
          console.error('Error updating analytics:', updateError);
        }
      } else {
        // Create new day record
        const { error: insertError } = await supabase
          .from('visitor_analytics')
          .insert({
            date: today,
            total_visitors: 1,
            unique_visitors: 1,
            page_views: 1,
          });

        if (insertError) {
          console.error('Error creating analytics:', insertError);
        }
      }
    }

    console.log('[TRACKING] Session:', sessionId, 'New:', isNewSession, 'Date:', today);
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
