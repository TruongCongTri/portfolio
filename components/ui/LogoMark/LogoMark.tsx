import styles from './LogoMark.module.css';

/** Placeholder brand mark (two offset arcs). Uses currentColor, so it follows the text color. */
export default function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg className={styles.mark} width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <circle cx="12" cy="16" r="9" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M20 7a9 9 0 0 1 0 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="16" r="2.4" fill="currentColor" />
    </svg>
  );
}
