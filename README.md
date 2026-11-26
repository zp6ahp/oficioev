# Oficio EV — static business site

A small static site: a one-page sales site plus FAQ and terms pages.
**No database, no PHP, no build step, no runtime dependencies.**
Opens as plain files and deploys to free Cloudflare Pages or GitHub Pages.

**What it demonstrates:** 5 interface and site languages (ES · EN · PT · RU · DE),
4 colour themes (blue, green, orange, mono), day/night modes, dark-blue default, full mobile adaptation.
It also includes a FAQ page with native accordions and a separate terms page.
Evgenii speaks Spanish and Russian; the sites themselves can be built in any of the five
languages, or multilingual.

```
OficioEV/
├── index.html          ← sales page, markup and default copy (Spanish)
├── faq.html            ← frequently asked questions
├── condiciones.html    ← terms of service
├── styles.css          ← design: 4 themes × 2 modes
├── js/
│   ├── main.js         ← composition only, no logic of its own
│   ├── config.js       ← single source: themes, languages, defaults
│   ├── storage.js      ← settings persistence
│   ├── params.js       ← URL parameters (?lang, ?theme, ?mode)
│   ├── theme.js        ← theme radios, day/night, saved choice
│   ├── i18n.js         ← language detection, switching, meta updates
│   ├── chrome.js       ← year, header border, section reveal
│   ├── reviews.js      ← swipeable reviews carousel with side arrows
│   ├── works.js        ← translated WhatsApp links for the work cards
│   ├── qr.js           ← local QR dialog for FAQ
│   ├── copy.js         ← clipboard copying
│   ├── vendor/         ← qrcode.mjs (MIT, only loaded on FAQ)
│   └── locales/        ← es.js · en.js · pt.js · ru.js · de.js
├── scripts/check.mjs   ← consistency tests (npm test)
├── scripts/build.mjs   ← copies the deployable files into dist/
├── package.json        ← scripts and dev-only tooling
├── eslint.config.js    ← ESLint flat config
├── .prettierrc.json    ← formatting rules
├── .github/workflows/  ← CI: npm ci && npm test
├── LICENSE
├── favicon.svg
├── assets/og.svg       ← social image source
├── assets/og.png       ← 1200×630 social image (what links use)
├── 404.html
├── robots.txt
├── sitemap.xml
├── _headers            ← security headers for Cloudflare Pages
└── .nojekyll           ← required by GitHub Pages
```

**Principle:** one module, one responsibility. `main.js` does nothing itself,
it only wires the rest together.

> ⚠️ ES modules only work over HTTP. Double-clicking `index.html` (`file://`)
> will not load them. Run a local server with `python3 -m http.server`;
> on GitHub Pages everything works out of the box.

---

## 1. Run locally

```bash
cd OficioEV
python3 -m http.server 8080
```

Open `http://localhost:8080`.

Install the development tooling once (ESLint and Prettier; nothing ships to the browser):

```bash
npm ci
```

Run all checks — translation consistency, linting and formatting:

```bash
npm test
```

The same check runs in GitHub Actions on every push and pull request
(`.github/workflows/check.yml`), so drift is caught without a build step.

---

## 2. Deploy (free)

### Cloudflare Workers (current)

The live site is a Worker with static assets. Build and deploy:

```bash
npm test
npm run build
npx wrangler deploy
```

Or connect the repository to Workers Builds:

- build command: `npm run build`;
- deploy command: `npx wrangler deploy`;
- root directory: `/`;
- assets directory: `dist`.

Clean URLs (`/`, `/faq`, `/condiciones`) rely on the Worker's HTML handling.
Set `not_found_handling` to `404-page` in the Worker assets configuration to
serve the custom `404.html`.

`_headers` adds `nosniff`, a referrer policy and clickjacking protection.
`_redirects` keeps old `.html` URLs working with `301`.

### Cloudflare Pages (alternative)

Build `dist` and connect/upload it to Pages:

- build command: `npm run build`;
- output directory: `dist`.

