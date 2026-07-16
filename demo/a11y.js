/* Captain.Food — maquettes /demo : accessibilité clavier.
   Les prototypes pilotent l'UI via onclick sur des <div>/<span>. Ce script rend
   chacun de ces contrôles opérable au clavier (Tab pour le focus, Entrée/Espace
   pour activer), l'annonce comme un bouton, et garde un anneau de focus visible.
   Il ignore les conteneurs qui contiennent déjà un contrôle natif (pour ne pas
   imbriquer deux éléments interactifs). Aucune dépendance au CSS de la page. */
(function () {
  "use strict";

  // Anneau de focus + utilitaire sr-only, autonomes.
  var style = document.createElement("style");
  style.textContent =
    ".kbd-focusable:focus-visible{outline:3px solid #e8b84b;outline-offset:2px;border-radius:8px}" +
    ".kbd-focusable{-webkit-tap-highlight-color:transparent}" +
    ".sr-only{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}";
  document.head.appendChild(style);

  var NATIVE = "a[href],button,input,select,textarea";

  function onKey(e) {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault(); // évite le scroll sur Espace + double activation
      e.currentTarget.click();
    }
  }

  function enhance() {
    Array.prototype.forEach.call(document.querySelectorAll("[onclick]"), function (el) {
      var tag = el.tagName.toLowerCase();
      if (tag === "a" || tag === "button" || tag === "input") return; // déjà OK au clavier
      if (el.querySelector(NATIVE)) return; // contient un contrôle natif -> ne pas imbriquer
      if (el.getAttribute("aria-hidden") === "true") return; // décoratif
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
      if (!el.hasAttribute("role")) el.setAttribute("role", "button");
      el.classList.add("kbd-focusable");
      el.addEventListener("keydown", onKey);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhance);
  } else {
    enhance();
  }
})();
