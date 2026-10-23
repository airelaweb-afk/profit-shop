/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Keep the Next.js N badge off the phone dock during preview.
  devIndicators: false,
  transpilePackages: ["heic-to", "tesseract.js"],
  // Hostinger reports 63 CPUs but caps threads; one worker per CPU aborts the build.
  experimental: {
    cpus: 2,
    globalNotFound: true,
  },
};

export default nextConfig;
