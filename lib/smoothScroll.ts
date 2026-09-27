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
