'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen text-gray-900">
      {/* Header */}
      <section className="bg-white px-4 sm:px-6 py-16 md:py-32 border-b-8 border-purple-600">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-8 leading-tight">
            <span className="bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">ABOUT</span><br />
            <span className="text-gray-900">RANKBID</span>
          </h1>
          <p className="text-lg md:text-xl font-bold text-gray-700">The transparent leaderboard where merit matters.</p>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-white px-4 sm:px-6 py-16 md:py-32 border-b-8 border-orange-600">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-8 text-gray-900">OUR MISSION</h2>
          <div className="bg-white border-8 border-purple-600 p-8 md:p-12">
            <p className="text-lg md:text-xl font-bold text-gray-700 leading-relaxed mb-6">
              RankBid exists to level the playing field for makers, founders, and builders worldwide. We believe the best products should win based on merit, not politics. No algorithms. No hidden favoritism. Just pure competition.
            </p>
            <p className="text-lg md:text-xl font-bold text-gray-700 leading-relaxed">
              We've created a transparent leaderboard where real makers compete for real visibility. Every bid is visible. Every ranking is fair. Every winner deserves their spot.
            </p>
          </div>
        </div>
      </section>

      {/* Why We Built It */}
      <section className="bg-white px-4 sm:px-6 py-16 md:py-32 border-b-8 border-purple-600">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-12 text-gray-900">WHY WE BUILT IT</h2>
          <div className="space-y-6">
            {[
              { title: 'Algorithm Fatigue', desc: 'Product discovery platforms are gamed. Makers follow arbitrary algorithms. The best products get buried. We decided to stop playing the game.' },
              { title: 'Real Competition', desc: 'We wanted to create something where the best actually wins. Where creators are rewarded for building great products, not gaming systems.' },
              { title: 'Transparent Markets', desc: 'Every bid is public. Every rank is earned. No backdoor deals. No hidden tiers. Just honest, open competition.' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border-8 border-orange-600 p-8 hover:shadow-xl hover:shadow-orange-600/40 transition-all">
                <h3 className="text-2xl font-black mb-4 text-gray-900 uppercase">{item.title}</h3>
                <p className="text-lg font-bold text-gray-700 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white px-4 sm:px-6 py-16 md:py-32 border-b-8 border-orange-600">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-12 text-gray-900">OUR VALUES</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {[
              { value: 'TRANSPARENCY', desc: 'Every ranking, every bid, every movement is visible to everyone.' },
              { value: 'FAIRNESS', desc: 'The best product wins. Not the one with the best connections.' },
              { value: 'MERIT', desc: 'Success comes from building something people want and competing hard.' },
              { value: 'COMMUNITY', desc: 'Makers helping makers. A community that celebrates great products.' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border-8 border-purple-600 p-8 hover:shadow-xl hover:shadow-purple-600/40 transition-all">
                <h3 className="text-xl md:text-2xl font-black mb-3 text-gray-900 uppercase">{item.value}</h3>
                <p className="text-base md:text-lg font-bold text-gray-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white px-4 sm:px-6 py-16 md:py-32 border-b-8 border-purple-600">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-12 text-gray-900">BY THE NUMBERS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {[
              { stat: '10K+', label: 'Products Listed' },
              { stat: '50K+', label: 'Active Bids' },
              { stat: '$5M+', label: 'Total Bids' },
              { stat: '28', label: 'Categories' }
            ].map((item, idx) => (
              <div key={idx} className="border-8 border-orange-600 p-8 text-center">
                <p className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent mb-3">{item.stat}</p>
                <p className="text-lg font-bold text-gray-700">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white px-4 sm:px-6 py-16 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-8 text-gray-900">BUILT BY MAKERS. FOR MAKERS.</h2>
          <p className="text-lg md:text-xl font-bold text-gray-700 mb-12">Join a global community of makers competing on merit. No games. No politics. Just pure competition.</p>
          <a href="/claim" className="inline-block px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white border-8 border-orange-600 font-black hover:shadow-xl hover:shadow-orange-600/50 transition-all hover:scale-105 text-lg uppercase">
            Start Competing Now
          </a>
        </div>
      </section>
      </div>
      <Footer />
    </>
  );
}