'use client';

import Header from '@/components/Header';
import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, DollarSign } from 'lucide-react';

interface Listing {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  totalPaid: number;
  dayPaid: number;
  clickCount: number;
}

export default function LeaderboardPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'alltime' | 'today'>('alltime');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await fetch('/api/listings/submit?limit=500');
      if (!res.ok) {
        setListings([]);
        return;
      }
      const data = await res.json();
      setListings(data.listings || []);
    } catch (error) {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const sortedListings = activeTab === 'today'
    ? [...listings].sort((a, b) => b.dayPaid - a.dayPaid)
    : [...listings].sort((a, b) => b.totalPaid - a.totalPaid);

  const topThree = sortedListings.slice(0, 3);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white dark:from-black dark:via-gray-900 dark:to-black">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F3460] to-[#1a5490] text-white">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="flex items-center gap-4 mb-4">
              <Trophy className="w-10 h-10" />
              <h1 className="text-5xl font-bold">Global Leaderboard</h1>
            </div>
            <p className="text-xl text-white/80">
              Top-ranked products competing for the #1 spot
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Tabs */}
          <div className="flex gap-6 mb-12 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('alltime')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'alltime'
                  ? 'text-[#0F3460] border-b-2 border-[#0F3460]'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setActiveTab('today')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'today'
                  ? 'text-[#0F3460] border-b-2 border-[#0F3460]'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Today
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F3460]"></div>
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              {topThree.length > 0 && (
                <div className="mb-16">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">🏆 Top 3</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* 2nd Place */}
                    {topThree[1] && (
                      <div className="transform md:translate-y-8">
                        <div className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-gray-300 dark:border-gray-600 p-6 text-center">
                          <div className="text-5xl font-black text-gray-400 mb-3">🥈</div>
                          <h3 className="font-bold text-gray-900 dark:text-white mb-2">{topThree[1].title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{topThree[1].category}</p>
                          <p className="text-3xl font-bold text-gray-600 dark:text-gray-300">
                            ${(
                              activeTab === 'today' ? topThree[1].dayPaid : topThree[1].totalPaid
                            ) / 100}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 1st Place */}
                    {topThree[0] && (
                      <div>
                        <div className="bg-gradient-to-br from-[#0F3460] to-[#1a5490] rounded-xl border-4 border-[#0F3460] p-6 text-center text-white shadow-2xl">
                          <div className="text-6xl font-black mb-3">🥇</div>
                          <h3 className="font-bold text-xl mb-2">{topThree[0].title}</h3>
                          <p className="text-sm text-white/80 mb-4">{topThree[0].category}</p>
                          <p className="text-4xl font-bold">${(activeTab === 'today' ? topThree[0].dayPaid : topThree[0].totalPaid) / 100}</p>
                          <p className="text-sm text-white/70 mt-2">#1 Ranked</p>
                        </div>
                      </div>
                    )}

                    {/* 3rd Place */}
                    {topThree[2] && (
                      <div className="transform md:translate-y-8">
                        <div className="bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10 rounded-xl border-2 border-amber-300 dark:border-amber-700 p-6 text-center">
                          <div className="text-5xl font-black text-amber-600 mb-3">🥉</div>
                          <h3 className="font-bold text-gray-900 dark:text-white mb-2">{topThree[2].title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{topThree[2].category}</p>
                          <p className="text-3xl font-bold text-amber-600">
                            ${(activeTab === 'today' ? topThree[2].dayPaid : topThree[2].totalPaid) / 100}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Full Rankings */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {activeTab === 'today' ? 'Today' : 'All Time'} Rankings
                </h2>
                {sortedListings.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400">No products ranked yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedListings.map((listing, idx) => (
                      <a
                        key={listing.id}
                        href={`/product/${listing.id}`}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 flex items-center justify-between hover:shadow-lg hover:border-[#0F3460]/30 dark:hover:border-[#0F3460]/60 transition-all group"
                      >
                        <div className="flex items-center gap-6 flex-1">
                          <span className="text-4xl font-black text-[#0F3460]">#{idx + 1}</span>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-[#0F3460] dark:group-hover:text-[#0F3460] transition-colors">
                              {listing.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {listing.category} • {listing.clickCount} clicks
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-[#0F3460]">
                            ${(activeTab === 'today' ? listing.dayPaid : listing.totalPaid) / 100}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {activeTab === 'today' ? 'Today' : 'Total'}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
