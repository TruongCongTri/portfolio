'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import type { Project } from '@/lib/projects';
import { useI18n } from '@/lib/i18n/client';
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
            scrollTrigger: { trigger: card, start: 'top 90%', once: true },
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
        <Link key={project.slug} href={href(`/work/${project.slug}`)} className={styles.card}>
          <div className={styles.media} style={{ backgroundColor: project.color }}>
            {/* GSAP scales .shot on reveal; the hover lift is a CSS transition on the img inside. */}
            <div className={styles.shot}>
              {/* eslint-disable-next-line @next/next/no-img-element -- remote placeholder images */}
              <img src={project.images[0]} alt={project.title} className={styles.image} />
            </div>
          </div>
          <div className={styles.info}>
            <h3 className={styles.title}>{project.title}</h3>
            <span className={styles.meta}>
              {t.work.categories[project.category]} · {project.year}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
