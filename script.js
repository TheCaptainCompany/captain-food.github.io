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

/* Sticky mobile CTA: hide it once the form section is on screen (it would be
   redundant there). Progressive enhancement — the bar shows by default. */
(function () {
  "use strict";
  var bar = document.querySelector(".mobile-cta");
  var target = document.getElementById("rejoindre");
  if (!bar || !target || !("IntersectionObserver" in window)) return;

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        bar.classList.toggle("is-hidden", entry.isIntersecting);
      });
    },
    { rootMargin: "0px 0px -40% 0px" }
  );
  io.observe(target);
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

/* Commission calculator — quantify, honestly, what the platforms take.
   Live-updates a monthly/yearly loss estimate from average basket × orders ×
   rate, and hands the numbers to the pilot form when the visitor clicks through
   (source=calculateur + a pre-filled, editable note giving the founder context). */
(function () {
  "use strict";
  var root = document.querySelector("[data-calc]");
  if (!root) return;

  var panierEl = document.getElementById("calc-panier");
  var cmdEl = document.getElementById("calc-commandes");
  var tauxEl = document.getElementById("calc-taux");
  var monthEl = root.querySelector("[data-calc-month]");
  var yearEl = root.querySelector("[data-calc-year]");
  var sentenceEl = root.querySelector("[data-calc-sentence]");
  var cta = root.querySelector("[data-calc-cta]");
  if (!panierEl || !cmdEl || !tauxEl) return;

  var euro = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  function num(el) {
    var v = parseFloat(String(el.value).replace(",", "."));
    return isFinite(v) && v > 0 ? v : 0;
  }

  var monthLoss = 0;
  var yearLoss = 0;

  function compute() {
    monthLoss = num(panierEl) * num(cmdEl) * (num(tauxEl) / 100);
    yearLoss = monthLoss * 12;

    monthEl.textContent = monthLoss > 0 ? euro.format(monthLoss) : "—";
    yearEl.textContent = yearLoss > 0 ? euro.format(yearLoss) : "—";

    if (monthLoss > 0) {
      sentenceEl.textContent =
        "Avec Captain.Food, à 0 % de commission, c'est " +
        euro.format(yearLoss) +
        " que tu gardes sur un an.";
    } else {
      sentenceEl.textContent =
        "Renseigne ton panier moyen et ton nombre de commandes pour voir le montant.";
    }
  }

  [panierEl, cmdEl, tauxEl].forEach(function (el) {
    el.addEventListener("input", compute);
  });

  // On click-through, tag the lead as coming from the calculator and pre-fill
  // the message with the estimate (only if empty — never clobber the visitor).
  if (cta) {
    cta.addEventListener("click", function () {
      var srcField = document.getElementById("lead-source");
      if (srcField) srcField.value = "calculateur";

      var mot = document.getElementById("mot");
      if (mot && monthLoss > 0 && !mot.value.trim()) {
        mot.value =
          "Via le calculateur : je perds environ " +
          euro.format(monthLoss) +
          "/mois (" +
          euro.format(yearLoss) +
          "/an) en commission — panier " +
          euro.format(num(panierEl)) +
          ", " +
          num(cmdEl) +
          " commandes/mois, taux " +
          num(tauxEl) +
          " %.";
      }
      // The anchor's default jump to #rejoindre then carries the visitor down.
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

