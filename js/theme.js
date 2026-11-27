/**
 * theme.js — single responsibility: theme and mode.
 * Theme order comes from config.js: blue → green → clay → mono.
 * Modes: day and night (one radio group).
 *
 * The theme picker is a compact listbox button (same pattern as the language
 * switcher): the closed state shows the current accent as a dot, so it takes
 * a fraction of the space four separate swatches used to need.
 */

import { THEMES, THEME_IDS, DEFAULT_THEME } from "./config.js";

const MODES = ["light", "dark"];

function buildThemePicker() {
  const host = document.querySelector("[data-theme-group]");
  if (!host) return null;

  host.textContent = "";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "lang-btn theme-btn";
  trigger.setAttribute("data-theme-trigger", "");
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", "theme-menu");
  trigger.setAttribute("aria-label", "Tema");
  trigger.setAttribute("data-i18n-aria", "ui.theme");

  const dot = document.createElement("span");
  dot.className = "theme-dot";
  dot.setAttribute("aria-hidden", "true");
  dot.setAttribute("data-theme-dot", "");

  const chevron = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  chevron.setAttribute("class", "lang-chevron");
  chevron.setAttribute("viewBox", "0 0 20 20");
  chevron.setAttribute("aria-hidden", "true");
  const chevronPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  chevronPath.setAttribute("d", "m6 8 4 4 4-4");
  chevronPath.setAttribute("fill", "none");
  chevronPath.setAttribute("stroke", "currentColor");
  chevronPath.setAttribute("stroke-width", "1.7");
  chevronPath.setAttribute("stroke-linecap", "round");
  chevronPath.setAttribute("stroke-linejoin", "round");
  chevron.appendChild(chevronPath);

  trigger.append(dot, chevron);

  const menu = document.createElement("div");
  menu.className = "lang-menu theme-menu";
  menu.id = "theme-menu";
  menu.setAttribute("role", "listbox");
  menu.setAttribute("aria-label", "Tema");
  menu.setAttribute("data-i18n-aria", "ui.theme");
  menu.setAttribute("data-theme-menu", "");
  menu.hidden = true;

  THEMES.forEach(function (theme) {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "lang-option theme-option";
    option.setAttribute("role", "option");
    option.setAttribute("data-theme-set", theme.id);
    option.setAttribute("aria-selected", "false");
    option.tabIndex = -1;

    const swatch = document.createElement("span");
    swatch.className = "theme-dot";
    swatch.setAttribute("aria-hidden", "true");
    swatch.style.setProperty("--swatch", theme.swatch);

    const label = document.createElement("span");
    label.setAttribute("data-i18n", "ui.theme." + theme.id);
    label.textContent = theme.id;

    option.append(swatch, label);
    menu.appendChild(option);
  });

  host.append(trigger, menu);

  return { host: host, trigger: trigger, menu: menu, dot: dot };
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
  const picker = buildThemePicker();

  const themeOptions = Array.from(document.querySelectorAll("[data-theme-set]"));
  const modeRadios = Array.from(document.querySelectorAll("[data-mode-set]"));

  function syncOptions(value) {
    themeOptions.forEach(function (option) {
      const active = option.getAttribute("data-theme-set") === value;
      option.setAttribute("aria-selected", active ? "true" : "false");
      option.tabIndex = active ? 0 : -1;
    });

    if (picker) {
      const theme = THEMES.find(function (item) {
        return item.id === value;
      });
      if (theme) picker.dot.style.setProperty("--swatch", theme.swatch);
    }
  }

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
    syncOptions(value);
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

  if (picker) {
    const menu = picker.menu;
    const trigger = picker.trigger;

    function isOpen() {
      return !menu.hidden;
    }

    function setMenu(open, focusTrigger, focusOption) {
      menu.hidden = !open;
      trigger.setAttribute("aria-expanded", open ? "true" : "false");

      if (open && focusOption) {
        const selected = menu.querySelector('[aria-selected="true"]') || menu.firstElementChild;
        if (selected) selected.focus({ preventScroll: true });
      } else if (!open && focusTrigger) {
        trigger.focus({ preventScroll: true });
      }
    }

    trigger.addEventListener("click", function (event) {
      const fromKeyboard = event.detail === 0;
      setMenu(!isOpen(), false, fromKeyboard);
    });

    menu.addEventListener("click", function (event) {
      const option = event.target.closest("[data-theme-set]");
      if (!option) return;
      applyTheme(option.getAttribute("data-theme-set"), true);
      setMenu(false, true);
    });

    menu.addEventListener("keydown", function (event) {
      const options = Array.from(menu.querySelectorAll("[data-theme-set]"));
      const index = options.indexOf(document.activeElement);

      if (event.key === "ArrowDown") {
        event.preventDefault();
        options[(index + 1) % options.length].focus();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        options[(index - 1 + options.length) % options.length].focus();
      } else if (event.key === "Home") {
        event.preventDefault();
        options[0].focus();
      } else if (event.key === "End") {
        event.preventDefault();
        options[options.length - 1].focus();
      }
    });

    // Tabbing out of the menu closes it without losing keyboard focus.
    menu.addEventListener("focusout", function (event) {
      if (!picker.host.contains(event.relatedTarget)) setMenu(false);
    });

    document.addEventListener("pointerdown", function (event) {
      if (isOpen() && !picker.host.contains(event.target)) setMenu(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isOpen()) setMenu(false, true);
    });
  }

  wireRadioGroup(modeRadios, function (radio) {
    applyMode(radio.getAttribute("data-mode-set"), true);
  });
}
