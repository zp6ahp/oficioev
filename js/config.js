/**
 * config.js — single source of truth for themes and languages.
 * Everything else (head boot, theme module, i18n module, tests) reads from here.
 */

export const DEFAULT_THEME = "blue";
export const DEFAULT_LANGUAGE = "es";
export const FALLBACK_LANGUAGE = "en";

/** Header order: blue → green → orange → mono. */
export const THEMES = [
  { id: "blue", swatch: "#1e6fd9" },
  { id: "green", swatch: "#25d366" },
  { id: "orange", swatch: "#f97316" },
  { id: "mono", swatch: "linear-gradient(90deg, #111 0 50%, #fff 50% 100%)" }
];

/** Interface languages, in switcher order. `label` is the short code, `name` the full name. */
export const UI_LANGUAGES = [
  { code: "es", label: "ES", name: "Español" },
  { code: "en", label: "EN", name: "English" },
  { code: "pt", label: "PT", name: "Português" },
  { code: "ru", label: "RU", name: "Русский" },
  { code: "de", label: "DE", name: "Deutsch" }
];

/** Languages Evgenii speaks — shown in the "Idiomas" fact. */
export const SPOKEN_LANGUAGES = [
  { code: "es", name: "Español" },
  { code: "ru", name: "Русский" }
];

export const THEME_IDS = THEMES.map(function (theme) {
  return theme.id;
});
export const LANGUAGE_CODES = UI_LANGUAGES.map(function (language) {
  return language.code;
});
