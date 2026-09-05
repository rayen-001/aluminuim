/**
 * AlumDrawing — Générateur vectoriel SVG de menuiserie aluminium (vue de face & cotations).
 * Version TypeScript complète pour AtelierPro.
 */

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
  storeCoffre?: boolean;
  cotations?: boolean;
  svgW?: number;
  svgH?: number;
  responsive?: boolean;
}

const COLOR_STYLES: Record<string, { fill: string; stroke: string }> = {
  blanc: { fill: '#ffffff', stroke: '#3f4750' },
  gris: { fill: '#c3c7cb', stroke: '#41474d' },
  noir: { fill: '#4a4a4a', stroke: '#141414' },
  couleur_mat: { fill: '#b08a4f', stroke: '#5d451a' },
  couleur_givre: { fill: '#565b5f', stroke: '#212426' }
};

const GLASS_FILL = '#fbfdff';
const DIM_COLOR = '#4b5563';

function miteredFrame(x: number, y: number, w: number, h: number, band: number, st: { fill: string; stroke: string }): string {
  const ix = x + band, iy = y + band, iw = w - 2 * band, ih = h - 2 * band;
  let s = `<path d="M${x},${y} h${w} v${h} h${-w} z M${ix},${iy} v${ih} h${iw} v${-ih} z" fill-rule="evenodd" fill="${st.fill}" stroke="none"/>`;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${st.stroke}" stroke-width="1.3"/>`;
  s += `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="none" stroke="${st.stroke}" stroke-width="1"/>`;
  s += `<line x1="${x}" y1="${y}" x2="${ix}" y2="${iy}" stroke="${st.stroke}" stroke-width="0.8"/>`;
  s += `<line x1="${x + w}" y1="${y}" x2="${ix + iw}" y2="${iy}" stroke="${st.stroke}" stroke-width="0.8"/>`;
  s += `<line x1="${x}" y1="${y + h}" x2="${ix}" y2="${iy + ih}" stroke="${st.stroke}" stroke-width="0.8"/>`;
  s += `<line x1="${x + w}" y1="${y + h}" x2="${ix + iw}" y2="${iy + ih}" stroke="${st.stroke}" stroke-width="0.8"/>`;
  return s;
}

function glassRect(x: number, y: number, w: number, h: number, st: { stroke: string }): string {
  if (w <= 0 || h <= 0) return '';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${GLASS_FILL}" stroke="${st.stroke}" stroke-width="0.6" opacity="0.9"/>`;
}

function drawHandle(cx: number, cy: number, st: { fill: string; stroke: string }): string {
  let s = `<rect x="${cx - 5}" y="${cy - 13}" width="10" height="26" rx="4" fill="${st.fill}" stroke="${st.stroke}" stroke-width="1.1"/>`;
  s += `<rect x="${cx - 32}" y="${cy - 3.5}" width="31" height="7" rx="3.5" fill="${st.fill}" stroke="${st.stroke}" stroke-width="1.1"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="4.2" fill="${st.fill}" stroke="${st.stroke}" stroke-width="1.1"/>`;
  return s;
}

function drawHinges(x: number, y: number, h: number, st: { fill: string; stroke: string }, count: number): string {
  let s = '';
  const positions = count === 4 ? [0.1, 0.37, 0.63, 0.9] : [0.15, 0.85];
  for (const p of positions) {
    const hy = y + h * p;
    s += `<rect x="${x - 2.5}" y="${hy - 9}" width="5" height="18" fill="${st.fill}" stroke="${st.stroke}" stroke-width="1"/>`;
  }
  return s;
}

function drawHingesHorizontal(x: number, y: number, w: number, st: { fill: string; stroke: string }): string {
  let s = '';
  for (const p of [0.15, 0.85]) {
    const hx = x + w * p;
    s += `<rect x="${hx - 9}" y="${y - 2.5}" width="18" height="5" fill="${st.fill}" stroke="${st.stroke}" stroke-width="1"/>`;
  }
  return s;
}

