# Module Devis Aluminium — Conception (data model + logique)

> Basé sur la structure générale observée dans la catégorie "logiciel de gestion menuiserie aluminium"
> (vocabulaire métier standard, pas de données ni tarifs d'un éditeur précis).
> Les tarifs/catalogue (Articles) sont à ta charge — ce document couvre uniquement la structure du devis.

## 1. Entités (data model)

```
Devis (en-tête)
  - id
  - client_id (nullable)
  - date
  - notes
  - statut: brouillon | envoyé | accepté | refusé | converti
  - created_by
  - totaux (calculés, pas stockés en dur)

DevisLine (une ligne = un produit)
  - id
  - devis_id
  - famille           -> ex: Coulissant, À la française, Oscillo-battant...
  - type_produit       -> ex: Fenêtre 1 vantail, Porte 2 vantaux...
  - hauteur_cm
  - largeur_cm
  - quantite
  - couleur
  - remplissage        -> verre / panneau plein / tôle...
  - vitrage            -> simple / double / triple
  - motif               -> optionnel (sablage, décor...)

CompositionItem (0..n par DevisLine)
  - devis_line_id
  - role: dormant | ouvrant | meneau | traverse | montant_lateral | montant_central
  - catalog_ref_id -> FK vers TON catalogue (à toi de le peupler)
  - quantite_barres

OptionModule (0..n par DevisLine, activable par checkbox)
  - type: store_rideau | moustiquaire | autre
  - attributs: jsonb libre (chaque type a ses propres champs)
    ex store_rideau: { type_lame, couleur, coffre, encastre: bool, axe: bool, tirant_renforce: bool }
    ex moustiquaire: { hauteur_cm, largeur_cm }

MargeConfig (par devis ou par ligne)
  - cible: fenetres_portes | moustiquaire | store_rideau
  - type_marge: pourcentage | montant_fixe
  - valeur

CatalogItem (TA propre base — pas copiée)
  - reference
  - famille
  - description
  - prix_par_couleur: { blanc, gris, noir, mat, givre, ... } x { ht, ttc }
  - taux_tva (config globale, formule standard: ttc = ht * (1 + tva/100))
```

## 2. Logique conditionnelle (cascade des champs)

- **Famille → Type de produit** : la sélection de la famille filtre la liste des types disponibles (relation many-to-many en base, pas de hardcode)
- **Type de produit → bloc de composition** : chaque type détermine quels rôles de `CompositionItem` sont requis
  - ex "Porte 2 vantaux" → dormant + montant latéral + montant central
  - ex "Fenêtre 1 vantail" → dormant + ouvrant simple
- **Case "Partie Fixe" cochée** → révèle Dim.1 / Dim.2 (champs numériques conditionnels)
- **Case "Sans couvre joint" cochée** → révèle un select d'emplacement (Droite/Gauche/etc.)
- **Chaque OptionModule** est indépendant : checkbox = affiche/masque son sous-formulaire ; décocher peut vider ou juste masquer (à décider selon UX voulue)
- **Aperçu produit (SVG dynamique)** : composant pur, fonction de (type_produit, hauteur, largeur, parties_fixes) → redessine un schéma annoté à chaque changement, sans appel serveur

## 3. Contenu des selects (vocabulaire générique du métier, à toi de compléter/adapter)

Ce sont des catégories standards de la menuiserie aluminium, pas des données propriétaires :

- **Familles** : Coulissant, À la française, Oscillo-battant, Baie vitrée, Porte d'entrée...
- **Types d'ouverture** : 1 vantail, 2 vantaux, 3 vantaux...
- **Vitrage** : Simple vitrage, Double vitrage, Triple vitrage
- **Remplissage** : Verre, Panneau plein, Tôle laquée...
- **Couleurs** : nomenclature RAL standard (Blanc 9016, Gris anthracite 7016, Noir 9005, effet bois...)
- **Quincaillerie / verrouillage** : nombre de points (2/3/5 points), types de crémone standards du marché
- **Modules optionnels** : Store rideau (lame injectée / lame alu), Moustiquaire (enroulable / fixe)

## 3bis. Listes de valeurs prêtes à l'emploi (génériques métier, à adapter)

Générées à partir de connaissances générales du secteur menuiserie aluminium (normes RAL,
standards de quincaillerie du marché) — pas issues d'un site précis. À ajuster selon tes
vrais fournisseurs/gammes.

**Familles de produits**
- Coulissant (galandage, standard, 2/3/4 rails)
- À la française (1/2 vantaux)
- Oscillo-battant
- Baie vitrée / Porte-fenêtre
- Porte d'entrée
- Fixe / Imposte
- Véranda / Verrière

**Types d'ouverture (par famille)**
- Fenêtre — 1 vantail / 2 vantaux / 3 vantaux
- Porte — 1 vantail / 2 vantaux
- Coulissant — 2 rails / 3 rails / galandage

**Couleurs (nomenclature RAL standard aluminium)**
- Blanc RAL 9016
- Gris anthracite RAL 7016
- Noir RAL 9005
- Gris RAL 7040 / 7035
- Marron RAL 8017
- Effet bois (chêne doré, noyer, gris cérusé) — décor par thermolaquage/sublimation
- Bronze / Champagne (anodisé)

**Vitrage**
- Simple vitrage (4mm, 6mm, 8mm)
- Double vitrage standard : 4/16/4, 4/20/4, 6/16/4
- Double vitrage renforcé/feuilleté : 44.2/16/4
- Triple vitrage : 4/12/4/12/4
- Options : feuilleté sécurit, dépoli/sablé, teinté (bronze, gris, vert)

**Remplissage (pour parties non vitrées)**
- Panneau aluminium plein laqué
- Panneau composite (type Dibond)
- Panneau sandwich isolant
- Tôle perforée (claustra)

**Quincaillerie / verrouillage**
- Nombre de points de fermeture : 2 points / 3 points / 5 points / multipoints
- Type de crémone : à crémaillère, à galets, monopoint
- Marques courantes du marché (à titre d'exemple générique) : Roto, GU, Fapim, Siegenia
- Paumelles : standard / réglables 3D
- Poignées : bec de cane, tirant, à clé

**Modules optionnels — Store rideau**
- Type de lame : injectée 39mm / 42mm / 45mm, extrudée
- Coffre : apparent (rond, carré) / monobloc / sous-linteau
- Manœuvre : sangle, manivelle, moteur (radio/filaire)
- Options : verrouillage automatique, butée de fin de course, grille d'aération

**Modules optionnels — Moustiquaire**
- Type : enroulable verticale, plissée, battante, fixe sur cadre
- Toile : fibre de verre standard, anti-pollen, brise-vue

**Types de motif/décor (parties opaques ou sablées)**
- Sablage : givré, rayures, dépoli intégral
- Décor imprimé (film décoratif)
- Aucun (transparent standard)

## 4. Workflow / statuts

```
Brouillon --(envoi client)--> Envoyé --(réponse)--> Accepté | Refusé
                                                        |
                                                        v
                                          Bon de Livraison --(facturation)--> Facture
```
- Édition possible uniquement au statut Brouillon
- Conversion Devis → BL → Facture = copie des lignes + nouveau statut, pas de duplication de logique métier

## 5. Pattern UI/UX

- Page unique scrollable avec sections en "cards" (pas de wizard multi-écrans) : Infos générales / Produits / Marges & TVA
- Bouton "Ajouter un produit" = duplique un bloc DevisLine vide
- Bouton "Ligne libre" = ligne texte simple sans composition structurée (pour cas hors-catalogue)
- Icône "dupliquer" en haut de chaque bloc produit (copie rapide d'une ligne existante)
- Panneau d'aperçu temps réel à droite ou en bas du bloc produit
- Champs obligatoires marqués d'un astérisque, validation au submit

## 6. Prochaines étapes

1. Choisir la stack (à définir avec toi)
2. Modéliser le schéma DB réel (SQL/Prisma/etc.) à partir de la section 1
3. Construire le formulaire avec la logique conditionnelle de la section 2
4. Peupler `CatalogItem` avec TES vrais tarifs (fournisseur ou saisie manuelle)
5. Implémenter le moteur de calcul du devis (toi de définir la formule — surface, mètre linéaire, forfait, etc.)
