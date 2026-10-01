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

    // Update daily analytics - increment page_views for every hit, total_visitors only for new sessions
    try {
      // First, try to get existing record
      const { data: existing, error: getError } = await supabase
        .from('visitor_analytics')
        .select('total_visitors, page_views')
        .eq('date', today)
        .maybeSingle();

      if (getError && getError.code !== 'PGRST116') {
        throw getError;
      }

      if (existing) {
        // Record exists - increment page_views on every hit, total_visitors only for new sessions
        console.log('[TRACKING] Found existing analytics, incrementing...');
        const updateData: any = {
          page_views: existing.page_views + 1,
          updated_at: now,
        };

        if (isNewSession) {
          updateData.total_visitors = existing.total_visitors + 1;
        }

        const { error: updateError } = await supabase
          .from('visitor_analytics')
          .update(updateData)
          .eq('date', today);

        if (updateError) {
          console.error('[TRACKING] Error incrementing:', updateError);
        } else {
          console.log('[TRACKING] Incremented page_views to', existing.page_views + 1);
        }
      } else {
        // Record doesn't exist - create it
        console.log('[TRACKING] Creating new analytics record...');
        const { error: createError } = await supabase
          .from('visitor_analytics')
          .insert({
            date: today,
            total_visitors: isNewSession ? 1 : 0,
            unique_visitors: isNewSession ? 1 : 0,
            page_views: 1,
          });

        if (createError) {
          console.error('[TRACKING] Error creating analytics:', createError);
        } else {
          console.log('[TRACKING] Created new analytics record');
        }
      }
    } catch (analyticsError) {
      console.error('[TRACKING] Analytics tracking error:', analyticsError);
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
