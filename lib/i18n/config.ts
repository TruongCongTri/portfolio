export const locales = ['en', 'vi'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export const localeLabels: Record<Locale, string> = { en: 'EN', vi: 'VI' };

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Prefixes an app path with the locale: ('vi', '/work') → '/vi/work', ('en', '/#contact') → '/en#contact'. */
export function localizePath(locale: Locale, path: string) {
  if (path === '/') return `/${locale}`;
  if (path.startsWith('/#')) return `/${locale}${path.slice(1)}`;
  return `/${locale}${path}`;
}

/** Swaps the locale segment of an already-localized pathname. */
export function switchLocalePath(pathname: string, locale: Locale) {
  const [, , ...rest] = pathname.split('/');
  return localizePath(locale, `/${rest.join('/')}`);
}
