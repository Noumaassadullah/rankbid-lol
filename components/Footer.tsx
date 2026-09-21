'use client';

import Link from 'next/link';
import {
  Crown,
  Flame,
  Calendar,
  Grid3x3,
  Info,
  BookOpen,
  Briefcase,
  Mail,
  Share2,
  GitBranch,
  MessageSquare,
  Gem,
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-black border-t-4 border-orange-500 dark:border-orange-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded font-black text-white flex items-center justify-center">
                <Gem size={18} />
              </div>
              <span className="text-xl font-black text-black dark:text-white">RankBid</span>
            </div>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed">
              Community-ranked leaderboard. No algorithms, no politics. Just real merit.
            </p>
          </div>

          {/* Leaderboards */}
          <div>
            <h4 className="text-sm font-black text-black dark:text-white mb-4 uppercase tracking-wide flex items-center gap-2">
              <Crown size={16} />
              Leaderboards
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors text-sm flex items-center gap-2"
                >
                  <Crown size={14} />
                  All-Time
                </Link>
              </li>
              <li>
                <Link
                  href="/today"
                  className="font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors text-sm flex items-center gap-2"
                >
                  <Flame size={14} />
                  Today (24h)
                </Link>
              </li>
              <li>
                <Link
                  href="/daily"
                  className="font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors text-sm flex items-center gap-2"
                >
                  <Calendar size={14} />
                  Daily
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors text-sm flex items-center gap-2"
                >
                  <Grid3x3 size={14} />
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-black text-black dark:text-white mb-4 uppercase tracking-wide flex items-center gap-2">
              <BookOpen size={16} />
              Resources
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors text-sm flex items-center gap-2"
                >
                  <Info size={14} />
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/rules"
                  className="font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors text-sm flex items-center gap-2"
                >
                  <BookOpen size={14} />
                  Rules & Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/claim"
                  className="font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors text-sm flex items-center gap-2"
                >
                  <Briefcase size={14} />
                  Claim Listing
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-black text-black dark:text-white mb-4 uppercase tracking-wide flex items-center gap-2">
              <Mail size={16} />
              Support
            </h4>
            <p className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-4">
              Have questions? Get in touch with our community team.
            </p>
            <a
              href="mailto:support@rankbid.pk"
              className="inline-flex items-center gap-2 font-bold text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 transition-colors text-sm"
            >
              <Mail size={14} />
              support@rankbid.pk
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="font-black text-gray-900 dark:text-white text-sm">
              &copy; {currentYear} RankBid Pakistan
            </p>
            <p className="font-bold text-gray-600 dark:text-gray-400 text-xs mt-1">
              The transparent platform where merit wins.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex gap-6">
            <a
              href="https://twitter.com"
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950 rounded-lg transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <Share2 size={18} />
            </a>
            <a
              href="https://github.com"
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950 rounded-lg transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <GitBranch size={18} />
            </a>
            <a
              href="https://discord.com"
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950 rounded-lg transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord"
            >
              <MessageSquare size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
