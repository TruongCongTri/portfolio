'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { gsap, MASK_START, roomyMasks, SplitText, useGSAP } from '@/lib/gsap';
import { blurPlaceholder, type Project } from '@/lib/projects';
import { useI18n } from '@/lib/i18n/client';
import { isSeamlessNavigation } from '@/lib/transition';
import LinkCursor from '@/components/ui/LinkCursor/LinkCursor';
import PillButton from '@/components/ui/PillButton/PillButton';
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
  const { t: dictionary, href } = useI18n();
  const t = dictionary.project;
  const archiveLabel = dictionary.work.archive;
  const hero = project.hero ?? project.images[0];

  useGSAP(
    () => {
      if (handoff || isSeamlessNavigation()) return;
      const split = SplitText.create(`.${styles.title}`, { type: 'chars', mask: 'chars' });
      roomyMasks(split.masks);
      const chars = split.chars;
      gsap
        .timeline({ defaults: { ease: 'expo.out' }, delay: 0.1 })
        .from(chars, { yPercent: MASK_START, duration: 1.4, stagger: 0.035 })
        .from(`.${styles.serviceInner}`, { yPercent: 110, duration: 1.1, stagger: 0.08 }, 0.35)
        .from(`.${styles.archive}`, { y: 24, autoAlpha: 0, duration: 1.1 }, 0.55)
        .from(`.${styles.cover}`, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' }, 0.3)
        .from(`.${styles.coverImage}`, { scale: 1.25, yPercent: 8, duration: 2, ease: 'expo.out' }, 0.8);
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className={styles.hero}>
      <div className={styles.head}>
        {leading && <div className={styles.leading}>{leading}</div>}
        <h1 className={styles.title}>
          {project.titleParts ? (
            // Each part is unbreakable, so a wrap can only fall between name and site type.
            <>
              <span className={styles.titlePart}>{project.titleParts[0]}</span>{' '}
              <span className={styles.titlePart}>{project.titleParts[1]}</span>
            </>
          ) : (
            project.title
          )}
        </h1>
        <div className={styles.service}>
          <span className={styles.mask}>
            <span className={`${styles.serviceInner} ${styles.label}`}>{t.service}:</span>
          </span>
          <span className={styles.mask}>
            <span className={`${styles.serviceInner} ${styles.value}`}>{project.services}</span>
          </span>
          {/* Also shown in the hand-off copy, which must match this hero exactly. */}
          {/* Styled like the home page's "About me" pill (minus its arrow); unmasked, so its magnetic drift isn't clipped. */}
          {project.isArchive && (
            <div className={styles.archive}>
              <PillButton href={href('/work/archive')} magnetic>
                {archiveLabel}
              </PillButton>
            </div>
          )}
        </div>
      </div>
      {/* The follower cursor is always on the cover; it becomes a link once the project has a live url. */}
      <LinkCursor>
        {project.url ? (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.cover} ${styles.coverLink}`}
            aria-label={`${t.visit}: ${project.title}`}
          >
            <Image
              src={hero}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 90vw"
              preload={!handoff}
              placeholder={blurPlaceholder(hero)}
              className={styles.coverImage}
            />
          </a>
        ) : (
          <div className={styles.cover}>
            <Image
              src={hero}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 90vw"
              preload={!handoff}
              placeholder={blurPlaceholder(hero)}
              className={styles.coverImage}
            />
          </div>
        )}
      </LinkCursor>
    </section>
  );
}
