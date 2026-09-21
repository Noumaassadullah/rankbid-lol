'use client';

import Header from '@/components/Header';
import { useState } from 'react';

const Icons = {
  Vote: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  TrendingUp: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Globe: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20H7m6-4h.01M9 20h6" />
    </svg>
  ),
  Zap: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Trophy: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
};

export default function WhyRankBid() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I submit my product?',
      a: 'Simply fill out the submission form with your product URL or handle, select a category, add a description, and submit. It\'s completely free and takes less than 2 minutes. Your product goes live immediately with no approval delays.'
    },
    {
      q: 'How does voting work?',
      a: 'Each user can vote once per product. Vote counts update in real-time on the leaderboard. The more votes your product gets, the higher it ranks. It\'s transparent - everyone can see the vote count and community preference.'
    },
    {
      q: 'Can I see rankings in different time periods?',
      a: 'Yes! RankBid offers multiple ranking views: All-Time rankings show the highest voted products ever, while Today rankings show what\'s trending right now. You can also filter by 25+ categories to find products in specific areas.'
    },
    {
      q: 'What products can I submit?',
      a: 'RankBid accepts products across 25+ categories including Marketing, SEO, Productivity, Agents, Crypto, Developer Tools, Health, Games, Business, Ecommerce, Travel, Design, Hiring, Security, Sales, Writing, Analytics, and many more.'
    },
    {
      q: 'Is there really no cost?',
      a: 'Correct. Submitting on RankBid is 100% free. No listing fees, no featured placement costs, no hidden charges. Everyone gets the same fair opportunity to be discovered by the community.'
    },
    {
      q: 'How is this different from other platforms?',
      a: 'RankBid uses pure community voting instead of algorithms or editorial gatekeeping. Your product\'s ranking depends on real people voting for it, not on advertising budgets or editor approval. It\'s transparent, democratic, and merit-based.'
    },
    {
      q: 'Why would I use RankBid over paid platforms?',
      a: 'You keep 100% of your discovery without paying fees. RankBid gives you access to a community of active users looking for new products. No gatekeepers deciding what\'s "worthy" - just real people voting for what they love.'
    },
    {
      q: 'Can I share my product\'s RankBid link?',
      a: 'Yes! Each product has its own page on RankBid. You can share the link with your community to drive votes. Built-in share buttons make it easy to spread the word across social platforms.'
    }
  ];

  return (
    <>
      <Header />
      <div className="bg-white text-[#18181B]">

        {/* HERO SECTION */}
        <section className="bg-white pt-16 pb-16 border-b-4 border-[#18181B] relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#D97706] rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#059669] rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl md:text-6xl font-black text-[#18181B] mb-6 leading-tight">
                  Why Use RankBid?
                </h1>
                <p className="text-lg text-[#18181B]/75 mb-8 leading-relaxed font-medium">
                  RankBid is the community-driven discovery platform where your product gets ranked based on real user votes - not algorithms, not gatekeepers, not budgets. Just honest community feedback.
                </p>
                <div className="flex gap-4 flex-wrap">
                  <button
                    onClick={() => window.location.href = '/#leaderboard'}
                    className="flex items-center gap-2 px-8 py-4 bg-[#D97706] text-[#18181B] font-black uppercase text-sm border-4 border-[#D97706] hover:scale-105 active:scale-95 transition-all duration-150"
                  >
                    <Icons.TrendingUp />
                    View Rankings
                  </button>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="flex items-center gap-2 px-8 py-4 bg-white text-[#18181B] font-black uppercase text-sm border-4 border-[#18181B] hover:scale-105 active:scale-95 transition-all duration-150"
                  >
                    <Icons.Upload />
                    Submit Product
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border-4 border-[#18181B] bg-white p-6 hover:bg-[#D97706]/5 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-[#D97706] rounded flex items-center justify-center text-[#18181B]">
                      <Icons.Vote />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-[#18181B] mb-1">100%</p>
                  <p className="text-xs text-[#18181B]/60 font-semibold">Community Voting</p>
                </div>

                <div className="border-4 border-[#18181B] bg-white p-6 hover:bg-[#059669]/5 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-[#059669] rounded flex items-center justify-center text-[#18181B]">
                      <Icons.Trophy />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-[#18181B] mb-1">100K+</p>
                  <p className="text-xs text-[#18181B]/60 font-semibold">Ranked Products</p>
                </div>

                <div className="border-4 border-[#18181B] bg-white p-6 hover:bg-[#D97706]/5 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-[#D97706] rounded flex items-center justify-center text-[#18181B]">
                      <Icons.Zap />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-[#18181B] mb-1">Real-time</p>
                  <p className="text-xs text-[#18181B]/60 font-semibold">Live Rankings</p>
                </div>

                <div className="border-4 border-[#18181B] bg-white p-6 hover:bg-[#059669]/5 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-[#059669] rounded flex items-center justify-center text-[#18181B]">
                      <Icons.Check />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-[#18181B] mb-1">Free</p>
                  <p className="text-xs text-[#18181B]/60 font-semibold">No Cost Ever</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="bg-[#F5F5F5] py-12 border-b-4 border-[#18181B]">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-black text-[#18181B] uppercase mb-8">How RankBid Works</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border-4 border-[#18181B] bg-white p-8 hover:bg-[#D97706]/5 transition-colors">
                <p className="text-5xl font-black text-[#D97706] mb-4">1</p>
                <h3 className="text-lg font-black text-[#18181B] uppercase mb-3">Submit Your Product</h3>
                <p className="text-sm text-[#18181B]/70 font-medium leading-relaxed">
                  Add your product with a URL or handle, select a category, write a description. Takes 2 minutes. No approval needed. Goes live instantly.
                </p>
              </div>

              <div className="border-4 border-[#18181B] bg-white p-8 hover:bg-[#D97706]/5 transition-colors">
                <p className="text-5xl font-black text-[#D97706] mb-4">2</p>
                <h3 className="text-lg font-black text-[#18181B] uppercase mb-3">Community Votes</h3>
                <p className="text-sm text-[#18181B]/70 font-medium leading-relaxed">
                  Real users discover your product and vote for it. Each vote is counted. Vote totals update in real-time. Everyone sees the same numbers.
                </p>
              </div>

              <div className="border-4 border-[#18181B] bg-white p-8 hover:bg-[#D97706]/5 transition-colors">
                <p className="text-5xl font-black text-[#D97706] mb-4">3</p>
                <h3 className="text-lg font-black text-[#18181B] uppercase mb-3">Climb Rankings</h3>
                <p className="text-sm text-[#18181B]/70 font-medium leading-relaxed">
                  The more votes you get, the higher you rank. View all-time rankings or today's trending. Filter by 25+ categories. Pure merit-based.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* GLOBAL VISIBILITY SECTION */}
        <section className="bg-[#F5F5F5] py-12 border-b-4 border-[#18181B]">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-black text-[#18181B] uppercase mb-8">Your Products Go Global</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-black text-[#18181B] mb-6">Get Ranked Worldwide</h3>
                <p className="text-lg text-[#18181B]/75 mb-8 leading-relaxed font-medium">
                  When you submit your product, it instantly appears on RankBid's global leaderboard. Your product is seen by thousands of active users across the world looking for solutions. No geography limits. No regional restrictions. Your ranking is worldwide.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-[#D97706] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Icons.Check />
                    </div>
                    <div>
                      <p className="font-black text-[#18181B]">Global Leaderboard</p>
                      <p className="text-sm text-[#18181B]/70">Your product visible to worldwide audience</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-[#D97706] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Icons.Check />
                    </div>
                    <div>
                      <p className="font-black text-[#18181B]">Category Rankings</p>
                      <p className="text-sm text-[#18181B]/70">Ranked among similar products in 25+ categories</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-[#D97706] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Icons.Check />
                    </div>
                    <div>
                      <p className="font-black text-[#18181B]">Time-Based Rankings</p>
                      <p className="text-sm text-[#18181B]/70">All-time rankings + today's trending section</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-[#D97706] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Icons.Check />
                    </div>
                    <div>
                      <p className="font-black text-[#18181B]">Real-Time Updates</p>
                      <p className="text-sm text-[#18181B]/70">Your ranking updates live as votes come in</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-4 border-[#18181B] bg-white p-8">
                <div className="space-y-4">
                  <div className="bg-[#F5F5F5] border-2 border-[#18181B] p-4 rounded">
                    <p className="text-xs font-black text-[#18181B]/60 uppercase mb-2">Global Rank</p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-black text-[#D97706]">#1</p>
                      <p className="text-xs font-semibold text-[#18181B]/70">1,234 votes</p>
                    </div>
                  </div>
                  <div className="bg-[#F5F5F5] border-2 border-[#18181B] p-4 rounded">
                    <p className="text-xs font-black text-[#18181B]/60 uppercase mb-2">Marketing Category</p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-black text-[#D97706]">#3</p>
                      <p className="text-xs font-semibold text-[#18181B]/70">987 votes</p>
                    </div>
                  </div>
                  <div className="bg-[#F5F5F5] border-2 border-[#18181B] p-4 rounded">
                    <p className="text-xs font-black text-[#18181B]/60 uppercase mb-2">Today's Trending</p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-black text-[#D97706]">#7</p>
                      <p className="text-xs font-semibold text-[#18181B]/70">234 votes today</p>
                    </div>
                  </div>
                  <div className="bg-[#F5F5F5] border-2 border-[#18181B] p-4 rounded">
                    <p className="text-xs font-black text-[#18181B]/60 uppercase mb-2">All Time</p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-black text-[#D97706]">#12</p>
                      <p className="text-xs font-semibold text-[#18181B]/70">2,456 total votes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* YOUR PROFILE & PRODUCTS SECTION */}
        <section className="bg-white py-12 border-b-4 border-[#18181B]">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-black text-[#18181B] uppercase mb-8">Your Profile & Products Showcase</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="border-4 border-[#18181B] bg-[#F5F5F5] p-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-black text-[#18181B]/60 uppercase mb-2">Your Creator Profile</p>
                    <div className="bg-white border-2 border-[#18181B] p-4">
                      <p className="font-black text-[#18181B] text-lg">Your Brand Name</p>
                      <p className="text-xs text-[#18181B]/60 mt-1">12 Products Ranked</p>
                      <p className="text-xs text-[#18181B]/60">3,456 Total Community Votes</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-black text-[#18181B]/60 uppercase mb-2">Your Products</p>
                    <div className="space-y-2">
                      <div className="bg-white border-2 border-[#18181B] p-3 flex justify-between items-center">
                        <span className="font-semibold text-[#18181B] text-sm">Product #1</span>
                        <span className="font-black text-[#D97706]">234 votes</span>
                      </div>
                      <div className="bg-white border-2 border-[#18181B] p-3 flex justify-between items-center">
                        <span className="font-semibold text-[#18181B] text-sm">Product #2</span>
                        <span className="font-black text-[#D97706]">189 votes</span>
                      </div>
                      <div className="bg-white border-2 border-[#18181B] p-3 flex justify-between items-center">
                        <span className="font-semibold text-[#18181B] text-sm">Product #3</span>
                        <span className="font-black text-[#D97706]">156 votes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-black text-[#18181B] mb-6">Build Your Creator Brand</h3>
                <p className="text-lg text-[#18181B]/75 mb-8 leading-relaxed font-medium">
                  Your profile on RankBid becomes your public showcase. Every product you submit, every vote you get, every ranking you achieve - all visible to the world. Build credibility. Establish authority. Show what you're capable of building.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-[#059669] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Icons.Check />
                    </div>
                    <div>
                      <p className="font-black text-[#18181B]">Creator Portfolio</p>
                      <p className="text-sm text-[#18181B]/70">All your products displayed in one place</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-[#059669] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Icons.Check />
                    </div>
                    <div>
                      <p className="font-black text-[#18181B]">Cumulative Stats</p>
                      <p className="text-sm text-[#18181B]/70">Total votes, total products, creator ranking</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-[#059669] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Icons.Check />
                    </div>
                    <div>
                      <p className="font-black text-[#18181B]">Public Profile Links</p>
                      <p className="text-sm text-[#18181B]/70">Share your profile with investors, partners, customers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-[#059669] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Icons.Check />
                    </div>
                    <div>
                      <p className="font-black text-[#18181B]">Social Proof</p>
                      <p className="text-sm text-[#18181B]/70">Demonstrate community validation for your products</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHY CREATORS LOVE IT SECTION */}
        <section className="bg-[#F5F5F5] py-12 border-b-4 border-[#18181B]">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-black text-[#18181B] uppercase mb-8">Why Creators Choose RankBid</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-4 border-[#18181B] bg-white p-8 hover:bg-[#D97706]/5 transition-colors">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 bg-[#059669] rounded flex items-center justify-center text-white flex-shrink-0 mt-1">
                    <Icons.Check />
                  </div>
                  <h3 className="text-lg font-black text-[#18181B]">It's 100% Free</h3>
                </div>
                <p className="text-sm text-[#18181B]/70 font-medium">
                  No submission fees, no listing costs, no featured placement charges. Submit unlimited products at zero cost. Keep everything you earn.
                </p>
              </div>

              <div className="border-4 border-[#18181B] bg-white p-8 hover:bg-[#D97706]/5 transition-colors">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 bg-[#059669] rounded flex items-center justify-center text-white flex-shrink-0 mt-1">
                    <Icons.Check />
                  </div>
                  <h3 className="text-lg font-black text-[#18181B]">No Gatekeepers</h3>
                </div>
                <p className="text-sm text-[#18181B]/70 font-medium">
                  Your product goes live instantly. No editor approval needed. No waiting. No rules about what's "worthy." Just launch and see votes come in.
                </p>
              </div>

              <div className="border-4 border-[#18181B] bg-white p-8 hover:bg-[#D97706]/5 transition-colors">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 bg-[#059669] rounded flex items-center justify-center text-white flex-shrink-0 mt-1">
                    <Icons.Check />
                  </div>
                  <h3 className="text-lg font-black text-[#18181B]">Real User Feedback</h3>
                </div>
                <p className="text-sm text-[#18181B]/70 font-medium">
                  Every vote is genuine. Community voting shows you exactly what real people think. No bots, no algorithms hiding the truth. Pure feedback.
                </p>
              </div>

              <div className="border-4 border-[#18181B] bg-white p-8 hover:bg-[#D97706]/5 transition-colors">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 bg-[#059669] rounded flex items-center justify-center text-white flex-shrink-0 mt-1">
                    <Icons.Check />
                  </div>
                  <h3 className="text-lg font-black text-[#18181B]">Level Playing Field</h3>
                </div>
                <p className="text-sm text-[#18181B]/70 font-medium">
                  Small indie makers compete fairly with big companies. Your product wins based on quality, not budget. Marketing budget doesn't matter here.
                </p>
              </div>

              <div className="border-4 border-[#18181B] bg-white p-8 hover:bg-[#D97706]/5 transition-colors">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 bg-[#059669] rounded flex items-center justify-center text-white flex-shrink-0 mt-1">
                    <Icons.Check />
                  </div>
                  <h3 className="text-lg font-black text-[#18181B]">Instant Global Visibility</h3>
                </div>
                <p className="text-sm text-[#18181B]/70 font-medium">
                  Join 100K+ products already ranked worldwide. Get seen by global audience actively looking for new products to discover and support.
                </p>
              </div>

              <div className="border-4 border-[#18181B] bg-white p-8 hover:bg-[#D97706]/5 transition-colors">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 bg-[#059669] rounded flex items-center justify-center text-white flex-shrink-0 mt-1">
                    <Icons.Check />
                  </div>
                  <h3 className="text-lg font-black text-[#18181B]">Multiple Ranking Views</h3>
                </div>
                <p className="text-sm text-[#18181B]/70 font-medium">
                  Track all-time rankings and today's trending. Filter by categories. See where your product stands and what's trending right now.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* WHY USERS LOVE IT SECTION */}
        <section className="bg-[#F5F5F5] py-12 border-b-4 border-[#18181B]">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-black text-[#18181B] uppercase mb-8">Why Community Members Use RankBid</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-4 border-[#18181B] bg-white p-8 hover:bg-[#D97706]/5 transition-colors">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 bg-[#D97706] rounded flex items-center justify-center text-white flex-shrink-0 mt-1">
                    <Icons.Globe />
                  </div>
                  <h3 className="text-lg font-black text-[#18181B]">Discover New Products</h3>
                </div>
                <p className="text-sm text-[#18181B]/70 font-medium">
                  Browse 100K+ products ranked by real votes. Find tools, apps, and services your community actually loves. No ads, no paid placements clouding results.
                </p>
              </div>

              <div className="border-4 border-[#18181B] bg-white p-8 hover:bg-[#D97706]/5 transition-colors">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 bg-[#D97706] rounded flex items-center justify-center text-white flex-shrink-0 mt-1">
                    <Icons.Vote />
                  </div>
                  <h3 className="text-lg font-black text-[#18181B]">Your Vote Counts</h3>
                </div>
                <p className="text-sm text-[#18181B]/70 font-medium">
                  Your vote actually matters. You help shape what's visible to everyone. Be part of the community that decides which products deserve recognition.
                </p>
              </div>

              <div className="border-4 border-[#18181B] bg-white p-8 hover:bg-[#D97706]/5 transition-colors">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 bg-[#D97706] rounded flex items-center justify-center text-white flex-shrink-0 mt-1">
                    <Icons.Zap />
                  </div>
                  <h3 className="text-lg font-black text-[#18181B]">Real-Time Rankings</h3>
                </div>
                <p className="text-sm text-[#18181B]/70 font-medium">
                  Vote counts update live. See what's trending right now vs all-time favorites. Watch your favorite products climb in real-time.
                </p>
              </div>

              <div className="border-4 border-[#18181B] bg-white p-8 hover:bg-[#D97706]/5 transition-colors">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 bg-[#D97706] rounded flex items-center justify-center text-white flex-shrink-0 mt-1">
                    <Icons.Users />
                  </div>
                  <h3 className="text-lg font-black text-[#18181B]">Support Quality Makers</h3>
                </div>
                <p className="text-sm text-[#18181B]/70 font-medium">
                  Vote for indie makers and small teams building amazing things. Help them get discovered by giving them visibility through your vote.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="bg-white py-12 border-b-4 border-[#18181B]">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-black text-[#18181B] uppercase mb-8">Common Questions</h2>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="border-4 border-[#18181B] bg-white cursor-pointer hover:bg-[#D97706]/5 transition-colors"
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                >
                  <div className="p-6 flex items-start justify-between gap-4">
                    <h3 className="text-lg font-black text-[#18181B] flex-1">{faq.q}</h3>
                    <span className={`text-xl flex-shrink-0 transition-transform duration-200 ${expandedFaq === idx ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </div>
                  {expandedFaq === idx && (
                    <div className="px-6 pb-6 border-t-4 border-[#18181B] pt-6">
                      <p className="text-sm text-[#18181B]/70 font-medium leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="bg-[#D97706] py-12 border-b-4 border-[#18181B]">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-black text-[#18181B] mb-4 uppercase">Ready to Get Ranked?</h2>
            <p className="text-lg text-[#18181B] font-medium mb-8 max-w-2xl mx-auto">
              Submit your product today and let the community decide. It takes 2 minutes and it's completely free.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-2 px-8 py-4 bg-[#18181B] text-[#D97706] font-black uppercase border-4 border-[#18181B] hover:scale-105 active:scale-95 transition-all duration-150"
              >
                <Icons.Upload />
                Submit Product
              </button>
              <button
                onClick={() => window.location.href = '/#leaderboard'}
                className="flex items-center gap-2 px-8 py-4 bg-white text-[#18181B] font-black uppercase border-4 border-[#18181B] hover:scale-105 active:scale-95 transition-all duration-150"
              >
                <Icons.TrendingUp />
                View Top Rankings
              </button>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
