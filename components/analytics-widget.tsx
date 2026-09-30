'use client';

import { useEffect, useState } from 'react';
import { Eye, BarChart3, TrendingUp, Activity } from 'lucide-react';

type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'all';

interface FilteredStats {
  period: string;
  visitors: number;
  pageViews: number;
  averageVisitorsPerDay?: number;
}

export function AnalyticsWidget() {
  const [liveViewers, setLiveViewers] = useState<number | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('daily');
  const [filteredStats, setFilteredStats] = useState<FilteredStats>({
    period: 'daily',
    visitors: 0,
    pageViews: 0,
  });
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

        const [liveRes, statsRes, filteredRes] = await Promise.all([
          fetch('/api/analytics/live-viewers'),
          fetch('/api/analytics/total-stats'),
          fetch(`/api/analytics/filtered-stats?period=${timePeriod}`),
        ]);

        const liveData = await liveRes.json();
        const statsData = await statsRes.json();
        const filteredData = await filteredRes.json();

        console.log('[WIDGET] Live viewers:', liveData);
        console.log('[WIDGET] Stats:', statsData);
        console.log('[WIDGET] Filtered stats:', filteredData);

        setLiveViewers(liveData.liveViewers);
        setStats(statsData);
        setFilteredStats(filteredData);
      } catch (error) {
        console.error('[WIDGET] Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [timePeriod]);

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case 'daily': return 'Today';
      case 'weekly': return 'This Week';
      case 'monthly': return 'This Month';
      case 'all': return 'All Time';
      default: return period;
    }
  };

  return (
    <div className="space-y-4 p-4">
      {/* Time Period Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['daily', 'weekly', 'monthly', 'all'] as TimePeriod[]).map((period) => (
          <button
            key={period}
            onClick={() => setTimePeriod(period)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              timePeriod === period
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {getPeriodLabel(period)}
          </button>
        ))}
      </div>

      {/* Live Viewers & Period Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        {/* Period Visitors */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="text-blue-600" size={20} />
            <span className="text-blue-700 font-semibold text-sm">{getPeriodLabel(timePeriod)}</span>
          </div>
          <div className="text-4xl font-bold text-blue-700">{filteredStats.visitors}</div>
          <p className="text-blue-600 text-xs mt-2">
            {timePeriod === 'daily' && 'Visitors today'}
            {timePeriod === 'weekly' && `Visitors this week (avg ${filteredStats.averageVisitorsPerDay || 0}/day)`}
            {timePeriod === 'monthly' && `Visitors this month (avg ${filteredStats.averageVisitorsPerDay || 0}/day)`}
            {timePeriod === 'all' && 'All time visitors'}
          </p>
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

        {/* Period Page Views */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="text-purple-600" size={20} />
            <span className="text-purple-700 font-semibold text-sm">Views</span>
          </div>
          <div className="text-4xl font-bold text-purple-700">{filteredStats.pageViews}</div>
          <p className="text-purple-600 text-xs mt-2">
            {timePeriod === 'daily' && 'Page views today'}
            {timePeriod === 'weekly' && 'Page views this week'}
            {timePeriod === 'monthly' && 'Page views this month'}
            {timePeriod === 'all' && 'All time page views'}
          </p>
        </div>
      </div>
    </div>
  );
}
