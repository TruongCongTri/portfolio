'use client';

import { createContext, use } from 'react';
import { localizePath, type Locale } from './config';
import type { Dictionary } from './dictionaries';

type I18nContextValue = { locale: Locale; t: Dictionary };

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ locale, t, children }: I18nContextValue & { children: React.ReactNode }) {
  return <I18nContext value={{ locale, t }}>{children}</I18nContext>;
}

/** Locale, dictionary and a path helper for Client Components. */
export function useI18n() {
  const context = use(I18nContext);
  if (!context) throw new Error('useI18n must be used inside <I18nProvider>');
  return { ...context, href: (path: string) => localizePath(context.locale, path) };
}
