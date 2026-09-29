import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dir = "out";
const required = [
  join(dir, "index.html"),
  join(dir, "pdf", "index.html"),
  join(dir, "pdf.worker.min.mjs"),
];

for (const file of required) {
  if (!existsSync(file)) {
    console.error(`Static export missing: expected ${file} after next build.`);
    process.exit(1);
  }
}

const entries = readdirSync(dir);
console.log(`Hostinger output ready: ${dir}/ (${entries.length} entries)`);
