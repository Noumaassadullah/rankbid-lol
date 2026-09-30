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
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [stats, setStats] = useState({ live: 0, today: 0, views: 0 });

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

  // Fetch stats for header display
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [liveRes, dailyRes, totalRes] = await Promise.all([
          fetch('/api/analytics/live-viewers'),
          fetch('/api/analytics/filtered-stats?period=daily'),
          fetch('/api/analytics/total-stats'),
        ]);

        if (!liveRes.ok || !dailyRes.ok || !totalRes.ok) {
          console.error('[Stats] API error:', { liveRes: liveRes.status, dailyRes: dailyRes.status, totalRes: totalRes.status });
          return;
        }

        const liveData = await liveRes.json();
        const dailyData = await dailyRes.json();
        const totalData = await totalRes.json();

        console.log('[Stats] Updated:', { live: liveData.liveViewers, today: dailyData.visitors, views: totalData.totalPageViews });

        setStats({
          live: liveData.liveViewers || 0,
          today: dailyData.visitors || 0,
          views: totalData.totalPageViews || 0,
        });
      } catch (error) {
        console.error('[Stats] Fetch error:', error);
      }
    };

    // Fetch immediately on mount
    fetchStats();

    // Then update every 5 seconds for real-time updates
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    setUser(null);
    router.push('/');
  };

  return (
    <>
      {/* Top Header - Professional Corporate */}
      <header className="bg-white text-[#1F2937] shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-6">
          {/* Main Header */}
          <div className="flex items-center justify-between h-12 sm:h-14 md:h-16">
            {/* Logo & Hamburger */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-1.5 sm:p-2 text-[#1F2937] rounded-lg flex-shrink-0"
              >
                {mobileOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />}
              </button>
              <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                <span className="text-base sm:text-lg md:text-2xl font-bold text-[orange-600]">RankBid</span>
              </Link>
            </div>

            {/* Center Stats */}
            <div className="hidden md:flex items-center gap-4 flex-1 justify-center">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-semibold text-gray-900">{stats.live}</span>
                <span className="text-xs text-gray-500">LIVE</span>
              </div>
              <span className="text-gray-300 text-xs">•</span>
              <div className="flex items-center gap-1">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-semibold text-gray-900">{stats.today}</span>
                <span className="text-xs text-gray-500">TODAY</span>
              </div>
              <span className="text-gray-300 text-xs">•</span>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-semibold text-gray-900">{stats.views}</span>
                <span className="text-xs text-gray-500">VIEWS</span>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Desktop Nav - Right Side */}
            <nav className="hidden lg:flex items-center gap-1 md:gap-4 flex-shrink-0">
                <Link href="/platforms" className="text-xs md:text-sm font-medium text-[#1F2937] flex items-center gap-1 px-2 py-1">
                  <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden xl:inline">Platforms</span>
                </Link>
                <Link href="/why" className="text-xs md:text-sm font-medium text-[#1F2937] px-2 py-1">
                  Why
                </Link>
                <Link href="/daily" className="text-xs md:text-sm font-medium text-[#1F2937] px-2 py-1">
                  Daily
                </Link>
                <Link href="/archive" className="text-xs md:text-sm font-medium text-[#1F2937] px-2 py-1">
                  Archive
                </Link>
                <Link href="/categories" className="text-xs md:text-sm font-medium text-[#1F2937] px-2 py-1">
                  Categories
                </Link>
                <Link href="/about" className="text-xs md:text-sm font-medium text-[#1F2937] px-2 py-1">
                  About
                </Link>
              </nav>

              {/* Profile Avatar */}
              {user ? (
                <Link
                  href="/profile"
                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm ml-1 sm:ml-2 flex-shrink-0"
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
                className="p-1 sm:p-1.5 md:p-2 text-[#1F2937] rounded-lg flex-shrink-0"
              >
                <Search className="w-4 h-4 md:w-5 md:h-5" />
              </button>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="lg:hidden py-2 sm:py-3 border-t border-gray-200 space-y-1.5 sm:space-y-2 pb-2 sm:pb-3">
              {/* Mobile Auth Buttons */}
              {user ? (
                <Link
                  href="/profile"
                  className="block px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-orange-600 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  My Profile
                </Link>
              ) : null}

              <Link href="/platforms" className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#1F2937] px-2 sm:px-3 py-1.5">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                Platforms
              </Link>
              <Link href="/why" className="block text-xs sm:text-sm font-medium text-[#1F2937] px-2 sm:px-3 py-1.5">
                Why
              </Link>
              <Link href="/daily" className="block text-xs sm:text-sm font-medium text-[#1F2937] px-2 sm:px-3 py-1.5">
                Daily
              </Link>
              <Link href="/archive" className="block text-xs sm:text-sm font-medium text-[#1F2937] px-2 sm:px-3 py-1.5">
                Archive
              </Link>
              <Link href="/categories" className="block text-xs sm:text-sm font-medium text-[#1F2937] px-2 sm:px-3 py-1.5">
                Categories
              </Link>
              <Link href="/about" className="block text-xs sm:text-sm font-medium text-[#1F2937] px-2 sm:px-3 py-1.5">
                About
              </Link>
              <Link href="/stats" className="block text-xs sm:text-sm font-medium text-[#1F2937] px-2 sm:px-3 py-1.5">
                Stats
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Category Filter - Professional */}
      <div className="bg-gray-50 text-[#1F2937] border-b border-gray-200 sticky top-12 sm:top-14 md:top-16 z-30 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-6 py-1.5 sm:py-2 md:py-3 flex gap-1 items-center">
          {CATEGORIES.map((cat) => {
            const Icon = cat.Icon;
            const isAll = cat.name === 'All';
            const href = isAll ? '/' : `/categories?category=${encodeURIComponent(cat.name)}`;

            return (
              <Link
                key={cat.name}
                href={href}
                className={`flex-shrink-0 px-1.5 sm:px-2.5 md:px-4 py-1 md:py-2 text-xs font-medium whitespace-nowrap flex items-center gap-0.5 sm:gap-1 md:gap-2 rounded-lg ${
                  isAll
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-white text-[#1F2937] shadow-xs'
                }`}
                title={cat.name}
              >
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
