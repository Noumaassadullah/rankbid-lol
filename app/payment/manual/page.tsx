'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ManualPaymentPage() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState('');

  const amount = searchParams.get('amount') || '0';
  const listingId = searchParams.get('listingId') || '';
  const reference = searchParams.get('ref') || `REF-${Date.now()}`;

  const accountName = 'RANKBID PAYMENTS';
  const accountNumber = process.env.NEXT_PUBLIC_JAZZCASH_ACCOUNT || '03001234567';
  const bankName = 'JazzCash';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const amountInPKR = (parseInt(amount) / 100).toFixed(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
            COMPLETE YOUR PAYMENT
          </h1>
          <p className="text-lg font-bold text-gray-600">
            Make payment to the account below to activate your listing
          </p>
        </div>

        {/* Payment Card */}
        <div className="bg-white border-4 border-purple-600 rounded-3xl p-8 md:p-12 shadow-2xl mb-8">
          {/* Amount Section */}
          <div className="bg-gradient-to-r from-orange-50 to-purple-50 border-4 border-orange-300 rounded-2xl p-8 mb-8">
            <p className="text-sm font-black text-gray-600 uppercase mb-2">Amount to Pay</p>
            <div className="text-5xl md:text-6xl font-black text-orange-600 mb-2">
              PKR {parseInt(amountInPKR).toLocaleString()}
            </div>
            <p className="text-sm font-bold text-gray-500">Reference: {reference}</p>
          </div>

          {/* Account Details */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 mb-4">Payment Details</h2>

            {/* Account Holder */}
            <div className="border-4 border-gray-200 rounded-2xl p-6 hover:border-orange-500 transition-all">
              <p className="text-xs font-black text-gray-500 uppercase mb-2">Account Holder Name</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-black text-gray-900">{accountName}</p>
                <button
                  onClick={() => copyToClipboard(accountName, 'Account Name')}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    copied === 'Account Name'
                      ? 'bg-green-500 text-white'
                      : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                  }`}
                >
                  {copied === 'Account Name' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Account Number */}
            <div className="border-4 border-gray-200 rounded-2xl p-6 hover:border-orange-500 transition-all">
              <p className="text-xs font-black text-gray-500 uppercase mb-2">{bankName} Account Number</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl md:text-3xl font-black text-gray-900 font-mono">{accountNumber}</p>
                <button
                  onClick={() => copyToClipboard(accountNumber, 'Account Number')}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    copied === 'Account Number'
                      ? 'bg-green-500 text-white'
                      : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                  }`}
                >
                  {copied === 'Account Number' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Reference Number */}
            <div className="border-4 border-gray-200 rounded-2xl p-6 hover:border-orange-500 transition-all">
              <p className="text-xs font-black text-gray-500 uppercase mb-2">Payment Reference (Important)</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-black text-gray-900 font-mono">{reference}</p>
                <button
                  onClick={() => copyToClipboard(reference, 'Reference')}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    copied === 'Reference'
                      ? 'bg-green-500 text-white'
                      : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                  }`}
                >
                  {copied === 'Reference' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-orange-50 border-4 border-orange-300 rounded-2xl p-8 mb-8">
          <h3 className="text-2xl font-black text-gray-900 mb-6">How to Pay</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-orange-600 text-white font-black">
                  1
                </div>
              </div>
              <div>
                <p className="font-black text-gray-900">Open JazzCash App or Dial *117#</p>
                <p className="text-sm font-bold text-gray-600 mt-1">Use your JazzCash wallet to send money</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-orange-600 text-white font-black">
                  2
                </div>
              </div>
              <div>
                <p className="font-black text-gray-900">Enter the Account Number</p>
                <p className="text-sm font-bold text-gray-600 mt-1">Copy and paste the account number above</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-orange-600 text-white font-black">
                  3
                </div>
              </div>
              <div>
                <p className="font-black text-gray-900">Enter Amount: PKR {parseInt(amountInPKR).toLocaleString()}</p>
                <p className="text-sm font-bold text-gray-600 mt-1">Make sure the amount matches exactly</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-orange-600 text-white font-black">
                  4
                </div>
              </div>
              <div>
                <p className="font-black text-gray-900">Enter Reference Number as Message</p>
                <p className="text-sm font-bold text-gray-600 mt-1">Use: {reference}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-orange-600 text-white font-black">
                  5
                </div>
              </div>
              <div>
                <p className="font-black text-gray-900">Confirm & Complete Payment</p>
                <p className="text-sm font-bold text-gray-600 mt-1">Your listing will be activated within 5 minutes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border-4 border-yellow-400 rounded-2xl p-6 mb-8">
          <div className="flex gap-4">
            <div className="text-3xl flex-shrink-0">⚠️</div>
            <div>
              <p className="font-black text-gray-900 mb-2">Important:</p>
              <p className="text-sm font-bold text-gray-700">
                Always include the reference number in your payment message. Your listing will only be activated when payment is received with the correct reference.
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <a
            href="/"
            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white border-4 border-purple-600 font-black hover:shadow-lg hover:shadow-purple-600/50 transition-all hover:scale-105 rounded-2xl"
          >
            ← Back to Leaderboard
          </a>
        </div>

        {/* Support */}
        <div className="text-center mt-12">
          <p className="text-sm font-bold text-gray-600">
            Need help? Contact support at{' '}
            <a href="mailto:support@rankbid.lol" className="text-purple-600 font-black hover:underline">
              support@rankbid.lol
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
