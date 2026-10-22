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
const tessCoreDir = join(root, "node_modules/tesseract.js-core");
const tessCores = [
  "tesseract-core-simd-lstm.wasm.js",
  "tesseract-core-lstm.wasm.js",
  "tesseract-core-relaxedsimd-lstm.wasm.js",
];
if (existsSync(tessWorker) && existsSync(join(tessCoreDir, tessCores[0]))) {
  mkdirSync(join(publicDir, "tesseract"), { recursive: true });
  mkdirSync(join(publicDir, "tesseract-core"), { recursive: true });
  copyFileSync(tessWorker, join(publicDir, "tesseract/worker.min.js"));
  for (const name of tessCores) {
    const from = join(tessCoreDir, name);
    if (existsSync(from)) copyFileSync(from, join(publicDir, "tesseract-core", name));
  }
  console.log("Copied Tesseract worker and LSTM cores to public/");
}
