'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const errorMessages: { [key: string]: string } = {
  invalid_payment: 'The payment information was invalid.',
  payment_not_found: 'The payment could not be found in our system.',
  payment_failed: 'Your payment was declined or cancelled.',
  processing_error: 'An error occurred while processing your payment. Please try again.',
};

export default function Error() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'unknown';
  const message = errorMessages[reason] || 'An error occurred while processing your payment.';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center">
      <div className="mb-8">
        <div className="text-6xl mb-4">✗</div>
        <h1 className="text-4xl font-bold mb-2">Payment Failed</h1>
        <p className="text-slate-600 dark:text-slate-400">{message}</p>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-6 mb-8">
        <p className="text-sm text-red-800 dark:text-red-200">
          <strong>Error Code:</strong> {reason}
        </p>
      </div>

      <div className="space-y-3 mb-8">
        <Link
          href="/"
          className="block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
        >
          Try Again
        </Link>

        <Link
          href="/rules"
          className="block px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          View Rules & FAQ
        </Link>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 text-left">
        <h3 className="font-bold mb-3">Troubleshooting</h3>
        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
          <li>• Check that you have sufficient balance in your JazzCash/EasyPaisa account</li>
          <li>• Verify your internet connection is stable</li>
          <li>• Try a different payment method if available</li>
          <li>• Contact support if the issue persists</li>
        </ul>
      </div>
    </div>
  );
}
