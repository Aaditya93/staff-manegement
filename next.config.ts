import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