function openingTriangleSide(x: number, y: number, w: number, h: number, hingeLeft: boolean, st: { stroke: string }): string {
  const apexX = hingeLeft ? x + w : x;
  const baseX = hingeLeft ? x : x + w;
  const midY = y + h / 2;
  return `<line x1="${baseX}" y1="${y}" x2="${apexX}" y2="${midY}" stroke="${st.stroke}" stroke-width="1" stroke-dasharray="6,4" opacity="0.7"/>`
    + `<line x1="${baseX}" y1="${y + h}" x2="${apexX}" y2="${midY}" stroke="${st.stroke}" stroke-width="1" stroke-dasharray="6,4" opacity="0.7"/>`;
}

function openingTriangleTilt(x: number, y: number, w: number, h: number, st: { stroke: string }): string {
  const midX = x + w / 2;
  const apexY = y;
  return `<line x1="${x}" y1="${y + h}" x2="${midX}" y2="${apexY}" stroke="${st.stroke}" stroke-width="1" stroke-dasharray="6,4" opacity="0.7"/>`
    + `<line x1="${x + w}" y1="${y + h}" x2="${midX}" y2="${apexY}" stroke="${st.stroke}" stroke-width="1" stroke-dasharray="6,4" opacity="0.7"/>`;
}

function doorDormant(x: number, y: number, w: number, h: number, band: number, st: { fill: string; stroke: string }): string {
  const ix = x + band, iy = y + band, iw = w - 2 * band;
  let s = `<path d="M${x},${y + h} L${x},${y} L${x + w},${y} L${x + w},${y + h} L${ix + iw},${y + h} L${ix + iw},${iy} L${ix},${iy} L${ix},${y + h} Z" fill="${st.fill}" stroke="none"/>`;
  s += `<path d="M${x},${y + h} L${x},${y} L${x + w},${y} L${x + w},${y + h}" fill="none" stroke="${st.stroke}" stroke-width="1.3"/>`;
  s += `<path d="M${ix},${y + h} L${ix},${iy} L${ix + iw},${iy} L${ix + iw},${y + h}" fill="none" stroke="${st.stroke}" stroke-width="1"/>`;
  s += `<line x1="${x}" y1="${y}" x2="${ix}" y2="${iy}" stroke="${st.stroke}" stroke-width="0.8"/>`;
  s += `<line x1="${x + w}" y1="${y}" x2="${ix + iw}" y2="${iy}" stroke="${st.stroke}" stroke-width="0.8"/>`;
  s += `<line x1="${x}" y1="${y + h}" x2="${ix}" y2="${y + h}" stroke="${st.stroke}" stroke-width="1.3"/>`;
  s += `<line x1="${ix + iw}" y1="${y + h}" x2="${x + w}" y2="${y + h}" stroke="${st.stroke}" stroke-width="1.3"/>`;
  return s;
}

function doorFrame(x: number, y: number, w: number, h: number, band: number, bandBottom: number, st: { fill: string; stroke: string }): string {
  const ix = x + band, iy = y + band, iw = w - 2 * band, ih = h - band - bandBottom;
  let s = `<path d="M${x},${y} h${w} v${h} h${-w} z M${ix},${iy} v${ih} h${iw} v${-ih} z" fill-rule="evenodd" fill="${st.fill}" stroke="none"/>`;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${st.stroke}" stroke-width="1.3"/>`;
  s += `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="none" stroke="${st.stroke}" stroke-width="1"/>`;
  s += `<line x1="${x}" y1="${y}" x2="${ix}" y2="${iy}" stroke="${st.stroke}" stroke-width="0.8"/>`;
  s += `<line x1="${x + w}" y1="${y}" x2="${ix + iw}" y2="${iy}" stroke="${st.stroke}" stroke-width="0.8"/>`;
  s += `<line x1="${ix}" y1="${iy + ih}" x2="${ix}" y2="${y + h}" stroke="${st.stroke}" stroke-width="0.8"/>`;
  s += `<line x1="${ix + iw}" y1="${iy + ih}" x2="${ix + iw}" y2="${y + h}" stroke="${st.stroke}" stroke-width="0.8"/>`;
  return s;
}

function serrureTraverseBar(x: number, y: number, w: number, h: number, band: number, st: { fill: string; stroke: string }): string {
  const cy = y + h / 2;
  const tb = Math.max(band * 1.5, 16);
  return `<rect x="${x + band}" y="${cy - tb / 2}" width="${w - 2 * band}" height="${tb}" fill="${st.fill}" stroke="${st.stroke}" stroke-width="1"/>`;
}

