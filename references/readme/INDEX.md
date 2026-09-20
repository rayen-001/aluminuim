# INDEX — Audit du moteur de calcul aluminium (commencer ici)

> **Pour un agent/IA qui découvre ce projet sans aucun contexte préalable** : ce dossier (`references/readme/`) contient TOUT ce qu'il faut savoir sur l'audit en cours du calculateur de devis/atelier. Lis ce fichier en premier — il te dit quoi lire ensuite selon ce que tu dois faire.

## 0. En une phrase

On audite `src/utils/aluCalculEngine.ts` (le moteur qui calcule les découpes, prix, vitrages d'une app de devis pour menuiserie aluminium en Tunisie) en le comparant à deux sources de vérité — les catalogues fabricant ALLUCO (images scannées) et les données d'un logiciel concurrent/référence réel nommé AtelierPro (fichiers HTML sauvegardés) — puis on corrige les écarts confirmés, un lot ("batch") à la fois, avec confirmation explicite du client à chaque étape.

## 1. Qui fait quoi, comment on travaille (règles à ne jamais casser)

- **Ne jamais modifier ou supprimer de code sans confirmation explicite du client dans le message en cours.** Même après avoir approuvé un plan, il faut souvent une confirmation supplémentaire ("go", "continue", "7ot option a"...) avant de commencer à éditer.
- **Ne jamais supprimer de fichier dans `references/`** (le client l'a demandé plusieurs fois explicitement, quel que soit ce qui se passe).
- Le client écrit en tunisien transcrit en alphabet latin ("derja" façon AZERTY — ex. "n7eb", "3andek", "ken"), **jamais en écriture arabe Unicode** — il a explicitement demandé de ne jamais utiliser l'écriture arabe car il ne la lit pas confortablement.
- Le client est le propriétaire de l'app, pas un expert en aluminium — il compte sur l'analyse pour comprendre le métier, pas l'inverse.
- Toute correction doit être **tracée à une source vérifiée** (catalogue ALLUCO en haute résolution, ou données AtelierPro confirmées) — jamais une supposition. Quand une lecture de catalogue basse résolution s'est révélée fausse (voir section 4), on l'a explicitement corrigée plutôt que de la laisser comme "confirmée".
- Avant d'implémenter un ensemble de changements de code, on passe par un **mode plan** (fichier de plan, validation explicite) plutôt que d'éditer directement.

## 2. Où sont les choses (carte du dossier `references/`)

| Chemin | Contenu |
|---|---|
| `references/ref40/` | 96 images JPG scannées du catalogue ALLUCO **SQUARE 40** (battant), résolution basse (595×842px). Fichiers `Sans titre - 1-01.jpg` … `1-96.jpg`. |
| `references/ref40/README_ref40.md` | Extraction complète et détaillée des 96 pages ci-dessus — désignations, formules de coupe, prix des joints/accessoires, index page par page. **Lire ce fichier pour toute question sur le système ALLUCO SQUARE 40.** |
| `references/ref 67/` (⚠️ espace dans le nom) | 76 images JPG scannées du catalogue ALLUCO **SQUARE 67** (coulissant), même résolution basse. Fichiers `ref 67-01.jpg` … `ref 67-76.jpg`. |
| `references/ref 67/README_ref67.md` | Extraction complète des 76 pages ci-dessus, même format que pour ref40. **Lire ce fichier pour toute question sur le système ALLUCO SQUARE 67.** |
| `references/refrence_40/pageXX/` | Crops/captures **haute résolution** de pages spécifiques du catalogue SQUARE 40 (fournies par le client après coup, pour lever les doutes de lecture basse résolution). Sous-dossiers : `page71`, `page86`, `page87`, `page88`, `page89`, chacun avec plusieurs `N.png` (un crop = une zone de la page). |
| `references/reference_67/pageXX/` | Idem pour SQUARE 67 : `page9`(non lu), `page14`(non lu), `page29`, `page55`, `page58`, `page59`, `page64`, `page65`, `page66`, `page68`, `page69`, `page70`. |
| `references/article.txt`, `articles.txt` | Sauvegarde HTML complète de la page **Articles** (catalogue produits/prix) du vrai logiciel **AtelierPro** (atelierpro.vortech-x.com), ~30 500 lignes chacun (semblent identiques ou quasi-identiques). **Source de vérité pour les PRIX réels et les désignations** — voir section 5. |
| `references/code.txt`, `code_devis2.txt` | Sauvegarde HTML de la page **création de devis** d'AtelierPro (~2200-2300 lignes chacun, quasi-identiques). Contient le formulaire Alpine.js, la validation, la logique d'affichage — **pas les formules de calcul géométrique** (celles-ci vivent côté serveur / dans un bundle JS externe non capturé). Voir section 5. |
| `references/view_devis.txt` | Sauvegarde HTML d'une page de visualisation de devis AtelierPro (~2300 lignes). Peu exploité jusqu'ici. |
| `references/img_references/` | Dossier vide, créé par le client, jamais rempli. |
| `references/README_audit_session.md` | **Journal de session d'origine** (le tout premier, avant ce dossier `readme/`) — chronologie complète, décisions, état du batch. Toujours à jour, complète ce dossier plutôt que de le remplacer. |
| `references/readme/` (ce dossier) | Point d'entrée consolidé — toi, en train de le lire. |

## 3. Que lire selon ta tâche

- **"Je dois comprendre l'état actuel du projet"** → `references/readme/JOURNAL_SESSION.md` (résumé chronologique complet, le plus important après ce fichier).
- **"Je dois vérifier/corriger une formule de découpe ou de vitrage ALLUCO"** → `references/ref40/README_ref40.md` ou `references/ref 67/README_ref67.md` selon le système, PUIS `references/readme/VERIFICATION_HAUTE_RESOLUTION.md` pour voir si cette formule précise a déjà été re-vérifiée en haute résolution (et corrigée si besoin).
- **"Je dois connaître le prix réel d'un accessoire/profilé"** → `references/readme/ATELIERPRO_FICHIERS_REFERENCE.md` (explique comment chercher dans `articles.txt`) — ne jamais inventer un prix.
- **"Je dois savoir ce qui a déjà été corrigé dans le code"** → `references/readme/CODE_CHANGES_BATCH1.md` (liste exacte fichier/ligne/avant/après).
- **"Je dois savoir tous les problèmes trouvés, corrigés ou non"** → `references/readme/FINDINGS_COMPLETS.md` (liste complète, ~50 constats, avec statut à jour).
- **"Je dois voir un rapport visuel/interactif"** → l'Artifact publié "Audit AtelierPro" (voir section 6 pour l'URL et son état).

## 4. Le piège à connaître absolument : les scans basse résolution peuvent être *systématiquement* faux

Deux formules ont été extraites du scan basse résolution (`references/ref 67/`) avec une confiance "haute, confirmée sur 7 pages" — et se sont révélées **fausses** une fois vérifiées sur image nette :
- Montant coulissant ALLUCO : lu comme "H−90mm" (7 pages), en réalité **"H−60mm"** (le chiffre "6" ressemblait à un "9" à basse résolution, de façon cohérente sur toutes les pages).
- Parclose porte ALLUCO 2 vantaux (largeur) : lu comme "(L−395)/2", en réalité **"(L−355)/2"**.

**Leçon** : une lecture "confirmée sur plusieurs pages" à partir d'un scan 595×842px n'est PAS une garantie de justesse — le même artefact de compression peut se répéter identiquement sur toutes les pages. Ne jamais traiter un chiffre comme acquis s'il vient uniquement du scan basse résolution originel sans avoir été recroisé sur une image nette (voir `VERIFICATION_HAUTE_RESOLUTION.md` pour savoir ce qui a et n'a pas été revérifié).

