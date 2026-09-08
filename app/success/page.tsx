'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const listingId = searchParams.get('listing_id');
  const sessionId = searchParams.get('session_id');

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!listingId) {
      router.push('/');
      return;
    }

    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/listings/submit?url=${encodeURIComponent(listingId)}`);
        const data = await res.json();
        if (data.listing) {
          setListing(data.listing);
        }
      } catch (error) {
        console.error('Failed to fetch listing:', error);
      } finally {
        setLoading(false);
      }
    };

    setTimeout(() => fetchListing(), 2000);
  }, [listingId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-2xl font-black text-gray-900">Processing your payment...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center max-w-2xl px-4">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-5xl font-black text-gray-900 mb-4">Payment Processing</h1>
          <p className="text-xl font-bold text-gray-700 mb-8">
            Your payment has been received. Your listing will appear on the leaderboard shortly.
          </p>
          <Link href="/" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-black hover:shadow-lg transition-all">
            View Leaderboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="px-4 sm:px-6 py-8 border-b-4 border-green-500">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="text-sm font-black text-purple-600 hover:text-purple-700">
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Success Section */}
      <section className="px-4 sm:px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-20">
            <div className="text-8xl mb-6 animate-bounce">🎉</div>
            <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-6">
              Payment Successful!
            </h1>
            <p className="text-2xl font-bold text-gray-700 mb-4">
              Your listing is now live on the leaderboard
            </p>
          </div>

          {/* Listing Card */}
          <div className="bg-white border-8 border-green-500 rounded-3xl p-8 md:p-12 mb-12 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-4xl font-black text-gray-900 mb-4">{listing.title}</h2>
                <p className="text-lg font-bold text-gray-700 mb-6">{listing.description}</p>
                <div className="flex gap-4 mb-6">
                  <span className="px-4 py-2 bg-purple-100 text-purple-700 font-black rounded-lg">
                    {listing.category}
                  </span>
                  <span className="px-4 py-2 bg-green-100 text-green-700 font-black rounded-lg">
                    Live
                  </span>
                </div>
              </div>

              <div>
                <div className="bg-green-50 border-4 border-green-500 rounded-2xl p-6 mb-4">
                  <p className="text-sm font-bold text-gray-600 mb-2">Total Paid</p>
                  <p className="text-5xl font-black text-green-600">
                    ${(listing.totalPaid / 100).toFixed(2)}
                  </p>
                </div>

                <div className="bg-blue-50 border-4 border-blue-500 rounded-2xl p-6 mb-4">
                  <p className="text-sm font-bold text-gray-600 mb-2">Total Clicks</p>
                  <p className="text-5xl font-black text-blue-600">
                    {listing.clickCount}
                  </p>
                </div>

                <div className="bg-purple-50 border-4 border-purple-500 rounded-2xl p-6">
                  <p className="text-sm font-bold text-gray-600 mb-2">Direct Link</p>
                  <a
                    href={`/api/click?id=${listing.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-black text-purple-600 hover:text-purple-700 break-all"
                  >
                    Share →
                  </a>
                </div>
              </div>
            </div>

            {/* Sharing Section */}
            <div className="border-t-4 border-gray-200 pt-8">
              <h3 className="text-2xl font-black text-gray-900 mb-6">How to Share</h3>
              <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6 mb-6">
                <p className="text-sm font-bold text-gray-600 mb-3">Copy this link to share your listing:</p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/click?id=${listing.id}`}
                    readOnly
                    className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg font-mono text-sm font-bold"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${typeof window !== 'undefined' ? window.location.origin : ''}/api/click?id=${listing.id}`
                      );
                    }}
                    className="px-6 py-3 bg-orange-600 text-white font-black rounded-lg hover:bg-orange-700 transition-all"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="border-t-4 border-gray-200 pt-8 mt-8">
              <h3 className="text-2xl font-black text-gray-900 mb-6">Next Steps</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-purple-50 border-4 border-purple-600 rounded-xl p-6">
                  <div className="text-4xl mb-3">📊</div>
                  <h4 className="font-black text-gray-900 mb-2">Track Performance</h4>
                  <p className="text-sm font-bold text-gray-700">
                    Monitor clicks and ranking in real-time on the leaderboard
                  </p>
                </div>

                <div className="bg-orange-50 border-4 border-orange-600 rounded-xl p-6">
                  <div className="text-4xl mb-3">📈</div>
                  <h4 className="font-black text-gray-900 mb-2">Increase Bid</h4>
                  <p className="text-sm font-bold text-gray-700">
                    Bid more to climb higher and get more visibility
                  </p>
                </div>

                <div className="bg-green-50 border-4 border-green-600 rounded-xl p-6">
                  <div className="text-4xl mb-3">🚀</div>
                  <h4 className="font-black text-gray-900 mb-2">Drive Traffic</h4>
                  <p className="text-sm font-bold text-gray-700">
                    Share your link to get qualified traffic from makers
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-black border-4 border-purple-600 hover:shadow-lg hover:shadow-purple-600/50 transition-all hover:scale-105 text-lg"
            >
              View Full Leaderboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
