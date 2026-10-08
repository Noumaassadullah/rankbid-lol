'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { SUPPORT_EMAIL, X_HANDLE, X_URL } from '@/lib/site';

function XLogo({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.6l-5.1-6.72-5.852 6.72H2.306l7.73-8.835L1.75 2.25h6.738l4.6 6.088 5.45-6.088zM17.083 19.77h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function MailIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const LINK_GROUPS = [
  {
    title: 'Rankings',
    links: [
      { href: '/', label: 'All Time' },
      { href: '/today', label: 'Today' },
      { href: '/leaderboard', label: 'Leaderboard' },
      { href: '/categories', label: 'Categories' },
    ],
  },
  {
    title: 'Discover',
    links: [
      { href: '/platforms', label: 'Platforms' },
      { href: '/daily', label: 'Daily' },
      { href: '/archive', label: 'Archive' },
      { href: '/stats', label: 'Stats' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/why', label: 'Why RankBid' },
      { href: '/about', label: 'About' },
      { href: '/rules', label: 'Rules' },
      { href: `mailto:${SUPPORT_EMAIL}`, label: 'Contact' },
    ],
  },
];

const LEGAL_LINKS = [
  { href: '/tos', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/cookies', label: 'Cookies' },
];

const WORDMARK = 'RANKBID'.split('');

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Start the wordmark animation the first time it scrolls into view.
  useEffect(() => {
    const el = wordmarkRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <footer className="spotlight relative isolate overflow-hidden bg-[#071a33] text-white">
      {/* Background: brand glows + faint grid fading toward the bottom */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/4 w-[40rem] h-[40rem] rounded-full bg-[#1a5490]/35 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 w-[32rem] h-[32rem] rounded-full bg-[#059669]/20 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Launch CTA */}
        <div className="pt-12 sm:pt-16 pb-4 sm:pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300/90 mb-3">Launch today</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight">
              Your product deserves a spot on the leaderboard.
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 flex-shrink-0">
            <Link
              href="/#submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-[#0F3460] text-sm font-black shadow-lg shadow-black/30 hover:-translate-y-0.5 transition-all"
            >
              Submit for free →
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/20 bg-white/5 text-white text-sm font-black hover:bg-white/10 transition-all"
            >
              Explore rankings
            </Link>
          </div>
        </div>

        {/* Brand + link columns */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-10 py-10 sm:py-14">
          <div className="col-span-2 md:col-span-5">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-white to-[#DCE7F5] text-[#0F3460] flex items-center justify-center font-black text-lg shadow-lg shadow-black/30">R</span>
              <span className="text-xl font-black tracking-tight">RankBid</span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed max-w-sm mb-6">
              Community-driven product rankings. No algorithms, no gatekeepers, just honest votes deciding who rises.
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={X_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full bg-white/[0.06] border border-white/15 hover:bg-white hover:border-white transition-all"
              >
                <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center"><XLogo className="w-3.5 h-3.5" /></span>
                <span className="text-sm font-bold group-hover:text-[#0F3460] transition-colors">@{X_HANDLE}</span>
              </a>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.06] border border-white/15 text-sm font-bold hover:bg-white/10 transition-all"
              >
                <MailIcon /> Contact us
              </a>
            </div>
          </div>

          {LINK_GROUPS.map(group => (
            <nav key={group.title} aria-label={group.title} className="md:col-span-2 last:col-span-2 md:last:col-span-3">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40 mb-4">{group.title}</h4>
              <ul className="space-y-1">
                {group.links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1.5 py-1.5 text-sm text-white/70 hover:text-white transition-colors"
                    >
                      <span className="w-0 h-px bg-emerald-300 group-hover:w-3 transition-all duration-300" aria-hidden="true" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-5 text-xs text-white/45">
          <p>© {currentYear} RankBid. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {LEGAL_LINKS.map(link => (
              <Link key={link.label} href={link.href} className="py-1 hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
            <span className="hidden sm:inline-flex items-center gap-1.5 text-white/55">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </span>
              Rankings live
            </span>
          </div>
        </div>
      </div>

      {/* Animated giant wordmark, cropped at the bottom edge. Links home. */}
      <div
        ref={wordmarkRef}
        className={`select-none relative h-[13vw] overflow-hidden ${visible ? 'is-visible' : ''}`}
      >
        <Link
          href="/"
          aria-label="RankBid home"
          className="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap font-black leading-none tracking-[-0.05em] text-[21vw] -mt-[0.06em] hover:opacity-80 transition-opacity"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {WORDMARK.map((ch, i) => (
            <span key={i} aria-hidden="true" className="wordmark-letter" style={{ '--d': `${i * 80}ms` } as CSSProperties}>
              {ch}
            </span>
          ))}
        </Link>
      </div>
    </footer>
  );
}
