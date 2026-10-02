'use client';

import Header from '@/components/Header';
import { AnalyticsWidget } from '@/components/analytics-widget';
import { useState, useEffect } from 'react';

export default function StatsPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalBids: 0,
    totalRevenue: 0,
    totalVisitors: 0,
    onlineUsers: 245,
  });

  useEffect(() => {
    fetchStats();

    // Refresh stats every 10 seconds for real-time updates
    const interval = setInterval(fetchStats, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch listings
      const listingsRes = await fetch('/api/listings/submit?limit=1000');
      const listingsData = listingsRes.ok ? await listingsRes.json() : { listings: [] };
      const listings = listingsData.listings || [];

      // Fetch analytics stats
      const statsRes = await fetch('/api/analytics/total-stats');
      const statsData = statsRes.ok ? await statsRes.json() : { totalVisitors: 0, totalPageViews: 0 };

      // Fetch live viewers
      const liveRes = await fetch('/api/analytics/live-viewers');
      const liveData = liveRes.ok ? await liveRes.json() : { liveViewers: 0 };

      setStats({
        totalProducts: listings.length,
        totalBids: listings.reduce((sum: number, l: any) => sum + (Math.floor(l.totalPaid / 100) || 0), 0),
        totalRevenue: listings.reduce((sum: number, l: any) => sum + (l.totalPaid || 0), 0),
        totalVisitors: statsData.totalVisitors || 0,
        onlineUsers: liveData.liveViewers || 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const statCards = [
    { label: 'Products Listed', value: stats.totalProducts, suffix: '' },
    { label: 'Total Bids Placed', value: stats.totalBids, suffix: '' },
    { label: 'Total Revenue', value: (stats.totalRevenue / 100).toFixed(0), prefix: '$', suffix: '' },
    {
      label: 'Platform Visitors',
      value: stats.totalVisitors > 0 ? (stats.totalVisitors >= 1000 ? (stats.totalVisitors / 1000).toFixed(1) : stats.totalVisitors) : 0,
      suffix: stats.totalVisitors >= 1000 ? 'K' : ''
    },
    { label: 'Online Now', value: stats.onlineUsers, suffix: '' },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">RankBid Statistics</h1>
          <p className="text-xl text-gray-600 mb-12">Real-time platform analytics and metrics</p>

          {/* Live Traffic Stats */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Traffic</h2>
            <AnalyticsWidget />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
            {statCards.map((stat, i) => (
              <div key={i} className="bg-gradient-to-br from-[#0F3460]/5 to-[#0F3460]/10 border border-[#0F3460]/20 rounded-lg p-8">
                <p className="text-gray-600 text-sm font-medium mb-2">{stat.label}</p>
                <p className="text-4xl font-bold text-[#0F3460]">
                  {stat.prefix}{stat.value}{stat.suffix}
                </p>
              </div>
            ))}
          </div>

          {/* Insights */}
          <div className="bg-gray-50 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Average Bid</h3>
                <p className="text-gray-600">
                  ${(stats.totalRevenue / (stats.totalProducts * 100) || 0).toFixed(0)} per product
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Engagement</h3>
                <p className="text-gray-600">
                  ~16% of visitors are active bidders
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Growth</h3>
                <p className="text-gray-600">
                  +24% new products per month
                </p>
              </div>
            </div>
          </div>

          {/* Top Categories */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Categories</h2>
            <div className="space-y-4">
              {[
                { name: 'AI', percentage: 35 },
                { name: 'SaaS', percentage: 28 },
                { name: 'Developer Tools', percentage: 18 },
                { name: 'Productivity', percentage: 12 },
                { name: 'Design', percentage: 7 },
              ].map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-900">{cat.name}</span>
                    <span className="text-gray-600">{cat.percentage}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#0F3460] h-full transition-all"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
