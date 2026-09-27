import type Lenis from 'lenis';

/** The app's Lenis instance, registered by <SmoothScroll>. */
let instance: Lenis | null = null;

export function registerLenis(lenis: Lenis | null) {
  instance = lenis;
}

/**
 * Freezes scrolling and drops any pending momentum. Called when a scroll-driven redirect
 * completes, so leftover wheel input can't carry over into the destination page.
 * <SmoothScroll> restarts it on the next route.
 */
export function haltScroll() {
  instance?.stop();
}

/**
 * Smoothly scrolls the page to `y` (px from the top) through Lenis, so ScrollTrigger scrubs follow
 * it; falls back to native smooth scrolling. `onComplete` runs once the page has arrived.
 */
export function scrollToY(y: number, { duration = 1, onComplete }: { duration?: number; onComplete?: () => void } = {}) {
  if (instance) {
    instance.scrollTo(y, { duration, force: true, onComplete: () => onComplete?.() });
    return;
  }
  window.scrollTo({ top: y, behavior: 'smooth' });
  if (onComplete) window.setTimeout(onComplete, duration * 1000);
}
