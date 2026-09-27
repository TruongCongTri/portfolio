'use client';

import { useLayoutEffect } from 'react';
import { gsap } from '@/lib/gsap';
import { projectPalette, type Project } from '@/lib/projects';
import { isSeamlessNavigation } from '@/lib/transition';

/**
 * Paints the whole page (body, header, every token-based component) in the project's brand color.
 *
 * - The <style> is server-rendered, so the first paint is already in the right colors.
 * - On client navigation the background tweens from the previous page's color; on leaving,
 *   it tweens back to the theme color.
 */
export default function ProjectColors({ project }: { project: Pick<Project, 'color' | 'tone'> }) {
  const palette = projectPalette(project);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const { '--color-bg': bg, ...rest } = projectPalette(project);

    for (const [name, value] of Object.entries(rest)) root.style.setProperty(name, value);
    if (isSeamlessNavigation()) gsap.set(root, { '--color-bg': bg, overwrite: true });
    else gsap.to(root, { '--color-bg': bg, duration: 1.4, ease: 'power2.inOut', overwrite: true });

    return () => {
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
  return <style data-project-colors>{css}</style>;
}
