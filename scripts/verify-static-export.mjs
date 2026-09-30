import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dir = "out";
const required = [
  join(dir, "index.html"),
  join(dir, "pdf", "index.html"),
  join(dir, "unir-pdf", "index.html"),
  join(dir, "rotar-pdf", "index.html"),
  join(dir, "marca-de-agua-pdf", "index.html"),
  join(dir, "eliminar-paginas-pdf", "index.html"),
  join(dir, "webp-en-lote", "index.html"),
  join(dir, "plugin-wordpress-webp", "index.html"),
  join(dir, "downloads", "luna-oficio-webp.zip"),
  join(dir, "blog", "index.html"),
  join(dir, "blog", "unir-varios-pdf-en-uno", "index.html"),
  join(dir, "faq", "index.html"),
  join(dir, "precios", "index.html"),
  join(dir, "comparar", "index.html"),
  join(dir, "alternativa-a-ilovepdf", "index.html"),
  join(dir, "alternativa-a-iloveimg", "index.html"),
  join(dir, "juntar-pdf", "index.html"),
  join(dir, "admin", "index.html"),
  join(dir, "cuenta", "index.html"),
  join(dir, "aviso-legal", "index.html"),
  join(dir, "privacidad", "index.html"),
  join(dir, "cookies", "index.html"),
  join(dir, "sitemap.xml"),
  join(dir, "robots.txt"),
  join(dir, "pdf.worker.min.mjs"),
  join(dir, "favicon.svg"),
  join(dir, "brand", "wordmark.jpg"),
];

for (const file of required) {
  if (!existsSync(file)) {
    console.error(`Static export missing: expected ${file} after next build.`);
    process.exit(1);
  }
}

const entries = readdirSync(dir);
console.log(`Hostinger output ready: ${dir}/ (${entries.length} entries)`);
