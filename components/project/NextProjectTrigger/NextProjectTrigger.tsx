'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { projectPalette, type Project } from '@/lib/projects';
import { useI18n } from '@/lib/i18n/client';
import { haltScroll } from '@/lib/smoothScroll';
import { markSeamlessNavigation } from '@/lib/transition';
import { site } from '@/lib/site';
import MetaBar from '@/components/ui/MetaBar/MetaBar';
import ProjectHero from '../ProjectHero/ProjectHero';
import RedirectIndicator from '../RedirectIndicator/RedirectIndicator';
import styles from './NextProjectTrigger.module.css';

/** Seconds the full ring pulses before the route changes. */
const COMPLETE_HOLD = 0.45;
/** Completions this soon after mount are ignored: the page may still be settling from a hand-off. */
const SETTLE_MS = 1200;
/** Scroll distance (share of the viewport) the pinned hero needs to fill the ring. */
const HOLD_DISTANCE = '+=80%';

/**
 * Right after the current project, the next project's hero scrolls up in its own colors.
 * Once it reaches the top of the viewport — exactly where the next page's first screen sits
 * (title, service line, top of the cover) — it pins, and further scrolling fills the ring beside
 * the title. At 100% the route changes (flagged seamless: no fade, no intro), invisibly.
 */
export default function NextProjectTrigger({ project }: { project: Project }) {
  const router = useRouter();
  const ref = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const { t, href: localize } = useI18n();
  const href = localize(`/work/${project.slug}`);

  useEffect(() => {
    router.prefetch(href);
  }, [router, href]);

  useGSAP(
    () => {
      let navigated = false;
      // Right after a hand-off this page mounts while the window is still scrolled to the old
      // page's bottom, so the trigger momentarily reads 100%. Only arm once it has been seen short
      // of the end; otherwise it would chain straight into the project after next.
      let armed = false;
      const mountedAt = performance.now();
      const indicator = indicatorRef.current;
      const ring = ringRef.current;

      gsap.to({}, {
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: HOLD_DISTANCE,
          pin: true,
          onUpdate: (self) => {
            if (navigated) return;
            const p = self.progress;
            gsap.set(ring, { strokeDashoffset: 100 * (1 - p) });
            if (p < 0.9) armed = true;
            if (armed && p >= 0.995 && performance.now() - mountedAt > SETTLE_MS) {
              navigated = true;
              haltScroll();
              // Pulse, then fade the ring and the top bar out: the real hero has neither, so they
              // must be gone before the swap for the change to be invisible.
              gsap
                .timeline({ onComplete: () => { markSeamlessNavigation(); router.push(href); } })
                .to(indicator, { scale: 1.12, duration: COMPLETE_HOLD / 2, ease: 'power2.out' })
                .to(indicator, { scale: 1, autoAlpha: 0, duration: COMPLETE_HOLD / 2, ease: 'power2.in' })
                .to(barRef.current, { autoAlpha: 0, duration: COMPLETE_HOLD / 2, ease: 'power2.in' }, '<');
            }
          },
        },
      });
    },
    { scope: ref, dependencies: [href] },
  );

  return (
    <section
      ref={ref}
      className={styles.handoff}
      style={projectPalette(project) as React.CSSProperties}
      aria-label={t.project.next}
    >
      {/* Overlaid on the hero's top padding, so the hero keeps exactly the real page's layout */}
      <div ref={barRef} className={styles.bar}>
        <MetaBar start={site.name} center={t.project.scrollNext} />
      </div>
      <ProjectHero
        project={project}
        handoff
        leading={
          <RedirectIndicator ref={indicatorRef} ringRef={ringRef} direction="down" />
        }
      />
    </section>
  );
}