function drawVantail(x: number, y: number, w: number, h: number, band: number, st: { fill: string; stroke: string }, opts: { hingeLeft?: boolean; showHandle?: boolean; estPorte?: boolean; serrureTraverse?: boolean; typeOuverture?: 'francaise' | 'oscillo' | 'basculante' }): string {
  const { hingeLeft = true, showHandle = true, estPorte = false, serrureTraverse = false, typeOuverture = 'francaise' } = opts || {};
  const bandBottom = estPorte ? band * 1.9 : band;
  let s = estPorte
    ? doorFrame(x, y, w, h, band, bandBottom, st)
    : miteredFrame(x, y, w, h, band, st);
  s += glassRect(x + band + 2, y + band + 2, w - 2 * band - 4, h - band - bandBottom - 4, st);

  const ix = x + band, iy = y + band, iw = w - 2 * band, ih = h - band - bandBottom;

  if (!estPorte && typeOuverture === 'basculante') {
    s += openingTriangleTilt(ix, iy, iw, ih, st);
    s += drawHingesHorizontal(x, y + h, w, st);
    if (showHandle) {
      const hx = hingeLeft ? (x + w - band / 2) : (x + band / 2);
      s += drawHandle(hx, y + h / 2, st);
    }
    return s;
  }

  s += drawHinges(hingeLeft ? x : x + w, y, h, st, estPorte ? 4 : 2);

  if (!estPorte) {
    s += openingTriangleSide(ix, iy, iw, ih, hingeLeft, st);
    if (typeOuverture === 'oscillo') {
      s += openingTriangleTilt(ix, iy, iw, ih, st);
    }
  }

  const cy = y + h / 2;
  if (estPorte && serrureTraverse) {
    s += serrureTraverseBar(x, y, w, h, band, st);
  }

  if (showHandle) {
    const inset = (estPorte && serrureTraverse) ? Math.max(band * 1.8, 16) : 0;
    const hx = hingeLeft ? (x + w - band / 2 - inset) : (x + band / 2 + inset);
    s += drawHandle(hx, cy, st);
  }
  return s;
}

function drawFixed(x: number, y: number, w: number, h: number, band: number, st: { fill: string; stroke: string }, reinforcedBandBottom?: number | null): string {
  if (reinforcedBandBottom != null) {
    let s = doorFrame(x, y, w, h, band, reinforcedBandBottom, st);
    s += glassRect(x + band + 2, y + band + 2, w - 2 * band - 4, h - band - reinforcedBandBottom - 4, st);
    return s;
  }
  let s = miteredFrame(x, y, w, h, band, st);
  s += glassRect(x + band + 2, y + band + 2, w - 2 * band - 4, h - 2 * band - 4, st);
  return s;
}

function drawSlidingLeaf(x: number, y: number, w: number, h: number, band: number, st: { fill: string; stroke: string }, idx: number, nb: number, traverse?: boolean): string {
  const ix = x + band, iy = y + band, iw = w - 2 * band, ih = h - 2 * band;
  let s = `<path d="M${x},${y} h${w} v${h} h${-w} z M${ix},${iy} v${ih} h${iw} v${-ih} z" fill-rule="evenodd" fill="${st.fill}" stroke="none"/>`;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${st.stroke}" stroke-width="1.3"/>`;
  s += `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="none" stroke="${st.stroke}" stroke-width="1"/>`;
  s += glassRect(ix + 2, iy + 2, iw - 4, ih - 4, st);

  if (traverse) {
    const tb = Math.max(band * 1.4, 12);
    const cy = y + h / 2;
    s += `<rect x="${ix}" y="${cy - tb / 2}" width="${iw}" height="${tb}" fill="${st.fill}" stroke="${st.stroke}" stroke-width="1"/>`;
  }

  const hx = idx === 0 ? x + band / 2 : x + w - band / 2;
  const hy = y + h / 2;
  s += `<rect x="${hx - 2.5}" y="${hy - 12}" width="5" height="24" rx="2.2" fill="${st.fill}" stroke="${st.stroke}" stroke-width="1"/>`;

  const isCenter = (nb % 2 === 1) && (idx === Math.floor(nb / 2));
  if (!isCenter) {
    const cx = x + w / 2, cy = y + h / 2, len = Math.min(w * 0.3, 30);
    const dir = idx < nb / 2 ? 1 : -1;
    s += `<line x1="${cx - dir * len / 2}" y1="${cy}" x2="${cx + dir * len / 2}" y2="${cy}" stroke="${st.stroke}" stroke-width="1" opacity="0.55"/>`;
    s += `<polygon points="${cx + dir * len / 2},${cy} ${cx + dir * (len / 2 - 7)},${cy - 4} ${cx + dir * (len / 2 - 7)},${cy + 4}" fill="${st.stroke}" opacity="0.55"/>`;
  }
  return s;
}

