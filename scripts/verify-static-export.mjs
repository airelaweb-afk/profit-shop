import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dir = "out";
const index = join(dir, "index.html");

if (!existsSync(index)) {
  console.error(
    "Static export missing: expected out/index.html after next build.",
  );
  process.exit(1);
}

const entries = readdirSync(dir);
console.log(`Hostinger output ready: ${dir}/ (${entries.length} entries)`);
