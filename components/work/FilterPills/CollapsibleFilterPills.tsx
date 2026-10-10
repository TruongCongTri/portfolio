'use client';

import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { useMagnetic } from '@/lib/useMagnetic';
import { PillOptionButton, type FilterOption } from './FilterPills';
import styles from './FilterPills.module.css';

/** A plus that turns into a cross (rotates 45°), drawn so it sits exactly in the middle of its box. */
function PlusIcon({ open }: { open: boolean }) {
  return (
    <svg className={`${styles.plus} ${open ? styles.plusOpen : ''}`} viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <path d="M12 4.5v15M4.5 12h15" />
    </svg>
  );
}

type CollapsibleFilterPillsProps<T extends string> = {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  /** Accessible name of the "+" button. */
  moreLabel: string;
  /** Accessible name of the same button while the full list is open. */
  lessLabel: string;
};

/**
 * Filter pills kept to a single row. When they don't all fit, the row shows as many as it can plus a
 * "+" button that opens the full list; a selected option that didn't make the row takes the place of
 * the last visible one, so the active filter is always on screen.
 *
 * Motion: the extra pills rise in when the list opens and sink out before it closes; whatever newly
 * joins the row (a selection swapping in) rises in as the list closes.
 */
function CollapsibleFilterPills<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  moreLabel,
  lessLabel,
}: CollapsibleFilterPillsProps<T>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  // Height of the one-row list, remembered at the moment it opens so the height can grow from it
  const openFrom = useRef(0);
  // How many options fit on one row (null until measured; the server render shows them all, clipped)
  const [fit, setFit] = useState<number | null>(null);
  // `open` is the button's state; `expanded` is the layout (it outlasts `open` while the pills sink out)
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const closing = useRef(false);

  // Measure a hidden copy of every pill (and the "+"), so widths are known even for pills not shown.
  useLayoutEffect(() => {
    const root = rootRef.current;
    const measure = measureRef.current;
    if (!root || !measure) return;

    const update = () => {
      const widths = Array.from(measure.children, (child) => child.getBoundingClientRect().width);
      const moreWidth = widths.pop() ?? 0;
      const gap = parseFloat(getComputedStyle(measure).columnGap) || 0;
      const room = root.clientWidth;
      const total = widths.reduce((sum, w) => sum + w, 0) + gap * Math.max(0, widths.length - 1);
      if (total <= room) {
        setFit(options.length);
        return;
      }
      let used = 0;
      let count = 0;
      for (const width of widths) {
        const next = used + (count ? gap : 0) + width;
        if (next > room - moreWidth - gap) break;
        used = next;
        count += 1;
      }
      setFit(Math.max(1, count));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);
    // Web fonts change the pills' widths once they load
    document.fonts?.ready.then(update);
    return () => observer.disconnect();
  }, [options]);

  const overflowing = fit !== null && fit < options.length;

  // The one-row set: the first `fit` options, the selected one taking the last slot if it's beyond them
  const rowFor = (selected: T) => {
    if (!overflowing) return options;
    const selectedAt = options.findIndex((option) => option.value === selected);
    if (selectedAt >= fit) return [...options.slice(0, fit - 1), options[selectedAt]];
    return options.slice(0, fit);
  };
  const row = rowFor(value);
  const rowValues = new Set(row.map((option) => option.value));
  const shown = overflowing && !expanded ? row : options;
  const hiddenCount = options.length - row.length;

  /** Sinks the extra pills (and the button) out while the list's height eases back to one row, then collapses the layout. */
  const close = (alsoLeaving: T[] = []) => {
    const group = groupRef.current;
    if (!expanded || closing.current || !group) return;
    closing.current = true;
    setOpen(false);
    const rowHeight = (measureRef.current?.firstElementChild as HTMLElement | null)?.offsetHeight ?? group.offsetHeight;
    const pillsOut = alsoLeaving.map((v) => rootRef.current?.querySelector<HTMLElement>(`[data-value="${CSS.escape(v)}"]`));
    const leaving = [...gsap.utils.toArray<HTMLElement>('[data-extra]', rootRef.current), ...pillsOut, moreRef.current].filter(Boolean);
    gsap
      .timeline({
        onComplete: () => {
          setExpanded(false);
          closing.current = false;
          gsap.set(group, { clearProps: 'height,overflow' });
        },
      })
      .set(group, { height: group.offsetHeight, overflow: 'hidden' })
      .to(leaving, { y: 16, autoAlpha: 0, duration: 0.3, ease: 'power2.in', stagger: { each: 0.025, from: 'end' } }, 0)
      .to(group, { height: rowHeight, duration: 0.45, ease: 'power3.inOut' }, 0);
  };
  // Latest close() for the listeners below, which must not re-bind on every render
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });

  const toggle = () => {
    if (open) return close();
    openFrom.current = groupRef.current?.offsetHeight ?? 0;
    setOpen(true);
    setExpanded(true);
  };

  // Close on Escape or a click elsewhere
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) closeRef.current();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  // Opening: the list grows to its full height while the extra pills, then the button, rise in
  useGSAP(
    () => {
      const group = groupRef.current;
      if (!expanded || !group) return;
      const extras = gsap.utils.toArray<HTMLElement>('[data-extra]', rootRef.current);
      gsap.fromTo(
        group,
        { height: openFrom.current, overflow: 'hidden' },
        { height: group.offsetHeight, duration: 0.6, ease: 'power3.out', clearProps: 'height,overflow' },
      );
      gsap.fromTo(
        extras,
        { y: 24, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out', stagger: 0.045 },
      );
      // The button arrives last, in its new place at the end of the list
      gsap.fromTo(
        moreRef.current,
        { y: 24, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out', delay: extras.length * 0.045 },
      );
    },
    { scope: rootRef, dependencies: [expanded] },
  );

  // First time the button exists: it joins the page's intro, right after the last pill
  const introPlayed = useRef(false);
  useGSAP(
    () => {
      if (!overflowing || !moreRef.current) return;
      const first = !introPlayed.current;
      introPlayed.current = true;
      gsap.from(moreRef.current, { y: 30, autoAlpha: 0, duration: 1, ease: 'expo.out', delay: first ? 0.5 + 0.06 * row.length : 0 });
    },
    { scope: rootRef, dependencies: [overflowing] },
  );

  // Collapsed: pills that newly joined the row (a selection swapping in) rise in
  const previousRow = useRef<Set<T> | null>(null);
  const wasExpandedRef = useRef(false);
  useEffect(() => {
    if (expanded) wasExpandedRef.current = true;
  }, [expanded]);
  useGSAP(
    () => {
      if (expanded || fit === null) return;
      const wasExpanded = wasExpandedRef.current;
      wasExpandedRef.current = false;
      if (wasExpanded && moreRef.current) {
        gsap.fromTo(moreRef.current, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out' });
      }
      const before = previousRow.current;
      previousRow.current = new Set(row.map((option) => option.value));
      if (!before) return;
      const entering = row.filter((option) => !before.has(option.value));
      if (!entering.length) return;
      const targets = entering.map((option) => rootRef.current!.querySelector(`[data-value="${CSS.escape(option.value)}"]`));
      gsap.fromTo(targets.filter(Boolean), { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out', stagger: 0.05 });
    },
    { scope: rootRef, dependencies: [expanded, fit, value, row.map((option) => option.value).join()] },
  );

  // The "+" ⇄ "×" button resizes smoothly (the × drops the count, so it's narrower)
  const moreWidth = useRef<number | null>(null);
  useLayoutEffect(() => {
    const el = moreRef.current;
    if (!el) {
      moreWidth.current = null;
      return;
    }
    const from = moreWidth.current;
    const to = el.offsetWidth;
    if (from !== null && from !== to) {
      gsap.fromTo(el, { width: from }, { width: to, duration: 0.5, ease: 'expo.out', clearProps: 'width' });
    }
    moreWidth.current = to;
  }, [open, overflowing, hiddenCount]);

  useGSAP(
    () => {
      gsap.from(`.${styles.pills} > .${styles.pill}`, {
        y: 30,
        autoAlpha: 0,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.06,
        delay: 0.5,
      });
    },
    { scope: rootRef },
  );

  useMagnetic(rootRef, {
    target: `.${styles.pills} > .${styles.pill}`,
    inner: `.${styles.content}`,
    dependencies: [shown.map((option) => option.value).join(), overflowing, expanded],
  });

  const select = (next: T) => {
    // Pills that leave the row because of this choice (the one the swapped-in pill displaces) sink away with the rest
    const nextRow = new Set(rowFor(next).map((option) => option.value));
    const dropped = row.map((option) => option.value).filter((v) => !nextRow.has(v));
    if (expanded) {
      onChange(next);
      close(dropped);
    } else if (dropped.length) {
      // Collapsed: let the displaced pill sink out first, then swap
      const out = dropped.map((v) => rootRef.current?.querySelector<HTMLElement>(`[data-value="${CSS.escape(v)}"]`)).filter(Boolean);
      gsap.to(out, { y: 16, autoAlpha: 0, duration: 0.25, ease: 'power2.in', onComplete: () => onChange(next) });
    } else {
      onChange(next);
    }
  };

  return (
    <div ref={rootRef} className={styles.collapsible}>
      <div
        ref={groupRef}
        className={`${styles.pills} ${expanded ? styles.pillsOpen : styles.pillsRow}`}
        role="group"
        aria-label={ariaLabel}
      >
        {shown.map((option) => (
          <PillOptionButton
            key={option.value}
            option={option}
            selected={option.value === value}
            onSelect={select}
            buttonProps={{ 'data-value': option.value, ...(expanded && !rowValues.has(option.value) ? { 'data-extra': '' } : {}) }}
          />
        ))}
        {overflowing && (
          <button
            ref={moreRef}
            type="button"
            className={`${styles.pill} ${styles.more} ${open ? styles.moreOpen : ''} wipe`}
            aria-expanded={open}
            aria-label={open ? lessLabel : moreLabel}
            onClick={toggle}
          >
            <span className={styles.content}>
              <PlusIcon open={open} />
              {!open && hiddenCount > 0 && <sup className={styles.count}>{hiddenCount}</sup>}
            </span>
          </button>
        )}
      </div>

      {/* Invisible copy of the whole set, only to read widths from */}
      <div ref={measureRef} className={styles.measure} aria-hidden>
        {options.map((option) => (
          <PillOptionButton key={option.value} option={option} selected={false} onSelect={() => {}} />
        ))}
        <button type="button" tabIndex={-1} className={`${styles.pill} ${styles.more}`}>
          <span className={styles.content}>
            <PlusIcon open={false} />
            <sup className={styles.count}>00</sup>
          </span>
        </button>
      </div>
    </div>
  );
}

export default memo(CollapsibleFilterPills) as typeof CollapsibleFilterPills;
