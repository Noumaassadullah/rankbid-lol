'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Next.js skips sticky elements (our header and category bar) when deciding whether a new
// page is "already in view", so links clicked far down a page kept the old scroll position
// and landed on the footer. Start every new page at the top instead. Back/forward keeps the
// browser's restored position, and #hash links keep scrolling to their target.
export default function ScrollToTop() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  const isHistoryNav = useRef(false);

  useEffect(() => {
    const onPopState = () => { isHistoryNav.current = true; };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isHistoryNav.current) {
      isHistoryNav.current = false;
      return;
    }
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
