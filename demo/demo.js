/* Captain.Food — maquettes /demo : comportements partagés.
   Une seule source pour (1) le gate d'avertissement et (2) le formulaire
   de participation communautaire (envoi AJAX vers Formspree). Chaque
   maquette n'a plus à dupliquer ce code. Aucune dépendance externe. */
(function () {
  "use strict";

  /* ---- Gate d'avertissement (maquette) ---- */
  function initGate() {
    var g = document.getElementById("demoGate");
    if (!g) return;
    var b = document.getElementById("demoGateBtn");

    function close() {
      g.classList.add("hidden");
      document.removeEventListener("keydown", onKey);
      try { sessionStorage.setItem("cf-demo-gate", "ok"); } catch (e) {}
    }
    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "Tab") { e.preventDefault(); if (b) b.focus(); } // piège le focus sur l'unique bouton
    }

    try {
      if (sessionStorage.getItem("cf-demo-gate") === "ok") { g.classList.add("hidden"); return; }
    } catch (e) {}

    if (b) b.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    try { if (b) b.focus(); } catch (e) {}
  }

  /* ---- Formulaire de participation (AJAX Formspree) ---- */
  function initForms() {
    Array.prototype.forEach.call(document.querySelectorAll(".cf-form"), function (f) {
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        var s = f.querySelector(".cf-status");
        var b = f.querySelector("button[type=submit]");
        if (s) { s.hidden = false; s.className = "cf-status"; s.textContent = "Envoi…"; }
        if (b) b.disabled = true;
        fetch(f.action, { method: "POST", body: new FormData(f), headers: { Accept: "application/json" } })
          .then(function (r) {
            if (b) b.disabled = false;
            if (!s) return;
            if (r.ok) { f.reset(); s.className = "cf-status ok"; s.textContent = "Merci ⚓ Ton retour est bien parti !"; }
            else { s.className = "cf-status err"; s.textContent = "Envoi impossible pour l'instant. Passe plutôt par WhatsApp ci-dessus."; }
          })
          .catch(function () {
            if (b) b.disabled = false;
            if (!s) return;
            s.className = "cf-status err"; s.textContent = "Envoi impossible pour l'instant. Passe plutôt par WhatsApp ci-dessus.";
          });
      });
    });
  }

  function boot() { initGate(); initForms(); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