## 5. AtelierPro : ce qu'on a et ce qu'on n'a pas

**Ce qu'on a** (dans `article.txt`/`articles.txt`/`code.txt`/`code_devis2.txt`/`view_devis.txt`) : une sauvegarde statique de pages HTML déjà rendues par le navigateur — le formulaire de devis (Alpine.js), le catalogue d'articles avec leurs vrais prix, et la logique de validation/affichage côté client.

**Ce qu'on n'a PAS** : les formules de calcul géométrique elles-mêmes (longueurs de découpe, tailles de vitrage). Elles s'exécutent soit côté serveur (PHP/Laravel, vu les jetons CSRF et `_method: PUT`), soit dans un bundle JavaScript compilé/minifié séparé (`https://atelierpro.vortech-x.com/build/assets/app-*.js`) qui n'est PAS inclus dans ces fichiers texte. Une recherche exhaustive de motifs de calcul (`hOuvrant`, `toFixed(1)`, `H -`, etc.) dans `code_devis2.txt` n'a rien donné.

**Donc** : AtelierPro sert de source de vérité fiable pour les **prix**, les **désignations**, la **structure des types de produits** (ex. confirmation que "3 vantaux sur 2 rails" et "3 vantaux sur 3 rails" sont deux types réellement distincts et sélectionnables — vu directement par le client dans son propre compte, capture d'écran à l'appui), et certains **comportements UI/validation** — mais PAS pour les formules géométriques de découpe, qui restent sourcées uniquement du catalogue ALLUCO en image.

