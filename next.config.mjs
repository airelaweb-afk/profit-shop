import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const ortWasm = join(root, "node_modules/onnxruntime-web/dist/ort.wasm.min.js");

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
  // The package "main" is the Node build. Phones need the wasm bundle, one thread.
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "onnxruntime-web": ortWasm,
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      "onnxruntime-web": "./node_modules/onnxruntime-web/dist/ort.wasm.min.js",
    },
  },
};

export default nextConfig;
