# Changements de code appliqués — Batch 1 + correctif "2 rails/3 rails"

> Liste exacte et exhaustive de tout ce qui a été modifié dans le code source pendant cette session. Chaque entrée donne le fichier, l'emplacement, l'ancienne valeur, la nouvelle valeur, et la source qui justifie le changement. Vérifié avec `npx tsc --noEmit` (propre) après chaque lot de changements — aucun test applicatif réel n'a encore été fait.

Aucun autre fichier que ceux listés ci-dessous n'a été modifié par cette session. `src/data/productCatalog.ts` a été explicitement laissé intact (voir point 3).

---

## `src/data/initialAccessories.ts`

Réécriture complète du fichier (342 lignes). Changements :

1. **Prix Garde-Corps EKS** (étaient tous à `0`, source : AtelierPro `articles.txt`) :
   - `acc_eks_10_03` → `3.224`
   - `acc_eks_10_19` → `11.750`
   - `acc_eks_15_14` → `32.755`
   - `acc_eks_20_05` → `4.500`
   - `acc_eks_21_07` → `3.000`
2. **~34 identifiants dupliqués supprimés** (gardé la première occurrence de chaque id, correctement tarifée quand elle l'était) : `acc_selicomne`, `acc_paumelle`, `acc_gache_fermeture`, `acc_kit_moteur`, `acc_rallonge_axe_60`, `acc_rallonge_axe_70`, `acc_bouchon_lame_55`, `acc_bouchon_lame_45`, `acc_ex45_n101`, `acc_ex45_n103`, `acc_ex45_n105`, `acc_n52_035`, `acc_ex45_a112`, `acc_ex45_a114`, `acc_ex45_a115`, `acc_ex45_a120`, `acc_ex45_a130`, `acc_ex45_a132`, `acc_ex45_a133`, `acc_ex45_a134`, `acc_ex60_a256`, `acc_bouchon_trou`, plus 13 doublons "les deux à zéro" (`acc_acc67_252` à `257`, `acc_eks_10_19_2`, `acc_eks_17_01`, `acc_eks_17_08`, `acc_eks_21_07` [second doublon distinct de celui listé au point 1], `acc_gs10_07`, `acc_gs10_07_4`, `acc_jv_242`).
3. **Prix Kit Oscillo-battant** (existaient déjà comme entrées à `0`, source : AtelierPro `articles.txt`, désignations "Kit OB classic 1V"/"2V") :
   - `acc_kit_ob_classic_1v` → `160.000`
   - `acc_kit_ob_classic_2v` → `180.000`
4. **Non touché intentionnellement** : l'entrée `acc_kit_oscillo_battant` (65 DT) existe toujours dans ce fichier mais n'est plus référencée nulle part dans le code (voir changements `aluCalculEngine.ts` ci-dessous) — orpheline inoffensive, laissée en place car hors du périmètre exact validé par le client.

---

## `src/data/initialArticles.ts`

Trois suppressions ciblées (via `Edit`, pas de réécriture complète) :

1. Entrée `id: 406844, reference: "FSQ124"` (sans espace) — doublon à 0 DT sur toutes les couleurs de `FSQ 124` (id 406653, avec espace, correctement tarifé). **Supprimée.**
2. Entrée `id: 406846, reference: "FSQ408"` (sans espace) — même situation pour `FSQ 408` (id 406678). **Supprimée.**
3. Entrées `id: 409108, reference: "FSQ 107"` (210 DT) et `id: 409109, reference: "FSQ 108"` (140 DT) — prix confirmés faux par AtelierPro (vrai prix : 19.811 / 20.728 DT, déjà présents aux ids 406623/406628). **Supprimées.**

---

## `src/utils/aluCalculEngine.ts`

### A. Fallbacks de prix `getAccPrice(id, fallback)`
- `getAccPrice('acc_eks_21_07', 8.000)` → `getAccPrice('acc_eks_21_07', 3.000)` (2 occurrences)
- `getAccPrice('acc_eks_10_03', 15.000)` → `getAccPrice('acc_eks_10_03', 3.224)` (2 occurrences)
- `getAccPrice('acc_eks_20_05', 18.000)` → `getAccPrice('acc_eks_20_05', 4.500)` (2 occurrences)
- `getAccPrice('acc_eks_10_19', 20.000)` → `getAccPrice('acc_eks_10_19', 11.750)` (2 occurrences)
- `getAccPrice('acc_eks_15_14', 12.000)` → `getAccPrice('acc_eks_15_14', 32.755)` (2 occurrences)
- Dictionnaire de fallback des profilés : `'FSQ 107': 35.000` → `19.811`, `'FSQ 108': 120.000` → `20.728`

### B. Kit Oscillo-battant — détection + consolidation
Avant (~ligne 2683) :
```js
const isOscillo = item.type_ouverture?.toLowerCase().includes('oscillo') || item.ouverture_type?.toLowerCase().includes('oscillo');
```
Après :
```js
const isOscillo = item.type_ouverture?.toLowerCase().includes('oscillo') || item.ouverture_type?.toLowerCase().includes('oscillo') || item.ouverture_type === 'Osilobattante';
```
(La valeur `'Osilobattante'` elle-même n'est PAS modifiée dans `productCatalog.ts` — voir `INDEX.md` section 5, c'est une valeur intentionnelle d'AtelierPro.)

Bloc supprimé entièrement (ancien kit à 65 DT, doublonnait avec le bloc ci-dessous) :
```js
if (isOscillo) {
  const oscilloPrice = getAccPrice('acc_kit_oscillo_battant', 65.000);
  rawAccessories.push({ id: `acc_oscillo_${itemIdx}`, ..., designation: 'Kit Oscillo-battant complet (compas, tringles, gâches)', ... });
}
```

Bloc modifié (celui qui reste, déclenché sur `item.ouverture_type === 'Osilobattante' || ... 'Oscillo-battante' || ... 'oscillo_battant'`) — avant :
```js
const obPrice = getAccPrice('acc_kit_ob', 105.000);
rawAccessories.push({ ..., designation: 'Kit mécanisme Oscillo-battant complet (OB Roto/Master)', reference: 'Kit Oscillo-battant', ... });
```
Après :
```js
const isObUnVantail = nbVantaux === 1;
const obPrice = isObUnVantail
  ? getAccPrice('acc_kit_ob_classic_1v', 160.000)
  : getAccPrice('acc_kit_ob_classic_2v', 180.000);
rawAccessories.push({ ..., designation: isObUnVantail ? 'Kit OB Classic 1V' : 'Kit OB Classic 2V', reference: isObUnVantail ? 'Kit OB Classic 1V' : 'Kit OB Classic 2V', ... });
```
Effet secondaire recherché : la ligne `else if (!isOscillo)` (plus loin dans la même fonction, ~ligne 2734 avant les suppressions ci-dessus) qui ajoutait à tort une crémone standard sur une fenêtre oscillo-battante cesse de se déclencher maintenant que `isOscillo` détecte correctement `'Osilobattante'`. Cette ligne elle-même n'a pas été modifiée.

### C. Nombre de lames de volet roulant (deux occurrences identiques)
Avant : `const nbLames = Math.round(H / 5.0) + 1;`
Après : `const nbLames = Math.round(H / slatCfg.stepCm) + 1;`
(`slatCfg = detectSlatConfig(item)` était déjà calculé juste au-dessus aux deux endroits — `stepCm` existait déjà dans l'objet mais n'était jamais lu.)

### D. Hauteur d'ouvrant porte ALLUCO
Avant : `hOuvrant = Math.max(10, parseFloat((H - (isPorte ? (isAluco ? 4.5 : 4.6) : 4.4)).toFixed(1)));`
Après : `hOuvrant = Math.max(10, parseFloat((H - (isPorte ? (isAluco ? 4.6 : 4.6) : 4.4)).toFixed(1)));`
(Seul le `4.5` de la branche `isAluco` devient `4.6` — confirmé identique pour 1 et 2 vantaux sur catalogue pages 86 et 87 en haute résolution.)

### E. Hauteur de parclose porte ALLUCO
Avant : `hParc = Math.max(5, parseFloat((isPorte ? H - 26.6 : H - 17.8).toFixed(1)));`
Après : `hParc = Math.max(5, parseFloat((isPorte ? (isAluco && nbVantaux > 1 ? H - 20.2 : H - 26.6) : H - 17.8).toFixed(1)));`
(Porte 1 vantail : reste H−26.6, confirmé correct. Porte 2 vantaux ALLUCO : devient H−20.2, confirmé catalogue page 87. Portes non-ALLUCO : comportement inchangé.)

### F. Rejet d'eau coulissant ALLUCO (CSQ124)
Avant : `lengthCm: L,` (dans le bloc `if (isAluco)` du rejet d'eau)
Après : `lengthCm: L - 0.4,`
(Confirmé catalogue pages 64 et 68 : déduction réelle de 4mm, précédemment ignorée.)

### G. Désignations dans `PROFILE_EXTRUSION_NAMES`
```
'CSQ 125': 'Profilé Seuil PMR Bas Porte (CSQ 125)'          → 'Profilé Cache Rejet d\'Eau (CSQ 125)'
'CSQ 201': 'Profilé Dormant Coulissant 3 Rails Plat ...'     → 'Profilé Dormant Coulissant 2 Rails Haut Plat (CSQ 201)'
'CSQ 202': 'Profilé Dormant Coulissant 3 Rails Couvre-joint...' → 'Profilé Dormant Coulissant 2 Rails Haut Couvre-joint (CSQ 202)'
'CSQ 203': 'Profilé Dormant Coulissant 3 Rails Clipsable ...' → 'Profilé Dormant Coulissant 2 Rails Haut Clipsable (CSQ 203)'
'CSQ 210': 'Profilé Dormant Monorail Galandage (CSQ 210)'    → 'Profilé Dormant Coulissant 3 Rails (CSQ 210)'
```
(Confirmé catalogue page 14 : CSQ203 = "sans récupérateur d'eau", compagnon 2 rails de CSQ103 ; CSQ210 = le vrai profilé 3 rails, 512.6mm.)

### H. Garde-fou de l'optimiseur de découpe (`optimizeCuttingStock`)
Avant (branche "nouvelle barre") :
```js
scrapCm: barLengthCm - cut.lengthCm,
scrapPercent: ((barLengthCm - cut.lengthCm) / barLengthCm) * 100
```
Après :
```js
if (cut.lengthCm > barLengthCm) {
  console.warn(`optimizeCuttingStock: piece ${profilRef} (${cut.lengthCm}cm) exceeds standard bar length (${barLengthCm}cm) — needs splicing, not representable as a single bar.`);
}
// ...
scrapCm: Math.max(0, barLengthCm - cut.lengthCm),
scrapPercent: Math.max(0, ((barLengthCm - cut.lengthCm) / barLengthCm) * 100)
```

### I. Diviseur vitrage "3 vantaux" ALLUCO/TPR-67 coulissant (correctif "2 rails vs 3 rails", appliqué après le Batch 1 principal)
Avant :
```js
// L_verre = 2V: (L - 18.3)/2 cm, 3V: (L - 20.3)/3 cm, 4V: (L - 31.1)/4 cm
...
if (nbVantaux === 3) {
  lVerre = Math.max(5, parseFloat(((L - 20.3) / 3).toFixed(1)));
}
```
Après :
```js
// L_verre = 2V: (L - 18.3)/2 cm, 3V (sur 2 rails, config par défaut): (L - 20.3)/2 cm, 4V: (L - 31.1)/4 cm
...
if (nbVantaux === 3) {
  lVerre = Math.max(5, parseFloat(((L - 20.3) / 2).toFixed(1)));
}
```
**Contexte** : le seul type produit "3 vantaux" existant dans `productCatalog.ts` utilise par défaut des profilés 2 rails (CSQ103/104/105/116) mais calculait le vitrage avec le diviseur de la config 3 rails — confirmé incohérent après que le client a montré, via son propre compte AtelierPro, que "3 vantaux sur 2 rails" et "3 vantaux sur 3 rails" sont deux types distincts et sélectionnables. Ce correctif aligne la formule sur le matériel réellement utilisé par défaut (2 rails). **Non fait** : ajouter un second type produit "3 vantaux sur 3 rails" avec ses propres profils (CSQ110/CSQ210) et son propre diviseur `/3` — voir `INDEX.md` section 7 ("Option B", reportée).

---

## Note sur `git diff --stat`

`src/data/initialArticles.ts`, `aluCalculEngine.ts`, `ArticlesView.tsx`, `DevisCreateView.tsx`, `productCatalog.ts`, `profileImages.ts` avaient déjà des modifications non commitées **avant le début de cette session** (visibles dans le `git status` de départ). Un `git diff --stat` global mélange donc ce travail préexistant avec les changements de cette session. Cette liste-ci est la seule source fiable pour savoir précisément ce que **cette session** a changé.
