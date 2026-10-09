'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface Row {
  name: string;
  votes: number;
}

const START_ROWS: Row[] = [
  { name: 'Ayesha Khan', votes: 1284 },
  { name: 'Lahore Eats', votes: 972 },
  { name: 'Ali Raza', votes: 815 },
  { name: 'Studio Noor', votes: 640 },
];

// Vertical distance between ranking rows in the phone (row height + gap), in px.
const ROW_STEP = 46;
const TICK_MS = 2200;
const START_TOTAL = 2352;
const START_SUM = START_ROWS.reduce((sum, r) => sum + r.votes, 0);

const fmt = (n: number) => n.toLocaleString('en-US');

// A live-looking leaderboard: every tick one profile gets votes, and now and
// then enough to overtake the one above it, so the rows slide past each other.
function useLiveRanking(active: boolean) {
  const [state, setState] = useState<{ rows: Row[]; bumped: { name: string; climbed: boolean } | null }>({
    rows: START_ROWS,
    bumped: null,
  });

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      // Roll the dice outside the updater so it stays pure.
      // Lower ranks get votes more often, which keeps the order moving.
      const pick = Math.random() ** 0.6;
      const overtake = Math.random() < 0.45;
      const extra = 8 + Math.floor(Math.random() * 40);
      setState(({ rows }) => {
        const i = Math.min(rows.length - 1, Math.floor(pick * rows.length));
        const row = rows[i];
        const above = rows[i - 1];
        const gain = above && overtake ? above.votes - row.votes + extra : extra;
        const next = rows
          .map(r => (r.name === row.name ? { ...r, votes: r.votes + gain } : r))
          .sort((a, b) => b.votes - a.votes);
        const climbed = next.findIndex(r => r.name === row.name) < i;
        return { rows: next, bumped: { name: row.name, climbed } };
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [active]);

  return state;
}

// Closing call-to-action for the platforms page: copy on the left, a phone
// mockup of a live ranking with floating stat cards on the right.
export default function PlatformsCta() {
  const mockupRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  // Only animate while the mockup is on screen, and never for reduced motion.
  useEffect(() => {
    const el = mockupRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const { rows, bumped } = useLiveRanking(active);
  // The stat card starts at its own figure and grows with every vote cast below.
  const total = START_TOTAL + rows.reduce((sum, r) => sum + r.votes, 0) - START_SUM;

  return (
    <section className="bg-gray-50 pt-10 sm:pt-16 md:pt-24 pb-10 sm:pb-14 md:pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="spotlight relative rounded-3xl bg-gradient-to-br from-[#0B2545] via-[#0F3460] to-[#1a5490] text-white">
          <div className="grid md:grid-cols-2 items-center">
            {/* COPY */}
            <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14 md:py-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-[1.1] tracking-tight">
                Ready to get your profile
                <span className="block text-emerald-300">ranked?</span>
              </h2>
              <p className="mt-4 text-sm sm:text-base text-white/75 leading-relaxed max-w-md">
                Join creators and makers on Instagram, TikTok, LinkedIn, X and more. Submit your profile free and start climbing with real community votes today!
              </p>
              <Link
                href="/#submit"
                className="mt-7 inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-[#0F3460] font-black text-sm rounded-xl shadow-lg shadow-black/20 hover:-translate-y-0.5 transition-all"
              >
                Submit your profile →
              </Link>
            </div>

            {/* MOCKUP */}
            <div ref={mockupRef} className="relative hidden md:block h-full min-h-[320px]" aria-hidden="true">
              {/* Phone, overflowing the top and bottom of the panel */}
              <div className="absolute left-[30%] lg:left-[34%] -top-20 -bottom-10 w-[230px] flex flex-col overflow-hidden rounded-[2.25rem] border-[7px] border-[#111] bg-white shadow-2xl">
                <div className="mx-auto mt-2 h-4 w-20 rounded-full bg-[#111]" />
                <div className="flex-1 px-4 pt-3 text-[#1F2937]">
                  <p className="text-[10px] text-gray-400">Welcome back</p>
                  <p className="text-sm font-bold">Top on Instagram</p>
                  <div className="relative mt-3" style={{ height: rows.length * ROW_STEP - 8 }}>
                    {rows.map((row, i) => {
                      const isBumped = bumped?.name === row.name;
                      const climbed = isBumped && bumped.climbed;
                      return (
                        <div
                          key={row.name}
                          className={`absolute inset-x-0 top-0 flex items-center gap-2 rounded-lg border px-2 py-1.5 transition-[transform,background-color,border-color] duration-700 ease-out ${
                            climbed ? 'z-10 border-emerald-200 bg-emerald-50' : 'border-gray-100 bg-gray-50'
                          }`}
                          style={{ transform: `translateY(${i * ROW_STEP}px)` }}
                        >
                          <span className="w-4 text-[10px] font-black text-gray-400">#{i + 1}</span>
                          <span className="h-6 w-6 rounded-full bg-gradient-to-br from-[#E4405F] to-[#F77737]" />
                          <span className="flex-1 truncate text-[11px] font-semibold">{row.name}</span>
                          <span className={`text-[10px] font-bold tabular-nums transition-colors duration-700 ${isBumped ? 'text-emerald-600' : 'text-[#0F3460]'}`}>
                            ▲ {fmt(row.votes)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 rounded-lg border border-gray-100 p-2">
                    <p className="text-[10px] text-gray-400">Votes this week</p>
                    <svg viewBox="0 0 160 40" className="mt-1 w-full">
                      <path d="M0 32 C20 30 30 12 50 16 S80 34 100 22 S135 6 160 10" fill="none" stroke="#0F3460" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
                <div className="mx-auto mb-2 h-1 w-20 rounded-full bg-[#111]" />
              </div>

              {/* Floating stat card */}
              <div className="absolute left-[6%] lg:left-[12%] top-4 w-40 rounded-2xl bg-white p-3 text-[#1F2937] shadow-xl">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-600">↗</span>
                <p className="mt-2 text-[10px] text-gray-500">Total Votes</p>
                <p className="text-xl font-black tabular-nums">{fmt(total)}</p>
                <p className="text-[10px] text-gray-400">#1 for 3 days running</p>
              </div>

              {/* Floating platform pill */}
              <div className="absolute left-0 lg:left-[6%] bottom-8 flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-[#1F2937] shadow-xl">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50">
                  <img src="/tiktok.png" alt="" className="h-5 w-5 object-contain" />
                </span>
                <div>
                  <p className="text-[10px] text-gray-500">New on TikTok</p>
                  <p className="text-sm font-bold">+128 votes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
