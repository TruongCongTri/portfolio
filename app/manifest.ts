import type { MetadataRoute } from 'next';
import { en } from '@/lib/i18n/dictionaries/en';
import { site } from '@/lib/site';

export const dynamic = 'force-static';

/** /manifest.webmanifest — install metadata and the pixel-portrait icons. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${en.meta.title}`,
    short_name: site.name,
    description: en.meta.description,
    start_url: '/en',
    display: 'standalone',
    background_color: '#f3f3f3',
    theme_color: '#1a1a1a',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      // Round icons with transparent corners: not declared "maskable" (launchers would crop the circle).
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
