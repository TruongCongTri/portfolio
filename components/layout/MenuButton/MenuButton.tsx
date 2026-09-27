'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { useI18n } from '@/lib/i18n/client';
import { useMagnetic } from '@/lib/useMagnetic';
import styles from './MenuButton.module.css';

type MenuButtonProps = {
  open: boolean;
  visible: boolean;
  onClick: () => void;
};

export default function MenuButton({ open, visible, onClick }: MenuButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const { t } = useI18n();

  useGSAP(
    () => {
      gsap.to(ref.current, {
        autoAlpha: visible ? 1 : 0,
        scale: visible ? 1 : 0.75,
        duration: 0.4,
        ease: 'expo.out',
      });
    },
    { dependencies: [visible] },
  );

  // Magnetic pull, like the "About me" pill: the disc drifts toward the cursor, the icon a little further.
  useMagnetic(ref, { inner: `.${styles.icon}` });

  useGSAP(
    () => {
      const [top, bottom] = gsap.utils.toArray<HTMLElement>(`.${styles.line}`);
      // Half of (gap + line height) so the two lines meet in the middle as an ×.
      gsap.to(top, { y: open ? 4.75 : 0, rotate: open ? 45 : 0, duration: 0.4, ease: 'expo.out' });
      gsap.to(bottom, { y: open ? -4.75 : 0, rotate: open ? -45 : 0, duration: 0.4, ease: 'expo.out' });
    },
    { dependencies: [open], scope: ref },
  );

  return (
    <button
      ref={ref}
      type="button"
      className={styles.button}
      onClick={onClick}
      aria-label={open ? t.menu.close : t.menu.open}
      aria-expanded={open}
    >
      {/* Wrapper takes the magnetic offset; the lines themselves morph into the × */}
      <span className={styles.icon}>
        <span className={styles.line} />
        <span className={styles.line} />
      </span>
    </button>
  );
}
