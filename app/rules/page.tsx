'use client';

import Header from '@/components/Header';

export default function RulesPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-12">Rules & Guidelines</h1>

          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Listing Requirements</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Your product must have a working, live URL</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Provide an accurate product title and description</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Select the correct category for your product</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>No spam, malware, or misleading content</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Bidding Rules</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Minimum bid is PKR 2,800 (~$10 USD)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Use the "Boost" feature to add funds to your existing listing without creating a new one</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Rankings update in real-time based on bids</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Daily rankings reset at midnight UTC - view historical rankings in Archive</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Banned Content</h2>
              <p className="text-gray-700 mb-4">The following types of content are strictly prohibited and will result in immediate removal:</p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold">×</span>
                  <span>Chat/messaging links (Discord, Telegram, WhatsApp groups, etc.)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold">×</span>
                  <span>Adult or NSFW content</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold">×</span>
                  <span>URL shorteners (bit.ly, TinyURL, etc.) - use direct links only</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold">×</span>
                  <span>Affiliate links without proper disclosure</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold">×</span>
                  <span>Phishing or malicious content</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold">×</span>
                  <span>Spam or cryptocurrency schemes</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Prohibited Activities</h2>
              <p className="text-gray-700 mb-4">We reserve the right to remove listings and ban accounts for:</p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold">×</span>
                  <span>Fake products or misleading content</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold">×</span>
                  <span>Hate speech, harassment, or inappropriate content</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold">×</span>
                  <span>Abusive or exploitative behavior</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold">×</span>
                  <span>Attempting to manipulate rankings artificially</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold">×</span>
                  <span>Illegal products or services</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment & Refunds</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>All bids are final and non-refundable</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>We accept secure payments via JazzCash and other providers</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>You can verify all transactions on your account page</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ranking Policy</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Rankings are based purely on total amount bid</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>View all-time and daily rankings separately</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Tied bids are ranked by earliest bid timestamp</span>
                </li>
              </ul>
            </section>

            <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Questions?</h3>
              <p className="text-gray-700">
                For support or to report a violation, please contact us at{' '}
                <a href="mailto:support@rankbid.com" className="text-orange-600 font-semibold hover:underline">
                  support@rankbid.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
