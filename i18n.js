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
    ar: { label: "العربية", dir: "rtl", locale: "ar", og: "ar_MA" },
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

  // ---------- helpers ----------
  function isLang(code) {
    return !!(code && Object.prototype.hasOwnProperty.call(LANGS, code));
  }

  function readCookie() {
    var m = document.cookie.match(/(?:^|;\s*)cf_lang=([a-z]{2})/);
    return m && isLang(m[1]) ? m[1] : null;
  }

  function writeCookie(code) {
    document.cookie =
      COOKIE + "=" + code + ";max-age=31536000;path=/;SameSite=Lax";
  }

  function fromNavigator() {
    var list = navigator.languages || [navigator.language || ""];
    for (var i = 0; i < list.length; i++) {
      var primary = String(list[i]).toLowerCase().split("-")[0];
      if (isLang(primary)) return primary;
    }
    return null;
  }

  function fromQuery() {
    var m = location.search.match(/[?&]lang=([a-z]{2})/);
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

    var select = document.querySelector(".lang-select");
    if (select) {
      select.value = current;
      select.setAttribute(
        "aria-label",
        t("lang.switch_label", "Choisir la langue")
      );
    }

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
      if (err && code !== DEFAULT_LANG) return; // keep current page language
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

  // ---------- language picker ----------
  function buildSwitcher() {
    var nav = document.querySelector(".site-header .nav");
    if (!nav || nav.querySelector(".lang-select")) return;
    var wrap = document.createElement("div");
    wrap.className = "lang-switch";
    var globe = document.createElement("span");
    globe.className = "lang-globe";
    globe.setAttribute("aria-hidden", "true");
    globe.textContent = "🌐";
    var select = document.createElement("select");
    select.className = "lang-select";
    select.setAttribute("aria-label", "Choisir la langue");
    Object.keys(LANGS).forEach(function (code) {
      var option = document.createElement("option");
      option.value = code;
      option.textContent = LANGS[code].label;
      option.lang = code;
      select.appendChild(option);
    });
    select.value = current;
    select.addEventListener("change", function () {
      setLang(select.value, { user: true });
    });
    wrap.appendChild(globe);
    wrap.appendChild(select);
    nav.appendChild(wrap);
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
  buildSwitcher();
  if (initial !== DEFAULT_LANG) setLang(initial, { user: false });
})();
