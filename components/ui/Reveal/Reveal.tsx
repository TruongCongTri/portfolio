'use client';

import { useRef } from 'react';
import { gsap, PLAY_ONCE, useGSAP } from '@/lib/gsap';

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Seconds between each direct child's entrance. */
  stagger?: number;
};

/** Fades and lifts its direct children into view as they scroll into the viewport. */
export default function Reveal({ children, className, stagger = 0.1 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(ref.current!.children, {
        y: 40,
        autoAlpha: 0,
        duration: 0.9,
        stagger,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 85%', ...PLAY_ONCE },
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
