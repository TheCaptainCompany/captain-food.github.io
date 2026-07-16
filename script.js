/* =========================================================
   Captain.Food — form validation & submission (no framework)
   - Client-side validation with French messages
   - Submits to Formspree via fetch (async), falls back gracefully
   ========================================================= */

(function () {
  "use strict";

  var form = document.getElementById("pilot-form");
  if (!form) return;

  var statusEl = document.getElementById("form-status");
  var successEl = document.getElementById("form-success");
  // How long the Captain thank-you stays before the form comes back (~2 min).
  var REAPPEAR_MS = 120000;
  var reappearTimer = null;

  // Progressive enhancement: only disable native validation once JS is running,
  // so if JS is unavailable the browser still enforces required fields and the
  // RGPD consent checkbox.
  form.noValidate = true;

  // Fields to validate: id -> validator + error message
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var RULES = [
    { id: "resto", msg: "Indique le nom de ton restaurant ou food truck." },
    { id: "contact", msg: "Dis-nous ton nom." },
    {
      id: "email",
      msg: "Adresse email invalide.",
      test: function (v) {
        return EMAIL_RE.test(v);
      },
    },
    {
      id: "consentement",
      msg: "Tu dois accepter la politique de confidentialité pour continuer.",
      checkbox: true,
    },
  ];

  function fieldValue(el) {
    return el.value ? el.value.trim() : "";
  }

  function showError(rule, el) {
    var errEl = document.getElementById(rule.id + "-error");
    if (errEl) {
      errEl.textContent = rule.msg;
      errEl.hidden = false;
      // Link the error to the field so screen readers announce it on focus.
      el.setAttribute("aria-describedby", rule.id + "-error");
    }
    el.classList.add("invalid");
    el.setAttribute("aria-invalid", "true");
  }

  function clearError(rule, el) {
    var errEl = document.getElementById(rule.id + "-error");
    if (errEl) {
      errEl.hidden = true;
      errEl.textContent = "";
    }
    el.classList.remove("invalid");
    el.removeAttribute("aria-invalid");
    el.removeAttribute("aria-describedby");
  }

  function validateRule(rule) {
    var el = document.getElementById(rule.id);
    if (!el) return true;

    var ok;
    if (rule.checkbox) {
      ok = el.checked;
    } else {
      var val = fieldValue(el);
      if (val === "") {
        ok = false;
      } else if (rule.test) {
        ok = rule.test(val);
      } else {
        ok = true;
      }
    }

    if (ok) {
      clearError(rule, el);
    } else {
      showError(rule, el);
    }
    return ok;
  }

  // Live-clear errors as the user fixes them
  RULES.forEach(function (rule) {
    var el = document.getElementById(rule.id);
    if (!el) return;
    var evt = rule.checkbox || el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(evt, function () {
      if (el.classList.contains("invalid")) validateRule(rule);
    });
  });

  function setStatus(type, message) {
    if (!statusEl) return;
    statusEl.hidden = false;
    statusEl.className = "form-status " + type;
    statusEl.textContent = message;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Validate all; focus the first invalid field.
    var firstInvalid = null;
    var allValid = true;
    RULES.forEach(function (rule) {
      var ok = validateRule(rule);
      if (!ok && allValid) {
        firstInvalid = document.getElementById(rule.id);
      }
      allValid = allValid && ok;
    });

    if (!allValid) {
      setStatus("err", "Corrige les champs signalés ci-dessus.");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    var action = form.getAttribute("action") || "";
    var submitBtn = form.querySelector('button[type="submit"]');

    // Guard: Formspree ID not yet configured.
    if (action.indexOf("PLACEHOLDER_ID") !== -1) {
      setStatus(
        "err",
        "Le formulaire n'est pas encore connecté. Écris-nous à miam@captain.food."
      );
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      // literal "…" is the static fallback; .cf-dots animates it when motion is allowed
      submitBtn.innerHTML = 'Envoi<span class="cf-dots" aria-hidden="true">…</span>';
    }
    setStatus("ok", "Envoi en cours…");

    var data = new FormData(form);

    fetch(action, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          // Swap: hide the form, let the Captain celebrate, bring the form back later.
          if (statusEl) statusEl.hidden = true;
          form.hidden = true;
          if (successEl) {
            successEl.hidden = false;
            successEl.focus(); // move focus for screen readers (role="status" announces)
            if (reappearTimer) clearTimeout(reappearTimer);
            reappearTimer = setTimeout(function () {
              successEl.hidden = true;
              form.hidden = false;
            }, REAPPEAR_MS);
          }
        } else {
          throw new Error("bad response");
        }
      })
      .catch(function () {
        setStatus(
          "err",
          "Oups, l'envoi a échoué. Réessaie ou écris-nous à miam@captain.food."
        );
      })
      .then(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Je rejoins les restaurateurs libres";
        }
      });
  });
})();

