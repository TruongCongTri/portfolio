'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { gsap, PLAY_ONCE, useGSAP } from '@/lib/gsap';
import styles from './ParallaxImage.module.css';

type ParallaxImageProps = {
  src: string;
  alt: string;
  className?: string;
  /** Percent of the image height it drifts while crossing the viewport. */
  strength?: number;
};

/** Image that reveals with a clip-path wipe, then drifts inside its frame as it scrolls past. */
export default function ParallaxImage({ src, alt, className, strength = 14 }: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const img = ref.current!.querySelector('img');
      gsap.from(ref.current, {
        clipPath: 'inset(100% 0% 0% 0%)',
        duration: 1.6,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: ref.current, start: 'top 85%', ...PLAY_ONCE },
      });
      gsap.fromTo(
        img,
        { yPercent: -strength / 2, scale: 1.15 },
        {
          yPercent: strength / 2,
          scale: 1.15,
          ease: 'none',
          scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={`${styles.frame} ${className ?? ''}`}>
      <Image src={src} alt={alt} fill sizes="100vw" className={styles.image} />
    </div>
  );
}
