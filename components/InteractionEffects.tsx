'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Site-wide polish, mounted once in the root layout:
 * - cursor spotlight on `.spotlight` / `.spotlight-light` elements (mouse/trackpad only)
 * - scroll reveal for sections that start below the first screen
 * - a thin reading-progress bar at the top
 * All effects are skipped for visitors who prefer reduced motion.
 */
export default function InteractionEffects() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);

  // Cursor spotlight + scroll progress (set up once).
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    let frame = 0;

    const onPointerMove = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest<HTMLElement>('.spotlight, .spotlight-light');
      if (!target) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = target.getBoundingClientRect();
        target.style.setProperty('--mx', `${e.clientX - r.left}px`);
        target.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    };

    // The page height is cached (refreshed when the page resizes) and the bar is updated at most once
    // per frame: reading scrollHeight on every scroll event forced a full layout each time.
    let maxScroll = 0;
    let scrollFrame = 0;
    const measure = () => {
      maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    };
    const paint = () => {
      scrollFrame = 0;
      const progress = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
      barRef.current?.style.setProperty('--progress', String(progress));
    };
    const onScroll = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(paint);
    };
    const resizeObserver = new ResizeObserver(() => {
      measure();
      onScroll();
    });
    resizeObserver.observe(document.documentElement);

    if (finePointer && !reduced) document.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    measure();
    paint();

    return () => {
      document.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      resizeObserver.disconnect();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(scrollFrame);
    };
  }, []);

  // Scroll reveal, re-run on every route change (new page content).
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    // Wait a tick so the new page has rendered its sections.
    const timer = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>('main section, body > div section').forEach(section => {
        if (section.classList.contains('reveal') || section.closest('.no-reveal')) return;
        // Leave anything already on screen alone so nothing above the fold flickers.
        if (section.getBoundingClientRect().top < window.innerHeight * 0.9) return;
        section.classList.add('reveal');
        io.observe(section);
      });
    }, 60);

    return () => {
      window.clearTimeout(timer);
      io.disconnect();
    };
  }, [pathname]);

  // Reset the progress bar when the route changes.
  useEffect(() => {
    barRef.current?.style.setProperty('--progress', '0');
  }, [pathname]);

  return <div ref={barRef} className="scroll-progress" aria-hidden="true" />;
}
