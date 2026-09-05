/**
 * AlumDrawing — Moteur vectoriel SVG universel de menuiserie aluminium (Rendu HD Réaliste & Cotations).
 * Version Architecturale 10/10 pour Devis Aluminium.
 */

import { REMPLISSAGES, MOTIFS } from '../data/productCatalog';

export interface DrawingParams {
  drawType: 'francaise' | 'coulissante' | 'fixe' | 'partie_fix' | 'garde_corps' | 'store' | 'mousti';
  largeur: number;
  hauteur: number;
  nbVantaux?: number;
  couleur?: 'blanc' | 'gris' | 'noir' | 'couleur_mat' | 'couleur_givre';
  estPorte?: boolean;
  partieFixeType?: string; // 'Sans' | 'Droite' | 'Gauche' | 'Droite et Gauche' | 'Haut' | 'Bas' | 'Haut et Bas'
  pfDim1?: number;
  pfDim2?: number;
  partieFixLabel?: string | null;
  gcKind?: 'linaire' | 'vitre' | 'corpsen' | 'corpsen_sabot' | 'passmain' | null;
  rails?: number | null;
  chassiMontants?: number;
  chassiTraverses?: number;
  chassiSocleWide?: boolean;
  chassiMontantWide?: boolean;
  chassiTraverseWide?: boolean;
  serrureTraverse?: boolean;
  typeOuverture?: 'francaise' | 'oscillo' | 'basculante';

  // Store Rideau
  store_enabled?: boolean;
  storeCoffre?: boolean | string;
  store_coffre?: string;
  store_couleur?: string;
  store_lame_type?: string;

  // Moustiquaire
  mousti_enabled?: boolean;
  mousti_hauteur?: string | number;
  mousti_largeur?: string | number;

  // Vitrage & Remplissage
  remplissage_id?: string;
  vitrage_type?: 'simple' | 'double';
  motif_id?: string;

  cotations?: boolean;
  svgW?: number;
  svgH?: number;
  responsive?: boolean;
}

const STROKE_COLORS: Record<string, string> = {
  blanc: '#94a3b8',
  gris: '#334155',
  noir: '#09090b',
  couleur_mat: '#78350f',
  couleur_givre: '#0f766e'
};

const DIM_COLOR = '#475569';

function getGlassFillId(remplissageId?: string, motifId?: string): string {
  const remp = REMPLISSAGES.find(r => r.id === remplissageId);
  const rempLabel = (remp?.label || remplissageId || '').toLowerCase();
  const motif = MOTIFS.find(m => m.id === motifId);
  const motifLabel = (motif?.label || motifId || '').toLowerCase();

  if (motifLabel.includes('sablage')) return 'glass_sablage';
  if (rempLabel.includes('bronze') || rempLabel.includes('solarit bronze') || rempLabel.includes('tenta sol bronze')) return 'glass_bronze';
  if (rempLabel.includes('bleu') || rempLabel.includes('tenta sol bleu')) return 'glass_bleu';
  if (rempLabel.includes('stop sol') || rempLabel.includes('silver')) return 'glass_stopsol';
  if (rempLabel.includes('pvc') || rempLabel.includes('planche') || rempLabel.includes('mdf')) return 'panel_pvc';
  return 'glass_standard';
}

function getAluColorId(color?: string): string {
  const c = (color || 'blanc').toLowerCase();
  if (c.includes('gris')) return 'alu_gris';
  if (c.includes('noir')) return 'alu_noir';
  if (c.includes('mat') || c.includes('bois')) return 'alu_couleur_mat';
  if (c.includes('givre') || c.includes('givré')) return 'alu_couleur_givre';
  return 'alu_blanc';
}

