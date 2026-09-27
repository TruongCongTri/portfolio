'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { useI18n } from '@/lib/i18n/client';
import { site } from '@/lib/site';
import Marquee from '@/components/ui/Marquee/Marquee';
import ChromaticPortrait from '../ChromaticPortrait/ChromaticPortrait';
import styles from './Hero.module.css';

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { t } = useI18n();

  useGSAP(
    () => {
      // Intro
      gsap
        .timeline({ defaults: { ease: 'expo.out' }, delay: 0.1 })
        .from(`.${styles.marqueeMask} > *`, { yPercent: 105, duration: 1.6 })
        .from(`.${styles.portrait}`, { yPercent: 18, autoAlpha: 0, duration: 1.8 }, 0.15)
        .from(`.${styles.rule}`, { scaleX: 0, duration: 1.6, ease: 'expo.inOut' }, 0.3)
        .from(`.${styles.metaInner}`, { yPercent: 110, duration: 1.1, stagger: 0.06 }, 0.8);

      // Scroll: the portrait sinks and the marquee lifts as the hero leaves.
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true },
        })
        .to(`.${styles.marqueeMask}`, { yPercent: -60 }, 0)
        .to(`.${styles.portrait}`, { yPercent: 12 }, 0)
        .to(`.${styles.bottom}`, { autoAlpha: 0, y: -40 }, 0);
    },
    { scope: ref },
  );

  const meta = (lines: string[]) =>
    lines.map((line) => (
      <span key={line} className={styles.metaMask}>
        <span className={styles.metaInner}>{line}</span>
      </span>
    ));

  return (
    <section ref={ref} className={styles.hero}>
      <div className={styles.marqueeMask}>
        <Marquee text={t.hero.marquee} />
      </div>

      <div className={styles.portrait}>
        <ChromaticPortrait src={site.portrait} alt={site.name} />
      </div>

      <div className={styles.bottom}>
        <span className={styles.rule} />
        <div className={styles.meta}>{meta(t.hero.roles)}</div>
        <div className={`${styles.meta} ${styles.right}`}>{meta([t.hero.locatedIn, t.hero.location])}</div>
      </div>

      <div className={styles.fade} aria-hidden />
    </section>
  );
}
