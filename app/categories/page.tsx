'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const categories = [
  { name: 'AI', emoji: '🤖', label: 'ARTIFICIAL INTELLIGENCE' },
  { name: 'SaaS', emoji: '💼', label: 'SOFTWARE AS A SERVICE' },
  { name: 'Developer', emoji: '👨‍💻', label: 'DEVELOPER TOOLS' },
  { name: 'Marketing', emoji: '📢', label: 'MARKETING & GROWTH' },
  { name: 'Productivity', emoji: '⚡', label: 'PRODUCTIVITY' },
  { name: 'Analytics', emoji: '📊', label: 'DATA & ANALYTICS' },
  { name: 'Design', emoji: '🎨', label: 'DESIGN & CREATIVE' },
  { name: 'Crypto', emoji: '₿', label: 'CRYPTO & BLOCKCHAIN' },
  { name: 'Business', emoji: '📈', label: 'BUSINESS TOOLS' },
  { name: 'Health', emoji: '❤️', label: 'HEALTH & FITNESS' },
  { name: 'Education', emoji: '📚', label: 'EDUCATION' },
  { name: 'Social', emoji: '👥', label: 'SOCIAL MEDIA' },
];

export default function CategoriesPage() {
  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-white px-4 sm:px-6 py-16 md:py-32 border-b-8 border-purple-600">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-8 leading-tight">
            <span className="bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">ALL</span><br />
            <span className="text-gray-900">CATEGORIES</span>
          </h1>
          <p className="text-xl md:text-2xl font-bold text-gray-700 max-w-2xl">
            Find your niche. Dominate your category. Compete for the #1 spot in your market.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="bg-white px-4 sm:px-6 py-20 md:py-32 border-b-8 border-orange-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/categories/${cat.name.toLowerCase()}`}
                className="group"
              >
                <div className="bg-white border-8 border-purple-600 p-8 h-full hover:shadow-xl hover:shadow-purple-600/40 transition-all transform hover:-translate-y-1">
                  <div className="text-6xl mb-4">{cat.emoji}</div>
                  <h2 className="text-4xl font-black text-gray-900 mb-2">{cat.name}</h2>
                  <p className="text-sm font-bold text-gray-600 mb-6 uppercase">{cat.label}</p>
                  <div className="flex items-center gap-2 font-black text-orange-600 group-hover:text-orange-700">
                    View Rankings →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white px-4 sm:px-6 py-20 md:py-32 border-b-8 border-purple-600">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-purple-50 to-orange-50 border-8 border-orange-600 rounded-3xl p-12 md:p-16 text-center">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">12 CATEGORIES</span>
            </h2>
            <p className="text-2xl font-black text-gray-700 mb-4">Each with its own independent leaderboard.</p>
            <p className="text-xl font-bold text-gray-600 mb-12">
              Thousands of products competing for the top spot in every category.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white border-4 border-purple-600 p-6 rounded-xl">
                <p className="text-4xl font-black bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">10K+</p>
                <p className="font-black text-gray-700 text-sm mt-2">Products Listed</p>
              </div>
              <div className="bg-white border-4 border-orange-600 p-6 rounded-xl">
                <p className="text-4xl font-black bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">50K+</p>
                <p className="font-black text-gray-700 text-sm mt-2">Active Bids</p>
              </div>
              <div className="bg-white border-4 border-purple-600 p-6 rounded-xl">
                <p className="text-4xl font-black bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">$5M+</p>
                <p className="font-black text-gray-700 text-sm mt-2">Total Bids</p>
              </div>
            </div>
            <Link
              href="/#claim"
              className="inline-block px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black rounded-2xl hover:shadow-lg hover:shadow-orange-600/50 transition-all hover:scale-105 text-lg border-4 border-orange-600"
            >
              Start Ranking Now
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white px-4 sm:px-6 py-20 md:py-32">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-16 text-center">
            Category Ranking <span className="bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">101</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border-8 border-purple-600 p-8 hover:shadow-xl hover:shadow-purple-600/40 transition-all">
              <div className="text-5xl font-black text-purple-600 mb-4">1️⃣</div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase">Choose Your Category</h3>
              <p className="text-lg font-bold text-gray-700">
                Select from 12 competitive categories. Each has its own independent ranking.
              </p>
            </div>

            <div className="bg-white border-8 border-orange-600 p-8 hover:shadow-xl hover:shadow-orange-600/40 transition-all">
              <div className="text-5xl font-black text-orange-600 mb-4">2️⃣</div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase">Place Your Bid</h3>
              <p className="text-lg font-bold text-gray-700">
                Pay as little as $1. Your rank is determined by your total dollar amount paid.
              </p>
            </div>

            <div className="bg-white border-8 border-purple-600 p-8 hover:shadow-xl hover:shadow-purple-600/40 transition-all">
              <div className="text-5xl font-black text-purple-600 mb-4">3️⃣</div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase">Dominate Your Niche</h3>
              <p className="text-lg font-bold text-gray-700">
                Get discovered by makers searching your category. Track clicks and ROI.
              </p>
            </div>
          </div>
        </div>
      </section>
      </div>
      <Footer />
    </>
  );
}