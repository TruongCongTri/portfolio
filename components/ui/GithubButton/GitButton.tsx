'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { useMagnetic } from '@/lib/useMagnetic';
import styles from './GitButton.module.css';

/** Inline GitHub SVG icon */
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export type GitButtonProps = {
  /** Omit for an icon-only button (size="icon"); give it an `ariaLabel` then. */
  children?: React.ReactNode;
  /** Renders a link; without it, a <button>. */
  href?: string;
  /** Button mode only. */
  type?: 'button' | 'submit';
  onClick?: () => void;
  variant?: 'outline' | 'solid';
  /** `icon` is a small circle sized for a lone GitHub mark. */
  size?: 'sm' | 'lg' | 'icon';
  /** Superscript number after the label (e.g. stars or repo count). */
  count?: number;
  /** Whether to display the GitHub icon. Defaults to true. */
  icon?: boolean;
  /** Icon position: 'trailing' (replaces the arrow) or 'leading'. Defaults to 'trailing'. */
  iconPosition?: 'leading' | 'trailing';
  /** Drift toward the cursor while hovered. */
  magnetic?: boolean;
  /** GitHub links default to external new tab. */
  external?: boolean;
  ariaLabel?: string;
  /** Native tooltip. */
  title?: string;
};

export default function GitButton({
  children,
  href,
  type = 'button',
  onClick,
  variant = 'outline',
  size = 'sm',
  count,
  icon = true,
  iconPosition = 'trailing',
  magnetic = false,
  external = true,
  ariaLabel,
  title,
}: GitButtonProps) {
  const ref = useRef<HTMLElement>(null);

  useMagnetic(ref, { enabled: magnetic, inner: `.${styles.label}`, innerStrength: 0.12 });

  const className = `${styles.pill} ${styles[variant]} ${styles[size]}`;
  const effectiveAriaLabel = ariaLabel || (!children ? 'GitHub' : undefined);
  const a11y = { 'aria-label': effectiveAriaLabel, title };

  const iconElement = icon && <GitHubIcon className={styles.gitIcon} />;

  const content = (
    <span className={styles.label}>
      {iconPosition === 'leading' && iconElement}
      {children && (
        <span className={styles.textWrap}>
          <span className={styles.text}>{children}</span>
          {count !== undefined && <sup className={styles.count}>{count}</sup>}
        </span>
      )}
      {iconPosition === 'trailing' && iconElement}
    </span>
  );

  if (!href) {
    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} type={type} className={className} onClick={onClick} {...a11y}>
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
      {...a11y}
    >
      {content}
    </a>
  ) : (
    <Link ref={ref as React.Ref<HTMLAnchorElement>} href={href} className={className} {...a11y}>
      {content}
    </Link>
  );
}