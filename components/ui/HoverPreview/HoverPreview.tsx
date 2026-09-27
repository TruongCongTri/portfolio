'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import styles from './HoverPreview.module.css';

const OFFSET = 24;

type HoverPreviewProps = {
  src: string | null;
  /** Card color behind the inset screenshot. */
  color?: string;
};

/** Colored card with an inset screenshot that trails the cursor while `src` is set. */
export default function HoverPreview({ src, color }: HoverPreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Keep showing the last image while fading out after `src` becomes null.
  const [shown, setShown] = useState({ src, color });
  if (src && src !== shown.src) setShown({ src, color });

  useGSAP(() => {
    const xTo = gsap.quickTo(ref.current, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(ref.current, 'y', { duration: 0.6, ease: 'power3.out' });
    const rTo = gsap.quickTo(ref.current, 'rotation', { duration: 0.8, ease: 'power3.out' });
    let lastX = 0;
    const onMove = (e: MouseEvent) => {
      xTo(e.clientX + OFFSET);
      yTo(e.clientY + OFFSET);
      // Tilt slightly in the direction of travel.
      rTo(gsap.utils.clamp(-8, 8, (e.clientX - lastX) * 0.4));
      lastX = e.clientX;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  });

  useEffect(() => {
    gsap.to(ref.current, {
      autoAlpha: src ? 1 : 0,
      scale: src ? 1 : 0.6,
      duration: 0.5,
      ease: 'expo.out',
      overwrite: 'auto',
    });
  }, [src]);

  return (
    <div ref={ref} className={styles.preview} style={{ backgroundColor: shown.color }} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element -- remote placeholder images */}
      {shown.src && <img src={shown.src} alt="" className={styles.image} />}
    </div>
  );
}
