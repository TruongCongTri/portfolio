'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { gsap, useGSAP } from '@/lib/gsap';
import { imageUrl, type ProjectImage } from '@/lib/projects';
import styles from './GalleryViewer.module.css';

/** Where the gallery is, read every frame while the viewer is open. */
export type GalleryState = {
  /** Continuous index of the slide at the centre of the gallery (1.5 = halfway from 2nd to 3rd). */
  position: number;
  /** Scroll past the gallery's end (0 → 1, positive) or before its start (0 → -1); 0 inside it. */
  exit: number;
};

type GalleryViewerProps = {
  images: ProjectImage[];
  /** Slide that was clicked, and its on-screen box: the viewer grows out of it. */
  index: number;
  origin: DOMRect;
  /**
   * URLs the gallery slides already loaded (their `currentSrc`). Shown under each large image so the
   * viewer opens with the picture already there, then sharpens when the large version arrives.
   */
  thumbs: string[];
  getState: () => GalleryState;
  /** Arrow keys: move the gallery by this many slides. */
  onStep: (delta: number) => void;
  onClose: () => void;
  labels: { screen: string; close: string; hint: string };
};

const pad = (n: number) => String(n).padStart(2, '0');
/** Distance between neighbouring large images, as a share of the viewport width. */
const SPACING = 0.82;

/**
 * Large-format view of the gallery that doesn't take over the scroll: the page keeps scrolling the
 * pinned gallery behind it, and the large images follow the gallery's own (scrubbed) progress, so
 * both always show the same screen. Scrolling past the last image zooms the viewer away and hands
 * the scroll back to the page; scrolling above the first fades it out.
 */
export default function GalleryViewer({ images, index, origin, thumbs, getState, onStep, onClose, labels }: GalleryViewerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const closingRef = useRef(false);
  /** Animated close (Esc, close button, backdrop); set up with the other tweens. */
  const closeAnimRef = useRef<() => void>(() => {});

  useGSAP(
    (_context, contextSafe) => {
      const items = itemRefs.current;
      let lastCounter = -1;

      // Follow the gallery every frame: a coverflow of large images centred on its position.
      const tick = contextSafe!(() => {
        const { position, exit } = getState();
        const spacing = window.innerWidth * SPACING;
        items.forEach((item, i) => {
          if (!item) return;
          const d = i - position;
          const near = Math.min(Math.abs(d), 1.5);
          gsap.set(item, {
            x: d * spacing,
            scale: 1 - Math.min(near, 1) * 0.14,
            autoAlpha: near >= 1.5 ? 0 : 1 - (near / 1.5) * 0.75,
            zIndex: 10 - Math.round(near * 4),
          });
        });

        const current = Math.min(images.length, Math.max(1, Math.round(position) + 1));
        if (current !== lastCounter) {
          lastCounter = current;
          counterRef.current!.textContent = pad(current);
        }

        // Past the last image the stage zooms toward the viewer and fades; above the first it recedes.
        const e = Math.min(1, Math.abs(exit));
        gsap.set(stageRef.current, { scale: exit > 0 ? 1 + e * 0.6 : 1 - e * 0.12 });
        // The whole viewer (backdrop and bar too) fades, so the page underneath comes back clean.
        gsap.set(rootRef.current, { autoAlpha: 1 - e });
        if (e >= 1 && !closingRef.current) {
          closingRef.current = true;
          onClose();
        }
      });
      gsap.ticker.add(tick);
      tick();

      // Open: the backdrop fades in while the clicked screen grows from its slide to full size.
      const frame = itemRefs.current[index]?.firstElementChild as HTMLElement | undefined;
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.from(`.${styles.backdrop}`, { autoAlpha: 0, duration: 0.5, ease: 'power2.out' }, 0);
      if (frame) {
        const to = frame.getBoundingClientRect();
        tl.from(
          frame,
          {
            x: origin.left + origin.width / 2 - (to.left + to.width / 2),
            y: origin.top + origin.height / 2 - (to.top + to.height / 2),
            scale: origin.width / to.width,
            duration: 0.9,
          },
          0,
        );
      }
      tl.from(`.${styles.bar}`, { autoAlpha: 0, y: 16, duration: 0.6 }, 0.25);

      // Esc / close button / backdrop: fade and shrink back, then unmount.
      closeAnimRef.current = contextSafe!(() => {
        if (closingRef.current) return;
        closingRef.current = true;
        gsap
          .timeline({ onComplete: onClose })
          .to(`.${styles.bar}`, { autoAlpha: 0, duration: 0.25 }, 0)
          .to(`.${styles.reel}`, { scale: 0.92, autoAlpha: 0, duration: 0.45, ease: 'power3.in' }, 0)
          .to(`.${styles.backdrop}`, { autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, 0.1);
      });

      return () => gsap.ticker.remove(tick);
    },
    { scope: rootRef },
  );

  useEffect(() => {
    closeButtonRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAnimRef.current();
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        onStep(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        onStep(-1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onStep]);

  return createPortal(
    <div ref={rootRef} className={styles.viewer} role="dialog" aria-label={labels.screen}>
      <div className={styles.backdrop} onClick={() => closeAnimRef.current()} />
      <div ref={stageRef} className={styles.stage}>
        <div className={styles.reel}>
          {images.map((src, i) => (
            <div
              key={imageUrl(src)}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className={styles.item}
            >
              <div className={styles.frame}>
                {thumbs[i] && (
                  // A plain <img> on purpose: it must reuse the slide's exact, already-cached URL.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbs[i]} alt="" aria-hidden className={styles.thumb} />
                )}
                <Image src={src} alt={`${labels.screen} ${i + 1}`} fill sizes="90vw" quality={85} className={styles.image} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.bar}>
        <span className={styles.count}>
          <span ref={counterRef}>{pad(index + 1)}</span> / {pad(images.length)}
        </span>
        <span className={styles.hint}>{labels.hint}</span>
        <button ref={closeButtonRef} type="button" className={`${styles.close} wipe`} onClick={() => closeAnimRef.current()}>
          {labels.close}
        </button>
      </div>
    </div>,
    document.body,
  );
}
