'use client';

import Header from '@/components/Header';
import PlatformIcon from '@/components/PlatformIcon';
import { useState, useEffect } from 'react';

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
}

interface CountdownTime {
  hours: number;
  minutes: number;
  seconds: number;
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

export default function DailyPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<CountdownTime>({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    fetchListings();

    const calculateCountdown = () => {
      const now = new Date();
      const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
      const tomorrow = new Date(utcNow);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);

      const diff = tomorrow.getTime() - utcNow.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ hours, minutes, seconds });

      // Refresh listings when countdown reaches 0 (day changed)
      if (diff <= 0) {
        fetchListings();
      }
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);

    // Refresh listings every 30 seconds for real-time updates
    const refreshTimer = setInterval(fetchListings, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(refreshTimer);
    };
  }, []);

  const fetchListings = async () => {
    try {
      const res = await fetch('/api/listings/submit?sort=dayVotes&limit=100&timeFilter=today');
      if (!res.ok) {
        setListings([]);
        return;
      }
      const data = await res.json();
      setListings((data.listings || []).sort((a: Listing, b: Listing) => b.dayVotes - a.dayVotes).slice(0, 50));
    } catch (error) {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="bg-white text-[#1F2937]">
        {/* Header Section */}
        <section className="bg-white py-12 border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-8">
              <h1 className="text-4xl font-black text-[#1F2937] mb-2">Today's Top Rankings</h1>
              <p className="text-[#1F2937]/70 font-semibold">Community-voted products ranking for today</p>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center gap-4 p-6 bg-gray-50 border-3 border-gray-300 inline-block rounded-lg">
              <span className="text-sm font-black text-[#1F2937]">Resets in:</span>
              <div className="flex gap-3 items-center">
                <div className="flex flex-col items-center bg-white border-2 border-[#0F3460] px-3 py-2 rounded-lg">
                  <span className="text-2xl font-black text-[#0F3460]">{String(countdown.hours).padStart(2, '0')}</span>
                  <span className="text-xs font-black text-[#1F2937]">Hours</span>
                </div>
                <span className="text-2xl font-black text-[#1F2937]">:</span>
                <div className="flex flex-col items-center bg-white border-2 border-[#0F3460] px-3 py-2 rounded-lg">
                  <span className="text-2xl font-black text-[#0F3460]">{String(countdown.minutes).padStart(2, '0')}</span>
                  <span className="text-xs font-black text-[#1F2937]">Mins</span>
                </div>
                <span className="text-2xl font-black text-[#1F2937]">:</span>
                <div className="flex flex-col items-center bg-white border-2 border-[#0F3460] px-3 py-2 rounded-lg">
                  <span className="text-2xl font-black text-[#0F3460]">{String(countdown.seconds).padStart(2, '0')}</span>
                  <span className="text-xs font-black text-[#1F2937]">Secs</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Listings Section */}
        <section className="bg-white py-12 border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin text-4xl">⏳</div>
                <p className="text-[#1F2937]/60 font-semibold mt-2">Loading rankings...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12 border-gray-300 border-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-bold text-[#1F2937] mb-4">No rankings yet for today</p>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-2 bg-[#0F3460] text-white font-bold text-xs border-[#0F3460] border-3 hover:scale-105 transition-all duration-200 rounded-lg"
                >
                  Submit a Listing
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map((listing, idx) => {
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
      </div>
    </>
  );
}
