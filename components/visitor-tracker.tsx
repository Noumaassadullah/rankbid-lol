'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const trackVisit = async () => {
      try {
        // Get or create session ID
        let sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          localStorage.setItem('sessionId', sessionId);
        }

        const response = await fetch('/api/track-visitor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            pageUrl: pathname,
          }),
        });

        const data = await response.json();
        console.log('[CLIENT] Visitor tracked on', pathname, ':', data);
      } catch (error) {
        console.error('[CLIENT] Failed to track visitor:', error);
      }
    };

    // Track every page navigation
    trackVisit();
  }, [pathname]);

  // Periodic tracking for idle time
  useEffect(() => {
    const trackVisit = async () => {
      try {
        const sessionId = localStorage.getItem('sessionId');
        if (sessionId) {
          await fetch('/api/track-visitor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              pageUrl: pathname,
            }),
          });
        }
      } catch (error) {
        console.error('[CLIENT] Periodic tracking failed:', error);
      }
    };

    // Track every 5 minutes
    const interval = setInterval(trackVisit, 5 * 60 * 1000);

    // Track when tab becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        trackVisit();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname]);

  return null;
}
