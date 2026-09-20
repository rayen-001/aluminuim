# Journal d'audit — Moteur de calcul & Devis (session en cours)

> Ce fichier est un **journal vivant**, mis à jour à chaque étape importante de la session : ce qui a été fait, ce qui a été trouvé, ce qui reste à décider.

**Dernière mise à jour**: 2026-09-20 — Batch 1 (10 points) exécuté, voir section 7.

## 7. Batch 1 exécuté (2026-09-20)

Les 10 corrections validées avec le client (catalogue ALLUCO haute résolution + référence AtelierPro `articles.txt`/`code_devis2.txt`) ont été appliquées. `npx tsc --noEmit` passe sans erreur après ces changements.

**Fichiers modifiés par ce batch** : `src/data/initialAccessories.ts`, `src/data/initialArticles.ts`, `src/utils/aluCalculEngine.ts`. (Note : ces 2 derniers fichiers avaient déjà des modifications non commitées avant le début de cette session — le diff git total inclut donc bien plus que ce batch ; voir le détail ci-dessous pour ce qui a réellement été changé ici.)

1. **Prix Garde-Corps EKS** — `initialAccessories.ts` + fallback `getAccPrice()` dans `aluCalculEngine.ts` : `acc_eks_10_03`→3.224, `acc_eks_10_19`→11.750, `acc_eks_15_14`→32.755, `acc_eks_20_05`→4.500, `acc_eks_21_07`→3.000 (source : AtelierPro `articles.txt`).
2. **FSQ 107 / FSQ 108** — doublons à prix faux (210/140 DT) supprimés de `initialArticles.ts` ; dictionnaire de fallback dans `aluCalculEngine.ts` corrigé à 19.811 / 20.728 (source : AtelierPro).
3. **Kit Oscillo-battant** — consolidé en un seul kit choisi selon `nbVantaux` : `acc_kit_ob_classic_1v` (160.000 DT) pour 1 vantail, `acc_kit_ob_classic_2v` (180.000 DT) sinon (source : AtelierPro `articles.txt`, ids déjà présents dans le fichier). L'ancien bloc à 65 DT (`acc_kit_oscillo_battant`) a été retiré du code ; la détection `isOscillo` reconnaît maintenant aussi la valeur exacte `'Osilobattante'` (qui reste inchangée dans `productCatalog.ts` — confirmé intentionnelle côté AtelierPro, ne pas y toucher). Note : l'entrée `acc_kit_oscillo_battant` reste dans `initialAccessories.ts` mais n'est plus référencée par le code — orpheline inoffensive, pas retirée car hors du scope exact validé.
4. **Nombre de lames volet roulant** — utilise maintenant `slatCfg.stepCm` (déjà calculé, jamais lu avant) au lieu d'une constante 5.0 fixe, aux deux endroits (volet autonome et volet intégré).
5. **Hauteur d'ouvrant porte ALLUCO** — H−4.6cm pour 1 et 2 vantaux (au lieu de H−4.5cm), confirmé sur catalogue pages 86 et 87.
6. **Hauteur de parclose porte ALLUCO 2 vantaux** — H−20.2cm (1 vantail reste H−26.6cm, déjà correct), confirmé page 87.
7. **Rejet d'eau coulissant ALLUCO (CSQ124)** — déduction L−4mm ajoutée (était L exact), confirmé pages 64/68.
8. **Désignations profilés** — CSQ125 ("Cache Rejet d'Eau"), CSQ201/202/203 (retrait de la mention "3 Rails" erronée — ce sont les compagnons 2 rails haut), CSQ210 ("Dormant Coulissant 3 Rails" — c'est le vrai profilé 3 rails, confirmé catalogue page 14).
9. **~34 doublons d'accessoires** nettoyés dans `initialAccessories.ts` (gardé la première occurrence, correctement tarifée).
10. **Garde-fou barre > 650cm** — `optimizeCuttingStock` ne produit plus de chute négative pour une pièce dépassant la longueur de barre standard ; un `console.warn` signale le cas.

**Décision explicite du client sur la validation dimension (point discuté séparément)** : laissée telle quelle — confirmé que AtelierPro (`code_devis2.txt` ligne 1699) a exactement la même vérification (`!item.hauteur || !item.largeur`, sans contrôle `> 0`). Pas un écart, pas modifié.

**Reste hors scope** (voir section 5 pour le détail) : 2 rails vs 3 rails, vitrage EX45, architecture prix barres, refactor des ~230 prix hardcodés, TPR / Alu Eco (PALMA/PRAL) toujours sans catalogue.

**Prochaine étape suggérée** : tester dans l'app (serveur de dev) chacun des 10 points, en particulier le kit oscillo-battant (1 et 2 vantaux) et les portes ALLUCO 2 vantaux.

## 8. Découverte confirmée via un compte AtelierPro réel (2 rails vs 3 rails) — et correctif appliqué

Le client a un accès direct à l'app AtelierPro et a montré des captures d'écran de son propre formulaire de devis. Confirmé sans ambiguïté : **"Coulissante Aluco Square 67" propose bien deux types distincts et sélectionnables — "Fenêtre — 3 vantaux (sur deux rails)" et "Fenêtre — 3 vantaux (sur trois rails)"** — exactement ce que le catalogue ALLUCO documentait (page 65 vs page 66).

Vérification dans notre `productCatalog.ts` : un seul type `Fenêtre coulissante en 3 vantaux` existe par famille, sans distinction de rails. Ses profils par défaut (`aluCalculEngine.ts`) sont CSQ103/104/105/116 — tous de la série **2 rails**. Or la formule de largeur du vitrage utilisait `(L−20.3)/3` (le diviseur de la config **3 rails**) — un vrai mélange interne : matériel 2 rails + formule 3 rails.

**Correctif appliqué (Option A, validée par le client)** : `aluCalculEngine.ts` ligne ~1384, `(L − 20.3) / 3` → `(L − 20.3) / 2`, pour que la formule corresponde au matériel 2 rails réellement utilisé par défaut. `npx tsc --noEmit` toujours propre après ce changement.

**Non fait (Option B, mise de côté pour l'instant)** : ajouter un second type produit distinct "3 vantaux sur 3 rails" (profils CSQ110/CSQ210, diviseur ÷3 propre) pour offrir le choix comme le fait AtelierPro. Discuté avec le client, reporté.

**Piste ouverte pour la suite** : la formule de traverse ouvrante (CSQ106, `aluCalculEngine.ts` ~ligne 1142-1147) a un diviseur `/3` similaire pour 3 vantaux — non vérifié si elle suit la même logique 2 rails/3 rails que le vitrage ; à re-vérifier avant de la toucher.

---

## 1. Contexte et objectif

Application de devis/fiche atelier pour menuiserie aluminium (Tunisie). Objectif de la session : vérifier que le moteur de calcul (`src/utils/aluCalculEngine.ts` et fichiers liés) respecte bien la méthode de calcul et les références réelles des systèmes vendus, en comparant le code aux catalogues fabricant fournis.

## 2. Chronologie de la session

1. **Audit initial complet du code** (4 agents en parallèle, lecture intégrale, aucune modification) :
   - `aluCalculEngine.ts` (3627 lignes)
   - `devisCalculator.ts` + `productDrawing.ts` (1339 lignes)
   - Fichiers de données : `initialArticles.ts`, `productCatalog.ts`, `profileImages.ts`, `initialAccessories.ts`
   - Vues : `DevisCreateView.tsx`, `ArticlesView.tsx`, `FicheAtelierModal.tsx`
2. **Extraction complète des références catalogue fournies** :
   - `references/ref40/` — 96 pages scannées → `README_ref40.md` (catalogue ALLUCO SQUARE 40, battant)
   - `references/ref 67/` — 76 pages scannées → `README_ref67.md` (catalogue ALLUCO SQUARE 67, coulissant)
3. **Rapport d'audit complet publié** (artifact HTML "Audit AtelierPro") — comparaison ligne par ligne code ↔ catalogue, ~50 constats classés par sévérité.
4. **Vérification sur images haute résolution** (client a fourni des captures nettes de pages ciblées, dossiers `references/reference_67/pageXX/` et `references/refrence_40/pageXX/`) — a permis de corriger 2 fausses alertes et de confirmer/aggraver plusieurs constats.
5. **Découverte du périmètre catalogue réel de l'app** (`productCatalog.ts`) : 10 familles produit réparties en 3 marques : **ALUCO** (2 familles, catalogue fourni et vérifié), **TPR** (4 familles, aucun catalogue), **ALU ECO / PALMA / PRAL** (4 familles, aucun catalogue).

## 3. État de la vérification par marque

| Marque | Familles | Statut catalogue |
|---|---|---|
| ALUCO (SQ40, Square 67) | 2 | ✅ Vérifié à 100% sur image haute résolution |
| TPR (S40, EX45, S67, EX60) | 4 | ❌ Aucun catalogue fourni — à obtenir |
| ALU ECO / PALMA / PRAL (S40, EX45, S67, EX60) | 4 | ❌ Aucun catalogue fourni — à obtenir |

**Piste à explorer avant de chercher de nouveaux catalogues** : vérifier auprès du fournisseur si TPR et/ou Alu Eco sont le même système physique qu'ALLUCO revendu sous un autre nom — cela éviterait une recherche de catalogue inutile.

## 4. Constats confirmés (résumé — détail complet dans l'artifact "Audit AtelierPro")

### Confirmés et actifs aujourd'hui (impact direct, sans condition particulière)
- 5 accessoires Garde-Corps facturés à 0,000 DT (`initialAccessories.ts`)
- Vitrage EX45 : taille fixe codée en dur, ignore les dimensions réelles (`aluCalculEngine.ts:2787-2789`)
- Typo « Osilobattante » → double facturation + mauvaise quincaillerie sur les fenêtres oscillo-battantes S40/ALLUCO/Alu Eco
- Nombre de lames de volet roulant : pas selon le vrai type de lame (champ `stepCm` mort)
- Le devis facture les barres alu au mètre fractionné, l'atelier les achète à la barre entière (écart structurel de marge)
- 232 des 299 prix d'accessoires sont modifiables dans l'interface mais sans effet réel sur les devis

### Confirmés sur image haute résolution (formules ALLUCO)
- Porte ALLUCO 1 **et** 2 vantaux : hauteur d'ouvrant code = H−4,5cm, catalogue = H−4,6cm (confirmé pages 86 et 87)
- Porte ALLUCO 2 vantaux : hauteur de parclose (sans traverse) code = H−26,6cm, catalogue = H−20,2cm (confirmé page 87) — la valeur 1 vantail (H−26,6cm) est elle correcte
- Joint brosse JBR7X6 (coulissant ALLUCO) : sur-commandé pour 2, 3 **et** 4 vantaux (catalogue = 4L+6H / 4L+?H / 4L+10H selon config, code plus élevé)
- CSQ124 (rejet d'eau, coulissant standard) : code ne déduit rien, catalogue = L−4mm (écart réel mais très faible)
- Désignations à corriger (texte seulement) : CSQ125 (« Cache rejet d'eau », pas « Seuil PMR ») ; CSQ201/202/203 (compagnons du rail 2 rails, pas « 3 Rails » — le vrai profilé 3 rails est CSQ210, confirmé catalogue page 14)

### Deux fausses alertes corrigées (le scan basse résolution avait mal lu le catalogue, le code était juste)
- ~~Montant coulissant ALLUCO H−6,0cm vs H−9,0cm~~ → catalogue confirmé **H−60mm** sur image nette : **le code est correct**
- ~~Parclose porte ALLUCO 2vtx largeur (L−35,5)/2 vs (L−39,5)/2~~ → catalogue confirmé **(L−355)/2** sur image nette : **le code est correct**

### Point ouvert nécessitant une vérification code (pas une image)
- Coulissant ALLUCO 3 vantaux : catalogue confirme deux configurations réelles avec diviseurs différents — **2 rails → (L−203)/2** (page 65), **3 rails → (L−203)/3** (page 66). Le code utilise toujours ÷3. À vérifier : `productCatalog.ts` / le sélecteur de l'app permet-il de choisir 2 rails vs 3 rails pour une fenêtre 3 vantaux, ou le dormant par défaut (CSQ103, 2 rails) est-il toujours utilisé quel que soit le nombre de vantaux ?

### Décision business en attente (pas un problème de lecture catalogue)
- `FSQ 107` et `FSQ 108` existent en double dans `initialArticles.ts` avec des prix très différents (19,811 DT vs 210,000 DT ; 20,728 DT vs 140,000 DT). ALLUCO ne publie aucun prix — **le client doit indiquer quel est le vrai prix fournisseur** pour trancher.

## 5. Plan de correction proposé (validé dans son principe, exécution non démarrée)

**Batch 1 — zéro risque, pas de catalogue supplémentaire nécessaire** (approuvé par le client, en attente de lancement) :
- Prix Garde-Corps à 0 DT → corriger
- Doublons FSQ124/FSQ408/accessoires à 0 DT → nettoyer
- Typo « Osilobattante » + fusion des deux blocs de détection → corriger
- Nombre de lames volet roulant (stepCm mort) → corriger
- Validation dimension négative/zéro → corriger
- `qty = 0` silencieusement transformé en 1 → corriger
- Garde-fou pièce > 650cm dans l'optimiseur de barres → ajouter
- Formules ALLUCO confirmées (hauteur ouvrant porte, hauteur parclose porte 2vtx, désignations CSQ125/CSQ201-203) → corriger

**Batch 2 — nécessite une décision ou vérification avant d'agir** :
- 2 rails vs 3 rails (vérification code d'abord)
- Vitrage EX45 (pas de catalogue EX45 → correction possible mais non garantie fabricant)
- Architecture prix barres devis vs atelier (décision de conception)
- Refactor des 232 prix d'accessoires hardcodés (risque plus élevé, tests nécessaires après)
- Prix réel FSQ107/FSQ108 (attente de l'information du client)

**Non traité** : TPR et Alu Eco/PALMA/PRAL — en attente de catalogue ou de confirmation qu'ils sont identiques à ALLUCO.

## 6. Références utiles

- Rapport détaillé complet (toutes les ~50 constats, filtrable) : artifact "Audit AtelierPro" — https://claude.ai/code/artifact/f6f6140b-2849-4f21-8692-89acd4baa4fb
- `references/ref40/README_ref40.md` — extraction complète catalogue ALLUCO SQUARE 40
- `references/ref 67/README_ref67.md` — extraction complète catalogue ALLUCO SQUARE 67
- `references/reference_67/pageXX/` et `references/refrence_40/pageXX/` — crops haute résolution utilisés pour la vérification finale

---

*Session en cours — 2026-09-20. Ce fichier sera mis à jour à chaque étape (nouveaux catalogues reçus, batch exécuté, décisions prises).*
