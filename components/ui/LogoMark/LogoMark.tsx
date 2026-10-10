import Image from 'next/image';
import styles from './LogoMark.module.css';

/**
 * The brand mark: the round 8-bit pixel portrait (public/icons, made from "8-bit pixel portrait.jpg").
 * Spins once when its link is hovered. Shown unoptimized and unsmoothed so the pixels stay crisp.
 */
export default function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <Image
      className={styles.mark}
      src="/icons/icon-192.png"
      alt=""
      width={size}
      height={size}
      unoptimized
      aria-hidden
    />
  );
}
