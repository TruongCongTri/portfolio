'use client';

import { useRef } from 'react';
import { gsap, MASK_START, PLAY_ONCE, roomyMasks, SplitText, useGSAP } from '@/lib/gsap';
import FitText from '@/components/ui/FitText/FitText';
import styles from './Footer.module.css';

/** Full-width name that rises letter by letter as the footer scrolls into view. */
export default function FooterWordmark({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const split = SplitText.create(ref.current!.querySelector('span')!, { type: 'chars', mask: 'chars' });
      roomyMasks(split.masks);
      gsap.from(split.chars, {
        yPercent: MASK_START,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.035,
        scrollTrigger: { trigger: ref.current, start: 'top 95%', ...PLAY_ONCE },
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
