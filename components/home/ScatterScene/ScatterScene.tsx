'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from '@/lib/gsap';
import { useI18n } from '@/lib/i18n/client';
import { isLowEndDevice } from '@/lib/perf';
import { blurPlaceholder, type Project } from '@/lib/projects';
import ContactTrigger from '@/components/contact/ContactTrigger/ContactTrigger';
import getInTouch from '../../../public/get-in-touch.jpg';
// import getInTouch from '../../../public/Renaissance_Fresco-Creation_of_the_Cat.png';
import styles from './ScatterScene.module.css';

/** The middle of the gap between the cat and the reaching hand in the get-in-touch picture, as a share of its width and height (used on tall screens, where only a slice of the picture shows). */
const HANDS = { x: 0.28, y: 0.43 };

/** Where each card sits (percent of the stage) and the direction it flies when scattered. */
const CARD_LAYOUT = [
  { left: 16, top: 12, dx: -1.1, dy: -0.9 },
  { left: 78, top: 12, dx: 1.1, dy: -1 },
  { left: 22, top: 40, dx: -1.3, dy: -0.1 },
  { left: 70, top: 34, dx: 1.3, dy: -0.2 },
  { left: 8, top: 78, dx: -1, dy: 1 },
  { left: 58, top: 76, dx: 0.6, dy: 1.2 },
];

/**
 * Pinned scroll scene in three beats (pass up to 6 projects, one card each — see CARD_LAYOUT):
 * 1. project cards scatter outward while the get-in-touch image grows behind the centered line,
 *    whose words light up one by one;
 * 2. the frame expands to fill the screen;
 * 3. the call-to-action rises in.
 */
export default function ScatterScene({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLElement>(null);
  const { t } = useI18n();
  // One card per project, no repeats: with fewer projects than slots, the later slots stay empty.
  const cards = projects.slice(0, CARD_LAYOUT.length).map((project, i) => ({ ...CARD_LAYOUT[i], project }));

  useGSAP(
    () => {
      const words = SplitText.create(`.${styles.line}`, { type: 'words' }).words;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: ref.current, start: 'top top', end: '+=320%', pin: true, scrub: isLowEndDevice() ? true : 0.8, anticipatePin: 1, invalidateOnRefresh: true },
      });

      // 1 — scatter + grow + words light up
      gsap.utils.toArray<HTMLElement>(`.${styles.card}`).forEach((card, i) => {
        const { dx, dy } = cards[i];
        tl.to(card, { x: dx * vw * 0.35, y: dy * vh * 0.35, scale: 1.5, autoAlpha: 0, duration: 1 }, 0);
      });
      // The frame is always the full size of the scene; what grows is a window onto it. A uniform scale plus a
      // clip-path inset gives any window size, and both are cheap (no layout, no re-fitting the picture each
      // frame), which is what keeps this smooth on older phones. Values are functions so they follow the
      // scene's size when the triggers refresh (resize, rotation).
      const scene = ref.current!;
      const windowAt = (width: number, height: number) => {
        const w = scene.clientWidth;
        const h = scene.clientHeight;
        const scale = Math.max(width / w, height / h);
        return { scale, clip: `inset(${(h - height / scale) / 2}px ${(w - width / scale) / 2}px)` };
      };
      const start = () => windowAt(scene.clientWidth * 0.22, scene.clientWidth * 0.14);
      const middle = () => windowAt(scene.clientWidth * 0.72, scene.clientWidth * 0.44);
      tl.fromTo(
        `.${styles.frame}`,
        { scale: () => start().scale, clipPath: () => start().clip, autoAlpha: 0 },
        { scale: () => middle().scale, clipPath: () => middle().clip, autoAlpha: 1, duration: 1 },
        0.1,
      );
      // Slow zoom that ends with the touching hands in the middle of the screen. Which part of the picture
      // is on screen depends on the frame's final shape, so wide and tall screens get their own version.
      const image = ref.current!.querySelector<HTMLElement>(`.${styles.frameImage}`)!;
      const zoom = gsap.matchMedia();
      const clear = { clearProps: 'transform,transformOrigin,objectPosition' };

      zoom.add('(min-aspect-ratio: 1/1)', () => {
        // Wide: scale about the hands' position, then shift them to the centre (1.6x is the least that
        // leaves no gap at the left).
        const tween = gsap.fromTo(
          image,
          { scale: 1, xPercent: 0, yPercent: 0 },
          { scale: 1.6, xPercent: 18.5, yPercent: 5, duration: 2.1 },
        );
        tl.add(tween, 0.1);
        return () => {
          tween.kill();
          gsap.set(image, clear);
        };
      });

      zoom.add('(max-aspect-ratio: 1/1)', () => {
        // Tall (phones): `cover` shows only a vertical slice of the picture, centred by default, which
        // misses the hands (they sit left of centre). Slide the picture so the slice is centred on them,
        // then zoom about the middle of the screen, where they now are.
        const shown = Math.min(1, window.innerWidth / window.innerHeight / (getInTouch.width / getInTouch.height));
        const x = shown >= 1 ? 50 : gsap.utils.clamp(0, 100, ((HANDS.x - shown / 2) / (1 - shown)) * 100);
        gsap.set(image, { objectPosition: `${x}% 50%`, transformOrigin: `50% ${HANDS.y * 100}%` });
        const tween = gsap.fromTo(image, { scale: 1 }, { scale: 1.15, duration: 2.1 });
        tl.add(tween, 0.1);
        return () => {
          tween.kill();
          gsap.set(image, clear);
        };
      });
      tl.fromTo(words, { color: 'var(--color-fg)' }, { color: '#f3f3f3', stagger: 0.12, duration: 0.3 }, 0.45);

      // 2 — fill the screen, the line steps aside
      tl.to(`.${styles.frame}`, { scale: 1, clipPath: 'inset(0px 0px)', duration: 0.9 }, 1.3);
      tl.to(`.${styles.line}`, { yPercent: -120, autoAlpha: 0, duration: 0.5 }, 1.5);

      // 3 — call to action
      tl.from(`.${styles.ctaInner}`, { yPercent: 110, duration: 0.6, stagger: 0.12 }, 1.9);
      tl.from(`.${styles.ctaLink}`, { '--underline': 0, duration: 0.4 }, 2.4);
      tl.to({}, { duration: 0.3 }); // hold at the end before unpinning
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className={styles.scene}>
      {cards.map(({ left, top, project }) => (
        <div
          key={project.slug}
          className={styles.card}
          style={{ left: `${left}%`, top: `${top}%`, backgroundColor: project.color }}
          aria-hidden
        >
          <Image
            src={project.images[0]}
            alt=""
            width={1600}
            height={1000}
            sizes="190px"
            placeholder={blurPlaceholder(project.images[0])}
          />
        </div>
      ))}

      {/* Enlarged + sharpened by `npm run images`; quality 85 keeps that crispness. */}
      <div className={styles.frame} aria-hidden>
        <Image src={getInTouch} alt="" fill sizes="100vw" quality={85} className={styles.frameImage} />
      </div>

      <p className={styles.line}>{t.home.scatterLine}</p>

      <h2 className={styles.cta}>
        <span className={styles.ctaMask}>
          <span className={styles.ctaInner}>{t.contact.ctaLine1}</span>
        </span>
        <span className={styles.ctaMask}>
          <span className={styles.ctaInner}>
            {t.contact.ctaLine2}{' '}
            <ContactTrigger className={styles.ctaLink} pill={false}>{t.contact.ctaLink}</ContactTrigger>
          </span>
        </span>
      </h2>
    </section>
  );
}
