'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { useMagnetic } from '@/lib/useMagnetic';
import styles from './PillButton.module.css';

type PillButtonProps = {
  children: React.ReactNode;
  /** Renders a link; without it, a <button>. */
  href?: string;
  /** Button mode only. */
  type?: 'button' | 'submit';
  onClick?: () => void;
  variant?: 'outline' | 'solid';
  size?: 'sm' | 'lg';
  /** Superscript number after the label, e.g. a project count. */
  count?: number;
  /** Trailing ↗ arrow. */
  arrow?: boolean;
  /** Drift toward the cursor while hovered. */
  magnetic?: boolean;
  external?: boolean;
};

export default function PillButton({
  children,
  href,
  type = 'button',
  onClick,
  variant = 'outline',
  size = 'sm',
  count,
  arrow = false,
  magnetic = false,
  external = false,
}: PillButtonProps) {
  const ref = useRef<HTMLElement>(null);

  useMagnetic(ref, { enabled: magnetic, inner: `.${styles.label}`, innerStrength: 0.12 });

  const className = `${styles.pill} ${styles[variant]} ${styles[size]}`;
  const content = (
    <span className={styles.label}>
      {children}
      {count !== undefined && <sup className={styles.count}>{count}</sup>}
      {arrow && (
        <span className={styles.arrow} aria-hidden>
          ↗
        </span>
      )}
    </span>
  );

  if (!href) {
    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} type={type} className={className} onClick={onClick}>
        {content}
      </button>
    );
  }

  return external ? (
    <a
      ref={ref as React.Ref<HTMLAnchorElement>}
      href={href}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
    >
      {content}
    </a>
  ) : (
    <Link ref={ref as React.Ref<HTMLAnchorElement>} href={href} className={className}>
      {content}
    </Link>
  );
}
