import type { Dictionary } from './i18n/dictionaries';

/**
 * Personal details — replace these placeholders with your own.
 * `portrait` should be a cut-out (transparent background) PNG/WebP in /public; roughly 9:8 works best.
 */
export const site = {
  name: 'Your Name',
  email: 'hello@example.com',
  phone: { display: '+00 000 000 000', href: 'tel:+00000000000' },
  portrait: '/portrait-placeholder.svg',
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
  { label: 'LinkedIn', href: '#' },
  { label: 'GitHub', href: '#' },
  { label: 'Instagram', href: '#' },
];
