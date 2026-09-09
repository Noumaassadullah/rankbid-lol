'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, Moon, Sun, Menu, X, BarChart3, Brain, Cloud, Code2, Megaphone, Zap, Palette, Bitcoin, Compass } from 'lucide-react';

const CATEGORIES = [
  { name: 'All', Icon: BarChart3 },
  { name: 'AI', Icon: Brain },
  { name: 'SaaS', Icon: Cloud },
  { name: 'Developer', Icon: Code2 },
  { name: 'Marketing', Icon: Megaphone },
  { name: 'Productivity', Icon: Zap },
  { name: 'Design', Icon: Palette },
  { name: 'Crypto', Icon: Bitcoin },
  { name: 'Explore', Icon: Compass }
];

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

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
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          {/* Main Header */}
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded font-bold text-white flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">rankbid</span>
            </Link>

            {/* Stats - Desktop */}
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="font-semibold">245 online</span>
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold">1,528,484</span>
                <span className="text-gray-500 dark:text-gray-400"> visitors</span>
              </div>
              <Link href="/stats" className="text-orange-600 hover:text-orange-700 font-semibold">
                stats →
              </Link>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Search - Desktop */}
              <div className="hidden lg:flex items-center">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                      }
                    }}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500 dark:placeholder-gray-400 w-48"
                  />
                  <button
                    onClick={() => {
                      if (searchQuery.trim()) {
                        window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                      }
                    }}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mobile Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-8">
                <Link href="/daily" className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  Daily
                </Link>
                <Link href="/leaderboard" className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  Leaderboard
                </Link>
                <Link href="/categories" className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  Categories
                </Link>
                <Link href="/about" className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  About
                </Link>
                <Link href="/dashboard" className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  Dashboard
                </Link>
              </nav>

              {/* Mobile Menu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-gray-600 dark:text-gray-400"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {searchOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-800">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                  }
                }}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-800 space-y-4">
              <Link href="/daily" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-orange-600">
                Daily
              </Link>
              <Link href="/leaderboard" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-orange-600">
                Leaderboard
              </Link>
              <Link href="/categories" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-orange-600">
                Categories
              </Link>
              <Link href="/about" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-orange-600">
                About
              </Link>
              <Link href="/dashboard" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-orange-600">
                Dashboard
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Category Filter */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-16 z-30 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.Icon;
            return (
              <Link
                key={cat.name}
                href="/categories"
                className={`flex-shrink-0 px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeCategory === cat.name
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveCategory(cat.name)}
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
