/**
 * i18n.js — single responsibility: interface language.
 * Five languages, browser-language autodetect, saved preference.
 *
 * Priority: ?lang= → saved choice → navigator.languages → FALLBACK_LANGUAGE.
 * Autodetect is NOT saved: the card greets each visitor in their language.
 */

import es from "./locales/es.js";
import en from "./locales/en.js";
import pt from "./locales/pt.js";
import ru from "./locales/ru.js";
import de from "./locales/de.js";

import {
  UI_LANGUAGES,
  SPOKEN_LANGUAGES,
  LANGUAGE_CODES,
  DEFAULT_LANGUAGE,
  FALLBACK_LANGUAGE
} from "./config.js";

const DICT = { es: es, en: en, pt: pt, ru: ru, de: de };

/**
 * Search engines and link previews get the canonical language (Spanish),
 * even when they execute JS. Non-JS crawlers already receive the Spanish
 * markup, so this only keeps JS-capable crawlers consistent with it.
 */
const CRAWLER_PATTERN =
  /bot|crawler|spider|slurp|bingpreview|yandex|baidu|duckduck|facebookexternalhit|embedly|pinterest|w3c_validator/i;

function isCrawler() {
  return CRAWLER_PATTERN.test(navigator.userAgent || "");
}

/** Turns a tag like "pt-BR" into a supported code. */
function baseCode(tag) {
  return String(tag || "")
    .toLowerCase()
    .split("-")[0];
}

/** Returns the first supported language from the browser preference list. */
function detectLanguage(tags) {
  const list = Array.isArray(tags) ? tags : [];
  for (let i = 0; i < list.length; i += 1) {
    const code = baseCode(list[i]);
    if (LANGUAGE_CODES.indexOf(code) !== -1) return code;
  }
  return FALLBACK_LANGUAGE;
}

