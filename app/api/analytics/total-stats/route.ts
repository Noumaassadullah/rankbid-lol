import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const revalidate = 0; // Don't cache

export async function GET() {
  try {
    // Get all historical stats
    const { data: stats, error } = await supabase
      .from('visitor_analytics')
      .select('total_visitors, page_views, date');

    if (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }

    const totalVisitors = stats?.reduce((sum, day) => sum + (day.total_visitors || 0), 0) || 0;
    const totalPageViews = stats?.reduce((sum, day) => sum + (day.page_views || 0), 0) || 0;

    // Get today's stats
    const today = new Date().toISOString().split('T')[0];
    const { data: todayStats } = await supabase
      .from('visitor_analytics')
      .select('*')
      .eq('date', today)
      .single();

    const result = {
      totalVisitors,
      totalPageViews,
      todayVisitors: todayStats?.total_visitors || 0,
      todayPageViews: todayStats?.page_views || 0,
      timestamp: new Date().toISOString(),
    };

    console.log('[STATS]', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({
      totalVisitors: 0,
      totalPageViews: 0,
      todayVisitors: 0,
      todayPageViews: 0,
      error: String(error),
    }, { status: 500 });
  }
}
