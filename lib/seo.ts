import type { Metadata } from 'next';
import { locales, localizePath, type Locale } from './i18n/config';
import type { Dictionary } from './i18n/dictionaries';
import { imageUrl, type Project } from './projects';
import { site, socialLinks } from './site';

/**
 * Canonical origin for absolute URLs (canonical links, sitemap, Open Graph, JSON-LD).
 * Set NEXT_PUBLIC_SITE_URL in production; on Vercel the production domain is picked up automatically.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')
).replace(/\/$/, '');

export const absoluteUrl = (path: string) => `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;

const ogLocale: Record<Locale, string> = { en: 'en_US', vi: 'vi_VN' };

export const defaultShareImage = {
  url: '/og-image.jpg',
  width: 1200,
  height: 630,
  alt: site.name,
};

type PageMetadataOptions = {
  locale: Locale;
  /** Unlocalized path, e.g. '/', '/about', '/work/slug'. */
  path: string;
  /** Page title (the layout's template adds " — {name}"); omit for the home page. */
  title?: string;
  /** Full title for share cards, when it differs from `title + — name`. */
  shareTitle: string;
  description: string;
  images?: { url: string; width?: number; height?: number; alt?: string }[];
  type?: 'website' | 'article' | 'profile';
};

/**
 * Per-page metadata: canonical URL, hreflang alternates for every locale, and complete Open Graph /
 * Twitter cards (Next replaces nested objects rather than merging them, so pages send them in full).
 */
export function pageMetadata({ locale, path, title, shareTitle, description, images, type = 'website' }: PageMetadataOptions): Metadata {
  const shareImages = images ?? [defaultShareImage];
  return {
    ...(title ? { title } : {}),
    description,
    alternates: {
      canonical: localizePath(locale, path),
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, localizePath(l, path)])),
        'x-default': localizePath('en', path),
      },
    },
    openGraph: {
      type,
      url: localizePath(locale, path),
      siteName: site.name,
      title: shareTitle,
      description,
      locale: ogLocale[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocale[l]),
      images: shareImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description,
      images: shareImages.map((image) => image.url),
    },
  };
}

/* ---------- JSON-LD (schema.org) ---------- */

/** Serialises structured data for a <script type="application/ld+json">, escaping `<` against XSS. */
export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

const personId = () => `${siteUrl}/#person`;

export function personSchema(locale: Locale, t: Dictionary) {
  return {
    '@type': 'Person',
    '@id': personId(),
    name: site.name,
    url: absoluteUrl(localizePath(locale, '/')),
    image: absoluteUrl('/icons/icon-512.png'),
    email: `mailto:${site.email}`,
    telephone: site.phone.display,
    jobTitle: t.meta.title,
    description: t.about.lead,
    knowsLanguage: ['vi', 'en'],
    knowsAbout: t.meta.keywords,
    sameAs: socialLinks.map((l) => l.href).filter((href) => href.startsWith('http')),
  };
}

export function websiteSchema(locale: Locale, t: Dictionary) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: absoluteUrl(localizePath(locale, '/')),
        name: site.name,
        description: t.meta.description,
        inLanguage: locale,
        author: { '@id': personId() },
      },
      personSchema(locale, t),
    ],
  };
}

export function profilePageSchema(locale: Locale, t: Dictionary) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: absoluteUrl(localizePath(locale, '/about')),
    inLanguage: locale,
    mainEntity: personSchema(locale, t),
  };
}

export function workCollectionSchema(locale: Locale, t: Dictionary, projects: Project[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    url: absoluteUrl(localizePath(locale, '/work')),
    name: t.work.title,
    description: t.meta.workDescription,
    inLanguage: locale,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: projects.map((project, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: absoluteUrl(localizePath(locale, `/work/${project.slug}`)),
        name: project.title,
      })),
    },
  };
}

export function projectSchema(locale: Locale, t: Dictionary, project: Project) {
  const url = absoluteUrl(localizePath(locale, `/work/${project.slug}`));
  const cover = imageUrl(project.images[0]);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CreativeWork',
        '@id': `${url}#project`,
        url,
        name: project.title,
        headline: project.title,
        description: project.overview,
        abstract: [...project.challenge, ...project.approach].join(' '),
        image: cover.startsWith('http') ? cover : absoluteUrl(cover),
        dateCreated: project.year,
        genre: t.work.categories[project.category],
        inLanguage: locale,
        creator: { '@id': personId() },
        ...(project.url ? { sameAs: project.url } : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t.nav.home, item: absoluteUrl(localizePath(locale, '/')) },
          { '@type': 'ListItem', position: 2, name: t.nav.work, item: absoluteUrl(localizePath(locale, '/work')) },
          { '@type': 'ListItem', position: 3, name: project.title, item: url },
        ],
      },
    ],
  };
}
