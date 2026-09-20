# ref 67 — ALLUCO "SQUARE 67" Sliding System Catalogue

## What this is

`ref 67` is a 76-page scanned PDF export (`ref 67-01.jpg` … `ref 67-76.jpg`) of a manufacturer technical catalogue published by **ALLUCO** (Aluminium Building Systems, Moknine, Tunisia — BP 47, Z.I. Moknine 5050, tel. +216 73 415 300 / +216 71 757 228, info@alluco.com) for their **"SQUARE 67" aluminium sliding window/door system** ("Système des Menuiseries en Aluminium Coulissant", 40 mm frame depth, ~67 mm reference section).

It is **not** an AtelierPro-style internal workshop worksheet. It is a manufacturer spec book containing: alloy/mechanical data, technical performance ratings, a full profile reference catalogue (weights, inertia, references), an accessories/hardware catalogue, assembly & machining instructions, structural deflection ("inertia") curves, and — most usefully for this audit — a **"Débitage" (cutting‑list) section** that gives the actual cutting‑length and glazing‑size **formulas** per window configuration (2/3/4‑panel, 2‑rail/3‑rail, with/without mosquito screen, with/without drip‑edge "bavette").

**Important caveat on precision:** the source scan is only **595 × 842 px per page** — a hard resolution ceiling (confirmed via `System.Drawing`/native pixel inspection, not a rendering artifact of the reading tool). Large/medium print (titles, main table cells, the VITRAGE/glazing tables) is fully legible and was cross‑verified with 8×–25× bicubic‑upscaled crops where it mattered. The smallest embedded labels (a few "Debitage" cut‑reference codes inside tiny profile‑icon graphics on the cutting‑list pages) remain genuinely illegible at any zoom level — these are explicitly flagged below as **uncertain**, never guessed.

Total pages read: **76 / 76**.

---

## 1. Bon Commande Global (global order form)

**Not present in this document.** No page in ref 67 shows an order-form layout, a combined profiles+accessories+price structure, or any pricing at all. If a "Bon de Commande Global" exists for SQUARE 67, it is a separate document not included in this 76-page file.

---

## 2. Feuille Découpe (cutting sheet / cutting list)

The **"Débitage" section (pages 63–70)** is effectively the cutting sheet. For each window configuration, a table gives, per profile:

