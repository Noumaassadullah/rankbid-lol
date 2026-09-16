'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, Moon, Sun, Menu, X, Grid3x3, Trophy, Sparkles, LineChart, Users, Zap, Palette, Bitcoin, MoreHorizontal, Activity, Eye, TrendingUp } from 'lucide-react';

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
  const [stats, setStats] = useState({ onlineNow: 12, allTimeVisitors: 847 }); // Fallback values
  const [mounted, setMounted] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || (savedTheme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Update dark mode class and localStorage when darkMode changes
  useEffect(() => {
    if (!mounted) return;
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode, mounted]);

  // Fetch stats and track visitor
  useEffect(() => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('rankbid_session_id', sessionId);

    const trackVisitor = async () => {
      try {
        // Track this visit
        const trackRes = await fetch('/api/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            pageUrl: window.location.pathname,
          }),
        });

        // Fetch real-time stats
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        // Silently fail - don't break the app if stats tracking fails
        console.debug('Stats tracking unavailable');
      }
    };

    trackVisitor();

    // Update stats every 30 seconds
    const interval = setInterval(trackVisitor, 30000);
    return () => clearInterval(interval);
  }, []);

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

            {/* Stats Pill */}
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-full border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-4 text-sm">
                {/* Live Users */}
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-orange-100">
                    {stats.onlineNow} online
                  </span>
                </div>

                {/* Divider */}
                <span className="text-gray-300 dark:text-orange-700">·</span>

                {/* Total Visitors */}
                <div className="hidden sm:flex items-center gap-2">
                  <Eye size={14} className="text-orange-600 dark:text-orange-400" />
                  <span className="font-bold text-gray-900 dark:text-orange-100">
                    {stats.allTimeVisitors > 0
                      ? stats.allTimeVisitors > 1000
                        ? `${(stats.allTimeVisitors / 1000).toFixed(1)}K visitors`
                        : `${stats.allTimeVisitors} visitors`
                      : '0 visitors'}
                  </span>
                </div>

                {/* Divider */}
                <span className="hidden sm:block text-gray-300 dark:text-orange-700">·</span>

                {/* Stats Link */}
                <Link
                  href="/stats"
                  className="hidden sm:flex items-center gap-1 text-orange-600 dark:text-orange-300 hover:text-orange-700 dark:hover:text-orange-200 font-bold transition-colors whitespace-nowrap"
                >
                  <TrendingUp size={14} />
                  stats
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
            <div className="sm:hidden py-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
              {/* Mobile Stats */}
              <div className="flex items-center gap-2 px-2 py-2 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="absolute inset-0 w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
                  </span>
                  <span className="font-bold text-gray-900 dark:text-orange-100">{stats.onlineNow} online</span>
                </div>
                <span className="text-gray-300">·</span>
                <span className="font-bold text-gray-900 dark:text-orange-100">
                  {stats.allTimeVisitors > 1000
                    ? `${(stats.allTimeVisitors / 1000).toFixed(1)}K visits`
                    : `${stats.allTimeVisitors} visits`}
                </span>
              </div>

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
              <Link href="/stats" className="block text-sm font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700">
                Stats
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
