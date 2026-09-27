'use client';

import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from '@/lib/gsap';
import FitText from '@/components/ui/FitText/FitText';
import styles from './Footer.module.css';

/** Full-width name that rises letter by letter as the footer scrolls into view. */
export default function FooterWordmark({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const split = SplitText.create(ref.current!.querySelector('span')!, { type: 'chars', mask: 'chars' });
      gsap.from(split.chars, {
        yPercent: 100,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.035,
        scrollTrigger: { trigger: ref.current, start: 'top 95%', once: true },
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={styles.wordmark} aria-hidden>
      <FitText>{text}</FitText>
    </div>
  );
}
