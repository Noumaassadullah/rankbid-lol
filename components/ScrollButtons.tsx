'use client';

import { useEffect, useState } from 'react';

// Floating up/down buttons on the right edge. "Top" appears once the visitor has scrolled
// past the first screen; "bottom" hides when they are already near the end of the page.
export default function ScrollButtons() {
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(false);

  useEffect(() => {
    const update = () => {
      const { scrollY, innerHeight } = window;
      const max = document.documentElement.scrollHeight - innerHeight;
      setShowTop(scrollY > 300);
      setShowBottom(max > 300 && scrollY < max - 300);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const button =
    'flex h-11 w-11 items-center justify-center rounded-full bg-[#0B2545] text-white shadow-lg ring-1 ring-white/10 transition-all duration-200 hover:bg-[#3B4CCA] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B4CCA] focus-visible:ring-offset-2';
  const hidden = 'pointer-events-none opacity-0 translate-y-2';

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-40 flex flex-col gap-2">
      <button
        type="button"
        aria-label="Scroll to top"
        title="Scroll to top"
        tabIndex={showTop ? 0 : -1}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`${button} ${showTop ? '' : hidden}`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Scroll to bottom"
        title="Scroll to bottom"
        tabIndex={showBottom ? 0 : -1}
        onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })}
        className={`${button} ${showBottom ? '' : hidden}`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
    </div>
  );
}
