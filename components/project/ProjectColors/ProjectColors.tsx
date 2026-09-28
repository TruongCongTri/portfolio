'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { projectPalette, type Project, type SectionColors } from '@/lib/projects';
import { isSeamlessNavigation } from '@/lib/transition';

type ProjectColorsProps = { project: Pick<Project, 'slug' | 'color' | 'tone' | 'textColor' | 'sectionColors'> };

const LAST_ORDER_KEY = 'project-section-colors';

function shuffle<T>(items: T[]) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * A fresh order of the project's section colors; the first paints the page (and hero). Like the
 * site's page transition, it reshuffles once if the order repeats the previous visit's.
 */
function sectionOrder(slug: string, colors: SectionColors[], keepFirst?: string) {
  const key = `${LAST_ORDER_KEY}:${slug}`;
  const pinned = colors.find((c) => c.color === keepFirst);
  const pick = () => (pinned ? [pinned, ...shuffle(colors.filter((c) => c !== pinned))] : shuffle(colors));
  const id = (order: SectionColors[]) => order.map((c) => c.color).join();

  let last: string | null = null;
  try {
    last = sessionStorage.getItem(key);
  } catch {}
  let order = pick();
  if (id(order) === last) order = pick();
  try {
    sessionStorage.setItem(key, id(order));
  } catch {}
  return order;
}

/**
 * Paints the whole page (body, header, every token-based component) in the project's brand color.
 *
 * - The <style> is server-rendered, so the first paint is already in the right colors.
 * - On client navigation the background tweens from the previous page's color; on leaving,
 *   it tweens back to the theme color.
 * - With `sectionColors`, each visit shuffles them: the first paints the page, the rest go one per
 *   [data-project-section] (overview, gallery). The server render uses `color` throughout.
 */
export default function ProjectColors({ project }: ProjectColorsProps) {
  const ref = useRef<HTMLStyleElement>(null);
  const palette = projectPalette(project);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const seamless = isSeamlessNavigation();
    // A hand-off arrives with the hero already painted in `color`, so it keeps that one.
    const [page, ...others] = project.sectionColors
      ? sectionOrder(project.slug, project.sectionColors, seamless ? project.color : undefined)
      : [project];
    const { '--color-bg': bg, ...rest } = projectPalette(page);

    for (const [name, value] of Object.entries(rest)) root.style.setProperty(name, value);
    if (seamless) gsap.set(root, { '--color-bg': bg, overwrite: true });
    else gsap.to(root, { '--color-bg': bg, duration: 1.4, ease: 'power2.inOut', overwrite: true });

    const sections = others.length
      ? [...(ref.current?.parentElement?.querySelectorAll<HTMLElement>('[data-project-section]') ?? [])]
      : [];
    const sectionTokens = sections.map((section, i) => {
      const colors = others[i % others.length];
      // The section's own color stands apart already, so the gallery skips its contrasting shade.
      const tokens = { ...projectPalette(colors), '--color-section': colors.color };
      for (const [name, value] of Object.entries(tokens)) section.style.setProperty(name, value);
      return Object.keys(tokens);
    });

    return () => {
      // Only the tokens: the gallery's pin keeps inline styles of its own on the section.
      sections.forEach((section, i) => {
        for (const name of sectionTokens[i]) section.style.removeProperty(name);
      });
      for (const name of Object.keys(rest)) root.style.removeProperty(name);
      // Find the theme's own background by briefly lifting the override, then ease back to it.
      const current = root.style.getPropertyValue('--color-bg');
      root.style.removeProperty('--color-bg');
      const themeBg = getComputedStyle(root).getPropertyValue('--color-bg').trim();
      root.style.setProperty('--color-bg', current);
      gsap.to(root, {
        '--color-bg': themeBg,
        duration: 0.7,
        ease: 'power2.inOut',
        overwrite: true,
        onComplete: () => root.style.removeProperty('--color-bg'),
      });
    };
  }, [project]);

  // Triple :root beats `:root[data-theme]` in globals.css regardless of stylesheet order.
  const css = `:root:root:root{${Object.entries(palette)
    .map(([name, value]) => `${name}:${value}`)
    .join(';')}}`;
  // data-project-colors lets the site chrome detect a brand-colored page (see Header.module.css).
  return (
    <style ref={ref} data-project-colors>
      {css}
    </style>
  );
}
