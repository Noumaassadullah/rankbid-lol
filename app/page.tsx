'use client';

import Header from '@/components/Header';
import { useState, useEffect, useCallback } from 'react';

interface Listing {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  totalPaid: number;
  dayPaid: number;
  clickCount: number;
  createdAt: string;
}

const CATEGORIES = [
  'AI', 'SaaS', 'Developer', 'Marketing', 'Productivity',
  'Analytics', 'Design', 'Crypto', 'Health', 'Business'
];

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeLeaderboard, setActiveLeaderboard] = useState<'alltime' | 'today'>('alltime');

  const [formData, setFormData] = useState({
    url: '',
    description: '',
    category: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [currentBid, setCurrentBid] = useState(10000);

  useEffect(() => {
    fetchListings();
  }, [activeLeaderboard]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const sort = activeLeaderboard === 'today' ? 'dayPaid' : 'totalPaid';
      const res = await fetch(`/api/listings/submit?sort=${sort}&limit=100`);

      if (!res.ok) {
        setListings([]);
        return;
      }

      const text = await res.text();
      if (!text) {
        setListings([]);
        return;
      }

      const data = JSON.parse(text);
      setListings(data.listings || []);
    } catch (error) {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [activeLeaderboard]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (!formData.category) {
        setFormError('Please select a category');
        setFormLoading(false);
        return;
      }

      const res = await fetch('/api/listings/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const listing = data.listing;
      const amountInCents = currentBid * 100;

      const checkoutRes = await fetch('/api/payment/jazzcash-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          amount: amountInCents,
        }),
      });

      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) throw new Error(checkoutData.error);

      window.location.href = checkoutData.url;
    } catch (error: any) {
      setFormError(error.message || 'Something went wrong');
      setFormLoading(false);
    }
  };

  const topListings = activeLeaderboard === 'today'
    ? listings.slice(0, 10).sort((a, b) => b.dayPaid - a.dayPaid)
    : listings.slice(0, 10).sort((a, b) => b.totalPaid - a.totalPaid);

  const calculateRank = (bid: number) => {
    const higherBids = topListings.filter(l => {
      const amount = activeLeaderboard === 'today' ? l.dayPaid : l.totalPaid;
      return amount > bid * 100;
    }).length;
    return higherBids + 1;
  };

  const currentRank = calculateRank(currentBid);

  return (
    <>
      <Header />
      <div className="bg-white min-h-screen">

        {/* HERO */}
        <section className="relative bg-white overflow-hidden pt-20 pb-32 md:py-40">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-white to-white pointer-events-none"></div>

          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-orange-100 rounded-full mb-6 border border-orange-200">
                <p className="text-sm font-semibold text-orange-700">The Transparent Leaderboard</p>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Rank Your<br />Product
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto font-medium">
                Pure pay-to-rank competition. No algorithms. No politics. Just merit.
              </p>

              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Start Ranking
                </button>
                <button
                  onClick={() => document.querySelector('#leaderboard')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-3 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  View Leaderboard
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12 border-t border-gray-200">
              <div className="text-center">
                <p className="text-4xl font-bold text-orange-600 mb-2">10K+</p>
                <p className="text-sm text-gray-600 font-medium">Products Listed</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-orange-600 mb-2">50K+</p>
                <p className="text-sm text-gray-600 font-medium">Active Bids</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-orange-600 mb-2">$5M+</p>
                <p className="text-sm text-gray-600 font-medium">Total Bids</p>
              </div>
            </div>
          </div>
        </section>

        {/* FORM SECTION */}
        <section className="bg-white py-32">
          <div className="max-w-2xl mx-auto px-6">
            <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-20 text-center leading-tight">Claim Your Rank</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border-2 border-gray-200 p-12 shadow-lg mb-16">
              {formError && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-base font-bold text-gray-900 mb-3">Product URL</label>
                  <input
                    type="text"
                    name="url"
                    placeholder="https://example.com"
                    value={formData.url}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-900 mb-3">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-10">
                <label className="block text-base font-bold text-gray-900 mb-3">Description</label>
                <textarea
                  name="description"
                  placeholder="Brief description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-5 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full px-8 py-4 bg-orange-600 text-white text-lg font-bold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {formLoading ? 'Processing...' : 'Claim Rank'}
              </button>
            </form>

            {/* Bid Adjuster */}
            <div className="flex justify-center items-center gap-10">
              <button
                onClick={() => setCurrentBid(Math.max(500, currentBid - 500))}
                className="w-14 h-14 rounded-full border-2 border-gray-300 bg-white text-gray-600 text-2xl font-bold hover:border-orange-500 hover:text-orange-600 transition-all"
              >
                −
              </button>
              <div className="text-center">
                <p className="text-5xl md:text-6xl font-black text-orange-600">${(currentBid/100).toFixed(0)}</p>
                <p className="text-base text-gray-700 font-semibold mt-3">Rank #{calculateRank(currentBid)}</p>
              </div>
              <button
                onClick={() => setCurrentBid(currentBid + 500)}
                className="w-14 h-14 rounded-full border-2 border-gray-300 bg-white text-gray-600 text-2xl font-bold hover:border-orange-500 hover:text-orange-600 transition-all"
              >
                +
              </button>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { num: '1', title: 'Submit', desc: 'Add your product URL and category' },
                { num: '2', title: 'Bid', desc: 'Place your bid to claim your rank' },
                { num: '3', title: 'Dominate', desc: 'Get discovered by real makers' }
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                    <span className="text-lg font-bold text-orange-600">{step.num}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Makers Choose RankBid</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: 'Real-Time Rankings', desc: 'Watch live competition 24/7' },
                { title: 'Category Dominance', desc: 'Own your niche and get discovered' },
                { title: 'Flexible Bidding', desc: 'Adjust bids anytime' },
                { title: 'Mobile Optimized', desc: 'Manage everything on your phone' },
                { title: 'No Hidden Fees', desc: 'Complete transparency' },
                { title: 'Instant Results', desc: 'See your ranking update live' }
              ].map((feature, i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-orange-200 hover:shadow-lg transition-all">
                  <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LEADERBOARD */}
        <section id="leaderboard" className="bg-white py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Top Rankings</h2>

            <div className="flex gap-4 justify-center mb-8 border-b border-gray-200 pb-4">
              <button
                onClick={() => setActiveLeaderboard('alltime')}
                className={`px-6 py-2 font-semibold transition-colors ${activeLeaderboard === 'alltime' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                All Time
              </button>
              <button
                onClick={() => setActiveLeaderboard('today')}
                className={`px-6 py-2 font-semibold transition-colors ${activeLeaderboard === 'today' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Today
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-600">Loading rankings...</div>
            ) : topListings.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-lg font-semibold text-gray-900 mb-4">No listings yet</p>
                <button
                  onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Be First to List
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {topListings.map((listing, idx) => {
                  const amount = activeLeaderboard === 'today' ? listing.dayPaid : listing.totalPaid;
                  return (
                    <div
                      key={listing.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-orange-300 hover:shadow-md transition-all"
                    >
                      <div className="flex-1 flex items-center gap-4">
                        <span className="text-2xl font-bold text-gray-400 w-8">#{idx + 1}</span>
                        <div>
                          <h3 className="font-bold text-gray-900">{listing.title}</h3>
                          <p className="text-sm text-gray-500">{listing.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-600">${(amount / 100).toFixed(0)}</p>
                        <p className="text-sm text-gray-500">{listing.clickCount} clicks</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* FOOTER CTA */}
        <section className="bg-orange-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to compete?</h2>
            <p className="text-lg text-orange-100 mb-8">Join thousands of makers ranking their products.</p>
            <button
              onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Start Ranking →
            </button>
          </div>
        </section>

      </div>
    </>
  );
}
