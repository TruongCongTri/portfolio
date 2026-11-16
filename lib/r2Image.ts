import type { StaticImageData } from 'next/image';

/**
 * Images are served from Cloudflare R2 (NEXT_PUBLIC_R2_PUBLIC_URL). Their sources live in
 * assets/images; `npm run images:upload` converts them to WebP, uploads them under content-hashed keys
 * and regenerates the manifests (lib/r2Images.json, plus lib/r2Images.private.json for private projects).
 */
export type R2Entry = { key: string; width: number; height: number; blurDataURL: string };

export const R2_PUBLIC_URL = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? '').replace(/\/+$/, '');

/**
 * An image from a manifest, shaped like a static import: next/image gets its size (no layout shift)
 * and a blur placeholder, and serves resized versions of the R2 original.
 */
export function fromManifest<M extends Record<string, R2Entry>>(manifest: M, id: keyof M & string): StaticImageData {
  const entry = manifest[id];
  if (!entry) throw new Error(`Image "${id}" is not in the R2 manifest — run \`npm run images:upload\`.`);
  return { src: `${R2_PUBLIC_URL}/${entry.key}`, width: entry.width, height: entry.height, blurDataURL: entry.blurDataURL };
}
