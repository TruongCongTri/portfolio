'use client';

import { memo, useRef } from 'react';
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
  /** Seconds before the entrance starts: the page intro waits for the title, a dropdown doesn't. */
  delay?: number;
};

/** One filter button (label, optional icon / count / arrow). Shared with CollapsibleFilterPills. */
export function PillOptionButton<T extends string>({
  option,
  selected,
  onSelect,
  buttonProps,
}: {
  option: FilterOption<T>;
  selected: boolean;
  onSelect: (value: T) => void;
  /** Extra attributes for the <button> (e.g. data-* markers the parent animates by). */
  buttonProps?: Record<string, string | undefined>;
}) {
  return (
    <button type="button" className={`${styles.pill} wipe`} aria-pressed={selected} onClick={() => onSelect(option.value)} {...buttonProps}>
      <span className={styles.content}>
        {option.icon && (
          <span className={styles.icon} aria-hidden>
            {option.icon}
          </span>
        )}
        <span>{option.label}</span>
        {option.count !== undefined && <sup className={styles.count}>{option.count}</sup>}
        {option.arrow && (
          <span className={styles.arrow} aria-hidden>
            ↗
          </span>
        )}
      </span>
    </button>
  );
}

function FilterPills<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  delay = 0.5,
}: FilterPillsProps<T>) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(`.${styles.pill}`, {
        y: 30,
        autoAlpha: 0,
        duration: delay > 0 ? 1 : 0.7,
        ease: 'expo.out',
        stagger: delay > 0 ? 0.06 : 0.04,
        delay,
      });
    },
    { scope: ref },
  );

  useMagnetic(ref, { target: `.${styles.pill}`, inner: `.${styles.content}` });

  return (
    <div ref={ref} className={styles.pills} role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <PillOptionButton key={option.value} option={option} selected={option.value === value} onSelect={onChange} />
      ))}
    </div>
  );
}

/** The "clear filters" button: a filter pill with an X, same look and motion as the others. */
function ClearPillBase({
  label,
  onClick,
  ariaLabel,
  delay = 0,
}: {
  label: string;
  onClick: () => void;
  ariaLabel?: string;
  /** Seconds before it rises in (0 once the page intro is over). */
  delay?: number;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  useGSAP(() => {
    gsap.from(ref.current, { y: 30, autoAlpha: 0, duration: 1, ease: 'expo.out', delay });
  });
  useMagnetic(ref, { inner: `.${styles.content}` });

  return (
    <button ref={ref} type="button" className={`${styles.pill} wipe`} onClick={onClick} aria-label={ariaLabel ?? label}>
      <span className={styles.content}>
        <span className={styles.icon} aria-hidden>
          <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </span>
        <span>{label}</span>
      </span>
    </button>
  );
}

/* Memoised: the toolbar re-renders on every URL change, but a group only needs to when its own props change. */
export const ClearPill = memo(ClearPillBase);
export default memo(FilterPills) as typeof FilterPills;
