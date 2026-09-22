'use client';

import Link from 'next/link';
import { X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export default function LoginModal({ isOpen, onClose, title = 'Login Required' }: LoginModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-black text-gray-900 mb-2">{title}</h2>

        {/* Message */}
        <p className="text-gray-600 mb-8">
          You need to be logged in to submit your product and vote.
        </p>

        {/* Buttons */}
        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors text-center"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="block w-full px-6 py-3 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-center"
          >
            Create Account
          </Link>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-xs text-gray-500 font-semibold">OR</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-6 py-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
}
