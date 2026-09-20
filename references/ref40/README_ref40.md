# ref40 — ALLUCO "SQUARE 40" Technical Catalogue: Extracted Data

## What this document is

`references/ref40/` contains 96 scanned pages (`Sans titre - 1-01.jpg` … `Sans
titre - 1-96.jpg`, all read in full for this extraction) of a **commercial +
technical product catalogue published by ALLUCO** (a Tunisian aluminium
building-systems manufacturer, headquartered Z.I. Moknine, Tunisia — see p96)
for their **"SQUARE 40" opening system**: an aluminium **battant / oscillo-battant**
window and door system with a 40 mm frame (dormant) and 48 mm leaf (ouvrant).

**Important scope note:** this is **not** an "AtelierPro"-style internal
workshop order-and-pricing sheet. It is ALLUCO's own printed technical
catalogue for the Square 40 profile range, combining: company/marketing
pages, the alloy/extrusion spec, the full profile reference list (weights,
inertia, perimeter), assembly/machining drawings, hardware kits, and — most
usefully for auditing a calculation engine — a **"Débitage" (cutting-list)
section (pages 84-91)** that gives, per opening type, the exact cut-length
formulas for every profile, the accessory/hardware bill of materials, the
gasket bill of materials, and the glass ("vitrage") sizing formula.

No prices appear anywhere in the 96 pages. There is no bar-stock
nesting/optimization content and no generic "global order form" — see the
notes under each category below for exactly what does and doesn't exist in
this source.

All figures below were read directly off the scans; several small numbers on
lower-resolution table cells could not be resolved with certainty even after
zooming in on the source pixels (browser-based magnification up to ~30×) —
these are explicitly flagged with **"low confidence"** or **"illegible"**
rather than guessed. Do not treat flagged figures as ground truth without
checking the original file/pages listed.

---

## 1. Bon Commande Global (global order form)

**Not present as such.** There is no page structured as a priced global
order form (profiles + accessories + total price). The closest functional
equivalent is the **per-opening-type BOM** on each Débitage page (p84-89):
a "PROFILES" table + an "ACCESSOIRES" table + a "JOINTS" table + a "VITRAGE"
line, all for one opening type (e.g. "Fenêtre battante 1vtx"). This is a
**cutting/parts list**, not a commercial order form — no unit prices, no
supplier/client fields, no totals row exist anywhere in the 96 pages.

If the production calc engine has its own "Bon de Commande Global" concept,
it is **derived from**, not sourced in, this catalogue — it would need to
aggregate the per-type BOMs shown in section 2 below plus pricing from
elsewhere.

---

## 2. Feuille Découpe (cutting sheet)

Found on **pages 84-89** ("Débitage SQUARE 40" section). Each page covers one
opening type and uses an identical table structure:

`Rep | Ref | Section (drawing) | Désignation | Débitage (cut-length formula) | Qté`

Where **L** = overall frame (dormant) width, **H** = overall frame height,
and **h** = height of an optional intermediate rail ("traverse"), all as
seen on the elevation drawing on the same page. Quantities are per single
unit (1 window/door), not per bar.

### 2.1 Fenêtre battante 1 vantail (1-leaf window) — p84

| Rep | Ref | Désignation | Débitage | Qté |
|---|---|---|---|---|
| P1 | FSQ124 | Dormant "L" simple tubulaire + couvre-joint rapporté | L / H | 2 / 2 pcs |
| P2 | FSQ401 | Ouvrant simple tubulaire | L-44 / H-44 | 2 / 2 pcs |
| P3 | FSQ139 | Parclose droite (labelled "F=28mm" on this page — see discrepancy note §5) | L-134 / H-178 | 2 / 2 pcs |
| P4 | FSQ107 | Triangle (French-window threshold corner piece) | (H-252)/2 | 1 pc |
| P5 | FSQ108 | Rejet d'eau | L-111 | 1 pc |
| P6 | CSQ301 | Couvre-joint droit 35 mm | L+62 / H+62 | 2 / 2 pcs |