- **Rep** (item number, P1, P2, …)
- **Ref** (profile code, e.g. CSQ103)
- **Désignation** (FR/EN description)
- **Debitage** (the cut-length reference — a formula expressed in terms of the window's overall **L** (width) and **H** (height), or occasionally a third symbol **"G"**)
- **Qté** (quantity of that cut per window)

### Confirmed cut-length references (2‑panel window, `ref 67-64`, "Fenêtre coulissante 2vtx"):

| Rep | Ref | Désignation | Cut length | Qté |
|---|---|---|---|---|
| P1 | CSQ103 | Dormant 2 rails avec récupérateur d'eau + couvre-joint rapporté (bottom rail, **with** water collector) | **L** | 1 |
| P2 | CSQ203 | Top rail + 2 side jambs (see note below) | **L** (×1) and **H** (×2) | 1 + 2 |
| P3 | CSQ104 | Montant latéral ouvrant (leaf side upright) | **H − 90** | 2 |
| P4 | CSQ105 | Montant central ouvrant (leaf central upright) | **H − 90** | 2 |
| P5 | CSQ106 | Traverse haute et basse (leaf top/bottom rail) | **"G-…"** — exact deduction not confirmed, see note | 4 |
| P6 | CSQ114 | Réducteur de feuillure (glazing rebate reducer) | same **"G-…"** ref, plus a 2nd sub-line **"H-17x"** (last digit uncertain: 179 or 170) | 4 + 4 |
| P7 | CSQ116 | Rail rapporté | **L − 75** | 2 |
| P8 | CSQ124 | Rejet d'eau (water drain) | **L − 4x** (exact constant not fully legible) | 1 |
| P9 | CSQ125 | Cache rejet d'eau | **L − 4x** (not fully legible) | 1 |
| P10 | CSQ302 | Couvre-joint droit 35 mm | **L − 14x** (reads ≈ L−142) | 2 |

**Confirmed pattern (P3/P4): leaf uprights = H − 90 mm**, consistently across every window size checked (2/3/4 panels, pages 64–70 all show "H-90" for CSQ104 and CSQ105/107 leaf uprights). This is the single cleanest, highest-confidence cutting formula recovered from the document.

**Note on P2/CSQ203:** across every Débitage page (64–70) the désignation text for CSQ203 is printed identically to CSQ103's ("avec récupérateur d'eau" = **with** water collector) — but CSQ203 is independently defined on the profile-reference page (p.14) as "**sans** récupérateur d'eau" (without). This is almost certainly a copy-paste text error in the source catalogue (the description was probably duplicated from the row above and never edited), not a real second "with collector" variant. What the quantity split (1×L + 2×H) confirms, regardless of the wrong wording, is the actual **frame structure**: 1 bottom rail (CSQ103, with collector, cut to L) + 1 top rail (CSQ203, cut to L) + 2 side jambs (CSQ203, cut to H).

**"G" symbol:** several pieces (P5 Traverse haute/basse, and one sub-reference of P6 Réducteur) are cut to a reference labelled **"G"**, distinct from L and H. This is presumably a derived leaf/vitrage-width quantity (the leaf width, itself a function of L divided by panel count), but the document never defines "G" explicitly on a legible page, and the deduction constant that follows "G-" could not be read with confidence (best guess "G‑11x2", not certain). **This should be re-derived from source page 64 at full/original resolution (not the 595×842 export) if pixel-perfect certainty is required.**

**Machining (end-of-bar) geometry** — pages 58–59 ("Usinage / Machining") show notch/slot/angle-cut geometry at profile ends for corner and T-assembly (dormant corners, CSQ108 traverse-to-upright joints, CSQ104/105/107 upright machining) with small dimensions (e.g. ~26.7, 20.6, 10.5mm on the frame corner; 16, 23mm on the CSQ108 traverse; 12.5–13.5, 8.5, 17mm on the uprights). These describe **notch/tenon shapes**, not linear length-deduction formulas, and the smallest digits on these two pages are at the edge of legibility — treat as indicative only.

**Assembly method confirmed (pages 48–53):** both the **dormant (frame) and the ouvrant (leaf/sash) are cut and joined at 45° miter ("coupe d'onglet")** at all four corners, using pin-type corner squaring brackets (ref **136 22**, "équerre à pion"), screwed for mechanical tightening. Water-recovery plugs (ACC67 258) and various end-caps close off the mitred, hollow corners.

---

## 3. Débitage Barres (bar-stock cutting / optimization)

Very little dedicated bar-optimization content exists in this catalogue; what's confirmed (page 5, "Alliage d'aluminium & Le filage"):

- **Alloy: 6060–6063 series (Al Mg Si 0.5), état T5**, per **ISO 209-1:1989(F)**; mechanical characteristics per **ISO 6362-2**.
- Minimum mechanical values: **Hardness (Dureté) = 68 HB**; **Breaking load (Rm) = 200 MPa**; **Elastic limit (R0.2) = 160 MPa**; **Elongation (A) = 10%**.
- Weights per linear metre published in the catalogue are **theoretical**; real weights are **±10%** tolerance.
- **Standard bar length = 6.5 m** (for lacquered/"laqué" profiles).
- **Allow for waste ("chutes") at bar ends of up to 10 cm after surface treatment** (lacquering) — due to adhesion tests, hanging marks from the coating line, etc. This 10 cm should be treated as unusable stock at each bar end when computing net usable bar length (i.e. effectively ~6.3 m usable per 6.5 m bar, though the document does not state this subtraction explicitly as a formula — it's stated as a fabrication caution, not a computed net length).
- No nesting/optimization algorithm, no kerf-width (saw blade loss) constant, and no "number of bars needed per X linear metres" formula are given anywhere in the 76 pages.

Certifications mentioned: CO2 Neutral, Istituto Giordano, ISO 9001:2015, Bureau Veritas.

---

## 4. Quincaillerie & Joints (hardware & seals)

### 4.1 Joints / seals catalogue (page 28)

| Ref | Désignation |
|---|---|
| J5007 | Joint de vitrage uniglasse **3 mm** |
| J5006 | Joint de vitrage uniglasse **4 mm** |
| J5005 | Joint de vitrage uniglasse **5 mm** |
| J5004 | Joint de vitrage uniglasse **6 mm** |
| J220 | Joint de vitrage **2 mm** |
| JBR7X6 | Joint brosse (brush seal) 6 mm |
| JBR7X6 fin seal | Joint brosse 6 mm, "fin seal" variant |
| J2055 | Joint de battement central (central bead/flap seal) |
| JU6mm | Joint de vitrage en U, **6 mm** |
| JU8mm | Joint de vitrage en U, **8 mm** |
| JU18mm | Joint de vitrage en U, **18 mm** |

### 4.2 Glass-thickness → parclose/réducteur/joint selection (page 29, "PROFILÉS: VOLUME TAKING")

**With straight glazing bead ("parclose droite"), rebate depth 16.5 mm — parclose ref CSQ114:**

| Épaisseur vitrage (mm) | Joint extérieur | Joint intérieur |
|---|---|---|
| 6 | J5004 | J5005 |
| 8 | J5005 | J5006 |
| 10 | J5006 | J5007 |

**With straight glazing bead, rebate depth 25.6 mm — parclose ref CSQ106:**

| Épaisseur vitrage (mm) | Joint extérieur | Joint intérieur |
|---|---|---|
| 18 | J5006 | J5006 |
| 20 | J5007 | J5007 |
| 22 | J220 | J220 |

**With rebate reducer ("réducteur de feuillure"), CSQ114:**

| Épaisseur vitrage (mm) | Réducteur | Joint U |
|---|---|---|
| 6 | CSQ114 | JU6mm |
| 8 | CSQ114 | JU8mm |

**With rebate reducer, CSQ106** (table header on the source page still reads "16.5mm" although the glass value shown is 18mm — printed as-is, likely a caption inconsistency in the source):

| Épaisseur vitrage (mm) | Réducteur | Joint U |
|---|---|---|
| 18 | CSQ106 | JU18mm |

The system has **two base rebate ("feuillure") depths: 16.5 mm and 25.6 mm**, and CSQ114 is the reducer piece used to bring the deeper rebate down for thinner glass.

### 4.3 Per-window linear-metre joint quantities (from the Débitage pages)

| Window config | J1 (J220, glazing seal) | J2 (J2055, central flap) | J3 (JBR7X6 FS, brush) |
|---|---|---|---|
| 2vtx/2 rails (p64) | 4L + 8H m | 2H m | 4L + 8H m |
| 3vtx/2 rails (p65) | 4L + 12H m | 4H m | 4L + 8H m |
| 3vtx/3 rails (p66) | 4L + 12H m | 4H m | 4L + 8H m |
| 4vtx/2 rails (p67) | 4L + 16H m | 4H m | 4L + 10H m |

i.e. total glazing-seal length scales as **4×(window width) + (number of vertical seal runs)×(window height)**, and the central-flap seal scales with **the number of leaf-to-leaf overlaps × H**.

### 4.4 Hardware / accessories catalogue (pages 24–27, plus per-window BOMs pages 64–70)

Rollers / carriages:
- **03120000** — Chariot réglable (adjustable roller carriage), **max load 90 kg per carriage** ("ADJUSTABLE CARRERA")
- **0312000** — Galet double réglable (double adjustable roller) — note: one digit different from 03120000; likely the roller-wheel sub-component vs. the full carriage assembly, but this was not confirmed in-document and should be checked before assuming they're interchangeable.

Locks / handles:
- **07ma1p250** — Serrure 1 point
- **07ma3p660** — Serrure 2 points (code oddly contains "3p" for a 2-point lock — printed as-is)
- **07ma3p1130** — Serrure 3 points
- **07FAIP220** — Serrure/lock 1 point, Lg. 220mm (used in the 3-rail/4-panel BOMs)
- **00997** — Crémone KORA ligne droite (Cremona-style espagnolette handle)
- Handle range "**Supra7**": Asia (04153), Kora (04154), Prima (04155), Aria (04156)

Closures / strikes / hooks:
- **06004** — Fermeture BRIO ligne droite (BRIO straight-line closure)
- **13622CO** — Équerre d'assemblage dormant (frame corner assembly bracket, also called "136 22" in the assembly-detail drawings)
- **04694000** — Gâche (strike plate) — used in all Débitage BOMs
- **033280000** — Gâche (strike plate) — a *different* code, listed on p.27; possibly an older/alternate strike plate reference
- **04579000** — labelled **"Fermeture encastré / Recessed closure"** on p.27, but **"Crochet / Hook"** in every Débitage BOM (p.64+). This is a genuine designation conflict in the source and is flagged for the audit rather than resolved.

End caps / plugs ("Bouchons", page 24, prefix **ACC 67 2xx**):
118 40 (équerre d'alignement), ACC67250 (étanchéité centrale), ACC67251 (patin arrêtoire), ACC67252 (bouchon montant central), ACC67253 (bouchon butée montant latéral), ACC67254 (bouchon montant latéral renforcé), ACC67255 (bouchon montant central renforcé), ACC67256 (busette d'eau dormant), ACC67257 (bouchon butée montant central), ACC67258 (bouchon récupérateur d'eau), ACC67259 (bouchon rejet d'eau). Kit **ACC67K2V** bundles the corner-cap set for a 2-leaf window.

Screws: Vis4.8x25IP (main assembly screw, TH cruciform), Vis3.2x25 (water-discharge plug screw).

### 4.5 Lock/handle drilling template (page 55)

Multi-point lock installation dimensions on the leaf upright (CSQ108): profile reference height 54mm; handle spindle offset 12.5mm; horizontal hole-pattern width 37.5mm; vertical hole spacing approximately 21.5 / ⌀8 / 10 / ⌀8 / 21.5 mm (medium confidence — small print). Lock mortise width = 9mm (page 53).

---

## 5. Cotes Miroiterie (glass/mirror dimension formulas)

This is the best-documented category, thanks to the "VITRAGE / GLAZING" table present on every Débitage page. **"Débit vitrage" = the glass cutting size (width × height) per pane**, given as a formula in the window's overall **L** (width) and **H** (height), with two variants:

- **"Avec réducteur"** (with the CSQ114/CSQ106 rebate reducer — used for thinner glass per the tables in §4.2)
- **"Sans réducteur"** (without the reducer — thicker glass sitting directly in the deeper 25.6mm rebate)

### Confirmed formulas by configuration

| Window configuration | Avec réducteur | H (avec) | Sans réducteur | H (sans) | Panes (Qté) | Source |
|---|---|---|---|---|---|---|
| 2 panels / 2 rails, standard | **(L − 183) / 2** | **H − 152** | **(L − 175) / 2** | **H − 148** | 2 | p.64, zoom-confirmed |
| 2 panels / 2 rails, **with moustiquaire** (mosquito screen) | **(L − 181) / 2** | **H − 152** | **(L − 176) / 2** | **H − 148** | 2 | p.68, zoom-confirmed |
| 2 panels / 2 rails, **with bavette** (drip edge, CSQ537/538) | **(L − 181) / 2** | **H − 152** | **(L − 176) / 2** | **H − 148** | 2 | p.69 |
| 2 panels / 2 rails, minimal central post (CSQ450) | **(L − 181) / 2** | **H − 152** | **(L − 176) / 2** | **H − 148** | 2 | p.70 |
| 3 panels / 2 rails | **(L − 203) / 2*** | **H − 152** | **(L − 191) / 2** | **H − 148** | 3 | p.65 |
| 3 panels / 3 rails | **(L − 203) / 3** | **H − 152** | **(L − 191) / 2** ⚠ | **H − 148** | 3 | p.66, zoom-confirmed |
| 4 panels / 2 rails | **(L − 311) / 4** | **H − 152** | **(L − 295) / 4** | **H − 148** | 4 | p.67, clearly legible |

\* p.65's "avec réducteur" divisor reads as `/2` at normal resolution but was not independently zoom-verified; since the equivalent 3-panel "avec réducteur" row on p.66 is zoom-confirmed as `/3`, p.65's true divisor is quite possibly also `/3` — flagged as a re-check item, not assumed corrected here.

⚠ **Likely catalogue typo:** the "sans réducteur" row prints divisor `/2` on **both** 3-panel pages (p.65 and p.66) even though there are 3 panes and the matching "avec réducteur" row on the same page correctly divides by 3 (p.66). The 4-panel page (p.67) divides **both** rows correctly by 4, which supports the theory that `/2` on the 3-panel "sans réducteur" rows is a genuine copy‑paste error from the 2-panel template rather than an intentional constant. **Do not implement `/2` for a 3-panel "sans réducteur" case without first re-confirming against the physical/original-resolution catalogue page** — this is exactly the kind of small error that would silently produce undersized (or oversized) glass on a 3rd panel.

### Key takeaways for the calculation engine audit

1. **Height deduction is constant (H−152 / H−148) regardless of panel count or rail count** — it only depends on whether the reducer is used.
2. **Width deduction is NOT a simple linear function of panel count**: total width deduction (before dividing by panel count) is 183/175mm (2 panels), 203/191mm (3 panels), 311/295mm (4 panels) for with/without-reducer respectively. Going from 2→3 panels adds ~20mm (203−183, 191−175=16), but 3→4 panels adds ~108mm (311−203, 295−191=104) — a much bigger jump, consistent with the 4-panel configuration needing an extra full reinforced central mullion (CSQ105, wider) rather than just a thin divider. **This is not a per-panel-constant formula** — it depends on the specific central-mullion/upright hardware used for that leaf count, which should be cross-checked against the profile face-widths in §"Profile catalogue" below (CSQ104, CSQ105/106/107, CSQ114) if the engine needs to generalize to panel counts not covered by these 4 example pages.
3. **Adding a mosquito-screen track (moustiquaire) or a drip-edge (bavette) changes the width deduction by ~2mm** (183→181 with reducer, 175→176 without) versus the plain configuration — a small but real difference that a naive "one formula fits all 2-panel windows" implementation would miss.
4. The glass-thickness-to-parclose/joint selection tables (§4.2) determine which of the two rebate depths (16.5mm vs 25.6mm, i.e. "avec"/"sans réducteur") applies, based on the actual glass make-up thickness (6/8/10mm → reducer path; 18/20/22mm → direct/no-reducer path). Max glass thickness for the system overall is **24mm** (page 9).

---

## Autres observations (other relevant findings)

- **General technical characteristics (page 9):** frame (dormant) width 40mm; leaf (ouvrant) width 29mm; reference section from 86mm. Performance: Air permeability **Classe 1** (EN 12207), Water tightness **7A** (EN 12208), Wind resistance **C3** (EN 12210), Security **CR2** (EN 1530-referenced). Max glass thickness 24mm; theoretical median wall thickness 1.4mm. Max panel dimensions: **width 2200mm × height 3200mm**. Max weight per leaf printed as **"1800 kg"** — this is almost certainly a misprint (perhaps meant to be 180 kg or 108 kg); do not use this figure without independent verification, it is implausible as printed for a single 40mm-frame sliding leaf. Acoustic insulation Rw = 27dB.
- **Structural deflection ("Courbes d'inerties") charts (pages 72–73):** max allowable window height (H, cm) vs. width (B, cm) for a maximum deflection of span/300 ("flèche max 1/300") under a 600 Pascal wind load (61 kg/m², 113 km/h), for two different central-mullion reinforcement levels (Jx = 22.7 cm⁴ and Jx = 33 cm⁴ respectively — curiously the higher-Jx curve plateaus at a *lower* height, so these likely represent different mullion positions/spans rather than a simple "stronger = taller" ranking; not further resolved from the available pages). A boilerplate note about "more hinges recommended above 1800mm height" appears on both pages despite SQUARE 67 being a sliding (not hinged) system — likely reused text from a casement-system version of this template.
- **Reinforcement inertia table (page 38, central upright "Types de renfort"):** 4 reinforcement configurations with Ix = 6.68 / 26.07 / 26.07 / 45.46 cm⁴.
- **"SQUARE 40" cross-reference:** page 74 (ALLUCO's full product range) lists **"SQUARE 40"** as a separate, related coulissant (sliding) system alongside "SQUARE 67". This is very likely the system documented by the parallel **`ref40`** reference set mentioned in the task. Expect ref40 to use the **same naming conventions** (CSQ/FSQ-style profile codes, similar ACC-prefixed accessories, the same J-series joint codes since seals are thickness-based rather than system-specific) but a **different numeric code set** tuned to the 40mm-depth system. When cross-checking profile codes between ref40 and ref67, the J-series joints (J220, J5004–J5007, JU6/8/18mm, JBR7X6) are the most likely to be *shared* components; CSQ/FSQ/ACC67-prefixed codes are SQUARE-67-specific and should NOT be assumed to carry over.
- **Other data-quality issues found (flag for audit, don't silently "correct"):**
  - CSQ203 is defined as "sans récupérateur d'eau" on its profile-catalogue page (14) but is described as "avec récupérateur d'eau" in every Débitage BOM (64–70) — copy-paste error in the source, but the quantity/length split (1×L + 2×H) is trustworthy.
  - Code 04579000 is called "Fermeture encastré / Recessed closure" on p.27 but "Crochet / Hook" in the Débitage BOMs (p.64+).
  - 03120000 (chariot, 90kg max) vs 0312000 (galet, roller) — near-duplicate codes, one digit apart; likely legitimately different parts (assembly vs. sub-component) but not confirmed.
  - 033280000 vs 04694000 — two different codes both labelled "Gâche" (strike plate).
  - The "(L−191)/2" divisor anomaly on 3-panel "sans réducteur" VITRAGE rows (see §5 above).

---

## Appendix — Page-by-page index

| # | Summary |
|---|---|
| 01 | Cover: "SQUARE 67 SLIDING SYSTEM" / Système coulissant, ALLUCO branding. |
| 02 | Slogan page ("success in progress"), no data. |
| 03 | Company positioning statement (marketing, FR/EN). |
| 04 | "Une industrie d'aluminium pas comme les autres" — company/factory description, product range overview. |
| 05 | **Alloy & extrusion data**: 6060-6063 T5, ISO 209-1/6362-2, mechanical minimums, **standard bar length 6.5m**, 10cm end-chute allowance, certifications. |
| 06 | Marketing photo (balcony sliding doors). |
| 07 | Section divider: "Présentation / Presentation". |
| 08 | "SQUARE 67 — Système Coulissant 40mm"; 3 captioned side-jamb 3D views. |
| 09 | **Technical characteristics & performance table**: dormant 40mm, ouvrant 29mm, ref. section 86mm; Air Class1/Water 7A/Wind C3/Security CR2; glass max 24mm; max panel 2200×3200mm; weight, acoustics; opening-count diagrams. |
| 10 | Marketing photo. |
| 11 | Section divider: "Profilés / Profiles". |
| 12–21 | **Full profile reference catalogue** (CSQ 101–539, FSQ 153/534): désignation, weight kg/ml, I(X)/I(Y) cm⁴, développé/PermExt mm, cross-section dims. See notes body for full list. |
| 22 | Marketing photo. |
| 23 | Section divider: "Accessoires / Accessories". |
| 24 | "Bouchons / Plugs" — end-cap parts list (ACC67 250–259, 11840). |
| 25 | Handle range "Supra7": Asia/Kora/Prima/Aria (04153–04156). |
| 26 | Kit "ACC67K2V" — bundled corner-cap kit illustration. |
| 27 | **Hardware**: chariot réglable (90kg max, 03120000), équerre 13622CO, fermeture encastré 04579000, gâche 033280000, serrures 1/2/3 points (07ma…). |
| 28 | **Joints/seals catalogue** — J5004–J5007, J220, JBR7X6(+fin), J2055, JU6/8/18mm. |
| 29 | **Glass-thickness → parclose/réducteur/joint selection tables** (rebate 16.5mm & 25.6mm) — key Cotes Miroiterie reference. |
| 30 | Marketing photo. |
| 31 | Section divider: "Coupes / Section". |
| 32–45 | Assembly cross-section drawings (bottom/top rail, side/central uprights, reinforced variants, 4-panel, moustiquaire & bavette variants). p.38 has the "Types de renfort" Ix table (6.68/26.07/26.07/45.46 cm⁴). |
| 46 | Marketing photo. |
| 47 | Section divider: "Détails Assemblage / Assembly details". |
| 48–55 | **Exploded assembly/machining drawings**: confirms 45° miter corners + pin bracket (136 22) for both dormant and ouvrant; water-plug, strike-plate, mullion-plug, and lock/handle mounting details; p.55 has the lock drilling template dims. |
| 56 | Marketing photo. |
| 57 | Section divider: "Usinage / Machining". |
| 58–59 | **Machining principle drawings** for dormant corner, CSQ108 traverse, CSQ105/107 central upright, CSQ104/108 side upright — notch/slot geometry, small dims partly at resolution limit. |
| 60 | Machining/assembly: plug assembly for reinforced central mullion (CSQ107, ACC67252). |
| 61 | Slogan page. |
| 62 | Marketing photo. |
| 63 | Section divider: "Débitage / Débitage" — cutting-list section begins. |
| 64 | **Débitage — 2-panel window (2 rails), standard.** Full PROFILES/ACCESSOIRES/JOINTS/VITRAGE BOM. Key formula: glass (L−183)/2 × H−152 (with reducer) / (L−175)/2 × H−148 (without). |
| 65 | **Débitage — 3-panel window (2 rails).** Glass (L−203)/2* × H−152 / (L−191)/2 × H−148, Qté 3. |
| 66 | **Débitage — 3-panel window (3 rails).** Glass (L−203)/3 × H−152 / (L−191)/2 [likely typo] × H−148, Qté 3. |
| 67 | **Débitage — 4-panel window (2 rails).** Glass (L−311)/4 × H−152 / (L−295)/4 × H−148, Qté 4. |
| 68 | **Débitage — 2-panel window, with moustiquaire** (CSQ539). Glass (L−181)/2 × H−152 / (L−176)/2 × H−148. |
| 69 | **Débitage — 2-panel window, with bavette** (CSQ537/538 sleeper, FSQ534). Same glass formula as p.68. |
| 70 | Header says "Courbes d'inerties" but content is a **Débitage table — 2-panel window with minimal central post (CSQ450)**. Same glass formula as p.68/69. |
| 71 | Slogan page. |
| 72 | **Inertia/deflection curve** #1: max H vs B at flèche 1/300, 600 Pa wind, Jx=22.7 cm⁴. |
| 73 | **Inertia/deflection curve** #2: same axes, Jx=33 cm⁴, different curve shape. |
| 74 | ALLUCO full product range list — confirms **"SQUARE 40"** as a related sliding system (cross-reference to ref40). |
| 75 | Slogan page (duplicate of p.02 style). |
| 76 | Back cover — ALLUCO contact details (Moknine, Tunisia). |

---

*Compiled from a full read of all 76 pages. Every numeric formula above is attributed to its source page; items marked "uncertain" or flagged as likely typos should be re-checked against the original (non-downsampled) source file before being relied upon for production calculations.*
