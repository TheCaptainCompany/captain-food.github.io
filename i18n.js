/* =========================================================
   Captain.Food — client-side i18n runtime (no framework)

   The page is authored in French (the canonical, indexed content).
   This script translates it in place for the other supported
   languages, using the generated catalogs in /i18n/generated/
   (source of truth: /i18n/translations.yaml, validated + built by
   tools/i18n/i18n.py — every key must exist in every language).

   Language resolution order:
     1. ?lang= query parameter (also what the hreflang alternates use)
     2. the cf_lang cookie (set ONLY after explicit user consent)
     3. sessionStorage (user switched but declined the cookie)
     4. the browser's languages (navigator.languages)
     5. French

   Persistence is opt-in: switching language via the picker asks the
   visitor whether to remember the choice; only "yes" sets the cookie
   (1 year, SameSite=Lax, first-party, no tracking). Auto-detection
   from the browser never writes anything.

   RTL: Arabic and Hebrew flip the document via <html dir="rtl">;
   layout tweaks live under [dir="rtl"] rules in styles.css.
   ========================================================= */
(function () {
  "use strict";

  var LANGS = {
    fr: { label: "Français", dir: "ltr", locale: "fr-FR", og: "fr_FR" },
    en: { label: "English", dir: "ltr", locale: "en-GB", og: "en_GB" },
    es: { label: "Español", dir: "ltr", locale: "es-ES", og: "es_ES" },
    it: { label: "Italiano", dir: "ltr", locale: "it-IT", og: "it_IT" },
    pt: { label: "Português", dir: "ltr", locale: "pt-PT", og: "pt_PT" },
    de: { label: "Deutsch", dir: "ltr", locale: "de-DE", og: "de_DE" },
    tr: { label: "Türkçe", dir: "ltr", locale: "tr-TR", og: "tr_TR" },
    el: { label: "Ελληνικά", dir: "ltr", locale: "el-GR", og: "el_GR" },
    ro: { label: "Română", dir: "ltr", locale: "ro-RO", og: "ro_RO" },
    zh: { label: "中文", dir: "ltr", locale: "zh-CN", og: "zh_CN" },
    ja: { label: "日本語", dir: "ltr", locale: "ja-JP", og: "ja_JP" },
    th: { label: "ไทย", dir: "ltr", locale: "th-TH", og: "th_TH" },
    hi: { label: "हिन्दी", dir: "ltr", locale: "hi-IN", og: "hi_IN" },
    ta: { label: "தமிழ்", dir: "ltr", locale: "ta", og: "ta_IN" },
    ar: { label: "العربية", dir: "rtl", locale: "ar", og: "ar_MA" },
    "ar-lb": { label: "عربي لبناني", dir: "rtl", locale: "ar-LB", og: "ar_LB" },
    he: { label: "עברית", dir: "rtl", locale: "he", og: "he_IL" }
  };
  var DEFAULT_LANG = "fr";
  var COOKIE = "cf_lang";
  var SESSION_LANG = "cf-lang-session";
  var SESSION_DECLINED = "cf-lang-cookie-declined";

  var current = DEFAULT_LANG;
  var strings = null; // active dict (null when French — the page itself)
  var cache = {}; // lang -> dict
  var originals = null; // snapshot of the French DOM values

  // Inline SVG flags (self-contained — no external requests, and emoji flags
  // don't render on Windows). Simplified civil flags. Languages spanning
  // several countries show several flags: standard Arabic groups the Maghreb
  // (Algeria + Tunisia + Morocco — same written MSA), Tamil shows India +
  // Sri Lanka. Lebanese Arabic is its own entry with the Lebanese flag.
  function flagSvg(body) {
    return (
      '<svg class="lang-flag" viewBox="0 0 3 2" aria-hidden="true" focusable="false">' +
      body +
      "</svg>"
    );
  }
  var FLAGS = {
    fr: flagSvg('<rect width="3" height="2" fill="#fff"/><rect width="1" height="2" fill="#0055A4"/><rect x="2" width="1" height="2" fill="#EF4135"/>'),
    en: flagSvg('<rect width="3" height="2" fill="#012169"/><path d="M0,0 3,2 M3,0 0,2" stroke="#fff" stroke-width=".45"/><path d="M1.5,0 V2 M0,1 H3" stroke="#fff" stroke-width=".75"/><path d="M1.5,0 V2 M0,1 H3" stroke="#C8102E" stroke-width=".45"/>'),
    es: flagSvg('<rect width="3" height="2" fill="#AA151B"/><rect y=".5" width="3" height="1" fill="#F1BF00"/>'),
    it: flagSvg('<rect width="3" height="2" fill="#fff"/><rect width="1" height="2" fill="#009246"/><rect x="2" width="1" height="2" fill="#CE2B37"/>'),
    pt: flagSvg('<rect width="3" height="2" fill="#DA291C"/><rect width="1.2" height="2" fill="#046A38"/><circle cx="1.2" cy="1" r=".38" fill="#FFE900"/><circle cx="1.2" cy="1" r=".22" fill="#DA291C"/>'),
    de: flagSvg('<rect width="3" height="2" fill="#000"/><rect y=".667" width="3" height="1.333" fill="#D00"/><rect y="1.333" width="3" height=".667" fill="#FFCE00"/>'),
    tr: flagSvg('<rect width="3" height="2" fill="#E30A17"/><circle cx="1.2" cy="1" r=".5" fill="#fff"/><circle cx="1.32" cy="1" r=".4" fill="#E30A17"/><polygon fill="#fff" points="2.1,1 1.893,.932 1.893,.715 1.764,.891 1.557,.824 1.685,1 1.557,1.176 1.764,1.109 1.893,1.285 1.893,1.068"/>'),
    el: flagSvg('<rect width="3" height="2" fill="#0D5EAF"/><path d="M0,.333H3M0,.778H3M0,1.222H3M0,1.667H3" stroke="#fff" stroke-width=".222"/><rect width="1" height="1.111" fill="#0D5EAF"/><path d="M.5,0 V1.111 M0,.556 H1" stroke="#fff" stroke-width=".222"/>'),
    ar:
      // Algeria + Tunisia + Morocco — one written Arabic, three flags.
      flagSvg('<rect width="3" height="2" fill="#fff"/><rect width="1.5" height="2" fill="#006233"/><path fill="#D21034" d="M1.62,.45 A.55,.55 0 1,0 1.62,1.55 A.68,.68 0 1,1 1.62,.45 Z"/><polygon fill="#D21034" points="1.98,1 1.75,1.08 1.8,.85 1.62,.7 1.86,.68 1.95,.45 2.04,.68 2.28,.7 2.1,.85 2.15,1.08"/>') +
      flagSvg('<rect width="3" height="2" fill="#E70013"/><circle cx="1.5" cy="1" r=".62" fill="#fff"/><path fill="#E70013" d="M1.62,.52 A.5,.5 0 1,0 1.62,1.48 A.6,.6 0 1,1 1.62,.52 Z"/><polygon fill="#E70013" points="1.92,1 1.7,1.08 1.75,.86 1.58,.72 1.8,.7 1.89,.48 1.98,.7 2.2,.72 2.03,.86 2.08,1.08"/>') +
      flagSvg('<rect width="3" height="2" fill="#C1272D"/><path fill="none" stroke="#006233" stroke-width=".1" d="M1.5,.55 1.236,1.364 1.928,.861 1.072,.861 1.764,1.364 Z"/>'),
    ta:
      // Tamil spans India and Sri Lanka.
      flagSvg('<rect width="3" height="2" fill="#FF9933"/><rect y=".667" width="3" height=".666" fill="#fff"/><rect y="1.333" width="3" height=".667" fill="#138808"/><circle cx="1.5" cy="1" r=".26" fill="none" stroke="#000080" stroke-width=".07"/><circle cx="1.5" cy="1" r=".05" fill="#000080"/>') +
      flagSvg('<rect width="3" height="2" fill="#FFB700"/><rect x=".16" y=".16" width=".55" height="1.68" fill="#00534E"/><rect x=".75" y=".16" width=".55" height="1.68" fill="#FF7900"/><rect x="1.44" y=".16" width="1.4" height="1.68" fill="#8D153A"/>'),
    he: flagSvg('<rect width="3" height="2" fill="#fff"/><rect y=".22" width="3" height=".26" fill="#0038B8"/><rect y="1.52" width="3" height=".26" fill="#0038B8"/><path fill="none" stroke="#0038B8" stroke-width=".1" d="M1.5,.6 1.85,1.2 1.15,1.2 Z M1.5,1.4 1.15,.8 1.85,.8 Z"/>'),
    ro: flagSvg('<rect width="3" height="2" fill="#FCD116"/><rect width="1" height="2" fill="#002B7F"/><rect x="2" width="1" height="2" fill="#CE1126"/>'),
    zh: flagSvg('<rect width="3" height="2" fill="#EE1C25"/><polygon fill="#FFFF00" points=".6,.26 .676,.495 .923,.495 .724,.64 .8,.875 .6,.73 .4,.875 .476,.64 .277,.495 .524,.495"/>'),
    ja: flagSvg('<rect width="3" height="2" fill="#fff"/><circle cx="1.5" cy="1" r=".55" fill="#BC002D"/>'),
    th: flagSvg('<rect width="3" height="2" fill="#A51931"/><rect y=".333" width="3" height="1.334" fill="#F4F5F8"/><rect y=".667" width="3" height=".666" fill="#2D2A4A"/>'),
    hi: flagSvg('<rect width="3" height="2" fill="#FF9933"/><rect y=".667" width="3" height=".666" fill="#fff"/><rect y="1.333" width="3" height=".667" fill="#138808"/><circle cx="1.5" cy="1" r=".26" fill="none" stroke="#000080" stroke-width=".07"/><circle cx="1.5" cy="1" r=".05" fill="#000080"/>'),
    "ar-lb": flagSvg('<rect width="3" height="2" fill="#fff"/><rect width="3" height=".5" fill="#ED1C24"/><rect y="1.5" width="3" height=".5" fill="#ED1C24"/><path fill="#00A651" d="M1.5,.6 1.82,1.14 1.62,1.14 1.62,1.36 1.38,1.36 1.38,1.14 1.18,1.14 Z"/>')
  };

  // ---------- helpers ----------
  function isLang(code) {
    return !!(code && Object.prototype.hasOwnProperty.call(LANGS, code));
  }

  function readCookie() {
    var m = document.cookie.match(/(?:^|;\s*)cf_lang=([a-z]{2}(?:-[a-z]{2})?)/);
    return m && isLang(m[1]) ? m[1] : null;
  }

  function writeCookie(code) {
    document.cookie =
      COOKIE + "=" + code + ";max-age=31536000;path=/;SameSite=Lax";
  }

  function fromNavigator() {
    var list = navigator.languages || [navigator.language || ""];
    for (var i = 0; i < list.length; i++) {
      var tag = String(list[i]).toLowerCase();
      if (isLang(tag)) return tag; // exact regional match (e.g. ar-lb)
      var primary = tag.split("-")[0];
      if (isLang(primary)) return primary;
    }
    return null;
  }

  function fromQuery() {
    var m = location.search.match(/[?&]lang=([a-z]{2}(?:-[a-z]{2})?)/);
    return m && isLang(m[1]) ? m[1] : null;
  }

  function fromSession() {
    try {
      var v = sessionStorage.getItem(SESSION_LANG);
      return isLang(v) ? v : null;
    } catch (e) {
      return null;
    }
  }

  function interpolate(text, params) {
    if (!params) return text;
    return text.replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g, function (all, name) {
      return Object.prototype.hasOwnProperty.call(params, name)
        ? params[name]
        : all;
    });
  }

  // ---------- DOM application ----------
  var ATTR_MAP = [
    ["data-i18n-aria-label", "aria-label"],
    ["data-i18n-alt", "alt"],
    ["data-i18n-content", "content"],
    ["data-i18n-placeholder", "placeholder"]
  ];

  function snapshot() {
    // Remember the authored French values so switching back to fr (or a
    // missing key) restores the page exactly. Re-run for late-injected
    // nodes (shared footer, WhatsApp hint) — only unseen nodes are added.
    originals = originals || [];
    var seen = function (el) {
      return el.__cfI18n;
    };
    var all = document.querySelectorAll(
      "[data-i18n],[data-i18n-html],[" +
        ATTR_MAP.map(function (p) {
          return p[0];
        }).join("],[") +
        "]"
    );
    Array.prototype.forEach.call(all, function (el) {
      if (seen(el)) return;
      var record = { el: el, attrs: {} };
      if (el.hasAttribute("data-i18n")) record.text = el.textContent;
      if (el.hasAttribute("data-i18n-html")) record.html = el.innerHTML;
      ATTR_MAP.forEach(function (pair) {
        if (el.hasAttribute(pair[0])) record.attrs[pair[1]] = el.getAttribute(pair[1]);
      });
      el.__cfI18n = record;
      originals.push(record);
    });
  }

  function applyDom() {
    snapshot();
    var dict = strings;
    originals.forEach(function (record) {
      var el = record.el;
      if (!el.isConnected) return;
      if ("text" in record) {
        var key = el.getAttribute("data-i18n");
        el.textContent = dict && dict[key] ? dict[key] : record.text;
      }
      if ("html" in record) {
        var hkey = el.getAttribute("data-i18n-html");
        el.innerHTML = dict && dict[hkey] ? dict[hkey] : record.html;
      }
      ATTR_MAP.forEach(function (pair) {
        if (pair[1] in record.attrs) {
          var akey = el.getAttribute(pair[0]);
          el.setAttribute(
            pair[1],
            dict && dict[akey] ? dict[akey] : record.attrs[pair[1]]
          );
        }
      });
    });

    var html = document.documentElement;
    html.lang = current;
    html.dir = LANGS[current].dir;

    var og = document.querySelector('meta[property="og:locale"]');
    if (og) og.setAttribute("content", LANGS[current].og);

    updateSwitcher();

    document.dispatchEvent(
      new CustomEvent("cf:lang", { detail: { lang: current } })
    );
  }

  function load(code, done) {
    if (code === DEFAULT_LANG) return done(null);
    if (cache[code]) return done(cache[code]);
    fetch("/i18n/generated/" + code + ".json")
      .then(function (res) {
        if (!res.ok) throw new Error("i18n catalog " + code + ": " + res.status);
        return res.json();
      })
      .then(function (data) {
        cache[code] = data.strings || {};
        done(cache[code]);
      })
      .catch(function (err) {
        if (window.console) console.warn(err);
        done(null, err);
      });
  }

  function syncUrl() {
    if (!window.history || !history.replaceState) return;
    try {
      var url = new URL(location.href);
      if (current === DEFAULT_LANG) url.searchParams.delete("lang");
      else url.searchParams.set("lang", current);
      history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch (e) {}
  }

  function setLang(code, opts) {
    opts = opts || {};
    if (!isLang(code)) code = DEFAULT_LANG;
    load(code, function (dict, err) {
      if (err && code !== DEFAULT_LANG) {
        // Catalog unavailable — keep the page language and snap the picker
        // back so the UI never claims a language it could not load.
        updateSwitcher();
        return;
      }
      current = code;
      strings = dict;
      applyDom();
      syncUrl();
      try {
        sessionStorage.setItem(SESSION_LANG, code);
      } catch (e) {}
      if (opts.user) persist(code);
    });
  }

  // ---------- opt-in persistence (cookie consent) ----------
  function persist(code) {
    if (readCookie() !== null) {
      writeCookie(code); // consent already given earlier — keep it fresh
      return;
    }
    var declined = false;
    try {
      declined = !!sessionStorage.getItem(SESSION_DECLINED);
    } catch (e) {}
    if (declined) return; // asked this session already — session-only memory
    showConsent(code);
  }

  function showConsent(code) {
    removeConsent();
    var box = document.createElement("div");
    box.className = "lang-consent";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-live", "polite");

    var text = document.createElement("p");
    text.className = "lang-consent-text";
    text.textContent = t(
      "lang.consent_text",
      "On retient ta langue pour tes prochaines visites ? Ça dépose un petit cookie — rien d'autre, promis."
    );

    var buttons = document.createElement("div");
    buttons.className = "lang-consent-btns";

    var accept = document.createElement("button");
    accept.type = "button";
    accept.className = "btn btn-primary btn-sm";
    accept.textContent = t("lang.consent_accept", "Oui, retenir ma langue");
    accept.addEventListener("click", function () {
      writeCookie(code);
      removeConsent();
    });

    var decline = document.createElement("button");
    decline.type = "button";
    decline.className = "btn btn-ghost btn-sm";
    decline.textContent = t("lang.consent_decline", "Non merci");
    decline.addEventListener("click", function () {
      try {
        sessionStorage.setItem(SESSION_DECLINED, "1");
      } catch (e) {}
      removeConsent();
    });

    buttons.appendChild(accept);
    buttons.appendChild(decline);
    box.appendChild(text);
    box.appendChild(buttons);
    document.body.appendChild(box);
  }

  function removeConsent() {
    var existing = document.querySelector(".lang-consent");
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
  }

  // ---------- language pickers (custom listbox: flags + selected state) ----------
  // A native <select> cannot render flag images (and emoji flags do not render
  // on Windows), so this is a small ARIA listbox: a button showing the current
  // flag + name, a popup listing every language with its flag, and a checkmark
  // on the active one. Keyboard: Enter/Space/arrows open & navigate, Esc closes.
  // Instantiated twice: header nav (drops down) and footer slot (drops up).
  var switchers = []; // [{ button, label, flag, menu, options }]
  var flagChips = []; // [{ el, code }] — FAQ flag rows ([data-lang-flags])

  // Hover tooltip for a language entry: its name in French, in English and in
  // the CURRENT page language — via the browser's Intl.DisplayNames, so no
  // 17x17 name matrix has to live in the catalog. Falls back to the endonym.
  function langTooltip(code) {
    var names = [];
    try {
      ["fr", "en", LANGS[current].locale].forEach(function (loc) {
        var name = new Intl.DisplayNames([loc], { type: "language" }).of(code);
        if (!name) return;
        name = name.charAt(0).toUpperCase() + name.slice(1);
        if (names.indexOf(name) === -1) names.push(name);
      });
    } catch (e) {}
    var endonym = LANGS[code].label;
    if (names.indexOf(endonym) === -1) names.push(endonym);
    return names.join(" · ");
  }

  function updateSwitcher() {
    switchers.forEach(function (sw) {
      sw.flag.innerHTML = FLAGS[current] || "";
      sw.label.textContent = LANGS[current].label;
      sw.button.setAttribute(
        "aria-label",
        t("lang.switch_label", "Choisir la langue") + " — " + LANGS[current].label
      );
      sw.options.forEach(function (option) {
        var code = option.getAttribute("data-lang");
        option.setAttribute("aria-selected", code === current ? "true" : "false");
        option.title = langTooltip(code);
      });
    });
    flagChips.forEach(function (chip) {
      var tooltip = langTooltip(chip.code);
      chip.el.title = tooltip;
      chip.el.setAttribute("aria-label", tooltip);
    });
  }

  // FAQ "how many languages" flag rows: one chip per language (multi-flag
  // languages keep all their flags in one chip), tooltip + aria-label each.
  function fillFlagRows() {
    var rows = document.querySelectorAll("[data-lang-flags]");
    Array.prototype.forEach.call(rows, function (row) {
      if (row.childNodes.length) return;
      Object.keys(LANGS).forEach(function (code) {
        var chip = document.createElement("span");
        chip.className = "faq-flag";
        chip.setAttribute("role", "img");
        chip.innerHTML = FLAGS[code] || "";
        row.appendChild(chip);
        flagChips.push({ el: chip, code: code });
      });
    });
  }

  function createSwitcher(parent, dropUp) {
    var wrap = document.createElement("div");
    wrap.className = "lang-switch" + (dropUp ? " lang-switch--up" : "");

    var button = document.createElement("button");
    button.type = "button";
    button.className = "lang-btn";
    button.setAttribute("aria-haspopup", "listbox");
    button.setAttribute("aria-expanded", "false");
    var flag = document.createElement("span");
    flag.className = "lang-btn-flag";
    var label = document.createElement("span");
    label.className = "lang-btn-label";
    var caret = document.createElement("span");
    caret.className = "lang-caret";
    caret.setAttribute("aria-hidden", "true");
    button.appendChild(flag);
    button.appendChild(label);
    button.appendChild(caret);

    var menu = document.createElement("ul");
    menu.className = "lang-menu";
    menu.setAttribute("role", "listbox");
    menu.hidden = true;

    function closeMenu(refocus) {
      menu.hidden = true;
      button.setAttribute("aria-expanded", "false");
      if (refocus) button.focus();
    }
    function openMenu() {
      menu.hidden = false;
      button.setAttribute("aria-expanded", "true");
      var active =
        menu.querySelector('[aria-selected="true"]') || options[0];
      if (active) active.focus();
    }

    var options = Object.keys(LANGS).map(function (code) {
      var item = document.createElement("li");
      item.setAttribute("role", "option");
      item.setAttribute("data-lang", code);
      item.setAttribute("aria-selected", "false");
      item.tabIndex = -1;
      item.lang = code;
      item.innerHTML = FLAGS[code];
      var name = document.createElement("span");
      name.className = "lang-name";
      name.textContent = LANGS[code].label;
      var check = document.createElement("span");
      check.className = "lang-check";
      check.setAttribute("aria-hidden", "true");
      check.textContent = "✓";
      item.appendChild(name);
      item.appendChild(check);
      item.addEventListener("click", function () {
        closeMenu(true);
        setLang(code, { user: true });
      });
      menu.appendChild(item);
      return item;
    });

    button.addEventListener("click", function () {
      if (menu.hidden) openMenu();
      else closeMenu(false);
    });
    wrap.addEventListener("keydown", function (e) {
      var idx = options.indexOf(document.activeElement);
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu(true);
      } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (menu.hidden) return openMenu();
        var next = e.key === "ArrowDown" ? idx + 1 : idx - 1;
        next = (next + options.length) % options.length;
        options[next].focus();
      } else if ((e.key === "Enter" || e.key === " ") && idx >= 0) {
        e.preventDefault();
        options[idx].click();
      }
    });
    document.addEventListener("click", function (e) {
      if (!menu.hidden && !wrap.contains(e.target)) closeMenu(false);
    });

    wrap.appendChild(button);
    wrap.appendChild(menu);
    parent.appendChild(wrap);
    switchers.push({ button: button, label: label, flag: flag, menu: menu, options: options });
  }

  function buildSwitchers() {
    var nav = document.querySelector(".site-header .nav");
    if (nav && !nav.querySelector(".lang-switch")) createSwitcher(nav, false);
    // Footer slot(s), injected by partials.js before this script runs.
    var slots = document.querySelectorAll("[data-lang-slot]");
    Array.prototype.forEach.call(slots, function (slot) {
      if (!slot.querySelector(".lang-switch")) createSwitcher(slot, true);
    });
    fillFlagRows();
    updateSwitcher();
  }

  // ---------- public API (used by script.js for dynamic strings) ----------
  function t(key, fallback, params) {
    var text = (strings && strings[key]) || fallback || key;
    return interpolate(text, params);
  }

  window.CF_I18N = {
    t: t,
    lang: function () {
      return current;
    },
    locale: function () {
      return LANGS[current].locale;
    },
    dir: function () {
      return LANGS[current].dir;
    },
    setLang: function (code) {
      setLang(code, { user: true });
    }
  };

  // ---------- boot ----------
  var initial =
    fromQuery() || readCookie() || fromSession() || fromNavigator() || DEFAULT_LANG;
  buildSwitchers();
  if (initial !== DEFAULT_LANG) setLang(initial, { user: false });
})();
