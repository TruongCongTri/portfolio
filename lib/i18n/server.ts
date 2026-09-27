import { locale as localeParam } from 'next/root-params';
import { notFound } from 'next/navigation';
import { hasLocale } from './config';
import { getDictionary } from './dictionaries';

/** Current locale from the `[locale]` root segment. Server Components only. */
export async function getLocale() {
  const locale = await localeParam();
  if (!hasLocale(locale)) notFound();
  return locale;
}

/** Dictionary for the current request's locale. Server Components only. */
export async function getT() {
  return getDictionary(await getLocale());
}
