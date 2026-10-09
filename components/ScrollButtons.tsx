'use client';

import { useEffect, useState } from 'react';

// Floating "back to top" button on the right edge, shown once the visitor has scrolled
// past the first screen.
export default function ScrollButtons() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const update = () => setShowTop(window.scrollY > 300);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      title="Scroll to top"
      tabIndex={showTop ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-6 right-4 sm:right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[#0B2545] text-white shadow-lg ring-1 ring-white/10 transition-all duration-200 hover:bg-[#3B4CCA] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B4CCA] focus-visible:ring-offset-2 ${showTop ? '' : 'pointer-events-none opacity-0 translate-y-2'}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}
