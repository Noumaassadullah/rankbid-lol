'use client';

import Header from '@/components/Header';
import { useState, useEffect } from 'react';

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

export default function DailyPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await fetch('/api/listings/submit?sort=dayPaid&limit=100');
      if (!res.ok) {
        setListings([]);
        return;
      }
      const data = await res.json();
      setListings((data.listings || []).sort((a: Listing, b: Listing) => b.dayPaid - a.dayPaid).slice(0, 50));
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Daily Rankings</h1>
          <p className="text-gray-600 mb-12">Top ranked products for today</p>

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
                    <p className="text-2xl font-bold text-orange-600">${(listing.dayPaid / 100).toFixed(0)}</p>
                    <p className="text-sm text-gray-500">Today</p>
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
