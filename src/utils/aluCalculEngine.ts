import { DevisItemState } from '../context/AppContext';
import { FAMILIES, getProductTypesForFamily } from '../data/productCatalog';
import { INITIAL_ACCESSORIES, AccessoryItemDef } from '../data/initialAccessories';
import { INITIAL_ARTICLES, ArticleItem } from '../data/initialArticles';

/** Longueur standard des barres aluminium profilés en cm (6 mètres 50 = 650 cm) */
const STANDARD_BAR_LENGTH_CM = 650;
/** Longueur standard des barres de lames de volets et garde-corps en cm (6 mètres 00 = 600 cm) */
const STANDARD_SLAT_BAR_LENGTH_CM = 600;

/**
 * Profils ouvrants sans parclose intégrée.
 * Source : productCatalog.ts → ouvrant.eliminate_parclose
 */
const PROFILES_WITHOUT_PARCLOSE = ['40404', '40405', '40406'];

export interface CuttingPiece {
  id: string;
  itemIndex: number;
  elementLabel: string;
  pieceType: 'dormant_h' | 'dormant_l' | 'ouvrant_h' | 'ouvrant_l' | 'chicane' | 'traverse' | 'parclose' | 'couvre_joint' | 'lame_volet' | 'autre';
  profilRef: string;
  profilDesignation: string;
  lengthCm: number;
  quantity: number;
  angleLeft: '45°' | '90°';
  angleRight: '45°' | '90°';
  notes?: string;
}

export interface BarCutItem {
  pieceId: string;
  lengthCm: number;
  label: string;
  itemIndex?: number;
  elementLabel?: string;
}

export interface BarCutAllocation {
  barIndex: number;
  profilRef: string;
  barLengthCm: number;
  cuts: BarCutItem[];
  usedLengthCm: number;
  scrapCm: number;
  scrapPercent: number;
}

export interface DebitageSummary {
  profilRef: string;
  profilDesignation: string;
  isProfileBar: boolean; // true for standard 6.5m aluminum extrusion bars, false for 6m shutter slats / tubes
  totalLinearMeters: number;
  totalBarsCount: number;
  barLengthMeters: number;
  scrapPercentageAverage: number;
  allocatedBars: BarCutAllocation[];
}

export interface AccessoryItem {
  id: string;
  itemIndex?: number;
  elementLabel?: string;
  designation: string;
  reference?: string;
  category: 'equerre' | 'roulette' | 'verrou' | 'joint' | 'visserie' | 'accessoire' | 'moteur';
  quantity: number;
  unit: 'unité' | 'm' | 'paquet';
  unitPriceHt: number;
  totalPriceHt: number;
  details: string;
}

export interface GlassItem {
  id: string;
  itemIndex: number;
  elementLabel: string;
  hauteurCm: number;
  largeurCm: number;
  quantity: number;
  unitAreaM2: number;
  totalAreaM2: number;
  vitrageType: string;
}

export interface SupplierOrderItem {
  id: string;
  reference: string;
  designation: string;
  category: 'profile_alu' | 'lame_tablier' | 'moteur' | 'quincaillerie' | 'vitrage';
  quantity: number;
  unit: string;
  unitPriceHt?: number;
  totalPriceHt?: number;
  details?: string;
  color?: string;
}

export interface SupplierOrderCategory {
  id: 'profile_alu' | 'lame_tablier' | 'moteur' | 'quincaillerie' | 'vitrage';
  title: string;
  icon: string;
  badge: string;
  items: SupplierOrderItem[];
  totalCostHt: number;
}

export interface SupplierOrderSummary {
  categories: SupplierOrderCategory[];
  totalBarsProfileCount: number;
  totalBarsSlatCount: number;
  totalMotorsCount: number;
  totalHardwareCount: number;
  totalGlassAreaM2: number;
  grandTotalCostHt: number;
}

export interface AluCalculResult {
  cuttingPieces: CuttingPiece[];
  debitageSummary: DebitageSummary[];
  totalBarsCount: number;
  totalProfileBarsCount: number;
  totalSlatBarsCount: number;
  accessories: AccessoryItem[];
  totalAccessoriesCostHt: number;
  glassItems: GlassItem[];
  totalGlassAreaM2: number;
  totalJointBrosseMeters: number;
  totalJointVitrageMeters: number;
  supplierOrderSummary: SupplierOrderSummary;
}

/**
 * Configuration détaillée pour chaque type de lame de store / volet roulant
 */
export interface SlatConfig {
  lameType: string;
  lameRef: string;
  lameDesignation: string;
  stepCm: number;
  capRef: string;
  capNom: string;
  capUnitPrice: number;
  lameFinalRef: string;
  lameFinalDesignation: string;
}

export function detectSlatConfig(item: DevisItemState): SlatConfig {
  const rawType = (
    item.store_lame_type || 
    (item as any).store_lame || 
    (item as any).lame_type || 
    item.manual_designation || 
    ''
  ).toLowerCase();

  if (rawType.includes('extrud') || rawType.includes('extr') || rawType.includes('securite') || rawType.includes('sécurité')) {
    return {
      lameType: 'Lame Extrudée',
      lameRef: 'Lame extrudée',
      lameDesignation: 'Lames aluminium extrudé 50mm (Tablier haute résistance)',
      stepCm: 5.0,
      capRef: 'acc_bouchon_lame_extrude',
      capNom: 'Bouchon lame extrudée',
      capUnitPrice: 0.378,
      lameFinalRef: 'Lame final 55',
      lameFinalDesignation: 'Lame finale renforcée avec joint arrêt'
    };
  }
  if (rawType.includes('55') || rawType.includes('inj 55') || rawType.includes('injectée 55')) {
    return {
      lameType: 'Lame Injectée 55',
      lameRef: 'Lame injectée 55',
      lameDesignation: 'Lames aluminium injecté polyuréthane 55mm (Tablier)',
      stepCm: 5.5,
      capRef: 'acc_bouchon_lame_55',
      capNom: 'Bouchon lame 55',
      capUnitPrice: 0.216,
      lameFinalRef: 'Lame final 55',
      lameFinalDesignation: 'Lame finale 55 avec joint arrêt'
    };
  }
  if (rawType.includes('39') || rawType.includes('inj 39')) {
    return {
      lameType: 'Lame Injectée 39',
      lameRef: 'Lame injectée 39',
      lameDesignation: 'Lames aluminium injecté 39mm (Tablier)',
      stepCm: 3.9,
      capRef: 'acc_bouchon_lame_45',
      capNom: 'Bouchon lame 39',
      capUnitPrice: 0.162,
      lameFinalRef: 'Lame final 39',
      lameFinalDesignation: 'Lame finale 39 avec joint arrêt'
    };
  }
  if (rawType.includes('42') || rawType.includes('inj 42')) {
    return {
      lameType: 'Lame Injectée 42',
      lameRef: 'Lame injectée 42',
      lameDesignation: 'Lames aluminium injecté 42mm (Tablier)',
      stepCm: 4.2,
      capRef: 'acc_bouchon_lame_45',
      capNom: 'Bouchon lame 42',
      capUnitPrice: 0.162,
      lameFinalRef: 'Lame final 42',
      lameFinalDesignation: 'Lame finale 42 avec joint arrêt'
    };
  }
  if (rawType.includes('64') || rawType.includes('inj 64')) {
    return {
      lameType: 'Lame Injectée 64',
      lameRef: 'Lame injectée 64',
      lameDesignation: 'Lames aluminium injecté 64mm grand passage (Tablier)',
      stepCm: 6.4,
      capRef: 'acc_bouchon_lame_55',
      capNom: 'Bouchon lame 64',
      capUnitPrice: 0.216,
      lameFinalRef: 'Lame final 64',
      lameFinalDesignation: 'Lame finale 64 avec joint arrêt'
    };
  }
  
  const H = parseFloat(String(item.hauteur)) || 0;
  if (H >= 200) {
    return {
      lameType: 'Lame Injectée 55',
      lameRef: 'Lame injectée 55',
      lameDesignation: 'Lames aluminium injecté polyuréthane 55mm (Tablier)',
      stepCm: 5.5,
      capRef: 'acc_bouchon_lame_55',
      capNom: 'Bouchon lame 55',
      capUnitPrice: 0.216,
      lameFinalRef: 'Lame final 55',
      lameFinalDesignation: 'Lame finale 55 avec joint arrêt'
    };
  }

  return {
    lameType: 'Lame Injectée 45',
    lameRef: 'Lame injectée 45',
    lameDesignation: 'Lames aluminium injecté polyuréthane 45mm (Tablier)',
    stepCm: 4.5,
    capRef: 'acc_bouchon_lame_45',
    capNom: 'Bouchon lame 45',
    capUnitPrice: 0.162,
    lameFinalRef: 'Lame final 45',
    lameFinalDesignation: 'Lame finale 45 avec joint arrêt'
  };
}

/**
 * 1D First-Fit Decreasing (FFD) Cutting Stock Optimizer
 * Organizes cut lengths into minimal standard bars.
 */
function optimizeCuttingStock(
  pieces: BarCutItem[],
  profilRef: string,
  profilDesignation: string,
  isProfileBar = true,
  barLengthCm = 650
): DebitageSummary {
  const allCuts = [...pieces].sort((a, b) => b.lengthCm - a.lengthCm);
  const bars: BarCutAllocation[] = [];

  for (const cut of allCuts) {
    let placed = false;
    for (const bar of bars) {
      if (bar.usedLengthCm + cut.lengthCm <= barLengthCm) {
        bar.cuts.push(cut);
        bar.usedLengthCm += cut.lengthCm;
        bar.scrapCm = barLengthCm - bar.usedLengthCm;
        bar.scrapPercent = (bar.scrapCm / barLengthCm) * 100;
        placed = true;
        break;
      }
    }

    if (!placed) {
      const newBar: BarCutAllocation = {
        barIndex: bars.length + 1,
        profilRef,
        barLengthCm,
        cuts: [cut],
        usedLengthCm: cut.lengthCm,
        scrapCm: barLengthCm - cut.lengthCm,
        scrapPercent: ((barLengthCm - cut.lengthCm) / barLengthCm) * 100
      };
      bars.push(newBar);
    }
  }

  const totalLinearMeters = pieces.reduce((sum, p) => sum + p.lengthCm, 0) / 100;
  const scrapPercentageAverage = bars.length > 0
    ? bars.reduce((sum, b) => sum + b.scrapPercent, 0) / bars.length
    : 0;

  return {
    profilRef,
    profilDesignation,
    isProfileBar,
    totalLinearMeters,
    totalBarsCount: bars.length,
    barLengthMeters: barLengthCm / 100,
    scrapPercentageAverage,
    allocatedBars: bars
  };
}

/**
 * Helper to fetch accessory unit price
 */
function getAccPrice(id: string, defaultPrice: number): number {
  const found = INITIAL_ACCESSORIES.find(a => a.id === id);
  return found ? found.prix_unitaire_ht : defaultPrice;
}

/**
 * Helper to fetch profile bar unit price (HT) from catalog or default reference prices
 */
