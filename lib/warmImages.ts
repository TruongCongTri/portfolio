import { getImageProps } from 'next/image';
import type { ProjectImage } from '@/lib/projects';

/**
 * Starts downloading images before they're on screen, at the exact size `next/image` will ask for
 * (same `sizes`, so the browser picks the same candidate and later finds it already cached). Runs when
 * the browser is idle and is skipped on Data Saver. Returns a cancel function.
 */
export function warmImages(images: ProjectImage[], sizes: string) {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData || !images.length) return () => {};

  const run = () => {
    for (const image of images) {
      const { props } = getImageProps({ src: image, alt: '', fill: true, sizes });
      const img = new Image();
      img.decoding = 'async';
      img.sizes = props.sizes ?? sizes;
      if (props.srcSet) img.srcset = props.srcSet;
      img.src = props.src;
    }
  };

  if (typeof window.requestIdleCallback === 'function') {
    const handle = window.requestIdleCallback(run, { timeout: 2000 });
    return () => window.cancelIdleCallback(handle);
  }
  const timer = window.setTimeout(run, 300);
  return () => window.clearTimeout(timer);
}
