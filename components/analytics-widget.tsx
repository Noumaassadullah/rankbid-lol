'use client';

import { useEffect, useState } from 'react';
import { Eye, BarChart3, TrendingUp, Activity } from 'lucide-react';

export function AnalyticsWidget() {
  const [liveViewers, setLiveViewers] = useState<number | null>(null);
  const [stats, setStats] = useState({
    totalVisitors: 0,
    totalPageViews: 0,
    todayVisitors: 0,
    todayPageViews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        console.log('[WIDGET] Fetching analytics...');

        const [liveRes, statsRes] = await Promise.all([
          fetch('/api/analytics/live-viewers'),
          fetch('/api/analytics/total-stats'),
        ]);

        const liveData = await liveRes.json();
        const statsData = await statsRes.json();

        console.log('[WIDGET] Live viewers:', liveData);
        console.log('[WIDGET] Stats:', statsData);

        setLiveViewers(liveData.liveViewers);
        setStats(statsData);
      } catch (error) {
        console.error('[WIDGET] Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-24"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
      {/* Live Viewers */}
      <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="text-red-600" size={20} />
            <span className="text-red-700 font-semibold text-sm">Live Now</span>
          </div>
          <div className="h-3 w-3 bg-red-600 rounded-full animate-pulse"></div>
        </div>
        <div className="text-4xl font-bold text-red-700">{liveViewers ?? 0}</div>
        <p className="text-red-600 text-xs mt-2">Active in last 30 min</p>
      </div>

      {/* Today's Visitors */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="text-blue-600" size={20} />
          <span className="text-blue-700 font-semibold text-sm">Today</span>
        </div>
        <div className="text-4xl font-bold text-blue-700">{stats.todayVisitors}</div>
        <p className="text-blue-600 text-xs mt-2">Visitors today</p>
      </div>

      {/* Total Visitors */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-green-600" size={20} />
          <span className="text-green-700 font-semibold text-sm">Total</span>
        </div>
        <div className="text-4xl font-bold text-green-700">{stats.totalVisitors}</div>
        <p className="text-green-600 text-xs mt-2">All time visitors</p>
      </div>

      {/* Page Views */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-purple-600" size={20} />
          <span className="text-purple-700 font-semibold text-sm">Views</span>
        </div>
        <div className="text-4xl font-bold text-purple-700">{stats.totalPageViews}</div>
        <p className="text-purple-600 text-xs mt-2">Total page views</p>
      </div>
    </div>
  );
}
