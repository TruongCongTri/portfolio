'use client'; // Error boundaries must be Client Components

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Cormorant, Plus_Jakarta_Sans } from 'next/font/google';
import { guardTheme } from '@/lib/theme';
import { en } from '@/lib/i18n/dictionaries/en';
import { vi } from '@/lib/i18n/dictionaries/vi';
import ErrorScreen from '@/components/errors/ErrorScreen/ErrorScreen';
import PillButton from '@/components/ui/PillButton/PillButton';
import './globals.css';

const sans = Plus_Jakarta_Sans({ variable: '--font-sans', subsets: ['latin', 'vietnamese'], weight: ['400', '500'] });
const serif = Cormorant({ variable: '--font-serif', subsets: ['latin', 'vietnamese'], weight: ['300'] });

type GlobalErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

/**
 * Last-resort boundary for errors in the root layout itself. It replaces the whole document, so it
 * brings its own <html>/<body>, fonts and styles, and has no i18n provider: the language is taken
 * from the URL.
 */
export default function GlobalError({ error, retry }: GlobalErrorProps) {
  // No i18n provider here — read the locale segment from the URL.
  const locale = usePathname()?.startsWith('/vi') ? 'vi' : 'en';
  const t = (locale === 'vi' ? vi : en).error;

  useEffect(() => {
    console.error(error);
    // Apply the saved (or default) theme — the root layout's init script isn't rendered here.
    return guardTheme();
  }, [error]);

  return (
    <html lang={locale} className={`${sans.variable} ${serif.variable}`}>
      <body>
        <title>{t.title}</title>
        <ErrorScreen
          code="500"
          title={t.title}
          body={t.body}
          actions={
            <>
              <PillButton onClick={retry} variant="solid" arrow magnetic>
                {t.retry}
              </PillButton>
              {/* A full page load: the app shell itself failed, so don't rely on client routing. */}
              <PillButton onClick={() => window.location.assign(new URL(`/${locale}`, window.location.origin).href)} arrow>
                {t.home}
              </PillButton>
            </>
          }
          footnote={error.digest ? `${t.reference}: ${error.digest}` : undefined}
        />
      </body>
    </html>
  );
}
