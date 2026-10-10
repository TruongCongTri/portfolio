'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRef, useSyncExternalStore } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { useI18n } from '@/lib/i18n/client';
import { site } from '@/lib/site';
import Marquee from '@/components/ui/Marquee/Marquee';
import styles from './Hero.module.css';

// WebGL (three.js) only loads in the browser, after the page has painted: the static image below is
// what renders first (and what search engines see).
const ChromaticPortrait = dynamic(() => import('../ChromaticPortrait/ChromaticPortrait'), { ssr: false });

/** The cursor effect is for desktop pointers only; touch and small screens keep the static image. */
const EFFECT_QUERY = '(min-width: 1024px) and (hover: hover)';
const subscribeEffect = (onChange: () => void) => {
  const query = window.matchMedia(EFFECT_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};
const effectEnabled = () => window.matchMedia(EFFECT_QUERY).matches;

/** Pixels the portrait drifts, against the cursor, at the hero's edges. */
const PARALLAX = 5;

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const fallbackRef = useRef<HTMLImageElement>(null);
  const { t } = useI18n();
  const { width, height } = site.portrait;
  const withEffect = useSyncExternalStore(subscribeEffect, effectEnabled, () => false);

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

  // A slight parallax: the portrait drifts a few pixels away from the cursor over the hero.
  useGSAP(
    (_context, contextSafe) => {
      const hero = ref.current!;
      const x = gsap.quickTo(`.${styles.parallax}`, 'x', { duration: 0.8, ease: 'power3.out' });
      const y = gsap.quickTo(`.${styles.parallax}`, 'y', { duration: 0.8, ease: 'power3.out' });
      const onMove = contextSafe!((e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        const rect = hero.getBoundingClientRect();
        x(-((e.clientX - rect.left) / rect.width - 0.5) * 2 * PARALLAX);
        y(-((e.clientY - rect.top) / rect.height - 0.5) * 2 * PARALLAX);
      });
      const onLeave = contextSafe!(() => {
        x(0);
        y(0);
      });
      hero.addEventListener('pointermove', onMove);
      hero.addEventListener('pointerleave', onLeave);
      return () => {
        hero.removeEventListener('pointermove', onMove);
        hero.removeEventListener('pointerleave', onLeave);
      };
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

      <div className={`${styles.portrait}`} style={{ aspectRatio: `${width} / ${height}`, '--ratio': width / height } as React.CSSProperties}>
        <div className={styles.parallax}>
          {/*
            Shown until the WebGL version is ready. The page's largest image, so it's preloaded.
            `unoptimized`: it's already an optimized WebP, and serving it from its own (hashed) URL
            lets the WebGL texture below reuse the same download instead of fetching a second copy.
          */}
          <Image
            ref={fallbackRef}
            src={site.portrait}
            alt={site.name}
            preload
            fetchPriority="high"
            unoptimized
            sizes="50vh"
            className={styles.portraitImage}
          />
          {withEffect && (
            <ChromaticPortrait
              src={site.portrait.src}
              alt={site.name}
              onReady={() => gsap.to(fallbackRef.current, { autoAlpha: 0, duration: 0.3 })}
            />
          )}
        </div>
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
