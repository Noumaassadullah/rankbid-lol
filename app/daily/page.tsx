'use client';

import Header from '@/components/Header';
import { useState, useEffect } from 'react';

interface Listing {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
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

    // Calculate countdown to next UTC midnight
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
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Today's Top Rankings</h1>
            <p className="text-gray-600 mb-4">Community-voted products ranking for today</p>

            {/* Countdown Timer */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg inline-flex">
              <span className="text-sm font-semibold text-orange-900">Resets in:</span>
              <div className="flex gap-2">
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-orange-600">{String(countdown.hours).padStart(2, '0')}</span>
                  <span className="text-xs text-orange-700">h</span>
                </div>
                <span className="text-orange-600 font-bold">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-orange-600">{String(countdown.minutes).padStart(2, '0')}</span>
                  <span className="text-xs text-orange-700">m</span>
                </div>
                <span className="text-orange-600 font-bold">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-orange-600">{String(countdown.seconds).padStart(2, '0')}</span>
                  <span className="text-xs text-orange-700">s</span>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-600">Loading rankings...</div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-lg font-semibold text-gray-900">No products ranked yet today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map((listing, idx) => (
                <a
                  key={listing.id}
                  href={listing.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-between hover:border-orange-300 hover:shadow-md transition-all group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold text-orange-600 w-10">#{idx + 1}</span>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{listing.title}</h3>
                        <p className="text-sm text-gray-500">{listing.category}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-6">
                    <p className="text-2xl font-bold text-orange-600">♥ {listing.dayVotes}</p>
                    <p className="text-sm text-gray-500">Votes Today</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
