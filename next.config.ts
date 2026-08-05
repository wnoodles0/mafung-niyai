import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination: "https://my-auth-app-107d1.firebaseapp.com/__/auth/:path*",
      },
    ];
  },
};

export default nextConfig;
