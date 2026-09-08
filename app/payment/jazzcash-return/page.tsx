'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function JazzCashReturnContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

  useEffect(() => {
    const responseCode = searchParams.get('pp_response_code');
    if (responseCode === '000') {
      setStatus('success');
    } else {
      setStatus('failed');
    }
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-4 text-6xl">⏳</div>
          <h1 className="text-4xl font-black text-gray-900 mb-4">Processing Payment</h1>
          <p className="text-lg font-bold text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          <div className="mb-4 text-6xl">🎉</div>
          <h1 className="text-5xl font-black text-green-600 mb-4">Payment Successful!</h1>
          <p className="text-xl font-bold text-gray-700 mb-8">
            Your listing has been updated with your bid. Check the leaderboard to see your new rank!
          </p>
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white border-4 border-orange-600 font-black hover:shadow-lg hover:shadow-orange-600/50 transition-all hover:scale-105"
            >
              VIEW LEADERBOARD →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-4 text-6xl">❌</div>
        <h1 className="text-5xl font-black text-red-600 mb-4">Payment Failed</h1>
        <p className="text-xl font-bold text-gray-700 mb-8">
          Unfortunately, your payment could not be processed. Please try again.
        </p>
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white border-4 border-purple-600 font-black hover:shadow-lg hover:shadow-purple-600/50 transition-all hover:scale-105"
          >
            TRY AGAIN
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function JazzCashReturn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JazzCashReturnContent />
    </Suspense>
  );
}
