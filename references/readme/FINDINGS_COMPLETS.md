# Liste complète des constats — statut à jour

> Version texte durable du rapport interactif "Audit AtelierPro" (Artifact HTML), mise à jour avec tout ce qui s'est passé après sa publication (rétractations, confirmations, corrections). **C'est ce fichier qu'il faut lire pour connaître l'état actuel d'un constat, pas l'Artifact seul** (qui a pu ne pas être republié à jour). Légende : ✅ CORRIGÉ · 🔴 OUVERT (rien fait) · 🟡 DÉCISION : LAISSÉ TEL QUEL · ⚫ RÉTRACTÉ (fausse alerte).

## Anciennement "actifs aujourd'hui" (impact garanti)

| # | Constat | Statut | Détail |
|---|---|---|---|
| 1 | 5 accessoires Garde-Corps (EKS) à 0 DT | ✅ CORRIGÉ | Prix réels AtelierPro appliqués — voir `CODE_CHANGES_BATCH1.md` point A |
| 2 | Vitrage EX45 taille fixe, ignore H/L | 🔴 OUVERT | Aucun catalogue EX45 disponible pour fixer la vraie constante |
| 3 | Typo "Osilobattante" → double facturation (crémone + kit OB) | ✅ CORRIGÉ | Détection réparée, kit consolidé en un seul (160/180 DT selon vantaux) — voir point B. Note : `'Osilobattante'` elle-même n'était PAS une faute — confirmée intentionnelle côté AtelierPro |
| 4 | Nombre de lames volet roulant, pas de la vraie lame (`stepCm` mort) | ✅ CORRIGÉ | Voir point C |
| 5 | Coulissant ALLUCO montant H−6,0cm vs H−9,0cm | ⚫ RÉTRACTÉ | Image nette confirme H−60mm : **le code était déjà correct**, le scan basse résolution avait mal lu "60" comme "90" |
| 6 | Devis facture les barres au mètre fractionné vs atelier barre entière | 🔴 OUVERT | Décision d'architecture non prise |
| 7 | 232/299 prix d'accessoires codés en dur, sans effet sur les devis | 🔴 OUVERT | Refactor important, non commencé |

## Anciennement "confiance haute"

| # | Constat | Statut | Détail |
|---|---|---|---|
| 8 | nbVantaux retombe sur la formule 2 vantaux au-delà de {1,2,3,4} | 🔴 OUVERT | Impact réel dépend de l'existence de produits 5+ vantaux, non vérifié |
| 9 | `optimizeCuttingStock` : chute négative si pièce > 650cm | ✅ CORRIGÉ | Clamp à 0 + `console.warn` — voir point H |
| 10 | Validation dimension négative/nulle (`!item.hauteur` au lieu de `> 0`) | 🟡 LAISSÉ TEL QUEL | Confirmé identique dans AtelierPro (`code_devis2.txt` ligne 1699) — décision explicite du client de ne pas "corriger" ce qui n'est pas un écart |
| 11 | FSQ124/FSQ408 doublons à 0 DT | ✅ CORRIGÉ | Supprimés de `initialArticles.ts` |
| 12 | FSQ107/FSQ108 doublons, écart de prix 6,8×-10,6× | ✅ CORRIGÉ | Doublons à prix faux supprimés ; confirmé par AtelierPro que 19.811/20.728 DT sont les bons prix |
| 13 | 9 autres références dupliquées (40108, AE_40121, EX45 1120/1123/1125/1130/1312, EX60 2110/2114) couvrant des pièces différentes | 🔴 OUVERT | Non traité — nécessite de renommer une référence de chaque paire, risque de casser d'autres liens |
| 14 | FSQ407 vendable sans désignation ni image | 🔴 OUVERT | Non traité |
| 15 | 35 identifiants d'accessoires dupliqués | ✅ CORRIGÉ | Nettoyés dans `initialAccessories.ts` |

## Anciennement "confiance moyenne"

