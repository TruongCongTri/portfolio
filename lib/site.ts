import type { Dictionary } from './i18n/dictionaries';
import portrait from '../public/portrait.webp';

/**
 * Personal details.
 * `portrait` is a cut-out (transparent background) image, generated from public/portrait.png by
 * `npm run images`. Imported statically: Next reads its size and serves it under a hashed URL that
 * can be cached forever.
 */
export const site = {
  name: 'Trương Công Trí',
  email: 'tri.tcong@gmail.com',
  phone: { display: '+84 933 048 894', href: 'tel:+84933048894' },
  portrait,
};

/**
 * Unlocalized paths; prefix with the locale via `localizePath` / `useI18n().href`.
 * `action: 'contact'` entries open the contact panel instead of navigating.
 */
export const navLinks: { key: keyof Dictionary['nav']; path: string; action?: 'contact' }[] = [
  { key: 'home', path: '/' },
  { key: 'about', path: '/about' },
  { key: 'work', path: '/work' },
  { key: 'contact', path: '/#contact', action: 'contact' },
];

export const socialLinks = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/trí-trương-công-35b174406' },
  { label: 'GitHub', href: 'https://github.com/TruongCongTri' },
  { label: 'Instagram', href: '#' },
];

/**
 * Link attributes for a social profile: real web addresses open in a new tab (`noopener` keeps the other
 * site from reaching back into this one). A placeholder like "#" stays a normal in-page link, so it doesn't
 * open a pointless second copy of this page.
 */
export const socialLinkProps = (href: string) =>
  href.startsWith('http') ? ({ target: '_blank', rel: 'noopener noreferrer' } as const) : ({} as const);
