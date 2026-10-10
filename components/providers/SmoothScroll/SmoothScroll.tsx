'use client';

import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { registerLenis } from '@/lib/smoothScroll';

/** Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in lockstep. Renders nothing. */
export default function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1, anchors: true, autoRaf: false, allowNestedScroll: true });
    lenisRef.current = lenis;
    registerLenis(lenis);

    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
      registerLenis(null);
    };
  }, []);

  // Scroll triggers measure where they start and end when they're created. Anything that changes the page's
  // height afterwards (rows loading in, the list switching to the grid on phones, images, fonts) leaves them
  // pointing at the wrong place: the pinned scatter scene then starts early or late and its images jump.
  // Watching the page's height and re-measuring (debounced) keeps every trigger honest.
  useEffect(() => {
    let timer: number | undefined;
    const observer = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    });
    observer.observe(document.body);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  // Next resets the native scroll position on navigation; make Lenis agree instead of easing back,
  // and resume it if a scroll-driven redirect halted it (see haltScroll).
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (!window.location.hash) lenis.scrollTo(0, { immediate: true, force: true });
    lenis.start();
  }, [pathname]);

  return null;
}
