'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import styles from './Services.module.css';

/** Seconds each step's bar takes to fill. */
const STEP = 2.4;
/** Seconds to wait after the grid enters, so the cards' rules have drawn in first. */
const START_DELAY = 1.6;
/** Accent for the active number (same coral as the sparkle). */
const ACCENT = '#ff5a4e';
const INK = '#f3f3f3';
/** How much larger the active step's number grows (the others stay at 1). */
const ACTIVE_SCALE = 1.5;

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

      /**
       * The active step's number glitches: the digits tear apart in red/cyan, jitter and skew in
       * three bursts spread over the step (matching its progress bar), tinted coral in between,
       * and are clean again when the step ends.
       */
      const split = '-3px 0 #ff2d55, 3px 0 #00e5ff';
      const clean = '0px 0 rgba(255,45,85,0), 0px 0 rgba(0,229,255,0)';
      const glitch = (digits: HTMLElement[], at: number) => {
        const burst = (t: number) =>
          loop.to(
            digits,
            {
              keyframes: [
                { x: -4, skewX: 24, textShadow: split },
                { x: 5, skewX: -18, textShadow: '4px 0 #ff2d55, -4px 0 #00e5ff' },
                { x: -2, skewX: 8, textShadow: split },
                { x: 3, skewX: -30, textShadow: '5px 0 #ff2d55, -5px 0 #00e5ff' },
                { x: 0, skewX: 0, textShadow: split },
                { x: 0, skewX: 0, textShadow: clean },
              ],
              duration: 0.7,
              ease: 'none',
              stagger: 0.06,
            },
            at + t,
          );
        loop.set(digits, { textShadow: clean }, at);
        [0, 0.85, 1.7].forEach(burst);
        loop
          .to(digits, { color: ACCENT, duration: 0.3 }, at)
          .to(digits, { color: INK, duration: 0.4 }, at + STEP - 0.5);
      };

      bars.forEach((bar, i) => {
        const at = i * STEP;
        loop
          .fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: STEP, ease: 'none', immediateRender: false }, at)
          .to(indices[i], { opacity: 1, duration: 0.3, ease: 'power1.out' }, at)
          .to(indices[i], { opacity: 0.55, duration: 0.5, ease: 'power1.inOut' }, at + STEP);
        const digits = gsap.utils.toArray<HTMLElement>(`.${styles.digit}`, indices[i]);
        glitch(digits, at);
        // The active number is also bigger than the rest for the whole step
        loop
          .to(indices[i], { scale: ACTIVE_SCALE, duration: 0.5, ease: 'back.out(2)' }, at)
          .to(indices[i], { scale: 1, duration: 0.5, ease: 'power2.inOut' }, at + STEP - 0.5);
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