Accessories: 10840 ×4, 11840 ×4, 36440FR ×8, 001204 (paumelle/hinge) ×2,
00997 (crémone) ×1, ACC67 256 (busette) ×2, 02574000K (kit crémone) ×1 kit,
06501 (vérin de pose) ×6.
Joints: ML03V, ML03, J784, PJ64 — each **2H + 2L** (2 pieces cut to length H
+ 2 pieces cut to length L, i.e. one gasket strip per side of the sash).

### 2.2 Fenêtre battante 2 vantaux (2-leaf window) — p85

| Rep | Ref | Désignation | Débitage | Qté |
|---|---|---|---|---|
| P1 | FSQ124 | Dormant "L" | L / H | 2 / 2 pcs |
| P2 | FSQ401 | Ouvrant simple tubulaire | (L-49)/2 / H-44 | 4 / 4 pcs |
| P3 | FSQ139 | Parclose | (L-229)/2 / H-178 | 4 / 4 pcs |
| P4 | FSQ107 | Triangle | (H-252)/2 | 2 pcs |
| P5 | FSQ108 | Rejet d'eau | (L-103)/2 | 2 pcs |
| P6 | FSQ112 | Battement central (central meeting stile) | H-111 | 1 pc |
| P7 | CSQ301 | Couvre-joint droit 35 mm | L+62 / H+62 | 2 / 2 pcs |

Accessories: 10840 ×8, 11840 ×4, 36440FR ×12, 00120U (paumelle) ×4, 00957
(crémone) ×1, ACC67 256 ×2, 02574000K/0257400K (kit crémone) ×1 kit, 02111K
(kit verrou semi-fixe) ×1 kit, ACC40112 (bouchon battement central) ×1,
06501 ×8. Joints: ML03V 4H+4L, ML03 4H+4L, J784 **3H+2L**, PJ64 4H+4L.

### 2.3 Porte battante 1 vantail (1-leaf door) — p86

| Rep | Ref | Désignation | Débitage | Qté |
|---|---|---|---|---|
| P1 | FSQ408 | Dormant "L" double tubulaire + couvre-joint | L / H | 1 / 2 pcs |
| P2 | FSQ403 | Ouvrant double tubulaire | L-78 / H-45 | 1 / 2 pcs |
| P3 | FSQ111 | Parclose F=24mm | L-215 (4pcs) ; **H-h-150** (2pcs, only if a traverse is fitted) ; **H-266** (2pcs, only if no traverse) | 4/2/2 pcs |
| P4 | FSQ121 | Profil de socle (intermediate rail, only if fitted) | L-215 | 2 pcs |
| P5 | FSQ122 | Adaptateur de socle | L-215 | 1 pc |
| P6 | CSQ301 | Couvre-joint droit 35 mm | L+62 / H+21 | 1 / 2 pcs |

Note P6: doors get only **one** L+62 cover (top rail only — no cover at the
threshold, unlike windows which get two).
Accessories: 10840 ×2, 11840 ×2, 36440FR ×4, 00600N (paumelle bridge) ×4,
02563 (béquille Kora) ×1, SMSQR (serrure 1PT verticale) ×1, GacheALRE ×1,
Vis 4.8×25 IP ×8, 06501 ×6.
Joints: ML03V 2H+4L, ML03 2H+4L, J784 2H+L, PJ64 2H+L, JBR7X6 (brush seal
7mm) 2L.

### 2.4 Porte battante 2 vantaux (2-leaf door) — p87

