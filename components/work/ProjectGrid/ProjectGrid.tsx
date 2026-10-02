'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { gsap, PLAY_ONCE, useGSAP } from '@/lib/gsap';
import { blurPlaceholder, categoryLabel, type Project } from '@/lib/projects';
import { useI18n } from '@/lib/i18n/client';
import PillButton from '@/components/ui/PillButton/PillButton';
import styles from './ProjectGrid.module.css';

export default function ProjectGrid({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { t, href } = useI18n();

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>(`.${styles.card}`).forEach((card, i) => {
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
          .from(card.querySelectorAll(`.${styles.info} > *`), {
            yPercent: 100,
            autoAlpha: 0,
            duration: 1,
            ease: 'expo.out',
            stagger: 0.06,
          }, 0.7);
      });
    },
    { scope: ref, dependencies: [projects], revertOnUpdate: true },
  );

  return (
    <div ref={ref} className={styles.grid}>
      {projects.map((project) => (
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
                sizes="(min-width: 768px) 40vw, 86vw"
                placeholder={blurPlaceholder(project.images[0])}
                className={styles.image}
              />
            </div>
          </div>
          <div className={styles.info}>
            <h3 className={styles.title}>{project.title}</h3>
            {/* The reveal animates this wrapper (`.info > *`), so GSAP's magnetic x/y on the button
                doesn't share an element with the reveal's yPercent. */}
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
            <span className={styles.meta}>
              {categoryLabel(project, t.work.categories)} · {project.year}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
