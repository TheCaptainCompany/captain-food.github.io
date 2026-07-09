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

  // Progressive enhancement: only disable native validation once JS is running,
  // so if JS is unavailable the browser still enforces required fields and the
  // RGPD consent checkbox.
  form.noValidate = true;

  // Fields to validate: id -> validator + error message
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var RULES = [
    { id: "prenom", msg: "Merci de renseigner votre prénom." },
    { id: "nom", msg: "Merci de renseigner votre nom." },
    { id: "etablissement", msg: "Merci d'indiquer le nom de votre établissement." },
    {
      id: "email",
      msg: "Adresse email invalide.",
      test: function (v) {
        return EMAIL_RE.test(v);
      },
    },
    { id: "ville", msg: "Merci d'indiquer votre ville." },
    { id: "interet", msg: "Merci de préciser votre intérêt pour le pilote." },
    {
      id: "consentement",
      msg: "Vous devez accepter la politique de confidentialité pour continuer.",
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
      setStatus("err", "Merci de corriger les champs signalés ci-dessus.");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    var action = form.getAttribute("action") || "";
    var submitBtn = form.querySelector('button[type="submit"]');

    // Guard: Formspree ID not yet configured.
    if (action.indexOf("PLACEHOLDER_ID") !== -1) {
      setStatus(
        "err",
        "Le formulaire n'est pas encore connecté. Écrivez-nous à miam@captain.food."
      );
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Envoi…";
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
          setStatus(
            "ok",
            "Merci, message bien reçu ⚓ On vous recontacte très vite."
          );
        } else {
          throw new Error("bad response");
        }
      })
      .catch(function () {
        setStatus(
          "err",
          "Oups, l'envoi a échoué. Réessayez ou écrivez-nous à miam@captain.food."
        );
      })
      .then(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Envoyer ma demande";
        }
      });
  });
})();
