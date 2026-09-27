'use client';

import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from '@/lib/gsap';
import type { Project } from '@/lib/projects';
import { useI18n } from '@/lib/i18n/client';
import { isSeamlessNavigation } from '@/lib/transition';
import LinkCursor from '@/components/ui/LinkCursor/LinkCursor';
import styles from './ProjectHero.module.css';

type ProjectHeroProps = {
  project: Project;
  /**
   * Rendered as the next-project hand-off at the bottom of another project: no intro animation,
   * and must stay pixel-identical to the real hero so the route change is invisible.
   */
  handoff?: boolean;
  /**
   * Placed beside the title (the previous/next progress ring). Absolutely positioned, so the
   * hero's layout stays identical between the real page and the hand-off.
   */
  leading?: React.ReactNode;
};

export default function ProjectHero({ project, handoff = false, leading }: ProjectHeroProps) {
  const ref = useRef<HTMLElement>(null);
  const t = useI18n().t.project;

  useGSAP(
    () => {
      if (handoff || isSeamlessNavigation()) return;
      const chars = SplitText.create(`.${styles.title}`, { type: 'chars', mask: 'chars' }).chars;
      gsap
        .timeline({ defaults: { ease: 'expo.out' }, delay: 0.1 })
        .from(chars, { yPercent: 110, duration: 1.4, stagger: 0.035 })
        .from(`.${styles.serviceInner}`, { yPercent: 110, duration: 1.1, stagger: 0.08 }, 0.35)
        .from(`.${styles.cover}`, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' }, 0.3)
        .from(`.${styles.coverImage}`, { scale: 1.25, yPercent: 8, duration: 2, ease: 'expo.out' }, 0.8);
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className={styles.hero}>
      <div className={styles.head}>
        {leading && <div className={styles.leading}>{leading}</div>}
        <h1 className={styles.title}>{project.title}</h1>
        <div className={styles.service}>
          <span className={styles.mask}>
            <span className={`${styles.serviceInner} ${styles.label}`}>{t.service}:</span>
          </span>
          <span className={styles.mask}>
            <span className={`${styles.serviceInner} ${styles.value}`}>{project.services}</span>
          </span>
        </div>
      </div>
      {project.url ? (
        <LinkCursor>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.cover} ${styles.coverLink}`}
            aria-label={`${t.visit}: ${project.title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- remote placeholder images */}
            <img src={project.images[0]} alt="" className={styles.coverImage} />
          </a>
        </LinkCursor>
      ) : (
        <div className={styles.cover}>
          {/* eslint-disable-next-line @next/next/no-img-element -- remote placeholder images */}
          <img src={project.images[0]} alt={project.title} className={styles.coverImage} />
        </div>
      )}
    </section>
  );
}