Clean URLs work the same way. Add the custom domain in **Pages → Custom domains**.

### GitHub Pages (alternative)

GitHub Pages serves the site from a repository subpath (`/repo/`), while this
site uses root-absolute clean URLs (`/faq`, `/condiciones`). For GitHub Pages,
deploy at the domain root or adjust those links. Cloudflare is the primary target.

## 3. What to change when customising (10 minutes)

Everything lives in `index.html`. The places to touch:

| What                             | Where                                                                        |
| -------------------------------- | ---------------------------------------------------------------------------- |
| Title and description for Google | `<title>`, `<meta name="description">`                                       |
| Canonical URL                    | `<link rel="canonical">`, `og:url`                                           |
| Phone                            | every `https://wa.me/595995690990` and the `+595 995 690 990` text           |
| Telegram                         | every `https://t.me/oficioev` and `@oficioev` (header button + contact row)  |
| Instagram                        | every `https://www.instagram.com/oficioev/` and `@oficioev` (contact row)    |
| Email                            | `data-copy="hola@oficioev.com"` and the visible text                         |
| Name and brand                   | `.brand-name`, `h1`, footer                                                  |
| Services and prices              | section `#servicios` and the `svc.note` paragraph (domain terms)             |
| How it works                     | section `#como`                                                              |
| About                            | section `#sobre`                                                             |
| Work examples                    | section `#trabajos` — three cards, `works.*` keys                            |
| Reviews                          | section `#resenas` — seven quotes, `reviews.*` keys                          |
| FAQ                              | `faq.html` — nine `faq.q*/faq.a*` pairs; links in the footer and near prices |
| Terms                            | `condiciones.html` — eight `terms.s*` sections                               |
| Structured data                  | `<script type="application/ld+json">`                                        |

**Don't forget:** the phone in two places (header button + contact row), Telegram in two
(header button + contact row), Instagram in the contact row, and all in JSON-LD (`telephone`, `sameAs`).

**Work and reviews are placeholders.** The three work cards are labelled “Example” and every
card is a link to WhatsApp with a pre-filled message (“I want one like this”). When a real site
exists, change that `href` to the project URL (and change `works.cta` to “See the site”). The
seven quotes say “Sample client” / “Cliente de ejemplo”: replace them with real reviews before
promoting the site. If you have fewer, delete the extra `<li class="review">` — the carousel
recalculates by itself.

**QR buttons:** the FAQ CTA has a QR button for the current page, and the hero buttons and the contact rows have small square QR buttons next to WhatsApp, Telegram and Instagram. They open a dialog with a QR for that specific link/page. The QR is generated **locally** with the vendored MIT library (loaded only on first click), so the URL never goes to a third-party QR service. On a phone the buttons are hidden (scanning your own screen makes little sense); on localhost the dialog warns that the QR only works on the public version.

**Reviews carousel:** `js/reviews.js` scrolls one card per arrow click, with the tall arrows
sitting on both sides of the row. Touch and mouse dragging are handled in the same file, so a
horizontal swipe stays inside the carousel instead of triggering the browser's back gesture;
`scroll-snap-type: x mandatory` plus a snap on release makes every swipe stop on a card. At
either end the arrow wraps around, so it never looks dead. Trackpad and keyboard (focus the
row) still work natively. The row is a plain `<ul>` — add or remove `<li class="review">` and
nothing else needs changing.

**Prices:** `svc.1.m`, `svc.2.m`, `svc.3.m` and `svc.note` in every locale must stay
in sync. The note says that design, publishing and HTTPS are included, there is no monthly
fee, a custom domain is separate (150.000 Gs setup + 150.000 Gs/year), and two languages are
included (each extra language +150.000 Gs).

### Before publishing (own site)

