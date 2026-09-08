'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

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
  'Analytics', 'Design', 'Crypto', 'Leaderboards', 'SEO',
  'Health', 'Business', 'Tools', 'Education', 'Social'
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'alltime' | 'today'>('alltime');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    url: '',
    handle: '',
    description: '',
    category: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [currentBid, setCurrentBid] = useState(10000);
  const [activeLeaderboard, setActiveLeaderboard] = useState<'alltime' | 'today'>('alltime');

  useEffect(() => {
    fetchListings();
  }, [activeLeaderboard]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const sort = activeLeaderboard === 'today' ? 'dayPaid' : 'totalPaid';
      const res = await fetch(`/api/listings/submit?sort=${sort}&limit=100`);

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

      const checkoutRes = await fetch('/api/payment/checkout', {
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

  const calculateRank = useCallback((bid: number) => {
    const higherBids = topListings.filter(l => {
      const amount = activeLeaderboard === 'today' ? l.dayPaid : l.totalPaid;
      return amount > bid * 100;
    }).length;
    return higherBids + 1;
  }, [topListings, activeLeaderboard]);

  const currentRank = calculateRank(currentBid);
  const claimPosition = currentRank === 1 ? '🏆 #1' : `#${currentRank}`;

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen text-gray-900">
      {/* Claim Section */}
      <section className="bg-white px-4 sm:px-6 py-12 md:py-16 border-b-4 border-orange-300">
        <div className="max-w-7xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-4 mb-12 justify-center">
            <button
              onClick={() => setActiveLeaderboard('alltime')}
              className={`px-6 py-3 rounded-full font-black text-sm md:text-base border-2 transition-all ${
                activeLeaderboard === 'alltime'
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-orange-500'
              }`}
            >
              🏆 All-time
            </button>
            <button
              onClick={() => setActiveLeaderboard('today')}
              className={`px-6 py-3 rounded-full font-black text-sm md:text-base border-2 transition-all ${
                activeLeaderboard === 'today'
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-orange-500'
              }`}
            >
              🔥 Today
            </button>
          </div>

          {/* Claim Headline - Dynamic Rank */}
          <h2 className="text-4xl md:text-5xl font-black text-center mb-8 text-gray-900">
            Claim <span className={`${currentRank === 1 ? 'text-orange-600' : 'text-purple-600'}`}>{claimPosition}</span> for <span className="text-orange-600">${currentBid.toLocaleString()}</span>
          </h2>

          {/* Claim Form */}
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white border-4 border-gray-200 rounded-3xl p-6 md:p-8 shadow-lg">
            {formError && (
              <div className="mb-4 p-4 bg-red-100 border-2 border-red-500 rounded-lg text-red-700 font-bold">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* URL Input */}
              <div className="md:col-span-4">
                <input
                  type="text"
                  name="url"
                  placeholder="Your product URL"
                  value={formData.url}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-300 rounded-2xl font-bold text-gray-900 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                />
              </div>

              {/* Category Dropdown */}
              <div className="md:col-span-4">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-300 rounded-2xl font-bold text-gray-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                >
                  <option value="">Choose a category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Claim Button */}
              <div className="md:col-span-4">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white border-none rounded-2xl font-black text-base hover:shadow-lg hover:shadow-orange-600/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? 'Processing...' : 'Claim rank'}
                </button>
              </div>
            </div>
            <div className="mt-4">
              <textarea
                name="description"
                placeholder="Brief description of your product or project"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-300 rounded-2xl font-bold text-gray-900 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                rows={2}
              />
            </div>
          </form>

          {/* Bid Adjuster */}
          <div className="flex justify-center items-center gap-6 mt-8">
            <button
              onClick={() => setCurrentBid(Math.max(500, currentBid - 500))}
              className="w-14 h-14 rounded-full border-4 border-orange-500 text-orange-600 font-black text-3xl hover:bg-orange-50 transition-all hover:scale-110 active:scale-95"
            >
              −
            </button>
            <div className="text-center">
              <div className="text-4xl font-black text-orange-600">${currentBid.toLocaleString()}</div>
              <p className="text-sm font-bold text-gray-500 mt-2">You'll rank {claimPosition}</p>
            </div>
            <button
              onClick={() => setCurrentBid(currentBid + 500)}
              className="w-14 h-14 rounded-full border-4 border-orange-500 text-orange-600 font-black text-3xl hover:bg-orange-50 transition-all hover:scale-110 active:scale-95"
            >
              +
            </button>
          </div>

          {/* Quick Info */}
          <div className="mt-12 max-w-2xl mx-auto text-center">
            <p className="text-sm font-bold text-gray-600 mb-4">Current Top 3 Bids:</p>
            <div className="flex justify-center gap-8">
              {topListings.slice(0, 3).map((listing, idx) => {
                const amount = activeLeaderboard === 'today' ? listing.dayPaid : listing.totalPaid;
                return (
                  <div key={listing.id} className="text-center">
                    <div className="text-2xl font-black text-gray-900">#{idx + 1}</div>
                    <div className="text-lg font-black text-orange-600">${(amount / 100).toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-white px-4 sm:px-6 py-24 md:py-40 border-b-4 border-purple-600 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-white opacity-50"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-block bg-gradient-to-r from-purple-600 to-purple-500 border-4 border-purple-400 px-8 py-3 mb-12 font-black text-xs md:text-sm tracking-wider text-white">
            ⚡ COMPETITIVE LEADERBOARD
          </div>

          <h1 className="text-7xl md:text-8xl font-black mb-8 leading-none bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">
            RANK YOUR <br /> PRODUCT
          </h1>

          <p className="text-xl md:text-2xl font-bold text-gray-700 mb-12 max-w-2xl leading-tight">
            No algorithms. No politics. Just pure competition where the best products rise to the top.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 mb-16">
            <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-black border-4 border-purple-600 hover:shadow-lg hover:shadow-purple-600/50 transition-all hover:scale-105">
              START RANKING
            </button>
            <button className="px-8 py-4 bg-white text-gray-900 font-black border-4 border-purple-600 hover:bg-purple-50 transition-all">
              VIEW LEADERBOARD
            </button>
          </div>

          <div className="grid grid-cols-3 gap-8 border-t-4 border-purple-600 pt-8">
            <div>
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">10K+</div>
              <p className="text-xs md:text-sm font-black text-gray-600 uppercase mt-2">Products</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">50K+</div>
              <p className="text-xs md:text-sm font-black text-gray-600 uppercase mt-2">Active Bids</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">$5M+</div>
              <p className="text-xs md:text-sm font-black text-gray-600 uppercase mt-2">Total Bids</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-white px-4 sm:px-6 py-16 md:py-32 border-b-8 border-orange-600">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black mb-12 md:mb-16 leading-tight">
            <span className="bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">WHY MAKERS</span><br />
            <span className="text-gray-900">CHOOSE RANKBID</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { title: 'INSTANT VISIBILITY', desc: 'Get discovered by thousands of active makers. Launch your product and watch real engagement happen in real-time.' },
              { title: 'REAL-TIME RANKINGS', desc: 'Watch live competition unfold 24/7. See every bid, every movement, every shift in the rankings as it happens.' },
              { title: 'PURE MERIT SYSTEM', desc: 'No algorithms. No politics. No hidden favoritism. The best products win based on real bidding and real competition.' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white border-8 border-orange-600 p-6 md:p-8 hover:shadow-xl hover:shadow-orange-600/40 transition-all transform hover:-translate-y-1">
                <h3 className="text-2xl md:text-3xl font-black mb-4 text-gray-900 uppercase">{feature.title}</h3>
                <p className="text-base md:text-lg font-bold text-gray-700 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative bg-white px-4 sm:px-6 py-16 md:py-32 border-b-8 border-purple-600">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black mb-12 md:mb-16 leading-tight">
            <span className="text-gray-900">HOW IT</span><br />
            <span className="bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">WORKS</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { num: '01', title: 'SUBMIT', desc: 'Add your product URL, choose your category, and submit. Instant verification.' },
              { num: '02', title: 'BID STRATEGICALLY', desc: 'Place your bid and watch your rank climb. Higher bid = higher position.' },
              { num: '03', title: 'DOMINATE & CONVERT', desc: 'Capture real traffic from qualified makers actively searching in your category.' }
            ].map((step, idx) => (
              <div key={idx} className="bg-white border-8 border-purple-600 p-6 md:p-8 hover:shadow-xl hover:shadow-purple-600/40 transition-all transform hover:-translate-y-1">
                <div className="text-6xl md:text-7xl font-black bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent mb-6">{step.num}</div>
                <h3 className="text-2xl md:text-3xl font-black mb-4 text-gray-900 uppercase border-b-8 border-orange-600 pb-4">{step.title}</h3>
                <p className="text-base md:text-lg font-bold text-gray-700 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-white px-4 sm:px-6 py-16 md:py-32 border-b-8 border-purple-600">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 md:mb-8 leading-tight">
            <span className="bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">READY TO</span><br />
            <span className="text-gray-900">COMPETE?</span>
          </h2>
          <p className="text-lg md:text-xl font-black text-gray-700 mb-12">List your product today and start competing for the top rank.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-8">
            <input
              type="text"
              placeholder="example.com or @yourproduct"
              className="px-4 md:px-6 py-3 md:py-4 bg-white text-gray-900 placeholder-gray-500 border-8 border-purple-600 font-bold focus:outline-none focus:border-orange-600 transition-colors text-sm md:text-base"
            />
            <select className="px-4 md:px-6 py-3 md:py-4 bg-white text-gray-900 border-8 border-purple-600 font-bold focus:outline-none focus:border-orange-600 transition-colors text-sm md:text-base">
              <option>SELECT CATEGORY</option>
              <option>AI</option>
              <option>SaaS</option>
              <option>Developer</option>
              <option>Crypto</option>
              <option>Productivity</option>
            </select>
            <button className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white border-8 border-orange-600 font-black hover:shadow-xl hover:shadow-orange-600/50 transition-all hover:scale-105 text-sm md:text-base uppercase">
              CLAIM RANK
            </button>
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section className="bg-white px-4 sm:px-6 py-16 md:py-32 border-b-8 border-orange-600">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black mb-12 md:mb-16 leading-tight">
            <span className="text-gray-900">EVERYTHING YOU</span><br />
            <span className="bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">NEED TO WIN</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {[
              { title: 'REAL-TIME ANALYTICS', desc: 'Live dashboards showing your rank, bids, and competitor movements. Make informed decisions instantly.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
              { title: 'CATEGORY DOMINANCE', desc: 'Capture #1 in your niche. Own your market. Get discovered by every buyer searching your category.', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
              { title: 'FLEXIBLE BIDDING STRATEGY', desc: 'Adjust bids in real-time. Scale up when needed. Optimize your spending based on live competition.', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { title: 'MOBILE OPTIMIZED PLATFORM', desc: 'Manage everything on your phone. Monitor rankings, place bids, track analytics—fully functional on mobile.', icon: 'M12 18h.01M8 20h8a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white border-8 border-purple-600 p-6 md:p-8 hover:shadow-xl hover:shadow-purple-600/40 transition-all">
                <svg className="w-10 h-10 text-purple-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={feature.icon} />
                </svg>
                <h3 className="text-xl md:text-2xl font-black mb-4 text-gray-900 uppercase">{feature.title}</h3>
                <p className="text-base md:text-lg text-gray-700 font-bold leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white px-4 sm:px-6 py-16 md:py-32 border-b-8 border-purple-600">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black mb-12 md:mb-16 leading-tight text-gray-900">
            TRUSTED BY <span className="bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">MAKERS</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { quote: 'RankBid delivered 3x more qualified traffic than we expected. Game-changer.', author: 'Sarah Chen', role: 'Founder @ StartupXYZ' },
              { quote: 'No algorithms. No politics. Pure, fair competition. Finally.', author: 'Alex Turner', role: 'Lead Developer' },
              { quote: 'Best $500 we spent on marketing. Our rank hit #1 in 48 hours.', author: 'Mike Johnson', role: 'Product Manager' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border-8 border-orange-600 p-6 md:p-8 hover:shadow-xl hover:shadow-orange-600/40 transition-all">
                <p className="text-lg md:text-xl font-black text-gray-900 mb-6 leading-relaxed">"{item.quote}"</p>
                <p className="font-black text-purple-600 text-lg uppercase">{item.author}</p>
                <p className="text-sm font-bold text-gray-600 mt-2">{item.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white px-4 sm:px-6 py-20 md:py-32 border-b-4 border-orange-600">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-6xl md:text-7xl font-black mb-16 text-gray-900 text-center">BY THE NUMBERS</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { num: '100+', label: 'Countries' },
              { num: '24/7', label: 'Live Bidding' },
              { num: '0%', label: 'Hidden Fees' },
              { num: '1000s', label: 'Daily Makers' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent mb-3">{stat.num}</div>
                <p className="text-lg font-bold text-gray-700">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white px-4 sm:px-6 py-20 md:py-32 border-b-4 border-orange-600">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-6xl md:text-7xl font-black mb-12 text-gray-900">CATEGORIES</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['AI', 'SaaS', 'Developer', 'Marketing', 'Productivity', 'Analytics', 'Design', 'Crypto'].map((cat) => (
              <div key={cat} className="bg-white border-4 border-purple-600 p-8 text-center hover:shadow-lg hover:shadow-purple-600/30 transition-all">
                <h3 className="text-2xl font-black text-gray-900">{cat}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rankings */}
      <section className="bg-white px-4 sm:px-6 py-20 md:py-32 border-b-4 border-purple-600">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-6xl md:text-7xl font-black mb-12 text-gray-900">TOP RANKINGS</h2>

          <div className="flex gap-8 mb-12 border-b-4 border-purple-600 pb-6">
            <button
              onClick={() => setActiveLeaderboard('alltime')}
              className={`text-2xl font-black uppercase transition-all ${activeLeaderboard === 'alltime' ? 'text-orange-600 border-b-4 border-orange-600' : 'text-gray-500'}`}
            >
              All Time
            </button>
            <button
              onClick={() => setActiveLeaderboard('today')}
              className={`text-2xl font-black uppercase transition-all ${activeLeaderboard === 'today' ? 'text-orange-600 border-b-4 border-orange-600' : 'text-gray-500'}`}
            >
              Today
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <p className="text-2xl font-black text-gray-600">Loading rankings...</p>
            </div>
          ) : topListings.length === 0 ? (
            <div className="bg-white border-4 border-purple-600 text-center py-20">
              <p className="text-4xl font-black text-gray-900 mb-4">NO LISTINGS YET</p>
              <p className="text-lg font-bold text-gray-700 mb-8">Be the first to claim #1 and dominate.</p>
              <button
                onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white border-4 border-purple-600 font-black hover:shadow-lg hover:shadow-purple-600/50 transition-all"
              >
                LIST YOUR PRODUCT
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {topListings.map((listing, idx) => {
                const amount = activeLeaderboard === 'today' ? listing.dayPaid : listing.totalPaid;
                return (
                  <div key={listing.id} className="bg-white border-4 border-purple-600 p-6 md:p-8 hover:shadow-xl hover:shadow-purple-600/40 transition-all flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl md:text-5xl font-black text-orange-600">#{idx + 1}</span>
                        <div className="flex-1">
                          <h3 className="text-xl md:text-2xl font-black text-gray-900">{listing.title}</h3>
                          <p className="text-sm font-bold text-gray-600 mt-1">{listing.category}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl md:text-4xl font-black text-orange-600">${(amount / 100).toFixed(2)}</p>
                      <p className="text-sm font-bold text-gray-600 mt-2">{listing.clickCount} clicks</p>
                      <a
                        href={`/api/click?id=${listing.id}`}
                        className="inline-block mt-3 px-4 py-2 bg-purple-600 text-white font-black rounded-lg hover:bg-purple-700 transition-all"
                      >
                        Visit Site
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white px-4 sm:px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-6xl md:text-7xl font-black mb-8 leading-none">
            <span className="text-gray-900">THE</span><br />
            <span className="bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">COMPETITION AWAITS</span>
          </h2>
          <p className="text-xl font-bold text-gray-700 mb-8">Thousands of makers are already ranking. Will you be next?</p>
          <Link href="/claim" className="inline-block px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white border-4 border-orange-600 font-black hover:shadow-lg hover:shadow-orange-600/50 transition-all hover:scale-105">
            START BIDDING →
          </Link>
        </div>
      </section>
      </div>
      <Footer />
    </>
  );
}