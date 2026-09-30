import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules/pdfjs-dist/build/pdf.worker.min.mjs");
const destDir = join(root, "public");
const destMjs = join(destDir, "pdf.worker.min.mjs");
const destJs = join(destDir, "pdf.worker.min.js");

if (!existsSync(src)) {
  console.error("Missing pdfjs-dist worker. Run npm install first.");
  process.exit(1);
}

mkdirSync(destDir, { recursive: true });
copyFileSync(src, destMjs);
copyFileSync(src, destJs);
console.log("Copied pdf.worker.min.mjs and pdf.worker.min.js to public/");
