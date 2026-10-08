'use client';

import { useEffect, useRef, useState } from 'react';

// How much scrolling (in screen heights) it takes to play the whole video.
const SCROLL_SCREENS = 3;

/**
 * Full-screen video pinned while you scroll past it: scrolling down plays it forward,
 * scrolling up plays it back. Once it ends, the page carries on to the next section.
 */
export default function ScrollVideo({ src }: { src: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [blobSrc, setBlobSrc] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Load the whole file up front: seeking (especially backwards) is smooth only once it's all buffered.
  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    fetch(src)
      .then(r => (r.ok ? r.blob() : Promise.reject()))
      .then(blob => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setBlobSrc(url);
      })
      .catch(() => !cancelled && setBlobSrc(src));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [src]);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video || !blobSrc) return;

    // Reduced motion: no scrubbing, just show the last frame.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setProgress(1);
      const showEnd = () => { video.currentTime = video.duration || 0; };
      if (video.readyState >= 1) showEnd();
      else video.addEventListener('loadedmetadata', showEnd, { once: true });
      return () => video.removeEventListener('loadedmetadata', showEnd);
    }

    let target = 0;
    let current = 0;
    let frame = 0;

    const readScroll = () => {
      const rect = section.getBoundingClientRect();
      const scrollable = section.offsetHeight - window.innerHeight;
      const p = scrollable > 0 ? Math.min(Math.max(-rect.top / scrollable, 0), 1) : 0;
      setProgress(p);
      target = p * (video.duration || 0);
    };

    // Ease the video toward the scroll position so fast flicks don't jump.
    const tick = () => {
      if (video.duration) {
        current += (target - current) * 0.18;
        if (Math.abs(target - current) < 0.01) current = target;
        if (Math.abs(video.currentTime - current) > 0.01) video.currentTime = current;
      }
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      readScroll();
      current = target;
      video.currentTime = current;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    };

    // iOS Safari only paints seeked frames after the video has played once.
    video.play().then(() => video.pause()).catch(() => {});

    if (video.readyState >= 1) start();
    else video.addEventListener('loadedmetadata', start, { once: true });

    window.addEventListener('scroll', readScroll, { passive: true });
    window.addEventListener('resize', readScroll);
    return () => {
      cancelAnimationFrame(frame);
      video.removeEventListener('loadedmetadata', start);
      window.removeEventListener('scroll', readScroll);
      window.removeEventListener('resize', readScroll);
    };
  }, [blobSrc]);

  return (
    <section
      ref={sectionRef}
      aria-label="Intro video"
      className="relative bg-black no-reveal"
      style={{ height: `${SCROLL_SCREENS * 100 + 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {blobSrc ? (
          <video
            ref={videoRef}
            src={blobSrc}
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-black animate-pulse" />
        )}

        {/* Soft fade into the page as the video finishes */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#FAFBFD] to-transparent pointer-events-none transition-opacity"
          style={{ opacity: Math.max(0, (progress - 0.75) / 0.25) }}
        />

        {/* Scroll hint, gone once scrolling starts */}
        <div
          aria-hidden="true"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/80 text-xs font-semibold tracking-[0.2em] uppercase pointer-events-none transition-opacity duration-500"
          style={{ opacity: progress < 0.03 ? 1 : 0 }}
        >
          Scroll
          <span className="w-5 h-8 rounded-full border-2 border-white/60 flex justify-center pt-1.5">
            <span className="w-1 h-2 rounded-full bg-white/80 animate-bounce" />
          </span>
        </div>
      </div>
    </section>
  );
}
