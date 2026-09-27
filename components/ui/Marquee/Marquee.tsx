'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import styles from './Marquee.module.css';

type MarqueeProps = {
  text: string;
  /** Seconds for one full loop. */
  duration?: number;
  className?: string;
};

export default function Marquee({ text, duration = 38, className }: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  // The text is rendered twice, so shifting by -50% lands on an identical frame and loops seamlessly.
  useGSAP(() => {
    gsap.to(trackRef.current, { xPercent: -50, duration, ease: 'none', repeat: -1 });
  });

  return (
    <div className={`${styles.marquee} ${className ?? ''}`}>
      <div ref={trackRef} className={styles.track}>
        <span>{text}&nbsp;</span>
        <span aria-hidden>{text}&nbsp;</span>
      </div>
    </div>
  );
}
