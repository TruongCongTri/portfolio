import type { Locale } from '../config';
import { en, type Dictionary } from './en';
import { vi } from './vi';

export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { en, vi };

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