function drawGardeCorps(x: number, y: number, w: number, h: number, st: { fill: string; stroke: string }, kind: string): string {
  let s = '';
  const railH = Math.min(Math.max(7, h * 0.09), 14);
  const postW = Math.min(Math.max(5, w * 0.018), 9);

  s += `<rect x="${x}" y="${y}" width="${w}" height="${railH}" rx="${railH / 2}" fill="${st.fill}" stroke="${st.stroke}" stroke-width="1.2"/>`;

  if (kind === 'passmain') {
    for (const fx of [0.12, 0.5, 0.88]) {
      const bx = x + w * fx;
      s += `<line x1="${bx}" y1="${y + railH}" x2="${bx}" y2="${y + railH + 16}" stroke="${st.stroke}" stroke-width="3.5"/>`;
      s += `<circle cx="${bx}" cy="${y + railH + 19}" r="3.5" fill="${st.fill}" stroke="${st.stroke}" stroke-width="1"/>`;
    }
    return s;
  }

  const nPosts = Math.max(2, Math.round(w / 110) + 1);
  const postXs: number[] = [];
  for (let i = 0; i < nPosts; i++) postXs.push(x + (i / (nPosts - 1)) * w);

  const botY = y + h;
  const railBot = Math.max(5, railH * 0.6);
  const lisseY = botY - railBot - (kind === 'vitre' ? 0 : h * 0.06);
  const topFill = y + railH, botFill = kind === 'vitre' ? botY - 4 : lisseY;

  if (kind === 'linaire') {
    const nBars = 4;
    for (let b = 1; b <= nBars; b++) {
      const by = topFill + (b / (nBars + 1)) * (botFill - topFill);
      s += `<rect x="${x}" y="${by - 2.5}" width="${w}" height="5" rx="2.5" fill="${st.fill}" stroke="${st.stroke}" stroke-width="1"/>`;
    }
  } else if (kind === 'vitre') {
    for (let i = 0; i < postXs.length - 1; i++) {
      const gx = postXs[i] + postW / 2 + 4, gx2 = postXs[i + 1] - postW / 2 - 4;
      s += `<rect x="${gx}" y="${topFill + 4}" width="${gx2 - gx}" height="${botFill - topFill - 8}" fill="#eef6fc" stroke="${st.stroke}" stroke-width="0.8" opacity="0.9"/>`;
      s += `<line x1="${gx + 4}" y1="${topFill + 10}" x2="${gx + 14}" y2="${topFill + 20}" stroke="#b6cede" stroke-width="1.4"/>`;
    }
  } else if (kind === 'corpsen' || kind === 'corpsen_sabot') {
    const nBal = Math.max(6, Math.floor(w / 16));
    for (let b = 1; b < nBal; b++) {
      const bx = x + (b / nBal) * w;
      s += `<line x1="${bx}" y1="${topFill}" x2="${bx}" y2="${botFill}" stroke="${st.stroke}" stroke-width="2"/>`;
    }
  }

  if (kind !== 'vitre') {
    s += `<rect x="${x}" y="${lisseY}" width="${w}" height="${railBot}" fill="${st.fill}" stroke="${st.stroke}" stroke-width="1"/>`;
  }

  for (const px of postXs) {
    const px0 = Math.min(Math.max(px - postW / 2, x), x + w - postW);
    s += `<rect x="${px0}" y="${y + railH}" width="${postW}" height="${botY - y - railH}" fill="${st.fill}" stroke="${st.stroke}" stroke-width="1.1"/>`;
    if (kind === 'corpsen_sabot') {
      s += `<rect x="${px0 - 3}" y="${botY - 7}" width="${postW + 6}" height="7" fill="${st.fill}" stroke="${st.stroke}" stroke-width="1.1"/>`;
    }
  }

  s += `<line x1="${x - 14}" y1="${botY}" x2="${x + w + 14}" y2="${botY}" stroke="#374151" stroke-width="1.4"/>`;
  return s;
}

