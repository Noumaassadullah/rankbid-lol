'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, Moon, Sun, Menu, X, BarChart3, Trophy, Brain, Cloud, Megaphone, Code2, Bitcoin, Palette, Compass } from 'lucide-react';

const CATEGORIES = [
  { name: 'All', Icon: BarChart3 },
  { name: 'Leaderboards', Icon: Trophy },
  { name: 'AI', Icon: Brain },
  { name: 'SaaS', Icon: Cloud },
  { name: 'Marketing', Icon: Megaphone },
  { name: 'Developer', Icon: Code2 },
  { name: 'Crypto', Icon: Bitcoin },
  { name: 'Design', Icon: Palette },
  { name: 'Explore', Icon: Compass }
];

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <>
      {/* Top Header */}
      <header className="bg-gradient-to-r from-white to-orange-50 dark:from-gray-900 dark:to-gray-800 border-b border-orange-200 dark:border-orange-900/30 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          {/* Main Header */}
          <div className="flex items-center justify-between h-16">
            {/* Logo & Hamburger */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-gray-900 dark:text-white"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xl font-bold text-gray-900 dark:text-white">rankbid</span>
              </Link>
            </div>

            {/* Stats Pill - Desktop */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full px-4 py-2 text-sm flex items-center gap-3">
                <span className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                  <strong>73 online</strong>
                  <span className="text-gray-600 dark:text-gray-400">·</span>
                  <strong>1,528,484 visitors</strong>
                  <span className="text-gray-600 dark:text-gray-400">·</span>
                  <Link href="/stats" className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-semibold">
                    stats→
                  </Link>
                </span>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <button
                onClick={() => {
                  const query = prompt('Search products...');
                  if (query?.trim()) {
                    window.location.href = `/search?q=${encodeURIComponent(query)}`;
                  }
                }}
                className="p-2 text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Dark Mode */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-8">
                <Link href="/daily" className="text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  Daily
                </Link>
                <Link href="/categories" className="text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  Categories
                </Link>
                <Link href="/about" className="text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  About
                </Link>
                <Link href="/rules" className="text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  Rules
                </Link>
              </nav>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="lg:hidden py-4 border-t border-orange-200 dark:border-orange-900/30 space-y-4 bg-orange-50 dark:bg-gray-800">
              <Link href="/daily" className="block text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-600">
                Daily
              </Link>
              <Link href="/categories" className="block text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-600">
                Categories
              </Link>
              <Link href="/about" className="block text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-600">
                About
              </Link>
              <Link href="/rules" className="block text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-600">
                Rules
              </Link>
              <Link href="/leaderboard" className="block text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-600">
                Leaderboard
              </Link>
              <Link href="/dashboard" className="block text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-600">
                Dashboard
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Category Filter */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-gray-800 dark:to-gray-800/50 border-b border-orange-200 dark:border-orange-900/30 sticky top-16 z-30 overflow-x-auto shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex gap-3 items-center">
          {CATEGORIES.map((cat) => {
            const Icon = cat.Icon;
            return (
              <Link
                key={cat.name}
                href="/categories"
                className={`flex-shrink-0 px-5 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all flex items-center gap-2 border backdrop-blur-sm ${
                  cat.name === 'All'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-700 hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg'
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-orange-300 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-gray-600 hover:border-orange-500 dark:hover:border-orange-600 shadow-sm'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
