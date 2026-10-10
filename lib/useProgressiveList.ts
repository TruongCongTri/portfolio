import { useEffect, useMemo, useRef, useState } from 'react';

/** How many items a list renders first, and how many more each time its end comes into view. */
export const BATCH = 4;

/**
 * Renders a long list a few items at a time, like paging through an API: the first `batch` items now,
 * the next `batch` once the end of the list is within `lookahead` of the viewport, and so on. Fewer
 * elements and images on first load; the rest arrive just before they're needed.
 *
 * Put `sentinelRef` on an empty element right after the list. The list resets to its first batch when
 * the component remounts, so key it by content (a new filter result starts again from the top).
 */
export function useProgressiveList<T>(items: T[], batch = BATCH, lookahead = 600) {
  const [count, setCount] = useState(batch);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const visible = useMemo(() => items.slice(0, count), [items, count]);
  const hasMore = count < items.length;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!hasMore || !sentinel) return;
    // A fresh observer after every batch: it reports straight away, so if the end is still in range
    // (a tall screen) the next batch follows without waiting for a scroll.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setCount((current) => Math.min(items.length, current + batch));
      },
      { rootMargin: `0px 0px ${lookahead}px 0px` },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, count, items.length, batch, lookahead]);

  return { visible, count, hasMore, sentinelRef };
}
