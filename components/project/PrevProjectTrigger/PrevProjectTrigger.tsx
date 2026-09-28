'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { projectPalette, type Project } from '@/lib/projects';
import { useI18n } from '@/lib/i18n/client';
import { markSeamlessNavigation } from '@/lib/transition';
import { site } from '@/lib/site';
import MetaBar from '@/components/ui/MetaBar/MetaBar';
import ProjectHero from '../ProjectHero/ProjectHero';
import RedirectIndicator from '../RedirectIndicator/RedirectIndicator';
import styles from './PrevProjectTrigger.module.css';

/** Seconds the full ring pulses before the route changes. */
const COMPLETE_HOLD = 0.45;
/** Pull distance (share of the viewport) that fills the ring once the hero is fully down — as NextProjectTrigger's `+=80%`. */
const HOLD_SHARE = 0.8;
/** Touch drags cover less distance than wheel scrolling, so each pixel of drag counts this much more. */
const TOUCH_FACTOR = 2.5;
/** Seconds of wheel silence required before the trigger arms (swallows momentum after arriving). */
const ARM_DELAY = 0.6;
/** A wheel event after this many ms of silence starts a new gesture. */
const GESTURE_GAP_MS = 200;
/** Easing of the page toward the pulled distance (Lenis-like smoothing). */
const FOLLOW = { duration: 0.6, ease: 'power3.out' };

/**
 * The mirror of NextProjectTrigger. The previous project's hero sits just above the page, in its own
 * colors. Scrolling up while already at the top moves the whole page down (as if scrolling up into
 * content above it) until that hero fills the viewport; further pulling fills the ring beside its title.
 * At 100% the route changes (flagged seamless: no fade, no intro), invisibly. Scrolling down backs out.
 */
export default function PrevProjectTrigger({ project, pageColor }: { project: Project; pageColor: string }) {
  const router = useRouter();
  const ref = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const washRef = useRef<HTMLDivElement>(null);
  const { t, href: localize } = useI18n();
  const href = localize(`/work/${project.slug}`);

  useEffect(() => {
    router.prefetch(href);
  }, [router, href]);

  useGSAP(
    (_context, contextSafe) => {
      const body = document.body;
      const ring = ringRef.current;
      const indicator = indicatorRef.current;
      /** Pulled distance (px) the page eases toward, and the eased value that's rendered. */
      let target = 0;
      const state = { shown: 0 };
      let navigated = false;
      let armed = false;
      let lastWheel = 0;
      let gestureFromTop = false;
      let touchStartY = 0;
      let touchStartTarget = 0;

      // The hero's own height (100vh in CSS) rather than innerHeight, which differs on mobile.
      const reveal = () => ref.current!.offsetHeight;
      const total = () => reveal() * (1 + HOLD_SHARE);
      const atTop = () => window.scrollY <= 0;

      // The body carries the offset so the page, the fixed header and this hero (fixed at -100vh,
      // i.e. relative to the transformed body) all move together. Cleared at rest: a transformed
      // body would pin the header to the page instead of the viewport.
      const render = contextSafe!(() => {
        if (navigated) return;
        const shown = state.shown;
        if (shown < 0.5) gsap.set(body, { clearProps: 'transform' });
        else gsap.set(body, { y: Math.min(shown, reveal()) });
        const progress = gsap.utils.clamp(0, 1, (shown - reveal()) / (total() - reveal()));
        gsap.set(ring, { strokeDashoffset: 100 * (1 - progress) });
        // The gradient slides down with the ring: this page's color → the previous project's.
        gsap.set(washRef.current, { backgroundPosition: `50% ${100 - progress * 100}%` });
        if (progress >= 0.995 && target >= total()) complete();
      });

      const follow = contextSafe!(() => {
        gsap.to(state, { shown: target, ...FOLLOW, overwrite: true, onUpdate: render });
      });

      // Pulse, then fade the ring and the top bar out: the real hero has neither, so they must be
      // gone before the swap for the change to be invisible.
      const complete = contextSafe!(() => {
        // No haltScroll(): Lenis's stopped state clips the root, which hides this fixed hero while the
        // body is offset. The wheel listener swallows input from here on instead.
        navigated = true;
        gsap
          .timeline({ onComplete: () => { markSeamlessNavigation(); router.push(href); } })
          .to(indicator, { scale: 1.12, duration: COMPLETE_HOLD / 2, ease: 'power2.out' })
          .to(indicator, { scale: 1, autoAlpha: 0, duration: COMPLETE_HOLD / 2, ease: 'power2.in' })
          .to(barRef.current, { autoAlpha: 0, duration: COMPLETE_HOLD / 2, ease: 'power2.in' }, '<');
      });

      const arm = gsap.delayedCall(ARM_DELAY, () => (armed = true));

      const pullTo = (px: number) => {
        target = gsap.utils.clamp(0, total(), px);
        follow();
      };

      // Capture phase on window: runs before Lenis, so while the page is pulled down the wheel
      // moves this hand-off instead of scrolling the page.
      const onWheel = (e: WheelEvent) => {
        if (navigated) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        const now = performance.now();
        // Momentum from a scroll that started lower down must not spill into a pull at the top.
        if (now - lastWheel > GESTURE_GAP_MS) gestureFromTop = atTop();
        lastWheel = now;
        if (!armed) {
          arm.restart(true);
          return;
        }
        const pulling = target > 0 || (atTop() && gestureFromTop && e.deltaY < 0);
        if (!pulling) return;
        e.preventDefault();
        e.stopPropagation();
        pullTo(target - e.deltaY * (e.deltaMode === 1 ? 40 : 1));
      };

      const onTouchStart = (e: TouchEvent) => {
        touchStartY = e.touches[0].clientY;
        touchStartTarget = target;
      };
      const onTouchMove = (e: TouchEvent) => {
        if (!armed || navigated) return;
        const delta = e.touches[0].clientY - touchStartY;
        if (!(touchStartTarget > 0 || (atTop() && delta > 0))) return;
        e.preventDefault(); // no native overscroll / pull-to-refresh while pulling
        pullTo(touchStartTarget + delta * TOUCH_FACTOR);
      };
      // Letting go short of the end springs back, like releasing a pull-to-refresh.
      const onTouchEnd = () => {
        if (!navigated && target > 0) pullTo(0);
      };

      window.addEventListener('wheel', onWheel, { passive: false, capture: true });
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd);

      return () => {
        window.removeEventListener('wheel', onWheel, { capture: true });
        window.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
        gsap.set(body, { clearProps: 'transform' });
      };
    },
    { scope: ref, dependencies: [href] },
  );

  return (
    <section
      ref={ref}
      className={styles.handoff}
      style={
        { ...projectPalette(project), '--blend-from': project.color, '--blend-to': pageColor } as React.CSSProperties
      }
      aria-hidden
      inert
    >
      {/* Gradient from the previous project's color (top) into this page's (bottom), advanced by the ring */}
      <div ref={washRef} className={styles.wash} />
      <div className={styles.hero}>
        {/* Overlaid on the hero's top padding, so the hero keeps exactly the real page's layout */}
        <div ref={barRef} className={styles.bar}>
          <MetaBar start={site.name} center={t.project.scrollPrev} />
        </div>
        <ProjectHero
          project={project}
          handoff
          leading={<RedirectIndicator ref={indicatorRef} ringRef={ringRef} direction="up" />}
        />
      </div>
    </section>
  );
}
