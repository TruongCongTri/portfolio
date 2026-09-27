import type { Ref } from 'react';
import styles from './RedirectIndicator.module.css';

type RedirectIndicatorProps = {
  /** Root element; parents animate it (fade in, completion pulse) with GSAP. */
  ref?: Ref<HTMLDivElement>;
  /** Progress arc: drive `strokeDashoffset` from 100 (empty) to 0 (full). */
  ringRef: Ref<SVGCircleElement>;
  direction: 'up' | 'down';
  /** Start hidden (the parent reveals it once the gesture begins). */
  concealed?: boolean;
};

/**
 * Progress ring with an arrow, placed beside a project title and drawn in the surrounding text
 * color. Fills while the user scrolls toward the previous/next project.
 */
export default function RedirectIndicator({ ref, ringRef, direction, concealed = false }: RedirectIndicatorProps) {
  return (
    <div
      ref={ref}
      className={`${styles.indicator} ${styles[direction]} ${concealed ? styles.concealed : ''}`}
      aria-hidden
    >
      <svg className={styles.svg} viewBox="0 0 64 64">
        <circle className={styles.track} cx="32" cy="32" r="28" />
        <circle ref={ringRef} className={styles.progress} cx="32" cy="32" r="28" pathLength={100} />
      </svg>
      <svg className={styles.arrow} viewBox="0 0 24 24">
        <path d="M12 5v14M6 13l6 6 6-6" />
      </svg>
    </div>
  );
}
