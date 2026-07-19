<div align="center">

<img src="https://raw.githubusercontent.com/Captain-Food/captain-food/main/.github/assets/logo.png" alt="Captain.Food — a mustachioed chef-hatted skull over a crossed golden fork and knife, on a white card" width="190">

# Captain.Food

**Your dishes, your prices, your customers.**

The public landing page of Captain.Food — local-first food ordering for independent restaurants.
**100 % of your orders. 0 % commission — for real.**

[![join the crew](https://img.shields.io/badge/join.captain.food-%E2%9A%93%20come%20aboard-e8613a?labelColor=0e3a5f)](https://join.captain.food)
[![deployed on GitHub Pages](https://img.shields.io/badge/deployed%20on-GitHub%20Pages-a2402a?labelColor=0e3a5f)](https://pages.github.com)
[![license: Coopyleft](https://img.shields.io/badge/license-Coopyleft%20%28AGPL--3.0%20based%29-e0a12b?labelColor=0e3a5f)](LICENSE.md)

</div>

## What this repo is

The sources of **[join.captain.food](https://join.captain.food)** — the public
landing page of Captain.Food, deployed via **GitHub Pages** (the apex
`captain.food` and `www` 301-redirect to `join`). The page is written in
**French** and speaks to **independent restaurateurs and food trucks in Tours,
France**: it explains the 0 %-commission model honestly and collects contact
requests from restaurants that want to join.

This is only the landing page — a **static site** of plain hand-written
HTML/CSS/JS, no framework, no build step. The platform itself lives in
[`Captain-Food/captain-food`](https://github.com/Captain-Food/captain-food).

## Local preview

There is nothing to build. Serve the folder (so `fetch`, relative links and the
shared footer injected by `partials.js` behave as in production):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Ports of call

| | |
| --- | --- |
| ⚓ [join.captain.food](https://join.captain.food) | the live landing page (the pitch, the model, the FAQ) |
| 🗺️ [`Captain-Food/captain-food`](https://github.com/Captain-Food/captain-food) | the platform repo — specs, backend, the whole ship |
| 🧭 [`CONTRIBUTING.md`](https://github.com/Captain-Food/captain-food/blob/main/CONTRIBUTING.md) | how to come aboard as a contributor |
| 📜 [`docs/SITE.md`](docs/SITE.md) | site operations guide — deploy, forms, SEO, analytics, honesty rules |
| 🏴‍☠️ [`docs/HANDOFF.md`](docs/HANDOFF.md) | resume work in progress — project state & pending decisions |

## License

Captain.Food is released under the **Captain.Food Coopyleft License** — a
copyleft based on the GNU AGPL v3, in the spirit of
[CoopCycle's Coopyleft](https://wiki.coopcycle.org/en:license): study, run,
modify and redistribute freely, but **commercial use is reserved to
social-and-solidarity-economy organisations**. See [`LICENSE.md`](LICENSE.md)
and [`LICENSES/AGPL-3.0.txt`](LICENSES/AGPL-3.0.txt). The name, the logo and
the Captain illustrations are **reserved brand assets** — see the
[brand reservation](docs/SITE.md#brand-reservation).

---

<div align="center">
  <sub>⚓ Made in Tours, for the restaurateurs who cook what we love.</sub>
</div>
