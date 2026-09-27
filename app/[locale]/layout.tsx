import type { Metadata, Viewport } from 'next';
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
import { siteUrl } from '@/lib/seo';
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

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Content changes only when the site is redeployed: build every page to static HTML once and serve
// it as-is (fastest for visitors, fully crawlable for search engines).
export const dynamic = 'force-static';
export const revalidate = false;

/** Site-wide metadata; each page adds its own canonical URL, alternates and share cards (see lib/seo). */
export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLocale());
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${site.name} — ${t.meta.title}`, template: `%s — ${site.name}` },
    description: t.meta.description,
    applicationName: site.name,
    authors: [{ name: site.name, url: siteUrl }],
    creator: site.name,
    publisher: site.name,
    keywords: t.meta.keywords,
    category: 'technology',
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
    },
    icons: {
      // app/favicon.ico is linked automatically by Next; these add the PNG sizes.
      icon: [
        { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: { url: '/icons/apple-touch-icon.png', sizes: '180x180' },
    },
    manifest: '/manifest.webmanifest',
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3f3f3' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0c0c' },
  ],
};

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
