'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { gsap, PLAY_ONCE, useGSAP } from '@/lib/gsap';
import { isLowEndDevice } from '@/lib/perf';
import styles from './ParallaxImage.module.css';

type ParallaxImageProps = {
  src: string;
  alt: string;
  className?: string;
  /** Percent of the image height it drifts while crossing the viewport. */
  strength?: number;
  /** Hint for next/image: the width the frame takes up on screen. */
  sizes?: string;
  /** CSS object-position: which part of the picture stays in view when it's cropped. */
  position?: string;
  /** `contain` shows the whole picture (letterboxed) instead of cropping it to the frame. */
  fit?: 'cover' | 'contain';
};

/** Image that reveals with a clip-path wipe, then drifts inside its frame as it scrolls past. */
export default function ParallaxImage({ src, alt, className, strength = 14, sizes = '100vw', position, fit }: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const img = ref.current!.querySelector('img');
      // Just enough extra size to cover the drift (strength % of the height); the default 14 gives the old 1.15.
      const scale = 1 + strength / 100 + 0.01;
      gsap.from(ref.current, {
        clipPath: 'inset(100% 0% 0% 0%)',
        duration: 1.6,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: ref.current, start: 'top 85%', ...PLAY_ONCE },
      });
      // The drift re-paints a large image on every scroll frame: skipped on weak devices
      if (isLowEndDevice()) return;
      gsap.fromTo(
        img,
        { yPercent: -strength / 2, scale },
        {
          yPercent: strength / 2,
          scale,
          ease: 'none',
          scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={`${styles.frame} ${className ?? ''}`}>
      <Image src={src} alt={alt} fill sizes={sizes} style={{ objectPosition: position, objectFit: fit }} className={styles.image} />
    </div>
  );
}
