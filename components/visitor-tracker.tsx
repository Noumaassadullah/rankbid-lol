'use client';

import { useEffect } from 'react';

export function VisitorTracker() {
  useEffect(() => {
    const trackVisit = async () => {
      try {
        // Get or create session ID
        let sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          localStorage.setItem('sessionId', sessionId);
        }

        const pageUrl = window.location.pathname;

        const response = await fetch('/api/track-visitor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            pageUrl,
          }),
        });

        const data = await response.json();
        console.log('[CLIENT] Visitor tracked:', data);
      } catch (error) {
        console.error('[CLIENT] Failed to track visitor:', error);
      }
    };

    // Track on page load
    trackVisit();

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
  }, []);

  return null;
}
