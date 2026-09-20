# Guide des fichiers de référence AtelierPro

> Ces 5 fichiers texte, dans `references/` (pas dans un sous-dossier), sont des sauvegardes HTML complètes de pages réelles du logiciel concurrent/référence **AtelierPro** (`https://atelierpro.vortech-x.com`), un système en production utilisé par plusieurs clients. Le client de ce projet a un compte sur ce système et s'en sert comme référence de "comment ça devrait marcher".

## Vue d'ensemble des fichiers

| Fichier | Lignes | Contenu | Utilité principale |
|---|---|---|---|
| `article.txt` | 30 477 | Sauvegarde de la page **Articles** (catalogue profilés + accessoires + prix) | Prix réels, désignations |
| `articles.txt` | 30 477 | Semble identique/quasi-identique à `article.txt` | Idem |
| `code.txt` | 2 228 | Sauvegarde de la page **création de devis** | Structure du formulaire, validation |
| `code_devis2.txt` | 2 236 | Quasi-identique à `code.txt`, légèrement plus riche en commentaires | **Le plus exploité jusqu'ici** — préférer celui-ci |
| `view_devis.txt` | 2 299 | Sauvegarde d'une page de visualisation de devis existant | Peu exploité |

**Ce que ces fichiers NE contiennent PAS** : les formules de calcul géométrique (longueurs de découpe, tailles de vitrage). Une recherche exhaustive dans `code_devis2.txt` pour des motifs comme `hOuvrant`, `hParc`, `toFixed(1)`, `Math.max(10`, `Math.max(5,` n'a rien donné. La fonction `previewSVG` (voir plus bas) délègue le calcul à une bibliothèque externe `window.AlumDrawing`, chargée depuis un bundle JS compilé (`https://atelierpro.vortech-x.com/build/assets/app-*.js`) **non inclus** dans ces sauvegardes HTML. Si un agent futur a besoin des vraies formules géométriques d'AtelierPro, il faudra soit ce bundle JS (accessible publiquement à cette URL si elle est toujours valide), soit des tests empiriques via le compte réel du client (créer des devis test, lire les résultats).

## `article.txt` / `articles.txt` — comment chercher un prix ou une désignation

Structure : un tableau HTML Alpine.js, une ligne (`<tr>`) par article, avec un attribut `data-search="<référence> <désignation en minuscules>"` qui facilite la recherche par grep. Exemple de motif de recherche : `data-search="fsq 107` ou `data-search="csq 125`.

Pour les profilés (barre), chaque ligne a 5 prix (un par couleur : blanc, gris, noir, couleur_mat, couleur_givre), sous forme `<div class="font-semibold text-gray-900">PRIX_HT</div>` suivi du prix TTC juste en dessous. Pour les accessoires simples, un seul prix (`name="prix_simple"`).

**Prix confirmés extraits pendant cette session** (voir aussi `CODE_CHANGES_BATCH1.md`) :
- `EKS 10-03` = 3.224 DT, `EKS 10-19` = 11.750 DT, `EKS 15-14` = 32.755 DT, `EKS 20-05` = 4.500 DT, `EKS 21-07` = 3.000 DT
- `FSQ 107` ("Tringle") = 19.811 DT (blanc) ; `FSQ 108` ("Rejet d'eau") = 20.728 DT (blanc)
- `CSQ 125` = 30.284 DT (blanc) à 34.456 DT (givré) — confirme que c'est un article réellement vendu (pas juste théorique)
- `CSQ 203` = 98.059–111.569 DT ; `CSQ 210` = 214.245–243.763 DT (CSQ210 nettement plus lourd/cher, cohérent avec un profilé 3 rails vs le compagnon 2 rails)
- `Kit OB classic 1V` = 160.000 DT, `Kit OB classic 2V` = 180.000 DT (recherche : `data-search="kit ob classic`)
- `Compas Master` existe comme article séparé (recherche : `data-search="compas master`)

**Pour chercher un nouveau prix** : `grep -i "data-search=\"<référence en minuscules>" references/articles.txt` puis lire ~30 lignes après le premier match pour voir les 5 prix couleur.

## `code_devis2.txt` — structure du formulaire de devis

Points clés déjà identifiés (numéros de ligne approximatifs, peuvent avoir légèrement varié si le fichier a été re-sauvegardé) :

