'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import styles from './Services.module.css';

/** Seconds each step's bar takes to fill. */
const STEP = 2.4;
/** Seconds to wait after the grid enters, so the cards' rules have drawn in first. */
const START_DELAY = 1.6;

/**
 * The service cards' grid, stepping through them as a looping process: card 01's bar fills, then
 * 02's, … up to 05; the active step's number lights up; then every bar clears and it starts over.
 * Runs only while the grid is on screen.
 */
export default function ServicesGrid({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const bars = gsap.utils.toArray<HTMLElement>(`.${styles.progress}`);
      const indices = gsap.utils.toArray<HTMLElement>(`.${styles.index}`);
      if (!bars.length) return;

      const loop = gsap.timeline({ repeat: -1, paused: true });
      bars.forEach((bar, i) => {
        const at = i * STEP;
        loop
          .fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: STEP, ease: 'none', immediateRender: false }, at)
          .to(indices[i], { opacity: 1, duration: 0.3, ease: 'power1.out' }, at)
          .to(indices[i], { opacity: 0.55, duration: 0.5, ease: 'power1.inOut' }, at + STEP);
      });
      // All five full for a beat, then clear together before the next round.
      loop.to(bars, { autoAlpha: 0, duration: 0.5, ease: 'power1.in' }, `+=0.5`);
      loop.set(bars, { scaleX: 0, autoAlpha: 1 });

      const start = gsap.delayedCall(START_DELAY, () => loop.play()).pause();
      gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          end: 'bottom top',
          onEnter: () => (loop.progress() ? loop.resume() : start.restart(true)),
          onEnterBack: () => (loop.progress() ? loop.resume() : start.restart(true)),
          onLeave: () => (start.pause(), loop.pause()),
          onLeaveBack: () => (start.pause(), loop.pause()),
        },
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={styles.grid}>
      {children}
    </div>
  );
}
