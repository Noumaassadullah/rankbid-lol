'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RulesPage() {
  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen text-gray-900">
      {/* Header */}
      <section className="bg-white px-4 sm:px-6 py-16 md:py-32 border-b-8 border-purple-600">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-8 leading-tight">
            <span className="bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">RULES &</span><br />
            <span className="text-gray-900">TERMS</span>
          </h1>
          <p className="text-lg md:text-xl font-bold text-gray-700">Keep it clean. Play it fair. Compete like a maker.</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-white px-4 sm:px-6 py-16 md:py-32 border-b-8 border-orange-600">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-12 text-gray-900 uppercase">Listing Rules</h2>

          <div className="space-y-6 mb-16">
            {[
              { num: '1', title: 'MINIMUM BID', desc: 'Start with Rs. 500. Increment in Rs. 10 steps.' },
              { num: '2', title: 'OUTRANK FEE', desc: 'Need Rs. 250+ more than current #1 to outrank.' },
              { num: '3', title: 'TOP UP EXISTING', desc: 'Already listed? Simply pay the difference to climb.' },
              { num: '4', title: 'QUALITY ONLY', desc: 'No adult content, illegal items, spam, or scams.' },
              { num: '5', title: 'RESOLVED URLS', desc: 'Link shorteners expanded. Query parameters stripped.' },
              { num: '6', title: 'NO INVITE LINKS', desc: 'No Telegram, Discord, WhatsApp, or invite links.' },
              { num: '7', title: 'URL KEYED', desc: 'Different URLs = different products on ranking.' }
            ].map((rule, idx) => (
              <div key={idx} className="bg-white border-8 border-purple-600 p-6 md:p-8 flex gap-6">
                <div className="text-4xl font-black text-purple-600 flex-shrink-0">{rule.num}</div>
                <div className="flex-grow">
                  <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2 uppercase">{rule.title}</h3>
                  <p className="text-base md:text-lg font-bold text-gray-700">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-4xl md:text-5xl font-black mb-12 text-gray-900 uppercase">Payment & Refunds</h2>

          <div className="space-y-6 mb-16">
            {[
              { title: 'ALL PAYMENTS FINAL', desc: 'No refunds. When you list, the bid is yours. Removal = payment gone.' },
              { title: 'SECURE PAYMENT', desc: 'JazzCash & EasyPaisa. One-time payment. We never store your details.' },
              { title: 'INSTANT ACTIVATION', desc: 'Pay and immediately appear on the leaderboard.' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border-8 border-orange-600 p-6 md:p-8">
                <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-3 uppercase flex items-center gap-3">
                  <span className="text-2xl">✓</span> {item.title}
                </h3>
                <p className="text-base md:text-lg font-bold text-gray-700">{item.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="text-4xl md:text-5xl font-black mb-12 text-gray-900 uppercase">Leaderboard Types</h2>

          <div className="space-y-6">
            {[
              { title: 'ALL-TIME', desc: 'Sum of all payments ever made. The main leaderboard.' },
              { title: 'TODAY (24H)', desc: 'Last 24 hours of bidding. Resets daily at midnight UTC.' },
              { title: 'DAILY (UTC)', desc: 'Current calendar day. Frozen at midnight UTC.' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border-8 border-purple-600 p-6 md:p-8">
                <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-3 uppercase">{item.title}</h3>
                <p className="text-base md:text-lg font-bold text-gray-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="bg-white px-4 sm:px-6 py-16 md:py-32">
        <div className="max-w-4xl mx-auto border-8 border-orange-600 p-8 md:p-12">
          <p className="text-lg md:text-xl font-bold text-gray-700 mb-6">
            By listing a product or placing a payment, you agree to these terms. We reserve the right to update these rules at any time. Changes take effect immediately.
          </p>
          <p className="text-sm font-black uppercase tracking-wider text-gray-600">Last Updated: June 2026</p>
        </div>
      </section>
      </div>
      <Footer />
    </>
  );
}