- **Ligne ~1551** : `familyNames` — la liste des 10 familles produit + 3 "autres" (Garde Corps, Store, Moustiquaire), identique à notre `productCatalog.ts` FAMILIES. Confirme que TPR, ALUCO et ALU ECO sont bien 3 marques distinctes dans AtelierPro aussi.
- **Ligne ~1636-1646** : `canPreview()` et `ouvertureLabel()` — la fonction qui traduit `'Osilobattante'` (valeur stockée, jamais changée) en `'Oscillo-battante'` (affichage uniquement). Commentaire du code source original : *"Correction d'affichage uniquement : la donnée en base ('Osilobattante') reste inchangée (utilisée par DevisCalculator pour matcher les tags Excel)."*
- **Ligne ~1648-1671** : `previewSVG()` — appelle `window.AlumDrawing.buildParams(...)` puis `.render(...)`. Les paramètres passés (`chassiSocleWide`, `chassiMontantWide`, `serrureTraverse`, `typeOuverture`, etc.) sont les équivalents fonctionnels de ce que fait notre `productDrawing.ts` — utile pour vérifier qu'on n'a pas oublié un paramètre de dessin, mais ne donne pas les formules elles-mêmes (elles sont dans le bundle JS externe).
- **Ligne ~1699** : la validation `submitForm()` — `return !item.family_id || !item.product_type_id || !item.hauteur || !item.largeur;` — **exactement la même faiblesse** que notre `DevisCreateView.tsx` (pas de contrôle `> 0`). Décision du client : ne pas "corriger" ce point, puisque ce n'est pas un écart avec AtelierPro.
- **Ligne ~655-668, 2082-2084** : sélecteur "Traverse" pour une porte — n'apparaît que si `item.is_porte && hasSerrureTraverseSel(item)`, où `hasSerrureTraverseSel` vérifie que `item.supplements` contient une chaîne incluant "serrure travers". Quand actif, un `<select>` `item.comp_traverse_ref` propose les options de `item.composition.traverse.options`. **Ceci confirme que la config "porte avec traverse"** (qui dans le catalogue ALLUCO change la formule de hauteur du vitrage — voir `ref40/README_ref40.md` §5.1, lignes "Avec traverse FSQ121/FSQ104") **est une fonctionnalité réelle et sélectionnable dans AtelierPro**, pas une curiosité de catalogue sans usage pratique. Notre code n'implémente pas du tout cette variante actuellement.
- **Ligne ~1011-1021, 1887** : `remplissage_id` — le seul champ lié au vitrage/remplissage, un simple `<select>`. Pas de champ "épaisseur" séparé — l'épaisseur est implicite dans le libellé du remplissage (ex. "Clair de 6 mm"). Si on veut un jour implémenter la logique "avec/sans réducteur selon épaisseur" (catalogue ALLUCO §4.2), il faudrait parser l'épaisseur depuis le libellé du remplissage choisi — rien ne prouve qu'AtelierPro le fait réellement server-side, mais la donnée nécessaire (l'épaisseur) est bien disponible dans l'item via ce champ.
- **Recherche "3 rails" / "2 rails" dans ce fichier** : aucune trouvée — la liste des "types" de produit (ex. "Fenêtre — 3 vantaux (sur deux rails)") n'est PAS embarquée statiquement dans cette page, elle est chargée dynamiquement (probablement un appel API non capturé dans cette sauvegarde HTML). **La confirmation de "2 rails vs 3 rails" comme option réelle est venue d'une capture d'écran fournie directement par le client depuis son compte réel**, pas de ces fichiers texte — voir `JOURNAL_SESSION.md` étape 9.

## Limites à garder en tête

- Ces fichiers sont des **instantanés statiques** d'une session de navigation à un instant T — pas une API interrogeable. Toute information qui se charge dynamiquement (listes de types de produit selon la famille choisie, résultats de calcul après soumission) n'y est pas.
- `article.txt` et `articles.txt` ont le même nombre de lignes (30 477) — ils n'ont pas été comparés octet par octet ; les traiter comme une seule source, mais vérifier les deux si un grep dans l'un ne donne rien.
- Si le client obtient un accès direct (lui ou un futur agent avec accès navigateur) au compte AtelierPro réel, c'est la méthode la plus fiable pour lever les doutes restants (voir `INDEX.md` section 7 et `JOURNAL_SESSION.md` étape 9) : créer un devis test avec des dimensions connues, lire le résultat (liste de découpe, vitrage), comparer aux formules du catalogue et du code.
