import type { NextConfig } from "next";

// Site images are served from Cloudflare R2 (see scripts/upload-images.mjs).
const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
if (!r2PublicUrl) throw new Error("NEXT_PUBLIC_R2_PUBLIC_URL is not set: images are served from Cloudflare R2.");
const r2 = new URL(r2PublicUrl);

const nextConfig: NextConfig = {
  // Files in /public have no hash in their URL, so Next leaves them uncached: give the ones that rarely change a
  // week in the browser (and a day of stale-while-revalidate), so repeat visits don't re-download them.
  async headers() {
    const cache = [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }];
    return [
      { source: "/icons/:path*", headers: cache },
      { source: "/:file(.*\\.(?:jpg|jpeg|png|webp|avif|svg|ico|woff2))", headers: cache },
    ];
  },

  images: {
    remotePatterns: [
      // Site images and project screenshots (content-hashed WebP under images/).
      { protocol: r2.protocol.replace(":", "") as "https", hostname: r2.hostname, pathname: "/images/**" },
      // Placeholder project screens.
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
    ],
    // WebP only: nearly as small as AVIF, but far quicker to encode on a first request (AVIF can take
    // seconds per image) and to decode, which is what keeps the first load snappy.
    formats: ["image/webp"],
    // Required since Next 16: 75 is the default, 85 keeps the sharpened get-in-touch image crisp.
    qualities: [75, 85],
    // Content only changes on redeploy, so optimized images can be cached for a long time.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
