'use client';

// Signpost shown beside "the top rankings" heading: three arrow signs on a pole, drawn in the
// site's navy theme. Each sign is a face plus a darker copy offset behind it for depth.
//
// The sway animates SVG groups under a drop-shadow filter, which the browser can't hand to the
// GPU: every frame re-runs layout and the shadow. So it only runs while the signpost is on
// screen and the page is not being scrolled; otherwise scrolling the home page stutters.

import { useEffect, useRef } from 'react';

const NAVY = '#0F3460';
const NAVY_EDGE = '#0B2545';

interface SignProps {
  /** Face outline, already pointing the right way */
  points: string;
  /** Depth offset for the edge behind the face */
  dx: number;
  face: string;
  edge: string;
  rotate: number;
  cx: number;
  cy: number;
  /** Where the sign meets the pole; it sways around this point */
  pivotX: number;
  /** Sway timing, so the three signs never move in step */
  sway: { seconds: number; delay: number };
  children: React.ReactNode;
}

function Sign({ points, dx, face, edge, rotate, cx, cy, pivotX, sway, children }: SignProps) {
  return (
    <g
      className="signpost-sway"
      style={{
        transformBox: 'view-box',
        transformOrigin: `${pivotX}px ${cy}px`,
        animationDuration: `${sway.seconds}s`,
        animationDelay: `${sway.delay}s`,
      }}
    >
    <g transform={`rotate(${rotate} ${cx} ${cy})`}>
      <polygon points={points} fill={edge} transform={`translate(${dx} 7)`} strokeLinejoin="round" stroke={edge} strokeWidth="8" />
      <polygon points={points} fill={face} strokeLinejoin="round" stroke={face} strokeWidth="8" />
      {children}
    </g>
    </g>
  );
}

export default function RankingsSignpost({ className = '' }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    let visible = false;
    let scrolling = false;
    let timer = 0;
    const update = () => svg.classList.toggle('signpost-paused', !visible || scrolling);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    io.observe(svg);

    const onScroll = () => {
      if (!scrolling) {
        scrolling = true;
        update();
      }
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        scrolling = false;
        update();
      }, 200);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(timer);
    };
  }, []);

  const label = { fontWeight: 800, fontSize: 24, letterSpacing: '-0.01em', textAnchor: 'middle' } as const;

  return (
    <svg ref={ref} viewBox="0 0 420 390" className={`signpost-paused ${className}`} role="img" aria-label="Signpost: more reach, strong brand, more sales">
      <style>{`
        .signpost-sway { animation: signpost-sway ease-in-out infinite alternate; }
        .signpost-paused .signpost-sway { animation-play-state: paused; }
        @keyframes signpost-sway { from { transform: rotate(-2.5deg); } to { transform: rotate(2.5deg); } }
        @media (prefers-reduced-motion: reduce) { .signpost-sway { animation: none; } }
      `}</style>
      <defs>
        <linearGradient id="signpost-pole" x1="0" x2="1">
          <stop offset="0" stopColor="#9CA3AF" />
          <stop offset="0.35" stopColor="#F3F4F6" />
          <stop offset="0.7" stopColor="#C7CBD1" />
          <stop offset="1" stopColor="#8B9099" />
        </linearGradient>
        <linearGradient id="signpost-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.8" stopColor="white" />
          <stop offset="1" stopColor="black" />
        </linearGradient>
        <mask id="signpost-pole-mask" maskUnits="userSpaceOnUse">
          <rect width="420" height="390" fill="url(#signpost-fade)" />
        </mask>
        <filter id="signpost-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor={NAVY_EDGE} floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Pole, cap and clamps */}
      <g mask="url(#signpost-pole-mask)">
        <rect x="196" y="22" width="28" height="368" fill="url(#signpost-pole)" />
      </g>
      <rect x="193" y="10" width="34" height="16" rx="4" fill="url(#signpost-pole)" />
      <rect x="195" y="4" width="30" height="8" rx="3" fill="#D1D5DB" />
      <rect x="194" y="58" width="32" height="84" rx="3" fill={NAVY} />
      <rect x="194" y="172" width="32" height="76" rx="3" fill={NAVY} />
      <rect x="194" y="272" width="32" height="76" rx="3" fill={NAVY} />

      <g filter="url(#signpost-shadow)" style={{ fontFamily: 'inherit' }}>
        {/* MORE REACH: left */}
        <Sign points="8,98 48,52 198,52 198,144 48,144" dx={4} face={NAVY} edge={NAVY_EDGE} rotate={-5} cx={120} cy={98} pivotX={198} sway={{ seconds: 2.6, delay: 0 }}>
          <text x="118" y="92" fill="white" style={label}>MORE</text>
          <text x="118" y="122" fill="white" style={label}>REACH</text>
        </Sign>

        {/* STRONG BRAND: right, white face */}
        <Sign points="222,166 372,166 412,212 372,258 222,258" dx={-4} face="#FFFFFF" edge="#CBD5E1" rotate={4} cx={310} cy={212} pivotX={222} sway={{ seconds: 3.1, delay: -1.2 }}>
          <text x="306" y="206" fill={NAVY} style={label}>STRONG</text>
          <text x="306" y="236" fill={NAVY} style={label}>BRAND</text>
        </Sign>

        {/* MORE SALES: left */}
        <Sign points="38,312 78,266 198,266 198,358 78,358" dx={4} face={NAVY} edge={NAVY_EDGE} rotate={-4} cx={120} cy={312} pivotX={198} sway={{ seconds: 2.8, delay: -0.6 }}>
          <text x="128" y="306" fill="white" style={label}>MORE</text>
          <text x="128" y="336" fill="white" style={label}>SALES</text>
        </Sign>
      </g>
    </svg>
  );
}
