'use client';

import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n/client';
import { LOCALE_COOKIE, localeLabels, locales, switchLocalePath, type Locale } from '@/lib/i18n/config';
import SegmentedControl from '@/components/ui/SegmentedControl/SegmentedControl';

const options = locales.map((value) => ({ value, label: localeLabels[value] }));

export default function LanguageSwitcher({ size }: { size?: 'sm' | 'md' }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();

  const change = (next: Locale) => {
    if (next === locale) return;
    // Remembered by proxy.ts when the user later visits a path without a locale.
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    // Full document load: the root layout (<html lang>, metadata, theme init script) belongs to the locale,
    // and a client-side swap would re-render the inline init <script>, which React rejects.
    window.location.assign(switchLocalePath(pathname, next) + window.location.hash);
  };

  return (
    <SegmentedControl
      options={options}
      value={locale}
      onChange={change}
      ariaLabel={t.preferences.language}
      size={size}
    />
  );
}
