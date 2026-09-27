import type { MetadataRoute } from 'next';
import { absoluteUrl, siteUrl } from '@/lib/seo';

export const dynamic = 'force-static';

/** /robots.txt — everything is public; points crawlers at the sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/'] },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: siteUrl,
  };
}