/* The Captain's line under the portrait — a different one on each visit. */
(function () {
  "use strict";
  var el = document.getElementById("capitaine-quote");
  if (!el) return;
  var lines = [
    "« Tes plats, tes prix, tes clients. »",
    "« 0 % de commission. Toujours. »",
    "« Ici, c'est toi le capitaine. »",
    "« Reprends la barre de ton affaire. »",
    "« Ta cuisine mérite mieux qu'un péage. »",
    "« Le client est à toi — qu'il le reste. »",
    "« On rame pour les indépendants, pas contre eux. »",
    "« Garde ta marge. On s'occupe du reste. »",
    "« Cuisine. Encaisse. Recommence. »",
  ];
  el.textContent = lines[Math.floor(Math.random() * lines.length)];
})();

/* Commission simulator — pick a platform preset (sets the rate), enter monthly
   revenue, and a dynamic camembert shows where each euro goes: in %, and in
   €/month + €/year per slice. Hands the numbers to the pilot form on click. */
(function () {
  "use strict";
  var root = document.querySelector("[data-calc]");
  if (!root) return;

  var caEl = document.getElementById("calc-ca");
  var punch = root.querySelector("[data-punch]");
  var cta = root.querySelector("[data-calc-cta]");
  var smicEl = root.querySelector("[data-smic]");
  var rateEl = document.getElementById("calc-rate");
  if (!caEl) return;

  var rate = 30; // active commission rate (from the selected platform preset)
  // Employer cost of a full-time SMIC, 2026 (SMIC brut 1 867,02 € + residual
  // employer charges after réduction générale). Source: service-public.gouv.fr.
  var SMIC_EMPLOYER = 1933;

  var euro = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  function num(el) {
    var v = parseFloat(String(el.value).replace(",", "."));
    return isFinite(v) && v > 0 ? v : 0;
  }
  // The commission rate is driven by the editable field (presets just fill it).
  function currentRate() {
    if (!rateEl) return rate;
    var v = parseFloat(String(rateEl.value).replace(",", "."));
    if (!isFinite(v) || v < 0) v = 0;
    if (v > 100) v = 100;
    return v;
  }

  function compute() {
    var ca = num(caEl);
    var comm = currentRate();

    var commMonth = (ca * comm) / 100;
    if (ca > 0) {
      punch.innerHTML =
        "Cette plateforme te prend <strong>" + euro.format(commMonth) +
        " / mois</strong>, soit <strong>" + euro.format(commMonth * 12) +
        " / an</strong> — souvent plus que toute ta marge.";
    } else {
      punch.textContent = "Entre ton chiffre d'affaires mensuel pour voir le calcul.";
    }

    if (smicEl) {
      if (ca > 0) {
        var nb = commMonth / SMIC_EMPLOYER;
        smicEl.innerHTML =
          "💡 Soit ≈ <strong>" +
          nb.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) +
          " SMIC brut employeur</strong>, chaque mois.";
      } else {
        smicEl.textContent = "";
      }
    }
  }

  function setActivePreset(activeBtn) {
    Array.prototype.forEach.call(root.querySelectorAll(".calc-plat"), function (b) {
      var on = b === activeBtn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }
  // Highlight the preset whose rate matches the field — or none if it's custom.
  function syncPresetToRate() {
    var v = currentRate();
    var match = null;
    Array.prototype.forEach.call(root.querySelectorAll(".calc-plat"), function (b) {
      if (parseFloat(b.getAttribute("data-rate")) === v) match = b;
    });
    setActivePreset(match);
  }

  // Presets just fill the editable rate field, then recompute.
  Array.prototype.forEach.call(root.querySelectorAll(".calc-plat"), function (btn) {
    btn.addEventListener("click", function () {
      if (rateEl) rateEl.value = btn.getAttribute("data-rate");
      rate = currentRate();
      setActivePreset(btn);
      compute();
    });
  });

  if (rateEl) {
    rateEl.addEventListener("input", function () {
      rate = currentRate();
      syncPresetToRate();
      compute();
    });
  }

  caEl.addEventListener("input", compute);

  if (cta) {
    cta.addEventListener("click", function () {
      var srcField = document.getElementById("lead-source");
      if (srcField) srcField.value = "calculateur";
      var mot = document.getElementById("mot");
      var ca = num(caEl);
      var commMonth = (ca * rate) / 100;
      if (mot && commMonth > 0 && !mot.value.trim()) {
        mot.value =
          "Via le calculateur : CA " + euro.format(ca) + "/mois sur la plateforme, " +
          "commission ~" + rate + " % = " + euro.format(commMonth) + "/mois (" +
          euro.format(commMonth * 12) + "/an).";
      }
    });
  }

  compute();
})();

/* Reading-progress bar — fills as the page scrolls (rAF, GPU transform). */
(function () {
  "use strict";
  var bar = document.querySelector(".read-progress > span");
  if (!bar) return;
  var ticking = false;
  function update() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var ratio = max > 0 ? h.scrollTop / max : 0;
    ratio = ratio < 0 ? 0 : ratio > 1 ? 1 : ratio;
    bar.style.transform = "scaleX(" + ratio + ")";
    ticking = false;
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
})();

/* Accessibility: when an in-page anchor is clicked, move focus to the target
   section so keyboard and screen-reader users continue from there (not the top). */
(function () {
  "use strict";
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    window.setTimeout(function () {
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }, 0);
  });
})();