export function getProfileBarUnitPrice(ref: string, customArticles?: ArticleItem[], color?: string): number {
  if (!ref) return 75.000;
  
  const catalog = customArticles && customArticles.length > 0 ? customArticles : INITIAL_ARTICLES;
  const found = catalog.find(a => a.reference === ref || a.reference.toLowerCase() === ref.toLowerCase() || (a.reference.startsWith(ref) && ref.length >= 4));
  if (found && found.prix) {
    const cLow = (color || 'blanc').toLowerCase();
    const colKey = cLow.includes('noir') ? 'noir' :
                   cLow.includes('gris') ? 'gris' :
                   cLow.includes('mat') ? 'couleur_mat' :
                   cLow.includes('givr') ? 'couleur_givre' : 'blanc';
    const pr = found.prix[colKey as keyof typeof found.prix] || found.prix.blanc;
    if (pr && typeof pr.ht === 'number' && pr.ht > 0) {
      return pr.ht;
    }
  }

  // Exact fallback prices per 6.50m extrusion bar (DT HT)
  const fallbackPrices: Record<string, number> = {
    '40100': 110.767,
    '40401': 131.300,
    '40403': 144.847,
    '40112': 95.908,
    '40121': 227.081,
    '40110': 41.457,
    '40135': 32.338,
    '40155': 278.788,
    '40104': 148.967,
    '40402': 113.081,
    '67101': 121.182,
    '67104': 95.201,
    '67105': 74.106,
    '67106': 86.456,
    '80116': 19.067,
    '2984': 132.521,
    '2878': 30.325,
    '4085': 143.644,
    '4080': 128.000,
    'CSQ_116': 32.000,
    'CSQ_124': 22.000,
    'CSQ_Coulisse': 48.000,
    'CSQ_Coffre': 95.000,
    'MOUSTI_Coulisse': 36.000,
    'MOUSTI_Coffre': 58.000,
    'MOUSTI_Tirage': 28.000,
    'Lame_Finale': 42.000,
    'Lame final 55': 42.000,
    'Lame final 45': 38.000,
    'Lame final 39': 35.000,
    'Lame final 42': 38.000,
    'Lame final 64': 48.000
  };

  return fallbackPrices[ref] || 75.000;
}

/**
 * Helper to fetch shutter slat / tube unit price (HT) per 6.00m bar
 */
export function getSlatBarUnitPrice(ref: string, designation: string): number {
  const lower = (ref + ' ' + designation).toLowerCase();
  if (lower.includes('extrud')) return 85.000;
  if (lower.includes('64')) return 58.000;
  if (lower.includes('55')) return 45.000;
  if (lower.includes('45') || lower.includes('39') || lower.includes('42')) return 38.000;
  if (lower.includes('axe') || lower.includes('tube')) return 24.000;
  if (lower.includes('final')) return 42.000;
  return 45.000;
}

/**
 * Helper to fetch glass unit price (HT) per m²
 */
export function getGlassUnitPricePerM2(vitrageType: string): number {
  const lower = (vitrageType || '').toLowerCase();
  if (lower.includes('stopsol') && lower.includes('double')) return 110.000;
  if (lower.includes('double')) return 85.000;
  if (lower.includes('feuillet') || lower.includes('sécurit') || lower.includes('securit') || lower.includes('stadip')) return 95.000;
  if (lower.includes('stopsol') || lower.includes('fumé') || lower.includes('fume') || lower.includes('teinté') || lower.includes('teinte')) return 65.000;
  if (lower.includes('6mm') || lower.includes('6 mm')) return 42.000;
  if (lower.includes('4mm') || lower.includes('4 mm')) return 35.000;
  return 48.000;
}

/**
 * Construit un nom d'ouvrage technique précis et lisible
 * Remplace automatiquement les noms génériques ("Produit 1", "Article 2") par la vraie désignation technique
 */
export function getOuvrageDetailedTitle(item: DevisItemState, index?: number): string {
  const itemNum = index !== undefined ? index + 1 : 1;
  
  if (item.is_manual) {
    return item.manual_nom || `Ouvrage #${itemNum}`;
  }

  const fam = FAMILIES.find(f => f.id === item.family_id);
  const types = getProductTypesForFamily(item.family_id);
  const typeDef = types.find(t => t.id === item.product_type_id);

  const custom = (item.manual_designation || item.manual_nom || '').trim();
  const isGeneric = !custom || 
    /^produit\s*\d*$/i.test(custom) || 
    /^article\s*\d*$/i.test(custom) || 
    /^ouvrage\s*\d*$/i.test(custom) ||
    /^ligne\s*\d*$/i.test(custom);

  let baseTitle = '';
  if (!isGeneric) {
    baseTitle = custom;
  } else if (typeDef?.name) {
    baseTitle = typeDef.name;
  } else if (fam?.name) {
    baseTitle = fam.name;
  } else {
    baseTitle = `Ouvrage #${itemNum}`;
  }

  // Detect specific options (e.g. Slat type for shutters)
  let extraDetail = '';
  const isStore = item.product_type_id?.includes('store') || item.family_id === '67' || baseTitle.toLowerCase().includes('volet') || baseTitle.toLowerCase().includes('store');
  if (isStore) {
    const rawSlat = ((item.store_lame_type || (item as any).store_lame || (item as any).lame_type || '') as string).toLowerCase();
    if (rawSlat.includes('extrud') || (item as any).is_lame_extrudee) {
      extraDetail = ' (Lame Extrudée 50)';
    } else if (rawSlat.includes('55')) {
      extraDetail = ' (Lame Injectée 55)';
    } else if (rawSlat.includes('39')) {
      extraDetail = ' (Lame Injectée 39)';
    } else if (rawSlat.includes('45')) {
      extraDetail = ' (Lame Injectée 45)';
    }
  }

  // Detect series name
  const seriesName = fam?.name || (item.family_id ? `Série ${item.family_id}` : '');
  const baseHasSeries = seriesName && baseTitle.toLowerCase().includes(seriesName.toLowerCase());
  const seriesPart = (!baseHasSeries && seriesName && !isStore) ? ` — ${seriesName}` : '';

  // Dimension string
  const dimStr = (item.largeur && item.hauteur) ? ` [${item.largeur}×${item.hauteur} cm]` : '';

  return `${baseTitle}${extraDetail}${seriesPart}${dimStr}`;
}

export function getOuvrageShortTitle(item: DevisItemState, index?: number): string {
  const itemNum = index !== undefined ? index + 1 : 1;
  if (item.is_manual) return item.manual_nom || `Ouvrage #${itemNum}`;

  const types = getProductTypesForFamily(item.family_id);
  const typeDef = types.find(t => t.id === item.product_type_id);
  const custom = (item.manual_designation || item.manual_nom || '').trim();
  const isGeneric = !custom || 
    /^produit\s*\d*$/i.test(custom) || 
    /^article\s*\d*$/i.test(custom) || 
    /^ouvrage\s*\d*$/i.test(custom);

  const base = (!isGeneric ? custom : (typeDef?.name || `Ouvrage #${itemNum}`));
  const dim = item.largeur && item.hauteur ? ` (${item.largeur}×${item.hauteur})` : '';
  return `${base}${dim}`;
}

/**
 * Main Fabrication Calculation Engine (ALU CALCUL)
 */
