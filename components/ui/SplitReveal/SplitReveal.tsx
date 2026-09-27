'use client';

import { useRef, type ElementType } from 'react';
import { gsap, SplitText, useGSAP } from '@/lib/gsap';
import { isSeamlessNavigation } from '@/lib/transition';
import styles from './SplitReveal.module.css';

type SplitRevealProps = {
  children: React.ReactNode;
  as?: ElementType;
  className?: string;
  /** Unit that slides up from under its mask. */
  split?: 'lines' | 'words' | 'chars';
  /** `load` plays after `delay`; `scroll` plays when the element enters the viewport. */
  on?: 'load' | 'scroll';
  delay?: number;
  stagger?: number;
  duration?: number;
};

/**
 * Text that rises out of per-line (or word/char) masks. Uses SplitText's autoSplit so lines are
 * re-measured when fonts load or the viewport resizes.
 */
export default function SplitReveal({
  children,
  as: Tag = 'div',
  className,
  split = 'lines',
  on = 'scroll',
  delay = 0,
  stagger = 0.08,
  duration = 1.1,
}: SplitRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current!;
      // Arriving via a seamless hand-off: the content is already on screen, don't replay it.
      const skip = isSeamlessNavigation();
      let played = false;

      SplitText.create(el, {
        type: split === 'chars' ? 'words,chars' : split,
        mask: split,
        autoSplit: true,
        onSplit(self) {
          const targets = self[split];
          // Re-splits after the intro (resize, font swap) must not replay it.
          if (skip || played) return;
          return gsap.from(targets, {
            yPercent: 110,
            duration,
            stagger,
            delay,
            ease: 'expo.out',
            onComplete: () => (played = true),
            scrollTrigger: on === 'scroll' ? { trigger: el, start: 'top 88%', once: true } : undefined,
          });
        },
      });
      gsap.set(el, { visibility: 'visible' });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={`${styles.reveal} ${className ?? ''}`}>
      {children}
    </Tag>
  );
}
