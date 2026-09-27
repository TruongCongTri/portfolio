'use client';

import { useRef } from 'react';
import { gsap, PLAY_ONCE, useGSAP } from '@/lib/gsap';
import styles from './MetaBar.module.css';

type MetaBarProps = {
  /** Left-aligned label. */
  start: React.ReactNode;
  /** Label centred on the bar (or, with `columns`, at the start of the second column). */
  center: React.ReactNode;
  /**
   * Split the labels into two equal columns separated by `--columns-gap`, so the second label
   * lines up with the second column of a two-column layout below the bar.
   */
  columns?: boolean;
  className?: string;
};

/**
 * Full-width rule in the current text color with small labels beneath it (same type style as the
 * gallery counter). The rule draws in from the left, then the labels rise, as it scrolls into view.
 */
export default function MetaBar({ start, center, columns = false, className }: MetaBarProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap
        .timeline({ scrollTrigger: { trigger: ref.current, start: 'top 92%', ...PLAY_ONCE } })
        .from(`.${styles.rule}`, { scaleX: 0, duration: 1.4, ease: 'expo.inOut' })
        .from(`.${styles.inner}`, { yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.08 }, 0.5);
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={`${styles.bar} ${className ?? ''}`}>
      <span className={styles.rule} aria-hidden />
      <div className={`${styles.labels} ${columns ? styles.columns : ''}`}>
        <span className={styles.mask}>
          <span className={styles.inner}>{start}</span>
        </span>
        <span className={`${styles.mask} ${styles.center}`}>
          <span className={styles.inner}>{center}</span>
        </span>
      </div>
    </div>
  );
}
