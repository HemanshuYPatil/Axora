import type { NextConfig } from "next";

const getHostFromUrl = (url?: string) => {
  if (!url) {
    return null;
  }

  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
};

const convexHosts = Array.from(
  new Set(
    [
      getHostFromUrl(process.env.NEXT_PUBLIC_CONVEX_URL),
      getHostFromUrl(process.env.NEXT_PUBLIC_CONVEX_SITE_URL),
    ].filter((host): host is string => Boolean(host))
  )
);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      ...convexHosts.map((host) => ({
        protocol: "https" as const,
        hostname: host,
        pathname: "/api/storage/**",
      })),
    ],
  },
};

export default nextConfig;