Same structure as §2.3, widths halved for two leaves: P2 (L-83)/2 & H-46;
P3 (L-395)/2 (8pcs), *H-h-194 (4pcs, low confidence), *H-282 (4pcs, low
confidence); P4/P5 (L-357)/2; P6 L+62 & *H+31 (low confidence — cf. the
1-leaf door's H+21, not independently re-verified, flagged for audit).
New part P7 = FSQ112 (battement central, H-79, 1pc) for the meeting stile.
Accessories/joints follow the same pattern doubled/adjusted for 2 leaves
(see appendix p87 for the as-read list; several accessory quantities on
this page are lower-confidence reads, marked with `~` in the scratch data).

### 2.5 Fenêtre battante 1vtx — "bavette" sill variant — p88

Same as §2.1 but the frame is FSQ535 (adds an integrated drip-flashing
"bavette") instead of FSQ124, with an FSQ534 bavette profile and a
"Couvre décalé 35mm" (P7) instead of the plain couvre-joint. Glass formula
is **identical** to the standard variant: L-149 × H-149. Several small
profile débitage values (P4 qty, P5 qty, P6/P7 formulas) were not fully
resolved at scan resolution — flagged in the appendix.

### 2.6 Porte battante 1vtx — "bavette" sill variant — p89

Same as §2.3 but frame FSQ536 (double tubulaire + couvre-joint + bavette)
and ouvrant FSQ403 (labelled "simple tubulaire" on this page, which
conflicts with the base profile catalogue — see discrepancy note §5).
Joint reference codes on this page (JV242, J5006) differ from the base
door's (ML03V, ML03) — flagged, see §4.4.

**General cutting-list pattern confirmed across all variants:** dormant
(frame) pieces are cut to the **full** L/H; ouvrant (sash) and parclose
pieces are cut to L or H **minus** a fixed constant (per-profile, listed
above); couvre-joints (visible cosmetic covers) are cut **longer** than
L/H (L+62, H+62, etc.) since they wrap around/overlap the frame.

---

## 3. Débitage Barres (bar-stock cutting / nesting)

Only **one** piece of information relevant to this category exists in the
entire document, on **page 5** ("Alliage d'aluminium & Le filage"):

- **Standard bar length: 6.5 m**, for lacquered ("laqués") profiles.
- **Waste/offcut allowance: up to 10 cm at each bar end** must be planned
  for after surface treatment (lacquering), due to adhesion-test marks,
  hanging marks from the lacquering line, etc.
- Linear weights (kg/ml) published in the catalogue are **theoretical**;
  actual weights are **±10%** tolerance (ALLUCO reserves the right to modify
  without notice).
- Material: aluminium alloy **6060-6063 series** (Al Mg Si 0.5), temper T5,
  chemical composition per **ISO 209-1:1989(F)**, mechanical minimums per
  **ISO 6362-2**: Hardness 68 HB, breaking load Rm=200 MPa, elastic limit
  R0.2=160 MPa, elongation A=10%.

**No bar-nesting/optimization algorithm, no "number of bars needed per
profile" table, and no cut-loss/kerf value are given anywhere in the 96
pages.** If the production calc engine implements bar optimization logic,
it is not sourced from this catalogue — only the 6.5 m standard length and
the 10 cm end-waste allowance can be validated against it.

---

## 4. Quincaillerie & Joints (hardware & seals)

### 4.1 Base gasket/joint reference list — p34-35

| Code | Designation |
|---|---|
| J5007 / J5006 / J5005 / J5004 | Joint de vitrage uniglasse 3/4/5/6 mm |
| J784 | Joint central |
| PJ64 | Joint de battement |
| J242 | Joint de vitrage extérieur |
| J220 | Joint de vitrage de 2mm |
| JBR7X6 fin seal | Joint brosse 6mm |
| ML02…ML07 | "Joint minimal" 2–7mm (glazing wedge series) |
| 03524590N | Joint de vitrage minimal extérieur 3mm *(same code also printed against "Tringle de liaison" — likely a labelling duplication in the source, not resolved by us)* |

### 4.2 Glass-thickness → gasket lookup ("Cotes Miroiterie" support data) — p90-91

This is effectively part of the glazing-sizing logic and is reproduced in
full in §5.2 below since it is thickness-driven rather than L/H-driven.

### 4.3 Hardware kits by opening type — p36-50

The catalogue defines discrete **hinge/lock/handle kits**, each offered as
several mutually-exclusive "OU/Or" alternatives (installer/client choice) on
top of fixed common parts. Kits found:

- **Door, 1 leaf** (p36): Paumelle Bridge 00600N, Rosace Asia 02431, lock
  (SMSQR *or* 950302), strike (GACHEALRE *or* GACHEALRE 3PNT), handle
  (02563 "Kora" *or* 02414 "Asia").
- **Door, 2 leaves** (p37): adds threshold socket 02144, cremone strike
  03114K, semi-fixed bolt for the passive leaf (02168K *or* 02191).
- **Window (OF), 1 leaf — Vasistas/Loqueteau and Crémone variants, "Classic"
  and "Chic"** (p38-40): hinge 00120U (2 or 4 pcs depending on leaf size),
  loqueteau 01704, limit-stay 02041K (150mm) *or* 02040K (250mm), cremone
  kit 02574000K, cremone handle 00957/01076/00958.
- **Window "Chic 100 3D" / "NP 100 3D" kits, 1 & 2 leaf** (p41-43, 46-49):
  handedness-specific hinges (04352 gauche / 043541 droit), leaf-height
  banded hinge+stay combos: **T1 = leaf 470-699mm** (codes 043552/043551)
  vs **T2 = leaf 700-1500mm** (codes 043562/043561), 7mm-spindle handle
  choices (04153/04154/02415/00997) or "NP Ultra" handle 03980.
- **Oscillo-battant (OB) kits, Classic & Chic, 1 & 2 leaf** (p44-49):
  OB mechanism 04704/0470501/0395501, OB hinges 04739, **compas (hinge stay)
  selected by leaf length: Type 1 = L 410-1300mm (code 04339), Type 2 =
  L 550-1700mm (code 04340)**, cremone 00959 "Kora" or 01084 "Asia".
- **Supplementary/spare-parts kit** (p50): false hinge 04358, additional
  lock 04770K, additional hinge/stay 04301K/04777K.
- **"À l'Italienne" projecting-window kit** (p50): polyamide filler blocks
  01971/01974 (groove 14/18 and 15/20), Italian compas selected by length —
  **08534000 (10"), 08536000 (14"), 08538000 (16")**.

**Key selection rule confirmed twice in the source:** hinge/stay hardware is
chosen by **leaf dimension band**, not by a continuous formula — Chic
3D100 hinges use two bands (470-699mm / 700-1500mm); OB compas uses two
overlapping length ranges (410-1300mm / 550-1700mm). A calc engine should
implement these as **lookup bands**, not linear interpolation.

### 4.4 Joints columns on the Débitage pages (per-unit hardware/gasket BOM)

See the full tables in §2 above. One inconsistency to flag: the "bavette"
door variant on **p89** lists joint codes JV242 / J5006 instead of the base
door's ML03V / ML03 (p86) — not independently resolved; verify against the
original page if this specific variant is in production use.

---

## 5. Cotes Miroiterie (glass dimension formulas)

### 5.1 Glass cut-size formulas, by opening type (from the Débitage pages)

| Opening type | Page | Glass width | Glass height | Qty |
|---|---|---|---|---|
| Fenêtre battante 1 vantail | 84 | L-149 | H-149 | 1 |
| Fenêtre battante 1vtx (bavette variant) | 88 | L-149 | H-149 | 1 |
| Fenêtre battante 2 vantaux | 85 | (L-257)/2 | H-149 | 2 |
| Porte battante 1 vantail — sans traverse | 86 | L-227 | H-236 | 1 |
| Porte battante 1 vantail — avec traverse FSQ121 | 86 | L-227 | upper: H-h-160 · lower: h-168 | 1 + 1 |
| Porte battante 1 vantail — avec traverse FSQ104 | 86 | L-227 | upper: H-h-140 · lower: h-147 | 1 + 1 |
| Porte battante 2 vantaux — sans traverse | 87 | (L-385)/2 | H-236 | 2 |
| Porte battante 2 vantaux — avec traverse FSQ121 | 87 | (L-385)/2 | upper: H-h-160 · lower: h-168 | 2 + 2 |
| Porte battante 2 vantaux — avec traverse FSQ104 | 87 | (L-385)/2 | upper: H-h-140 · lower: h-147 | 2 + 2 |
| Porte battante 1vtx (bavette variant) — sans traverse | 89 | L-227 | H-136 *(low confidence)* | ~1 |

Where **L** = overall dormant width, **H** = overall dormant height, **h** =
height of the intermediate traverse/rail from the bottom of the door (a
design input the fabricator sets, not derived from L/H).

**Key observations for the audit:**
- The width deduction is **constant per configuration regardless of the
  height formula** — e.g. all three 1-leaf-door glass configs (with/without
  traverse) use the same L-227 width; only the height split changes.
- Going from 1 leaf to 2 leaves, the width deduction increases
  non-proportionally before halving (window: 149→257; door: 227→385) to
  account for the extra ouvrant profile + central meeting stile (battement
  central) consumed at the new mid-joint, then the whole thing is divided
  by the leaf count.
- The FSQ121-based traverse and FSQ104-based traverse give **different**
  height constants (160/168 vs 140/147) — do not assume these are
  interchangeable; the calc engine must key off which rail profile is
  actually used.
- p89 (bavette door variant) appears to show the FSQ104/FSQ121 rows in the
  **opposite order** from p86 — flagged as unverified; re-check the source
  page directly before trusting which constant pairs with which profile
  for that specific variant.

### 5.2 Glass-thickness → glazing-bead & gasket selection (p90-91)

This is the complementary lookup that determines **which parclose bead and
which gasket pair** to use once the glass make-up (thickness) is known,
independent of L/H:

**Straight parclose family (dormant-side gasket = J242 always):**

| Glass thickness | Parclose | Ext. gasket | Int. gasket |
|---|---|---|---|
| 4 mm | FSQ139 (F=12mm) | J242 | J5005 |
| 5 mm | FSQ139 | J242 | J5006 |
| 6 mm | FSQ139 | J242 | J5007 |
| 8 mm | FSQ139 | J242 | J220 |
| 10 mm | FSQ110 (F=18mm) | J242 | J5004 |
| 12 mm | FSQ110 | J242 | J5005 |
| 15 mm | FSQ111 (F=24mm) | J242 | J5004 |
| 16 mm | FSQ111 | J242 | J5005 |
| 18 mm | FSQ111 | J242 | J5007 |
| 20 mm | FSQ111 | J242 | J220 |

**Alternative combined table (p91), same three parcloses, banded by glass
thickness, ext. gasket always ML03V:**

| Glass thickness | Parclose | Ext. gasket | Int. gasket(s) |
|---|---|---|---|
| 6-7 mm | FSQ139 | ML03V | ML02-ML03 |
| 8-9 mm | FSQ110 | ML03V | ML07-ML06 |
| 10-11 mm | FSQ110 | ML03V | ML05-ML04 |
| 12-13 mm | FSQ110 | ML03V | ML03-ML03 |
| 14-15 mm | FSQ111 | ML03V | ML07-ML06 |
| 16-17 mm | FSQ111 | ML03V | ML05-ML06 |
| 18-19 mm | FSQ111 | ML03V | ML03-ML04 |

**"À enfiler" (bead-in-sash) systems — FSQ404 (single glazing):**

| Thickness | Ext. | Int. |
|---|---|---|
| 6-7 mm | ML05 | ML04 |
| 8-9 mm | ML04 | ML03 |
| 10-11 mm | ML03 | ML02 |

**FSQ406 (double glazing):**

| Thickness | Ext. | Int. |
|---|---|---|
| 6-7 mm | ML06 | ML06 |
| 8-9 mm | ML05 | ML05 |
| 10-11 mm | ML04 | ML04 |
| 12-13 mm | ML03 | ML03 |

**Maximum glass thickness for the system overall: 27 mm** (from the p9
technical-characteristics summary). Max panel dimensions: 2500mm (W) ×
2400mm (H); max weight per leaf 120 kg (consult per-type limits).

---

## Autres observations (other relevant logic outside the 5 categories)

- **Performance ratings (p9):** Air permeability Classe 4 (EN 12207),
  water tightness 6A (EN 12208), wind resistance C4 (EN 12210), security
  CR2. Acoustic insulation Rw = 32 dB (EN ISO 140-3 / 717-1, for areas
  ≥ 2.27 m²).
- **Structural sizing / deflection curves (p92-93):** "Flèche max 1/300"
  (max deflection = span/300) charts of allowable width (B) vs height (H)
  at a design wind pressure of 600 Pa (61 kg/m², 113 km/h), with worked
  inertia examples Jx = 10.1 cm⁴ (1-leaf) and Jx = 14.3 cm⁴ (2-leaf/door).
  Explicit rule: **for leaf height > 1800mm, use more hinges and more
  locking points.** This governs whether steel reinforcement is needed
  inside the ouvrant, not covered elsewhere in the doc with a formula —
  only the charts.
- **Variable-angle corner assemblies (p64):** FSQ163 (Ø40mm corner
  profile) + FSQ164 (variable-angle assembly adapter) allow non-90°
  bay/corner windows — confirmed by a drawing showing ~140°/~30° angle
  marks. This is the only non-90°/45°-cut content found; everything else
  in the Débitage section assumes standard rectangular (90°) assemblies —
  no 45° mitred-corner cutting convention is shown or needed for this
  system (corners use machined squares/brackets, not mitres — see next
  point).
- **Assembly method is squared/bracketed, not mitred:** p74-75 show
  corners joined via aluminium brackets (e.g. 36440FR, ACC40112, ACC87
  256) screwed into machined profile ends — i.e. **cut ends are square
  (90°) cuts**, not the 45°-mitre convention common in some other window
  systems. This matters for the audit: none of the FSQ/CSQ "Débitage"
  formulas above imply a 45° end-cut; all are square-cut lengths.
- **Couvre-joint (visible trim cover) family reach chart (p71):** a
  summary drawing groups CSQ300/301/302/303 by projection/reach: CSQ303≈21mm,
  CSQ302≈8.6mm (leg), CSQ301≈13.6mm, CSQ300≈12.9/8.6mm — read with lower
  confidence than the Débitage tables (small nested dimension labels);
  FSQ460 is the largest cover at 20mm leg / 60mm overall reach.
- **Machining templates (p76, 80-81):** drilling positions/diameters for
  hinge mortises and assembly-square screw holes (e.g. Ø8.5/Ø9.5/Ø6.6mm
  holes, 47mm and 22mm reference dims). Relevant only if the calc engine
  drives CNC machining, not pricing/cutting-length logic.
- **This catalogue is one of ~17 ALLUCO product lines** (p94: Alto 15400,
  Oikos 4700, Supra 6000, Prima 6300, Klima 7400/Plus, Entrance Doors
  MG90, Jealousy, Square 67, **Square 40**, Rolling Shutter, Shadow
  Systems, Curtain Wall, Union Line, Ultimate Sky, Pure Line, Pergola
  Azore) — confirms nothing here should be assumed to apply to other
  Alluco systems (e.g. "Square 67") that may appear in other reference
  folders.
- **Documented inconsistencies in the source itself** (not our
  transcription errors — flagged for the audit team to be aware of,
  since a calc engine built by literally copying the Débitage-page labels
  would inherit them):
  1. FSQ139 is labelled "Parclose droite **F=28mm**" throughout the
     Débitage section (p84/85/87/88) but is defined as **F=12mm** both in
     the base profile catalogue (p20-21) and in the thickness-lookup table
     (p90). The F=12mm definition should be trusted.
  2. FSQ403 is labelled "Ouvrant **simple** tubulaire" on the bavette-door
     Débitage page (p89) but is defined as "Ouvrant **double** tubulaire"
     in the base catalogue (p18) and on the standard door Débitage page
     (p86). The "double tubulaire" definition should be trusted.
  3. Full profile weight/perimeter figures in the catalogue are explicitly
     stated as theoretical, ±10% tolerance (p5) — do not treat catalogue
     kg/ml figures as exact for costing.

---

## Appendix — page-by-page index

| p# | Summary |
|---|---|
| 01 | Cover: "SQUARE 40 — Système des Menuiseries en Aluminium battant" |
| 02 | Blank transition page ("success in progress") |
| 03 | Alluco mission statement (FR/EN), no technical data |
| 04 | Company/capabilities intro, product families overview |
| 05 | **Alloy & extrusion spec: 6060-6063 T5, ISO 209-1/6362-2 mechanical minimums, standard bar length 6.5m, 10cm end-waste allowance, ±10% weight tolerance** |
| 06 | Marketing photo (double battant door) |
| 07 | Section divider "Présentation" |
| 08 | Presentation: 3 frame variants (couvre-joint rapporté/sans/intégré) |
| 09 | **Technical characteristics: frame 40mm/leaf 48mm, Classe4/6A/C4/CR2, glass max 27mm, max panel 2500×2400mm, max weight 120kg, Rw=32dB** |
| 10 | Marketing photo (OB door) |
| 11 | Section divider "Profilés" |
| 12-30 | **Profile catalogue: FSQ1xx/4xx and CSQ3xx/4xx reference table (code, désignation, poids kg/ml, I(X), I(Y), perimètre externe)** — condensed table in scratch notes / see profile list in §"Feuille Découpe" intro |
| 31-32 | Section divider + intro "Accessoires & Joints" |
| 33 | Handle design families intro (Supra NP/Asia/Kora) |
| 34 | **Joint reference table: J5004-J5007, J784, PJ64, J242, J220, JBR7X6** |
| 35 | **Joint reference table cont'd: ML02-ML07 minimal-seal series** |
| 36-50 | **Hardware kits by opening type** (door 1/2 leaf, window OF 1v variants, OB kits, Italian-style kit, supplementary kit) — see §4.3 |
| 51-52 | Section-end blank + marketing photo |
| 53 | Section divider "Coupes" (cross-sections) |
| 54-70 | **Technical cross-section drawings** for fenêtre battante / porte battante / châssis fixe / châssis composé, giving rebate depths and part callouts (FSQ/CSQ codes) at each joint — see §"Autres observations" |
| 71 | **Couvre-joint family reach/depth summary chart (CSQ300-306, FSQ460)** |
| 72 | Marketing photo, transition |
| 73 | Section divider "Détails Assemblage" |
| 74-75 | **Isometric assembly drawings**: center-flap, water-nozzle, frame/sash corner-bracket, joint-insertion, door-plinth assemblies |
| 76 | Hinge drilling/mounting template (part 01061000) |
| 77-79 | Blank divider + marketing photos + section divider "Usinage" |
| 80-81 | **Machining drawings**: assembly-square drilling dims, water-nozzle mount, intermediate-rail assembly drilling |
| 82-83 | Marketing photo + section divider "Débitage" |
| **84** | **Débitage: Fenêtre battante 1vtx — full profiles/accessories/joints/vitrage table (§2.1, §5.1)** |
| **85** | **Débitage: Fenêtre battante 2vtx — full table (§2.2, §5.1)** |
| **86** | **Débitage: Porte battante 1vtx — full table incl. conditional traverse glass logic (§2.3, §5.1)** |
| **87** | **Débitage: Porte battante 2vtx — full table (§2.4, §5.1)**, some values lower-confidence |
| **88** | **Débitage: Fenêtre battante 1vtx bavette variant (§2.5)** |
| **89** | **Débitage: Porte battante 1vtx bavette variant (§2.6)**, joint codes differ from base — flagged |
| **90** | **Glass-thickness → parclose/gasket lookup, FSQ139/110/111 (§5.2)** |
| **91** | **Glass-thickness → gasket lookup cont'd, incl. FSQ404/FSQ406 bead-in-sash systems (§5.2)** |
| 92 | Deflection/inertia curve, 1-leaf window (Jx=10.1cm⁴), wind 600Pa |
| 93 | Deflection/inertia curve, 2-leaf door/window (Jx=14.3cm⁴), wind 600Pa |
| 94 | Catalogue of all ~17 Alluco product lines (context only) |
| 95 | Section-end blank divider |
| 96 | Back cover: company contact info (Belgium/Tunisia/Egypt), no technical data |

---

*Compiled by reading all 96 source images directly (including targeted
pixel-level magnification of pages 84-86 to resolve small table digits).
Where a figure could not be confirmed with confidence, it is marked
"illegible" / "low confidence" / with `~` inline above and in the scratch
notes — treat those specific cells as needing a direct re-check against the
original scan before relying on them for cost-sensitive calculations.*
