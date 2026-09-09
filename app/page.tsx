'use client';

import Header from '@/components/Header';
import { useState, useEffect, useCallback } from 'react';

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
  createdAt: string;
}

const CATEGORIES = [
  { value: 'Technology', label: 'Technology' },
  { value: 'ECommerce', label: 'E-Commerce' },
  { value: 'DigitalMarketing', label: 'Digital Marketing' },
  { value: 'Education', label: 'Education' },
  { value: 'Health', label: 'Health' },
  { value: 'Fashion', label: 'Fashion' },
  { value: 'Food', label: 'Food' },
  { value: 'Travel', label: 'Travel' },
  { value: 'Business', label: 'Business' },
  { value: 'Other', label: 'Other' }
];

const PLATFORMS = [
  { id: 'website', label: 'Website', icon: '🌐' },
  { id: 'twitter', label: 'Twitter/X', icon: '𝕏' },
  { id: 'facebook', label: 'Facebook', icon: 'f' },
  { id: 'instagram', label: 'Instagram', icon: '📷' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' }
];

const getCategoryLabel = (categoryValue: string): string => {
  const category = CATEGORIES.find(cat => cat.value === categoryValue);
  return category ? category.label : categoryValue;
};

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeLeaderboard, setActiveLeaderboard] = useState<'alltime' | 'today'>('alltime');

  const [formData, setFormData] = useState({
    url: '',
    description: '',
    category: '',
    platform: 'website',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [currentBid, setCurrentBid] = useState(10000);
  const [freeSpotAvailable, setFreeSpotAvailable] = useState(false);
  const [spotsRemaining, setSpotsRemaining] = useState(0);

  useEffect(() => {
    fetchListings();
    checkFreeSpots();
  }, [activeLeaderboard]);

  const checkFreeSpots = useCallback(async () => {
    try {
      const res = await fetch('/api/listings/submit?limit=100');
      const data = await res.json();
      const listingCount = data.listings?.length || 0;
      const remaining = Math.max(0, 10 - listingCount);
      setSpotsRemaining(remaining);
      setFreeSpotAvailable(remaining > 0);
    } catch (error) {
      console.error('Error checking free spots:', error);
    }
  }, []);

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
      const isFreeUser = data.isFreeUser;

      // If free user, skip payment and show success
      if (isFreeUser) {
        setFormError('');
        setFormData({ url: '', description: '', category: '', platform: 'website' });
        // Show success message
        alert('🎉 Congratulations! You are in the first 10 users!\n\nYour listing is now live and ranked #1 for FREE!');
        // Refresh listings
        fetchListings();
        return;
      }

      // Otherwise proceed to payment
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
      <div className="bg-white">

        {/* HERO */}
        <section className="bg-white pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="max-w-5xl mx-auto px-6">
            {/* Main Content */}
            <div className="mb-20">
              <p className="text-lg font-semibold text-gray-500 mb-6 uppercase tracking-wider">The Transparent Leaderboard</p>

              <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-8 leading-tight">
                Rank Your<br />Product
              </h1>

              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                <p className="text-xl md:text-2xl text-gray-700 leading-relaxed max-w-xl font-medium">
                  Pure pay-to-rank competition. No algorithms. No politics. Just merit.
                </p>

                <div className="flex gap-3 flex-col sm:flex-row">
                  <button
                    onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-8 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors"
                  >
                    Start Ranking
                  </button>
                  <button
                    onClick={() => document.querySelector('#leaderboard')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-8 py-3 bg-white text-gray-900 font-bold border-2 border-gray-300 rounded-xl hover:border-orange-500 hover:text-orange-600 transition-colors"
                  >
                    View Leaderboard
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* FORM SECTION */}
        <section className="bg-white py-20">
          <div className="max-w-6xl mx-auto px-6">
            {/* Free Spots Banner */}
            {freeSpotAvailable && (
              <div className="mb-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
                <p className="text-center text-lg font-bold text-green-700">
                  🎁 {spotsRemaining} Free Spot{spotsRemaining !== 1 ? 's' : ''} Left - First 10 Users Get FREE Listing!
                </p>
              </div>
            )}
            {/* Ranking Tabs */}
            <div className="flex justify-center mb-12">
              <div className="flex gap-3 bg-gray-100 p-1.5 rounded-full">
                <button
                  onClick={() => setActiveLeaderboard('alltime')}
                  className={`px-6 py-2 rounded-full font-semibold text-sm transition-all flex items-center gap-2 ${
                    activeLeaderboard === 'alltime'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>🏆</span> All-time
                </button>
                <button
                  onClick={() => setActiveLeaderboard('today')}
                  className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
                    activeLeaderboard === 'today'
                      ? 'bg-white text-orange-500'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="w-2 h-2 bg-orange-500 rounded-full inline-block mr-2"></span>
                  Today
                </button>
              </div>
            </div>

            {/* Main Heading with Price */}
            <div className="text-center mb-12">
              <h2 className="text-5xl md:text-6xl font-black text-gray-900">
                Claim #1 for <span className="text-orange-500">${(currentBid/100).toFixed(0)}</span>
              </h2>
            </div>

            {/* Platform Selection */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {PLATFORMS.map(platform => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, platform: platform.id }))}
                  className={`px-4 py-2 rounded-full font-semibold transition-all ${
                    formData.platform === platform.id
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {platform.icon} {platform.label}
                </button>
              ))}
            </div>

            {/* Compact Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-12">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium w-full">
                  {formError}
                </div>
              )}

              <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                {/* URL Input */}
                <input
                  type="text"
                  name="url"
                  placeholder={formData.platform === 'website' ? 'Your product URL' : 'Your @handle or page link'}
                  value={formData.url}
                  onChange={handleInputChange}
                  className="flex-1 px-6 py-4 border border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />

                {/* Category Select */}
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="flex-1 px-6 py-4 border border-gray-300 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-8 py-4 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50 whitespace-nowrap shadow-md hover:shadow-lg"
                >
                  {formLoading ? 'Processing...' : 'Claim rank'}
                </button>
              </div>

              {/* Hidden Description Field */}
              <textarea
                name="description"
                placeholder="Brief description"
                value={formData.description}
                onChange={handleInputChange}
                rows={1}
                className="hidden"
              />
            </form>

            {/* Bid Adjuster - Separate from form */}
            <div className="flex justify-center items-center gap-6 pt-8">
              <button
                type="button"
                onClick={() => setCurrentBid(Math.max(500, currentBid - 500))}
                className="text-orange-500 text-3xl font-bold hover:text-orange-600 transition-colors p-2 cursor-pointer"
              >
                −
              </button>
              <p className="text-3xl md:text-4xl font-black text-orange-500">
                ${(currentBid/100).toFixed(0)}
              </p>
              <button
                type="button"
                onClick={() => setCurrentBid(currentBid + 500)}
                className="text-orange-500 text-3xl font-bold hover:text-orange-600 transition-colors p-2 cursor-pointer"
              >
                +
              </button>
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
                          <p className="text-sm text-gray-500">{getCategoryLabel(listing.category)} • {PLATFORMS.find(p => p.id === listing.platform)?.label || listing.platform}</p>
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

        {/* HOW IT WORKS */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { num: '1', title: 'Submit', desc: 'Add your product URL or social media handle' },
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

        {/* FOOTER CTA */}
        <section className="bg-orange-600 text-white py-16 px-6 rounded-[20px] mb-[30px] border-b-2 border-b-white mx-5">
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

        {/* PROFESSIONAL FOOTER */}
        <footer className="bg-gray-900 text-gray-300 pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-6">
            {/* Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
              {/* Brand Section */}
              <div className="md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl">⚡</span>
                  <h3 className="text-2xl font-black text-white">RankBid</h3>
                </div>
                <p className="text-sm text-gray-400 mb-6">
                  Pure pay-to-rank leaderboard. No algorithms. No politics. Just merit.
                </p>
                <div className="flex gap-4">
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors text-xl">
                    𝕏
                  </a>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors text-xl">
                    🔗
                  </a>
                  <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors text-xl">
                    💬
                  </a>
                </div>
              </div>

              {/* Leaderboards */}
              <div>
                <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                  <span>🏆</span> Leaderboards
                </h4>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                      All-Time Rankings
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors text-sm flex items-center gap-2">
                      <span>🔥</span> Today (24h)
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors text-sm flex items-center gap-2">
                      <span>📅</span> Daily (UTC)
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors text-sm flex items-center gap-2">
                      <span>🎯</span> By Categories
                    </a>
                  </li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="text-white font-bold mb-6">📚 Resources</h4>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                      How It Works
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                      Rules & Terms
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                      Blog
                    </a>
                  </li>
                </ul>
              </div>

              {/* Payments */}
              <div>
                <h4 className="text-white font-bold mb-6">💳 Payments</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-gray-400">
                    <span>✓</span> Stripe
                  </li>
                  <li className="flex items-center gap-2 text-gray-400">
                    <span>✓</span> JazzCash
                  </li>
                  <li className="flex items-center gap-2 text-gray-400">
                    <span>✓</span> EasyPaisa
                  </li>
                  <li className="flex items-center gap-2 text-orange-500 font-semibold mt-4">
                    <span>🚀</span> More Coming
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-white font-bold mb-6">📧 Support</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Have questions? We're here to help.
                </p>
                <a
                  href="mailto:support@rankbid.lol"
                  className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors font-semibold text-sm"
                >
                  support@rankbid.lol
                  <span>→</span>
                </a>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-800 mb-8"></div>

            {/* Bottom Footer */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <p className="text-gray-500 text-sm">
                  © 2026 RankBid. The transparent leaderboard where merit matters.
                </p>
              </div>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-gray-500 hover:text-orange-500 transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-500 hover:text-orange-500 transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-gray-500 hover:text-orange-500 transition-colors">
                  Status Page
                </a>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