function drawStoreRideau(x: number, y: number, w: number, h: number, st: { fill: string; stroke: string }, avecCoffre?: boolean): string {
  let s = '';
  const cofH = avecCoffre ? Math.min(Math.max(16, h * 0.13), 34) : 0;
  const railW = Math.min(Math.max(6, w * 0.04), 12);

  if (avecCoffre) {
    s += `<rect x="${x - 4}" y="${y}" width="${w + 8}" height="${cofH}" rx="3" fill="${st.fill}" stroke="${st.stroke}" stroke-width="1.3"/>`;
    s += `<line x1="${x - 4}" y1="${y + cofH * 0.7}" x2="${x + w + 4}" y2="${y + cofH * 0.7}" stroke="${st.stroke}" stroke-width="0.7" opacity="0.6"/>`;
  }

  const bodyY = y + cofH, bodyH = h - cofH;
  s += `<rect x="${x}" y="${bodyY}" width="${railW}" height="${bodyH}" fill="${st.fill}" stroke="${st.stroke}" stroke-width="1.1"/>`;
  s += `<rect x="${x + w - railW}" y="${bodyY}" width="${railW}" height="${bodyH}" fill="${st.fill}" stroke="${st.stroke}" stroke-width="1.1"/>`;

  const lameX = x + railW, lameW = w - 2 * railW;
  const nLames = Math.max(6, Math.floor(bodyH / 14));
  const lameH = (bodyH - 8) / nLames;
  for (let i = 0; i < nLames; i++) {
    const ly = bodyY + i * lameH;
    s += `<rect x="${lameX}" y="${ly}" width="${lameW}" height="${lameH}" fill="${st.fill}" stroke="${st.stroke}" stroke-width="0.8"/>`;
  }
  s += `<rect x="${lameX}" y="${bodyY + nLames * lameH}" width="${lameW}" height="8" fill="${st.fill}" stroke="${st.stroke}" stroke-width="1.2"/>`;
  return s;
}

function drawMoustiquaire(x: number, y: number, w: number, h: number, st: { fill: string; stroke: string }): string {
  const band = Math.min(Math.max(5, Math.min(w, h) * 0.035), 10);
  let s = miteredFrame(x, y, w, h, band, st);
  const gx = x + band + 1, gy = y + band + 1, gw = w - 2 * band - 2, gh = h - 2 * band - 2;
  s += `<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="none" stroke="${st.stroke}" stroke-width="0.6"/>`;
  const step = 6;
  for (let lx = gx + step; lx < gx + gw; lx += step) {
    s += `<line x1="${lx}" y1="${gy}" x2="${lx}" y2="${gy + gh}" stroke="${st.stroke}" stroke-width="0.3" opacity="0.35"/>`;
  }
  for (let ly = gy + step; ly < gy + gh; ly += step) {
    s += `<line x1="${gx}" y1="${ly}" x2="${gx + gw}" y2="${ly}" stroke="${st.stroke}" stroke-width="0.3" opacity="0.35"/>`;
  }
  return s;
}

function hLine(x1: number, x2: number, y: number, label: string): string {
  const tick = 5;
  let s = `<line x1="${x1}" y1="${y - tick}" x2="${x1}" y2="${y + tick}" stroke="${DIM_COLOR}" stroke-width="1"/>`;
  s += `<line x1="${x2}" y1="${y - tick}" x2="${x2}" y2="${y + tick}" stroke="${DIM_COLOR}" stroke-width="1"/>`;
  s += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${DIM_COLOR}" stroke-width="1"/>`;
  s += `<text x="${(x1 + x2) / 2}" y="${y - 6}" text-anchor="middle" font-size="11" fill="${DIM_COLOR}" font-family="Inter, Arial">${label}</text>`;
  return s;
}

