import Link from 'next/link';
import { localizePath } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/server';
import { navLinks, site, socialLinkProps, socialLinks } from '@/lib/site';
import LogoMark from '@/components/ui/LogoMark/LogoMark';
import ContactTrigger from '@/components/contact/ContactTrigger/ContactTrigger';
import FooterWordmark from './FooterWordmark';
import styles from './Footer.module.css';

export default async function Footer() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <footer id="contact" className={styles.footer}>
      <div className={styles.top}>
        <Link href={localizePath(locale, '/')} className={styles.logo}>
          <LogoMark size={32} />
          {site.name}
        </Link>

        <div className={styles.columns}>
          <div className={styles.column}>
            <span className={styles.label}>{t.footer.menu}</span>
            {navLinks
              .filter((link) => link.path !== '/')
              .map((link) =>
                link.action === 'contact' ? (
                  <ContactTrigger key={link.key} className={styles.link} pill={false}>
                    {t.nav[link.key]}
                  </ContactTrigger>
                ) : (
                  <Link key={link.key} href={localizePath(locale, link.path)} className={styles.link}>
                    {t.nav[link.key]}
                  </Link>
                ),
              )}
          </div>
          <div className={styles.column}>
            <span className={styles.label}>{t.footer.social}</span>
            {socialLinks.map((link) => (
              <Link key={link.label} href={link.href} className={styles.link} {...socialLinkProps(link.href)}>
                {link.label}
              </Link>
            ))}
          </div>
          <div className={styles.column}>
            <span className={styles.label}>{t.footer.contact}</span>
            <Link href={`mailto:${site.email}`} className={styles.link}>
              {site.email}
            </Link>
            <span className={`${styles.label} ${styles.subLabel}`}>{t.footer.phone}</span>
            <Link href={site.phone.href} className={styles.link}>
              {site.phone.display}
            </Link>
          </div>
        </div>
      </div>

      <FooterWordmark text={site.name} />
    </footer>
  );
}
