import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "rankbid-lol.vercel.app",
          },
        ],
        destination: "https://www.rankbid.click/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
