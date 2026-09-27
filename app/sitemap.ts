import type { MetadataRoute } from 'next';
import { locales, localizePath } from '@/lib/i18n/config';
import { projectSlugs } from '@/lib/projects';
import { absoluteUrl } from '@/lib/seo';

// Built once with the site (the content only changes on redeploy).
export const dynamic = 'force-static';

const pages: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.8, changeFrequency: 'yearly' },
  { path: '/work', priority: 0.9, changeFrequency: 'monthly' },
  ...projectSlugs.map((slug) => ({ path: `/work/${slug}`, priority: 0.7, changeFrequency: 'yearly' as const })),
];

/** /sitemap.xml — every page in every language, each pointing at its translations. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return pages.flatMap(({ path, priority, changeFrequency }) =>
    locales.map((locale) => ({
      url: absoluteUrl(localizePath(locale, path)),
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, absoluteUrl(localizePath(l, path))])),
      },
    })),
  );
}