**Point de friction important à respecter** : le client a explicitement recadré l'assistant après qu'il ait proposé de remplacer TOUS les prix du code par les prix trouvés dans AtelierPro sans distinction. Les prix sont une décision commerciale propre à ce client — AtelierPro appartient à une autre entreprise et peut avoir une politique de prix différente. La règle retenue : **n'utiliser les prix AtelierPro que pour corriger des erreurs de données confirmées (doublons, valeurs à 0 par erreur)**, jamais pour remplacer un prix qui était une décision intentionnelle. Voir `references/readme/feedback_memoire.md` (résumé des mémoires sauvegardées) pour le détail de cet échange.

## 6. Rapport interactif (Artifact)

Un rapport HTML interactif (titre affiché : "Audit AtelierPro", ~50 constats filtrables par sévérité) a été publié comme Artifact Claude pendant la session. Son URL exacte n'est pas garantie de rester valide indépendamment de la session Claude qui l'a publié — **`references/readme/FINDINGS_COMPLETS.md` est la version texte durable et faisant foi**, à préférer pour tout travail futur. Si un agent futur a accès aux outils Artifact de cette session, chercher via `action: "list"` un artifact nommé "Audit AtelierPro" pour retrouver l'URL.

## 7. Ce qui reste à faire (résumé — détail dans JOURNAL_SESSION.md)

- Ajouter le type produit manquant "3 vantaux sur 3 rails" pour le coulissant ALLUCO (Option B, discutée mais pas faite — seule l'Option A/correctif minimal a été appliquée).
- Vérifier si la formule de traverse ouvrante CSQ106 a le même problème 2 rails/3 rails que le vitrage (pas encore vérifié).
- Joint brosse JBR7X6 (léger sur-dosage), pièce CSQ125 manquante dans la liste de découpe, vitrage "avec réducteur" appliqué sans condition d'épaisseur, variante porte "avec traverse" non implémentée (mais confirmée réelle dans AtelierPro).
- Architecture de prix des barres (devis fractionné vs atelier barre entière) — décision de conception non prise.
- Refactor des ~230 prix d'accessoires codés en dur pour lire `getAccPrice()` — gros chantier, pas commencé.
- **TPR et Alu Eco/PALMA/PRAL (8 familles produit sur 10 au total) — aucun catalogue fourni, zéro vérification au-delà de la cohérence interne du code.**
- **Aucun test en conditions réelles (app lancée, devis créé) n'a encore été fait** — toute la vérification à ce stade est statique (lecture de code + `npx tsc --noEmit`).
