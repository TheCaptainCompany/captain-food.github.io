# Captain.Food — Brief de direction artistique (pour Claude Code)

> Ce document décrit l'INTENTION VISUELLE de la landing page. Le contenu (textes, structure) est figé dans `content.md`. Ici : le ton, l'univers, le personnage, ce qui doit trancher avec les grandes plateformes. À lire avant de coder le design.

---

## Principe directeur

**Fond sérieux, forme pirate.** L'univers pirate porte l'énergie et l'attachement ; il n'affaiblit jamais la clarté des informations qui engagent un chef d'entreprise (ce qu'il obtient, ce qu'il paie, ce qu'il risque). Référence de ton : l'esprit *One Piece* — fun, aventure, liberté, camaraderie — au service d'un propos qui, lui, est pris au sérieux. Le fun est dans la voix et le personnage ; la rigueur est dans les faits.

**Test de validation à appliquer partout :** si une blague ou un élément de style oblige le restaurateur à *décoder* pour comprendre ce qu'on propose, il est mal placé. Le style doit envelopper une info déjà limpide, jamais la remplacer.

## Ce qu'on veut ressentir

- Une bande d'indépendants qui reprend le large, pas une place de marché corporate.
- Chaleur, complicité, énergie — l'inverse du froid transactionnel des grandes plateformes.
- De la fierté : « je reprends le contrôle de mon affaire ».

## Ce qu'on refuse

- **Le look des grandes plateformes** (Uber Eats, Deliveroo & co) : grilles de restaurants façon catalogue, photos de plats agressives, gros boutons de commande, urgence marketing. Captain.Food ne doit PAS ressembler à ça — c'est un anti-modèle visuel.
- **Le gimmick qui décrédibilise** : pirate ne veut pas dire toc. Pas de crânes clichés partout, pas de « moussaillon » à toutes les phrases, pas de perroquet gadget. Le pirate est un esprit (liberté, équipage, cap), pas un déguisement d'Halloween.
- **La gamification culpabilisante** : aucun élément qui punit ou dévalorise le visiteur (rappel du garde-fou général du projet).

## Le personnage : le Captain

- Un capitaine attachant, un peu bravache mais droit — un allié, pas un mascotte-clown.
- Registre émotionnel POSITIF uniquement : neutre et digne au repos, chaleureux/fier quand ça va bien. Il ne se dégrade jamais pour culpabiliser (pas de tristesse, saleté ou blessure imputée au visiteur).
- Peut servir de fil conducteur (accueil, respiration entre sections), sans envahir les zones d'information dense.

## Voix & écriture

- Tutoiement, direct, complice. Le « nous » d'équipage existe (« reprenons », « embarque ») pour la dimension collective.
- Le pirate est dans le rythme et quelques mots choisis (cap, large, équipage, QG, à l'abordage — avec parcimonie), pas dans un patois lourd.
- Les informations qui engagent (prix, caisse, ce que ça demande, statut ESUS) restent en langage clair et pro, même dans un habillage fun.

## Palette & exécution (indicatif, à affiner via la skill frontend-design)

- Un univers maritime/aventure qui tranche avec le noir/vert Uber et le turquoise Deliveroo — chercher une identité propre, chaude, avec du caractère.
- Éviter le mimétisme des codes food-delivery. On est plus proche d'un carnet d'aventure / d'un pavillon d'équipage que d'une app de livraison.
- Lisibilité d'abord : les blocs d'information (comparaison des modèles, trois canaux, financement) doivent rester parfaitement clairs sous l'habillage.

## Rappels de contenu qui ont un impact visuel

- **Centerpiece « où va l'argent »** : comparaison à deux colonnes, modèle à commission vs Captain.Food. Générique, jamais de nom de concurrent, jamais de montant inventé (seul chiffre autorisé : commission 25-35 %, sourcée).
- **Bloc trois canaux** : site (QG) → livraison / à emporter / à table QR code. Insister visuellement sur « le paiement reste dans ta caisse » pour l'à-table.
- **Sélecteur « 3 taux, 3 vérités »** sur la répercussion : interaction front simple (un choix → un message qualitatif). ATTENTION : aucune sortie de chiffre de CA calculé — c'est une contrainte, pas un oubli. Ne pas « améliorer » en ajoutant un montant.
- CTA unique vers les restaurateurs. Pas de capture côté client (diner).
- Formulaire + case RGPD (non cochée par défaut, obligatoire) + pages légales en placeholders.

## Ce qui n'est PAS sur la page (rappel)

- Pas de mécanisme flyer documenté publiquement.
- Pas de base clients partagée ni de points inter-restaurants (v2 sous condition juridique).
- Pas de formule de répartition livreur (non finalisée).
- Pas de nom de plateforme concurrente.
