/**
 * theme.js — single responsibility: theme and mode.
 * Theme order comes from config.js: blue → green → orange → mono.
 * Modes: day and night (one radio group).
 *
 * Both groups use radio semantics (role="radio" + aria-checked) with
 * arrow-key navigation, which matches the fact that exactly one option
 * can be active at a time.
 */

import { THEMES, THEME_IDS, DEFAULT_THEME } from "./config.js";

const MODES = ["light", "dark"];

function buildThemeSwatches() {
  const host = document.querySelector("[data-theme-group]");
  if (!host) return;

  host.textContent = "";

  THEMES.forEach(function (theme) {
    const radio = document.createElement("button");
    radio.type = "button";
    radio.className = "swatch";
    radio.setAttribute("role", "radio");
    radio.setAttribute("aria-checked", "false");
    radio.setAttribute("tabindex", "-1");
    radio.setAttribute("data-theme-set", theme.id);
    radio.setAttribute("data-i18n-aria", "ui.theme." + theme.id);
    radio.setAttribute("title", theme.id);
    radio.style.setProperty("--swatch", theme.swatch);
    host.appendChild(radio);
  });
}

function wireRadioGroup(radios, onSelect) {
  radios.forEach(function (radio, index) {
    radio.addEventListener("click", function () {
      onSelect(radio);
    });

    radio.addEventListener("keydown", function (event) {
      const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
      if (keys.indexOf(event.key) === -1) return;

      event.preventDefault();

      let next = index;
      if (event.key === "ArrowRight" || event.key === "ArrowDown")
        next = (index + 1) % radios.length;
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
        next = (index - 1 + radios.length) % radios.length;
      else if (event.key === "Home") next = 0;
      else next = radios.length - 1;

      radios[next].focus();
      onSelect(radios[next]);
    });
  });
}

export function initTheme({ root, storage, params }) {
  buildThemeSwatches();

  const themeRadios = Array.from(document.querySelectorAll("[data-theme-set]"));
  const modeRadios = Array.from(document.querySelectorAll("[data-mode-set]"));

  function syncRadios(radios, attribute, value) {
    radios.forEach(function (radio) {
      const active = radio.getAttribute(attribute) === value;
      radio.setAttribute("aria-checked", active ? "true" : "false");
      radio.setAttribute("tabindex", active ? "0" : "-1");
    });
  }

  function syncMetaColor() {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    window.setTimeout(function () {
      const background = getComputedStyle(document.body).backgroundColor;
      if (background) meta.setAttribute("content", background);
    }, 260);
  }

  function applyTheme(name, persist) {
    const value = THEME_IDS.indexOf(name) === -1 ? DEFAULT_THEME : name;
    root.dataset.theme = value;
    syncRadios(themeRadios, "data-theme-set", value);
    if (persist) storage.set("theme", value);
    syncMetaColor();
  }

  function applyMode(mode, persist) {
    const value = MODES.indexOf(mode) === -1 ? "dark" : mode;
    root.dataset.mode = value;
    syncRadios(modeRadios, "data-mode-set", value);
    if (persist) storage.set("mode", value);
    syncMetaColor();
  }

  // Defaults: URL → saved → dark blue.
  const urlTheme = params.get("theme");
  const urlMode = params.get("mode");
  const savedTheme = storage.get("theme");
  const savedMode = storage.get("mode");

  applyTheme(
    THEME_IDS.indexOf(urlTheme) !== -1
      ? urlTheme
      : THEME_IDS.indexOf(savedTheme) !== -1
        ? savedTheme
        : DEFAULT_THEME,
    false
  );

  applyMode(
    MODES.indexOf(urlMode) !== -1 ? urlMode : MODES.indexOf(savedMode) !== -1 ? savedMode : "dark",
    false
  );

  wireRadioGroup(themeRadios, function (radio) {
    applyTheme(radio.getAttribute("data-theme-set"), true);
  });

  wireRadioGroup(modeRadios, function (radio) {
    applyMode(radio.getAttribute("data-mode-set"), true);
  });
}
