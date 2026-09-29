import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Keep the Next.js N badge off the phone dock during preview.
  devIndicators: false,
  transpilePackages: ["heic-to"],
};

export default nextConfig;
