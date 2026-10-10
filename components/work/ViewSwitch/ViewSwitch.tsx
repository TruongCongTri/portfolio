'use client';

import { memo, useRef } from 'react';
import { useMagnetic } from '@/lib/useMagnetic';
import styles from './ViewSwitch.module.css';

import type { ViewMode } from '@/lib/workQuery';

export type { ViewMode };

type ViewSwitchProps = {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
  ariaLabel: string;
  labels: Record<ViewMode, string>;
};

const icons: Record<ViewMode, React.ReactNode> = {
  list: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
    </svg>
  ),
};

/** Two round icon buttons for list / grid. */
function ViewSwitch({ value, onChange, ariaLabel, labels }: ViewSwitchProps) {
  const ref = useRef<HTMLDivElement>(null);
  useMagnetic(ref, { target: `.${styles.button}`, inner: `.${styles.icon}` });

  return (
    <div ref={ref} className={styles.switch} role="group" aria-label={ariaLabel}>
      {(['list', 'grid'] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          className={`${styles.button} wipe`}
          aria-pressed={mode === value}
          aria-label={labels[mode]}
          title={labels[mode]}
          onClick={() => onChange(mode)}
        >
          <span className={styles.icon}>{icons[mode]}</span>
        </button>
      ))}
    </div>
  );
}

export default memo(ViewSwitch);
