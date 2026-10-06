'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { useI18n } from '@/lib/i18n/client';
import { navLinks, socialLinks } from '@/lib/site';
import ContactTrigger from '@/components/contact/ContactTrigger/ContactTrigger';
import LanguageSwitcher from '@/components/preferences/LanguageSwitcher/LanguageSwitcher';
import ThemeSwitcher from '@/components/preferences/ThemeSwitcher/ThemeSwitcher';
import styles from './SidePanel.module.css';

type SidePanelProps = {
  open: boolean;
  onClose: () => void;
};

export default function SidePanel({ open, onClose }: SidePanelProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline>(null);
  const { t, href } = useI18n();
  const pathname = usePathname();

  // Home only on an exact match; sections also own their sub-pages (/work covers /work/[slug]).
  const isActive = (path: string) => {
    if (path.includes('#')) return false;
    const target = href(path);
    return path === '/' ? pathname === target : pathname === target || pathname.startsWith(`${target}/`);
  };

  useGSAP(
    () => {
      gsap.set(`.${styles.panel}`, { xPercent: 100 });
      timeline.current = gsap
        .timeline({ paused: true, defaults: { ease: 'expo.out' } })
        .to(`.${styles.overlay}`, { autoAlpha: 1, duration: 0.4 })
        .to(`.${styles.panel}`, { xPercent: 0, visibility: 'visible', duration: 0.6 }, '<')
        .from(`.${styles.navLink}`, { x: 40, autoAlpha: 0, stagger: 0.05, duration: 0.5 }, '-=0.4')
        .from(`.${styles.footer} > *`, { y: 20, autoAlpha: 0, stagger: 0.08, duration: 0.5 }, '<0.15');
    },
    { scope: rootRef },
  );

  useGSAP(
    () => {
      if (open) timeline.current?.play();
      else timeline.current?.reverse();
    },
    { dependencies: [open] },
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <div ref={rootRef}>
      <div className={styles.overlay} onClick={onClose} />
      <aside className={styles.panel} aria-hidden={!open} data-chrome="panel">
        <nav className={styles.nav}>
          {navLinks.map((link) =>
            link.action === 'contact' ? (
              <ContactTrigger key={link.key} pill={false} className={styles.navLink} onBeforeOpen={onClose}>
                <span className={styles.dot} aria-hidden />
                {t.nav[link.key]}
              </ContactTrigger>
            ) : (
            <Link
              key={link.key}
              href={href(link.path)}
              className={`${styles.navLink} ${isActive(link.path) ? styles.active : ''}`}
              aria-current={isActive(link.path) ? 'page' : undefined}
              // onClick, not onNavigate: the page-transition curtain intercepts link navigation.
              onClick={onClose}
            >
              <span className={styles.dot} aria-hidden />
              {t.nav[link.key]}
            </Link>
            ),
          )}
        </nav>

        <div className={styles.footer}>
          <div className={styles.socials} aria-label={t.menu.socials}>
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} className={styles.social}>
                {link.label}
              </a>
            ))}
          </div>
          <div className={styles.preferences} aria-label={t.menu.preferences}>
            <LanguageSwitcher size="sm" />
            <ThemeSwitcher size="sm" />
          </div>
        </div>
      </aside>
    </div>
  );
}