function glassPane(x: number, y: number, w: number, h: number, strokeColor: string, glassId: string, withReflection = true): string {
  if (w <= 0 || h <= 0) return '';
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${glassId})" stroke="${strokeColor}" stroke-width="0.8"/>`;
  if (withReflection && glassId !== 'panel_pvc') {
    const rx1 = Math.min(w * 0.5, 40);
    const ry1 = Math.min(h * 0.7, 70);
    s += `<polygon points="${x},${y} ${x + rx1},${y} ${x},${y + ry1}" fill="url(#glassReflect)"/>`;
    if (w > 30 && h > 30) {
      s += `<polygon points="${x + w * 0.3},${y} ${x + Math.min(w * 0.8, w * 0.3 + 30)},${y} ${x},${y + Math.min(h, 90)}" fill="url(#glassReflect)" opacity="0.6"/>`;
    }
  }
  return s;
}

function hLine(x1: number, x2: number, y: number, label: string): string {
  const tick = 4;
  let s = `<g opacity="0.9">`;
  s += `<line x1="${x1}" y1="${y - tick}" x2="${x1}" y2="${y + tick}" stroke="${DIM_COLOR}" stroke-width="1"/>`;
  s += `<line x1="${x2}" y1="${y - tick}" x2="${x2}" y2="${y + tick}" stroke="${DIM_COLOR}" stroke-width="1"/>`;
  s += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${DIM_COLOR}" stroke-width="1"/>`;
  s += `<rect x="${(x1 + x2) / 2 - 24}" y="${y - 12}" width="48" height="11" rx="2" fill="#ffffff" fill-opacity="0.85"/>`;
  s += `<text x="${(x1 + x2) / 2}" y="${y - 3}" text-anchor="middle" font-size="9" font-weight="bold" fill="${DIM_COLOR}" font-family="Inter, system-ui, sans-serif">${label}</text>`;
  s += `</g>`;
  return s;
}

function vLine(x: number, y1: number, y2: number, label: string): string {
  const tick = 4;
  let s = `<g opacity="0.9">`;
  s += `<line x1="${x - tick}" y1="${y1}" x2="${x + tick}" y2="${y1}" stroke="${DIM_COLOR}" stroke-width="1"/>`;
  s += `<line x1="${x - tick}" y1="${y2}" x2="${x + tick}" y2="${y2}" stroke="${DIM_COLOR}" stroke-width="1"/>`;
  s += `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${DIM_COLOR}" stroke-width="1"/>`;
  s += `<rect x="${x + 3}" y="${(y1 + y2) / 2 - 6}" width="46" height="11" rx="2" fill="#ffffff" fill-opacity="0.85"/>`;
  s += `<text x="${x + 6}" y="${(y1 + y2) / 2 + 3}" text-anchor="start" font-size="9" font-weight="bold" fill="${DIM_COLOR}" font-family="Inter, system-ui, sans-serif">${label}</text>`;
  s += `</g>`;
  return s;
}

const fmt = (v: number) => Math.round(v * 10) / 10;

