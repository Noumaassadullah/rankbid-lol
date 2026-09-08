'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Mock historical data - will be replaced with real data from DailySnapshot
const previousDays = [
  {
    date: 'September 8, 2024',
    listings: [
      { rank: 1, name: 'ChatGPT Pro', amount: 5000 },
      { rank: 2, name: 'Midjourney v6', amount: 4500 },
      { rank: 3, name: 'Claude API', amount: 4200 },
    ]
  },
  {
    date: 'September 7, 2024',
    listings: [
      { rank: 1, name: 'Figma Design', amount: 3800 },
      { rank: 2, name: 'Stripe Connect', amount: 3200 },
      { rank: 3, name: 'Vercel Deploy', amount: 2900 },
    ]
  },
  {
    date: 'September 6, 2024',
    listings: [
      { rank: 1, name: 'Notion Pro', amount: 4100 },
      { rank: 2, name: 'Slack API', amount: 3900 },
      { rank: 3, name: 'Monday.com', amount: 3500 },
    ]
  },
  {
    date: 'September 5, 2024',
    listings: [
      { rank: 1, name: 'Linear', amount: 4800 },
      { rank: 2, name: 'GitHub Copilot', amount: 4300 },
      { rank: 3, name: 'VS Code', amount: 3700 },
    ]
  },
];

export default function DailyPage() {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-white px-4 sm:px-6 py-16 md:py-32 border-b-8 border-purple-600">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">📅 DAILY</span><br />
            <span className="text-gray-900">CHAMPIONS</span>
          </h1>
          <p className="text-xl md:text-2xl font-bold text-gray-700 max-w-2xl mb-8">
            Historical leaderboard snapshots. Frozen at midnight UTC every day.
          </p>
          <div className="bg-purple-100 border-4 border-purple-600 rounded-xl p-6 inline-block">
            <p className="font-black text-gray-900">
              ⏰ UTC Calendar Days • 🔒 Frozen at Midnight • 📊 Historical Record
            </p>
          </div>
        </div>
      </section>

      {/* Today's Live */}
      <section className="bg-white px-4 sm:px-6 py-12 md:py-20 border-b-8 border-orange-600">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-8 border-orange-600 rounded-3xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div>
                <p className="text-sm font-black text-orange-600 mb-2 uppercase">● LIVE RIGHT NOW</p>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900">{today} (UTC)</h2>
                <p className="text-lg font-bold text-gray-700 mt-4">Resets at midnight UTC. Go to the 24h leaderboard for today's action!</p>
              </div>
              <Link
                href="/today"
                className="px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black rounded-2xl hover:shadow-lg hover:shadow-orange-600/50 transition-all hover:scale-105 whitespace-nowrap"
              >
                View 24h Leaderboard →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Previous Days Archive */}
      <section className="bg-white px-4 sm:px-6 py-20 md:py-32 border-b-8 border-purple-600">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-16">
            Daily <span className="text-purple-600">Archives</span>
          </h2>

          <div className="space-y-12">
            {previousDays.map((day, dayIdx) => (
              <div key={dayIdx} className="border-8 border-purple-600 rounded-2xl overflow-hidden">
                <div className="bg-purple-50 px-6 md:px-8 py-6 border-b-4 border-purple-600">
                  <h3 className="text-3xl font-black text-gray-900">{day.date}</h3>
                </div>
                <div className="space-y-3 p-6 md:p-8">
                  {day.listings.map((listing, idx) => (
                    <div
                      key={idx}
                      className="bg-white border-4 border-orange-600 p-6 flex items-center justify-between hover:shadow-lg hover:shadow-orange-600/30 transition-all"
                    >
                      <div className="flex items-center gap-6">
                        <span className="text-5xl font-black text-purple-600">#{listing.rank}</span>
                        <div>
                          <h4 className="text-2xl font-black text-gray-900">{listing.name}</h4>
                        </div>
                      </div>
                      <span className="text-3xl font-black text-orange-600">
                        ${(listing.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Daily Works */}
      <section className="bg-white px-4 sm:px-6 py-20 md:py-32 border-b-8 border-orange-600">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-16 text-center">
            How <span className="text-orange-600">Daily</span> Rankings Work
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'UTC Calendar Days',
                desc: 'Each calendar day (midnight to midnight UTC) gets its own independent leaderboard.'
              },
              {
                title: 'Frozen & Archived',
                desc: 'At midnight UTC, the leaderboard freezes. Top 10 becomes permanent historical record.'
              },
              {
                title: 'Independent Ranking',
                desc: 'Payments within each UTC day only count for that day. Previous days don\'t affect current.'
              },
              {
                title: 'Historical Record',
                desc: 'See who won each day. Track trends. Review who dominated what market over time.'
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border-8 border-purple-600 p-8 hover:shadow-xl hover:shadow-purple-600/40 transition-all">
                <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase">{item.title}</h3>
                <p className="text-lg font-bold text-gray-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white px-4 sm:px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-8 leading-tight">
            Want to Be a <span className="text-orange-600">Daily Champion?</span>
          </h2>
          <p className="text-xl md:text-2xl font-bold text-gray-700 mb-12">
            Fresh competition every day. New leaderboard. New opportunity to dominate.
          </p>
          <Link
            href="/#claim"
            className="inline-block px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white border-4 border-orange-600 font-black hover:shadow-lg hover:shadow-orange-600/50 transition-all hover:scale-105 text-lg rounded-2xl"
          >
            Start Bidding Today →
          </Link>
        </div>
      </section>
      </div>
      <Footer />
    </>
  );
}