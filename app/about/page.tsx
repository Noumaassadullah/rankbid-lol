'use client';

import Header from '@/components/Header';

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold text-[#1F2937] mb-8">About RankBid</h1>

          <div className="space-y-8 text-[#1F2937]/75">
            <section>
              <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Our Mission</h2>
              <p className="text-lg leading-relaxed">
                RankBid is a community-driven discovery platform where makers and product creators compete fairly
                to get discovered. We believe in merit-based ranking through transparent community voting—no algorithms, no gatekeepers, just pure voting.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1F2937] mb-4">How It Works</h2>
              <p className="text-lg leading-relaxed mb-4">
                Submit your product, share it with the community, and let real users vote. Every vote helps determine your ranking.
                It's simple, transparent, and completely free.
              </p>
              <ul className="space-y-3 text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-[#0F3460] font-bold">1.</span>
                  <span>Submit your product URL and details</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#0F3460] font-bold">2.</span>
                  <span>Share your product to get community votes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#0F3460] font-bold">3.</span>
                  <span>Get discovered by real users worldwide</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Why RankBid?</h2>
              <ul className="space-y-3 text-lg">
                <li className="flex items-center gap-3">
                  <span className="text-[#0F3460]">✓</span>
                  <span><strong>100% Free</strong> — no submission fees, no hidden costs</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#0F3460]">✓</span>
                  <span><strong>Fully transparent</strong> — see real-time vote counts</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#0F3460]">✓</span>
                  <span><strong>Fair competition</strong> — merit-based ranking through community voting</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#0F3460]">✓</span>
                  <span><strong>Real audience</strong> — thousands of product enthusiasts worldwide</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#0F3460]">✓</span>
                  <span><strong>Real-time results</strong> — watch your ranking update live</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Our Values</h2>
              <p className="text-lg leading-relaxed">
                We believe in transparency, fairness, and community. RankBid is built on the principle that the best products
                should be discovered by real people voting for what they love. Success is determined by community preference, not
                algorithms or corporate gatekeepers.
              </p>
            </section>
          </div>

          <div className="mt-12 p-8 bg-[#0F3460]/5 rounded-lg border border-[#0F3460]/20">
            <h3 className="text-xl font-bold text-[#1F2937] mb-3">Ready to get ranked?</h3>
            <p className="text-[#1F2937]/75 mb-6">Submit your product today and let the community discover it.</p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-[#0F3460] text-white font-semibold rounded-lg hover:bg-[#0D2A50] transition-colors"
            >
              Submit Your Product
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
