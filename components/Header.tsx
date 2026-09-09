'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, Moon, Sun, Menu, X, Grid3x3, Trophy, Sparkles, LineChart, Users, Zap, Palette, Bitcoin, MoreHorizontal } from 'lucide-react';

const CATEGORIES = [
  { name: 'All', Icon: Grid3x3 },
  { name: 'Leaderboards', Icon: Trophy },
  { name: 'AI', Icon: Sparkles },
  { name: 'Marketing', Icon: LineChart },
  { name: 'Productivity', Icon: Zap },
  { name: 'Agents', Icon: Users },
  { name: 'Crypto', Icon: Bitcoin },
  { name: 'Design', Icon: Palette },
  { name: 'Developer', Icon: MoreHorizontal },
  { name: 'Explore', Icon: MoreHorizontal }
];

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
      <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
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
                <span className="text-xl font-black text-gray-900 dark:text-white">rankbid</span>
              </Link>
            </div>

            {/* Stats Pill - Desktop */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                  73 online
                </span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">1,528,484 visitors</span>
                <span className="text-gray-400">·</span>
                <Link href="/stats" className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-semibold">
                  stats→
                </Link>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
              {/* Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-8">
                <Link href="/daily" className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  Daily
                </Link>
                <Link href="/categories" className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  Categories
                </Link>
                <Link href="/about" className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  About
                </Link>
                <Link href="/rules" className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  Rules
                </Link>
              </nav>

              {/* Search */}
              <button
                onClick={() => {
                  const query = prompt('Search products...');
                  if (query?.trim()) {
                    window.location.href = `/search?q=${encodeURIComponent(query)}`;
                  }
                }}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Dark Mode */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
              <Link href="/daily" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-orange-600">
                Daily
              </Link>
              <Link href="/categories" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-orange-600">
                Categories
              </Link>
              <Link href="/about" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-orange-600">
                About
              </Link>
              <Link href="/rules" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-orange-600">
                Rules
              </Link>
              <Link href="/leaderboard" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-orange-600">
                Leaderboard
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Category Filter */}
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-16 z-30 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-6 py-4 flex gap-2 items-center">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.Icon;
            const isAll = cat.name === 'All';
            const isExplore = cat.name === 'Explore';
            
            return (
              <Link
                key={cat.name}
                href="/categories"
                className={`flex-shrink-0 px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                  isAll
                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm'
                    : isExplore
                    ? 'text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-bold'
                    : 'text-gray-800 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400'
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
