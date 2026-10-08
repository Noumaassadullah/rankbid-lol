'use client';

import { useCallback, useEffect, useState } from 'react';
import { getCategoryLabel } from '@/lib/categories';

interface PodiumListing {
  id: string;
  title: string;
  category: string;
  totalVotes: number;
  dayVotes: number;
}

type Tab = 'alltime' | 'today';

// How often the podium re-reads the rankings while the tab is visible.
const REFRESH_MS = 10_000;

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LivePodium() {
  const [listings, setListings] = useState<PodiumListing[] | null>(null);
  const [tab, setTab] = useState<Tab>('alltime');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/listings/submit?limit=500&sort=totalVotes', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setListings(data.listings || []);
    } catch {
      // Keep showing the last good result; the next tick retries.
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') load();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);

  const votesFor = (l: PodiumListing) => (tab === 'today' ? l.dayVotes : l.totalVotes) || 0;
  const top = (listings || [])
    .filter(l => tab === 'alltime' || (l.dayVotes || 0) > 0)
    .sort((a, b) => votesFor(b) - votesFor(a))
    .slice(0, 3);

  // Podium order on desktop: 2nd, 1st, 3rd. On mobile 1st stays on top.
  const slots = [1, 0, 2];

  return (
    <div>
      <div className="flex flex-col items-center gap-3 mb-8 sm:mb-12">
        <div className="inline-flex p-1 bg-white border border-gray-200 shadow-sm rounded-full">
          {(['alltime', 'today'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full transition-all ${
                tab === t ? 'bg-[#0F3460] text-white shadow-sm' : 'text-[#1F2937]/70 hover:text-[#0F3460]'
              }`}
            >
              {t === 'alltime' ? 'All Time' : 'Today'}
            </button>
          ))}
        </div>
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#1F2937]/55">
          <span className="relative flex w-2 h-2">
            <span className="absolute inset-0 rounded-full bg-[#059669] animate-ping opacity-60" />
            <span className="relative w-2 h-2 rounded-full bg-[#059669]" />
          </span>
          Live
        </span>
      </div>

      {listings === null ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 md:items-end">
          {slots.map(rank => (
            <div
              key={rank}
              className={`${rank === 0 ? 'h-56 md:-translate-y-4' : 'h-48 order-2 md:order-none'} rounded-2xl bg-white border border-gray-100 animate-pulse`}
            />
          ))}
        </div>
      ) : top.length === 0 ? (
        <div className="text-center py-10 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-[#1F2937]/60">
          {tab === 'today' ? 'No votes yet today. Be the first.' : 'No products ranked yet.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 md:items-end">
          {slots.map(rank => {
            const l = top[rank];
            if (!l) return <div key={rank} className="hidden md:block" />;
            const first = rank === 0;
            return (
              <a
                key={rank}
                href={`/product/${l.id}`}
                className={`block rounded-2xl text-center transition-all duration-300 hover:-translate-y-1 ${
                  first
                    ? 'bg-gradient-to-br from-[#0F3460] to-[#1a5490] text-white p-6 sm:p-8 shadow-[0_24px_50px_-24px_rgba(11,37,69,0.7)] md:-translate-y-4 md:hover:-translate-y-5'
                    : 'order-2 md:order-none bg-white border border-gray-200 shadow-sm hover:shadow-md p-5 sm:p-6'
                }`}
              >
                <div className={`${first ? 'text-5xl sm:text-6xl' : 'text-4xl sm:text-5xl'} mb-2 sm:mb-3`}>{MEDALS[rank]}</div>
                <h3 className={`${first ? 'text-base sm:text-lg font-black' : 'text-sm sm:text-base font-bold text-[#1F2937]'} mb-1 truncate`}>
                  {l.title}
                </h3>
                <p className={`text-xs mb-3 sm:mb-4 ${first ? 'text-white/70' : 'text-[#1F2937]/60'}`}>{getCategoryLabel(l.category)}</p>
                {/* Keyed on the count so a new vote replays the slide-up */}
                <p key={votesFor(l)} className={`slide-up font-black tabular-nums ${first ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl text-[#0F3460]'}`}>
                  {votesFor(l)}
                </p>
                <p className={`text-xs font-semibold ${first ? 'text-white/70' : 'text-[#1F2937]/60'}`}>
                  {first ? 'votes · #1 Ranked' : 'votes'}
                </p>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
