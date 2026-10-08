'use client';

import { useEffect, useRef } from 'react';

// The two connector lines and their dots are drawn here instead of baked into /why-makers.png,
// so the dots can travel along the lines. Coordinates are in the PNG's own pixels (754×706);
// the arcs were fitted to the original artwork.
const LEFT_LINE = 'M 133.2 279.8 A 152.9 152.9 0 0 0 227.2 519.7'; // avatar ring → her shoulder
const LEFT_TRACK = 'M 124.5 293.3 A 152.9 152.9 0 0 0 214.8 516.7'; // same arc, inset by the dot radius
const RIGHT_LINE = 'M 497 325.2 A 146.1 146.1 0 0 1 568.9 608.3'; // passes behind the stats card
const RIGHT_TRACK = 'M 509.1 323 A 146.1 146.1 0 0 1 581.8 604.1';

// Each dot starts where the artwork had it, glides to one end, then the other, and back.
// keyPoints are fractions of the track; keyTimes are proportional to the distance covered.
function motion(start: number, seconds: number, track: string) {
  const total = start + 1 + (1 - start);
  const t1 = start / total;
  const t2 = (start + 1) / total;
  return {
    dur: `${seconds}s`,
    repeatCount: 'indefinite',
    path: track,
    keyPoints: `${start};0;1;${start}`,
    keyTimes: `0;${t1.toFixed(3)};${t2.toFixed(3)};1`,
    calcMode: 'spline',
    keySplines: '0 0 0.58 1;0.42 0 0.58 1;0.42 0 1 1',
  };
}

export default function WhyMakersIllustration() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    // Dots rest in place until the section is on screen, and always for reduced-motion users.
    svg.pauseAnimations();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? svg.unpauseAnimations() : svg.pauseAnimations()),
      { threshold: 0.25 }
    );
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-full max-w-[560px] mx-auto">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/why-makers.png"
        alt="A maker checking live votes on their phone"
        width={754}
        height={706}
        loading="lazy"
        className="w-full h-auto"
      />
      <svg
        ref={svgRef}
        viewBox="0 0 754 706"
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          {/* The right line and its dot pass behind the stats card. */}
          <mask id="why-makers-card" maskUnits="userSpaceOnUse">
            <rect width="754" height="706" fill="white" />
            <rect x="514" y="407" width="202" height="106" rx="10" fill="black" />
          </mask>
        </defs>

        <g fill="none" stroke="#0F3460" strokeOpacity="0.85" strokeWidth="1.6" strokeLinecap="round">
          <path d={LEFT_LINE} />
          <path d={RIGHT_LINE} mask="url(#why-makers-card)" />
        </g>

        <circle r="13" fill="#1A5490">
          <animateMotion {...motion(0.74, 9, LEFT_TRACK)} />
        </circle>
        <g mask="url(#why-makers-card)">
          <circle r="11" fill="#8FB3E0">
            <animateMotion {...motion(0.141, 11, RIGHT_TRACK)} />
          </circle>
        </g>
      </svg>
    </div>
  );
}
