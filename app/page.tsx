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
  const [animatedStats, setAnimatedStats] = useState({ products: 0, bids: 0, total: 0 });

  const [formData, setFormData] = useState({
    url: '',
    description: '',
    category: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [currentBid, setCurrentBid] = useState(10000);

  // Animated stats counter
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedStats(prev => ({
        products: Math.min(prev.products + 150, 10000),
        bids: Math.min(prev.bids + 800, 50000),
        total: Math.min(prev.total + 80000, 5000000)
      }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

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
  const trendingCategory = listings.length > 0
    ? listings.reduce((a, b) => a.totalPaid > b.totalPaid ? a : b)?.category
    : 'AI';

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen text-gray-900 overflow-hidden">

        {/* HERO SECTION WITH PARALLAX */}
        <section className="relative bg-gradient-to-br from-orange-50 via-white to-orange-50 px-4 sm:px-6 py-24 md:py-48 overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16 animate-fade-in">
              <div className="inline-block bg-gradient-to-r from-orange-100 to-orange-50 border-2 border-orange-500 px-6 py-3 rounded-full mb-8 transform hover:scale-105 transition-transform duration-300">
                <span className="text-orange-600 font-black text-sm">✨ PURE COMPETITION ENGINE</span>
              </div>

              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight transform hover:scale-105 transition-transform duration-500">
                <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 bg-clip-text text-transparent animate-gradient">RANK YOUR</span>
                <br />
                <span className="text-gray-900 block mt-2">PRODUCT</span>
              </h1>

              <p className="text-xl md:text-2xl font-bold text-gray-700 mb-12 max-w-3xl mx-auto leading-tight animate-slide-up">
                No algorithms. No politics. Pure, transparent competition where excellence wins.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up-delay">
                <button
                  onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black border-4 border-orange-600 hover:shadow-2xl hover:shadow-orange-600/50 transform hover:scale-110 hover:-translate-y-1 transition-all duration-300"
                >
                  🚀 START RANKING
                </button>
                <button
                  onClick={() => document.querySelector('#leaderboard')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-white text-gray-900 font-black border-4 border-gray-300 hover:border-orange-500 transform hover:scale-105 transition-all duration-300"
                >
                  📊 VIEW LIVE BOARD
                </button>
              </div>
            </div>

            {/* Animated Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 border-t-4 border-orange-300 pt-12 animate-fade-in-delay">
              <div className="text-center group cursor-pointer">
                <div className="text-5xl md:text-6xl font-black text-orange-600 group-hover:scale-110 transition-transform duration-300">
                  {animatedStats.products.toLocaleString()}+
                </div>
                <p className="text-sm md:text-base font-black text-gray-600 uppercase mt-2">Products Listed</p>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="text-5xl md:text-6xl font-black text-orange-600 group-hover:scale-110 transition-transform duration-300">
                  {animatedStats.bids.toLocaleString()}+
                </div>
                <p className="text-sm md:text-base font-black text-gray-600 uppercase mt-2">Active Bids</p>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="text-5xl md:text-6xl font-black text-orange-600 group-hover:scale-110 transition-transform duration-300">
                  ${(animatedStats.total / 1000000).toFixed(1)}M+
                </div>
                <p className="text-sm md:text-base font-black text-gray-600 uppercase mt-2">Total Bids</p>
              </div>
            </div>
          </div>
        </section>

        {/* TRENDING SECTION */}
        <section className="bg-gradient-to-r from-orange-600 to-orange-500 px-4 sm:px-6 py-8 text-white">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-bounce">🔥</span>
              <span className="font-black text-lg">TRENDING NOW:</span>
              <span className="text-lg font-bold ml-2 animate-pulse">{trendingCategory} Category</span>
            </div>
          </div>
        </section>

        {/* CLAIM SECTION */}
        <section className="bg-white px-4 sm:px-6 py-16 md:py-24 border-b-4 border-orange-300">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-center mb-12 text-gray-900 animate-slide-up">
              Claim Your Rank in Seconds
            </h2>

            <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white to-orange-50 border-4 border-gray-200 rounded-3xl p-8 md:p-12 shadow-2xl mb-12 hover:shadow-3xl transition-all duration-300 animate-scale-in">
              {formError && (
                <div className="mb-6 p-4 bg-red-100 border-4 border-red-500 rounded-lg text-red-700 font-bold animate-shake">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="group">
                  <label className="block text-sm font-black text-gray-700 mb-2">🔗 Product URL</label>
                  <input
                    type="text"
                    name="url"
                    placeholder="https://example.com"
                    value={formData.url}
                    onChange={handleInputChange}
                    className="w-full px-6 py-3 bg-white border-2 border-gray-300 rounded-2xl font-bold text-gray-900 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 group-hover:border-orange-400"
                    required
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-black text-gray-700 mb-2">📂 Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-6 py-3 bg-white border-2 border-gray-300 rounded-2xl font-bold text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 group-hover:border-orange-400"
                    required
                  >
                    <option value="">Choose a category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-6 group">
                <label className="block text-sm font-black text-gray-700 mb-2">📝 Description</label>
                <textarea
                  name="description"
                  placeholder="Brief description of your product"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-6 py-3 bg-white border-2 border-gray-300 rounded-2xl font-bold text-gray-900 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 resize-none group-hover:border-orange-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white border-4 border-orange-600 rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-orange-600/50 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? '⏳ Processing...' : '⚡ Claim Rank'}
              </button>
            </form>

            {/* Bid Adjuster with Animation */}
            <div className="flex justify-center items-center gap-8 animate-fade-in-delay">
              <button
                onClick={() => setCurrentBid(Math.max(500, currentBid - 500))}
                className="w-16 h-16 rounded-full border-4 border-orange-500 text-orange-600 font-black text-3xl hover:bg-orange-50 transform hover:scale-125 hover:rotate-90 transition-all duration-300"
              >
                −
              </button>
              <div className="text-center">
                <div className="text-6xl font-black text-orange-600 mb-2 animate-pulse">
                  ${(currentBid/100).toFixed(0)}
                </div>
                <p className="text-sm font-bold text-gray-500">You'll rank #{calculateRank(currentBid)}</p>
              </div>
              <button
                onClick={() => setCurrentBid(currentBid + 500)}
                className="w-16 h-16 rounded-full border-4 border-orange-500 text-orange-600 font-black text-3xl hover:bg-orange-50 transform hover:scale-125 hover:-rotate-90 transition-all duration-300"
              >
                +
              </button>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-gradient-to-br from-orange-50 to-white px-4 sm:px-6 py-20 md:py-32 border-b-4 border-orange-600">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-black mb-16 text-center text-gray-900 animate-slide-up">How It Works</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { num: '01', icon: '📤', title: 'SUBMIT', desc: 'Add your product URL and category. Instant verification. Live in minutes.' },
                { num: '02', icon: '💰', title: 'BID', desc: 'Place your bid and watch your rank climb. Higher bid = Higher position.' },
                { num: '03', icon: '🎯', title: 'DOMINATE', desc: 'Get discovered by qualified makers searching your category. Drive real traffic.' }
              ].map((step, i) => (
                <div
                  key={i}
                  className="bg-white border-4 border-orange-600 p-8 md:p-10 hover:shadow-2xl hover:scale-105 transform transition-all duration-500 group cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="text-5xl mb-4 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300">{step.icon}</div>
                  <div className="text-6xl md:text-7xl font-black text-orange-600 mb-4">{step.num}</div>
                  <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-lg font-bold text-gray-700">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES WITH ICONS */}
        <section className="bg-white px-4 sm:px-6 py-20 md:py-32 border-b-4 border-orange-300">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-black mb-16 text-center text-gray-900 animate-slide-up">Why Choose RankBid</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { icon: '⚡', title: 'REAL-TIME RANKINGS', desc: 'Watch live competition unfold 24/7. Every bid. Every movement. Transparent leaderboard.' },
                { icon: '🎯', title: 'CATEGORY DOMINANCE', desc: 'Own your niche. Capture #1. Get discovered by every buyer in your space.' },
                { icon: '📊', title: 'FLEXIBLE BIDDING', desc: 'Adjust bids anytime. Scale up when needed. Only pay when you rank.' },
                { icon: '📱', title: 'MOBILE OPTIMIZED', desc: 'Manage everything on your phone. Monitor rankings. Track analytics. Always connected.' },
                { icon: '🔒', title: 'TRANSPARENT', desc: 'No hidden fees. No algorithms. Pure merit-based competition. Full visibility.' },
                { icon: '🚀', title: 'INSTANT RESULTS', desc: 'See your ranking update in real-time. Get traffic immediately. Measure ROI precisely.' }
              ].map((feature, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-orange-50 to-white border-4 border-orange-600 p-8 hover:shadow-2xl hover:scale-105 transform transition-all duration-500 group cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="text-6xl mb-4 group-hover:scale-150 group-hover:rotate-12 transition-transform duration-300">{feature.icon}</div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-lg font-bold text-gray-700">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="bg-gradient-to-br from-white to-orange-50 px-4 sm:px-6 py-20 md:py-32 border-b-4 border-orange-600">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-black mb-16 text-center text-gray-900 animate-slide-up">Trusted by Makers</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { quote: 'RankBid delivered 3x more qualified traffic. Game-changer for discovery.', author: 'Sarah Chen', role: '🚀 Founder, TechStart', rating: 5 },
                { quote: 'Pure, fair competition. No algorithms. No politics. Finally.', author: 'Alex Turner', role: '👨‍💼 Product Manager', rating: 5 },
                { quote: 'Best $500 spent. Hit #1 in 48 hours. Real visibility.', author: 'Mike Johnson', role: '🎨 Indie Maker', rating: 5 }
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white border-4 border-orange-600 p-8 hover:shadow-2xl hover:scale-105 transform transition-all duration-500 group animate-scale-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(item.rating)].map((_, j) => (
                      <span key={j} className="text-2xl group-hover:scale-125 transition-transform">⭐</span>
                    ))}
                  </div>
                  <p className="text-xl font-black text-gray-900 mb-6 italic">"{item.quote}"</p>
                  <p className="font-black text-orange-600 text-lg">{item.author}</p>
                  <p className="text-sm font-bold text-gray-600 mt-1">{item.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LEADERBOARD */}
        <section id="leaderboard" className="bg-white px-4 sm:px-6 py-20 md:py-32 border-b-4 border-orange-600">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-black mb-12 text-center text-gray-900 animate-slide-up">🏆 Top Rankings</h2>

            <div className="flex gap-8 mb-12 border-b-4 border-orange-600 pb-6 justify-center">
              <button
                onClick={() => setActiveLeaderboard('alltime')}
                className={`text-2xl font-black uppercase transition-all transform hover:scale-110 ${activeLeaderboard === 'alltime' ? 'text-orange-600 border-b-4 border-orange-600 scale-110' : 'text-gray-500'}`}
              >
                All Time
              </button>
              <button
                onClick={() => setActiveLeaderboard('today')}
                className={`text-2xl font-black uppercase transition-all transform hover:scale-110 ${activeLeaderboard === 'today' ? 'text-orange-600 border-b-4 border-orange-600 scale-110' : 'text-gray-500'}`}
              >
                Today 🔥
              </button>
            </div>

            {loading ? (
              <div className="text-center py-20 animate-pulse">
                <p className="text-2xl font-black text-gray-600">⏳ Loading rankings...</p>
              </div>
            ) : topListings.length === 0 ? (
              <div className="bg-gradient-to-br from-orange-50 to-white border-4 border-orange-600 text-center py-20 animate-scale-in">
                <p className="text-4xl font-black text-gray-900 mb-4">🚀 NO LISTINGS YET</p>
                <p className="text-lg font-bold text-gray-700 mb-8">Be the first to claim #1 and dominate.</p>
                <button
                  onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white border-4 border-orange-600 font-black transform hover:scale-110 transition-all"
                >
                  LIST YOUR PRODUCT
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {topListings.map((listing, idx) => {
                  const amount = activeLeaderboard === 'today' ? listing.dayPaid : listing.totalPaid;
                  const medalEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '📌';
                  return (
                    <div
                      key={listing.id}
                      className="bg-white border-4 border-orange-600 p-6 md:p-8 hover:shadow-2xl hover:scale-105 transform transition-all duration-300 flex items-center justify-between group cursor-pointer animate-fade-in"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <span className="text-5xl font-black text-orange-600 group-hover:scale-125 transition-transform">{medalEmoji}</span>
                          <div className="flex-1">
                            <h3 className="text-2xl font-black text-gray-900 group-hover:text-orange-600 transition-colors">{listing.title}</h3>
                            <p className="text-sm font-bold text-gray-600 mt-1">📂 {listing.category}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-black text-orange-600">${(amount / 100).toFixed(0)}</p>
                        <p className="text-sm font-bold text-gray-600 mt-2">👁️ {listing.clickCount} clicks</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-gradient-to-r from-orange-600 to-orange-500 px-4 sm:px-6 py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay animate-pulse"></div>
          </div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-5xl md:text-7xl font-black text-white mb-8 animate-slide-up">
              ✨ Ready to Compete?
            </h2>
            <p className="text-xl font-bold text-white mb-12 animate-slide-up-delay">
              Thousands of makers are already ranking. Will you be next?
            </p>
            <button
              onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-12 py-5 bg-white text-orange-600 border-4 border-white font-black text-xl hover:shadow-2xl transform hover:scale-110 hover:-translate-y-2 transition-all duration-300 animate-slide-up-delay-2"
            >
              🚀 START BIDDING NOW →
            </button>
          </div>
        </section>

      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.2s both;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }

        .animate-slide-up-delay {
          animation: slide-up 0.8s ease-out 0.2s both;
        }

        .animate-slide-up-delay-2 {
          animation: slide-up 0.8s ease-out 0.4s both;
        }

        .animate-scale-in {
          animation: scale-in 0.8s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .delay-700 {
          animation-delay: 700ms;
        }
      `}</style>
    </>
  );
}
