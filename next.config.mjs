<<<<<<< HEAD
/** @type {import("next").NextConfig} */
=======
/** @type {import('next').NextConfig} */
>>>>>>> 35e3a9e (Match the Hostinger deploy: webpack build and next.config.mjs.)
const nextConfig = {
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
