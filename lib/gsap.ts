'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

// Single registration point — import gsap from here, not from 'gsap' directly.
gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/**
 * Play an entrance the first time its trigger is reached, then leave it be.
 * Use instead of `once: true`: a `once` trigger that is already past its start when created
 * (e.g. a page that mounts while the window is still scrolled down) kills itself in the middle of
 * ScrollTrigger's own setup and throws "Cannot read properties of undefined (reading 'end')".
 */
export const PLAY_ONCE = { toggleActions: 'play none none none' } as const;

/**
 * SplitText masks clip each line/word/char to its line box, which cuts off whatever reaches outside
 * it: stacked accents on capitals and overhanging marks (Vietnamese Ư, Ô, Í, í), descenders (g, y).
 * This grows every mask's clip area on all sides with padding, cancelled by an equal negative margin
 * so nothing moves. Call it from `onSplit` (masks are recreated on every re-split).
 */
export function roomyMasks(masks: Element[]) {
  for (const mask of masks as HTMLElement[]) {
    mask.style.padding = '0.32em 0.12em 0.36em';
    mask.style.margin = '-0.32em -0.12em -0.36em';
  }
}

/**
 * yPercent to start a masked reveal from, so the text (accents included) sits fully below the
 * enlarged masks from `roomyMasks`.
 */
export const MASK_START = 175;

export { gsap, ScrollTrigger, SplitText, useGSAP };
