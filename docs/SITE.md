# Site operations guide

Everything you need to run, edit and deploy the landing page. (This content
used to live in the repository README, which is now a short branded front
page. For session-to-session handoff — current work, pending decisions — see
[`HANDOFF.md`](HANDOFF.md).)

The site is a **static, hand-written HTML/CSS/JS** marketing site — no
framework, no build step (`.nojekyll` disables Jekyll). A shared footer and
floating WhatsApp button are injected on every page by `partials.js` (single
source of truth). All source comments and docs are in English; all visible
page copy is in French, by design (tutoiement, direct tone, maritime
"Captain" identity). The **homepage additionally self-translates client-side
into 15 more languages** (see "Internationalization" below); French stays the
canonical, indexed content.

## Project status & honesty rules

The product is **not built yet** — the site presents everything as a roadmap
("on démarre", "à venir", "avec les premiers restos"), never as a live service.
A few rules are baked into the copy and must be preserved:

- **Legal structure.** The publisher is the **association Caring Hope Foundation**
  (loi 1901, RNA `W372020229`). **ESUS accreditation and the SCIC cooperative
  are goals ("visés"), not acquired** — never state them as current facts.
- **Figures are sourced or illustrative.** Only sourced numbers are used: net
  margin ~3 % (Observatoire Fiducial, UMIH/GHR/SNARR 2025); ~8 000 restaurant
  insolvencies in France in 2024, +80 % over two years (Altares 2024); platform
  commission Uber Eats ~25-35 %, Deliveroo ~25-30 % (public ranges). Every
  worked example is labelled *illustratif*.
- **Funding model.** Free for restaurants: 0 % commission, no subscription, no
  hidden fee. The platform runs on **voluntary contributions** from customers
  (0 € possible). If that isn't enough, a transparent fallback ("plan B") shares
  real costs **at cost** (a small per-order operating fee for customers — any
  overpayment stays a contribution — and a fixed share for restaurateurs,
  spread across how many have joined), meant to disappear if the model works.
  **Never a commission, never a card surcharge** (a card surcharge would breach
  art. L112-12 CMF / PSD2).
- **No pricing grid.** It's a **digital public good, open source** — not a
  commercial product with tiers.
- **No fake testimonials, logos, metrics or traction.** No named-competitor
  denigration — compare models, not brands.

## File structure

```
captain-food.github.io/
├── index.html                          # landing (hero, calculator, model, FAQ, join form, mockups)
├── tarifs.html                         # pricing page — "c'est gratuit" + transparent plan B
├── manifeste.html                      # the founder's manifesto
├── financement.html                    # how it's funded (0 % commission, contribution, plan B)
├── livraison.html                      # delivery model (a future channel)
├── mentions-legales.html               # legal notice (siège + directeur still to fill in)
├── confidentialite.html                # RGPD privacy notice (real French copy)
├── 404.html                            # not-found page
│   # SEO intent pages (indexable):
├── alternative-uber-eats-tours.html
├── alternative-deliveroo-tours.html
├── restaurant-sans-commission-tours.html
├── commande-en-ligne-restaurant-tours.html
├── click-and-collect-tours.html
├── livraison-ethique-tours.html
├── restaurants-tours-indre-et-loire.html   # local hub (Tours + communes)
├── demo/                               # clickable throwaway mockups (noindex)
│   ├── index.html                      # chooser: client / resto / livreur
│   ├── client.html  resto.html  livreur.html
│                                       # each: warning gate + community feedback form
├── styles.css                          # hand-written CSS (brand tokens as CSS variables)
├── script.js                           # form validation + Formspree, calculator, scrollspy, etc.
├── partials.js                         # shared footer + floating WhatsApp button (injected)
├── sitemap.xml  robots.txt  llms.txt   # SEO + AI-crawler discovery
├── .github/workflows/indexnow.yml      # pings IndexNow on push (host: join.captain.food)
├── 00f1c06…3f8b7.txt                   # IndexNow verification key
├── assets/                             # logo.png, favicon.png, og.png + captain-*.webp/png art
├── prospection/                        # A5 flyer (HTML + PDF) + QR code
├── LICENSE.md  LICENSES/AGPL-3.0.txt   # Captain.Food Coopyleft License (verbatim)
├── CNAME                               # custom domain: join.captain.food
└── .claude/                            # Claude Code tooling that travels with the repo
    ├── agents/                         # vendored subagents (incl. custom "Yan" neuromarketing)
    ├── skills/frontend-design/         # Anthropic frontend-design skill
    └── commands/ + plugins/            # /code-review command (Anthropic plugin)
```