- [ ] Replace phone, email and social placeholders (the current ones are real for Oficio EV).
- [ ] Buy a real domain: `.com` first (no residency/RUC needed), `.com.py` later if NIC.py allows it.
- [ ] Never put `github.io` / `pages.dev` in Google Business Profile, ads or business cards — only for testing.
- [ ] `https://oficioev.com/` is already set in `canonical`, `og:url`, JSON-LD and `sitemap.xml`; update only if the domain changes.
- [ ] Connect Google Search Console.
- [ ] Add 2–3 case studies (task → work → result → screenshots); one page with cases beats eight generic pages.
- [ ] Add 2–3 real reviews when they exist.
- [ ] Replace the sample FAQ/terms text with your confirmed conditions (payment split, revisions, warranty).
- [ ] Run `npm test` and check 320 px, dark mode and every theme.

A domain costs about 95.000 Gs/year and one project at 1.500.000 Gs pays for it many times over.

---

## 4. Turning this into a client site

Clone the folder → change **six things**:

1. Name and brand.
2. Title and description.
3. Three services, prices and the domain note.
4. The “about” block.
5. Phone + WhatsApp.
6. Accent colour in `styles.css`.

That's it. 20–30 minutes per client.

### Changing the accent colour

Themes live in `styles.css` as paired blocks:

```css
[data-theme="green"][data-mode="light"] {
  --accent: #1f3d2b;
  --accent-soft: #e7ede5;
  --accent-ink: #f7f5ef;
}
[data-theme="green"][data-mode="dark"] {
  --accent: #cfdcc9;
  --accent-soft: #223028;
  --accent-ink: #16201a;
}
```

Edit the values in the block you need — or add a whole new theme (see section 8).

---

## 5. Why it is fast

- **No external fonts** — system fonts only (zero requests).
- **One CSS file and small ES modules** (~94 KB total, ≈26 KB gzipped).
- **No bitmaps at all** — every icon and illustration is inline SVG, themed with CSS variables (including the About illustration).
- **The hero mockup is a CSS animation**, not a video or GIF: two device frames with slowly scrolling mock pages (different content and speeds), devices bobbing gently, pages duplicated for a seamless loop. It recolours with the theme and pauses under `prefers-reduced-motion`.
- **No build** — files are served as they are. Tooling (tests, ESLint, Prettier) is development-only and never reaches the browser.

The whole page is roughly **94 KB**. That is the argument for the client:
“it opens in a second, even on mobile data”.

---

## 6. SEO and accessibility

- `<title>` and `description`.
- Open Graph and Twitter Card.
- `canonical`.
- JSON-LD `ProfessionalService` (Google understands the business, the area and the offer).
- `robots.txt` and `sitemap.xml`.
- Semantic markup: `header`, `main`, `section`, `footer`, `h1 → h2 → h3`.
  **Accessibility (WCAG 2.2 AA targeted):**

- contrast measured across all 4 themes × 2 modes: worst text pair **5.06:1** (AA needs 4.5), worst UI border **3.45:1** (AA needs 3.0);
- interactive targets ≥ 24×24 px (theme swatches keep a 16 px dot inside a 24 px hit area);
- reflow without horizontal scroll down to **320 px**;
- `prefers-reduced-motion` stops every animation, `prefers-contrast: more` boosts text and borders;
- skip link, `focus-visible` outlines, semantic landmarks (`header`/`main`/`nav`/`footer`), radio semantics (`role="radio"` + `aria-checked`) on theme/mode controls, labelled controls;
- `<html lang>` updated on language switch, and native language names rendered as separate `<span lang="…">` nodes (WCAG 3.1.2).

**After publishing:** add the site to **Google Search Console** and link it from
**Google Business Profile** — that is what actually brings traffic, not the site itself.

> About the social image: `assets/og.png` is the 1200×630 file used by the meta
> tags; `assets/og.svg` is the editable source. If you change the source, export a
> new PNG before deploying (a browser screenshot at 1200×630 works).

---

## 7. Languages (5)

All translations live in `js/locales/*.js`, one file per language.
In HTML, texts are marked with `data-i18n="key"`; the default is **Spanish**.

**How the language is chosen on load** (in this exact order):

