import type { NextConfig } from "next";
import path from "path";
const nextConfig: NextConfig = {
  webpack: (config) => {
    // Don't replace the entire resolve object
    if (!config.resolve) config.resolve = {};
    if (!config.resolve.alias) config.resolve.alias = {};
    config.resolve.alias["@"] = path.resolve(__dirname);
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.aceternity.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "originui.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "passport-2.s3.ap-southeast-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    turbo: {
      resolveAlias: {
        "@": path.resolve(__dirname),
      },
    },
  },
  reactStrictMode: true,
  env: {
    BASE_URL: process.env.BASE_URL,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "img-src 'self' data: https://*.googleusercontent.com https://docs.google.com https://passport-2.s3.ap-southeast-1.amazonaws.com; " +
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
              "style-src 'self' 'unsafe-inline'; " +
              "font-src 'self'; " +
              "object-src 'none'; " +
              "frame-ancestors 'none'; " +
              "connect-src 'self' https://passport-2.s3.ap-southeast-1.amazonaws.com; ",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
