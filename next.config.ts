import type { NextConfig } from "next";

const firebaseAuthProxy =
  "https://mindnow-mockup-maker-54797.firebaseapp.com/__/auth/:path*";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination: firebaseAuthProxy,
      },
    ];
  },
};

export default nextConfig;
