'use client';

import { useRef } from 'react';
import { gsap, PLAY_ONCE, useGSAP } from '@/lib/gsap';
import styles from './Services.module.css';

type ServiceCardProps = {
  index: number;
  title: string;
  description: string;
  /** Adds the sparkle before the title. */
  highlight?: boolean;
};

export default function ServiceCard({ index, title, description, highlight }: ServiceCardProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap
        .timeline({
          delay: index * 0.12,
          scrollTrigger: { trigger: ref.current, start: 'top 85%', ...PLAY_ONCE },
        })
        .from(`.${styles.rule}`, { scaleX: 0, duration: 1.4, ease: 'expo.inOut' })
        .from(`.${styles.index}, .${styles.cardTitle}, .${styles.description}`, {
          y: 30,
          autoAlpha: 0,
          duration: 1,
          ease: 'expo.out',
          stagger: 0.08,
        }, 0.3);
      // Only the highlighted card has a sparkle.
      if (highlight) tl.from(`.${styles.sparkle}`, { scale: 0, rotate: -180, duration: 1.2, ease: 'back.out(2)' }, 0.6);
    },
    { scope: ref, dependencies: [highlight] },
  );

  return (
    <article ref={ref} className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.index}>
          {/* One span per digit so ServicesGrid can animate them separately */}
          {String(index + 1).padStart(2, '0').split('').map((digit, i) => (
            <span key={i} className={styles.digit}>
              {digit}
            </span>
          ))}
        </span>
        <span className={styles.rule}>
          {/* Filled in turn by ServicesGrid's 01 → 05 loop */}
          <span className={styles.progress} />
        </span>
      </div>
      <h3 className={styles.cardTitle}>
        {highlight && (
          <svg className={styles.sparkle} viewBox="0 0 24 24" aria-hidden>
            <path d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0z" />
          </svg>
        )}
        {title}
      </h3>
      <p className={styles.description}>{description}</p>
    </article>
  );
}