export function initI18n({ root, storage, params, languages }) {
  let current = DEFAULT_LANGUAGE;

  function setMeta(attr, name, value) {
    if (!value) return;
    const el = document.querySelector("meta[" + attr + '="' + name + '"]');
    if (el) el.setAttribute("content", value);
  }

  const langRoot = document.querySelector("[data-lang]");
  const langTrigger = document.querySelector("[data-lang-trigger]");
  const langMenu = document.querySelector("[data-lang-menu]");

  function buildLanguageMenu() {
    if (!langMenu) return;

    langMenu.textContent = "";

    UI_LANGUAGES.forEach(function (language) {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "lang-option";
      option.setAttribute("role", "option");
      option.setAttribute("data-lang-value", language.code);
      option.setAttribute("aria-selected", "false");

      const code = document.createElement("span");
      code.className = "lang-option-code";
      code.textContent = language.label;

      const name = document.createElement("span");
      name.className = "lang-option-name";
      name.textContent = language.name;

      option.appendChild(code);
      option.appendChild(name);
      langMenu.appendChild(option);
    });
  }

  function isMenuOpen() {
    return Boolean(langMenu) && !langMenu.hidden;
  }

  function setMenu(open, focusTrigger, focusOption) {
    if (!langMenu || !langTrigger) return;

    langMenu.hidden = !open;
    langTrigger.setAttribute("aria-expanded", open ? "true" : "false");

    if (open && focusOption) {
      const selected =
        langMenu.querySelector('[aria-selected="true"]') || langMenu.firstElementChild;
      if (selected) selected.focus({ preventScroll: true });
    } else if (!open && focusTrigger) {
      langTrigger.focus({ preventScroll: true });
    }
  }

  function renderLanguageList() {
    const host = document.querySelector("[data-lang-list]");
    if (!host) return;

    host.textContent = "";

    SPOKEN_LANGUAGES.forEach(function (language) {
      const label = document.createElement("span");
      label.className = "lang-item";
      label.lang = language.code;
      label.textContent = language.name;
      host.appendChild(label);
    });
  }

  function setLang(code, persist) {
    const value = LANGUAGE_CODES.indexOf(code) === -1 ? FALLBACK_LANGUAGE : code;
    const dict = DICT[value];
    current = value;

    root.lang = value;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      const key = el.getAttribute("data-i18n");
      if (dict[key] != null) el.textContent = dict[key];
    });

    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      const key = el.getAttribute("data-i18n-aria");
      if (dict[key] == null) return;
      el.setAttribute("aria-label", dict[key]);
      if (el.hasAttribute("title")) el.setAttribute("title", dict[key]);
    });

    const page = root.dataset.page || "";
    const titleKey = page ? "meta." + page + ".title" : "meta.title";
    const descKey = page ? "meta." + page + ".desc" : "meta.desc";
    const pageTitle = dict[titleKey] || dict["meta.title"];
    const pageDesc = dict[descKey] || dict["meta.desc"];

    if (pageTitle) document.title = pageTitle;
    setMeta("name", "description", pageDesc);
    setMeta("property", "og:title", pageTitle);
    setMeta("property", "og:description", pageDesc);

    if (langTrigger) {
      const active = UI_LANGUAGES.find(function (language) {
        return language.code === value;
      });
      const code = langTrigger.querySelector("[data-lang-code]");
      if (active) {
        if (code) code.textContent = active.label;
        langTrigger.setAttribute("aria-label", active.label + ": " + active.name);
      }
    }

    if (langMenu) {
      langMenu.querySelectorAll("[data-lang-value]").forEach(function (option) {
        const selected = option.getAttribute("data-lang-value") === value;
        option.setAttribute("aria-selected", selected ? "true" : "false");
      });
    }

    renderLanguageList();

    if (persist) storage.set("lang", value);

    document.dispatchEvent(new window.CustomEvent("oficioev:languagechange", { detail: value }));
  }

  function t(key) {
    return DICT[current][key] || "";
  }

  // Priority: URL → saved choice → browser language.
  // `languages` can be passed explicitly, so the module is testable without stubbing navigator.
  const urlLang = params.get("lang");
  const savedLang = storage.get("lang");
  const browserTags = Array.isArray(languages)
    ? languages
    : navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language];

  let initial;

  if (isCrawler()) {
    initial = DEFAULT_LANGUAGE;
  } else if (urlLang && LANGUAGE_CODES.indexOf(urlLang) !== -1) {
    initial = urlLang;
  } else if (savedLang && LANGUAGE_CODES.indexOf(savedLang) !== -1) {
    initial = savedLang;
  } else {
    initial = detectLanguage(browserTags);
  }

  buildLanguageMenu();
  setLang(initial, false);

  if (langTrigger && langMenu) {
    langTrigger.addEventListener("click", function (event) {
      const fromKeyboard = event.detail === 0;
      setMenu(!isMenuOpen(), false, fromKeyboard);
    });

    langMenu.addEventListener("click", function (event) {
      const option = event.target.closest("[data-lang-value]");
      if (!option) return;

      // Different languages have different text lengths: keep the visitor on
      // the same part of the page instead of letting the layout jump.
      const scrollY = window.scrollY;
      setLang(option.getAttribute("data-lang-value"), true);
      window.scrollTo({ top: scrollY, behavior: "instant" });
      window.requestAnimationFrame(function () {
        window.scrollTo({ top: scrollY, behavior: "instant" });
      });
      setMenu(false, true);
    });

    langMenu.addEventListener("keydown", function (event) {
      const options = Array.from(langMenu.querySelectorAll("[data-lang-value]"));
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
    langMenu.addEventListener("focusout", function (event) {
      if (!langRoot.contains(event.relatedTarget)) setMenu(false);
    });

    document.addEventListener("pointerdown", function (event) {
      if (isMenuOpen() && langRoot && !langRoot.contains(event.target)) {
        setMenu(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isMenuOpen()) {
        setMenu(false, true);
      }
    });
  }

  return {
    setLang: setLang,
    t: t,
    getLang: function () {
      return current;
    }
  };
}
