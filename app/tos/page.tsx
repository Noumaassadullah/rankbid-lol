'use client';

import Header from '@/components/Header';

export default function ToSPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600 mb-12 text-lg">Last updated: September 2024</p>

          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What is RankBid?</h2>
              <p className="text-gray-700 leading-relaxed">
                RankBid is a transparent, pay-to-rank leaderboard platform where product creators and makers compete fairly to gain visibility. It operates on a simple principle: the more you bid, the higher your rank. There are no algorithms, no politics, no hidden factors—just pure, merit-based competition.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How Pay-to-Rank Works</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <span className="font-semibold">Submit Your Product:</span> Create a listing by providing your product URL, title, description, and category.
                </p>
                <p>
                  <span className="font-semibold">Place Your Bid:</span> Pay the minimum amount (₨2,800 or ~$10 USD) to enter the leaderboard. Your listing starts at rank #N based on your bid amount.
                </p>
                <p>
                  <span className="font-semibold">Real-Time Rankings:</span> Your rank updates instantly based on your bid compared to other listings. To rank #1, bid more than the current #1 listing.
                </p>
                <p>
                  <span className="font-semibold">Boost Anytime:</span> Use our "Boost" feature to add funds to your existing listing at any time to increase your rank without creating a new listing.
                </p>
                <p>
                  <span className="font-semibold">Daily Reset:</span> A separate daily leaderboard resets every day at UTC midnight, allowing new products to compete fresh each day.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Bidding & Payments</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#0F3460]">•</span>
                  <span><span className="font-semibold">Minimum Bid:</span> ₨2,800 (~$10 USD) per listing or boost</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#0F3460]">•</span>
                  <span><span className="font-semibold">Final & Non-Refundable:</span> All bids are final. Once you place a bid and payment is confirmed, it cannot be refunded or transferred</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#0F3460]">•</span>
                  <span><span className="font-semibold">Multiple Listings:</span> You can create multiple listings for different products</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#0F3460]">•</span>
                  <span><span className="font-semibold">Payment Methods:</span> We accept payments via JazzCash, EasyPaisa, and other secure payment providers</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#0F3460]">•</span>
                  <span><span className="font-semibold">Tax Responsibility:</span> You are responsible for any applicable taxes or fees in your jurisdiction</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Listing Requirements & Content Policy</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <p className="font-semibold mb-2">Your listing must:</p>
                  <ul className="space-y-2 ml-4">
                    <li>• Have a valid, working URL</li>
                    <li>• Represent a real product or service</li>
                    <li>• Have an accurate title and description</li>
                    <li>• Be in the correct category</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mb-2">Prohibited content includes:</p>
                  <ul className="space-y-2 ml-4">
                    <li>• Chat links (Discord, Telegram, WhatsApp, etc.)</li>
                    <li>• Adult or NSFW content</li>
                    <li>• URL shorteners (use direct links only)</li>
                    <li>• Phishing or malicious content</li>
                    <li>• Spam or scams</li>
                    <li>• Counterfeit products</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Rankings & Leaderboards</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#0F3460]">•</span>
                  <span><span className="font-semibold">All-Time Rankings:</span> Based on your total cumulative bids across all payments</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#0F3460]">•</span>
                  <span><span className="font-semibold">Daily Rankings:</span> Based on bids placed in the current UTC day (resets at midnight)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#0F3460]">•</span>
                  <span><span className="font-semibold">Ranking Calculation:</span> Simple and transparent—higher bid = higher rank. Ties are broken by earliest bid timestamp</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#0F3460]">•</span>
                  <span><span className="font-semibold">Click Tracking:</span> We track how many times your listing is clicked. View this data on your listing</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. User Rights & Responsibilities</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#0F3460]">•</span>
                  <span><span className="font-semibold">You own your content:</span> By listing on RankBid, you confirm you have the right to represent this product</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#0F3460]">•</span>
                  <span><span className="font-semibold">We can display your content:</span> We may display your listing title, description, and URL on our platform and in promotional materials</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#0F3460]">•</span>
                  <span><span className="font-semibold">No guarantee of results:</span> Payment does not guarantee sales, users, or traffic—rankings are determined purely by bid amount</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#0F3460]">•</span>
                  <span><span className="font-semibold">Respect other users:</span> No spam, manipulation, or abuse toward other listings or users</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Removal & Bans</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to remove any listing or ban any user without refund if they:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="font-bold text-red-600">×</span>
                  <span>Violate our content policy or community guidelines</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-red-600">×</span>
                  <span>Attempt to manipulate rankings through fraud or abuse</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-red-600">×</span>
                  <span>Use fake or misleading information</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-red-600">×</span>
                  <span>Engage in illegal activities</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                RankBid is provided "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages. Your total liability is limited to the amount you paid for your bids. We do not guarantee uptime, accuracy, or results from your listings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update these terms at any time. Changes are effective immediately upon posting. Your continued use of RankBid constitutes acceptance of updated terms. We recommend reviewing this page periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about these Terms of Service or need support:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>Email: <a href="mailto:support@rankbid.com" className="text-[#0F3460] font-semibold hover:underline">support@rankbid.com</a></li>
                <li>Visit our <a href="/rules" className="text-[#0F3460] font-semibold hover:underline">Rules & Guidelines</a></li>
              </ul>
            </section>

            <section className="bg-[#0F3460]/5 border border-[#0F3460]/20 rounded-lg p-6 mt-12">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Agreement</h3>
              <p className="text-gray-700">
                By creating a listing on RankBid, you agree to these Terms of Service. If you do not agree, please do not use our platform. Thank you for being part of the RankBid community!
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
