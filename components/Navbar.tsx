'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name?: string;
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, []);

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

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link
                href="/profile"
                className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm hover:shadow-md transition-all"
                title={user.name || user.email}
              >
                {(user.name || user.email).charAt(0).toUpperCase()}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-900 font-semibold hover:text-orange-600 transition-colors text-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors text-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
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

            {/* Mobile Auth */}
            {user ? (
              <div className="border-t border-gray-200 mt-4 pt-4">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-gray-900 hover:bg-gray-100 transition-colors text-sm rounded"
                >
                  <User className="w-4 h-4" />
                  My Profile
                </Link>
              </div>
            ) : (
              <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                <Link
                  href="/login"
                  className="block px-4 py-2 text-gray-900 hover:bg-gray-100 transition-colors text-sm text-center rounded"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block px-4 py-2 bg-orange-600 text-white font-semibold text-center rounded hover:bg-orange-700 transition-colors text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}