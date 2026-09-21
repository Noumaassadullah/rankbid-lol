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
      {/* Top Header - Neo-Brutalism */}
      <header className="bg-white text-[#18181B] border-b-4 border-[#18181B] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          {/* Main Header */}
          <div className="flex items-center justify-between h-16">
            {/* Logo & Hamburger */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-[#18181B] hover:bg-[#FFFFFF] hover:text-[#18181B] transition-colors"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                <span className="text-2xl font-black text-[#18181B] uppercase tracking-wider">RANKBID</span>
              </Link>
            </div>

            {/* Stats Pill - Neo style */}
            <div className="hidden md:flex items-center gap-6 px-6 py-3 bg-[#FFFFFF] text-[#18181B] border-2 border-[#18181B] font-black">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#86EFAC] rounded-full animate-pulse"></span>
                <span>{stats.onlineNow} LIVE</span>
              </div>
              <span>•</span>
              <span>{stats.allTimeVisitors}K VIEWS</span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-6">
                <Link href="/daily" className="text-sm font-black uppercase tracking-wider hover:border-b-2 hover:border-[#18181B] transition-all">
                  Daily
                </Link>
                <Link href="/archive" className="text-sm font-black uppercase tracking-wider hover:border-b-2 hover:border-[#18181B] transition-all">
                  Archive
                </Link>
                <Link href="/categories" className="text-sm font-black uppercase tracking-wider hover:border-b-2 hover:border-[#18181B] transition-all">
                  Categories
                </Link>
                <Link href="/about" className="text-sm font-black uppercase tracking-wider hover:border-b-2 hover:border-[#18181B] transition-all">
                  About
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
                className="p-2 text-[#18181B] hover:bg-[#FFFFFF] hover:text-[#18181B] transition-colors border-2 border-transparent hover:border-[#18181B]"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-[#18181B] hover:bg-[#FFFFFF] hover:text-[#18181B] transition-colors border-2 border-transparent hover:border-[#18181B]"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="lg:hidden py-6 border-t-2 border-[#18181B] space-y-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-[#FFFFFF] text-[#18181B] font-black text-sm border-2 border-[#18181B]">
                <span className="w-2 h-2 bg-[#86EFAC] rounded-full animate-pulse"></span>
                <span>{stats.onlineNow} LIVE • {stats.allTimeVisitors}K VIEWS</span>
              </div>

              <Link href="/daily" className="block text-sm font-black uppercase tracking-wider hover:pl-2 transition-all">
                Daily
              </Link>
              <Link href="/archive" className="block text-sm font-black uppercase tracking-wider hover:pl-2 transition-all">
                Archive
              </Link>
              <Link href="/categories" className="block text-sm font-black uppercase tracking-wider hover:pl-2 transition-all">
                Categories
              </Link>
              <Link href="/about" className="block text-sm font-black uppercase tracking-wider hover:pl-2 transition-all">
                About
              </Link>
              <Link href="/stats" className="block text-sm font-black uppercase tracking-wider hover:pl-2 transition-all">
                Stats
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Category Filter - Neo-Brutalism */}
      <div className="bg-[#F5F5F5] text-[#18181B] border-b-3 border-[#18181B] sticky top-16 z-30 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-3 items-center">
          {CATEGORIES.map((cat) => {
            const Icon = cat.Icon;
            const isAll = cat.name === 'All';

            return (
              <Link
                key={cat.name}
                href="/categories"
                className={`flex-shrink-0 px-3 py-2 font-black text-xs uppercase tracking-wider border-3 whitespace-nowrap transition-all flex items-center gap-2 ${
                  isAll
                    ? 'bg-[#FFB28F] text-[#18181B] border-[#18181B]'
                    : 'bg-white text-[#18181B] border-[#18181B] hover:bg-[#FFB28F]'
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