export function calculateAluFabrication(items: DevisItemState[], customArticles?: ArticleItem[]): AluCalculResult {
  const cuttingPieces: CuttingPiece[] = [];
  const glassItems: GlassItem[] = [];
  const rawAccessories: AccessoryItem[] = [];

  let totalJointBrosseCmGlobal = 0;
  let totalJointVitrageCmGlobal = 0;

  items.forEach((item, itemIdx) => {
    if (item.is_manual) return;

    const H = parseFloat(String(item.hauteur)) || 0;
    const L = parseFloat(String(item.largeur)) || 0;
    const qty = Math.max(1, parseInt(String(item.quantity)) || 1);

    if (H <= 0 || L <= 0 || !item.family_id || !item.product_type_id) return;

    const fam = FAMILIES.find(f => f.id === item.family_id);
    const types = getProductTypesForFamily(item.family_id);
    const typeDef = types.find(t => t.id === item.product_type_id);
    const detailedTitle = getOuvrageDetailedTitle(item, itemIdx);
    const elementLabel = `#${itemIdx + 1} - ${detailedTitle}`;

    const desLower = ((item.manual_designation || item.manual_nom || '') as string).toLowerCase();
    const typeNameLower = (typeDef?.name || '').toLowerCase();
    const includeMenuiserie = item.include_menuiserie !== false;
    
    const isExplicitStore = (typeDef?.category === 'standalone_store' || fam?.drawType === 'store' || item.family_id === '67') && !desLower.includes('fenêtre') && !desLower.includes('porte') && !desLower.includes('couliss');
    const hasStoreFeature = Boolean(item.store_enabled || (item as any).volet_integre || item.supplements?.some((s: string) => s.toLowerCase().includes('volet') || s.toLowerCase().includes('store')));
    const isExplicitMousti = typeDef?.category === 'standalone_mousti' || fam?.drawType === 'mousti' || item.family_id === '68' || desLower.includes('mousti') || typeNameLower.includes('mousti');
    const hasMoustiFeature = Boolean(item.mousti_enabled);

    // Standalone Store: either explicit product, or window with store where menuiserie frame is excluded
    const isStore = (isExplicitStore || (!includeMenuiserie && hasStoreFeature)) && !isExplicitMousti;
    const hasAttachedStore = !isStore && includeMenuiserie && hasStoreFeature;

    // Standalone Moustiquaire: either explicit product, or window with moustiquaire where menuiserie frame is excluded
    const isMousti = (isExplicitMousti || (!includeMenuiserie && hasMoustiFeature && !hasStoreFeature));
    const isGardeCorps = typeDef?.category === 'garde_corps' || fam?.drawType === 'garde_corps' || item.family_id === '46' || desLower.includes('garde') || typeNameLower.includes('garde');
    const isChassiFix = includeMenuiserie && (typeDef?.category === 'chassi_fix' || fam?.drawType === 'fixe' || desLower.includes('châssis fixe') || desLower.includes('chassis fixe') || typeNameLower.includes('fixe'));
    const isCoulissant = includeMenuiserie && !isStore && !isMousti && !isGardeCorps && !isChassiFix && (fam?.drawType === 'coulissante' || typeDef?.category === 'coulissant' || item.family_id === '60' || item.family_id === '61' || item.family_id === '62' || item.family_id === '65' || item.family_id === '66' || desLower.includes('couliss') || typeNameLower.includes('couliss'));
    const isFrappe = includeMenuiserie && !isCoulissant && !isStore && !isMousti && !isGardeCorps && !isChassiFix;
    const isPorte = isFrappe && (item.family_id === 'portes_lourdes' || item.product_type_id?.includes('porte') || typeDef?.category === 'porte' || desLower.includes('porte'));

    let nbVantaux = 2;
    const vantauxMatch = typeDef?.name.match(/(\d+)\s*vantaux/i);
    if (vantauxMatch) {
      nbVantaux = parseInt(vantauxMatch[1]);
    } else if (typeDef?.name.toLowerCase().includes('1 vantail') || typeDef?.name.toLowerCase().includes('soufflet') || (isPorte && !typeDef?.name.toLowerCase().includes('2'))) {
      nbVantaux = 1;
    }

    // -------------------------------------------------------------
    // A. COULISSANT (Série 67 ALLUCO / SQUARE 67 / Alu Eco EX60)
    // -------------------------------------------------------------
    if (isCoulissant) {
      const dormantHautRef = item.comp_dormant_ref || '67101';
      const ouvrantCoulRef = item.comp_ouvrant_ref || '67104';
      const chicaneProfilRef = '67105';
      const travOuvrRef = '67106';
      const parcRef = item.comp_parclose_ref || '80116';

      // 1. Dormant Montants H
      cuttingPieces.push({
        id: `cut_${itemIdx}_coul_dorm_h`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'dormant_h',
        profilRef: dormantHautRef,
        profilDesignation: `Dormant Montant vertical (${dormantHautRef})`,
        lengthCm: H,
        quantity: 2 * qty,
        angleLeft: '45°',
        angleRight: '45°',
        notes: 'Cadre dormant extérieur montant'
      });

      // 2. Dormant Traverses L
      cuttingPieces.push({
        id: `cut_${itemIdx}_coul_dorm_l`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'dormant_l',
        profilRef: dormantHautRef,
        profilDesignation: `Dormant Traverse horizontale (${dormantHautRef})`,
        lengthCm: L,
        quantity: 2 * qty,
        angleLeft: '45°',
        angleRight: '45°',
        notes: 'Cadre dormant supérieur / inférieur'
      });

      // Formules officielles ALLUCO SQUARE 67:
      // Montants ouvrant : H - 6.0 cm
      // Traverses ouvrant : 2V -> (L - 15.6)/2, 3V -> (L - 16.1)/3, 4V -> (L - 25.4)/4
      const hOuvrant = Math.max(10, parseFloat((H - 6.0).toFixed(1)));
      let lOuvrant = Math.max(10, parseFloat(((L - 15.6) / 2).toFixed(1)));
      if (nbVantaux === 3) {
        lOuvrant = Math.max(10, parseFloat(((L - 16.1) / 3).toFixed(1)));
      } else if (nbVantaux === 4) {
        lOuvrant = Math.max(10, parseFloat(((L - 25.4) / 4).toFixed(1)));
      }

      // 3. Montants Ouvrant latéraux
      cuttingPieces.push({
        id: `cut_${itemIdx}_coul_ouvr_lat`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'ouvrant_h',
        profilRef: ouvrantCoulRef,
        profilDesignation: `Ouvrant Montant latéral CSQ 104 (${ouvrantCoulRef})`,
        lengthCm: hOuvrant,
        quantity: 2 * (nbVantaux === 4 ? 2 : 1) * qty,
        angleLeft: '90°',
        angleRight: '90°',
        notes: 'Montant latéral ouvrant coulissant'
      });

      // 4. Montants Centraux / Chicanes
      const nbChicanesPerUnit = nbVantaux === 2 ? 2 : (nbVantaux === 4 ? 4 : (nbVantaux === 3 ? 2 : 2));
      cuttingPieces.push({
        id: `cut_${itemIdx}_coul_chic`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'chicane',
        profilRef: chicaneProfilRef,
        profilDesignation: `Chicane Centrale CSQ 105/107 (${chicaneProfilRef})`,
        lengthCm: hOuvrant,
        quantity: nbChicanesPerUnit * qty,
        angleLeft: '90°',
        angleRight: '90°',
        notes: 'Croisement et renfort central'
      });

      // 5. Traverses Ouvrant (haut et bas)
      cuttingPieces.push({
        id: `cut_${itemIdx}_coul_trav`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'traverse',
        profilRef: travOuvrRef,
        profilDesignation: `Ouvrant Traverse CSQ 106 (${travOuvrRef})`,
        lengthCm: lOuvrant,
        quantity: nbVantaux * 2 * qty,
        angleLeft: '90°',
        angleRight: '90°',
        notes: 'Traverses haute et basse ouvrant'
      });

      // 6. Parcloses / Réducteurs
      const hParclose = Math.max(5, parseFloat((H - 17.0).toFixed(1)));
      cuttingPieces.push({
        id: `cut_${itemIdx}_coul_parc_h`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'parclose',
        profilRef: parcRef,
        profilDesignation: `Parclose CSQ 114 Montant (${parcRef})`,
        lengthCm: hParclose,
        quantity: 2 * nbVantaux * qty,
        angleLeft: '90°',
        angleRight: '90°',
        notes: 'Maintien vitrage montant'
      });

      // 7. Rail Inox Rapporté CSQ 116
      cuttingPieces.push({
        id: `cut_${itemIdx}_coul_rail_inox`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'traverse',
        profilRef: 'CSQ_116',
        profilDesignation: 'Rail Inox rapporté CSQ 116',
        lengthCm: Math.max(10, L - 7.5),
        quantity: 2 * qty,
        angleLeft: '90°',
        angleRight: '90°',
        notes: 'Rail de guidage bas inox'
      });

      // 8. Rejet d'eau CSQ 124
      cuttingPieces.push({
        id: `cut_${itemIdx}_coul_rejet_eau`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'autre',
        profilRef: 'CSQ_124',
        profilDesignation: 'Rejet d’eau dormant CSQ 124',
        lengthCm: L,
        quantity: 1 * qty,
        angleLeft: '90°',
        angleRight: '90°',
        notes: 'Évacuation eaux extérieures'
      });

      // Accessoires Coulissant ALLUCO 67
      const eq67Price = getAccPrice('acc_equerre_67', 1.944);
      rawAccessories.push({
        id: `acc_eq67_cadre_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Équerres d’assemblage cadre dormant 67 (13622CO)',
        reference: 'Équerre 67',
        category: 'equerre',
        quantity: 4 * qty,
        unit: 'unité',
        unitPriceHt: eq67Price,
        totalPriceHt: parseFloat((4 * qty * eq67Price).toFixed(3)),
        details: '4 équerres à pion par cadre dormant'
      });

      rawAccessories.push({
        id: `acc_eq67_ouvr_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Équerres d’assemblage ouvrant 67',
        reference: 'Équerre 67',
        category: 'equerre',
        quantity: 4 * nbVantaux * qty,
        unit: 'unité',
        unitPriceHt: eq67Price,
        totalPriceHt: parseFloat((4 * nbVantaux * qty * eq67Price).toFixed(3)),
        details: '4 équerres par vantail coulissant'
      });

      const visPrice = getAccPrice('acc_vis_six_pans', 0.216);
      const nbVisSIP = (nbVantaux === 2 ? 8 : (nbVantaux === 3 ? 12 : 16)) * qty;
      rawAccessories.push({
        id: `acc_vis_sip_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Vis d’assemblage cruciformes 4.8×25 SIP',
        reference: 'Vis SIP 4.8×25',
        category: 'visserie',
        quantity: nbVisSIP,
        unit: 'unité',
        unitPriceHt: visPrice,
        totalPriceHt: parseFloat((nbVisSIP * visPrice).toFixed(3)),
        details: 'Fixation mécanique traverses et montants'
      });

      const galetPrice = getAccPrice('acc_galet', 2.700);
      const nbGalets = 2 * nbVantaux * qty;
      rawAccessories.push({
        id: `acc_galets_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Galets de roulement double réglable (0312000)',
        reference: 'Galet',
        category: 'roulette',
        quantity: nbGalets,
        unit: 'unité',
        unitPriceHt: galetPrice,
        totalPriceHt: parseFloat((nbGalets * galetPrice).toFixed(3)),
        details: '2 galets réglables par vantail'
      });

      const kit67Price = getAccPrice('acc_kit_67', 4.860);
      rawAccessories.push({
        id: `acc_kit67_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Kit complet de guidage et étanchéité série 67 (ACC67K2V)',
        reference: 'Kit 67',
        category: 'accessoire',
        quantity: 1 * qty,
        unit: 'unité',
        unitPriceHt: kit67Price,
        totalPriceHt: parseFloat((kit67Price * qty).toFixed(3)),
        details: 'Bouchons chicane 252, butées 253, patins 251, busettes eau 256'
      });

      const fermPrice = getAccPrice('acc_fermeture', 10.260);
      const gachePrice = getAccPrice('acc_gache_fermeture', 2.160);
      const nbFerm = (nbVantaux === 4 ? 2 : 1) * qty;
      rawAccessories.push({
        id: `acc_ferm_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Fermetures encastrées BRIO (06004 / 04579000)',
        reference: 'Fermeture BRIO',
        category: 'verrou',
        quantity: nbFerm,
        unit: 'unité',
        unitPriceHt: fermPrice,
        totalPriceHt: parseFloat((nbFerm * fermPrice).toFixed(3)),
        details: 'Condamnation latérale de sécurité'
      });

      rawAccessories.push({
        id: `acc_gache_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Gâches de fermeture pour dormant (04694000)',
        reference: 'Gâche',
        category: 'verrou',
        quantity: nbFerm,
        unit: 'unité',
        unitPriceHt: gachePrice,
        totalPriceHt: parseFloat((nbFerm * gachePrice).toFixed(3)),
        details: 'Gâche de verrouillage montant dormant'
      });

      const brosseDormant = 2 * (2 * H + 2 * L);
      const brosseChicane = nbVantaux * 2 * hOuvrant;
      const itemBrosseCm = (brosseDormant + brosseChicane) * qty;
      totalJointBrosseCmGlobal += itemBrosseCm;

      const itemBrosseMeters = parseFloat((itemBrosseCm / 100).toFixed(2));
      const jBrossePrice = getAccPrice('acc_joint_brosse_76', 0.378);
      rawAccessories.push({
        id: `acc_jbrosse_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Joint brosse d’étanchéité 7/6 (JBR7X6 FS)',
        reference: 'Joint brosse 7/6',
        category: 'joint',
        quantity: itemBrosseMeters,
        unit: 'm',
        unitPriceHt: jBrossePrice,
        totalPriceHt: parseFloat((itemBrosseMeters * jBrossePrice).toFixed(3)),
        details: 'Étanchéité rails dormant et chicanes'
      });

      // Vitrage ALLUCO 67:
      // H_verre = H - 15.2 cm
      // L_verre = 2V: (L - 18.3)/2 cm, 3V: (L - 20.3)/3 cm, 4V: (L - 31.1)/4 cm
      const hVerre = Math.max(5, parseFloat((H - 15.2).toFixed(1)));
      let lVerre = Math.max(5, parseFloat(((L - 18.3) / 2).toFixed(1)));
      if (nbVantaux === 3) {
        lVerre = Math.max(5, parseFloat(((L - 20.3) / 3).toFixed(1)));
      } else if (nbVantaux === 4) {
        lVerre = Math.max(5, parseFloat(((L - 31.1) / 4).toFixed(1)));
      }

      const unitAreaM2 = parseFloat(((hVerre / 100) * (lVerre / 100)).toFixed(3));
      const totalVerresQty = nbVantaux * qty;
      const isDouble = item.remplissage_id?.toLowerCase().includes('double') || item.vitrage_type === 'double';

      glassItems.push({
        id: `glass_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel: `${elementLabel} (${nbVantaux} vantaux)`,
        hauteurCm: hVerre,
        largeurCm: lVerre,
        quantity: totalVerresQty,
        unitAreaM2,
        totalAreaM2: parseFloat((unitAreaM2 * totalVerresQty * (isDouble ? 2 : 1)).toFixed(3)),
        vitrageType: item.remplissage_id || 'Simple Clair 6mm'
      });

      const perimetreVerre = 2 * (hVerre + lVerre);
      const itemJointVitrageCm = perimetreVerre * 2 * totalVerresQty;
      totalJointVitrageCmGlobal += itemJointVitrageCm;

      const itemJointVitrageMeters = parseFloat((itemJointVitrageCm / 100).toFixed(2));
      const jVitPrice = getAccPrice('acc_joint_242', 0.324);
      rawAccessories.push({
        id: `acc_jvit_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Joint d’étanchéité vitrage (J220 / JV220)',
        reference: 'Joint 220',
        category: 'joint',
        quantity: itemJointVitrageMeters,
        unit: 'm',
        unitPriceHt: jVitPrice,
        totalPriceHt: parseFloat((itemJointVitrageMeters * jVitPrice).toFixed(3)),
        details: 'Calfeutrement intérieur et extérieur du verre'
      });
    }

    // -------------------------------------------------------------
    // B. STORE RIDEAU / VOLET ROULANT (Extrudé vs Injecté)
    // -------------------------------------------------------------
    else if (isStore) {
      const slatCfg = detectSlatConfig(item);

      // 1. Coulisses H
      cuttingPieces.push({
        id: `cut_${itemIdx}_store_coul`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'dormant_h',
        profilRef: 'CSQ_Coulisse',
        profilDesignation: 'Coulisses latérales de guidage Volet CSQ',
        lengthCm: H,
        quantity: 2 * qty,
        angleLeft: '90°',
        angleRight: '90°',
        notes: 'Coulisses de descente gauche et droite'
      });

      // 2. Coffre supérieur L
      cuttingPieces.push({
        id: `cut_${itemIdx}_store_coffre`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'dormant_l',
        profilRef: 'CSQ_Coffre',
        profilDesignation: 'Caisson / Coffre d’enroulement supérieur',
        lengthCm: L,
        quantity: 1 * qty,
        angleLeft: '90°',
        angleRight: '90°',
        notes: 'Coffre aluminium d’enroulement'
      });

      // 3. Axe tubulaire Ø60 octogonal (L - 7cm)
      const lAxe = Math.max(10, L - 7.0);
      cuttingPieces.push({
        id: `cut_${itemIdx}_store_axe`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'traverse',
        profilRef: 'Axe_60',
        profilDesignation: 'Tube Axe d’enroulement octogonal Ø60',
        lengthCm: lAxe,
        quantity: 1 * qty,
        angleLeft: '90°',
        angleRight: '90°',
        notes: 'Axe d’enroulement motorisé ou manuel'
      });

      // 4. Lame finale basse (L - 5cm)
      const lLame = Math.max(10, L - 5.0);
      cuttingPieces.push({
        id: `cut_${itemIdx}_store_lame_fin`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'traverse',
        profilRef: slatCfg.lameFinalRef,
        profilDesignation: slatCfg.lameFinalDesignation,
        lengthCm: lLame,
        quantity: 1 * qty,
        angleLeft: '90°',
        angleRight: '90°',
        notes: 'Lame finale avec joint d’arrêt bas'
      });

      // 5. Tablier de Lames (Nombre calculé avec pas exact)
      const nbLames = Math.ceil(H / slatCfg.stepCm);
      cuttingPieces.push({
        id: `cut_${itemIdx}_store_lames`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'lame_volet',
        profilRef: slatCfg.lameRef,
        profilDesignation: slatCfg.lameDesignation,
        lengthCm: lLame,
        quantity: nbLames * qty,
        angleLeft: '90°',
        angleRight: '90°',
        notes: `${nbLames} lames par volet (${slatCfg.lameType}, pas ${slatCfg.stepCm * 10}mm)`
      });

      // Accessoires Volet
      // Bouchons de lames (2 par lame)
      const nbBouchons = nbLames * 2 * qty;
      rawAccessories.push({
        id: `acc_bouchons_lame_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: `${slatCfg.capNom} (Embouts latéraux)`,
        reference: slatCfg.capNom,
        category: 'accessoire',
        quantity: nbBouchons,
        unit: 'unité',
        unitPriceHt: slatCfg.capUnitPrice,
        totalPriceHt: parseFloat((nbBouchons * slatCfg.capUnitPrice).toFixed(3)),
        details: '2 embouts par lame pour guidage silencieux'
      });

      // Blocs de sécurité anti-soulèvement (2 par volet)
      const secuPrice = getAccPrice('acc_bloc_secu_60', 31.212);
      rawAccessories.push({
        id: `acc_secu_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Blocs de sécurité anti-soulèvement type 60',
        reference: 'Bloc sécu 60',
        category: 'accessoire',
        quantity: 2 * qty,
        unit: 'unité',
        unitPriceHt: secuPrice,
        totalPriceHt: parseFloat((secuPrice * 2 * qty).toFixed(3)),
        details: 'Attaches rigides tablier anti-effraction'
      });

      // Rallonge d'axe télescopique 60
      const rallongePrice = getAccPrice('acc_rallonge_axe_60', 3.240);
      rawAccessories.push({
        id: `acc_rallonge_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Rallonge d’axe télescopique type 60',
        reference: 'Rallonge axe 60',
        category: 'accessoire',
        quantity: 1 * qty,
        unit: 'unité',
        unitPriceHt: rallongePrice,
        totalPriceHt: parseFloat((rallongePrice * qty).toFixed(3)),
        details: 'Embout réglable tube d’enroulement'
      });

      // Joint brosse coulisses volet
      const storeBrosseMeters = parseFloat(((4 * H * qty) / 100).toFixed(2));
      totalJointBrosseCmGlobal += 4 * H * qty;
      const jBrossePrice = getAccPrice('acc_joint_brosse_76', 0.378);
      rawAccessories.push({
        id: `acc_jbrosse_store_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Joint brosse de coulisse volet 7/6',
        reference: 'Joint brosse 7/6',
        category: 'joint',
        quantity: storeBrosseMeters,
        unit: 'm',
        unitPriceHt: jBrossePrice,
        totalPriceHt: parseFloat((storeBrosseMeters * jBrossePrice).toFixed(3)),
        details: 'Guidage étanche tablier dans coulisses'
      });
    }

    // -------------------------------------------------------------
    // C. GARDE CORPS
    // -------------------------------------------------------------
    else if (isGardeCorps) {
      const nbPoteaux = item.gc_nb_poteaux || Math.max(2, Math.ceil(L / 100) + 1);
      const nbLignes = item.gc_nb_lignes || 4;

      cuttingPieces.push({
        id: `cut_${itemIdx}_gc_main`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'dormant_l',
        profilRef: '2984',
        profilDesignation: 'Main courante tubulaire supérieure (2984)',
        lengthCm: L,
        quantity: 1 * qty,
        angleLeft: '90°',
        angleRight: '90°',
        notes: 'Main courante tubulaire'
      });

      cuttingPieces.push({
        id: `cut_${itemIdx}_gc_pot`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'dormant_h',
        profilRef: '4085',
        profilDesignation: 'Poteau vertical de fixation (4085)',
        lengthCm: H > 0 ? H : 100,
        quantity: nbPoteaux * qty,
        angleLeft: '90°',
        angleRight: '90°',
        notes: 'Fixation au sol / sabots'
      });

      cuttingPieces.push({
        id: `cut_${itemIdx}_gc_lisse`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'traverse',
        profilRef: '2878',
        profilDesignation: 'Lisse intermédiaire de sécurité (2878)',
        lengthCm: L,
        quantity: nbLignes * qty,
        angleLeft: '90°',
        angleRight: '90°',
        notes: 'Barreaudage horizontal'
      });

      // Sabots & accessoires garde-corps
      rawAccessories.push({
        id: `acc_gc_sabot_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Sabots de fixation au sol pour poteaux garde-corps',
        reference: 'Sabot GC',
        category: 'accessoire',
        quantity: nbPoteaux * qty,
        unit: 'unité',
        unitPriceHt: 12.500,
        totalPriceHt: parseFloat((12.500 * nbPoteaux * qty).toFixed(3)),
        details: 'Ancrage sol haute résistance'
      });
    }

    // -------------------------------------------------------------
    // D. MOUSTIQUAIRE
    // -------------------------------------------------------------
    else if (isMousti) {
      cuttingPieces.push({
        id: `cut_${itemIdx}_mousti_coul`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'dormant_h',
        profilRef: 'MOUSTI_Coulisse',
        profilDesignation: 'Coulisses latérales Moustiquaire',
        lengthCm: H,
        quantity: 2 * qty,
        angleLeft: '90°',
        angleRight: '90°'
      });
      cuttingPieces.push({
        id: `cut_${itemIdx}_mousti_coffre`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'dormant_l',
        profilRef: 'MOUSTI_Coffre',
        profilDesignation: 'Caisson d’enroulement supérieur Moustiquaire',
        lengthCm: L,
        quantity: 1 * qty,
        angleLeft: '90°',
        angleRight: '90°'
      });
      cuttingPieces.push({
        id: `cut_${itemIdx}_mousti_barre`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'traverse',
        profilRef: 'MOUSTI_Tirage',
        profilDesignation: 'Barre de tirage basse Moustiquaire',
        lengthCm: Math.max(10, L - 3.0),
        quantity: 1 * qty,
        angleLeft: '90°',
        angleRight: '90°'
      });

      const moustiBrosse = parseFloat(((2 * H * qty) / 100).toFixed(2));
      totalJointBrosseCmGlobal += 2 * H * qty;
      const jBrossePrice = getAccPrice('acc_joint_brosse_76', 0.378);
      rawAccessories.push({
        id: `acc_mousti_brosse_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Joint brosse coulisse moustiquaire',
        reference: 'Joint brosse 7/6',
        category: 'joint',
        quantity: moustiBrosse,
        unit: 'm',
        unitPriceHt: jBrossePrice,
        totalPriceHt: parseFloat((moustiBrosse * jBrossePrice).toFixed(3)),
        details: 'Étanchéité coulisses moustiquaire'
      });
    }

    // -------------------------------------------------------------
    // E. CHÂSSIS FIXE
    // -------------------------------------------------------------
    else if (isChassiFix) {
      const cadreRef = item.chassi_cadre_ref || item.comp_dormant_ref || '40100';
      const parcFixeRef = item.comp_parclose_ref || '40110';

      cuttingPieces.push({
        id: `cut_${itemIdx}_fix_h`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'dormant_h',
        profilRef: cadreRef,
        profilDesignation: `Cadre Fixe Montant vertical (${cadreRef})`,
        lengthCm: H,
        quantity: 2 * qty,
        angleLeft: '45°',
        angleRight: '45°',
        notes: 'Montant extérieur cadre fixe'
      });
      cuttingPieces.push({
        id: `cut_${itemIdx}_fix_l`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'dormant_l',
        profilRef: cadreRef,
        profilDesignation: `Cadre Fixe Traverse horizontale (${cadreRef})`,
        lengthCm: L,
        quantity: 2 * qty,
        angleLeft: '45°',
        angleRight: '45°',
        notes: 'Traverse extérieure cadre fixe'
      });

      cuttingPieces.push({
        id: `cut_${itemIdx}_fix_parc_h`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'parclose',
        profilRef: parcFixeRef,
        profilDesignation: `Parclose Fixe Montant vertical (${parcFixeRef})`,
        lengthCm: Math.max(10, H - 8.0),
        quantity: 2 * qty,
        angleLeft: '45°',
        angleRight: '45°'
      });
      cuttingPieces.push({
        id: `cut_${itemIdx}_fix_parc_l`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'parclose',
        profilRef: parcFixeRef,
        profilDesignation: `Parclose Fixe Traverse horizontale (${parcFixeRef})`,
        lengthCm: Math.max(10, L - 8.0),
        quantity: 2 * qty,
        angleLeft: '45°',
        angleRight: '45°'
      });

      const eq40Price = getAccPrice('acc_equerre_40', 2.160);
      rawAccessories.push({
        id: `acc_eq40_fix_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Équerres d’assemblage cadre fixe 40 (36440FR)',
        reference: 'Équerre 40',
        category: 'equerre',
        quantity: 4 * qty,
        unit: 'unité',
        unitPriceHt: eq40Price,
        totalPriceHt: parseFloat((4 * qty * eq40Price).toFixed(3)),
        details: '4 équerres par cadre fixe'
      });

      const hVerre = Math.max(5, parseFloat((H - 8.0).toFixed(1)));
      const lVerre = Math.max(5, parseFloat((L - 8.0).toFixed(1)));
      const unitAreaM2 = parseFloat(((hVerre / 100) * (lVerre / 100)).toFixed(3));
      const isDouble = item.remplissage_id?.toLowerCase().includes('double') || item.vitrage_type === 'double';

      glassItems.push({
        id: `glass_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        hauteurCm: hVerre,
        largeurCm: lVerre,
        quantity: qty,
        unitAreaM2,
        totalAreaM2: parseFloat((unitAreaM2 * qty * (isDouble ? 2 : 1)).toFixed(3)),
        vitrageType: item.remplissage_id || 'Simple Clair 6mm'
      });

      const jVitMeters = parseFloat(((2 * (hVerre + lVerre) * 2 * qty) / 100).toFixed(2));
      totalJointVitrageCmGlobal += 2 * (hVerre + lVerre) * 2 * qty;
      const jVitPrice = getAccPrice('acc_joint_242', 0.324);
      rawAccessories.push({
        id: `acc_jvit_fix_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Joint d’étanchéité vitrage fixe (J242 / ML03V)',
        reference: 'Joint 242',
        category: 'joint',
        quantity: jVitMeters,
        unit: 'm',
        unitPriceHt: jVitPrice,
        totalPriceHt: parseFloat((jVitMeters * jVitPrice).toFixed(3)),
        details: 'Maintien périphérique vitrage'
      });
    }

    // -------------------------------------------------------------
    // F. FRAPPE / FENÊTRES & PORTES (Série 40 ALLUCO / SQUARE 40)
    // -------------------------------------------------------------
    else {
      const dormantFrappeRef = item.comp_dormant_ref || '40100';
      const ouvrantFrappeRef = item.comp_ouvrant_ref || (isPorte ? '40403' : '40401');
      const battementRef = '40112';
      const parcloseFrappeRef = item.comp_parclose_ref || '40110';

      // 1. Dormant Montants H (45°)
      cuttingPieces.push({
        id: `cut_${itemIdx}_frappe_dorm_h`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'dormant_h',
        profilRef: dormantFrappeRef,
        profilDesignation: `Dormant Montant vertical (${dormantFrappeRef})`,
        lengthCm: H,
        quantity: 2 * qty,
        angleLeft: '45°',
        angleRight: '45°',
        notes: 'Cadre dormant extérieur montant'
      });

      // 2. Dormant Traverses L (45°)
      cuttingPieces.push({
        id: `cut_${itemIdx}_frappe_dorm_l`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'dormant_l',
        profilRef: dormantFrappeRef,
        profilDesignation: `Dormant Traverse horizontale (${dormantFrappeRef})`,
        lengthCm: L,
        quantity: (isPorte ? 1 : 2) * qty,
        angleLeft: '45°',
        angleRight: '45°',
        notes: isPorte ? 'Dormant traverse haute' : 'Dormant haut et bas'
      });

      // Formules officielles ALLUCO SQUARE 40:
      // Fenêtre 1V : H - 4.4 / L - 4.4
      // Fenêtre 2V : H - 4.4 / (L - 4.9)/2
      // Porte 1V : H - 4.6 / L - 7.8
      // Porte 2V : H - 4.6 / (L - 8.3)/2
      let hOuvrant = Math.max(10, parseFloat((H - (isPorte ? 4.6 : 4.4)).toFixed(1)));
      let lOuvrant = Math.max(10, parseFloat((isPorte 
        ? (nbVantaux === 1 ? L - 7.8 : (L - 8.3) / 2) 
        : (nbVantaux === 1 ? L - 4.4 : (L - 4.9) / 2)
      ).toFixed(1)));

      // 3. Ouvrant Montants (45°)
      cuttingPieces.push({
        id: `cut_${itemIdx}_frappe_ouvr_h`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'ouvrant_h',
        profilRef: ouvrantFrappeRef,
        profilDesignation: `Ouvrant Montant battant FSQ ${isPorte ? '403' : '401'} (${ouvrantFrappeRef})`,
        lengthCm: hOuvrant,
        quantity: 2 * nbVantaux * qty,
        angleLeft: '45°',
        angleRight: '45°',
        notes: 'Montants ouvrants battants'
      });

      // 4. Ouvrant Traverses (45°)
      cuttingPieces.push({
        id: `cut_${itemIdx}_frappe_ouvr_l`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'ouvrant_l',
        profilRef: ouvrantFrappeRef,
        profilDesignation: `Ouvrant Traverse battant FSQ ${isPorte ? '403' : '401'} (${ouvrantFrappeRef})`,
        lengthCm: lOuvrant,
        quantity: 2 * nbVantaux * qty,
        angleLeft: '45°',
        angleRight: '45°',
        notes: 'Traverses haute et basse ouvrant'
      });

      // 5. Battement central (UNIQUEMENT pour 2 vantaux)
      if (nbVantaux > 1) {
        const hBattement = Math.max(10, parseFloat((H - (isPorte ? 7.9 : 11.1)).toFixed(1)));
        cuttingPieces.push({
          id: `cut_${itemIdx}_frappe_batt`,
          itemIndex: itemIdx,
          elementLabel,
          pieceType: 'chicane',
          profilRef: battementRef,
          profilDesignation: `Battement Central FSQ 112 (${battementRef})`,
          lengthCm: hBattement,
          quantity: 1 * qty,
          angleLeft: '90°',
          angleRight: '90°',
          notes: 'Battement central de fermeture'
        });
      }

      // 6. Socle bas pour portes (FSQ 121 + FSQ 122)
      if (isPorte) {
        const lSocle = Math.max(10, parseFloat((nbVantaux === 1 ? L - 21.5 : (L - 35.7) / 2).toFixed(1)));
        cuttingPieces.push({
          id: `cut_${itemIdx}_porte_socle`,
          itemIndex: itemIdx,
          elementLabel,
          pieceType: 'traverse',
          profilRef: '40121',
          profilDesignation: 'Socle bas de porte FSQ 121 (130mm)',
          lengthCm: lSocle,
          quantity: (nbVantaux === 1 ? 2 : 4) * qty,
          angleLeft: '90°',
          angleRight: '90°',
          notes: 'Socle inférieur renforcé'
        });
      }

      // 7. Parcloses
      const skipParclose = PROFILES_WITHOUT_PARCLOSE.includes(item.comp_ouvrant_ref || '');
      if (!skipParclose) {
        const hParc = Math.max(5, parseFloat((isPorte ? H - 26.6 : H - 17.8).toFixed(1)));
        const lParc = Math.max(5, parseFloat((isPorte 
          ? (nbVantaux === 1 ? L - 21.5 : (L - 35.5) / 2) 
          : (nbVantaux === 1 ? L - 13.4 : (L - 22.9) / 2)
        ).toFixed(1)));

        cuttingPieces.push({
          id: `cut_${itemIdx}_frappe_parc_h`,
          itemIndex: itemIdx,
          elementLabel,
          pieceType: 'parclose',
          profilRef: parcloseFrappeRef,
          profilDesignation: `Parclose Montant FSQ 110/111 (${parcloseFrappeRef})`,
          lengthCm: hParc,
          quantity: 2 * nbVantaux * qty,
          angleLeft: '45°',
          angleRight: '45°',
          notes: 'Parclose verticale ouvrant'
        });

        cuttingPieces.push({
          id: `cut_${itemIdx}_frappe_parc_l`,
          itemIndex: itemIdx,
          elementLabel,
          pieceType: 'parclose',
          profilRef: parcloseFrappeRef,
          profilDesignation: `Parclose Traverse FSQ 110/111 (${parcloseFrappeRef})`,
          lengthCm: lParc,
          quantity: 2 * nbVantaux * qty,
          angleLeft: '45°',
          angleRight: '45°',
          notes: 'Parclose horizontale ouvrant'
        });
      }

      // Accessoires Frappe ALLUCO 40
      const eq40Price = getAccPrice('acc_equerre_40', 2.160);
      rawAccessories.push({
        id: `acc_eq40_cadre_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Équerres d’assemblage cadre 40 (36440FR)',
        reference: 'Équerre 40',
        category: 'equerre',
        quantity: 4 * qty,
        unit: 'unité',
        unitPriceHt: eq40Price,
        totalPriceHt: parseFloat((4 * qty * eq40Price).toFixed(3)),
        details: '4 équerres par cadre extérieur'
      });

      rawAccessories.push({
        id: `acc_eq40_ouvr_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Équerres d’assemblage ouvrant 40 (36440FR)',
        reference: 'Équerre 40',
        category: 'equerre',
        quantity: 4 * nbVantaux * qty,
        unit: 'unité',
        unitPriceHt: eq40Price,
        totalPriceHt: parseFloat((4 * nbVantaux * qty * eq40Price).toFixed(3)),
        details: '4 équerres par vantail battant'
      });

      const visPrice = getAccPrice('acc_vis_six_pans', 0.216);
      const nbVisSIP = (isPorte ? (nbVantaux === 1 ? 8 : 16) : (nbVantaux === 1 ? 8 : 12)) * qty;
      rawAccessories.push({
        id: `acc_vis_frappe_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Vis d’assemblage cruciformes 4.8×25 SIP',
        reference: 'Vis SIP 4.8×25',
        category: 'visserie',
        quantity: nbVisSIP,
        unit: 'unité',
        unitPriceHt: visPrice,
        totalPriceHt: parseFloat((nbVisSIP * visPrice).toFixed(3)),
        details: 'Fixation des équerres et profilés'
      });

      // Paumelles
      const paumellePrice = getAccPrice('acc_paumelle', 5.940);
      const nbPaumelles = (isPorte ? (H > 200 ? 4 : 3) : (H > 160 ? 3 : 2)) * nbVantaux * qty;
      rawAccessories.push({
        id: `acc_paumelles_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: isPorte ? 'Paumelles de porte renforcées Bridge (00600N)' : 'Paumelles de fenêtre à frappe (00120U)',
        reference: isPorte ? 'Paumelle Bridge' : 'Paumelle',
        category: 'verrou',
        quantity: nbPaumelles,
        unit: 'unité',
        unitPriceHt: paumellePrice,
        totalPriceHt: parseFloat((nbPaumelles * paumellePrice).toFixed(3)),
        details: `${isPorte ? '3 à 4' : '2 à 3'} paumelles par vantail`
      });

      // Crémone ou Serrure porte
      if (isPorte) {
        const serrurePrice = getAccPrice('acc_serrure_montante', 48.600);
        rawAccessories.push({
          id: `acc_serrure_porte_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: 'Serrure montante multipoints pour porte (SMSQR / 950302)',
          reference: 'Serrure montante',
          category: 'verrou',
          quantity: 1 * qty,
          unit: 'unité',
          unitPriceHt: serrurePrice,
          totalPriceHt: parseFloat((serrurePrice * qty).toFixed(3)),
          details: 'Serrure principale barillet 3 points'
        });

        const poigneePrice = getAccPrice('acc_poignee_bequille', 14.580);
        rawAccessories.push({
          id: `acc_poignee_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: 'Paire de poignées béquilles aluminium (02563 Kora)',
          reference: 'Poignée béquille',
          category: 'verrou',
          quantity: 1 * qty,
          unit: 'unité',
          unitPriceHt: poigneePrice,
          totalPriceHt: parseFloat((poigneePrice * qty).toFixed(3)),
          details: 'Béquille double avec rosaces'
        });
      } else {
        const cremonePrice = getAccPrice('acc_cremone', 15.876);
        rawAccessories.push({
          id: `acc_cremone_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: 'Crémone de fenêtre à frappe (00957)',
          reference: 'Crémone',
          category: 'verrou',
          quantity: 1 * qty,
          unit: 'unité',
          unitPriceHt: cremonePrice,
          totalPriceHt: parseFloat((cremonePrice * qty).toFixed(3)),
          details: '1 crémone avec mécanisme par châssis'
        });

        const kitCremonePrice = getAccPrice('acc_kit_cremone', 7.344);
        rawAccessories.push({
          id: `acc_kit_cremone_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: 'Kit tringles et accessoires crémone (02574000K)',
          reference: 'Kit crémone',
          category: 'verrou',
          quantity: 1 * qty,
          unit: 'unité',
          unitPriceHt: kitCremonePrice,
          totalPriceHt: parseFloat((kitCremonePrice * qty).toFixed(3)),
          details: 'Tringles de verrouillage haut et bas'
        });
      }

      // Angles de parclose
      if (!skipParclose) {
        const angleParcPrice = getAccPrice('acc_angle_pareclose', 0.270);
        const nbAngles = nbVantaux * 8 * qty;
        rawAccessories.push({
          id: `acc_angles_parc_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: 'Angles de pareclose (Coins de fixation)',
          reference: 'Angle de pareclose',
          category: 'accessoire',
          quantity: nbAngles,
          unit: 'unité',
          unitPriceHt: angleParcPrice,
          totalPriceHt: parseFloat((nbAngles * angleParcPrice).toFixed(3)),
          details: '8 angles par vantail'
        });
      }

      // Verrouillage semi-fixe & Bouchon 112 si 2 vantaux
      if (nbVantaux > 1) {
        const verrouPrice = getAccPrice('acc_verrou_semi_fixe', 7.020);
        rawAccessories.push({
          id: `acc_verrou_semifixe_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: isPorte ? 'Verrou semi-fixe pour porte (02168K)' : 'Verrou semi-fixe pour fenêtre (02111K)',
          reference: 'Verrouillage semi-fixe',
          category: 'verrou',
          quantity: 1 * qty,
          unit: 'unité',
          unitPriceHt: verrouPrice,
          totalPriceHt: parseFloat((verrouPrice * qty).toFixed(3)),
          details: 'Verrouillage haut et bas vantail passif'
        });

        const bouchonPrice = getAccPrice('acc_bouchon_112', 3.132);
        rawAccessories.push({
          id: `acc_bouchon_112_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: 'Bouchon de battement central (ACC40 112)',
          reference: 'Bouchon 112',
          category: 'accessoire',
          quantity: 1 * qty,
          unit: 'unité',
          unitPriceHt: bouchonPrice,
          totalPriceHt: parseFloat((bouchonPrice * qty).toFixed(3)),
          details: 'Étanchéité et finition battement'
        });
      }

      // Busettes d'eau
      const busettePrice = getAccPrice('acc_bouchon_lateral', 0.378);
      rawAccessories.push({
        id: `acc_busettes_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Busettes d’évacuation d’eau dormant (ACC67 256)',
        reference: 'Busette eau',
        category: 'accessoire',
        quantity: 2 * qty,
        unit: 'unité',
        unitPriceHt: busettePrice,
        totalPriceHt: parseFloat((2 * qty * busettePrice).toFixed(3)),
        details: 'Clapets de drainage extérieur'
      });

      // Joints Frappe ALLUCO 40
      const j247Meters = parseFloat(((2 * (H + L) * 2 * qty) / 100).toFixed(2));
      const j247Price = getAccPrice('acc_joint_247', 0.324);
      rawAccessories.push({
        id: `acc_j247_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Joint 247 d’étanchéité cadre dormant (J784 / JB247)',
        reference: 'Joint 247',
        category: 'joint',
        quantity: j247Meters,
        unit: 'm',
        unitPriceHt: j247Price,
        totalPriceHt: parseFloat((j247Meters * j247Price).toFixed(3)),
        details: 'Étanchéité périphérique cadre extérieur'
      });

      // Vitrage ALLUCO 40
      // Fenêtre 1V : L - 14.9 / H - 14.9
      // Fenêtre 2V : (L - 25.7)/2 / H - 14.9
      // Porte 1V : L - 22.7 / H - 23.6
      // Porte 2V : (L - 38.5)/2 / H - 23.6
      const hVerre = Math.max(5, parseFloat((H - (isPorte ? 23.6 : 14.9)).toFixed(1)));
      let lVerre = Math.max(5, parseFloat((isPorte 
        ? (nbVantaux === 1 ? L - 22.7 : (L - 38.5) / 2) 
        : (nbVantaux === 1 ? L - 14.9 : (L - 25.7) / 2)
      ).toFixed(1)));

      const unitAreaM2 = parseFloat(((hVerre / 100) * (lVerre / 100)).toFixed(3));
      const totalVerresQty = nbVantaux * qty;
      const isDouble = item.remplissage_id?.toLowerCase().includes('double') || item.vitrage_type === 'double';

      glassItems.push({
        id: `glass_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel: `${elementLabel} (${nbVantaux} vantaux)`,
        hauteurCm: hVerre,
        largeurCm: lVerre,
        quantity: totalVerresQty,
        unitAreaM2,
        totalAreaM2: parseFloat((unitAreaM2 * totalVerresQty * (isDouble ? 2 : 1)).toFixed(3)),
        vitrageType: item.remplissage_id || 'Simple Clair 6mm'
      });

      const perimetreVerre = 2 * (hVerre + lVerre);
      const itemJointVitrageCm = perimetreVerre * 2 * totalVerresQty;
      totalJointVitrageCmGlobal += itemJointVitrageCm;

      const j242Meters = parseFloat((itemJointVitrageCm / 100).toFixed(2));
      const j242Price = getAccPrice('acc_joint_242', 0.324);
      rawAccessories.push({
        id: `acc_j242_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Joint 242 de vitrage ouvrant (J242 / ML03V)',
        reference: 'Joint 242',
        category: 'joint',
        quantity: j242Meters,
        unit: 'm',
        unitPriceHt: j242Price,
        totalPriceHt: parseFloat((j242Meters * j242Price).toFixed(3)),
        details: 'Maintien étanche du vitrage'
      });

      if (isPorte) {
        const jBrossePorteM = parseFloat(((L * qty) / 100).toFixed(2));
        totalJointBrosseCmGlobal += L * qty;
        const jBrossePrice = getAccPrice('acc_joint_brosse_76', 0.378);
        rawAccessories.push({
          id: `acc_jbrosse_porte_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: 'Joint brosse d’étanchéité bas de porte (JBR7X6)',
          reference: 'Joint brosse 7/6',
          category: 'joint',
          quantity: jBrossePorteM,
          unit: 'm',
          unitPriceHt: jBrossePrice,
          totalPriceHt: parseFloat((jBrossePorteM * jBrossePrice).toFixed(3)),
          details: 'Calfeutrement seuil bas de porte'
        });
      }
    }

    // Attached Shutter (Volet Intégré / Monobloc)
    if (hasAttachedStore) {
      const slatCfg = detectSlatConfig(item);

      cuttingPieces.push({
        id: `cut_${itemIdx}_att_store_coul`,
        itemIndex: itemIdx,
        elementLabel: `${elementLabel} - Volet Intégré`,
        pieceType: 'dormant_h',
        profilRef: 'CSQ_Coulisse',
        profilDesignation: 'Coulisses latérales Volet Intégré',
        lengthCm: H,
        quantity: 2 * qty,
        angleLeft: '90°',
        angleRight: '90°'
      });
      cuttingPieces.push({
        id: `cut_${itemIdx}_att_store_coffre`,
        itemIndex: itemIdx,
        elementLabel: `${elementLabel} - Volet Intégré`,
        pieceType: 'dormant_l',
        profilRef: 'CSQ_Coffre',
        profilDesignation: 'Caisson Coffre Volet Intégré',
        lengthCm: L,
        quantity: 1 * qty,
        angleLeft: '90°',
        angleRight: '90°'
      });
      cuttingPieces.push({
        id: `cut_${itemIdx}_att_store_axe`,
        itemIndex: itemIdx,
        elementLabel: `${elementLabel} - Volet Intégré`,
        pieceType: 'traverse',
        profilRef: 'Axe_60',
        profilDesignation: 'Tube Axe octogonal Ø60',
        lengthCm: Math.max(10, L - 7.0),
        quantity: 1 * qty,
        angleLeft: '90°',
        angleRight: '90°'
      });
      cuttingPieces.push({
        id: `cut_${itemIdx}_att_store_lame_fin`,
        itemIndex: itemIdx,
        elementLabel: `${elementLabel} - Volet Intégré`,
        pieceType: 'traverse',
        profilRef: slatCfg.lameFinalRef,
        profilDesignation: slatCfg.lameFinalDesignation,
        lengthCm: Math.max(10, L - 5.0),
        quantity: 1 * qty,
        angleLeft: '90°',
        angleRight: '90°'
      });

      const nbLames = Math.ceil(H / slatCfg.stepCm);
      cuttingPieces.push({
        id: `cut_${itemIdx}_att_store_lames`,
        itemIndex: itemIdx,
        elementLabel: `${elementLabel} - Volet Intégré`,
        pieceType: 'lame_volet',
        profilRef: slatCfg.lameRef,
        profilDesignation: slatCfg.lameDesignation,
        lengthCm: Math.max(10, L - 5.0),
        quantity: nbLames * qty,
        angleLeft: '90°',
        angleRight: '90°'
      });

      const nbBouchons = nbLames * 2 * qty;
      rawAccessories.push({
        id: `acc_att_bouchons_lame_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel: `${elementLabel} - Volet Intégré`,
        designation: `${slatCfg.capNom} (Embouts latéraux)`,
        reference: slatCfg.capNom,
        category: 'accessoire',
        quantity: nbBouchons,
        unit: 'unité',
        unitPriceHt: slatCfg.capUnitPrice,
        totalPriceHt: parseFloat((nbBouchons * slatCfg.capUnitPrice).toFixed(3)),
        details: '2 embouts par lame'
      });

      const secuPrice = getAccPrice('acc_bloc_secu_60', 31.212);
      rawAccessories.push({
        id: `acc_att_secu_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel: `${elementLabel} - Volet Intégré`,
        designation: 'Blocs de sécurité anti-soulèvement type 60',
        reference: 'Bloc sécu 60',
        category: 'accessoire',
        quantity: 2 * qty,
        unit: 'unité',
        unitPriceHt: secuPrice,
        totalPriceHt: parseFloat((secuPrice * 2 * qty).toFixed(3)),
        details: 'Attaches tablier anti-effraction'
      });

      const rallongePrice = getAccPrice('acc_rallonge_axe_60', 3.240);
      rawAccessories.push({
        id: `acc_att_rallonge_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel: `${elementLabel} - Volet Intégré`,
        designation: 'Rallonge d’axe télescopique type 60',
        reference: 'Rallonge axe 60',
        category: 'accessoire',
        quantity: 1 * qty,
        unit: 'unité',
        unitPriceHt: rallongePrice,
        totalPriceHt: parseFloat((rallongePrice * qty).toFixed(3)),
        details: 'Embout réglable tube d’enroulement'
      });

      const storeBrosseM = parseFloat(((4 * H * qty) / 100).toFixed(2));
      totalJointBrosseCmGlobal += 4 * H * qty;
      const jBrossePrice = getAccPrice('acc_joint_brosse_76', 0.378);
      rawAccessories.push({
        id: `acc_att_jbrosse_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel: `${elementLabel} - Volet Intégré`,
        designation: 'Joint brosse coulisse volet intégré',
        reference: 'Joint brosse 7/6',
        category: 'joint',
        quantity: storeBrosseM,
        unit: 'm',
        unitPriceHt: jBrossePrice,
        totalPriceHt: parseFloat((storeBrosseM * jBrossePrice).toFixed(3)),
        details: 'Guidage étanche tablier'
      });
    }

    // Moteurs & Automatismes
    if (isStore || hasAttachedStore) {
      const manoeuvre = item.store_manoeuvre || 'moteur_filaire';
      const surfaceM2 = (L * H) / 10000;

      if (manoeuvre === 'moteur_filaire' || manoeuvre === 'moteur_radio') {
        let motorNom = 'Moteur tubulaire 60 kg (2.5 à 4.5 m²)';
        let motorRef = 'acc_moteur_60kg';
        let motorPrice = 81.000;

        if (item.store_moteur_id && item.store_moteur_id !== 'auto') {
          if (item.store_moteur_id === 'acc_moteur_40kg') { motorNom = 'Moteur tubulaire 40 kg'; motorRef = 'acc_moteur_40kg'; motorPrice = 70.200; }
          else if (item.store_moteur_id === 'acc_moteur_60kg') { motorNom = 'Moteur tubulaire 60 kg'; motorRef = 'acc_moteur_60kg'; motorPrice = 81.000; }
          else if (item.store_moteur_id === 'acc_moteur_100kg') { motorNom = 'Moteur tubulaire 100 kg'; motorRef = 'acc_moteur_100kg'; motorPrice = 102.600; }
          else if (item.store_moteur_id === 'acc_moteur_160kg') { motorNom = 'Moteur tubulaire 160 kg'; motorRef = 'acc_moteur_160kg'; motorPrice = 194.400; }
          else if (item.store_moteur_id === 'acc_moteur_250kg') { motorNom = 'Moteur tubulaire 250 kg'; motorRef = 'acc_moteur_250kg'; motorPrice = 237.600; }
        } else if (surfaceM2 > 0) {
          if (surfaceM2 <= 2.2) { motorNom = 'Moteur tubulaire 40 kg'; motorRef = 'acc_moteur_40kg'; motorPrice = 70.200; }
          else if (surfaceM2 <= 4.2) { motorNom = 'Moteur tubulaire 60 kg'; motorRef = 'acc_moteur_60kg'; motorPrice = 81.000; }
          else if (surfaceM2 <= 7.0) { motorNom = 'Moteur tubulaire 100 kg'; motorRef = 'acc_moteur_100kg'; motorPrice = 102.600; }
          else { motorNom = 'Moteur tubulaire 160 kg'; motorRef = 'acc_moteur_160kg'; motorPrice = 194.400; }
        }

        rawAccessories.push({
          id: `motor_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: `${motorNom} (Ouvrage #${itemIdx + 1})`,
          reference: motorRef,
          category: 'moteur',
          quantity: 1 * qty,
          unit: 'unité',
          unitPriceHt: motorPrice,
          totalPriceHt: parseFloat((motorPrice * qty).toFixed(3)),
          details: `Motorisation store ${manoeuvre === 'moteur_radio' ? 'Radio avec télécommande sans fil' : 'Filaire avec inverseur mural'}`
        });
      } else if (manoeuvre === 'manuel_sangle') {
        const sanglePrice = getAccPrice('acc_sangle_gm', 2.160);
        rawAccessories.push({
          id: `sangle_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: `Enrouleur et sangle de manœuvre (Ouvrage #${itemIdx + 1})`,
          reference: 'Sangle GM',
          category: 'accessoire',
          quantity: 1 * qty,
          unit: 'unité',
          unitPriceHt: sanglePrice,
          totalPriceHt: parseFloat((sanglePrice * qty).toFixed(3)),
          details: 'Manœuvre manuelle par sangle'
        });
      }
    }

    // Moustiquaires
    const hasMousti = isMousti || item.mousti_enabled;
    if (hasMousti) {
      const typeLabel = item.mousti_type === 'plissee' ? 'Plissée Coulissante' : (item.mousti_type === 'fixe' ? 'Cadre Fixe' : (item.mousti_type === 'battante' ? 'Porte Battante' : 'Enroulable Verticale'));
      rawAccessories.push({
        id: `mousti_kit_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: `Kit Moustiquaire ${typeLabel} (Ouvrage #${itemIdx + 1})`,
        reference: `MOUSTI_${(item.mousti_type || 'enroulable').toUpperCase()}`,
        category: 'accessoire',
        quantity: 1 * qty,
        unit: 'unité',
        unitPriceHt: 25.000,
        totalPriceHt: parseFloat((25.000 * qty).toFixed(3)),
        details: 'Toile fibre de verre enduite PVC et accessoires'
      });
    }

    // Supplements (Groom, Cylindre)
    if (item.supplements?.includes('Ferme-porte Groom')) {
      rawAccessories.push({
        id: `groom_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: `Ferme-porte hydraulique aérien (Groom) (Ouvrage #${itemIdx + 1})`,
        reference: 'Groom Hydraulique',
        category: 'accessoire',
        quantity: 1 * qty,
        unit: 'unité',
        unitPriceHt: 45.000,
        totalPriceHt: parseFloat((45.000 * qty).toFixed(3)),
        details: 'Ferme-porte à vitesse réglable'
      });
    }

    if (item.supplements?.includes('Serrure à clé')) {
      rawAccessories.push({
        id: `serrure_cle_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: `Cylindre de sécurité européen à clé (Ouvrage #${itemIdx + 1})`,
        reference: 'Cylindre Européen',
        category: 'verrou',
        quantity: 1 * qty,
        unit: 'unité',
        unitPriceHt: 18.000,
        totalPriceHt: parseFloat((18.000 * qty).toFixed(3)),
        details: 'Barillet 3 clés'
      });
    }
  });

  // Standard extrusion profile designations
  const PROFILE_EXTRUSION_NAMES: Record<string, string> = {
    // Frappe (Série 40 / TPR)
    '40100': 'Profilé Dormant Cadre (40100)',
    '40401': 'Profilé Ouvrant Battant (40401)',
    '40403': 'Profilé Ouvrant Porte Double Tubulaire (40403)',
    '40112': 'Profilé Battement Central (40112)',
    '40121': 'Profilé Socle Bas 130mm (40121)',
    '40110': 'Profilé Parclose Frappe (40110)',
    '40135': 'Profilé Traverse Intermédiaire (40135)',
    '40155': 'Profilé Meneau Fixe (40155)',
    '40104': 'Profilé Traverse Fixe (40104)',
    '40402': 'Profilé Couvre-joint Tapée (40402)',

    // Coulissant (Série 67 / TPR / EX60)
    '67101': 'Profilé Dormant Coulissant (67101)',
    '67104': 'Profilé Ouvrant Coulissant (67104)',
    '67105': 'Profilé Chicane Renfort (67105)',
    '67106': 'Profilé Traverse Ouvrant (67106)',
    '80116': 'Profilé Parclose Coulissant (80116)',
    'CSQ_116': 'Rail Inox Rapporté (CSQ 116)',
    'CSQ_124': 'Rejet d’eau Dormant (CSQ 124)',

    // Volet Roulant / Store
    'CSQ_Coulisse': 'Profilé Coulisses Volet Roulant',
    'CSQ_Coffre': 'Caisson / Coffre Volet Roulant',
    'Axe_60': 'Tube Axe Octogonal Ø60 Volet',
    'Lame_Finale': 'Lame Finale Basse Volet',
    'Lame final 55': 'Lame Finale Basse 55',
    'Lame final 45': 'Lame Finale Basse 45',
    'Lame final 39': 'Lame Finale Basse 39',
    'Lame final 42': 'Lame Finale Basse 42',
    'Lame final 64': 'Lame Finale Basse 64',
    'Lame extrudée': 'Lames Tablier Volet Roulant Extrudé',
    'Lame injectée 55': 'Lames Tablier Volet Roulant 55mm',
    'Lame injectée 45': 'Lames Tablier Volet Roulant 45mm',
    'Lame injectée 42': 'Lames Tablier Volet Roulant 42mm',
    'Lame injectée 39': 'Lames Tablier Volet Roulant 39mm',
    'Lame injectée 64': 'Lames Tablier Volet Roulant 64mm',

    // Moustiquaire
    'MOUSTI_Coulisse': 'Profilé Coulisses Moustiquaire',
    'MOUSTI_Coffre': 'Caisson Enroulement Moustiquaire',
    'MOUSTI_Tirage': 'Barre de Tirage Basse Moustiquaire',

    // Garde-corps
    '2984': 'Profilé Main Courante (2984)',
    '4080': 'Profilé Main Courante (4080)',
    '4085': 'Profilé Poteau Fixation (4085)',
    '2878': 'Profilé Lisse Sécurité (2878)'
  };

  // Group cutting pieces by Profile Reference for debitage optimization
  const piecesByRef: { 
    [ref: string]: { 
      pieces: BarCutItem[]; 
      designation: string;
      isProfileBar: boolean;
    } 
  } = {};

  cuttingPieces.forEach(cp => {
    const isSlat = cp.pieceType === 'lame_volet' || cp.profilRef === 'Axe_60' || cp.profilRef === '2878';
    if (!piecesByRef[cp.profilRef]) {
      const standardName = PROFILE_EXTRUSION_NAMES[cp.profilRef] || cp.profilDesignation;
      piecesByRef[cp.profilRef] = { 
        pieces: [], 
        designation: standardName,
        isProfileBar: !isSlat
      };
    }
    for (let i = 0; i < cp.quantity; i++) {
      piecesByRef[cp.profilRef].pieces.push({
        pieceId: `${cp.id}_${i}`,
        lengthCm: cp.lengthCm,
        label: cp.profilDesignation,
        itemIndex: cp.itemIndex,
        elementLabel: cp.elementLabel
      });
    }
  });

  const GARDE_CORPS_REFS = ['2984', '4080', '4085', '2878'];

  const debitageSummary: DebitageSummary[] = Object.keys(piecesByRef).map(ref => {
    const isGardeCorps = GARDE_CORPS_REFS.includes(ref);
    const isSlat = !piecesByRef[ref].isProfileBar;
    const barLen = (isGardeCorps || isSlat) ? STANDARD_SLAT_BAR_LENGTH_CM : STANDARD_BAR_LENGTH_CM;
    return optimizeCuttingStock(
      piecesByRef[ref].pieces,
      ref,
      piecesByRef[ref].designation,
      piecesByRef[ref].isProfileBar,
      barLen
    );
  });

  const totalProfileBarsCount = debitageSummary
    .filter(d => d.isProfileBar)
    .reduce((sum, d) => sum + d.totalBarsCount, 0);

  const totalSlatBarsCount = debitageSummary
    .filter(d => !d.isProfileBar)
    .reduce((sum, d) => sum + d.totalBarsCount, 0);

  const totalBarsCount = debitageSummary.reduce((sum, d) => sum + d.totalBarsCount, 0);

  const totalAccessoriesCostHt = parseFloat(rawAccessories.reduce((sum, a) => sum + a.totalPriceHt, 0).toFixed(3));
  const totalGlassAreaM2 = parseFloat(glassItems.reduce((sum, g) => sum + g.totalAreaM2, 0).toFixed(3));
  const totalJointBrosseMeters = parseFloat((totalJointBrosseCmGlobal / 100).toFixed(2));
  const totalJointVitrageMeters = parseFloat((totalJointVitrageCmGlobal / 100).toFixed(2));

  // -------------------------------------------------------------
  // CONSTRUCTION DU BON DE COMMANDE FOURNISSEUR GLOBAL (5 Catégories)
  // -------------------------------------------------------------
  
  // 1. Catégorie Profilés Alu (Barres 6.50m)
  const profileAluItems: SupplierOrderItem[] = debitageSummary
    .filter(d => d.isProfileBar)
    .map(d => {
      const uPrice = getProfileBarUnitPrice(d.profilRef, customArticles);
      const tPrice = parseFloat((d.totalBarsCount * uPrice).toFixed(3));
      return {
        id: `sup_prof_${d.profilRef}`,
        reference: d.profilRef,
        designation: d.profilDesignation,
        category: 'profile_alu',
        quantity: d.totalBarsCount,
        unit: `barre${d.totalBarsCount > 1 ? 's' : ''} (6.50m)`,
        unitPriceHt: uPrice,
        totalPriceHt: tPrice,
        details: `Métrage net : ${d.totalLinearMeters.toFixed(2)} m (Chute moy: ${d.scrapPercentageAverage.toFixed(1)}%)`
      };
    });

  // 2. Catégorie Tabliers & Lames de Volets (Barres 6.00m)
  const slatItems: SupplierOrderItem[] = debitageSummary
    .filter(d => !d.isProfileBar)
    .map(d => {
      const cutSlatsCount = cuttingPieces
        .filter(cp => cp.profilRef === d.profilRef)
        .reduce((sum, cp) => sum + cp.quantity, 0);

      const cutDetails = cutSlatsCount > 0
        ? `${cutSlatsCount} lames débitées • Métrage net : ${d.totalLinearMeters.toFixed(2)} m (Chute moy: ${d.scrapPercentageAverage.toFixed(1)}%)`
        : `Métrage net : ${d.totalLinearMeters.toFixed(2)} m (Chute moy: ${d.scrapPercentageAverage.toFixed(1)}%)`;

      const uPrice = getSlatBarUnitPrice(d.profilRef, d.profilDesignation);
      const tPrice = parseFloat((d.totalBarsCount * uPrice).toFixed(3));

      return {
        id: `sup_slat_${d.profilRef}`,
        reference: d.profilRef,
        designation: d.profilDesignation,
        category: 'lame_tablier',
        quantity: d.totalBarsCount,
        unit: `barre${d.totalBarsCount > 1 ? 's' : ''} (6.00m)`,
        unitPriceHt: uPrice,
        totalPriceHt: tPrice,
        details: cutDetails
      };
    });

  // 3. Catégorie Motorisation & Automatismes
  const motorItems: SupplierOrderItem[] = rawAccessories
    .filter(a => a.category === 'moteur')
    .map(a => ({
      id: `sup_mot_${a.id}`,
      reference: a.reference || 'Moteur',
      designation: a.designation,
      category: 'moteur',
      quantity: a.quantity,
      unit: a.unit,
      unitPriceHt: a.unitPriceHt,
      totalPriceHt: a.totalPriceHt,
      details: a.details
    }));

  // 4. Catégorie Quincaillerie, Visserie & Joints (Agrégée par référence pour le bon d'achat)
  const hardwareAgg: { [ref: string]: { item: AccessoryItem; qty: number; totalPrice: number } } = {};
  rawAccessories
    .filter(a => a.category !== 'moteur')
    .forEach(a => {
      const key = a.reference || a.designation;
      if (!hardwareAgg[key]) {
        hardwareAgg[key] = {
          item: a,
          qty: 0,
          totalPrice: 0
        };
      }
      hardwareAgg[key].qty += a.quantity;
      hardwareAgg[key].totalPrice += a.totalPriceHt;
    });

  const hardwareItems: SupplierOrderItem[] = Object.keys(hardwareAgg).map(key => {
    const entry = hardwareAgg[key];
    return {
      id: `sup_hw_${key}`,
      reference: entry.item.reference || key,
      designation: entry.item.designation.replace(/\(Ouvrage #\d+\)/g, '').trim(),
      category: 'quincaillerie',
      quantity: typeof entry.qty === 'number' && entry.item.unit === 'm' ? parseFloat(entry.qty.toFixed(2)) : entry.qty,
      unit: entry.item.unit,
      unitPriceHt: entry.item.unitPriceHt,
      totalPriceHt: parseFloat(entry.totalPrice.toFixed(3)),
      details: entry.item.details
    };
  });

  // 5. Catégorie Miroiterie & Vitrage (Consolidée par type de vitrage avec surfaces et prix HT)
  const glassAgg: { [vType: string]: { qty: number; areaM2: number; details: string[] } } = {};
  glassItems.forEach(g => {
    if (!glassAgg[g.vitrageType]) {
      glassAgg[g.vitrageType] = { qty: 0, areaM2: 0, details: [] };
    }
    glassAgg[g.vitrageType].qty += g.quantity;
    glassAgg[g.vitrageType].areaM2 += g.totalAreaM2;
    glassAgg[g.vitrageType].details.push(`${g.quantity}× (${g.hauteurCm.toFixed(1)}×${g.largeurCm.toFixed(1)}cm)`);
  });

  const glassItemsSummary: SupplierOrderItem[] = Object.keys(glassAgg).map(vType => {
    const entry = glassAgg[vType];
    const uPrice = getGlassUnitPricePerM2(vType);
    const area = parseFloat(entry.areaM2.toFixed(3));
    const tPrice = parseFloat((area * uPrice).toFixed(3));
    return {
      id: `sup_glass_${vType.replace(/\s+/g, '_')}`,
      reference: vType,
      designation: `Vitrage ${vType} (Plan Miroiterie consolidé)`,
      category: 'vitrage',
      quantity: entry.qty,
      unit: `volume${entry.qty > 1 ? 's' : ''} (${area} m²)`,
      unitPriceHt: uPrice,
      totalPriceHt: tPrice,
      details: entry.details.slice(0, 4).join(' • ') + (entry.details.length > 4 ? ` (+${entry.details.length - 4} autres)` : '')
    };
  });

  // Calculate subtotals for each of the 5 categories
  const costProfiles = parseFloat(profileAluItems.reduce((sum, p) => sum + (p.totalPriceHt || 0), 0).toFixed(3));
  const costSlats = parseFloat(slatItems.reduce((sum, s) => sum + (s.totalPriceHt || 0), 0).toFixed(3));
  const costMotors = parseFloat(motorItems.reduce((sum, m) => sum + (m.totalPriceHt || 0), 0).toFixed(3));
  const costHardware = parseFloat(hardwareItems.reduce((sum, h) => sum + (h.totalPriceHt || 0), 0).toFixed(3));
  const costGlass = parseFloat(glassItemsSummary.reduce((sum, g) => sum + (g.totalPriceHt || 0), 0).toFixed(3));
  const grandTotalCostHt = parseFloat((costProfiles + costSlats + costMotors + costHardware + costGlass).toFixed(3));

  const supplierCategories: SupplierOrderCategory[] = [
    {
      id: 'profile_alu',
      title: '1. Profilés Aluminium (Barres Standard 6.50 m)',
      icon: 'Layers',
      badge: `${totalProfileBarsCount} barres`,
      items: profileAluItems,
      totalCostHt: costProfiles
    },
    {
      id: 'lame_tablier',
      title: '2. Tabliers & Lames de Volet Roulant (Barres 6.00 m)',
      icon: 'Scissors',
      badge: `${totalSlatBarsCount} barres / tubes`,
      items: slatItems,
      totalCostHt: costSlats
    },
    {
      id: 'moteur',
      title: '3. Motorisation & Automatismes de Volet',
      icon: 'Sparkles',
      badge: `${motorItems.reduce((sum, m) => sum + m.quantity, 0)} moteur(s)`,
      items: motorItems,
      totalCostHt: costMotors
    },
    {
      id: 'quincaillerie',
      title: '4. Accessoires, Quincaillerie & Visserie (100% Catalogue)',
      icon: 'Box',
      badge: `${hardwareItems.length} types d'articles`,
      items: hardwareItems,
      totalCostHt: costHardware
    },
    {
      id: 'vitrage',
      title: '5. Plan de Vitrage & Cotes Miroiterie',
      icon: 'Grid',
      badge: `${totalGlassAreaM2} m²`,
      items: glassItemsSummary,
      totalCostHt: costGlass
    }
  ];

  const supplierOrderSummary: SupplierOrderSummary = {
    categories: supplierCategories,
    totalBarsProfileCount: totalProfileBarsCount,
    totalBarsSlatCount: totalSlatBarsCount,
    totalMotorsCount: motorItems.reduce((sum, m) => sum + m.quantity, 0),
    totalHardwareCount: hardwareItems.length,
    totalGlassAreaM2,
    grandTotalCostHt
  };

  return {
    cuttingPieces,
    debitageSummary,
    totalBarsCount,
    totalProfileBarsCount,
    totalSlatBarsCount,
    accessories: rawAccessories,
    totalAccessoriesCostHt,
    glassItems,
    totalGlassAreaM2,
    totalJointBrosseMeters,
    totalJointVitrageMeters,
    supplierOrderSummary
  };
}
