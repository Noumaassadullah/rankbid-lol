'use client';

import Link from 'next/link';
import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import { BarChart3, Search, Menu, X, Zap, MessageSquare, TrendingUp, Layers, Code, Compass } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const categories = [
    { name: 'All', Icon: BarChart3, href: '/rankings/all' },
    { name: 'Leaderboards', Icon: TrendingUp, href: '/rankings/leaderboards' },
    { name: 'SEO', Icon: Search, href: '/rankings/seo' },
    { name: 'Marketing', Icon: MessageSquare, href: '/rankings/marketing' },
    { name: 'Productivity', Icon: Zap, href: '/rankings/productivity' },
    { name: 'Agents', Icon: Layers, href: '/rankings/agents' },
    { name: 'Crypto', Icon: TrendingUp, href: '/rankings/crypto' },
    { name: 'Other', Icon: Compass, href: '/rankings/other' },
    { name: 'Developer', Icon: Code, href: '/rankings/developer' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 6.5L7 11.5h12L13 6.5z M5 13h14v4H5z" />
            </svg>
            <span className="text-lg font-black text-black tracking-tight">rankbid.lol</span>
          </Link>

          {/* Live Stats */}
          <div className="hidden md:flex text-sm font-medium text-gray-600">
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-black font-semibold">62 online</span>
              <span className="text-gray-400">·</span>
              <span className="text-black font-semibold">1,523,636 visitors</span>
              <span className="text-gray-400">·</span>
              <Link href="/stats" className="text-orange-600 hover:text-orange-700 font-bold">stats→</Link>
            </span>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileOpen ? <X className="w-6 h-6 text-black" /> : <Menu className="w-6 h-6 text-black" />}
            </button>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-6">
              <Link href="/daily" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
                Daily
              </Link>
              <Link href="/categories" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
                Categories
              </Link>
              <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
                About
              </Link>
              <Link href="/rules" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
                Rules
              </Link>
            </div>

            {/* Search Icon */}
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-black" />
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>

        {/* Category Bar */}
        <div className="hidden md:flex items-center gap-2 py-3 overflow-x-auto">
          {categories.map((cat) => {
            const Icon = cat.Icon;
            return (
              <Link
                key={cat.name}
                href={cat.href}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  cat.name === 'All'
                    ? 'bg-orange-600 text-white border border-orange-600'
                    : 'bg-white text-black border border-gray-300 hover:border-orange-600 hover:text-orange-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </Link>
            );
          })}
          <Link
            href="/explore"
            className="px-3 py-1.5 bg-white text-orange-600 font-bold rounded-full text-sm border border-orange-600 whitespace-nowrap ml-auto flex items-center gap-1.5 hover:bg-orange-50 transition-colors"
          >
            <Compass className="w-4 h-4" />
            Explore
          </Link>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden pb-4 pt-2 space-y-2 border-t border-gray-200">
            <Link href="/daily" className="block px-4 py-2 text-base font-medium text-black rounded-lg hover:bg-gray-100 transition-colors">
              Daily
            </Link>
            <Link href="/categories" className="block px-4 py-2 text-base font-medium text-black rounded-lg hover:bg-gray-100 transition-colors">
              Categories
            </Link>
            <Link href="/about" className="block px-4 py-2 text-base font-medium text-black rounded-lg hover:bg-gray-100 transition-colors">
              About
            </Link>
            <Link href="/rules" className="block px-4 py-2 text-base font-medium text-black rounded-lg hover:bg-gray-100 transition-colors">
              Rules
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}