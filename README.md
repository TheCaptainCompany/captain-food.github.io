<div align="center">

<img src="https://raw.githubusercontent.com/TheCaptainCompany/captain-food/main/.github/assets/logo.png" alt="Captain.Food — a mustachioed chef-hatted skull over a crossed golden fork and knife, on a white card" width="190">

# Captain.Food

**Your dishes, your prices, your customers.**

The public landing page of Captain.Food — the flag planted at
[join.captain.food](https://join.captain.food) to recruit the first crew of
independent restaurants and food trucks in **Tours, France**.
**100 % of your orders. 0 % commission — for real.**

[![indexnow](https://github.com/TheCaptainCompany/captain-food.github.io/actions/workflows/indexnow.yml/badge.svg?branch=main)](https://github.com/TheCaptainCompany/captain-food.github.io/actions/workflows/indexnow.yml)
[![github pages](https://img.shields.io/website?url=https%3A%2F%2Fjoin.captain.food&up_message=live&down_message=down&label=github%20pages&labelColor=0e3a5f&up_color=1c7a4d)](https://join.captain.food)

[![join the crew](https://img.shields.io/badge/join.captain.food-%E2%9A%93%20come%20aboard-e8613a?labelColor=0e3a5f)](https://join.captain.food)
[![no build step](https://img.shields.io/badge/built%20with-plain%20HTML%2FCSS%2FJS-a2402a?labelColor=0e3a5f)](docs/SITE.md)
[![license: Coopyleft](https://img.shields.io/badge/license-Coopyleft%20%28AGPL--3.0%20based%29-e0a12b?labelColor=0e3a5f)](LICENSE.md)

</div>

## The mission

<img src="assets/captain.png" align="right" width="170" alt="The Captain — a mustachioed chef-admiral wielding a golden fork">

Delivery platforms take 25–30 % of every order from the restaurants that cook it. Captain.Food
gives independent restaurateurs their orders back: their own ordering channel, their own prices,
their own customer relationship — with **zero commission**, built as a digital public good and
governed by the social and solidarity economy.

This repo is the **landing page that opens that conversation**: written in **French**, speaking
directly to restaurateurs in Tours (tutoiement, maritime "Captain" voice), it explains the model
honestly and collects contact requests from the restaurants who want in. The platform itself is
being built next door in [`TheCaptainCompany/captain-food`](https://github.com/TheCaptainCompany/captain-food).

| Ports of call | |
| --- | --- |
| ⚓ [join.captain.food](https://join.captain.food) | the live page — the pitch, the commission calculator, the FAQ, the join form |
| 🗺️ [`TheCaptainCompany/captain-food`](https://github.com/TheCaptainCompany/captain-food) | the platform repo — specs, backend, the whole ship |
| 🧭 [`CONTRIBUTING.md`](https://github.com/TheCaptainCompany/captain-food/blob/main/CONTRIBUTING.md) | how to come aboard as a contributor |
| 📜 [`docs/SITE.md`](docs/SITE.md) | the operating guide — deploy, forms, SEO, analytics, honesty rules |
| 🏴‍☠️ [`docs/HANDOFF.md`](docs/HANDOFF.md) | project state & pending decisions, for picking work back up |

## How this site works

**Hand-written HTML/CSS/JS — no framework, no build step, no bundler.** GitHub Pages serves
`main` exactly as committed (`.nojekyll` keeps Jekyll out of the way).

- **[`index.html`](index.html)** — the landing: hero, commission calculator, the model, app mockups, FAQ, join form.
- **Satellite pages** — pricing ([`tarifs.html`](tarifs.html)), [manifesto](manifeste.html), [funding](financement.html), [delivery](livraison.html), plus seven **local SEO pages** targeting Tours search intents (Uber Eats / Deliveroo alternatives, click & collect, zero-commission…).
- **[`partials.js`](partials.js)** — injects the shared footer and floating WhatsApp button on every page (single source of truth).
- **[`demo/`](demo/)** — clickable mockups of the future apps (client / resto / livreur), `noindex`, each behind an honest "this is a prototype" gate.
- **[`.github/workflows/indexnow.yml`](.github/workflows/indexnow.yml)** — pings IndexNow engines whenever a page or the sitemap changes; `sitemap.xml`, `robots.txt` and `llms.txt` handle the rest of discovery.

One rule stands above everything: **honesty**. Nothing is presented as live before it exists,
every figure is sourced or labelled illustrative, and the cooperative status (ESUS/SCIC) is
"aimed for" — never claimed. The full rules live in
[`docs/SITE.md`](docs/SITE.md#project-status--honesty-rules).

## Local preview

Nothing to install, nothing to build. Serve the folder so `fetch`, relative links and
`partials.js` behave as in production:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## License

Captain.Food is released under the **Captain.Food Coopyleft License** — a copyleft license
inspired by [CoopCycle's Coopyleft](https://wiki.coopcycle.org/en:license). It adopts the
GNU Affero General Public License v3 for study, execution, modification and redistribution,
but **reserves commercial use to cooperatives, non-profit and limited-profit organizations**
of the social and solidarity economy. See [`LICENSE.md`](LICENSE.md) for the full terms and
[`LICENSES/AGPL-3.0.txt`](LICENSES/AGPL-3.0.txt) for the AGPL v3 text.

---

<div align="center">
  <sub>⚓ The Captain artwork and the logo live in <a href="assets/"><code>assets/</code></a> —
  they are reserved brand assets, not covered by the code license
  (<a href="docs/SITE.md#brand-reservation">brand reservation</a>).</sub>
</div>
