'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { useI18n } from '@/lib/i18n/client';
import { navLinks, site, socialLinks } from '@/lib/site';
import LogoMark from '@/components/ui/LogoMark/LogoMark';
import ContactTrigger from '@/components/contact/ContactTrigger/ContactTrigger';
import LanguageSwitcher from '@/components/preferences/LanguageSwitcher/LanguageSwitcher';
import ThemeSwitcher from '@/components/preferences/ThemeSwitcher/ThemeSwitcher';
import styles from './Header.module.css';

/** Wraps an item so its content can rise from under a mask. */
function Masked({ children }: { children: React.ReactNode }) {
  return (
    <span className={styles.mask}>
      <span className={styles.inner}>{children}</span>
    </span>
  );
}

export default function Header({ hidden }: { hidden: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { t, href } = useI18n();

  // Intro: every item rises out of its mask, column by column.
  useGSAP(
    () => {
      gsap.from(`.${styles.inner}`, {
        yPercent: 110,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.04,
        delay: 0.15,
      });
    },
    { scope: ref },
  );

  useGSAP(
    () => {
      gsap.to(ref.current, {
        yPercent: hidden ? -100 : 0,
        autoAlpha: hidden ? 0 : 1,
        duration: 0.6,
        ease: 'expo.out',
      });
    },
    { dependencies: [hidden] },
  );

  return (
    <header ref={ref} className={styles.header} data-chrome="header">
      <Link href={href('/')} className={styles.logo}>
        <Masked>
          <LogoMark />
        </Masked>
        <Masked>{site.name}</Masked>
      </Link>

      <div className={styles.columns}>
        <div className={styles.column}>
          <Masked>© {new Date().getFullYear()}</Masked>
        </div>
        <nav className={styles.column}>
          {navLinks
            .filter((link) => link.path !== '/')
            .map((link) =>
              link.action === 'contact' ? (
                <ContactTrigger key={link.key} className={styles.link}>
                  <Masked>{t.nav[link.key]}</Masked>
                </ContactTrigger>
              ) : (
                <Link key={link.key} href={href(link.path)} className={styles.link}>
                  <Masked>{t.nav[link.key]}</Masked>
                </Link>
              ),
            )}
        </nav>
        <div className={styles.column}>
          {socialLinks.map((link) => (
            <a key={link.label} href={link.href} className={styles.link}>
              <Masked>{link.label}</Masked>
            </a>
          ))}
        </div>
        <div className={`${styles.column} ${styles.preferences}`}>
          <Masked>
            <LanguageSwitcher size="sm" />
          </Masked>
          <Masked>
            <ThemeSwitcher size="sm" />
          </Masked>
        </div>
      </div>

      {/* Below the desktop breakpoint the columns are hidden; keep the switchers reachable. */}
      <div className={`${styles.row} ${styles.compactPreferences}`}>
        <LanguageSwitcher size="sm" />
        <ThemeSwitcher size="sm" />
      </div>
    </header>
  );
}
