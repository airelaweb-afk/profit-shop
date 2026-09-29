import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Cloud Agent preview and local checks hit 127.0.0.1, not localhost.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  transpilePackages: ["heic-to"],
};

export default nextConfig;
