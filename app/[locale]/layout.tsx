import type { Metadata } from 'next';
import { Cormorant, Plus_Jakarta_Sans } from 'next/font/google';
import SiteChrome from '@/components/layout/SiteChrome/SiteChrome';
import ThemeGuard from '@/components/preferences/ThemeGuard/ThemeGuard';
import SmoothScroll from '@/components/providers/SmoothScroll/SmoothScroll';
import PageTransition from '@/components/providers/PageTransition/PageTransition';
import { ContactProvider } from '@/components/contact/ContactProvider/ContactProvider';
import { locales } from '@/lib/i18n/config';
import { I18nProvider } from '@/lib/i18n/client';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/server';
import { themeInitScript } from '@/lib/theme';
import { site } from '@/lib/site';
import '../globals.css';

const sans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
});

// High-contrast display serif for the marquee, statements and the logo name.
const serif = Cormorant({
  variable: '--font-serif',
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
});

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLocale());
  return {
    title: { default: site.name, template: `%s — ${site.name}` },
    description: t.meta.description,
  };
}

export default async function RootLayout({ children }: LayoutProps<'/[locale]'>) {
  const locale = await getLocale();

  return (
    // data-theme / color-scheme are set by the init script before hydration
    <html lang={locale} className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        {/* Plain inline script (not next/script) so it runs during parsing, before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeGuard />
        <SmoothScroll />
        <I18nProvider locale={locale} t={getDictionary(locale)}>
          <ContactProvider>
            <SiteChrome />
            {children}
            <PageTransition />
          </ContactProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
