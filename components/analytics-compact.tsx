'use client';

import { useEffect, useState } from 'react';
import { Activity, Eye } from 'lucide-react';

export function AnalyticsCompact() {
  const [liveViewers, setLiveViewers] = useState<number>(0);
  const [totalViews, setTotalViews] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [liveRes, statsRes] = await Promise.all([
          fetch('/api/analytics/live-viewers'),
          fetch('/api/analytics/total-stats'),
        ]);

        const liveData = await liveRes.json();
        const statsData = await statsRes.json();

        setLiveViewers(liveData.liveViewers || 0);
        setTotalViews(statsData.totalPageViews || 0);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const formatViews = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-8 px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-gray-300 rounded-full animate-pulse"></div>
          <div className="h-4 w-12 bg-gray-300 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-gray-300 rounded-full animate-pulse"></div>
          <div className="h-4 w-16 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-8 px-6 py-3 bg-white border-b border-gray-200">
      {/* Live Viewers */}
      <div className="flex items-center gap-2 group cursor-pointer hover:opacity-75 transition">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 bg-red-600 rounded-full animate-pulse"></div>
          <span className="text-sm font-bold text-gray-900">
            {liveViewers}
            <span className="text-xs font-normal text-gray-500 ml-1">LIVE</span>
          </span>
        </div>
      </div>

      {/* Views */}
      <div className="flex items-center gap-2 group cursor-pointer hover:opacity-75 transition">
        <Eye className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-bold text-gray-900">
          {formatViews(totalViews)}
          <span className="text-xs font-normal text-gray-500 ml-1">VIEWS</span>
        </span>
      </div>
    </div>
  );
}
