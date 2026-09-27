'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import styles from './TypingDots.module.css';

export default function TypingDots() {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        `.${styles.dot}`,
        { scale: 0.6, opacity: 0.3 },
        {
          scale: 1.15,
          opacity: 1,
          duration: 0.5,
          ease: 'sine.inOut',
          stagger: { each: 0.2, repeat: -1, yoyo: true, repeatDelay: 0.2 },
        },
      );
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={styles.dots} aria-hidden>
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
    </span>
  );
}
