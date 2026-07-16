/* =========================================================
   Captain.Food — shared UI partials (single source of truth)
   Injected on every page so the footer + floating chat + mobile
   CTA stay identical everywhere. A <noscript> fallback in each
   page's footer placeholder keeps the key links in static HTML
   for no-JS users and crawlers that don't render JS.
   ========================================================= */
(function () {
  "use strict";

  var WA = "https://wa.me/message/LTDD42WUFXINA1";
  var path = location.pathname;
  var isHome = path === "/" || /\/index\.html$/.test(path);
  var faqHref = isHome ? "#faq" : "/index.html#faq";
  // Section anchors live on the homepage; from other pages, prefix the path.
  var sec = isHome ? "" : "/index.html";

  // Inline brand / type icons — monochrome, inherit the link colour.
  function svg(d) {
    return (
      '<svg class="ic" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">' +
      '<path d="' + d + '"/></svg>'
    );
  }
  var WA_PATH =
    "M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.004c5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.91-9.91-9.91zm0 18.15h-.003c-1.52 0-3.01-.41-4.31-1.18l-.31-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.24-8.23 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43-.14-.01-.31-.01-.48-.01s-.43.06-.66.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.16 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z";
  var ICON = {
    mail: svg("M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"),
    whatsapp: svg(WA_PATH),
    instagram: svg("M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"),
    linkedin: svg("M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"),
    facebook: svg("M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"),
    oc: svg("M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12c2.54 0 4.894-.79 6.834-2.135l-3.107-3.109a7.715 7.715 0 1 1 0-13.512l3.107-3.109A11.943 11.943 0 0 0 12 0zm9.865 5.166l-3.109 3.107A7.67 7.67 0 0 1 19.715 12a7.682 7.682 0 0 1-.959 3.727l3.109 3.107A11.943 11.943 0 0 0 24 12c0-2.54-.79-4.894-2.135-6.834z")
  };

  // ---------- Footer (single source) ----------
  var FOOTER =
    '<div class="container footer-grid">' +
      '<div class="footer-col">' +
        '<p class="footer-brand"><img class="footer-logo" src="/assets/logo.png" alt="" width="30" height="30"><span class="footer-brand-name">Captain<span class="brand-dot">.</span>Food</span></p>' +
        '<p class="footer-tagline"><em>&laquo;&nbsp;Reprenons les commandes&nbsp;!&nbsp;&raquo;</em><br><em>Une alternative locale et solidaire, à Tours.</em></p>' +
        '<ul class="footer-list footer-nav">' +
          '<li><a href="' + sec + '#probleme"><span class="fi" aria-hidden="true">🧭</span> Constat</a></li>' +
          '<li><a href="' + sec + '#combat"><span class="fi" aria-hidden="true">🍴</span> Solution</a></li>' +
          '<li><a href="' + sec + '#solution"><span class="fi" aria-hidden="true">⚙️</span> Comment</a></li>' +
          '<li><a href="' + sec + '#rejoindre"><span class="fi" aria-hidden="true">⚓</span> Rejoindre</a></li>' +
          '<li><a href="' + faqHref + '"><span class="fi" aria-hidden="true">❓</span> FAQ</a></li>' +
          '<li><a href="/manifeste.html"><span class="fi" aria-hidden="true">📜</span> Le manifeste</a></li>' +
          '<li><a href="/financement.html"><span class="fi" aria-hidden="true">🧾</span> Comment on se finance&nbsp;?</a></li>' +
          '<li><a href="/livraison.html"><span class="fi" aria-hidden="true">🛵</span> La livraison, payée juste</a></li>' +
          '<li><a href="https://opencollective.com/captain-food" target="_blank" rel="noopener">' + ICON.oc + ' Nos comptes (Open Collective)</a></li>' +
        '</ul>' +
      '</div>' +
      '<div class="footer-col">' +
        '<h2 class="footer-h">Contact</h2>' +
        '<ul class="footer-list footer-contact">' +
          '<li><a href="mailto:miam@captain.food">' + ICON.mail + ' miam@captain.food</a></li>' +
          '<li><a href="' + WA + '" target="_blank" rel="noopener">' + ICON.whatsapp + ' Chat direct avec Captain.Food</a></li>' +
          '<li><a href="https://community.captain.food" target="_blank" rel="noopener">' + ICON.whatsapp + ' Communauté WhatsApp</a></li>' +
          '<li><a href="https://www.instagram.com/captain.food__" target="_blank" rel="noopener">' + ICON.instagram + ' Instagram</a></li>' +
          '<li><a href="https://www.linkedin.com/company/captain-food-coop/" target="_blank" rel="noopener">' + ICON.linkedin + ' LinkedIn</a></li>' +
          '<li><a href="https://facebook.com/captain.food.coop" target="_blank" rel="noopener">' + ICON.facebook + ' Facebook</a></li>' +
        '</ul>' +
      '</div>' +
      '<div class="footer-col">' +
        '<h2 class="footer-h">Autour de Tours</h2>' +
        '<ul class="footer-list">' +
          '<li><a href="/alternative-uber-eats-tours.html">Alternative à Uber Eats</a></li>' +
          '<li><a href="/alternative-deliveroo-tours.html">Alternative à Deliveroo</a></li>' +
          '<li><a href="/restaurant-sans-commission-tours.html">Restaurant sans commission</a></li>' +
          '<li><a href="/commande-en-ligne-restaurant-tours.html">Commande en ligne</a></li>' +
          '<li><a href="/click-and-collect-tours.html">Click and collect</a></li>' +
          '<li><a href="/livraison-ethique-tours.html">Livraison éthique</a></li>' +
          '<li><a href="/restaurants-tours-indre-et-loire.html">Tours &amp; Indre-et-Loire</a></li>' +
        '</ul>' +
      '</div>' +
      '<div class="footer-col">' +
        '<h2 class="footer-h">Légal</h2>' +
        '<ul class="footer-list">' +
          '<li><a href="/confidentialite.html">Politique de confidentialité</a></li>' +
          '<li><a href="/mentions-legales.html">Mentions légales</a></li>' +
        '</ul>' +
      '</div>' +
    '</div>' +
    '<div class="container footer-bottom"><p>© 2026 Captain.Food — Projet indépendant en construction à Tours.</p></div>';

  var slots = document.querySelectorAll("[data-shared-footer]");
  for (var i = 0; i < slots.length; i++) slots[i].innerHTML = FOOTER;

  // ---------- Floating WhatsApp bubble (+ first-time hint) ----------
  if (!document.querySelector(".wa-fab")) {
    var fab = document.createElement("a");
    fab.className = "wa-fab";
    fab.href = WA;
    fab.target = "_blank";
    fab.rel = "noopener";
    fab.setAttribute("aria-label", "Discuter avec Captain.Food sur WhatsApp");
    fab.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="' + WA_PATH + '"/></svg>';
    document.body.appendChild(fab);

    // Show a one-time hint the first time the bubble appears (per browser).
    var seen = false;
    try { seen = !!localStorage.getItem("cf-wa-hint"); } catch (e) {}
    if (!seen) {
      var hint = document.createElement("div");
      hint.className = "wa-hint";
      hint.setAttribute("role", "status");
      hint.innerHTML =
        '<button class="wa-hint-close" type="button" aria-label="Fermer">&times;</button>' +
        '<span>👋 Discute directement avec Captain.Food</span>';
      document.body.appendChild(hint);
      requestAnimationFrame(function () { hint.classList.add("is-visible"); });
      var dismiss = function () {
        hint.classList.remove("is-visible");
        try { localStorage.setItem("cf-wa-hint", "1"); } catch (e) {}
        setTimeout(function () { if (hint.parentNode) hint.parentNode.removeChild(hint); }, 400);
      };
      hint.querySelector(".wa-hint-close").addEventListener("click", dismiss);
      fab.addEventListener("click", dismiss);
      setTimeout(dismiss, 9000);
    }
  }

  // The sticky mobile CTA was retired in favour of the fixed bottom chip-nav
  // (which carries an orange "Rejoindre" action) + the sticky header CTA.
})();
