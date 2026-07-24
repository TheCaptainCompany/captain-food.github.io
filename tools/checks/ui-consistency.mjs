/* Captain.Food — cross-page UI consistency check (CI gate).
   Born from a real regression: the FAQ Captain rendered at 132px on sub-pages
   vs 300px on the landing page, because two CSS rules covered one component.
   This check renders EVERY page in a real browser and fails when shared
   components drift:
     1. the FAQ Captain figure (.faq-figure / .faq-topper img) must render at
        the SAME height on every page that shows it (±2px), and never tiny;
     2. every page must expose the language switcher (header) and the footer
        picker slot filled by i18n.js;
     3. no same-origin console errors on any page;
     4. sample pages must actually translate via ?lang=en (html[lang] flips).
   Run: python3 -m http.server 8123 &  then  node tools/checks/ui-consistency.mjs
   (CI: .github/workflows/ui-check.yml) */
import { readdirSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.UI_CHECK_BASE || "http://localhost:8123";
const executablePath = process.env.CHROMIUM_PATH || undefined;

const root = new URL("../../", import.meta.url).pathname;
const pages = readdirSync(root)
  .filter((f) => f.endsWith(".html"))
  .sort();
// Generated per-language pages: cover the indexable set fully (en) plus one
// RTL homepage as the canary for the statically-flipped layout.
try {
  for (const f of readdirSync(root + "en").sort()) {
    if (f.endsWith(".html")) pages.push("en/" + f);
  }
  pages.push("ar/index.html");
} catch (e) {}

const failures = [];
const captainHeights = {};

const browser = await chromium.launch(executablePath ? { executablePath } : {});
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
// Hermetic run: abort every third-party request (fonts, analytics beacon).
// The gate tests OUR code; external hosts only add flakiness and, in
// sandboxes, hang the page lifecycle for tens of seconds per page.
await context.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());
const page = await context.newPage();
const consoleErrors = [];
page.on("console", (m) => {
  // Only same-origin failures count: external resources (Cloudflare beacon,
  // Google Fonts) are routinely blocked/CORS-refused when the site is served
  // from localhost and say nothing about our code. An external origin can
  // show up either in the message location() (resource errors) or only in
  // the message text (CORS preflight errors located on the page itself).
  if (m.type() !== "error") return;
  const url = (m.location() && m.location().url) || "";
  const text = m.text();
  if (url && !url.startsWith(BASE)) return; // resource error on a third-party URL
  if (/https?:\/\/(?!localhost)[^\s'"]+/.test(text)) return; // text cites a third-party origin
  if (url === "" && /Failed to load resource/.test(text)) return; // URL-less external fetch
  consoleErrors.push(text);
});
page.on("pageerror", (e) => consoleErrors.push(String(e.message)));

for (const file of pages) {
  consoleErrors.length = 0;
  // domcontentloaded, not networkidle: third-party requests (fonts, beacon)
  // hang in sandboxes and would stall the whole run.
  await page.goto(`${BASE}/${file}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(450);

  const captain = await page.evaluate(async () => {
    const img = document.querySelector(".faq-figure img, .faq-topper img");
    if (!img) return null;
    // The Captain images are loading="lazy": scroll them into view and wait
    // for decode so the measured height is the real rendered one.
    img.scrollIntoView({ block: "center" });
    try {
      await img.decode();
    } catch (e) {}
    await new Promise((resolve) => setTimeout(resolve, 120));
    return Math.round(img.getBoundingClientRect().height);
  });
  if (captain !== null) captainHeights[file] = captain;

  // 404.html is deliberately chrome-less (no partials.js footer, no header
  // nav) — the switcher requirement doesn't apply there.
  if (!file.endsWith("404.html")) {
    const hasHeaderSwitch = await page.$(".site-header .lang-switch");
    const hasFooterSwitch = await page.$(".footer-lang-slot .lang-switch");
    if (!hasHeaderSwitch) failures.push(`${file}: missing header language switcher`);
    if (!hasFooterSwitch) failures.push(`${file}: missing footer language switcher`);
  }
  if (consoleErrors.length) {
    failures.push(`${file}: console errors: ${consoleErrors.slice(0, 3).join(" | ")}`);
  }
}

// 1. Captain figures: all equal (±2px), none tiny.
const entries = Object.entries(captainHeights);
if (entries.length) {
  const reference = captainHeights["index.html"] ?? entries[0][1];
  for (const [file, height] of entries) {
    if (Math.abs(height - reference) > 2) {
      failures.push(
        `${file}: FAQ Captain renders at ${height}px but index.html has ${reference}px — shared components must share one size (--captain-faq-h)`
      );
    }
    if (height < 200) {
      failures.push(`${file}: FAQ Captain suspiciously small (${height}px)`);
    }
  }
}

// 4. Spot-check that ?lang= arrivals reach an English page (static redirect
//    to the /en/ sibling, or in-place translation as the fallback).
for (const file of ["index.html", "tarifs.html", "manifeste.html"]) {
  await page.goto(`${BASE}/${file}?lang=en`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  const lang = await page.evaluate(() => document.documentElement.lang);
  if (lang !== "en") failures.push(`${file}?lang=en: html[lang] is "${lang}", translation did not apply`);
}

await browser.close();

if (failures.length) {
  console.error(`UI consistency check FAILED (${failures.length}):`);
  for (const failure of failures) console.error("  - " + failure);
  process.exit(1);
}
console.log(
  `UI consistency OK: ${pages.length} pages, Captain at ${entries[0]?.[1] ?? "n/a"}px everywhere, switchers present, no console errors.`
);
