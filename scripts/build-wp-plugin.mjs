// Packages wordpress-plugin/luna-oficio-webp into public/downloads/luna-oficio-webp.zip
// so the static export can serve it. Runs before `next dev` and `next build`.
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { zipSync } from "fflate";

const SOURCE = join("wordpress-plugin", "luna-oficio-webp");
const OUT_DIR = join("public", "downloads");
const OUT_FILE = join(OUT_DIR, "luna-oficio-webp.zip");

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

const files = walk(SOURCE);
if (files.length === 0) {
  console.error(`No plugin files found in ${SOURCE}.`);
  process.exit(1);
}

const entries = {};
for (const file of files) {
  const inZip = ["luna-oficio-webp", ...relative(SOURCE, file).split(sep)].join("/");
  entries[inZip] = [new Uint8Array(readFileSync(file)), { level: 9, mtime: new Date("2026-09-30T00:00:00Z") }];
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, zipSync(entries));
console.log(`WordPress plugin packaged: ${OUT_FILE} (${files.length} files)`);
