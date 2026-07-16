# Captain.Food — marketing site

Public marketing site for **Captain.Food**, an early-stage project building a
local, ethical, **0 %-commission** alternative to extractive food-delivery
platforms, as a **digital public good**. The site's job is to validate local
interest and grow a community by collecting contact requests from **independent
restaurants and food trucks in Tours, France**, and to explain the model
honestly.

- **Live domain:** https://join.captain.food
  (the apex `captain.food` and `www` **301-redirect** to `join.captain.food`)
- **Hosting:** GitHub Pages (org `Captain-Food`, repo `captain-food.github.io`)
- **Product code (the app itself):** https://github.com/Captain-Food/captain-food
- **Stack:** static site — plain hand-written HTML/CSS/JS, **no framework, no
  build step**. A shared footer + floating WhatsApp button are injected on every
  page by `partials.js` (single source of truth).

> All source comments and docs are in English. All visible page copy is in
> French, by design (tutoiement, direct tone, maritime "Captain" identity).

## License & brand

The code in this repository is released under the **Captain.Food Coopyleft
License** — a copyleft based on the GNU AGPL v3, in the spirit of the CoopCycle
license. You may study, run, modify and redistribute it, but **commercial use is
reserved to social-and-solidarity-economy organisations** (cooperatives,
non-profit and limited-profit entities). See [`LICENSE.md`](LICENSE.md) and
[`LICENSES/AGPL-3.0.txt`](LICENSES/AGPL-3.0.txt); the canonical text lives in the
product repo [`Captain-Food/captain-food`](https://github.com/Captain-Food/captain-food).

### Brand reservation

The code license does **not** cover the project's brand identity. The name
**"Captain.Food"**, the logo (the skull-toque mark) and the **Captain
illustrations** are reserved. You may not reuse them to represent another
project, product or service, nor in any way that suggests affiliation with or
endorsement by Captain.Food. Any reuse of the brand requires prior written
permission. (This is separate from, and not waived by, the code license above.)

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

## SEO & discovery

- `sitemap.xml` lists every indexable page (URLs on `join.captain.food`).
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
   from the chosen branch, `/ (root)`.
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

> **Brand-art IP note:** the Captain illustrations are stylistically close to
> well-known manga/anime. Before Captain.Food goes fully commercial, confirm the
> rights to these images are cleared.
