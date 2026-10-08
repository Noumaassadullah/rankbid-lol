'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { SUPPORT_EMAIL } from '@/lib/site';

const errorMessages: { [key: string]: string } = {
  invalid_payment: 'The payment information was invalid.',
  payment_not_found: 'The payment could not be found in our system.',
  payment_failed: 'Your payment was declined or cancelled.',
  processing_error: 'An error occurred while processing your payment. Please try again.',
};

function PaymentError() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'unknown';
  const message = errorMessages[reason] || 'An error occurred while processing your payment.';

  return (
    <div className="bg-gray-50 min-h-[70vh] px-3 sm:px-4 py-10 sm:py-16">
      <div className="max-w-lg mx-auto slide-up">
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 sm:p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1F2937] mb-2">Payment Failed</h1>
          <p className="text-sm sm:text-base text-[#1F2937]/70 mb-1">{message}</p>
          <p className="text-xs text-[#1F2937]/40 mb-6">Error code: {reason}</p>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
            <Link href="/" className="px-5 py-2.5 bg-[#0F3460] text-white font-black text-sm rounded-lg hover:bg-[#0D2A50] active:scale-95 transition-all">
              Try Again
            </Link>
            <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Payment issue (${reason})`)}`} className="px-5 py-2.5 bg-white text-[#0F3460] border border-gray-200 font-black text-sm rounded-lg hover:border-[#0F3460]/40 active:scale-95 transition-all">
              Contact Support
            </a>
          </div>
        </div>

        <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
          <h2 className="text-sm font-black text-[#1F2937] mb-3">Troubleshooting</h2>
          <ul className="text-xs sm:text-sm text-[#1F2937]/70 space-y-2 list-disc pl-5">
            <li>Check you have enough balance in your card, JazzCash or EasyPaisa account</li>
            <li>Make sure your internet connection is stable</li>
            <li>Try a different payment method</li>
            <li>Still stuck? Email us and include the error code above</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="bg-gray-50 min-h-[70vh]" />}>
        <PaymentError />
      </Suspense>
    </>
  );
}
