'use client';

import Header from '@/components/Header';
import PlatformIcon from '@/components/PlatformIcon';
import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, DollarSign } from 'lucide-react';

interface Listing {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  platform: string;
  totalPaid: number;
  dayPaid: number;
  clickCount: number;
}

const Icons = {
  Heart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  Tag: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
};

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
                    {sortedListings.map((listing, idx) => {
                      const position = idx + 1;
                      let faviconUrl = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
                      try {
                        const urlObj = new URL(listing.url);
                        faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(urlObj.hostname)}&sz=32`;
                      } catch {
                        // If URL parsing fails, use placeholder
                      }

                      const platformLabel = listing.platform || 'website';

                      return (
                        <a
                          key={listing.id}
                          href={listing.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md hover:border-[#0F3460]/30 transition-all duration-200 group cursor-pointer gap-4"
                        >
                          {/* Left Section: Position Badge and Favicon */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-9 h-9 bg-[#0F3460] text-white font-black text-xs rounded-lg flex items-center justify-center flex-shrink-0">
                              #{position}
                            </div>
                            <img src={faviconUrl} alt="favicon" className="w-6 h-6 rounded flex-shrink-0" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>'; }} />

                            {/* Title, Category and Platform Icon - All inline */}
                            <div className="flex-1 min-w-0 flex items-center gap-2">
                              <p className="text-xs font-semibold text-[#1F2937] truncate group-hover:text-[#0F3460] transition-colors">
                                {listing.title}
                              </p>

                              {/* Platform Icon */}
                              <div className="w-4 h-4 flex-shrink-0" title={platformLabel}>
                                <PlatformIcon platform={platformLabel} size={16} />
                              </div>

                              {/* Category Tag */}
                              {listing.category && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Icons.Tag />
                                  <p className="text-xs text-[#1F2937]/70 font-semibold">{listing.category}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Section: Vote Count and Actions */}
                          <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                            {/* Vote Count */}
                            <p className="text-lg font-black text-[#0F3460] min-w-[2rem] text-right">
                              ${(activeTab === 'today' ? listing.dayPaid : listing.totalPaid) / 100}
                            </p>

                            {/* Action Buttons */}
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95 flex items-center gap-1 whitespace-nowrap bg-white border border-[#0F3460] text-[#0F3460] hover:bg-[#0F3460] hover:text-white`}
                              >
                                <Icons.Heart />
                                Vote
                              </button>

                              <button
                                className="text-xs font-semibold px-3 py-1.5 bg-white border border-orange-300 text-orange-600 hover:bg-orange-600 hover:text-white transition-all duration-200 active:scale-95 rounded-lg flex items-center gap-1 whitespace-nowrap"
                              >
                                📤 Share
                              </button>

                              <button
                                className="text-xs font-semibold px-3 py-1.5 bg-white border border-gray-300 text-[#0F3460] hover:bg-[#0F3460] hover:text-white transition-all duration-200 active:scale-95 rounded-lg flex items-center gap-1 whitespace-nowrap"
                              >
                                ⭐ Premium
                              </button>
                            </div>
                          </div>
                        </a>
                      );
                    })}
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