Docs kept in the repo: `content.md` (copy notes) and
`captain-food-brief-direction-artistique.md` (art direction brief).

## Local preview

No build needed. Serve the folder (so `fetch`, relative links and `partials.js`
behave as in production):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Forms (Formspree)

- **Join form** (`index.html`, `#rejoindre`): Formspree `xqevrjwp`.
- **Mockup feedback forms** (`demo/`): `mvzezyal` (client), `mrenedqv` (resto),
  `mnjejrde` (livreur).

`script.js` guards against a `PLACEHOLDER_ID` action (shows a friendly "email us
instead" message) in case an ID is ever reset. After first deploy, submit each
form once and confirm the address in the Formspree dashboard so submissions
aren't held for verification.

## Internationalization (i18n)

The **homepage** (`index.html`) + the shared chrome (`partials.js` footer,
WhatsApp bubble) are translated into **16 languages**: French (source) + English, Spanish,
Italian, Portuguese, German, Turkish, Greek, Romanian, Chinese (Mandarin),
Japanese, Thai, Hindi (widely spoken languages in France) and **Arabic,
Lebanese Arabic + Hebrew (rendered RTL)**. The language picker (flags +
selected state) appears in the header AND in the footer (drop-up); the page
states that the future product itself will speak these 16 languages
(hero.langs / footer.langs keys). How it works:

- **Single source of truth**: [`i18n/translations.yaml`](../i18n/translations.yaml)
  — same conventions as `specs/translations.yaml` in the product repo
  (`TheCaptainCompany/captain-food`): one dotted key per string, optional
  `params` ({placeholder} tokens), `messages` covering **every** declared
  language.
- **Annotation**: translatable elements carry `data-i18n` (textContent),
  `data-i18n-html` (innerHTML, tags preserved by translators) or attribute
  variants (`data-i18n-aria-label`, `data-i18n-alt`, `data-i18n-content`,
  `data-i18n-placeholder`). The French in the page IS the fr catalog — the
  validator extracts it and fails on any drift.
- **Tooling**: `python3 tools/i18n/i18n.py check` validates (completeness
  across all languages, placeholder consistency, key parity both ways, fr
  drift, stale generated files); `… build` emits `i18n/generated/<lang>.json`
  (committed, since GitHub Pages has no build step). CI runs the check on
  every push (`.github/workflows/i18n.yml`). Bulk re-imports:
  `tools/i18n/merge.py`.
- **Runtime**: [`i18n.js`](../i18n.js) resolves the language
  (`?lang=` → `cf_lang` cookie → sessionStorage → `navigator.languages` → fr),
  fetches the JSON catalog when ≠ fr, translates in place, sets
  `<html lang dir>` (RTL for ar/he — layout fixes live under `[dir="rtl"]`
  in `styles.css`), and injects a language picker in the header.
  Dynamic strings in `script.js` (calculator, form errors, Captain quotes)
  go through `CF_I18N.t(key, frFallback, params)` — **keep the French
  fallback literals in sync with the YAML fr messages**.
- **Cookie consent**: switching language via the picker asks the visitor
  whether to remember the choice; only "yes" writes the `cf_lang` cookie
  (1 year, first-party, SameSite=Lax). Refusal = sessionStorage only.
  Browser auto-detection never writes anything, so no banner on landing.
- **Scope**: homepage only for now. Sub-pages (tarifs, manifeste, SEO intent
  pages, legal) stay French — the SEO pages target French queries by design
  and legal pages should remain French. To translate another page: annotate
  it with `data-i18n` keys, add the keys + 16 translations to
  `translations.yaml`, include `/i18n.js` before its scripts, add the page to
  `HTML_SOURCES` in `tools/i18n/i18n.py`, run `build`, and add hreflang
  `?lang=` alternates to its `<head>` + `sitemap.xml`.

## SEO & discovery

- `sitemap.xml` lists every indexable page (URLs on `join.captain.food`);
  the homepage entry carries `xhtml:link` hreflang alternates (`?lang=xx`),
  mirroring the `<link rel="alternate" hreflang>` tags in `index.html`
  (+ `og:locale:alternate` and `knowsLanguage` in the JSON-LD).
- `robots.txt` allows everyone, incl. named AI crawlers (GPTBot, ClaudeBot,
  PerplexityBot…), and points to the sitemap.
- `llms.txt` gives LLMs a concise, linkable overview.
- **IndexNow**: `.github/workflows/indexnow.yml` submits the sitemap URLs to
  IndexNow engines (Bing, etc.) on every push that touches `*.html` or
  `sitemap.xml`. Host is `join.captain.food`; the key file is the `…​.txt` at the
  repo root. (Google doesn't use IndexNow — use Search Console for Google.)
- The `demo/` mockups are `noindex` (throwaway prototypes with a fictional
  restaurant).

## Analytics

**Cloudflare Web Analytics** (cookieless, no cookie banner required) is enabled
in the `<head>` of every content page. No Google Analytics. To rotate the token,
update the `data-cf-beacon` token in each page's `<head>`.

## Deploy to GitHub Pages with the custom domain

1. **Source branch:** repo **Settings → Pages → Build and deployment** → deploy
   from `main`, `/ (root)`.
2. **Custom domain:** the `CNAME` file already contains `join.captain.food`, which
   sets the Pages custom domain automatically.
3. **DNS** (at the registrar for `captain.food`):
   - `join.captain.food` → **CNAME** → `captain-food.github.io`
   - the apex `captain.food` and `www` → **301 redirect** to
     `https://join.captain.food` (registrar/CDN redirect).
4. **Enforce HTTPS:** tick **Settings → Pages → Enforce HTTPS** once the
   certificate is provisioned.

## Still to complete (legal)

`mentions-legales.html` reflects the real publisher (association Caring Hope
Foundation, RNA W372020229) but still needs the **siège social** (a
non-personal address) and the **directeur de la publication**. Fill these in as
soon as they're settled. The host block (GitHub Pages / GitHub, Inc.) is
complete. The privacy notice (`confidentialite.html`) is real, working French
RGPD copy — review the retention period (currently 24 months) if needed.

## License & brand

The code in this repository is released under the **Captain.Food Coopyleft
License** — a copyleft based on the GNU AGPL v3, in the spirit of the CoopCycle
license. You may study, run, modify and redistribute it, but **commercial use is
reserved to social-and-solidarity-economy organisations** (cooperatives,
non-profit and limited-profit entities). See [`LICENSE.md`](../LICENSE.md) and
[`LICENSES/AGPL-3.0.txt`](../LICENSES/AGPL-3.0.txt); the canonical text lives in the
product repo [`TheCaptainCompany/captain-food`](https://github.com/TheCaptainCompany/captain-food).

### Brand reservation

The code license does **not** cover the project's brand identity. The name
**"Captain.Food"**, the logo (the skull-toque mark) and the **Captain
illustrations** are reserved. You may not reuse them to represent another
project, product or service, nor in any way that suggests affiliation with or
endorsement by Captain.Food. Any reuse of the brand requires prior written
permission. (This is separate from, and not waived by, the code license above.)

> **Brand-art IP note:** the Captain illustrations are stylistically close to
> well-known manga/anime. Before Captain.Food goes fully commercial, confirm the
> rights to these images are cleared.
