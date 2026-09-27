'use client';

import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from '@/lib/gsap';
import { useI18n } from '@/lib/i18n/client';
import type { Project } from '@/lib/projects';
import ContactTrigger from '@/components/contact/ContactTrigger/ContactTrigger';
import styles from './ScatterScene.module.css';

/** Where each card sits (percent of the stage) and the direction it flies when scattered. */
const CARD_LAYOUT = [
  { left: 16, top: 12, dx: -1.1, dy: -0.9 },
  { left: 78, top: 12, dx: 1.1, dy: -1 },
  { left: 22, top: 40, dx: -1.3, dy: -0.1 },
  { left: 70, top: 34, dx: 1.3, dy: -0.2 },
  { left: 8, top: 78, dx: -1, dy: 1 },
  { left: 58, top: 76, dx: 0.6, dy: 1.2 },
];

/**
 * Pinned scroll scene in three beats:
 * 1. project cards scatter outward while a dark frame grows behind the centered line,
 *    whose words light up one by one;
 * 2. the frame expands to fill the screen;
 * 3. the call-to-action rises in.
 */
export default function ScatterScene({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLElement>(null);
  const { t } = useI18n();
  const cards = CARD_LAYOUT.map((layout, i) => ({ ...layout, project: projects[i % projects.length] }));

  useGSAP(
    () => {
      const words = SplitText.create(`.${styles.line}`, { type: 'words' }).words;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: ref.current, start: 'top top', end: '+=320%', pin: true, scrub: 0.8 },
      });

      // 1 — scatter + grow + words light up
      gsap.utils.toArray<HTMLElement>(`.${styles.card}`).forEach((card, i) => {
        const { dx, dy } = CARD_LAYOUT[i];
        tl.to(card, { x: dx * vw * 0.35, y: dy * vh * 0.35, scale: 1.5, autoAlpha: 0, duration: 1 }, 0);
      });
      tl.fromTo(
        `.${styles.frame}`,
        { width: '22vw', height: '14vw', autoAlpha: 0 },
        { width: '72vw', height: '44vw', autoAlpha: 1, duration: 1 },
        0.1,
      );
      tl.fromTo(words, { color: 'var(--color-fg)' }, { color: '#f3f3f3', stagger: 0.12, duration: 0.3 }, 0.45);

      // 2 — fill the screen, the line steps aside
      tl.to(`.${styles.frame}`, { width: '100vw', height: '100vh', duration: 0.9 }, 1.3);
      tl.to(`.${styles.line}`, { yPercent: -120, autoAlpha: 0, duration: 0.5 }, 1.5);

      // 3 — call to action
      tl.from(`.${styles.ctaInner}`, { yPercent: 110, duration: 0.6, stagger: 0.12 }, 1.9);
      tl.from(`.${styles.ctaLink}`, { '--underline': 0, duration: 0.4 }, 2.4);
      tl.to({}, { duration: 0.3 }); // hold at the end before unpinning
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className={styles.scene}>
      {cards.map(({ left, top, project }, i) => (
        <div
          key={i}
          className={styles.card}
          style={{ left: `${left}%`, top: `${top}%`, backgroundColor: project.color }}
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- remote placeholder images */}
          <img src={project.images[0]} alt="" />
        </div>
      ))}

      <div className={styles.frame} aria-hidden />

      <p className={styles.line}>{t.home.scatterLine}</p>

      <h2 className={styles.cta}>
        <span className={styles.ctaMask}>
          <span className={styles.ctaInner}>{t.contact.ctaLine1}</span>
        </span>
        <span className={styles.ctaMask}>
          <span className={styles.ctaInner}>
            {t.contact.ctaLine2}{' '}
            <ContactTrigger className={styles.ctaLink}>{t.contact.ctaLink}</ContactTrigger>
          </span>
        </span>
      </h2>
    </section>
  );
}