| # | Constat | Statut | Détail |
|---|---|---|---|
| 16 | Porte ALLUCO 2 vantaux — hauteur de parclose | ✅ CORRIGÉ | H−20,2cm (pas H−26,6cm) confirmé sur image nette p.87 — voir point E. (L'ancienne version de ce constat portait sur la **largeur** de la parclose et a été rétractée séparément, voir ci-dessous) |
| 17 | Coulissant 3 vantaux : diviseur vitrage ÷2 vs ÷3 selon 2/3 rails | ✅ CORRIGÉ | Confirmé par capture d'écran du compte AtelierPro réel du client (2 types distincts et sélectionnables) + catalogue pages 65/66. Code corrigé pour matcher le matériel 2 rails par défaut (÷2). **Option B (ajouter le type "3 rails" séparé) reportée, non faite** |
| 18 | Joint brosse JBR7X6 sur-commandé (élargi : touche aussi 2 vantaux, pas seulement 3-4) | 🔴 OUVERT | Confirmé 4L+6H (2 vantaux) vs code ~4L+8H, non corrigé |
| 19 | Deux blocs de code peuvent facturer deux fois le même accessoire (oscillo + crémone-à-clé) | ✅ CORRIGÉ (oscillo) / 🔴 OUVERT (crémone-à-clé) | L'oscillo est résolu par la consolidation (point B). La crémone-à-clé a été réexaminée : deux blocs distincts existent bien (`cremone_type`/`supplements` vs `cremone_id`) mais avec le même prix (32 DT) — risque jugé faible, non traité |
| 20 | Porte ALLUCO 2 vantaux — hauteur d'ouvrant utilise la constante 1 vantail | ✅ CORRIGÉ | H−4,6cm désormais pour 1 ET 2 vantaux (confirmé identique sur les deux pages 86 et 87) — voir point D |
| 21 | ~~Porte ALLUCO 2 vantaux — largeur de parclose 4cm trop courte~~ | ⚫ RÉTRACTÉ | Image nette p.87 confirme (L−355)/2, pas (L−395)/2 : **le code était déjà correct** |
| 22 | CSQ125 désignation contredit le catalogue ("Seuil PMR" vs "Cache Rejet d'Eau") | ✅ CORRIGÉ | Voir point G |
| 23 | CSQ201/202/203 mal étiquetés "3 Rails" | ✅ CORRIGÉ | Reformulés "2 Rails Haut..." ; CSQ210 (le vrai profilé 3 rails) corrigé aussi — voir point G |
| 24 | CSQ106 jamais proposé comme option de parclose (verre épais, coulissant ALLUCO) | 🔴 OUVERT | `productCatalog.ts` non modifié |
| 25 | FSQ148/151/156 stockés sans espace, prix réel inatteignable | 🔴 OUVERT | Non traité |
| 26 | Doublon mort de prix vitrage (REMPLISSAGES vivant vs initialAccessories mort) | 🔴 OUVERT | Non traité |

## Faible confiance / informatif (résumé — 21 points au départ)

La plupart restent inchangés (voir l'Artifact ou la conversation originale pour le détail complet). Changements notables :
- **CSQ106 traverse "G-..."** → ✅ RÉSOLU : confirmé (L−156)/2 sur image nette, correspond exactement au code.
- **CSQ114 parclose H−17,0cm** → ✅ RÉSOLU : confirmé H−170mm exact sur image nette.
- **CSQ124/125 "L−4x"** → ✅ RÉSOLU (et corrigé, voir point F) : c'est bien L−4mm exactement (pas 40-49mm comme estimé). La pièce CSQ125 elle-même (cache rejet d'eau) reste non générée dans la liste de découpe — 🔴 OUVERT.
- Le reste (nbChicanes EX60, nbRails ne scale pas à 4, glissière 55/45, comparaison flottante, gcKind rendu identique, onglets 45° dessinés pour le battant alors que le catalogue documente un assemblage carré, plancher d'aspect-ratio, FSQ151/156 prix identique suspect, onglet de filtre Articles manquant, littéraux de repli divergents) → tous encore 🔴 OUVERTS, non traités, impact jugé faible ou cosmétique.

## Sections vérifiées correctes (aucun changement nécessaire)

Confirmé exact, aucune action : formules vitrage battant/porte ALLUCO S40 (toutes configs sans traverse), ouvrant/battement/parclose fenêtre ALLUCO S40, vitrage coulissant "avec réducteur" 2 et 4 panneaux, rail CSQ116, flags de catégorisation (mutuellement exclusifs), algorithme de découpe FFD, TVA/marges dans `devisCalculator.ts`, correctif oscillo-battant du commit `17d90d0` dans `productDrawing.ts` (toujours intact), unités cm cohérentes partout (**pas de confusion mm/cm**, vérifié explicitement de bout en bout), affichage `FicheAtelierModal.tsx` (tous les champs présents, unités claires, angles par pièce, vitrage jamais inversé).

## Ce qui n'a jamais été vérifié du tout

**TPR (4 familles) et Alu Eco/PALMA/PRAL (4 familles)** — aucun catalogue fourni, code jamais comparé à une source de vérité externe pour ces 8 familles sur 10. Seule la cohérence interne du code a pu être contrôlée (pas d'erreur logique évidente trouvée, mais aucune garantie que les constantes numériques sont correctes).
