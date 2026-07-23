# Passation — Captain.Food (site marketing)

> But de ce fichier : permettre de **reprendre le travail et les discussions dans une nouvelle session**
> (humaine ou assistée par IA) sans tout re-découvrir. Aucune donnée privée ici (dépôt public).
> Dernière mise à jour : 2026-07 (session de refonte landing + maquettes).

---

## 1. Le projet en bref

- **Captain.Food** — site vitrine **statique** (HTML/CSS/JS écrits à la main, **aucun framework, aucune étape de build**).
- **But** : recruter des restaurateurs & food trucks indépendants **à Tours** pour une alternative de commande en ligne **0 % de commission**, à but non lucratif (bien commun, open source).
- **Hébergement** : GitHub Pages. **Domaine canonique : `join.captain.food`** (l'apex et `www` redirigent en 301 vers `join`).
- **Déploiement** : à chaque push, GitHub Pages publie la branche. Un `.nojekyll` force une publication **statique sans Jekyll**. Un workflow `.github/workflows/indexnow.yml` ping IndexNow.
- **Langue** : tout le texte visible en **français**, **tutoiement**. Commentaires/docs en anglais OK.

## 2. Branche de travail

- **`main` est désormais la branche vivante** (décision du fondateur, juillet 2026) : tout l'historique du site
  — ex-`claude/captain-food-landing-0mcx0f`, PR #1 comprise — y a été reporté. On développe et on déploie sur `main`.
- Bascule manuelle dans les Settings GitHub : **branche par défaut → `main`** (Settings → General → Default branch)
  et **Pages → Build and deployment → branche `main`**. ⚠️ Ne pas supprimer `claude/captain-food-landing-0mcx0f`
  **avant** d'avoir basculé la source GitHub Pages, sinon le site en ligne tombe. Une fois la bascule faite,
  supprimer les anciennes branches `claude/…`.
- Git : pousser avec `git push -u origin main` (rebase sur l'origin avant push).

## 3. Règles & garde-fous (À RESPECTER ABSOLUMENT)

- **Honnêteté d'abord** : rien n'est encore construit. Toujours au conditionnel/projet.
  - ESUS / SCIC sont **« visés »**, pas acquis.
  - **Pas de faux chiffres, pas de faux témoignages, pas d'urgence factice, pas de dark patterns.**
  - Ne jamais écrire « déjà disponible » / « commander maintenant ».
- **Modèle** : 0 % de commission côté resto ; **contribution libre** du client (0 € possible) ; **pas de grille tarifaire** (bien commun / open source) ; jamais de surcharge imposée au client.
- **Pas de dénigrement de concurrents**, pas de logos concurrents, pas de référence à Just Eat. Sur la page tarifs on « compare des modèles, on ne vise personne ».
- **Confidentialité** : ne **jamais** committer de données privées dans ce dépôt public — pas de noms des porteurs, pas d'adresse personnelle, pas de numéro de téléphone/WhatsApp brut. (Le lien `wa.me/message/…` déjà présent est un deep-link public, sans numéro affiché.)
- **Voix de marque** : CTA à la **première personne** (« Je rejoins », « Je rejoins la communauté »…). « Captain.Food » est enrobé dans le texte via `<span class="cf-name">` (navy + point corail).
- **Persona conseil** : « Yan », expert neuromarketing restauration (agent dédié), à solliciter pour les arbitrages conversion/copywriting — il refuse les procédés manipulateurs.

## 4. Structure des fichiers

- `index.html` — landing (hero, simulateur de commission `#combat`/`#probleme`, `#solution`, `#maquettes`, `#rejoindre`, FAQ `#faq`).
- Pages SEO (Tours) : `alternative-uber-eats-tours`, `alternative-deliveroo-tours`, `restaurant-sans-commission-tours`, `commande-en-ligne-restaurant-tours`, `click-and-collect-tours`, `livraison-ethique-tours`, `restaurants-tours-indre-et-loire`.
- Autres pages : `tarifs`, `manifeste`, `financement`, `livraison`, `confidentialite`, `mentions-legales`, `404`.
- `styles.css` — feuille de style globale (tokens `:root` : `--navy #0e3a5f`, `--orange #e8613a`, `--ink`, polices Poppins/Inter…).
- `partials.js` — injecte le **footer partagé** + le **FAB WhatsApp** (via `data-shared-footer`).
- `/demo/` — **maquettes cliquables** (prototypes jetables, `noindex`) :
  - `index.html` (sélecteur), `client.html`, `resto.html`, `livreur.html`
  - `demo.css` (gate d'avertissement + bande participation, partagés), `demo.js` (comportement gate + envoi formulaire), `a11y.js` (accessibilité clavier).
- `assets/` — visuels « Capitaine » (`captain-*.webp/png`), `logo.png`, `favicon.png`, `og.png`, `captain-killgrid.webp`.
- `.nojekyll`, `sitemap.xml`, `robots.txt`, `llms.txt`, `LICENSE.md`, `LICENSES/`, `CNAME` (= `join.captain.food`).

## 5. Ce qui a été fait récemment (cette session)

- **i18n de l'accueil (session 2026-07-23)** : la page d'accueil + le chrome partagé
  (footer `partials.js`, bulle WhatsApp, chaînes dynamiques de `script.js`) se traduisent
  côté client en **10 langues** (fr source + en, es, it, pt, de, tr, el, ar, he — ar/he en **RTL**).
  Source de vérité : `i18n/translations.yaml` (mêmes conventions que
  `specs/translations.yaml` du repo produit) ; validation + génération :
  `python3 tools/i18n/i18n.py check|build` (CI : `.github/workflows/i18n.yml` —
  **échec si une clé manque dans une langue** ou si le fr du YAML dérive du HTML).
  Runtime `/i18n.js` : détection `?lang=` → cookie `cf_lang` → navigateur, sélecteur de
  langue dans le header, **consentement demandé avant de poser le cookie** (rien n'est
  écrit si refus ; l'auto-détection n'écrit jamais rien). SEO : hreflang `?lang=xx`
  (+ x-default) dans le `<head>` et `sitemap.xml`, `og:locale:alternate`,
  `knowsLanguage` dans le JSON-LD, section « Langues » dans `llms.txt`.
  Détail complet : section « Internationalization » de `SITE.md`.
- Maquettes `/demo` : identité de marque (Poppins/Inter, logo dans le gate), **code partagé** `demo.css`/`demo.js`, **accessibilité clavier**, cadre téléphone responsive, **scroll interne corrigé** (`min-height:0` → le menu défile puis enchaîne vers le formulaire).
- **Menu haut (`chip-nav`)** ajouté sur **les 13 pages satellites** (version conversion de Yan : 4 repères discrets, un seul CTA « Je rejoins » dominant, FAQ en ancre locale `#faq`).
- **Maillage interne** : chaque réponse de FAQ des 7 pages SEO se termine par un lien « prochaine étape » vers la page qui répond (`.faq-more`).
- **Cohérence « je » / WhatsApp** : tous les CTA WhatsApp = « Je rejoins la communauté » + logo SVG ; « Je chat avec Captain.Food » ; page Confidentialité passée au **tutoiement**.
- **Images** : héros Capitaine en haut de chaque page SEO + topper `captain-explain.webp` au-dessus de chaque FAQ (comme sur l'accueil).
- **tarifs** : l'illustration **« le Capitaine casse la grille »** (`captain-killgrid.webp`, sans texte anglais) remplace l'ancienne grille barrée CSS ; légende honnête conservée.
- **UI** : badge `%` du simulateur sur une seule ligne (`white-space:nowrap`) ; marque « Captain.Food » mise en valeur en corps de texte (`.cf-name`).
- **Build** : ajout `.nojekyll` ; build GitHub Pages **vert**.

## 6. DISCUSSION EN COURS À REPRENDRE — PWA & notifications

Le fondateur veut savoir si on peut **proposer d'installer la démo en PWA** sur mobile, et **si ça gérerait les notifications**.

**État de la réflexion (rien encore implémenté — pas de manifest ni service worker dans le repo) :**

- **Installation PWA = faisable** et 100 % compatible site statique. Besoin : un **web manifest**, des **icônes 192/512 (+ maskable)** dérivées du logo, un **service worker minimal**, HTTPS (déjà OK). Bon effet « essaie-la sur ton téléphone ».
  - Garde-fous : (a) **rester honnête** — c'est une maquette, le nom de l'app installée + un bandeau doivent le dire ; (b) **scoper le service worker à `/demo/`** et le faire **network-first** pour éviter de servir du contenu périmé.
- **Notifications — la réalité :**
  - **iOS** : le web push n'existe **que pour une PWA installée sur l'écran d'accueil** (depuis iOS 16.4). Zéro notif dans un onglet Safari classique. → « installer en PWA » est justement *la condition* pour espérer des notifs sur iPhone.
  - **Notifications distantes réelles** (« ta commande est prête » envoyée par un serveur) : **impossibles en l'état** — il faut un **backend** (clés VAPID, stockage des abonnements, envoi push) que le site statique n'a pas.
  - **Notification *locale* de démo** : **possible sans backend** — le service worker peut afficher une notif déclenchée côté client (ex. 5 s après « Commande confirmée » dans la maquette client). Illustre honnêtement la promesse sans mentir.

**Reco proposée (en attente de décision) :**
1. **PWA installable** (manifest + icônes + SW scopé `/demo/`).
2. **Notif locale simulée** dans le parcours client, clairement étiquetée « démo ».
3. Le jour où un backend existe → brancher le vrai web push par-dessus (le SW sera déjà en place).

**Décisions à prendre par le fondateur :**
- [ ] On lance la PWA ? Oui / non.
- [ ] Périmètre : **maquette client seule** ou **les 3 maquettes** installables ?
- [ ] On ajoute la **notif locale de démo** ? (recommandé pour montrer la fonctionnalité honnêtement)
- [ ] (Option) demander l'avis de **Yan** : est-ce qu'installer une démo aide ou dessert la conversion du pilote ?

## 7. Autres points ouverts

- **Branche par défaut & Pages** : basculer défaut **et** source Pages sur `main`, puis supprimer les branches `claude/…` (voir §2).
- **Image « casse la grille »** : la version FR sans texte est intégrée sur `tarifs`. Si une meilleure version arrive, remplacer `assets/captain-killgrid.webp`.
- **Détail cosmétique** : sur le bouton Uber Eats du simulateur, le libellé « Uber Eats » passe encore sur 2 lignes (le `%` est réglé). À lisser si souhaité (`white-space:nowrap` sur le libellé).
- Pages `manifeste` / `financement` / `livraison` : 1 image chacune (correct) ; possibilité de les enrichir (2ᵉ visuel) pour le même niveau que les pages SEO.

## 8. Dév local & vérification

- Servir en local : `python3 -m http.server 8099` puis ouvrir `http://localhost:8099/`.
- Rendu / captures : Chromium Playwright déjà présent (`executablePath: /opt/pw-browsers/chromium`, module `/opt/node22/lib/node_modules/playwright/index.mjs`).
- Après un changement notable : vérifier au navigateur (rendu réel), pas seulement le code.
- GitHub Pages redéploie ~1 min après le push ; vider le cache mobile si l'ancienne version persiste.
