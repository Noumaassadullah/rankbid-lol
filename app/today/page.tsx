'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PlatformIcon from '@/components/PlatformIcon';

interface Listing {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  platform: string;
  totalVotes: number;
  dayVotes: number;
  clickCount: number;
  createdAt: string;
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

export default function TodayPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch('/api/listings/submit?sort=dayVotes&timeFilter=today&limit=100');

        if (!res.ok) {
          console.error('API error:', res.status);
          setListings([]);
          return;
        }

        const text = await res.text();
        if (!text) {
          console.error('Empty response from API');
          setListings([]);
          return;
        }

        const data = JSON.parse(text);
        setListings(data.listings || []);
      } catch (error) {
        console.error('Failed to fetch listings:', error);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
    const interval = setInterval(fetchListings, 30000);
    return () => clearInterval(interval);
  }, []);

  const topListingsToday = listings
    .filter(l => l.dayVotes > 0)
    .sort((a, b) => b.dayVotes - a.dayVotes)
    .slice(0, 50);

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-white px-4 sm:px-6 py-16 md:py-32 border-b-8 border-[#0F3460]/600">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-tight">
            <span className="text-[#0F3460]">🔥 TODAY'S</span><br />
            <span className="text-gray-900">HOT RANKINGS</span>
          </h1>
          <p className="text-xl md:text-2xl font-bold text-gray-700 max-w-2xl mb-8">
            Last 24 hours of bidding. See what's trending right now.
          </p>
          <div className="bg-[#0F3460]/10 border-4 border-[#0F3460]/600 rounded-xl p-6 inline-block">
            <p className="font-black text-gray-900">
              📊 {topListingsToday.length} products | 🗳️ {topListingsToday.reduce((sum, l) => sum + l.dayVotes, 0)} votes today
            </p>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="bg-white px-4 sm:px-6 py-20 md:py-32 border-b-8 border-purple-600">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <p className="text-2xl font-black text-gray-600">Loading today's rankings...</p>
            </div>
          ) : topListingsToday.length === 0 ? (
            <div className="bg-white border-8 border-purple-600 rounded-3xl text-center py-20 px-8">
              <div className="text-6xl mb-4">🌅</div>
              <p className="text-4xl font-black text-gray-900 mb-4">No rankings yet today</p>
              <p className="text-xl font-bold text-gray-700 mb-8">Be the first to bid and dominate today's leaderboard!</p>
              <Link
                href="/#claim"
                className="inline-block px-8 py-4 bg-gradient-to-r from-[#0F3460] to-[#1a5490] text-white font-black rounded-2xl hover:shadow-lg hover:shadow-[#0F3460]/30 transition-all hover:scale-105 text-lg border-4 border-[#0F3460]/600"
              >
                Claim Rank Now
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {topListingsToday.map((listing, idx) => {
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
                      <p className="text-lg font-black text-[#0F3460] min-w-[1.5rem] text-right">
                        {listing.dayVotes}
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
      </section>

      {/* How It Works */}
      <section className="bg-white px-4 sm:px-6 py-20 md:py-32 border-b-8 border-[#0F3460]/600">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-16 text-center">
            How <span className="text-[#0F3460]">Today's</span> Rankings Work
          </h2>

          <div className="space-y-6">
            {[
              {
                num: '1',
                title: 'Rolling 24h Window',
                desc: 'Every payment you make in the last 24 hours counts toward your today rank. Older payments drop off automatically.'
              },
              {
                num: '2',
                title: 'Real-Time Updates',
                desc: 'Rankings recalculate every few minutes. Watch your competition heat up in real-time as makers bid throughout the day.'
              },
              {
                num: '3',
                title: 'Quick Traffic Spike',
                desc: 'Perfect for launching a product or testing a marketing campaign. Get discovered by active makers searching today.'
              },
              {
                num: '4',
                title: 'Historical Archives',
                desc: 'Every 24 hours, a snapshot of today\'s top 10 is frozen and archived as a permanent historical page at /daily.'
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border-8 border-purple-600 p-8 flex gap-6">
                <div className="text-5xl font-black text-purple-600 flex-shrink-0">{item.num}</div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-black text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-lg font-bold text-gray-700">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white px-4 sm:px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-8 leading-tight">
            <span className="bg-gradient-to-r from-[#0F3460] to-[#1a5490] bg-clip-text text-transparent">GET ON TODAY'S</span> RADAR
          </h2>
          <p className="text-xl md:text-2xl font-bold text-gray-700 mb-12">
            Today's leaderboard updates every 24 hours. Start bidding now to capture today's active makers.
          </p>
          <Link
            href="/#claim"
            className="inline-block px-8 py-4 bg-gradient-to-r from-[#0F3460] to-[#1a5490] text-white border-4 border-[#0F3460]/600 font-black hover:shadow-lg hover:shadow-[#0F3460]/30 transition-all hover:scale-105 text-lg rounded-2xl"
          >
            Claim Your Spot →
          </Link>
        </div>
      </section>
      </div>
      <Footer />
    </>
  );
}
