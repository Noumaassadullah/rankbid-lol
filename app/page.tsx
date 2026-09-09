'use client';

import Navbar from '@/components/Navbar';
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
      <Navbar />
      <div className="bg-white min-h-screen text-gray-900">

        {/* HERO SECTION */}
        <section className="relative bg-gradient-to-br from-orange-50 via-white to-orange-50 px-4 sm:px-6 py-24 md:py-40 overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <div className="inline-block bg-orange-100 border-2 border-orange-500 px-6 py-2 rounded-full mb-6">
                <span className="text-orange-600 font-black text-sm">⚡ PURE COMPETITION</span>
              </div>

              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">RANK YOUR</span>
                <br />
                <span className="text-gray-900">PRODUCT</span>
              </h1>

              <p className="text-xl md:text-2xl font-bold text-gray-700 mb-12 max-w-3xl mx-auto leading-tight">
                No algorithms. No politics. Just pure competition where the best products rise to the top.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black border-4 border-orange-600 hover:shadow-lg hover:shadow-orange-600/50 transition-all hover:scale-105"
                >
                  START RANKING NOW
                </button>
                <button
                  onClick={() => document.querySelector('#leaderboard')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-white text-gray-900 font-black border-4 border-gray-300 hover:bg-gray-50 transition-all"
                >
                  VIEW LEADERBOARD
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-8 border-t-4 border-orange-300 pt-12">
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-black text-orange-600">10K+</div>
                <p className="text-sm md:text-base font-black text-gray-600 uppercase mt-2">Products Listed</p>
              </div>
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-black text-orange-600">50K+</div>
                <p className="text-sm md:text-base font-black text-gray-600 uppercase mt-2">Active Bids</p>
              </div>
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-black text-orange-600">$5M+</div>
                <p className="text-sm md:text-base font-black text-gray-600 uppercase mt-2">Total Bids</p>
              </div>
            </div>
          </div>
        </section>

        {/* CLAIM SECTION */}
        <section className="bg-white px-4 sm:px-6 py-16 md:py-24 border-b-4 border-orange-300">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-center mb-12 text-gray-900">Claim Your Rank</h2>

            <form onSubmit={handleSubmit} className="bg-white border-4 border-gray-200 rounded-3xl p-8 md:p-12 shadow-lg mb-12">
              {formError && (
                <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 rounded-lg text-red-700 font-bold">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2">Product URL</label>
                  <input
                    type="text"
                    name="url"
                    placeholder="https://example.com"
                    value={formData.url}
                    onChange={handleInputChange}
                    className="w-full px-6 py-3 bg-gray-50 border-2 border-gray-300 rounded-2xl font-bold text-gray-900 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-6 py-3 bg-gray-50 border-2 border-gray-300 rounded-2xl font-bold text-gray-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                    required
                  >
                    <option value="">Choose a category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-black text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  placeholder="Brief description of your product"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-6 py-3 bg-gray-50 border-2 border-gray-300 rounded-2xl font-bold text-gray-900 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white border-4 border-orange-600 rounded-2xl font-black hover:shadow-lg hover:shadow-orange-600/50 transition-all hover:scale-105 disabled:opacity-50"
              >
                {formLoading ? 'Processing...' : 'Claim Rank'}
              </button>
            </form>

            {/* Bid Adjuster */}
            <div className="flex justify-center items-center gap-8">
              <button
                onClick={() => setCurrentBid(Math.max(500, currentBid - 500))}
                className="w-16 h-16 rounded-full border-4 border-orange-500 text-orange-600 font-black text-3xl hover:bg-orange-50 transition-all hover:scale-110"
              >
                −
              </button>
              <div className="text-center">
                <div className="text-5xl font-black text-orange-600">${(currentBid/100).toFixed(0)}</div>
                <p className="text-sm font-bold text-gray-500 mt-2">You'll rank #{calculateRank(currentBid)}</p>
              </div>
              <button
                onClick={() => setCurrentBid(currentBid + 500)}
                className="w-16 h-16 rounded-full border-4 border-orange-500 text-orange-600 font-black text-3xl hover:bg-orange-50 transition-all hover:scale-110"
              >
                +
              </button>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-white px-4 sm:px-6 py-20 md:py-32 border-b-4 border-orange-600">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-black mb-16 text-center text-gray-900">How It Works</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { num: '01', title: 'SUBMIT', desc: 'Add your product URL and category. Instant verification. Live in minutes.' },
                { num: '02', title: 'BID', desc: 'Place your bid and watch your rank climb. Higher bid = Higher position.' },
                { num: '03', title: 'DOMINATE', desc: 'Get discovered by qualified makers searching your category. Drive real traffic.' }
              ].map((step, i) => (
                <div key={i} className="bg-orange-50 border-4 border-orange-600 p-8 md:p-10 hover:shadow-xl transition-all">
                  <div className="text-6xl md:text-7xl font-black text-orange-600 mb-4">{step.num}</div>
                  <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-lg font-bold text-gray-700">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="bg-gradient-to-br from-white to-orange-50 px-4 sm:px-6 py-20 md:py-32 border-b-4 border-orange-300">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-black mb-16 text-center text-gray-900">Why Choose RankBid</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { icon: '⚡', title: 'REAL-TIME RANKINGS', desc: 'Watch live competition unfold 24/7. Every bid. Every movement. Transparent leaderboard.' },
                { icon: '🎯', title: 'CATEGORY DOMINANCE', desc: 'Own your niche. Capture #1. Get discovered by every buyer in your space.' },
                { icon: '📊', title: 'FLEXIBLE BIDDING', desc: 'Adjust bids anytime. Scale up when needed. Only pay when you rank.' },
                { icon: '📱', title: 'MOBILE OPTIMIZED', desc: 'Manage everything on your phone. Monitor rankings. Track analytics. Always connected.' }
              ].map((feature, i) => (
                <div key={i} className="bg-white border-4 border-orange-600 p-8 hover:shadow-xl transition-all">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-lg font-bold text-gray-700">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="bg-white px-4 sm:px-6 py-20 md:py-32 border-b-4 border-orange-600">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-black mb-16 text-center text-gray-900">Trusted by Makers</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { quote: 'RankBid delivered 3x more qualified traffic than expected. Game-changer for discovery.', author: 'Sarah Chen', role: 'Founder, Tech Startup' },
                { quote: 'No algorithms. No politics. Pure, fair competition. Finally a level playing field.', author: 'Alex Turner', role: 'Product Manager' },
                { quote: 'Best $500 we spent. Hit #1 in 48 hours. Real visibility. Real results.', author: 'Mike Johnson', role: 'Indie Maker' }
              ].map((item, i) => (
                <div key={i} className="bg-orange-50 border-4 border-orange-600 p-8">
                  <p className="text-xl font-black text-gray-900 mb-6">"{item.quote}"</p>
                  <p className="font-black text-orange-600 text-lg">{item.author}</p>
                  <p className="text-sm font-bold text-gray-600 mt-1">{item.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-gradient-to-br from-orange-50 to-white px-4 sm:px-6 py-20 md:py-32 border-b-4 border-orange-600">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-black mb-16 text-center text-gray-900">Frequently Asked</h2>

            <div className="space-y-6">
              {[
                { q: 'How does ranking work?', a: 'Your ranking is determined by the amount you bid. Higher bid = Higher rank. Rankings update in real-time as others bid.' },
                { q: 'Can I change my bid?', a: 'Yes! You can adjust your bid anytime. Your ranking will update instantly based on the new amount.' },
                { q: 'How do I get paid?', a: 'You don\'t pay RankBid - makers pay to rank their products. You benefit from increased visibility and traffic.' },
                { q: 'Is there a minimum bid?', a: 'Yes, the minimum bid is PKR 100. There\'s no maximum - bid as much as you want to dominate your category.' },
                { q: 'How are clicks tracked?', a: 'Each listing gets a unique tracking link. Clicks are counted when someone visits from our platform.' },
                { q: 'Can I remove my listing?', a: 'Yes, you can remove your listing anytime. Your current bid is kept, but your product won\'t appear in rankings.' }
              ].map((item, i) => (
                <div key={i} className="bg-white border-4 border-orange-300 p-6 md:p-8">
                  <h3 className="text-2xl font-black text-gray-900 mb-3">{item.q}</h3>
                  <p className="text-lg font-bold text-gray-700">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LEADERBOARD */}
        <section id="leaderboard" className="bg-white px-4 sm:px-6 py-20 md:py-32 border-b-4 border-orange-600">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-black mb-12 text-center text-gray-900">Top Rankings</h2>

            <div className="flex gap-8 mb-12 border-b-4 border-orange-600 pb-6 justify-center">
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
              <div className="bg-orange-50 border-4 border-orange-600 text-center py-20">
                <p className="text-4xl font-black text-gray-900 mb-4">NO LISTINGS YET</p>
                <p className="text-lg font-bold text-gray-700 mb-8">Be the first to claim #1 and dominate.</p>
                <button
                  onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white border-4 border-orange-600 font-black"
                >
                  LIST YOUR PRODUCT
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {topListings.map((listing, idx) => {
                  const amount = activeLeaderboard === 'today' ? listing.dayPaid : listing.totalPaid;
                  return (
                    <div key={listing.id} className="bg-white border-4 border-orange-600 p-6 md:p-8 hover:shadow-xl transition-all flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <span className="text-5xl font-black text-orange-600">#{idx + 1}</span>
                          <div className="flex-1">
                            <h3 className="text-2xl font-black text-gray-900">{listing.title}</h3>
                            <p className="text-sm font-bold text-gray-600 mt-1">{listing.category}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-black text-orange-600">${(amount / 100).toFixed(0)}</p>
                        <p className="text-sm font-bold text-gray-600 mt-2">{listing.clickCount} clicks</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-gradient-to-r from-orange-600 to-orange-500 px-4 sm:px-6 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-7xl font-black text-white mb-8">The Competition Awaits</h2>
            <p className="text-xl font-bold text-white mb-12">Thousands of makers are already ranking. Will you be next?</p>
            <button
              onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-12 py-5 bg-white text-orange-600 border-4 border-white font-black text-xl hover:shadow-lg transition-all hover:scale-105"
            >
              START BIDDING NOW →
            </button>
          </div>
        </section>

      </div>
    </>
  );
}