1. **crawlers and link previews** always get **Spanish** — the canonical content —
   even when they execute JavaScript (Googlebot, Bingbot, Facebook, etc.);
2. `?lang=xx` in the URL (visitors only);
3. the saved choice (if the visitor switched manually);
4. `navigator.languages` — the browser language, including regional tags
   (`pt-BR` → `pt`, `es-PY` → `es`, `de-AT` → `de`);
5. if the language is not supported (`fr`, `ja`…) — **English**.

The markup itself is Spanish, so crawlers that do not run JavaScript get Spanish
for free; the crawler check only keeps JS-capable bots consistent with it.

**About persistence:** a manual choice is stored permanently (`localStorage`),
autodetect is **not stored at all**. So a visitor who picked a language keeps it;
a visitor who did not gets a fresh detection on every visit, and a system language
change will be noticed.

**Adding a language:** create `js/locales/xx.js` by copying `es.js`, then add one
entry to `UI_LANGUAGES` in `js/config.js` (code, short label such as `IT`, and the full
name). The custom dropdown and the “Idiomas” fact are generated from config; “Idiomas
del sitio” is the static list of site languages (`about.f4.v` in every locale).

**Honest note on SEO:** since switching happens in JS, search engines only index
Spanish. Real multilingual SEO needs separate `/en/`, `/ru/` folders and `hreflang`.
For a business card and a demo this is enough.

**Spoken vs site languages:** Evgenii speaks **Spanish and Russian**. The site can be
delivered in **Spanish, Portuguese, English, German or Russian**, or in several at once.
This matters locally: the German colony, the Russian-speaking community and the
Portuguese border trade are all potential clients.

---

## 8. Themes (4 × day/night)

Two attributes on `<html>`:

```html
<html data-theme="blue" data-mode="dark"></html>
```

- `data-theme`: `blue` · `green` · `orange` · `mono`
- `data-mode`: `light` · `dark`

Header order: **blue → green → orange → mono**, then two mode buttons: **day** and **night**.
The site opens in **blue + dark** unless the visitor already chose something else.

In `styles.css` each variant sets `--accent`, `--accent-soft`, `--accent-ink`,
while blue, orange and mono also override the surfaces (`--bg`, `--line`).

**Adding a theme:**

1. In `js/config.js` — add an entry to `THEMES` with its swatch colour; the header
   radio is generated, so the markup stays untouched.
2. In `styles.css` — two blocks (light and dark) following the existing pattern.
3. In every locale — the theme label (`ui.theme.xxx`).

`npm test` fails if any of the three is missing.

---

## 9. Demo links (handy when pitching)

The site understands URL parameters:

```
?lang=ru&theme=orange&mode=dark
```

- `lang` — `es` · `en` · `pt` · `ru` · `de`
- `theme` — `blue` · `green` · `orange` · `mono`
- `mode` — `light` · `dark`

Examples:

| Link                               | What it shows          |
| ---------------------------------- | ---------------------- |
| `/?theme=blue&mode=dark&lang=es`   | blue, night, Spanish   |
| `/?theme=mono&mode=light&lang=en`  | mono, day, English     |
| `/?theme=orange&mode=dark&lang=ru` | orange, night, Russian |

Useful both for selling (“here is how it looks in your style”) and for checking
every variant.

---

## 10. Limitations (honest)

- **No form in this demo** — it needs a server. WhatsApp and `mailto` buttons replace it.
  For a client site, add Formspree, Netlify Forms or a similar endpoint.
- **No database** — content lives in HTML. Plenty for a business card.
- **Updating = edit a file + `git push`** (one minute).
- **GitHub Pages** is static — which is a plus: nothing to crash, nothing to hack.

---

## 11. License

Released as **all rights reserved** — see [`LICENSE`](LICENSE).
The code is published for demonstration and portfolio purposes: it may be read
and reviewed, but not reused without written permission.

If you would rather let others reuse it, replace `LICENSE` with MIT.
