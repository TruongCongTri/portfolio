'use client';

import Image from 'next/image';
import Link from 'next/link';
import { memo, useEffect, useRef } from 'react';
import { gsap, PLAY_ONCE, useGSAP } from '@/lib/gsap';
import { blurPlaceholder, type Project } from '@/lib/projects';
import { useI18n } from '@/lib/i18n/client';
import { BATCH, useProgressiveList } from '@/lib/useProgressiveList';
import { warmImages } from '@/lib/warmImages';
import PillButton from '@/components/ui/PillButton/PillButton';
import styles from './ProjectGrid.module.css';

/** Card image sizes: two columns inside a 1280px page on desktop, one column on phones. */
const CARD_SIZES = '(min-width: 1280px) 470px, (min-width: 768px) 40vw, 86vw';

/**
 * The first batch is rendered now; more cards are added as the end of the grid nears the viewport.
 * Keyed by the list's content, so a new filter result starts over from its first batch.
 */
function ProjectGrid({ projects }: { projects: Project[] }) {
  return <Cards key={projects.map((project) => project.slug).join('|')} projects={projects} />;
}

function Cards({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { t, href } = useI18n();
  const { visible, count, hasMore, sentinelRef } = useProgressiveList(projects);

  // While the visitor looks at this batch, fetch the next batch's images in the background
  useEffect(() => warmImages(projects.slice(count, count + BATCH).map((project) => project.images[0]), CARD_SIZES), [projects, count]);

  useGSAP(
    () => {
      // Only the cards added since last time: the ones already shown keep their state
      const fresh = gsap.utils.toArray<HTMLElement>(`.${styles.card}`).filter((card) => !card.dataset.revealed);
      fresh.forEach((card, i) => {
        card.dataset.revealed = 'true';
        gsap
          .timeline({
            delay: (i % 2) * 0.12,
            scrollTrigger: { trigger: card, start: 'top 90%', ...PLAY_ONCE },
          })
          .from(card.querySelector(`.${styles.media}`), {
            clipPath: 'inset(100% 0% 0% 0%)',
            duration: 1.4,
            ease: 'expo.inOut',
          })
          .from(card.querySelector(`.${styles.shot}`), { scale: 1.3, duration: 1.6, ease: 'expo.out' }, 0.4)
          .from(card.querySelector(`.${styles.rule}`), { scaleX: 0, duration: 1.4, ease: 'expo.inOut' }, 0.5)
          .from(card.querySelectorAll(`.${styles.row}`), {
            yPercent: 100,
            autoAlpha: 0,
            duration: 1,
            ease: 'expo.out',
            stagger: 0.06,
          }, 0.7);
      });
    },
    { scope: ref, dependencies: [visible.length] },
  );

  return (
    <>
    <div ref={ref} className={styles.grid}>
      {visible.map((project, index) => (
        // Like ProjectList: an empty Link covers the card (the live link can't nest inside it) and the
        // content lets clicks through, except for the live button.
        <div key={project.slug} className={styles.card}>
          <Link href={href(`/work/${project.slug}`)} className={styles.cardLink} aria-label={project.title} />
          <div className={styles.media} style={{ backgroundColor: project.color }}>
            {/* GSAP scales .shot on reveal; the hover lift is a CSS transition on the img inside. */}
            <div className={styles.shot}>
              <Image
                src={project.images[0]}
                alt={project.title}
                fill
                sizes={CARD_SIZES}
                // The first row is on screen at once: fetch it right away, at high priority. The rest load lazily.
                loading={index < 2 ? 'eager' : 'lazy'}
                fetchPriority={index < 2 ? 'high' : 'auto'}
                placeholder={blurPlaceholder(project.images[0])}
                className={styles.image}
              />
            </div>
          </div>
          <div className={styles.info}>
            {/* The reveal animates the rows, so GSAP's magnetic x/y on the button
                doesn't share an element with the reveal's yPercent. */}
            <div className={styles.row}>
              <h3 className={styles.title}>{project.title}</h3>
              {project.url && (
                <span className={styles.live}>
                  <PillButton
                    href={project.url}
                    external
                    size="icon"
                    arrow
                    magnetic
                    ariaLabel={`${t.project.visit}: ${project.title}`}
                    title={t.project.viewLive}
                  />
                </span>
              )}
            </div>
            <span className={styles.rule} />
            <div className={styles.row}>
              <span className={styles.categories}>
                {project.categories.map((id) => (
                  <span key={id}>{t.work.categories[id]}</span>
                ))}
              </span>
              <span className={styles.meta}>{project.year}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
    {hasMore && <div ref={sentinelRef} aria-hidden style={{ height: 1 }} />}
    </>
  );
}

/* Memoised: only re-renders when the filtered list itself changes. */
export default memo(ProjectGrid);
