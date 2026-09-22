'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Moon, Sun, Menu, X, Grid3x3, Trophy, Sparkles, LineChart, Users, Zap, Palette, Bitcoin, MoreHorizontal, Activity, Eye, TrendingUp, LogOut } from 'lucide-react';

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
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stats, setStats] = useState({ onlineNow: 12, allTimeVisitors: 847 }); // Fallback values
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string; name?: string } | null>(null);

  // Initialize dark mode and check user login from localStorage
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

    // Check if user is logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user');
      }
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    setUser(null);
    router.push('/');
  };

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
      {/* Top Header - Professional Corporate */}
      <header className="bg-white text-[#1F2937] shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 md:px-6">
          {/* Main Header */}
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo & Hamburger */}
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-[#1F2937] hover:bg-gray-100 transition-colors rounded-lg"
              >
                {mobileOpen ? <X className="w-5 h-5 md:w-6 md:h-6" /> : <Menu className="w-5 h-5 md:w-6 md:h-6" />}
              </button>
              <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                <span className="text-lg md:text-2xl font-bold text-[orange-600]">RankBid</span>
              </Link>
            </div>

            {/* Stats Pill - Professional */}
            <div className="hidden md:flex items-center gap-3 md:gap-6 px-3 md:px-6 py-1 md:py-2 bg-gray-50 text-[#1F2937] rounded-lg shadow-xs text-xs md:text-sm font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>{stats.onlineNow} LIVE</span>
              </div>
              <span className="text-gray-300">•</span>
              <span>{stats.allTimeVisitors}K VIEWS</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-4 md:gap-8 flex-1">
                <Link href="/platforms" className="text-xs md:text-sm font-medium text-[#1F2937] hover:text-[orange-600] transition-colors flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Platforms
                </Link>
                <Link href="/why" className="text-xs md:text-sm font-medium text-[#1F2937] hover:text-[orange-600] transition-colors">
                  Why
                </Link>
                <Link href="/daily" className="text-xs md:text-sm font-medium text-[#1F2937] hover:text-[orange-600] transition-colors">
                  Daily
                </Link>
                <Link href="/archive" className="text-xs md:text-sm font-medium text-[#1F2937] hover:text-[orange-600] transition-colors">
                  Archive
                </Link>
                <Link href="/categories" className="text-xs md:text-sm font-medium text-[#1F2937] hover:text-[orange-600] transition-colors">
                  Categories
                </Link>
                <Link href="/about" className="text-xs md:text-sm font-medium text-[#1F2937] hover:text-[orange-600] transition-colors">
                  About
                </Link>
              </nav>

              {/* Profile Avatar - Far Right */}
              {user ? (
                <Link
                  href="/profile"
                  className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm hover:shadow-md transition-all"
                  title={user.name || user.email}
                >
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </Link>
              ) : null}

              {/* Search */}
              <button
                onClick={() => {
                  const query = prompt('Search products...');
                  if (query?.trim()) {
                    window.location.href = `/search?q=${encodeURIComponent(query)}`;
                  }
                }}
                className="p-1.5 md:p-2 text-[#1F2937] hover:bg-gray-100 transition-colors rounded-lg"
              >
                <Search className="w-4 h-4 md:w-5 md:h-5" />
              </button>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="lg:hidden py-2 md:py-4 border-t border-gray-200 space-y-2 md:space-y-3">
              <div className="flex items-center gap-2 md:gap-3 px-2 md:px-4 py-1 md:py-2 bg-gray-50 text-[#1F2937] text-xs md:text-sm font-medium rounded-lg">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>{stats.onlineNow} LIVE • {stats.allTimeVisitors}K VIEWS</span>
              </div>

              {/* Mobile Auth Buttons */}
              {user ? (
                <Link
                  href="/profile"
                  className="block px-2 py-1 text-xs md:text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  My Profile
                </Link>
              ) : null}

              <Link href="/platforms" className="flex items-center gap-2 text-xs md:text-sm font-medium text-[#1F2937] hover:text-[orange-600] px-2 py-1 transition-colors">
                <TrendingUp className="w-4 h-4" />
                Platforms
              </Link>
              <Link href="/why" className="block text-xs md:text-sm font-medium text-[#1F2937] hover:text-[orange-600] px-2 py-1 transition-colors">
                Why
              </Link>
              <Link href="/daily" className="block text-xs md:text-sm font-medium text-[#1F2937] hover:text-[orange-600] px-2 py-1 transition-colors">
                Daily
              </Link>
              <Link href="/archive" className="block text-xs md:text-sm font-medium text-[#1F2937] hover:text-[orange-600] px-2 py-1 transition-colors">
                Archive
              </Link>
              <Link href="/categories" className="block text-xs md:text-sm font-medium text-[#1F2937] hover:text-[orange-600] px-2 py-1 transition-colors">
                Categories
              </Link>
              <Link href="/about" className="block text-xs md:text-sm font-medium text-[#1F2937] hover:text-[orange-600] px-2 py-1 transition-colors">
                About
              </Link>
              <Link href="/stats" className="block text-xs md:text-sm font-medium text-[#1F2937] hover:text-[orange-600] px-2 py-1 transition-colors">
                Stats
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Category Filter - Professional */}
      <div className="bg-gray-50 text-[#1F2937] border-b border-gray-200 sticky top-14 md:top-16 z-30 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-3 md:px-6 py-2 md:py-3 flex gap-1 md:gap-2 items-center">
          {CATEGORIES.map((cat) => {
            const Icon = cat.Icon;
            const isAll = cat.name === 'All';
            const href = isAll ? '/' : `/categories?category=${encodeURIComponent(cat.name)}`;

            return (
              <Link
                key={cat.name}
                href={href}
                className={`flex-shrink-0 px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1 md:gap-2 rounded-lg ${
                  isAll
                    ? 'bg-[orange-600] text-white shadow-sm'
                    : 'bg-white text-[#1F2937] hover:bg-[orange-600] hover:text-white shadow-xs'
                }`}
              >
                <Icon className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
