'use client';

import Header from '@/components/Header';
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
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);

    return () => clearInterval(timer);
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
            <div className="flex items-center gap-4 p-6 bg-gray-50 border-3 border-gray-300 inline-block">
              <span className="text-sm font-black text-[#1F2937]">Resets in:</span>
              <div className="flex gap-3 items-center">
                <div className="flex flex-col items-center bg-white border-2 border-[#0F3460] px-3 py-2">
                  <span className="text-2xl font-black text-[#0F3460]">{String(countdown.hours).padStart(2, '0')}</span>
                  <span className="text-xs font-black text-[#1F2937]">Hours</span>
                </div>
                <span className="text-2xl font-black text-[#1F2937]">:</span>
                <div className="flex flex-col items-center bg-white border-2 border-[#0F3460] px-3 py-2">
                  <span className="text-2xl font-black text-[#0F3460]">{String(countdown.minutes).padStart(2, '0')}</span>
                  <span className="text-xs font-black text-[#1F2937]">Mins</span>
                </div>
                <span className="text-2xl font-black text-[#1F2937]">:</span>
                <div className="flex flex-col items-center bg-white border-2 border-[#0F3460] px-3 py-2">
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
              <div className="text-center py-12 border-gray-300 border-4 bg-gray-50">
                <p className="text-sm font-bold text-[#1F2937] mb-4">No rankings yet for today</p>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-2 bg-[#0F3460] text-white font-bold text-xs border-[#0F3460] border-3 hover:scale-105 transition-all duration-200"
                >
                  Submit a Listing
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {listings.map((listing, idx) => (
                  <a
                    key={listing.id}
                    href={listing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white border-gray-300 border-3 hover:bg-[#0F3460]/10 hover:scale-101 transition-all duration-200 group cursor-pointer"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-[#0F3460] text-white font-black rounded-lg flex items-center justify-center text-sm">
                        #{idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#1F2937] truncate">{listing.title}</p>
                        {listing.category && (
                          <p className="text-xs text-[#1F2937]/60 mt-1">{listing.category}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-2xl font-black text-[#0F3460]">♥ {listing.dayVotes}</p>
                      <p className="text-xs text-[#1F2937]/60 font-semibold">Votes</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
