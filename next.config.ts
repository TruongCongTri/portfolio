import type { NextConfig } from "next";

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
    // Placeholder project screens; add your own image host here when real screenshots replace them.
    remotePatterns: [{ protocol: "https", hostname: "placehold.co", pathname: "/**" }],
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
