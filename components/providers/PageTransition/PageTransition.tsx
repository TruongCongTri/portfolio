'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useI18n } from '@/lib/i18n/client';
import { getProject } from '@/lib/projects';
import { registerPageNavigator } from '@/lib/pageTransition';
import { haltScroll } from '@/lib/smoothScroll';
import { markCurtainNavigation } from '@/lib/transition';
import styles from './PageTransition.module.css';

const MASK_ID = 'page-transition-mask';
/** Must be a weight the sans font is loaded with (see the root layout). */
const LABEL_WEIGHT = 700;

type Zoom = { x: number; y: number; scale: number };

/**
 * Sizes and positions the label (both the solid copy and the hole cut into the curtain), then finds
 * where to zoom: the thickest part of a letter stroke near the middle of the word, measured by
 * drawing the same text on a canvas. Zooming into a stroke (a hole) reveals the page; zooming into
 * the gap between letters would just fill the screen with curtain.
 */
function layoutLabel(text: string, targets: SVGTextElement[], fontFamily: string): Zoom {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;

  let size = Math.min(W * 0.17, 240);
  ctx.font = `${LABEL_WEIGHT} ${size}px ${fontFamily}`;
  const natural = ctx.measureText(text).width;
  if (natural > W * 0.86) size *= (W * 0.86) / natural;
  ctx.font = `${LABEL_WEIGHT} ${size}px ${fontFamily}`;

  const metrics = ctx.measureText(text);
  const ascent = metrics.actualBoundingBoxAscent;
  const descent = metrics.actualBoundingBoxDescent;
  const baseline = H / 2 + (ascent - descent) / 2;

  for (const el of targets) {
    el.textContent = text;
    el.setAttribute('x', String(W / 2));
    el.setAttribute('y', String(baseline));
    el.style.fontSize = `${size}px`;
  }

  // Rasterise just the word and score every filled pixel by its local stroke thickness,
  // favouring pixels near the centre of the word.
  const pad = 4;
  const bw = Math.ceil(metrics.width + pad * 2);
  const bh = Math.ceil(ascent + descent + pad * 2);
  ctx.canvas.width = bw;
  ctx.canvas.height = bh;
  ctx.font = `${LABEL_WEIGHT} ${size}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, bw / 2, ascent + pad);
  const alpha = ctx.getImageData(0, 0, bw, bh).data;
  const filled = (x: number, y: number) => x >= 0 && y >= 0 && x < bw && y < bh && alpha[(y * bw + x) * 4 + 3] > 160;
  const run = (x: number, y: number, dx: number, dy: number) => {
    let n = 0;
    while (filled(x + dx * (n + 1), y + dy * (n + 1)) && n < 400) n++;
    return n;
  };

  let best = { score: -1, x: bw / 2, y: bh / 2, stroke: size * 0.12 };
  for (let y = 0; y < bh; y += 2) {
    for (let x = 0; x < bw; x += 2) {
      if (!filled(x, y)) continue;
      const stroke = Math.min(run(x, y, -1, 0) + run(x, y, 1, 0), run(x, y, 0, -1) + run(x, y, 0, 1)) + 1;
      const offCentre = Math.hypot(x - bw / 2, y - bh / 2) / Math.max(bw, bh);
      const score = stroke * (1 - 0.7 * offCentre);
      if (score > best.score) best = { score, x, y, stroke };
    }
  }

  return {
    x: W / 2 - bw / 2 + best.x,
    y: baseline - ascent - pad + best.y,
    // Well past the point where that stroke swallows the viewport, so with the accelerating ease the
    // screen is fully "inside" the letter before the dive ends.
    scale: gsap.utils.clamp(30, 600, (Math.hypot(W, H) / best.stroke) * 2.6),
  };
}

/**
 * Page-to-page transition:
 * 1. a dark curtain wipes up with the destination's name rising in solid letters;
 * 2. the route changes underneath;
 * 3. the letters turn hollow — windows onto the new page — and the view dives into one of them
 *    until the page fills the screen.
 *
 * Same-site link clicks are intercepted in the capture phase (Next's <Link> skips navigation when
 * the event is already default-prevented). Programmatic navigations can use `transitionTo`.
 * The next-project hand-off deliberately bypasses this: it's seamless by design.
 */
export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const { t, locale } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const inkRef = useRef<SVGRectElement>(null);
  const holeRef = useRef<SVGTextElement>(null);
  const fillRef = useRef<SVGTextElement>(null);
  const covering = useRef(false);
  const pendingPath = useRef<string | null>(null);
  const zoom = useRef<Zoom>({ x: 0, y: 0, scale: 40 });

  useEffect(() => {
    const curtain = ref.current!;
    const svg = svgRef.current!;
    const ink = inkRef.current!;
    const letters = [holeRef.current!, fillRef.current!];

    // Name shown on the curtain for a destination path.
    const labelFor = (path: string) => {
      const bare = path.replace(new RegExp(`^/${locale}`), '') || '/';
      if (bare === '/' || bare.startsWith('/#')) return t.nav.home;
      if (bare.startsWith('/about')) return t.nav.about;
      if (/^\/work\/archive\/?$/.test(bare)) return t.work.archive;
      const slug = bare.match(/^\/work\/([^/?#]+)/)?.[1];
      if (slug) return getProject(slug, locale)?.title ?? t.nav.work;
      if (bare.startsWith('/work')) return t.nav.work;
      return t.transition.loading;
    };

    const navigate = (href: string) => {
      if (covering.current) return;
      covering.current = true;
      pendingPath.current = new URL(href, window.location.href).pathname;
      zoom.current = layoutLabel(labelFor(href), letters, getComputedStyle(fillRef.current!).fontFamily);
      haltScroll();

      gsap
        .timeline({
          onComplete: () => {
            // Start the next page at the top while it's hidden: otherwise it mounts with the old
            // page's scroll position, and scroll-triggered entrances near the bottom (footer) are
            // created already "passed".
            window.scrollTo(0, 0);
            markCurtainNavigation();
            router.push(href);
          },
        })
        .set(curtain, { autoAlpha: 1, yPercent: 100 })
        .set(svg, { scale: 1 })
        .set(ink, { opacity: 1 })
        // The hole and its solid cover move together, so the old page never shows through.
        .set(letters, { y: 80, opacity: 1 })
        .to(curtain, { yPercent: 0, duration: 0.85, ease: 'expo.inOut' })
        .to(letters, { y: 0, duration: 0.8, ease: 'expo.out' }, '-=0.35');
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest('a');
      if (!anchor || !anchor.href) return;
      if ((anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return; // mailto:, tel:, external sites
      if (url.pathname === window.location.pathname) return; // same page (incl. #anchors): let it be
      e.preventDefault();
      navigate(url.pathname + url.search + url.hash);
    };

    registerPageNavigator(navigate);
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      registerPageNavigator(null);
    };
  }, [router, locale, t]);

  // Once the destination has rendered underneath: hollow out the letters, then dive into one.
  useEffect(() => {
    if (!covering.current || pathname !== pendingPath.current) return;
    covering.current = false;
    pendingPath.current = null;

    const curtain = ref.current;
    const svg = svgRef.current;
    const ink = inkRef.current;
    const reset = () => {
      gsap.set(curtain, { autoAlpha: 0 });
      gsap.set(svg, { scale: 1 });
      gsap.set(ink, { opacity: 1 });
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.to(curtain, { autoAlpha: 0, duration: 0.4, onComplete: reset });
      return;
    }

    const { x, y, scale } = zoom.current;
    gsap
      .timeline({ onComplete: reset })
      // Solid letters fade away: the holes beneath now show the new page.
      .to(fillRef.current, { opacity: 0, duration: 0.5, ease: 'power2.inOut' })
      .set(svg, { transformOrigin: `${x}px ${y}px` })
      // Dive into the stroke; accelerating, like a camera pushing in.
      .to(svg, { scale, duration: 1.3, ease: 'expo.in' }, '+=0.2')
      // Quick clean-up of any sliver of curtain left at the very end.
      .to(ink, { opacity: 0, duration: 0.18, ease: 'power1.in' }, '-=0.18');
  }, [pathname]);

  return (
    <div ref={ref} className={styles.curtain} aria-hidden>
      <svg ref={svgRef} className={styles.svg} width="100%" height="100%">
        <defs>
          {/* White = curtain stays; the black letters are cut out of it. */}
          <mask id={MASK_ID} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
            <rect width="100%" height="100%" fill="#fff" />
            <text ref={holeRef} className={styles.label} textAnchor="middle" fill="#000" />
          </mask>
        </defs>
        <rect ref={inkRef} className={styles.ink} width="100%" height="100%" mask={`url(#${MASK_ID})`} />
        {/* Solid copy over the hole until the new page is ready underneath. */}
        <text ref={fillRef} className={`${styles.label} ${styles.fill}`} textAnchor="middle" />
      </svg>
    </div>
  );
}