export function renderAlumDrawing(params: DrawingParams): string {
  const {
    hauteur, largeur, drawType, couleur = 'blanc', estPorte = false,
    partieFixeType = 'Sans', pfDim1 = 0, pfDim2 = 0,
    partieFixLabel = null, gcKind = null, rails = null,
    chassiMontants = 0, chassiTraverses = 0,
    chassiSocleWide = false,
    serrureTraverse = false, typeOuverture = 'francaise',
    store_enabled = false, storeCoffre, store_coffre, store_couleur, store_lame_type,
    mousti_enabled = false,
    remplissage_id, vitrage_type, motif_id,
    svgW = 480, svgH = 380,
    cotations = true, responsive = true
  } = params;

  // Determine nbVantaux
  let nbVantaux = params.nbVantaux || 1;
  if (!params.nbVantaux) {
    if (drawType === 'coulissante') nbVantaux = 2;
    else if (drawType === 'francaise') nbVantaux = 2;
  }

  const aluId = getAluColorId(couleur);
  const strokeColor = STROKE_COLORS[couleur] || '#64748b';
  const glassId = getGlassFillId(remplissage_id, motif_id);

  // Store rideau check
  const hasStore = store_enabled || drawType === 'store';
  const hasMousti = mousti_enabled || drawType === 'mousti';

  // Margins for cotations
  let mL = 24, mR = cotations ? 65 : 12, mT = hasStore ? 44 : 20, mB = cotations ? 50 : 16;
  if (svgW < 280 || svgH < 220) {
    mL = 10; mR = cotations ? 35 : 6; mT = hasStore ? 25 : 10; mB = cotations ? 28 : 8;
  }

  const drawAreaW = Math.max(40, svgW - mL - mR);
  const drawAreaH = Math.max(40, svgH - mT - mB);

  // Preserve aspect ratio
  const aspect = (largeur || 100) / (hauteur || 100);
  let winW = drawAreaW;
  let winH = drawAreaW / aspect;
  if (winH > drawAreaH) {
    winH = drawAreaH;
    winW = drawAreaH * aspect;
  }
  winW = Math.max(30, winW);
  winH = Math.max(30, winH);

  const scale = winW / (largeur || 100);
  const ox = mL + (drawAreaW - winW) / 2;
  const oy = mT + (drawAreaH - winH) / 2;

  let s = '';

  // 1. GARDE-CORPS
  if (drawType === 'garde_corps') {
    const handrailH = Math.min(Math.max(6, winH * 0.08), 12);
    const postW = Math.min(Math.max(5, winW * 0.025), 8);
    const postCount = Math.max(2, Math.round(largeur / 80) + 1);

    // Handrail
    s += `<rect x="${ox - 4}" y="${oy}" width="${winW + 8}" height="${handrailH}" rx="4" fill="url(#${aluId})" stroke="${strokeColor}" stroke-width="1.2"/>`;

    // Posts
    for (let i = 0; i < postCount; i++) {
      const px = ox + (i / (postCount - 1)) * (winW - postW);
      s += `<rect x="${px}" y="${oy + handrailH}" width="${postW}" height="${winH - handrailH}" fill="url(#${aluId})" stroke="${strokeColor}" stroke-width="1"/>`;
      // Base plate
      s += `<rect x="${px - 2}" y="${oy + winH - 4}" width="${postW + 4}" height="4" rx="1" fill="url(#${aluId})" stroke="${strokeColor}" stroke-width="1"/>`;
    }

    if (gcKind === 'vitre') {
      // Glass infill
      for (let i = 0; i < postCount - 1; i++) {
        const gx1 = ox + (i / (postCount - 1)) * (winW - postW) + postW + 3;
        const gx2 = ox + ((i + 1) / (postCount - 1)) * (winW - postW) - 3;
        s += glassPane(gx1, oy + handrailH + 4, gx2 - gx1, winH - handrailH - 12, strokeColor, glassId);
      }
    } else {
      // Horizontal bars (lisses)
      const nBars = 3;
      for (let b = 1; b <= nBars; b++) {
        const by = oy + handrailH + (b / (nBars + 1)) * (winH - handrailH - 10);
        s += `<rect x="${ox}" y="${by - 2}" width="${winW}" height="4" rx="2" fill="url(#${aluId})" stroke="${strokeColor}" stroke-width="0.8"/>`;
      }
    }

    // Ground line
    s += `<line x1="${ox - 12}" y1="${oy + winH}" x2="${ox + winW + 12}" y2="${oy + winH}" stroke="#64748b" stroke-width="1.4" stroke-dasharray="3,3"/>`;

    if (cotations) {
      s += hLine(ox, ox + winW, oy + winH + 18, `${fmt(largeur)} cm`);
      s += vLine(ox + winW + 14, oy, oy + winH, `${fmt(hauteur)} cm`);
    }

    return wrapSVG(s, svgW, svgH, responsive);
  }

  // 2. STORE RIDEAU AUTONOME
  if (drawType === 'store') {
    const coffreH = Math.min(Math.max(20, winH * 0.18), 34);
    const railW = Math.min(Math.max(6, winW * 0.04), 10);
    const nLames = Math.max(6, Math.floor((winH - coffreH) / 10));
    const lameH = (winH - coffreH - 6) / nLames;

    // Coffre Store
    s += `<rect x="${ox - 2}" y="${oy}" width="${winW + 4}" height="${coffreH}" rx="3" fill="url(#${aluId})" stroke="${strokeColor}" stroke-width="1.2"/>`;
    s += `<line x1="${ox - 2}" y1="${oy + coffreH * 0.65}" x2="${ox + winW + 2}" y2="${oy + coffreH * 0.65}" stroke="${strokeColor}" stroke-width="0.6" opacity="0.6"/>`;

    // Side Rails
    s += `<rect x="${ox}" y="${oy + coffreH}" width="${railW}" height="${winH - coffreH}" fill="url(#${aluId})" stroke="${strokeColor}" stroke-width="1"/>`;
    s += `<rect x="${ox + winW - railW}" y="${oy + coffreH}" width="${railW}" height="${winH - coffreH}" fill="url(#${aluId})" stroke="${strokeColor}" stroke-width="1"/>`;

    // Lames
    for (let i = 0; i < nLames; i++) {
      const ly = oy + coffreH + i * lameH;
      s += `<rect x="${ox + railW}" y="${ly}" width="${winW - 2 * railW}" height="${lameH}" fill="url(#${aluId})" stroke="${strokeColor}" stroke-width="0.6"/>`;
      s += `<line x1="${ox + railW + 2}" y1="${ly + 1}" x2="${ox + winW - railW - 2}" y2="${ly + 1}" stroke="#ffffff" stroke-width="0.5" opacity="0.5"/>`;
    }
    // Lame finale
    s += `<rect x="${ox + railW}" y="${oy + winH - 6}" width="${winW - 2 * railW}" height="6" rx="1" fill="url(#${aluId})" stroke="${strokeColor}" stroke-width="1.2"/>`;

    if (cotations) {
      s += hLine(ox, ox + winW, oy + winH + 18, `${fmt(largeur)} cm`);
      s += vLine(ox + winW + 14, oy, oy + winH, `${fmt(hauteur)} cm`);
    }

    return wrapSVG(s, svgW, svgH, responsive);
  }

  // 3. MOUSTIQUAIRE AUTONOME
  if (drawType === 'mousti') {
    const frameThick = Math.min(Math.max(winW, winH) * 0.05, 8);
    s += `<rect x="${ox}" y="${oy}" width="${winW}" height="${winH}" rx="2" fill="url(#${aluId})" stroke="${strokeColor}" stroke-width="1.4"/>`;
    s += `<rect x="${ox + frameThick}" y="${oy + frameThick}" width="${winW - 2 * frameThick}" height="${winH - 2 * frameThick}" fill="#f1f5f9" stroke="${strokeColor}" stroke-width="0.8"/>`;
    s += `<rect x="${ox + frameThick}" y="${oy + frameThick}" width="${winW - 2 * frameThick}" height="${winH - 2 * frameThick}" fill="url(#meshPattern)" opacity="0.85"/>`;

    if (cotations) {
      s += hLine(ox, ox + winW, oy + winH + 18, `${fmt(largeur)} cm`);
      s += vLine(ox + winW + 14, oy, oy + winH, `${fmt(hauteur)} cm`);
    }

    return wrapSVG(s, svgW, svgH, responsive);
  }

  // 4. STANDARD WINDOWS, DOORS & CHÂSSIS FIXES
  const frameThick = Math.min(Math.max(winW, winH) * 0.045, 12);
  const isPorteFr = estPorte || drawType === 'francaise' && estPorte;
  const isCoulissant = drawType === 'coulissante';
  const isFixe = drawType === 'fixe' || drawType === 'partie_fix';

  // COUCHE 1: STORE RIDEAU INTÉGRÉ (Si Store Rideau est coché sur le châssis)
  if (hasStore) {
    const storeAluId = getAluColorId(store_couleur || couleur);
    const coffreH = Math.min(Math.max(16, winH * 0.12), 26);
    const coffreY = oy - coffreH - 2;

    s += `<g>`;
    // Boîtier Coffre
    s += `<rect x="${ox - 2}" y="${coffreY}" width="${winW + 4}" height="${coffreH}" rx="2" fill="url(#${storeAluId})" stroke="${strokeColor}" stroke-width="1.2"/>`;
    s += `<line x1="${ox - 2}" y1="${coffreY + coffreH * 0.65}" x2="${ox + winW + 2}" y2="${coffreY + coffreH * 0.65}" stroke="${strokeColor}" stroke-width="0.6" opacity="0.6"/>`;
    // Label Coffre
    const coffreText = store_coffre ? `${store_coffre}` : 'Coffre Store';
    s += `<text x="${ox + winW / 2}" y="${coffreY + coffreH / 2 + 3}" text-anchor="middle" font-size="8" font-weight="bold" fill="#334155" opacity="0.85">${coffreText}</text>`;
    s += `</g>`;
  }

  // COUCHE 2: CADRE DORMANT
  s += `<rect x="${ox}" y="${oy}" width="${winW}" height="${winH}" rx="2" fill="url(#${aluId})" stroke="${strokeColor}" stroke-width="1.4"/>`;
  
  // Onglets 45° aux 4 coins
  const inX = ox + frameThick, inY = oy + frameThick;
  const inW = winW - 2 * frameThick, inH = winH - 2 * frameThick;
  s += `<line x1="${ox}" y1="${oy}" x2="${inX}" y2="${inY}" stroke="${strokeColor}" stroke-width="0.8" opacity="0.5"/>`;
  s += `<line x1="${ox + winW}" y1="${oy}" x2="${inX + inW}" y2="${inY}" stroke="${strokeColor}" stroke-width="0.8" opacity="0.5"/>`;
  s += `<line x1="${ox}" y1="${oy + winH}" x2="${inX}" y2="${inY + inH}" stroke="${strokeColor}" stroke-width="0.8" opacity="0.5"/>`;
  s += `<line x1="${ox + winW}" y1="${oy + winH}" x2="${inX + inW}" y2="${inY + inH}" stroke="${strokeColor}" stroke-width="0.8" opacity="0.5"/>`;

  // PARTIE FIXE (Allège / Imposte / Latéraux)
  let pfL = 0, pfR = 0, pfT = 0, pfB = 0;
  const d1 = (pfDim1 || 0) * scale, d2 = ((pfDim2 || pfDim1) || 0) * scale;
  if (partieFixeType === 'Gauche') pfL = d1;
  if (partieFixeType === 'Droite') pfR = d1;
  if (partieFixeType === 'Droite et Gauche') { pfL = d1; pfR = d2; }
  if (partieFixeType === 'Haut') pfT = d1;
  if (partieFixeType === 'Bas') pfB = d1;
  if (partieFixeType === 'Haut et Bas') { pfT = d1; pfB = d2; }

  const vzX = inX + pfL, vzY = inY + pfT;
  const vzW = inW - pfL - pfR, vzH = inH - pfT - pfB;

  // Render Fixed sections if any
  if (pfL > 0) s += glassPane(inX + 2, inY + 2, pfL - 4, inH - 4, strokeColor, glassId);
  if (pfR > 0) s += glassPane(inX + inW - pfR + 2, inY + 2, pfR - 4, inH - 4, strokeColor, glassId);
  if (pfT > 0) s += glassPane(vzX + 2, inY + 2, vzW - 4, pfT - 4, strokeColor, glassId);
  if (pfB > 0) s += glassPane(vzX + 2, inY + inH - pfB + 2, vzW - 4, pfB - 4, strokeColor, glassId);

  // COUCHE 3: OUVRANTS / VANTAUX
  if (isFixe) {
    // Châssis fixe vitré
    s += glassPane(vzX, vzY, vzW, vzH, strokeColor, glassId);
    // Montants et traverses
    if (chassiMontants > 0) {
      const mw = frameThick * 0.9;
      for (let i = 1; i <= chassiMontants; i++) {
        const mx = vzX + (i / (chassiMontants + 1)) * vzW - mw / 2;
        s += `<rect x="${mx}" y="${vzY}" width="${mw}" height="${vzH}" fill="url(#${aluId})" stroke="${strokeColor}" stroke-width="1"/>`;
      }
    }
    if (chassiTraverses > 0) {
      const tw = frameThick * 0.9;
      for (let i = 1; i <= chassiTraverses; i++) {
        const ty = vzY + (i / (chassiTraverses + 1)) * vzH - tw / 2;
        s += `<rect x="${vzX}" y="${ty}" width="${vzW}" height="${tw}" fill="url(#${aluId})" stroke="${strokeColor}" stroke-width="1"/>`;
      }
    }
  } else {
    // Vantaux ouvrant (Coulissant ou Battant ou Porte)
    const sashThick = frameThick * 0.88;
    const vW = vzW / nbVantaux;

    for (let idx = 0; idx < nbVantaux; idx++) {
      let sx = vzX + idx * vW;
      let sw = vW;
      let sy = vzY;
      let sh = vzH;

      if (isCoulissant && nbVantaux > 1) {
        const overlap = sashThick * 0.6;
        sw = (vzW + (nbVantaux - 1) * overlap) / nbVantaux;
        sx = vzX + idx * (sw - overlap);
      }

      const gx = sx + sashThick;
      const gy = sy + sashThick;
      const gw = sw - 2 * sashThick;
      const gh = sh - 2 * sashThick;

      // Porte Soubassement
      const hasSoubassement = estPorte && gh > 35;
      const panelH = hasSoubassement ? gh * 0.38 : 0;
      const glassH = hasSoubassement ? gh - panelH - sashThick : gh;

      // Sash Frame
      s += `<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="1.5" fill="url(#${aluId})" stroke="${strokeColor}" stroke-width="1.2"/>`;

      // Glass pane
      s += glassPane(gx, gy, gw, glassH, strokeColor, glassId);

      // Moustiquaire texture if enabled
      if (hasMousti) {
        s += `<rect x="${gx}" y="${gy}" width="${gw}" height="${glassH}" fill="url(#meshPattern)" opacity="0.8"/>`;
      }

      // Door kickplate / Panel
      if (hasSoubassement) {
        s += `<rect x="${sx}" y="${gy + glassH}" width="${sw}" height="${sashThick}" fill="url(#${aluId})" stroke="${strokeColor}" stroke-width="1"/>`;
        s += `<rect x="${gx}" y="${gy + glassH + sashThick}" width="${gw}" height="${panelH}" fill="url(#${aluId})" stroke="${strokeColor}" stroke-width="0.8"/>`;
        s += `<rect x="${gx + 3}" y="${gy + glassH + sashThick + 3}" width="${gw - 6}" height="${panelH - 6}" fill="none" stroke="${strokeColor}" stroke-width="0.5" stroke-dasharray="2,2" opacity="0.5"/>`;
      }

      // Opening lines (Française / Oscillo)
      if (!isCoulissant && !estPorte) {
        s += `<g opacity="0.45" stroke="${strokeColor}" stroke-width="0.8" stroke-dasharray="4,3">`;
        if (typeOuverture === 'oscillo') {
          // Oscillo-battant triangle
          s += `<line x1="${gx}" y1="${gy + glassH}" x2="${gx + gw / 2}" y2="${gy}"/>`;
          s += `<line x1="${gx + gw}" y1="${gy + glassH}" x2="${gx + gw / 2}" y2="${gy}"/>`;
        } else if (typeOuverture === 'basculante') {
          s += `<line x1="${gx}" y1="${gy}" x2="${gx + gw / 2}" y2="${gy + glassH}"/>`;
          s += `<line x1="${gx + gw}" y1="${gy}" x2="${gx + gw / 2}" y2="${gy + glassH}"/>`;
        } else {
          // Standard Casement
          if (idx === 0) {
            s += `<line x1="${gx}" y1="${gy}" x2="${gx + gw}" y2="${gy + glassH / 2}"/>`;
            s += `<line x1="${gx}" y1="${gy + glassH}" x2="${gx + gw}" y2="${gy + glassH / 2}"/>`;
          } else {
            s += `<line x1="${gx + gw}" y1="${gy}" x2="${gx}" y2="${gy + glassH / 2}"/>`;
            s += `<line x1="${gx + gw}" y1="${gy + glassH}" x2="${gx}" y2="${gy + glassH / 2}"/>`;
          }
        }
        s += `</g>`;
      }

      // Sliding arrows (Coulissant)
      if (isCoulissant) {
        s += `<g opacity="0.55" fill="${strokeColor}" stroke="${strokeColor}">`;
        if (idx === 0) {
          s += `<path d="M${gx + gw / 2 - 8} ${gy + glassH / 2} L${gx + gw / 2 + 4} ${gy + glassH / 2 - 4} L${gx + gw / 2 + 4} ${gy + glassH / 2 + 4} Z"/>`;
        } else {
          s += `<path d="M${gx + gw / 2 + 8} ${gy + glassH / 2} L${gx + gw / 2 - 4} ${gy + glassH / 2 - 4} L${gx + gw / 2 - 4} ${gy + glassH / 2 + 4} Z"/>`;
        }
        s += `</g>`;
      }

      // Handles
      const handleY = sy + sh * 0.52;
      if (isCoulissant) {
        const handleX = idx === 0 ? sx + sashThick * 0.5 : sx + sw - sashThick * 0.5;
        s += `<rect x="${handleX - 1.5}" y="${handleY - 9}" width="3" height="18" rx="1.5" fill="#1e293b" stroke="#ffffff" stroke-width="0.5"/>`;
      } else {
        if (nbVantaux === 1 || idx === 0) {
          const handleX = idx === 0 && nbVantaux > 1 ? sx + sw - sashThick * 0.5 : sx + sashThick * 0.5;
          s += `<g>`;
          s += `<rect x="${handleX - 2.5}" y="${handleY - 7}" width="5" height="14" rx="1.5" fill="#334155" stroke="#ffffff" stroke-width="0.6"/>`;
          s += `<rect x="${handleX - 10}" y="${handleY - 2.5}" width="10" height="4" rx="2" fill="#1e293b" stroke="#ffffff" stroke-width="0.6"/>`;
          s += `<circle cx="${handleX}" cy="${handleY}" r="1.8" fill="#cbd5e1"/>`;
          s += `</g>`;
        }
      }

      // Hinges for Battants
      if (!isCoulissant) {
        const hingeX = idx === 0 ? sx - 1.5 : sx + sw - 1.5;
        s += `<rect x="${hingeX}" y="${sy + sh * 0.18}" width="3" height="10" rx="1" fill="#475569" stroke="#ffffff" stroke-width="0.4"/>`;
        s += `<rect x="${hingeX}" y="${sy + sh * 0.78}" width="3" height="10" rx="1" fill="#475569" stroke="#ffffff" stroke-width="0.4"/>`;
        if (estPorte) {
          s += `<rect x="${hingeX}" y="${sy + sh * 0.48}" width="3" height="10" rx="1" fill="#475569" stroke="#ffffff" stroke-width="0.4"/>`;
        }
      }
    }
  }

  // Ground line for doors
  if (estPorte) {
    const gy = oy + winH + 2;
    s += `<line x1="${ox - 14}" y1="${gy}" x2="${ox + winW + 14}" y2="${gy}" stroke="#334155" stroke-width="1.6"/>`;
  }

  // COUCHE 7: COTATIONS
  if (cotations) {
    const cotY = oy + winH + (estPorte ? 20 : 16);
    const cotX = ox + winW + 14;

    // Width Dimension
    if (nbVantaux > 1 && !isFixe) {
      const leafCm = largeur / nbVantaux;
      const leafPx = winW / nbVantaux;
      for (let i = 0; i < nbVantaux; i++) {
        s += hLine(ox + i * leafPx, ox + (i + 1) * leafPx, cotY, `${fmt(leafCm)}`);
      }
      s += hLine(ox, ox + winW, cotY + 18, `${fmt(largeur)} cm`);
    } else {
      s += hLine(ox, ox + winW, cotY + 4, `${fmt(largeur)} cm`);
    }

    // Height Dimension
    s += vLine(cotX, oy, oy + winH, `${fmt(hauteur)} cm`);
  }

  return wrapSVG(s, svgW, svgH, responsive);
}

