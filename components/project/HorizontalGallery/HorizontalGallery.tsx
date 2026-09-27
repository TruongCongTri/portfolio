'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { gsap, PLAY_ONCE, useGSAP } from '@/lib/gsap';
import { useI18n } from '@/lib/i18n/client';
import { blurPlaceholder, imageUrl, type ProjectImage } from '@/lib/projects';
import SplitReveal from '@/components/ui/SplitReveal/SplitReveal';
import styles from './HorizontalGallery.module.css';

type HorizontalGalleryProps = {
  images: ProjectImage[];
  title: string;
  caption: string;
};

const pad = (n: number) => String(n).padStart(2, '0');

/** Pins the section and slides the screens horizontally as the user scrolls, with a live counter. */
export default function HorizontalGallery({ images, title, caption }: HorizontalGalleryProps) {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const track = trackRef.current!;
      // How far the track must travel for the last slide's right edge to meet the right gutter.
      const distance = () => {
        const last = track.lastElementChild as HTMLElement;
        const gutter = parseFloat(getComputedStyle(track).paddingLeft);
        return Math.max(0, last.offsetLeft + last.offsetWidth + gutter - window.innerWidth);
      };

      gsap.to(track, {
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

  return (
    <section ref={ref} className={styles.gallery}>
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
            <Image
              src={src}
              alt={`${t.project.screen} ${i + 1}`}
              fill
              sizes="(max-width: 768px) 82vw, 52vw"
              placeholder={blurPlaceholder(src)}
              className={styles.image}
            />
          </figure>
        ))}
      </div>

      <div className={styles.footer} aria-hidden>
        <span ref={counterRef} className={styles.current}>
          {pad(1)}
        </span>
        <span className={styles.total}>/ {pad(images.length)}</span>
      </div>
    </section>
  );
}
