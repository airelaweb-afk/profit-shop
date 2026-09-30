import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
mkdirSync(publicDir, { recursive: true });

const workerSrc = join(root, "node_modules/pdfjs-dist/build/pdf.worker.min.mjs");
if (!existsSync(workerSrc)) {
  console.error("Missing pdfjs-dist worker. Run npm install first.");
  process.exit(1);
}
copyFileSync(workerSrc, join(publicDir, "pdf.worker.min.mjs"));
copyFileSync(workerSrc, join(publicDir, "pdf.worker.min.js"));
console.log("Copied pdf.worker.min.mjs and pdf.worker.min.js to public/");

const tessWorker = join(root, "node_modules/tesseract.js/dist/worker.min.js");
const tessCore = join(
  root,
  "node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm.js",
);
if (existsSync(tessWorker) && existsSync(tessCore)) {
  mkdirSync(join(publicDir, "tesseract"), { recursive: true });
  mkdirSync(join(publicDir, "tesseract-core"), { recursive: true });
  copyFileSync(tessWorker, join(publicDir, "tesseract/worker.min.js"));
  copyFileSync(
    tessCore,
    join(publicDir, "tesseract-core/tesseract-core-simd-lstm.wasm.js"),
  );
  console.log("Copied Tesseract worker and SIMD LSTM core to public/");
}
