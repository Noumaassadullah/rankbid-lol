'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Listing {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  totalVotes: number;
  dayVotes: number;
  clickCount: number;
  createdAt: string;
}

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
      <section className="bg-white px-4 sm:px-6 py-16 md:py-32 border-b-8 border-orange-600">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-tight">
            <span className="text-orange-600">🔥 TODAY'S</span><br />
            <span className="text-gray-900">HOT RANKINGS</span>
          </h1>
          <p className="text-xl md:text-2xl font-bold text-gray-700 max-w-2xl mb-8">
            Last 24 hours of bidding. See what's trending right now.
          </p>
          <div className="bg-orange-100 border-4 border-orange-600 rounded-xl p-6 inline-block">
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
                className="inline-block px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black rounded-2xl hover:shadow-lg hover:shadow-orange-600/50 transition-all hover:scale-105 text-lg border-4 border-orange-600"
              >
                Claim Rank Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {topListingsToday.map((listing, idx) => (
                <div
                  key={listing.id}
                  className="bg-white border-4 border-purple-600 p-6 md:p-8 hover:shadow-xl hover:shadow-purple-600/40 transition-all flex items-center justify-between"
                >
                  <div className="flex-1 flex items-center gap-6">
                    <span className="text-5xl font-black text-orange-600 flex-shrink-0">#{idx + 1}</span>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-gray-900">{listing.title}</h3>
                      <p className="text-sm font-bold text-gray-600 mt-2">
                        📁 {listing.category} • 📈 {listing.totalVotes > 0 ? `All-time: ${listing.totalVotes.toLocaleString()} votes` : 'New'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-4xl font-black text-orange-600">{listing.dayVotes.toLocaleString()}</p>
                    <p className="text-sm font-bold text-gray-600 mt-2">{listing.clickCount} clicks</p>
                    <a
                      href={`/api/click?id=${listing.id}`}
                      className="inline-block mt-3 px-4 py-2 bg-purple-600 text-white font-black rounded-lg hover:bg-purple-700 transition-all text-sm"
                    >
                      Visit →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white px-4 sm:px-6 py-20 md:py-32 border-b-8 border-orange-600">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-16 text-center">
            How <span className="text-orange-600">Today's</span> Rankings Work
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
            <span className="bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">GET ON TODAY'S</span> RADAR
          </h2>
          <p className="text-xl md:text-2xl font-bold text-gray-700 mb-12">
            Today's leaderboard updates every 24 hours. Start bidding now to capture today's active makers.
          </p>
          <Link
            href="/#claim"
            className="inline-block px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white border-4 border-orange-600 font-black hover:shadow-lg hover:shadow-orange-600/50 transition-all hover:scale-105 text-lg rounded-2xl"
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
