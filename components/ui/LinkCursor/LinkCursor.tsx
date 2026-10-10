'use client';

import { useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { gsap, useGSAP } from '@/lib/gsap';
import styles from './LinkCursor.module.css';

const subscribeNoop = () => () => {};

/**
 * Wraps a link (e.g. a cover image) with a round follower cursor: it inverts whatever is beneath it
 * (mix-blend-mode: difference), carries a ↗ arrow, scales in/out as the pointer enters/leaves, and
 * trails the native cursor, which stays visible. Portaled to <body> so clip-paths/transforms on
 * ancestors can't clip it or break its fixed positioning.
 */
type LinkCursorProps = {
  children: React.ReactNode;
  className?: string;
  /** `arrow`: the inverting ↗ disc. `portrait`: the small round pixel portrait, no arrow, no inversion. */
  variant?: 'arrow' | 'portrait';
};

export default function LinkCursor({ children, className, variant = 'arrow' }: LinkCursorProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  // Only portal on the client (no document during SSR), without a setState-in-effect round trip.
  const isClient = useSyncExternalStore(subscribeNoop, () => true, () => false);

  useGSAP(
    (_context, contextSafe) => {
      const area = areaRef.current;
      const cursor = cursorRef.current;
      if (!area || !cursor) return;

      gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 0, autoAlpha: 0 });
      // Longer duration = more lag = the "chasing" feel.
      const xTo = gsap.quickTo(cursor, 'x', { duration: 0.55, ease: 'power3.out' });
      const yTo = gsap.quickTo(cursor, 'y', { duration: 0.55, ease: 'power3.out' });

      const onEnter = contextSafe!((e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        // Start from the pointer rather than flying in from wherever it last was.
        gsap.set(cursor, { x: e.clientX, y: e.clientY });
        xTo(e.clientX);
        yTo(e.clientY);
        gsap.to(cursor, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'expo.out', overwrite: 'auto' });
      });
      const onMove = contextSafe!((e: PointerEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
      });
      const onLeave = contextSafe!(() => {
        gsap.to(cursor, { scale: 0, autoAlpha: 0, duration: 0.4, ease: 'power3.in', overwrite: 'auto' });
      });

      area.addEventListener('pointerenter', onEnter);
      area.addEventListener('pointermove', onMove);
      area.addEventListener('pointerleave', onLeave);
      return () => {
        area.removeEventListener('pointerenter', onEnter);
        area.removeEventListener('pointermove', onMove);
        area.removeEventListener('pointerleave', onLeave);
      };
    },
    { dependencies: [isClient] },
  );

  return (
    <div ref={areaRef} className={className}>
      {children}
      {isClient &&
        createPortal(
          <div ref={cursorRef} className={`${styles.cursor} ${variant === 'portrait' ? styles.portrait : ''}`} aria-hidden>
            {variant === 'portrait' ? (
              <Image className={styles.face} src="/icons/icon-192.png" alt="" width={72} height={72} unoptimized />
            ) : (
              <svg className={styles.arrow} viewBox="0 0 24 24">
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
