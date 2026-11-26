/**
 * Consistency checks for the static site.
 * Run with: npm test
 *
 * Catches the classic drift: a translation key that exists in one language
 * but not another, a key used in HTML but missing from the dictionaries,
 * a theme without its CSS blocks, or generated controls hardcoded again.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import es from "../js/locales/es.js";
import en from "../js/locales/en.js";
import pt from "../js/locales/pt.js";
import ru from "../js/locales/ru.js";
import de from "../js/locales/de.js";

import { THEMES, LANGUAGE_CODES, THEME_IDS } from "../js/config.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const DICT = { es, en, pt, ru, de };
const errors = [];

const fail = (message) => errors.push(message);

/* 1. Every configured language has a dictionary, and no extras. */
for (const code of LANGUAGE_CODES) {
  if (!DICT[code]) fail(`missing locale file for "${code}"`);
}
for (const code of Object.keys(DICT)) {
  if (!LANGUAGE_CODES.includes(code)) fail(`locale "${code}" is not listed in config.js`);
}

/* 2. All dictionaries share the same key set. */
const base = Object.keys(DICT[LANGUAGE_CODES[0]]).sort();
for (const code of Object.keys(DICT)) {
  const keys = Object.keys(DICT[code]).sort();
  keys
    .filter((key) => !base.includes(key))
    .forEach((key) => fail(`${code}: unexpected key "${key}"`));
  base.filter((key) => !keys.includes(key)).forEach((key) => fail(`${code}: missing key "${key}"`));
}

/* 3. Every key referenced by the markup exists in every dictionary. */
const html = read("index.html");
const pages = fs
  .readdirSync(root)
  .filter((file) => file.endsWith(".html"))
  .map(read)
  .join("\n");
const used = new Set();
for (const match of pages.matchAll(/data-i18n(?:-aria)?="([^"]+)"/g)) used.add(match[1]);

for (const key of used) {
  for (const code of Object.keys(DICT)) {
    if (!(key in DICT[code]))
      fail(`${code}: markup uses "${key}" but the dictionary has no such key`);
  }
}

/* 4. Theme labels for generated swatches exist everywhere. */
for (const id of THEME_IDS) {
  const key = "ui.theme." + id;
  for (const code of Object.keys(DICT)) {
    if (!(key in DICT[code])) fail(`${code}: missing theme label "${key}"`);
  }
}

/* 5. No dead keys (meta.* and ui.* are applied by code, not by markup). */
const appliedByCode = /^(meta\.|ui\.)|^works\.waPrefix$/;
for (const key of base) {
  if (!used.has(key) && !appliedByCode.test(key) && key !== "contact.copied") {
    fail(`unused dictionary key "${key}"`);
  }
}

/* 6. Every theme has light and dark colour blocks. */
const css = read("styles.css");
for (const theme of THEMES) {
  for (const mode of ["light", "dark"]) {
    if (!css.includes(`[data-theme="${theme.id}"][data-mode="${mode}"]`)) {
      fail(`styles.css: missing block [data-theme="${theme.id}"][data-mode="${mode}"]`);
    }
  }
}

/* 7. Controls stay generated: no hardcoded options or swatches. */
if (/<option/i.test(html))
  fail("index.html still has hardcoded <option> elements (they are generated)");
if (/data-theme-set=/.test(html))
  fail("index.html still has hardcoded theme swatches (they are generated)");

/* 8. Boot defaults are valid and both modes are present. */
const bootTheme = (html.match(/data-theme="([a-z]+)"/) || [])[1];
if (!THEME_IDS.includes(bootTheme))
  fail(`<html data-theme="${bootTheme}"> is not a configured theme`);

const bootMode = (html.match(/data-mode="([a-z]+)"/) || [])[1];
if (!["light", "dark"].includes(bootMode))
  fail(`<html data-mode="${bootMode}"> is not a valid mode`);

for (const mode of ["light", "dark"]) {
  if (!html.includes(`data-mode-set="${mode}"`)) fail(`index.html: missing mode control "${mode}"`);
}

/* Report */
if (errors.length) {
  console.error(`✖ ${errors.length} problem(s)`);
  errors.forEach((error) => console.error(`  - ${error}`));
  process.exit(1);
}

console.log(`✔ ${Object.keys(DICT).length} locales × ${base.length} keys`);
console.log(`✔ ${used.size} keys used in markup, all present`);
console.log(`✔ ${THEME_IDS.length} themes × 2 modes, all colour blocks found`);
