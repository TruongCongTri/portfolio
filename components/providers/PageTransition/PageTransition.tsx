'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useI18n } from '@/lib/i18n/client';
import { getProjects } from '@/lib/projects';
import { registerPageNavigator } from '@/lib/pageTransition';
import { haltScroll } from '@/lib/smoothScroll';
import { markCurtainNavigation } from '@/lib/transition';
import styles from './PageTransition.module.css';

/**
 * Page-to-page transition: a curtain wipes up over the page with the destination's name rising out
 * of a mask, the route changes underneath, then the curtain carries on upward to reveal the new
 * page and its own intro.
 *
 * Same-site link clicks are intercepted in the capture phase (Next's <Link> skips navigation when
 * the event is already default-prevented). Programmatic navigations can use `transitionTo`.
 * The next-project hand-off deliberately bypasses this: it's seamless by design.
 */
export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const { t, locale } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const covering = useRef(false);
  const pendingPath = useRef<string | null>(null);

  useEffect(() => {
    const curtain = ref.current!;
    const label = labelRef.current!;

    // Name shown on the curtain for a destination path.
    const labelFor = (path: string) => {
      const bare = path.replace(new RegExp(`^/${locale}`), '') || '/';
      if (bare === '/' || bare.startsWith('/#')) return t.nav.home;
      if (bare.startsWith('/about')) return t.nav.about;
      const slug = bare.match(/^\/work\/([^/?#]+)/)?.[1];
      if (slug) return getProjects(locale).find((p) => p.slug === slug)?.title ?? t.nav.work;
      if (bare.startsWith('/work')) return t.nav.work;
      return t.transition.loading;
    };

    const navigate = (href: string) => {
      if (covering.current) return;
      covering.current = true;
      pendingPath.current = new URL(href, window.location.href).pathname;
      label.textContent = labelFor(href);
      haltScroll();

      gsap
        .timeline({
          onComplete: () => {
            markCurtainNavigation();
            router.push(href);
          },
        })
        .set(curtain, { autoAlpha: 1, yPercent: 100 })
        .set(label, { yPercent: 110 })
        .to(curtain, { yPercent: 0, duration: 0.85, ease: 'expo.inOut' })
        .to(label, { yPercent: 0, duration: 0.7, ease: 'expo.out' }, '-=0.3');
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest('a');
      if (!anchor || !anchor.href) return;
      if ((anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return; // mailto:, tel:, external sites
      if (url.pathname === window.location.pathname) return; // same page (incl. #anchors): let it be
      e.preventDefault();
      navigate(url.pathname + url.search + url.hash);
    };

    registerPageNavigator(navigate);
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      registerPageNavigator(null);
    };
  }, [router, locale, t]);

  // Reveal once the destination route has rendered.
  useEffect(() => {
    if (!covering.current || pathname !== pendingPath.current) return;
    covering.current = false;
    pendingPath.current = null;
    gsap
      .timeline()
      .to(labelRef.current, { yPercent: -110, duration: 0.5, ease: 'expo.in' })
      .to(ref.current, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '-=0.15')
      .set(ref.current, { autoAlpha: 0 });
  }, [pathname]);

  return (
    <div ref={ref} className={styles.curtain} aria-hidden>
      <span className={styles.mask}>
        <span ref={labelRef} className={styles.label} />
      </span>
    </div>
  );
}
