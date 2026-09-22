'use client';

import Header from '@/components/Header';
import { useState, useEffect } from 'react';
import { Eye, TrendingUp, Calendar, DollarSign, MousePointerClick } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  totalPaid: number;
  dayPaid: number;
  clickCount: number;
  createdAt: string;
  allTimeRank: number;
  dailyRank: number;
  stats?: {
    totalPayments: number;
    averageBid: number;
  };
}

const PKR_RATE = 280; // 1 USD = 280 PKR
const CURRENCY_RATES: { [key: string]: number } = {
  PKR: 1,
  USD: 280,
  GBP: 352,
  INR: 3.36,
};

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<'PKR' | 'USD' | 'GBP' | 'INR'>('PKR');

  useEffect(() => {
    fetchListing();
  }, [params.id]);

  const fetchListing = async () => {
    try {
      const res = await fetch(`/api/listing?id=${params.id}`);
      if (!res.ok) {
        setListing(null);
        return;
      }
      const data = await res.json();
      setListing(data.listing);
    } catch (error) {
      console.error('Error fetching listing:', error);
      setListing(null);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amountInCents: number, curr: string = currency): string => {
    const amountInPKR = (amountInCents / 100) * PKR_RATE;
    const rate = CURRENCY_RATES[curr] || CURRENCY_RATES.PKR;
    const converted = amountInPKR / rate;

    const symbols: { [key: string]: string } = {
      PKR: '₨',
      USD: '$',
      GBP: '£',
      INR: '₹',
    };

    const symbol = symbols[curr] || '₨';
    return `${symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-600">Loading listing details...</p>
        </div>
      </>
    );
  }

  if (!listing) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 mb-4">Listing not found</p>
            <a
              href="/"
              className="inline-block px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                <p className="text-gray-600 text-lg mb-4">{listing.description}</p>
                <a
                  href={listing.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 font-semibold hover:underline inline-flex items-center gap-2"
                >
                  Visit Product
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Ranks */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">All-Time Rank</p>
                <p className="text-3xl font-black text-orange-600">#{listing.allTimeRank}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-orange-100 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Today's Rank</p>
                <p className="text-3xl font-black text-orange-600">#{listing.dailyRank}</p>
              </div>
            </div>
          </div>

          {/* Currency Selector */}
          <div className="mb-8 flex gap-2">
            {(['PKR', 'USD', 'GBP', 'INR'] as const).map(curr => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                  currency === curr
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Total Bid */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm text-gray-600">Total Bid (All-Time)</p>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatPrice(listing.totalPaid, currency)}
              </p>
            </div>

            {/* Daily Bid */}
            <div className="bg-gradient-to-br from-blue-50 to-orange-100 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm text-gray-600">Daily Bid</p>
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {formatPrice(listing.dayPaid, currency)}
              </p>
            </div>

            {/* Clicks */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm text-gray-600">Total Clicks</p>
                <MousePointerClick className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {listing.clickCount.toLocaleString()}
              </p>
            </div>

            {/* Listed Date */}
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm text-gray-600">Listed Date</p>
                <Calendar className="w-5 h-5 text-pink-600" />
              </div>
              <p className="text-lg font-bold text-pink-600">
                {new Date(listing.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Listing Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Category
                </h3>
                <p className="text-lg text-gray-900">{listing.category}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  URL
                </h3>
                <p className="text-lg text-gray-900 break-all">{listing.url}</p>
              </div>

              {listing.stats && (
                <>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                      Payment Count
                    </h3>
                    <p className="text-lg text-gray-900">
                      {listing.stats.totalPayments} payment{listing.stats.totalPayments !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                      Average Bid
                    </h3>
                    <p className="text-lg text-gray-900">
                      {formatPrice(listing.stats.averageBid, currency)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-12 flex gap-4">
            <a
              href={listing.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-6 py-4 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors text-center"
            >
              Visit Product
            </a>
            <a
              href="/topup"
              className="flex-1 px-6 py-4 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition-colors text-center"
            >
              Boost This Listing
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
