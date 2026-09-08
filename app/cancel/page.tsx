'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function CancelPage() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listing_id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <div className="text-8xl mb-4">✕</div>
          <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-4">
            Payment Cancelled
          </h1>
          <p className="text-2xl font-bold text-gray-700 mb-4">
            Your payment was not processed
          </p>
          <p className="text-lg font-bold text-gray-600">
            Don't worry, you can try again anytime. Your listing information has been saved.
          </p>
        </div>

        <div className="bg-red-50 border-4 border-red-500 rounded-2xl p-8 mb-12">
          <h3 className="text-2xl font-black text-gray-900 mb-4">What happened?</h3>
          <ul className="text-left space-y-3 font-bold text-gray-700">
            <li>✓ Your listing information was saved</li>
            <li>✓ No payment was charged to your account</li>
            <li>✓ You can try again with a different payment method</li>
            <li>✓ Your listing won't appear on the leaderboard until payment is completed</li>
          </ul>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="block px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-black border-4 border-purple-600 hover:shadow-lg hover:shadow-purple-600/50 transition-all hover:scale-105 text-lg rounded-2xl"
          >
            Try Again
          </Link>

          <Link
            href="/"
            className="block px-8 py-4 bg-white text-gray-900 font-black border-4 border-gray-300 hover:bg-gray-50 transition-all text-lg rounded-2xl"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
