# Captain.Food — landing page

First public landing page for **Captain.Food**, an early-stage project building
a local, ethical alternative to extractive food-delivery platforms. The page's
single job is to validate local market interest and start a community by
collecting qualified contact requests from **independent restaurants and food
trucks in Tours, France**.

- **Live domain:** https://captain.food
- **Hosting:** GitHub Pages (org `Captain-Food`, repo `captain-food.github.io`)
- **Stack:** static site — plain hand-written HTML/CSS/JS, **no framework, no
  build step**. Just open `index.html`.

> All source comments and docs are in English. All visible page copy is in
> French, by design.

## File structure

```
captain-food.github.io/
├── index.html            # landing page (all sections)
├── styles.css            # hand-written CSS (brand tokens as CSS variables)
├── script.js             # form validation + Formspree submission
├── confidentialite.html  # RGPD privacy notice (real French copy)
├── mentions-legales.html # legal notice scaffold (placeholders to fill in)
├── assets/
│   ├── logo.png          # brand mark (skull-toque), transparent, header/nav
│   ├── favicon.png       # 64px browser-tab icon (same mark)
│   └── captain.jpg       # Captain Food hero portrait
├── CNAME                 # custom domain: captain.food
└── README.md
```

## Local preview

No build needed. Either open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

Serving over HTTP (rather than `file://`) is recommended so the form `fetch`
and relative links behave exactly as in production.

---

## TODO checklist before go-live

These are the placeholders wired into the code. Search the repo for `TODO` and
`PLACEHOLDER` to find them all.

### 1. Swap the Formspree ID (required for the form to work)

The contact form posts to Formspree. In `index.html`, find:

```html
<form id="pilot-form" ... action="https://formspree.io/f/PLACEHOLDER_ID" ...>
```

1. Create a free form at https://formspree.io and copy its form ID
   (looks like `xayzabcd`).
2. Replace `PLACEHOLDER_ID` with your real ID:
   `action="https://formspree.io/f/xayzabcd"`.
3. Submit the form once and confirm the email in Formspree's dashboard.

Until this is done, `script.js` detects the placeholder and shows a friendly
French message inviting the visitor to email `contact@captain.food` instead — so
the page never silently loses a lead.

### 2. WhatsApp & LinkedIn links

In `index.html`, in the footer, replace the two placeholder links:

```html
<!-- TODO: replace with real WhatsApp link -->
<li><a href="#" rel="nofollow">WhatsApp</a></li>
<!-- TODO: replace with real LinkedIn link -->
<li><a href="#" rel="nofollow">LinkedIn</a></li>
```

- **WhatsApp:** use a `https://wa.me/<international-number>` link
  (e.g. `https://wa.me/33612345678`), optionally with a prefilled message:
  `https://wa.me/33612345678?text=Bonjour%20Captain.Food`.
- **LinkedIn:** the project/company page URL, e.g.
  `https://www.linkedin.com/company/captain-food/`.

### 3. Brand assets (already in place)

The real Captain Food art is wired in:

- `assets/logo.png` — the skull-toque mark, whitespace trimmed and background
  made transparent, used in every page header and as the base for the favicon.
- `assets/favicon.png` — 64 px browser-tab icon (same mark).
- `assets/captain.jpg` — the Captain Food portrait shown in the hero (cropped
  from the character sheet and compressed to ~150 KB).

To update any of them, replace the file at the same path to keep all references
working (logo is referenced in `index.html`, `confidentialite.html`,
`mentions-legales.html`; captain in `index.html`). Keep the logo roughly square
and readable at 32 px.

> **IP note:** the brand art is illustrative and stylistically close to
> well-known manga/anime. Before Captain.Food goes fully public and commercial,
> confirm the rights to these images are cleared for commercial use.

### 4. Fill in the legal notice

`mentions-legales.html` contains clearly-marked `[À COMPLÉTER — …]` placeholders
(raison sociale, forme juridique, SIRET, siège social, directeur de la
publication). Fill these in as soon as the legal structure exists. The host
block (GitHub Pages / GitHub, Inc.) is already complete.

The privacy notice (`confidentialite.html`) is real, working French RGPD copy.
Review the retention period (currently 24 months) and the data-contact address
(`contact@captain.food`) and adjust if needed.

### 5. Analytics (optional, cookieless — no cookie banner needed)

A commented snippet block sits in the `<head>` of `index.html`. Pick **one**
privacy-friendly, cookieless provider and uncomment it. **Do not add Google
Analytics** — it would require a cookie-consent banner.

- **Plausible** (https://plausible.io):
  ```html
  <script defer data-domain="captain.food" src="https://plausible.io/js/script.js"></script>
  ```
- **Cloudflare Web Analytics** (https://www.cloudflare.com/web-analytics/):
  ```html
  <script defer src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "YOUR_TOKEN"}'></script>
  ```

Both are cookieless and GDPR-friendly, so no consent banner is required. Add
whichever provider's script and, for Cloudflare, replace `YOUR_TOKEN`.

---

## Deploy to GitHub Pages with the custom domain

The repo name `captain-food.github.io` is an org site, so Pages serves it at the
root.

1. **Push to the default branch** (or set Pages to build from your chosen
   branch): repo **Settings → Pages → Build and deployment → Source:** "Deploy
   from a branch", pick the branch and `/ (root)` folder.
2. **Custom domain:** the `CNAME` file in this repo already contains
   `captain.food`, which sets the custom domain automatically. You can also set
   it under **Settings → Pages → Custom domain**.
3. **DNS** (at your domain registrar for `captain.food`): point the apex domain
   at GitHub Pages with four `A` records:
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```
   (and optionally the matching `AAAA` records for IPv6). If you also want
   `www`, add a `CNAME` record `www → captain-food.github.io`.
4. **Enforce HTTPS:** once DNS propagates, tick **Settings → Pages → Enforce
   HTTPS**. GitHub provisions the TLS certificate automatically.

Allow up to a few hours for DNS + certificate propagation on first setup.

---

## Content & honesty notes

- All euro figures on the page (30 € basket, 21 € / 27 € kept, ~38 € vs 36,99 €,
  the monthly `+600 €`) are **illustrative examples** to explain the model — not
  a fixed tariff. This is stated explicitly on the page ("Exemple illustratif",
  fine print). Keep it that way: no formula is published, only the principle.
- No fake testimonials, metrics, or traction. The page frames Captain.Food
  honestly as an early pilot being built with Tours restaurateurs.
- **Why the "prix libre" claim is credible.** The pay-what-you-want (PWYW)
  model is supported by 15+ years of academic research (e.g. Kim/Natter/Spann
  2009, Gneezy et al. 2012, meta-analyses by Gerpott 2016 and Greiff/Egbert
  2018) and real cases (the Wiener Deewan restaurant on PWYW since 2005,
  museums, Wikipedia). The research-backed success factors — a displayed
  **reference/anchor price**, **transparent cost communication**, and a
  genuine **prosocial / common-good** purpose — are reflected in the copy and
  in the non-profit structure. The page states these as principle, not as a
  published tariff or a guaranteed outcome.
- **Legal-status wording.** Captain.Food launches as a **SASU with ESUS
  accreditation** (Entreprise Solidaire d'Utilité Sociale) and aims to become a
  **SCIC** (Société Coopérative d'Intérêt Collectif) — a multi-stakeholder
  cooperative where restaurateurs, riders and citizens hold governance rights.
  The engagement band states the SCIC step as a goal ("avec pour cap de devenir
  une SCIC"), not a done deal. Keep it phrased as a trajectory until the
  conversion actually happens; ESUS is an accreditation to hold, not a claim to
  make loosely.
