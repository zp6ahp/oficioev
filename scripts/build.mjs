/**
 * build.mjs — copies the files that actually ship into dist/.
 * The site itself needs no build step; this only keeps the deploy folder clean
 * (no node_modules, tests, README or local previews).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

const files = [
  "index.html",
  "404.html",
  "faq.html",
  "condiciones.html",
  "styles.css",
  "favicon.svg",
  "robots.txt",
  "sitemap.xml",
  "_headers"
];
const dirs = ["assets", "js"];

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(dist, file));
}
for (const dir of dirs) {
  fs.cpSync(path.join(root, dir), path.join(dist, dir), { recursive: true });
}

console.log(`Built ${path.relative(root, dist)}/ — ${files.length} files + ${dirs.length} folders`);
