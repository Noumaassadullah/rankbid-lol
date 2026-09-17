'use client';

import Header from '@/components/Header';
import { useState, useEffect } from 'react';

interface Listing {
  id: string;
  url: string;
  title: string;
  totalPaid: number;
  dayPaid: number;
  clickCount: number;
  category: string;
}

const PKR_RATE = 280; // 1 USD = 280 PKR
const CURRENCY_RATES: { [key: string]: number } = {
  PKR: 1,
  USD: 280,
  GBP: 352,
  INR: 3.36,
};

export default function TopupPage() {
  const [selectedCurrency, setSelectedCurrency] = useState<'PKR' | 'USD' | 'GBP' | 'INR'>('PKR');
  const [topupAmount, setTopupAmount] = useState(10); // In selected currency units
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    const filtered = listings.filter(l =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.url.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredListings(filtered);
  }, [searchQuery, listings]);

  const fetchListings = async () => {
    try {
      const res = await fetch('/api/listings/submit?limit=1000');
      if (!res.ok) {
        setListings([]);
        return;
      }
      const data = await res.json();
      setListings(data.listings || []);
      setFilteredListings(data.listings || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amountInCents: number, currency: string = selectedCurrency): string => {
    const amountInPKR = (amountInCents / 100) * PKR_RATE;
    const rate = CURRENCY_RATES[currency] || CURRENCY_RATES.PKR;
    const converted = amountInPKR / rate;

    const symbols: { [key: string]: string } = {
      PKR: '₨',
      USD: '$',
      GBP: '£',
      INR: '₹',
    };

    const symbol = symbols[currency] || '₨';
    return `${symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const handleTopup = async (listingId: string) => {
    try {
      setSubmitting(true);

      // Convert selected currency amount to cents
      const rate = CURRENCY_RATES[selectedCurrency] || CURRENCY_RATES.PKR;
      const amountInPKR = topupAmount * rate;
      const amountInCents = Math.round((amountInPKR / PKR_RATE) * 100);

      const res = await fetch('/api/listing/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          additionalAmount: amountInCents,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert('Error: ' + data.error);
        return;
      }

      // Redirect to payment confirmation
      window.location.href = data.checkoutUrl;
    } catch (error) {
      alert('Failed to initiate top-up: ' + (error as any).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Boost Your Ranking</h1>
          <p className="text-gray-600 mb-12">Add more funds to increase your listing's rank without creating a new listing</p>

          {/* Top-up Amount Selector */}
          <div className="mb-12 bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Choose Amount to Add</h2>

            {/* Currency Selector */}
            <div className="flex gap-2 mb-6">
              {(['PKR', 'USD', 'GBP', 'INR'] as const).map(currency => (
                <button
                  key={currency}
                  onClick={() => setSelectedCurrency(currency)}
                  className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                    selectedCurrency === currency
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {currency}
                </button>
              ))}
            </div>

            {/* Amount Input */}
            <div className="flex items-center gap-6 mb-6">
              <button
                type="button"
                onClick={() => setTopupAmount(Math.max(1, topupAmount - 1))}
                className="text-orange-500 text-3xl font-bold hover:text-orange-600 transition-colors"
              >
                −
              </button>
              <div className="flex-1">
                <input
                  type="number"
                  min="1"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-3 text-center text-3xl font-bold text-orange-600 border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <button
                type="button"
                onClick={() => setTopupAmount(topupAmount + 1)}
                className="text-orange-500 text-3xl font-bold hover:text-orange-600 transition-colors"
              >
                +
              </button>
            </div>

            <p className="text-lg text-gray-700 font-semibold">
              Amount to add: {formatPrice(topupAmount * (CURRENCY_RATES[selectedCurrency] / PKR_RATE) * 100)}
            </p>
          </div>

          {/* Listings */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 2: Select Your Listing</h2>

            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search your listings by name or URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-600">Loading your listings...</div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-lg font-semibold text-gray-900 mb-4">
                  {searchQuery ? 'No listings found matching your search' : 'You don\'t have any listings yet'}
                </p>
                <a
                  href="/"
                  className="inline-block px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Create Your First Listing
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredListings.map((listing) => {
                  const currentAmountPKR = (listing.totalPaid / 100) * PKR_RATE;
                  const rate = CURRENCY_RATES[selectedCurrency] || CURRENCY_RATES.PKR;
                  const newTotalInCurrency = ((listing.totalPaid + (topupAmount * rate * PKR_RATE / 100)) / 100 / PKR_RATE);

                  return (
                    <div
                      key={listing.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">{listing.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{listing.url}</p>
                          <p className="text-xs text-gray-500 mt-2">{listing.clickCount} clicks</p>
                        </div>

                        <div className="text-right ml-4">
                          <p className="text-sm text-gray-600">Current Amount</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {formatPrice(listing.totalPaid)}
                          </p>

                          <p className="text-sm text-gray-600 mt-4">After Top-up</p>
                          <p className="text-xl font-bold text-green-600">
                            {formatPrice((listing.totalPaid + topupAmount * rate * PKR_RATE / 100).toFixed(0))}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleTopup(listing.id)}
                        disabled={submitting}
                        className="w-full px-6 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                      >
                        {submitting ? 'Processing...' : `Add ${formatPrice(topupAmount * (CURRENCY_RATES[selectedCurrency] / PKR_RATE) * 100)}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
