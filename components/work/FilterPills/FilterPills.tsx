'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { useMagnetic } from '@/lib/useMagnetic';
import styles from './FilterPills.module.css';

export type FilterOption<T extends string> = {
  value: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
  arrow?: boolean;
};

type FilterPillsProps<T extends string> = {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
};

export default function FilterPills<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: FilterPillsProps<T>) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(`.${styles.pill}`, {
        y: 30,
        autoAlpha: 0,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.06,
        delay: 0.5,
      });
    },
    { scope: ref },
  );

  useMagnetic(ref, { target: `.${styles.pill}`, inner: `.${styles.content}` });

  return (
    <div ref={ref} className={styles.pills} role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`${styles.pill} wipe`}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          <span className={styles.content}>
            {option.icon && (
              <span className={styles.icon} aria-hidden>
                {option.icon}
              </span>
            )}
            <span>{option.label}</span>
            {option.count !== undefined && (
              <sup className={styles.count}>{option.count}</sup>
            )}
            {option.arrow && (
              <span className={styles.arrow} aria-hidden>
                ↗
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}