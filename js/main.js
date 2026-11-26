/**
 * main.js — entry point.
 * Only module composition here: no logic of its own.
 *
 *   storage  → settings persistence
 *   params   → URL parameters
 *   theme    → colour themes and day/night mode
 *   i18n     → interface language
 *   chrome   → year, header, section reveal
 *   reviews  → reviews carousel
 *   works    → translated WhatsApp links on the work cards
 *   compare  → mobile comparison labels
 *   mock     → scrolling device screens
 *   copy     → clipboard copying
 */

import { createStorage } from "./storage.js";
import { readParams } from "./params.js";
import { initTheme } from "./theme.js";
import { initI18n } from "./i18n.js";
import { initChrome } from "./chrome.js";
import { initReviews } from "./reviews.js";
import { initWorkLinks } from "./works.js";
import { initCompare } from "./compare.js";
import { initMockScroll } from "./mock-scroll.js";
import { initCopy } from "./copy.js";

const root = document.documentElement;
const storage = createStorage("oficioev.");
const params = readParams();

initTheme({ root, storage, params });

const i18n = initI18n({ root, storage, params });

initChrome();
initReviews();
initWorkLinks({ t: i18n.t });
initCompare();
initMockScroll();
initCopy({ t: i18n.t });
