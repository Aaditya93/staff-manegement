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
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            // Allow images from self, data URIs, and the specified Google domains.
            // Adjust other directives (like script-src, style-src) as needed for your app.
            // Start with a basic policy and add directives as required.
            // Using 'unsafe-inline' for styles might be necessary depending on your UI libraries, but try to avoid it if possible.
            value:
              "default-src 'self'; img-src 'self' data: https://*.googleusercontent.com https://docs.google.com; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; object-src 'none'; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
