import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/work/snod",
        destination: "/work/snode",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
