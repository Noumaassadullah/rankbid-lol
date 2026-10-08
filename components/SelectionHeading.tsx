import type { ReactNode } from 'react';

interface SelectionHeadingProps {
  /** Light first line, e.g. "top" */
  lead: string;
  /** Bold words shown inside the selection highlight, e.g. "rankings" */
  highlight: string;
  /** Optional line under the heading */
  sub?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

/**
 * Section heading drawn like a text selection: a light lead line, then bold words in a
 * tinted box with a handle bar and dot at each end. Uses the site's navy + emerald theme.
 */
export default function SelectionHeading({ lead, highlight, sub, align = 'left', className = '' }: SelectionHeadingProps) {
  const centered = align === 'center';

  return (
    <div className={`${centered ? 'text-center' : ''} ${className}`}>
      <h2 className="text-[#0B2545] leading-[0.95] tracking-[-0.03em]">
        <span className="block text-3xl sm:text-4xl md:text-5xl font-light">{lead}</span>
        <span className="relative inline-block mt-2 px-2 sm:px-2.5 py-0.5 bg-[#0F3460]/[0.09] text-3xl sm:text-4xl md:text-5xl font-bold">
          {highlight}
          <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#059669]">
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#059669]" />
          </span>
          <span aria-hidden="true" className="absolute right-0 top-0 bottom-0 w-[3px] bg-[#059669]">
            <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#059669]" />
          </span>
        </span>
      </h2>
      {sub && (
        <p className={`mt-5 sm:mt-6 text-sm sm:text-base text-[#1F2937]/65 max-w-xl ${centered ? 'mx-auto' : ''}`}>{sub}</p>
      )}
    </div>
  );
}
