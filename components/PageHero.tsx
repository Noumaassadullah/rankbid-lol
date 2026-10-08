import type { CSSProperties, ReactNode } from 'react';
import SelectionHeading, { splitTitle } from '@/components/SelectionHeading';

// Navy gradient page header shared by content pages (rules, terms, stats, ...).
// The title's last word is drawn as a text-selection highlight, unless `lead`/`highlight` are given.
export default function PageHero({
  title,
  lead,
  highlight,
  subtitle,
  children,
}: {
  title: string;
  lead?: string;
  highlight?: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  const parts = highlight ? { lead, highlight } : splitTitle(title);

  return (
    <section className="spotlight relative overflow-hidden bg-gradient-to-br from-[#0B2545] via-[#0F3460] to-[#1a5490] text-white">
      <div className="absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 -right-16 w-72 h-72 bg-[#1a5490] rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-[#059669] rounded-full blur-3xl"></div>
      </div>
      <div className="relative max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-10 sm:py-14 md:py-20">
        <SelectionHeading
          as="h1"
          tone="dark"
          lead={parts.lead}
          highlight={parts.highlight}
          style={{ '--d': '0ms' } as CSSProperties}
          className="slide-up"
        />
        {subtitle && (
          <p style={{ '--d': '120ms' } as CSSProperties} className="slide-up mt-5 sm:mt-6 text-sm sm:text-base md:text-lg text-white/75 font-medium max-w-2xl">{subtitle}</p>
        )}
        {children}
      </div>
    </section>
  );
}
