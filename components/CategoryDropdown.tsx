'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

export interface CategoryOption {
  key: string;
  href: string;
  label: string;
  count: number;
  active: boolean;
}

// Category picker that floats over the page. Built on <details> so the links are in the
// server HTML (crawlable, and it opens even before JavaScript loads); JS only adds
// close-on-outside-click and Escape.
export default function CategoryDropdown({ label, count, options }: {
  label: string;
  count: number;
  options: CategoryOption[];
}) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const close = () => ref.current?.removeAttribute('open');
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current?.open && !ref.current.contains(e.target as Node)) close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && ref.current?.open) {
        close();
        ref.current.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <details ref={ref} className="group relative w-full sm:max-w-md">
      <summary className="list-none [&::-webkit-details-marker]:hidden flex items-center justify-between gap-3 px-4 py-2.5 sm:py-3 bg-white text-[#0F3460] rounded-xl shadow-lg shadow-black/20 cursor-pointer select-none font-bold text-sm sm:text-base">
        <span className="truncate">
          {label}
          <span className="ml-2 font-semibold text-[#0F3460]/50 tabular-nums">{count}</span>
        </span>
        <svg className="w-4 h-4 shrink-0 transition-transform duration-150 group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </summary>

      <nav
        aria-label="Categories"
        className="absolute left-0 right-0 top-full mt-2 z-30 bg-white rounded-xl shadow-2xl shadow-black/25 border border-gray-200 overflow-hidden"
      >
        <ul className="max-h-80 overflow-y-auto py-1.5">
          {options.map(option => (
            <li key={option.key}>
              <Link
                href={option.href}
                aria-current={option.active ? 'page' : undefined}
                onClick={() => ref.current?.removeAttribute('open')}
                className={`flex items-center justify-between gap-3 px-4 py-2 text-sm font-semibold transition-colors ${
                  option.active ? 'bg-[#0F3460] text-white' : 'text-[#1F2937] hover:bg-gray-100'
                }`}
              >
                <span>{option.label}</span>
                {option.count > 0 && (
                  <span className={`tabular-nums text-xs ${option.active ? 'text-white/70' : 'text-[#1F2937]/40'}`}>{option.count}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}
