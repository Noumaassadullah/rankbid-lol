'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg font-black text-white flex items-center justify-center text-lg">
              ⚡
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">rankbid</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-sm font-semibold text-gray-900 hover:text-orange-600 transition-colors">
              Home
            </Link>
            <Link href="/today" className="text-sm font-semibold text-gray-900 hover:text-orange-600 transition-colors flex items-center gap-1">
              <span>🔥</span> Today
            </Link>
            <Link href="/categories" className="text-sm font-semibold text-gray-900 hover:text-orange-600 transition-colors">
              Categories
            </Link>
            <Link href="/about" className="text-sm font-semibold text-gray-900 hover:text-orange-600 transition-colors">
              About
            </Link>
            <Link href="/rules" className="text-sm font-semibold text-gray-900 hover:text-orange-600 transition-colors">
              Rules
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              href="/#claim"
              className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors text-sm"
            >
              Claim Rank
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-gray-900"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden pt-4 pb-4 space-y-2 border-t border-gray-200 mt-4">
            <Link href="/" className="block text-sm font-semibold text-gray-900 hover:text-orange-600 transition-colors py-2">
              Home
            </Link>
            <Link href="/today" className="block text-sm font-semibold text-gray-900 hover:text-orange-600 transition-colors py-2 flex items-center gap-1">
              <span>🔥</span> Today
            </Link>
            <Link href="/categories" className="block text-sm font-semibold text-gray-900 hover:text-orange-600 transition-colors py-2">
              Categories
            </Link>
            <Link href="/about" className="block text-sm font-semibold text-gray-900 hover:text-orange-600 transition-colors py-2">
              About
            </Link>
            <Link href="/rules" className="block text-sm font-semibold text-gray-900 hover:text-orange-600 transition-colors py-2">
              Rules
            </Link>
            <Link
              href="/#claim"
              className="block px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg text-center hover:bg-orange-700 transition-colors mt-4 text-sm"
            >
              Claim Rank
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}