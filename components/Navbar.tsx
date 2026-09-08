'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-4 border-orange-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-purple-600 rounded-lg font-black text-white flex items-center justify-center text-lg">
              ⚡
            </div>
            <span className="text-2xl font-black text-gray-900 hidden sm:block">outbid.lol</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            <Link href="/" className="font-black text-gray-900 hover:text-orange-600 transition-colors">
              Home
            </Link>
            <Link href="/today" className="font-black text-gray-900 hover:text-orange-600 transition-colors">
              🔥 Today
            </Link>
            <Link href="/categories" className="font-black text-gray-900 hover:text-orange-600 transition-colors">
              Categories
            </Link>
            <Link href="/about" className="font-black text-gray-900 hover:text-orange-600 transition-colors">
              About
            </Link>
            <Link href="/rules" className="font-black text-gray-900 hover:text-orange-600 transition-colors">
              Rules
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              href="/#claim"
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black rounded-xl hover:shadow-lg hover:shadow-orange-600/50 transition-all hover:scale-105"
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
          <div className="lg:hidden pt-4 pb-4 space-y-3 border-t-4 border-orange-600 mt-4">
            <Link href="/" className="block font-black text-gray-900 hover:text-orange-600 transition-colors py-2">
              Home
            </Link>
            <Link href="/today" className="block font-black text-gray-900 hover:text-orange-600 transition-colors py-2">
              🔥 Today
            </Link>
            <Link href="/categories" className="block font-black text-gray-900 hover:text-orange-600 transition-colors py-2">
              Categories
            </Link>
            <Link href="/about" className="block font-black text-gray-900 hover:text-orange-600 transition-colors py-2">
              About
            </Link>
            <Link href="/rules" className="block font-black text-gray-900 hover:text-orange-600 transition-colors py-2">
              Rules
            </Link>
            <Link
              href="/#claim"
              className="block px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black rounded-xl text-center hover:shadow-lg hover:shadow-orange-600/50 transition-all mt-4"
            >
              Claim Rank
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}