import type { CSSProperties, ReactNode } from 'react';

// Navy gradient page header shared by content pages (rules, terms, stats, ...).
export default function PageHero({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <section className="spotlight relative overflow-hidden bg-gradient-to-br from-[#0B2545] via-[#0F3460] to-[#1a5490] text-white">
      <div className="absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 -right-16 w-72 h-72 bg-[#1a5490] rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-[#059669] rounded-full blur-3xl"></div>
      </div>
      <div className="relative max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-12 md:py-16">
        <h1 style={{ '--d': '0ms' } as CSSProperties} className="slide-up text-2xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-3">{title}</h1>
        {subtitle && (
          <p style={{ '--d': '120ms' } as CSSProperties} className="slide-up text-sm sm:text-base md:text-lg text-white/75 font-medium max-w-2xl">{subtitle}</p>
        )}
        {children}
      </div>
    </section>
  );
}
