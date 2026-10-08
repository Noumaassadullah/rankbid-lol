'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { IconTile, PremiumIcons } from '@/components/PremiumIcons';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const txnRef = searchParams.get('txn_ref');
  const listingId = searchParams.get('listing_id');
  const position = searchParams.get('position');
  const amount = searchParams.get('amount');

  useEffect(() => {
    // Simulate a brief loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-[#0F3460] border-t-transparent animate-spin" />
            <p className="text-base sm:text-lg font-black text-[#1F2937]">Processing your payment…</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
    <Header />
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
      <div className="max-w-2xl w-full slide-up">
        {/* Success Card */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#059669] to-[#10B981] p-6 sm:p-8 text-center text-white">
            <div className="text-5xl sm:text-6xl mb-4 animate-bounce">✅</div>
            <h1 className="text-2xl sm:text-4xl font-black mb-2">Payment Successful!</h1>
            <p className="text-sm sm:text-lg opacity-90">Your premium listing is now active</p>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-8 space-y-6 sm:space-y-8">
            {/* Transaction Details */}
            <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
              <h2 className="text-xl font-black text-gray-900 mb-4">📋 Transaction Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-300">
                  <span className="font-bold text-gray-700">Transaction ID:</span>
                  <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded text-gray-900">{txnRef}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-300">
                  <span className="font-bold text-gray-700">Position:</span>
                  <span className="text-2xl font-black text-orange-600">#{position}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-300">
                  <span className="font-bold text-gray-700">Amount Paid:</span>
                  <span className="text-xl font-black text-green-600">${amount}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-bold text-gray-700">Status:</span>
                  <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold">
                    <span className="w-2 h-2 bg-green-700 rounded-full"></span>
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-300">
              <h2 className="text-lg font-black text-gray-900 mb-4">🎯 What's Next?</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">📧</span>
                  <div>
                    <p className="font-bold text-gray-900">Check your email</p>
                    <p className="text-sm text-gray-600">A confirmation has been sent to your registered email address</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">🏆</span>
                  <div>
                    <p className="font-bold text-gray-900">Your listing is now live</p>
                    <p className="text-sm text-gray-600">Featured at position #{position} with your founder information displayed</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">📊</span>
                  <div>
                    <p className="font-bold text-gray-900">Monitor your ranking</p>
                    <p className="text-sm text-gray-600">Your product can move in the rankings based on community votes</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">⏰</span>
                  <div>
                    <p className="font-bold text-gray-900">Premium duration</p>
                    <p className="text-sm text-gray-600">Your premium listing is valid for 30 days from today</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-50 rounded-lg p-6 border-2 border-yellow-300">
              <h3 className="font-black text-gray-900 mb-3">⚠️ Important</h3>
              <ul className="text-sm text-gray-700 space-y-3">
                <li className="flex items-start gap-2"><IconTile size="sm" tone="green"><PremiumIcons.Bolt className="w-4 h-4" /></IconTile><span className="pt-1">Your premium listing is active immediately</span></li>
                <li className="flex items-start gap-2"><IconTile size="sm" tone="green"><PremiumIcons.Shield className="w-4 h-4" /></IconTile><span className="pt-1">The position # is your guaranteed minimum placement</span></li>
                <li className="flex items-start gap-2"><IconTile size="sm" tone="green"><PremiumIcons.Trophy className="w-4 h-4" /></IconTile><span className="pt-1">Votes can move your listing higher in the rankings</span></li>
                <li className="flex items-start gap-2"><IconTile size="sm" tone="green"><PremiumIcons.Calendar className="w-4 h-4" /></IconTile><span className="pt-1">After 30 days, your listing returns to the regular voting system</span></li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-6 border-t border-gray-200">
              <Link
                href="/"
                className="w-full px-6 py-4 bg-[#0F3460] text-white font-black rounded-lg hover:bg-[#0D2A50] active:scale-95 transition-all duration-200 text-center shadow-lg border-2 border-[#0F3460]"
              >
                🏠 Back to Leaderboard
              </Link>
              <Link
                href="/profile"
                className="w-full px-6 py-4 bg-white text-gray-900 font-black rounded-lg hover:bg-gray-100 active:scale-95 transition-all duration-200 text-center border-2 border-gray-400"
              >
                📊 View My Listings
              </Link>
            </div>

            {/* Transaction ID for Support */}
            <div className="text-center py-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 font-mono">
                Keep this transaction ID for your records: <strong>{txnRef}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
