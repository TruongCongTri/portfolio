'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { clearSeamlessNavigation, consumeCurtainNavigation, isSeamlessNavigation } from '@/lib/transition';

// Re-mounts on every navigation, so each page fades in — except seamless project hand-offs
// (the destination hero is already on screen) and curtain transitions (the curtain hides the swap).
// Opacity only: a transform here would break ScrollTrigger pins (position: fixed) inside pages.
export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Children's effects run before this one, so they've already read the flag.
    if (isSeamlessNavigation()) return clearSeamlessNavigation();
    if (consumeCurtainNavigation()) return;
    gsap.from(ref.current, { autoAlpha: 0, duration: 0.9, ease: 'power2.out', clearProps: 'all' });
  });

  return <div ref={ref}>{children}</div>;
}
