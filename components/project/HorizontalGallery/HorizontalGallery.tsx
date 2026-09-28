'use client';

import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import { gsap, PLAY_ONCE, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { useI18n } from '@/lib/i18n/client';
import { blurPlaceholder, imageUrl, type ProjectImage } from '@/lib/projects';
import { scrollToY } from '@/lib/smoothScroll';
import SplitReveal from '@/components/ui/SplitReveal/SplitReveal';
import GalleryViewer, { type GalleryState } from '../GalleryViewer/GalleryViewer';
import styles from './HorizontalGallery.module.css';

type HorizontalGalleryProps = {
  images: ProjectImage[];
  title: string;
  caption: string;
};

const pad = (n: number) => String(n).padStart(2, '0');
/** Scroll past either end of the gallery (share of the viewport) over which the large view fades away. */
const EXIT_DISTANCE = 0.4;

/**
 * Pins the section and slides the screens horizontally as the user scrolls, with a live counter.
 * Clicking a screen opens it large (GalleryViewer), driven by this same scroll: see `getState`.
 */
export default function HorizontalGallery({ images, title, caption }: HorizontalGalleryProps) {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  /**
   * Screen that was just opened, while the page scrolls to it: the viewer holds on it until the
   * gallery catches up, then follows the gallery live.
   */
  const settlingRef = useRef<{ index: number } | null>(null);
  const [viewer, setViewer] = useState<{ index: number; origin: DOMRect; thumbs: string[] } | null>(null);

  useGSAP(
    () => {
      const track = trackRef.current!;
      // How far the track must travel for the last slide's right edge to meet the right gutter.
      const distance = () => {
        const last = track.lastElementChild as HTMLElement;
        const gutter = parseFloat(getComputedStyle(track).paddingLeft);
        return Math.max(0, last.offsetLeft + last.offsetWidth + gutter - window.innerWidth);
      };

      tweenRef.current = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const index = Math.min(images.length, Math.floor(self.progress * images.length) + 1);
            counterRef.current!.textContent = pad(index);
          },
        },
      });

      // Each slide eases up into place as it enters.
      gsap.from(`.${styles.slide}`, {
        yPercent: 12,
        autoAlpha: 0,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.1,
        scrollTrigger: { trigger: ref.current, start: 'top 70%', ...PLAY_ONCE },
      });
    },
    { scope: ref },
  );

  /** Track offset (px) at which each slide is centred on screen, clamped to the track's travel. */
  const slideStops = () => {
    const track = trackRef.current!;
    const slides = [...track.children] as HTMLElement[];
    const last = slides[slides.length - 1];
    const gutter = parseFloat(getComputedStyle(track).paddingLeft);
    const travel = Math.max(0, last.offsetLeft + last.offsetWidth + gutter - window.innerWidth);
    const stops = slides.map((s) => gsap.utils.clamp(0, travel, s.offsetLeft + s.offsetWidth / 2 - window.innerWidth / 2));
    return { stops, travel };
  };

  /** Page scroll position (px) that centres slide `index`. */
  const scrollFor = (index: number) => {
    const st = tweenRef.current?.scrollTrigger as ScrollTrigger | undefined;
    if (!st) return window.scrollY;
    const { stops, travel } = slideStops();
    return st.start + (travel ? stops[index] / travel : 0) * (st.end - st.start);
  };

  // Read every frame by the viewer. Uses the scrubbed tween's progress (not the raw scroll), so the
  // large images move exactly with the slides behind them.
  const getState = useCallback((): GalleryState => {
    const tween = tweenRef.current;
    const st = tween?.scrollTrigger as ScrollTrigger | undefined;
    if (!tween || !st) return { position: 0, exit: 0 };
    const { stops, travel } = slideStops();
    const x = tween.progress() * travel;
    let position = stops.length - 1;
    for (let i = 0; i < stops.length - 1; i++) {
      if (x <= stops[i + 1]) {
        const span = stops[i + 1] - stops[i];
        position = span > 0 ? i + (x - stops[i]) / span : i + 1;
        break;
      }
    }
    const settling = settlingRef.current;
    if (settling) {
      if (Math.abs(position - settling.index) > 0.02) {
        return { position: settling.index, exit: 0 };
      }
      settlingRef.current = null;
    }
    const y = window.scrollY;
    const reach = window.innerHeight * EXIT_DISTANCE;
    const exit = y > st.end ? (y - st.end) / reach : y < st.start ? -(st.start - y) / reach : 0;
    return { position, exit };
  }, []);

  const open = (index: number, button: HTMLElement) => {
    const settling = { index };
    settlingRef.current = settling;
    // Safety net: never hold on the clicked screen for more than 2.5 s.
    window.setTimeout(() => {
      if (settlingRef.current === settling) settlingRef.current = null;
    }, 2500);
    const thumbs = [...trackRef.current!.querySelectorAll('img')].map((img) => img.currentSrc || img.src);
    setViewer({ index, origin: button.getBoundingClientRect(), thumbs });
    scrollToY(scrollFor(index), { duration: 1 });
  };

  const step = useCallback((delta: number) => {
    const current = Math.round(getState().position);
    const next = gsap.utils.clamp(0, images.length - 1, current + delta);
    if (next !== current) scrollToY(scrollFor(next), { duration: 0.8 });
    // scrollFor only reads layout and refs; it's stable enough for this callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getState, images.length]);

  const close = useCallback(() => {
    // Return focus to the screen that's now centred behind the viewer.
    const index = Math.round(getState().position);
    setViewer(null);
    settlingRef.current = null;
    trackRef.current?.querySelectorAll('button')[index]?.focus({ preventScroll: true });
  }, [getState]);

  return (
    <section ref={ref} className={styles.gallery} data-project-section>
      <div className={styles.header}>
        <SplitReveal as="h2" className={styles.title} split="words">
          {title}
        </SplitReveal>
        <SplitReveal as="p" className={styles.caption} delay={0.15}>
          {caption}
        </SplitReveal>
      </div>

      <div ref={trackRef} className={styles.track}>
        {images.map((src, i) => (
          <figure key={imageUrl(src)} className={styles.slide}>
            <button
              type="button"
              className={styles.open}
              aria-label={`${t.project.viewLarger}: ${t.project.screen} ${i + 1}`}
              onClick={(e) => open(i, e.currentTarget)}
            >
              <Image
                src={src}
                alt={`${t.project.screen} ${i + 1}`}
                fill
                sizes="(max-width: 768px) 82vw, 52vw"
                placeholder={blurPlaceholder(src)}
                className={styles.image}
              />
            </button>
          </figure>
        ))}
      </div>

      <div className={styles.footer} aria-hidden>
        <span ref={counterRef} className={styles.current}>
          {pad(1)}
        </span>
        <span className={styles.total}>/ {pad(images.length)}</span>
      </div>

      {viewer && (
        <GalleryViewer
          images={images}
          index={viewer.index}
          origin={viewer.origin}
          thumbs={viewer.thumbs}
          getState={getState}
          onStep={step}
          onClose={close}
          labels={{ screen: t.project.screen, close: t.project.closeViewer, hint: t.project.viewerHint }}
        />
      )}
    </section>
  );
}
