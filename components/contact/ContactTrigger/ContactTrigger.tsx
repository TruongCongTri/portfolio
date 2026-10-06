'use client';

import { useRef } from 'react';
import { useMagnetic } from '@/lib/useMagnetic';
import { useContact } from '../ContactProvider/ContactProvider';
import styles from './ContactTrigger.module.css';

type ContactTriggerProps = {
  children: React.ReactNode;
  className?: string;
  /** Runs before opening, e.g. to close the side panel. */
  onBeforeOpen?: () => void;
  /** Drift & spring toward cursor on hover (matches PillButton). Defaults to true. */
  magnetic?: boolean;
  /** Applies pill shape, sizing, and wipe animation. Defaults to true. */
  pill?: boolean;
  variant?: 'outline' | 'solid';
  size?: 'sm' | 'lg' | 'icon';
  /** Trailing ↗ arrow */
  arrow?: boolean;
  ariaLabel?: string;
  title?: string;
};

/**
 * Button that opens the contact panel with magnetic cursor physics and wipe animation.
 * Marked with data-contact-trigger so the panel's click-outside handler ignores it.
 */
export default function ContactTrigger({
  children,
  className,
  onBeforeOpen,
  magnetic = true,
  pill = true,
  variant = 'outline',
  size = 'sm',
  arrow = false,
  ariaLabel,
  title,
}: ContactTriggerProps) {
  const { open, isOpen } = useContact();
  const ref = useRef<HTMLButtonElement>(null);

  // Hook responsible for the magnetic spring / jiggling interaction
  useMagnetic(ref, {
    enabled: magnetic,
    inner: `.${styles.label}`,
    innerStrength: 0.12,
  });

  const buttonClasses = pill
    ? `${styles.pill} ${styles[variant]} ${styles[size]} ${className ?? ''}`
    : className;

  return (
    <button
      ref={ref}
      type="button"
      className={buttonClasses}
      data-contact-trigger
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-label={ariaLabel}
      title={title}
      onClick={() => {
        onBeforeOpen?.();
        open();
      }}
    >
      <span className={styles.label}>
        {children}
        {arrow && (
          <span className={styles.arrow} aria-hidden>
            ↗
          </span>
        )}
      </span>
    </button>
  );
}