'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, type CSSProperties } from 'react';
import { CATEGORIES } from '@/lib/categories';

// /why banner: a photo across the top, cut by a white wave, with the headline,
// buttons and live numbers below. Every number and card shows real site data.

// Two friends laughing at a phone, from the design reference; the reference's own card and wave are
// whited out of the file and hidden under the wave below.
const PHOTO_SRC = '/why-hero-people.webp';
const PLATFORM_ICONS = ['/instagram.png', '/linkedin.png', '/twitter.png', '/tiktok.png'];

const slideDelay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;
const formatCount = (n: number) => new Intl.NumberFormat('en-US', { notation: n >= 10_000 ? 'compact' : 'standard' }).format(n);

type RankedListing = { title: string; totalVotes: number; dayVotes: number };

export default function WhyHero() {
  const [listings, setListings] = useState<RankedListing[]>([]);

  useEffect(() => {
    fetch('/api/listings/submit?limit=1000&sort=totalVotes')
      .then(res => (res.ok ? res.json() : { listings: [] }))
      .then(data => setListings(data.listings || []))
      .catch(() => {});
  }, []);

  const productCount = listings.length;
  const totalVotes = listings.reduce((n, l) => n + (l.totalVotes || 0), 0);
  const votesToday = listings.reduce((n, l) => n + (l.dayVotes || 0), 0);
  const topProduct = listings[0] && listings[0].totalVotes > 0 ? listings[0] : null;

  const stats = [
    { value: productCount, label: ['Products', 'ranked'] },
    { value: totalVotes, label: ['Community', 'votes'] },
    { value: CATEGORIES.length, label: ['Product', 'categories'] },
  ];

  return (
    <section className="relative overflow-hidden bg-white border-b border-gray-200">
      {/* PHOTO + WAVE */}
      {/* Hidden on phones: the banner starts with the copy there */}
      <div className="relative hidden sm:block sm:h-[26rem] lg:h-auto lg:aspect-[1560/612]">
        <Image
          src={PHOTO_SRC}
          alt="Two friends laughing at a phone"
          fill
          priority
          // Served as-is: the file is already a max-quality WebP, and re-encoding at 75 visibly softened it.
          unoptimized
          className="object-cover object-[56%_30%]"
        />
        {/* White wave: rises on the left, dips under the phone, lifts again on the right */}
        <svg
          className="absolute inset-x-0 bottom-[-1px] h-[48%] w-full text-white"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path fill="currentColor" d="M0,6 C420,-30 640,120 900,250 C1110,318 1300,290 1440,170 L1440,320 L0,320 Z" />
        </svg>

        {/* Live #1 card, sitting on the wave's edge like a notification */}
        {topProduct && (
          <Link
            href="/leaderboard"
            style={slideDelay(250)}
            className="slide-up absolute left-4 sm:left-[4%] bottom-[34%] sm:bottom-[42%] max-w-[15rem] sm:max-w-[19rem] flex items-center gap-3 bg-white rounded-2xl shadow-xl shadow-[#0B2545]/15 pl-3 pr-5 py-2.5 sm:py-3 hover:-translate-y-0.5 transition-transform"
          >
            <span className="relative grid place-items-center w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-full bg-[#0F3460] text-white text-sm sm:text-base">
              🏆
              <span className="absolute -bottom-0.5 -right-0.5 grid place-items-center w-4 h-4 rounded-full bg-[#059669] ring-2 ring-white">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </span>
            </span>
            <span className="min-w-0">
              <span className="block text-sm sm:text-base font-bold text-[#0B2545] leading-tight">#1 right now</span>
              <span className="block truncate text-xs sm:text-[13px] text-[#1F2937]/60">
                {topProduct.title} · {topProduct.totalVotes} vote{topProduct.totalVotes !== 1 ? 's' : ''}
              </span>
            </span>
          </Link>
        )}
      </div>

      {/* COPY + NUMBERS */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-12 sm:pt-0 sm:pb-16 lg:pb-20 sm:-mt-12 lg:-mt-20">
        <div className="grid gap-10 lg:grid-cols-[1.45fr_1fr] lg:items-stretch">
          <div>
            <p style={slideDelay(0)} className="slide-up text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-[#0F3460]/60 mb-3 sm:mb-4">Why RankBid</p>
            <h1 style={slideDelay(60)} className="slide-up text-[2.5rem] leading-[1.02] sm:text-6xl lg:text-[4rem] font-black tracking-[-0.04em] text-[#0B2545]">
              <span className="lg:whitespace-nowrap">Votes, not budgets,</span>
              <span className="block text-[#059669]">decide who rises.</span>
            </h1>
            <p style={slideDelay(120)} className="slide-up mt-5 sm:mt-6 max-w-lg text-sm sm:text-base md:text-lg text-[#1F2937]/60">
              RankBid is a free, community-driven launchpad. Real people vote, and the best products climb. No algorithms, no gatekeepers, no paid shortcuts to the top.
            </p>
            <div style={slideDelay(180)} className="slide-up mt-7 sm:mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3">
              <Link
                href="/#submit"
                className="inline-flex items-center justify-center px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-[#0F3460] text-white text-sm font-bold shadow-lg shadow-[#0F3460]/25 hover:bg-[#0B2545] hover:-translate-y-0.5 transition-all"
              >
                Submit your product · It&apos;s free
              </Link>
              <Link
                href="/categories"
                className="inline-flex items-center justify-center px-6 sm:px-7 py-3 sm:py-3.5 rounded-full border-2 border-[#0F3460]/15 text-[#0B2545] text-sm font-bold hover:border-[#0F3460]/40 transition-colors"
              >
                See the rankings
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:items-end lg:justify-between">
            {/* Votes-today card: on desktop it sits up on the wave's edge */}
            <div style={slideDelay(300)} className="slide-up self-start lg:self-end lg:-mt-4 inline-flex items-center gap-4 bg-white rounded-2xl shadow-xl shadow-[#0B2545]/10 border border-gray-100 px-4 py-3">
              <span className="flex -space-x-2.5">
                {PLATFORM_ICONS.map(src => (
                  <span key={src} className="grid place-items-center w-9 h-9 rounded-full bg-white ring-2 ring-white shadow">
                    <img src={src} alt="" className="w-5 h-5 object-contain" />
                  </span>
                ))}
              </span>
              <span>
                {votesToday > 0 ? (
                  <>
                    <span className="block text-lg font-black text-[#0B2545] tabular-nums leading-tight">{formatCount(votesToday)}</span>
                    <span className="block text-xs text-[#1F2937]/60">Vote{votesToday !== 1 ? 's' : ''} cast today</span>
                  </>
                ) : (
                  <>
                    <span className="block text-sm font-black text-[#0B2545] leading-tight">Voting is open</span>
                    <span className="block text-xs text-[#1F2937]/60">Be the first to vote today</span>
                  </>
                )}
              </span>
            </div>

            <dl style={slideDelay(360)} className="slide-up grid grid-cols-3 gap-4 sm:gap-8">
              {stats.map(stat => (
                <div key={stat.label.join(' ')} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5">
                  <dt className="sr-only">{stat.label.join(' ')}</dt>
                  <dd className="text-3xl sm:text-4xl font-black tracking-tight text-[#0B2545] tabular-nums">{formatCount(stat.value)}</dd>
                  <dd aria-hidden="true" className="text-xs sm:text-sm leading-tight text-[#1F2937]/55">
                    {stat.label[0]}<br />{stat.label[1]}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