/* Scrollspy: highlight the chip of the section currently in view, and scroll the
   chip bar so the active chip stays visible (helps orientation, esp. on mobile). */
(function () {
  "use strict";
  var nav = document.querySelector(".chip-nav-inner");
  if (!nav) return;

  var items = Array.prototype.slice
    .call(nav.querySelectorAll(".chip"))
    .map(function (chip) {
      var id = (chip.getAttribute("href") || "").slice(1);
      return { chip: chip, section: id ? document.getElementById(id) : null };
    })
    .filter(function (it) {
      return it.section;
    });
  if (!items.length) return;
  // Order by document position so highlighting is correct even if the chips
  // are displayed in a different order than the sections appear on the page.
  items.sort(function (a, b) {
    return (
      a.section.getBoundingClientRect().top - b.section.getBoundingClientRect().top
    );
  });

  var header = document.querySelector(".site-header");
  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var current = -2;
  var ticking = false;

  function centerChip(chip) {
    var navRect = nav.getBoundingClientRect();
    var chipRect = chip.getBoundingClientRect();
    var within = chipRect.left - navRect.left + nav.scrollLeft;
    var target = within - nav.clientWidth / 2 + chipRect.width / 2;
    if (target < 0) target = 0;
    if (nav.scrollTo) {
      nav.scrollTo({ left: target, behavior: reduce ? "auto" : "smooth" });
    } else {
      nav.scrollLeft = target;
    }
  }

  function update() {
    ticking = false;
    var line = (header ? header.offsetHeight : 0) + 24;
    var active = -1;
    for (var i = 0; i < items.length; i++) {
      if (items[i].section.getBoundingClientRect().top - line <= 0) active = i;
    }
    // At the very bottom of the page, force the last chip active.
    var doc = document.documentElement;
    if (window.innerHeight + window.scrollY >= doc.scrollHeight - 2) {
      active = items.length - 1;
    }
    if (active === current) return;
    current = active;
    items.forEach(function (it, idx) {
      var on = idx === active;
      it.chip.classList.toggle("is-active", on);
      if (on) it.chip.setAttribute("aria-current", "true");
      else it.chip.removeAttribute("aria-current");
    });
    if (active >= 0) centerChip(items[active].chip);
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
})();

/* Return-to-scroll: leaving the homepage for a sub-page and then coming back via
   "Retour à l'accueil" lands you where you were, not at the top. Homepage only. */
(function () {
  "use strict";
  var path = location.pathname;
  var isHome = path === "/" || /\/index\.html$/.test(path);
  if (!isHome) return;
  var KEY = "cf-home-scroll";

  // Remember the scroll position whenever we leave the homepage.
  window.addEventListener("pagehide", function () {
    try { sessionStorage.setItem(KEY, String(window.scrollY || window.pageYOffset || 0)); } catch (e) {}
  });

  // On arrival, restore only when we came back from a same-origin sub-page,
  // and only if the URL isn't already targeting a section (#hash wins).
  if (location.hash) return;
  var ref = document.referrer;
  if (!ref || ref.indexOf(location.origin) !== 0) return;
  var refPath = ref.slice(location.origin.length).replace(/[?#].*$/, "");
  var backFromSubPage = refPath && refPath !== "/" && !/\/index\.html$/.test(refPath);
  if (!backFromSubPage) return;
  try {
    var y = sessionStorage.getItem(KEY);
    if (y !== null) {
      var top = parseInt(y, 10) || 0;
      // Force an instant jump (the site sets scroll-behavior: smooth globally,
      // which would otherwise animate the restore from the top of the page).
      var html = document.documentElement;
      var prev = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, top);
      html.style.scrollBehavior = prev;
    }
  } catch (e) {}
})();

/* Clickable cards: an element with [data-href] navigates on click/Enter,
   except when the click lands on an inner link or button. */
(function () {
  "use strict";
  var cards = document.querySelectorAll("[data-href]");
  Array.prototype.forEach.call(cards, function (card) {
    var url = card.getAttribute("data-href");
    if (!url) return;
    card.addEventListener("click", function (e) {
      if (e.target.closest("a, button")) return;
      window.location.href = url;
    });
    card.addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && !e.target.closest("a, button")) {
        e.preventDefault();
        window.location.href = url;
      }
    });
  });
})();
