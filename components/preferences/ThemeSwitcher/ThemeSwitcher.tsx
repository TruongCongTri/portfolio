'use client';

import { useSyncExternalStore } from 'react';
import { useI18n } from '@/lib/i18n/client';
import { getTheme, setTheme, subscribeTheme, type Theme } from '@/lib/theme';
import SegmentedControl from '@/components/ui/SegmentedControl/SegmentedControl';

const SunIcon = (
  <svg viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
  </svg>
);

const MoonIcon = (
  <svg viewBox="0 0 24 24" aria-hidden>
    <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
  </svg>
);

/** Cross-fades the whole page between themes where the View Transitions API exists. */
function changeTheme(theme: Theme) {
  if (document.startViewTransition) document.startViewTransition(() => setTheme(theme));
  else setTheme(theme);
}

export default function ThemeSwitcher({ size }: { size?: 'sm' | 'md' }) {
  const { t } = useI18n();
  // The theme is only known in the browser (set by the init script), so the server renders no selection.
  const theme = useSyncExternalStore<Theme | null>(subscribeTheme, getTheme, () => null);

  return (
    <SegmentedControl
      options={[
        { value: 'light', label: SunIcon, ariaLabel: t.preferences.light },
        { value: 'dark', label: MoonIcon, ariaLabel: t.preferences.dark },
      ]}
      value={theme}
      onChange={changeTheme}
      ariaLabel={t.preferences.theme}
      size={size}
    />
  );
}
