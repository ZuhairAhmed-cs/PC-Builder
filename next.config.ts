import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eu-images.contentstack.com",
        pathname: "/v3/assets/**",
      },
      {
        protocol: "https",
        hostname: "images.contentstack.com",
        pathname: "/v3/assets/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "max-age=0, s-maxage=86400, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