function wrapSVG(content: string, w: number, h: number, responsive: boolean): string {
  const style = responsive ? ' style="max-width:100%;height:auto;display:block;"' : '';
  const defs = `
    <defs>
      <!-- Drop Shadow -->
      <filter id="drop-shadow" x="-8%" y="-8%" width="116%" height="116%">
        <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" flood-color="#0f172a" flood-opacity="0.16"/>
      </filter>

      <!-- Mesh Pattern for Moustiquaire -->
      <pattern id="meshPattern" width="4" height="4" patternUnits="userSpaceOnUse">
        <path d="M 0 0 L 4 0 M 0 0 L 0 4" fill="none" stroke="#64748b" stroke-width="0.3" opacity="0.45"/>
      </pattern>

      <!-- Glass Reflection Shimmer -->
      <linearGradient id="glassReflect" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45"/>
        <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
        <stop offset="65%" stop-color="#ffffff" stop-opacity="0.02"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.25"/>
      </linearGradient>

      <!-- Frame Metallic Gradients -->
      <linearGradient id="alu_blanc" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="45%" stop-color="#f8fafc"/>
        <stop offset="100%" stop-color="#e2e8f0"/>
      </linearGradient>

      <linearGradient id="alu_gris" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#64748b"/>
        <stop offset="50%" stop-color="#475569"/>
        <stop offset="100%" stop-color="#334155"/>
      </linearGradient>

      <linearGradient id="alu_noir" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3f3f46"/>
        <stop offset="50%" stop-color="#27272a"/>
        <stop offset="100%" stop-color="#18181b"/>
      </linearGradient>

      <linearGradient id="alu_couleur_mat" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#d97706"/>
        <stop offset="50%" stop-color="#b45309"/>
        <stop offset="100%" stop-color="#78350f"/>
      </linearGradient>

      <linearGradient id="alu_couleur_givre" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0d9488"/>
        <stop offset="50%" stop-color="#115e59"/>
        <stop offset="100%" stop-color="#134e4a"/>
      </linearGradient>

      <!-- Glass Tints -->
      <linearGradient id="glass_standard" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f0f9ff" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#e0f2fe" stop-opacity="0.95"/>
      </linearGradient>

      <linearGradient id="glass_bronze" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef3c7" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#fde68a" stop-opacity="0.95"/>
      </linearGradient>

      <linearGradient id="glass_bleu" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#e0f2fe" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#bae6fd" stop-opacity="0.95"/>
      </linearGradient>

      <linearGradient id="glass_stopsol" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#cbd5e1" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#94a3b8" stop-opacity="0.9"/>
      </linearGradient>

      <linearGradient id="glass_sablage" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc" stop-opacity="0.98"/>
        <stop offset="100%" stop-color="#e2e8f0" stop-opacity="0.98"/>
      </linearGradient>

      <linearGradient id="panel_pvc" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#f1f5f9"/>
      </linearGradient>
    </defs>
  `;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"${style}>${defs}${content}</svg>`;
}