function vLine(x: number, y1: number, y2: number, label: string): string {
  const tick = 5;
  let s = `<line x1="${x - tick}" y1="${y1}" x2="${x + tick}" y2="${y1}" stroke="${DIM_COLOR}" stroke-width="1"/>`;
  s += `<line x1="${x - tick}" y1="${y2}" x2="${x + tick}" y2="${y2}" stroke="${DIM_COLOR}" stroke-width="1"/>`;
  s += `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${DIM_COLOR}" stroke-width="1"/>`;
  s += `<text x="${x + 6}" y="${(y1 + y2) / 2 + 4}" text-anchor="start" font-size="11" fill="${DIM_COLOR}" font-family="Inter, Arial">${label}</text>`;
  return s;
}

const fmt = (v: number) => Math.round(v * 10) / 10;

export function renderAlumDrawing(params: DrawingParams): string {
  const {
    hauteur, largeur, nbVantaux = 1, drawType, couleur = 'blanc', estPorte = false,
    partieFixeType = 'Sans', pfDim1 = 0, pfDim2 = 0,
    partieFixLabel = null, gcKind = null, rails = null,
    chassiMontants = 0, chassiTraverses = 0,
    chassiSocleWide = false, chassiMontantWide = false, chassiTraverseWide = false,
    serrureTraverse = false, typeOuverture = 'francaise', storeCoffre = true,
    svgW = 500, svgH = 430,
    cotations = true, responsive = true,
  } = params;

  const st = COLOR_STYLES[couleur] || COLOR_STYLES.blanc;
  const grounded = estPorte || drawType === 'garde_corps';

  let mL: number, mR: number, mT: number, mB: number;
  if (cotations) {
    if (svgW < 320 || svgH < 260) {
      mL = Math.max(12, svgW * 0.08);
      mR = Math.max(25, svgW * 0.18);
      mT = Math.max(10, svgH * 0.08);
      mB = grounded ? Math.max(30, svgH * 0.22) : Math.max(25, svgH * 0.18);
    } else {
      mL = 30; mR = 84; mT = 24; mB = grounded ? 96 : 78;
    }
  } else {
    mL = 6; mR = 6; mT = 6; mB = grounded ? 12 : 6;
  }

  const drawW = Math.max(10, svgW - mL - mR);
  const drawH = Math.max(10, svgH - mT - mB);
  const scale = Math.min(drawW / (largeur || 100), drawH / (hauteur || 100));
  const winW = (largeur || 100) * scale, winH = (hauteur || 100) * scale;
  const ox = mL + (drawW - winW) / 2;
  const oy = mT + (drawH - winH) / 2;

  let s = '';

  if (drawType === 'garde_corps') {
    s += drawGardeCorps(ox, oy, winW, winH, st, gcKind || 'linaire');
    if (cotations) {
      s += hLine(ox, ox + winW, oy + winH + 22, `${fmt(largeur)} cm`);
      s += vLine(ox + winW + 20, oy, oy + winH, `${fmt(hauteur)} cm`);
    }
    return wrapSVG(s, svgW, svgH, responsive);
  }

  if (drawType === 'store') {
    s += drawStoreRideau(ox, oy, winW, winH, st, storeCoffre);
    if (cotations) {
      s += hLine(ox, ox + winW, oy + winH + 22, `${fmt(largeur)} cm`);
      s += vLine(ox + winW + 20, oy, oy + winH, `${fmt(hauteur)} cm`);
    }
    return wrapSVG(s, svgW, svgH, responsive);
  }

  if (drawType === 'mousti') {
    s += drawMoustiquaire(ox, oy, winW, winH, st);
    if (cotations) {
      s += hLine(ox, ox + winW, oy + winH + 22, `${fmt(largeur)} cm`);
      s += vLine(ox + winW + 20, oy, oy + winH, `${fmt(hauteur)} cm`);
    }
    return wrapSVG(s, svgW, svgH, responsive);
  }

  // Windows / doors / chassi / fixed
  const bd = Math.min(Math.max(winW, winH) * 0.028, 14);
  const bo = bd * 1.15;
  const bf = bd * 0.8;

  const isPorteFr = estPorte && drawType === 'francaise';
  const chassiSocle90 = drawType === 'fixe' && chassiSocleWide;
  const chassiSocleBandBottom = chassiSocle90 ? bd * 3 : bd;
  if (isPorteFr) {
    s += doorDormant(ox, oy, winW, winH, bd, st);
  } else if (chassiSocle90) {
    s += doorFrame(ox, oy, winW, winH, bd, chassiSocleBandBottom, st);
  } else {
    s += miteredFrame(ox, oy, winW, winH, bd, st);
  }

  const iX = ox + bd, iY = oy + bd, iW = winW - 2 * bd;
  const iH = isPorteFr ? winH - bd : winH - bd - chassiSocleBandBottom;

  let pfL = 0, pfR = 0, pfT = 0, pfB = 0;
  const d1 = (pfDim1 || 0) * scale, d2 = ((pfDim2 || pfDim1) || 0) * scale;
  if (partieFixeType === 'Gauche') pfL = d1;
  if (partieFixeType === 'Droite') pfR = d1;
  if (partieFixeType === 'Droite et Gauche') { pfL = d1; pfR = d2; }
  if (partieFixeType === 'Haut') pfT = d1;
  if (partieFixeType === 'Bas') pfB = d1;
  if (partieFixeType === 'Haut et Bas') { pfT = d1; pfB = d2; }

  const vzX = iX + pfL, vzY = iY + pfT;
  const vzW = iW - pfL - pfR, vzH = iH - pfT - pfB;

  const pfReinforcedBottom = isPorteFr ? bo * 1.9 : null;
  const pfShowTraverse = isPorteFr && serrureTraverse;
  if (pfL > 0) {
    s += drawFixed(iX, iY, pfL, iH, bf, st, pfReinforcedBottom);
    if (pfShowTraverse) s += serrureTraverseBar(iX, iY, pfL, iH, bf, st);
  }
  if (pfR > 0) {
    s += drawFixed(iX + iW - pfR, iY, pfR, iH, bf, st, pfReinforcedBottom);
    if (pfShowTraverse) s += serrureTraverseBar(iX + iW - pfR, iY, pfR, iH, bf, st);
  }
  if (pfT > 0) s += drawFixed(vzX, iY, vzW, pfT, bf, st);
  if (pfB > 0) s += drawFixed(vzX, iY + iH - pfB, vzW, pfB, bf, st);

  if (drawType === 'fixe' || drawType === 'partie_fix') {
    s += drawFixed(iX, iY, iW, iH, bf, st);
    if (drawType === 'fixe' && (chassiMontants > 0 || chassiTraverses > 0)) {
      const fx = iX + bf, fy = iY + bf, fw = iW - 2 * bf, fh = iH - 2 * bf;
      const barW = Math.max(bf, 6);
      const montantBarW = chassiMontantWide ? barW * 2.2 : barW;
      const traverseBarW = chassiTraverseWide ? barW * 2.2 : barW;
      for (let i = 1; i <= chassiMontants; i++) {
        const bx = fx + (i / (chassiMontants + 1)) * fw - montantBarW / 2;
        s += `<rect x="${bx}" y="${fy}" width="${montantBarW}" height="${fh}" fill="${st.fill}" stroke="${st.stroke}" stroke-width="1"/>`;
      }
      for (let i = 1; i <= chassiTraverses; i++) {
        const by = fy + (i / (chassiTraverses + 1)) * fh - traverseBarW / 2;
        s += `<rect x="${fx}" y="${by}" width="${fw}" height="${traverseBarW}" fill="${st.fill}" stroke="${st.stroke}" stroke-width="1"/>`;
      }
    }
    if (partieFixLabel && cotations) {
      s += `<text x="${ox + winW / 2}" y="${oy + winH / 2 + 4}" text-anchor="middle" font-size="11" fill="#9ca3af" font-family="Inter, Arial" font-style="italic">${partieFixLabel}</text>`;
    }
  } else if (drawType === 'coulissante') {
    const overlap = bo * 0.9;
    const leafW = (vzW + (nbVantaux - 1) * overlap) / nbVantaux;
    const order: number[] = [];
    for (let i = 0; i < nbVantaux; i++) { if (i % 2 === 0) order.push(i); }
    for (let i = 0; i < nbVantaux; i++) { if (i % 2 === 1) order.push(i); }
    for (const i of order) {
      const lx = vzX + i * (leafW - overlap);
      s += drawSlidingLeaf(lx, vzY, leafW, vzH, bo, st, i, nbVantaux, estPorte && serrureTraverse);
    }
    if (rails && cotations) {
      s += `<text x="${ox}" y="${oy - 8}" font-size="10" fill="#6b7280" font-family="Inter, Arial" font-style="italic">sur ${rails} rails</text>`;
    }
  } else {
    const vW = vzW / nbVantaux;
    for (let i = 0; i < nbVantaux; i++) {
      const hingeLeft = nbVantaux === 1 ? true : i === 0;
      s += drawVantail(vzX + i * vW, vzY, vW, vzH, bo, st, {
        hingeLeft: hingeLeft,
        showHandle: nbVantaux === 1 ? true : i === 0,
        estPorte: estPorte,
        serrureTraverse: serrureTraverse,
        typeOuverture: typeOuverture,
      });
    }
  }

  if (estPorte) {
    const gy = oy + winH + 4;
    s += `<line x1="${ox - 18}" y1="${gy}" x2="${ox + winW + 18}" y2="${gy}" stroke="#374151" stroke-width="1.6"/>`;
    s += `<line x1="${ox - 18}" y1="${gy + 3}" x2="${ox + winW + 18}" y2="${gy + 3}" stroke="#9ca3af" stroke-width="0.8"/>`;
  }

  if (cotations) {
    const cotY1 = oy + winH + (estPorte ? 24 : 16);
    const cotY2 = cotY1 + 22;
    const isWindow = drawType !== 'fixe' && drawType !== 'partie_fix';
    const hasHParts = pfL > 0 || pfR > 0;
    const nbCols = isWindow ? nbVantaux : 1;

    if (hasHParts || nbCols > 1) {
      if (pfL > 0) s += hLine(iX, iX + pfL, cotY1, `${fmt(pfDim1)}`);
      if (pfR > 0) s += hLine(iX + iW - pfR, iX + iW, cotY1, `${fmt(pfDim2 || pfDim1)}`);
      const zoneCm = largeur - (pfL > 0 ? pfDim1 : 0) - (pfR > 0 ? (pfDim2 || pfDim1) : 0);
      if (nbCols > 1) {
        const leafCm = zoneCm / nbCols;
        const leafPx = vzW / nbCols;
        for (let i = 0; i < nbCols; i++) {
          s += hLine(vzX + i * leafPx, vzX + (i + 1) * leafPx, cotY1, `${fmt(leafCm)}`);
        }
      } else if (hasHParts) {
        s += hLine(vzX, vzX + vzW, cotY1, `${fmt(zoneCm)}`);
      }
      s += hLine(ox, ox + winW, cotY2, `${fmt(largeur)} cm`);
    } else {
      s += hLine(ox, ox + winW, cotY1 + 6, `${fmt(largeur)} cm`);
    }

    const cotX1 = ox + winW + 16;
    const cotX2 = cotX1 + 34;
    const hasVParts = pfT > 0 || pfB > 0;

    if (hasVParts) {
      if (pfT > 0) s += vLine(cotX1, iY, iY + pfT, `${fmt(pfDim1)}`);
      if (pfB > 0) s += vLine(cotX1, iY + iH - pfB, iY + iH, `${fmt(pfDim2 || pfDim1)}`);
      const zoneCm = hauteur - (pfT > 0 ? pfDim1 : 0) - (pfB > 0 ? (pfDim2 || pfDim1) : 0);
      s += vLine(cotX1, vzY, vzY + vzH, `${fmt(zoneCm)}`);
      s += vLine(cotX2, oy, oy + winH, `${fmt(hauteur)} cm`);
    } else {
      s += vLine(cotX1, oy, oy + winH, `${fmt(hauteur)} cm`);
    }
  }

  return wrapSVG(s, svgW, svgH, responsive);
}

function wrapSVG(content: string, w: number, h: number, responsive: boolean): string {
  const style = responsive ? ' style="max-width:100%;height:auto;display:block;"' : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"${style}>${content}</svg>`;
}
