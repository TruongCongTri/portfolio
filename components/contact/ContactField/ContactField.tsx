'use client';

import { useId, useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import styles from './ContactField.module.css';

type ContactFieldProps = {
  name: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  /** Custom validation message; the field renders in its error state while set. */
  error?: string;
  type?: 'text' | 'email';
  multiline?: boolean;
  autoComplete?: string;
  className?: string;
};

/** Underlined text field with a label and an animated custom warning (no native validation UI). */
export default function ContactField({
  name,
  label,
  placeholder,
  value,
  onChange,
  error,
  type = 'text',
  multiline = false,
  autoComplete,
  className,
}: ContactFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const ref = useRef<HTMLDivElement>(null);

  // The warning rises out of its mask whenever a (new) message appears.
  useGSAP(
    () => {
      if (!error) return;
      gsap.from(`.${styles.errorText}`, { yPercent: 110, duration: 0.6, ease: 'expo.out' });
    },
    { scope: ref, dependencies: [error] },
  );

  const shared = {
    id,
    name,
    value,
    placeholder,
    autoComplete,
    className: styles.input,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? errorId : undefined,
  };

  return (
    <div ref={ref} className={`${styles.field} ${error ? styles.invalid : ''} ${className ?? ''}`} data-field={name}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.control}>
        {multiline ? (
          <textarea {...shared} rows={4} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <input {...shared} type={type} onChange={(e) => onChange(e.target.value)} />
        )}
        <span className={styles.line} aria-hidden />
      </div>
      <span className={styles.errorMask} aria-live="polite">
        {error && (
          <span id={errorId} className={styles.errorText}>
            {error}
          </span>
        )}
      </span>
    </div>
  );
}
