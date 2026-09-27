'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import type { Project } from '@/lib/projects';
import { transitionTo } from '@/lib/pageTransition';
import { haltScroll } from '@/lib/smoothScroll';
import { useI18n } from '@/lib/i18n/client';
import RedirectIndicator from '../RedirectIndicator/RedirectIndicator';

/** Wheel distance (px) past the top of the page needed to open the previous project. */
const WHEEL_THRESHOLD = 650;
/** Touch drag distance (px) past the top of the page needed to open the previous project. */
const TOUCH_THRESHOLD = 300;
/** Seconds without input before the accumulated pull resets. */
const IDLE_RESET = 0.35;
/** Seconds of wheel silence required before the prompt arms (swallows trackpad momentum after arriving). */
const ARM_DELAY = 0.6;

/** Seconds the full ring pulses before the route changes. */
const COMPLETE_HOLD = 0.45;

/**
 * Ring (↑) beside the hero title, hidden until the user keeps scrolling up while already at the
 * top of the page — i.e. while the title, service line and top of the cover are on screen.
 * Pulling far enough fills it and opens the previous project. Render it in ProjectHero's `leading`.
 */
export default function PrevProjectPrompt({ project }: { project: Project }) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const { href: localize } = useI18n();
  const href = localize(`/work/${project.slug}`);

  useEffect(() => {
    router.prefetch(href);
  }, [router, href]);

  useGSAP(
    (_context, contextSafe) => {
      const state = { progress: 0 };
      let pulled = 0;
      let armed = false;
      let navigated = false;
      let touchStartY = 0;

      const render = () => {
        const visible = Math.min(1, state.progress * 5);
        gsap.set(ringRef.current, { strokeDashoffset: 100 * (1 - state.progress) });
        gsap.set(ref.current, { autoAlpha: visible, y: (1 - visible) * 16 });
      };

      // Called from event handlers and delayed calls, i.e. outside setup: contextSafe registers the
      // tween with this component's context so it's killed on unmount instead of rendering into null refs.
      const setProgress = contextSafe!((progress: number) => {
        gsap.to(state, { progress, duration: 0.15, ease: 'power1.out', overwrite: true, onUpdate: render });
      });

      // Full ring pulses, then the route changes.
      const complete = contextSafe!(() => {
        gsap
          .timeline({ onComplete: () => transitionTo(href) || router.push(href) })
          .to(ref.current, { scale: 1.12, duration: COMPLETE_HOLD / 2, ease: 'power2.out' })
          .to(ref.current, { scale: 1, autoAlpha: 0, duration: COMPLETE_HOLD / 2, ease: 'power2.in' });
      });

      const reset = () => {
        pulled = 0;
        setProgress(0);
      };
      const idleReset = gsap.delayedCall(IDLE_RESET, reset).pause();
      const arm = gsap.delayedCall(ARM_DELAY, () => (armed = true));

      const pull = (amount: number, threshold: number) => {
        if (navigated) return;
        const progress = Math.min(1, amount / threshold);
        setProgress(progress);
        if (progress >= 1) {
          navigated = true;
          idleReset.pause();
          haltScroll();
          complete();
        }
      };

      const atTop = () => window.scrollY <= 0;

      const onWheel = (e: WheelEvent) => {
        if (!armed) {
          arm.restart(true);
          return;
        }
        if (!atTop() || e.deltaY >= 0) {
          if (pulled) reset();
          return;
        }
        pulled += Math.abs(e.deltaY);
        pull(pulled, WHEEL_THRESHOLD);
        idleReset.restart(true);
      };

      const onTouchStart = (e: TouchEvent) => {
        touchStartY = e.touches[0].clientY;
      };
      const onTouchMove = (e: TouchEvent) => {
        const delta = e.touches[0].clientY - touchStartY;
        if (armed && atTop() && delta > 0) pull(delta, TOUCH_THRESHOLD);
      };
      const onTouchEnd = () => {
        if (!navigated) reset();
      };

      window.addEventListener('wheel', onWheel, { passive: true });
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd);

      return () => {
        window.removeEventListener('wheel', onWheel);
        window.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
      };
    },
    { dependencies: [href] },
  );

  return (
    <RedirectIndicator ref={ref} ringRef={ringRef} direction="up" concealed />
  );
}
