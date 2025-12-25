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
};

export default nextConfig;
