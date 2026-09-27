'use client';

import { useEffect, useRef } from 'react';
import styles from './FitText.module.css';

/** Single-line text whose font size is scaled so it spans exactly the container's width. */
export default function FitText({ children, className }: { children: React.ReactNode; className?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const box = boxRef.current!;
    const text = textRef.current!;
    const fit = () => {
      text.style.fontSize = '100px';
      const scale = box.clientWidth / text.scrollWidth;
      text.style.fontSize = `${100 * scale}px`;
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    document.fonts?.ready.then(fit);
    return () => observer.disconnect();
  }, [children]);

  return (
    <div ref={boxRef} className={`${styles.box} ${className ?? ''}`}>
      <span ref={textRef} className={styles.text}>
        {children}
      </span>
    </div>
  );
}
