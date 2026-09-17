'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface CheckoutConfirmationProps {
  isOpen: boolean;
  rank: number;
  amount: string;
  amountInPKR: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CheckoutConfirmation({
  isOpen,
  rank,
  amount,
  amountInPKR,
  onConfirm,
  onCancel,
  isLoading = false,
}: CheckoutConfirmationProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl font-black text-white">#{rank}</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              Claim Rank #{rank}
            </h2>
          </div>

          {/* Amount Breakdown */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6 mb-8">
            <p className="text-sm text-gray-600 mb-2">Amount Due</p>
            <p className="text-4xl font-black text-orange-600 mb-2">
              {amount}
            </p>
            <p className="text-sm text-gray-600">
              {amountInPKR}
            </p>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">✓ Transparent pricing</span> — No hidden fees
            </p>
            <p className="text-sm text-blue-900 mt-2">
              <span className="font-semibold">✓ Instant activation</span> — Your rank updates immediately after payment
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-900 font-bold rounded-lg hover:border-gray-400 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Processing...
                </>
              ) : (
                'Proceed to Payment'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
