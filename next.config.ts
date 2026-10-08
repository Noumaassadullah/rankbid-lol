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
      // Legacy paid-bidding pages: listings now live at /product/:id and
      // submissions go through the free form on the homepage.
      {
        source: "/listing/:id",
        destination: "/product/:id",
        permanent: true,
      },
      {
        source: "/dashboard",
        destination: "/profile",
        permanent: false,
      },
      {
        source: "/claim",
        destination: "/#submit",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
