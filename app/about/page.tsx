'use client';

import Header from '@/components/Header';

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">About RankBid</h1>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-lg leading-relaxed">
                RankBid is a transparent, pay-to-rank leaderboard platform where makers and product creators compete fairly 
                to get discovered. We believe in merit-based ranking through direct bidding—no algorithms, no politics, just pure competition.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-lg leading-relaxed mb-4">
                Submit your product, place a bid, and watch it climb the rankings in real-time. Every dollar you bid directly 
                determines your position. The more you bid, the higher you rank. It's simple, transparent, and fair.
              </p>
              <ul className="space-y-3 text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 font-bold">1.</span>
                  <span>Submit your product URL and details</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 font-bold">2.</span>
                  <span>Place your bid to claim your ranking</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 font-bold">3.</span>
                  <span>Get discovered by real makers and users</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Why RankBid?</h2>
              <ul className="space-y-3 text-lg">
                <li className="flex items-center gap-3">
                  <span className="text-orange-600">✓</span>
                  <span><strong>Fully transparent</strong> — see real-time rankings and bids</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-orange-600">✓</span>
                  <span><strong>No hidden fees</strong> — what you bid is what you pay</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-orange-600">✓</span>
                  <span><strong>Fair competition</strong> — merit-based ranking through direct bidding</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-orange-600">✓</span>
                  <span><strong>Real audience</strong> — thousands of makers and product enthusiasts</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-orange-600">✓</span>
                  <span><strong>Instant results</strong> — watch your ranking update live</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h2>
              <p className="text-lg leading-relaxed">
                We believe in transparency, fairness, and merit. RankBid is built on the principle that the best products 
                should be discovered, and success should be determined by the quality of your work and the effort you put in—not 
                by algorithms or corporate relationships.
              </p>
            </section>
          </div>

          <div className="mt-12 p-8 bg-orange-50 rounded-lg border border-orange-200">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Ready to get ranked?</h3>
            <p className="text-gray-700 mb-6">Submit your product today and start competing for the top spot.</p>
            <a
              href="/#claim"
              className="inline-block px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
            >
              Claim Your Rank
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
