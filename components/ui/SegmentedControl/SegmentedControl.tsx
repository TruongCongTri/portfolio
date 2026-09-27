'use client';

import { useRef } from 'react';
import { useMagnetic } from '@/lib/useMagnetic';
import styles from './SegmentedControl.module.css';

export type SegmentedOption<T extends string> = {
  value: T;
  /** Text or an icon. Icon-only labels need `ariaLabel`. */
  label: React.ReactNode;
  ariaLabel?: string;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentedOption<T>[];
  /** `null` renders no active option (e.g. before a client-only value is known). */
  value: T | null;
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: 'sm' | 'md';
};

/**
 * Outlined group of pill toggles. Each option uses the shared `.wipe` motion (fill wipes up on
 * hover); the active option is the filled one.
 */
export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = 'md',
}: SegmentedControlProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  useMagnetic(ref, { target: `.${styles.option}`, inner: `.${styles.content}` });

  return (
    <div ref={ref} className={`${styles.control} ${styles[size]}`} role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`${styles.option} wipe`}
          aria-pressed={option.value === value}
          aria-label={option.ariaLabel}
          title={option.ariaLabel}
          onClick={() => onChange(option.value)}
        >
          <span className={styles.content}>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
