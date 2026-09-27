import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Placeholder project screens; add your own image host here when real screenshots replace them.
    remotePatterns: [{ protocol: "https", hostname: "placehold.co", pathname: "/**" }],
    // Smallest first: browsers that accept AVIF get it, the rest get WebP.
    formats: ["image/avif", "image/webp"],
    // Required since Next 16: 75 is the default, 85 keeps the sharpened get-in-touch image crisp.
    qualities: [75, 85],
    // Content only changes on redeploy, so optimized images can be cached for a long time.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
