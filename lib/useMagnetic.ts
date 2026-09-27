'use client';

import type { RefObject } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';

type MagneticOptions = {
  /** Turn the effect off without unmounting (defaults to on). */
  enabled?: boolean;
  /** Selector for the magnetic elements inside `ref`. Omit to make `ref` itself magnetic. */
  target?: string;
  /** Selector (inside each target) for content that drifts a little further, for depth. */
  inner?: string;
  /** Share of the cursor's offset from the centre that the element follows. */
  strength?: number;
  /** Extra share applied to `inner`, on top of the element's own movement. */
  innerStrength?: number;
  /** Re-bind when these change (e.g. the set of targets). */
  dependencies?: unknown[];
};

/**
 * Magnetic hover: the element drifts toward the cursor while hovered and eases back to centre on
 * leave; its `inner` content drifts a little further. Same feel as the "About me" pill.
 */
export function useMagnetic(
  ref: RefObject<HTMLElement | null>,
  { enabled = true, target, inner, strength = 0.3, innerStrength = 0.15, dependencies = [] }: MagneticOptions = {},
) {
  useGSAP(
    (_context, contextSafe) => {
      const root = ref.current;
      if (!enabled || !root || window.matchMedia('(hover: none)').matches) return;
      const elements = target ? gsap.utils.toArray<HTMLElement>(target, root) : [root];

      const cleanups = elements.map((el) => {
        const content = inner ? el.querySelector<HTMLElement>(inner) : null;
        const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
        const ixTo = content && gsap.quickTo(content, 'x', { duration: 0.6, ease: 'power3.out' });
        const iyTo = content && gsap.quickTo(content, 'y', { duration: 0.6, ease: 'power3.out' });

        const onMove = contextSafe!((e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          xTo(dx * strength);
          yTo(dy * strength);
          ixTo?.(dx * innerStrength);
          iyTo?.(dy * innerStrength);
        });
        const onLeave = contextSafe!(() => {
          xTo(0);
          yTo(0);
          ixTo?.(0);
          iyTo?.(0);
        });

        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);
        return () => {
          el.removeEventListener('mousemove', onMove);
          el.removeEventListener('mouseleave', onLeave);
        };
      });

      return () => cleanups.forEach((fn) => fn());
    },
    { scope: ref, dependencies: [enabled, target, inner, strength, innerStrength, ...dependencies] },
  );
}
