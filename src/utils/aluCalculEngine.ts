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
    'Glissière 55': 48.000,
    'Glissière 45': 42.000,
    'Axe 60 Garv': 24.000,
    'Lame S': 22.000,
    'MOUSTI_Coulisse': 36.000,
    'MOUSTI_Coffre': 58.000,
    'MOUSTI_Tirage': 28.000,
    'Lame_Finale': 42.000,
    'Lame final 55': 42.000,
    'Lame final 45': 38.000,
    'Lame final 39': 35.000,
    'Lame final 42': 38.000,
    'Lame final 64': 48.000,
    'Lame extrudée': 85.000,
    'Lame injectée 55': 45.000,
    'Lame injectée 45': 38.000,
    'Lame injectée 42': 38.000,
    'Lame injectée 39': 35.000,
    'Lame injectée 64': 58.000
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
    } else if (typeDef?.name.toLowerCase().includes('1 vantail') || typeDef?.name.toLowerCase().includes('1v') || item.product_type_id?.includes('1v') || item.product_type_id?.includes('1_v') || typeDef?.name.toLowerCase().includes('soufflet') || (isPorte && !typeDef?.name.toLowerCase().includes('2'))) {
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
      const isEncastre = item.store_encastre !== false;
      const isExtrude = slatCfg.lameRef.toLowerCase().includes('extrud');

      // Formules atelier précises
      const lLame = Math.max(10, isEncastre ? parseFloat((L + 4.5).toFixed(2)) : parseFloat((L - 5.0).toFixed(2)));
      const lGlissiere = isEncastre ? parseFloat((H + 15.0).toFixed(2)) : H;
      const lAxe = Math.max(10, isEncastre ? parseFloat((L + 9.0).toFixed(2)) : parseFloat((L - 7.0).toFixed(2)));
      const debitageJointBrosse = isEncastre ? parseFloat((H + 15.0 + L / 4.0).toFixed(2)) : H;
      const nbLames = Math.round(H / 5.0) + 1;

      // 1. Coulisses / Glissières H
      const glissRef = isExtrude ? 'Glissière 55' : (slatCfg.lameRef.includes('55') ? 'Glissière 55' : (slatCfg.lameRef.includes('45') ? 'Glissière 45' : 'Glissière 55'));
      cuttingPieces.push({
        id: `cut_${itemIdx}_store_coul`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'dormant_h',
        profilRef: glissRef,
        profilDesignation: `${glissRef} de guidage latéral`,
        lengthCm: lGlissiere,
        quantity: 2 * qty,
        angleLeft: '90°',
        angleRight: '90°',
        notes: isEncastre ? 'Coulisses encastrées (+15cm dans coffre)' : 'Coulisses standard'
      });

      // 2. Coffre supérieur L (si non encastré ou avec coffre)
      if (item.store_coffre && item.store_coffre !== '— Sans coffre —') {
        cuttingPieces.push({
          id: `cut_${itemIdx}_store_coffre`,
          itemIndex: itemIdx,
          elementLabel,
          pieceType: 'dormant_l',
          profilRef: 'CSQ_Coffre',
          profilDesignation: `Caisson / Coffre d’enroulement supérieur (${item.store_coffre})`,
          lengthCm: L,
          quantity: 1 * qty,
          angleLeft: '90°',
          angleRight: '90°',
          notes: 'Coffre aluminium d’enroulement'
        });
      }

      // 3. Axe tubulaire Ø60 octogonal
      cuttingPieces.push({
        id: `cut_${itemIdx}_store_axe`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'traverse',
        profilRef: 'Axe 60 Garv',
        profilDesignation: 'Axe 60 Garv (Tube octogonal galvanisé Ø60)',
        lengthCm: lAxe,
        quantity: 1 * qty,
        angleLeft: '90°',
        angleRight: '90°',
        notes: isEncastre ? 'Axe d’enroulement (+9cm)' : 'Axe d’enroulement (-7cm)'
      });

      // 4. Lame finale basse
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

      // 5. Lame S (Couvre-joint / tulipe) — 4 barres en Extrudé
      if (isExtrude) {
        cuttingPieces.push({
          id: `cut_${itemIdx}_store_lame_s`,
          itemIndex: itemIdx,
          elementLabel,
          pieceType: 'couvre_joint',
          profilRef: 'Lame S',
          profilDesignation: 'Lame S (Couvre-joint tablier extrudé)',
          lengthCm: lLame,
          quantity: 4 * qty,
          angleLeft: '90°',
          angleRight: '90°',
          notes: '4 barres Lame S par volet extrudé'
        });
      }

      // 6. Tablier de Lames
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
        notes: `${nbLames} lames par volet (${slatCfg.lameType})`
      });

      // Accessoires Volet Roulant
      // Bouchons de lames (1 par lame)
      const nbBouchons = nbLames * qty;
      const bouchonPrice = isExtrude ? 0.359 : 0.093; // Prix HT (0.427 / 0.111 TTC)
      const bouchonNom = isExtrude ? 'Bouchon extrudé' : 'Bouchon lame 55';
      rawAccessories.push({
        id: `acc_bouchons_lame_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: `${bouchonNom} (Embouts latéraux)`,
        reference: bouchonNom,
        category: 'accessoire',
        quantity: nbBouchons,
        unit: 'unité',
        unitPriceHt: bouchonPrice,
        totalPriceHt: parseFloat((nbBouchons * bouchonPrice).toFixed(3)),
        details: '1 embout par lame pour guidage silencieux'
      });

      // Rallonge d'axe télescopique 60
      const rallongePrice = 3.500; // HT (4.165 TTC)
      rawAccessories.push({
        id: `acc_rallonge_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Rallonge Axe 60',
        reference: 'Rallonge Axe 60',
        category: 'accessoire',
        quantity: 1 * qty,
        unit: 'unité',
        unitPriceHt: rallongePrice,
        totalPriceHt: parseFloat((rallongePrice * qty).toFixed(3)),
        details: 'Embout réglable tube d’enroulement 60'
      });

      // Joint brosse coulisses volet
      const storeBrosseMeters = parseFloat(((4 * qty * debitageJointBrosse) / 100).toFixed(2));
      totalJointBrosseCmGlobal += 4 * qty * debitageJointBrosse;
      const jBrossePrice = 0.190; // HT (0.226 TTC / ml)
      rawAccessories.push({
        id: `acc_jbrosse_store_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Joint brosse de 6mm',
        reference: 'Joint brosse de 6mm',
        category: 'joint',
        quantity: storeBrosseMeters,
        unit: 'm',
        unitPriceHt: jBrossePrice,
        totalPriceHt: parseFloat((storeBrosseMeters * jBrossePrice).toFixed(3)),
        details: `4 coupes de ${debitageJointBrosse} cm par volet`
      });

      // Tirette simple 55
      const nbTirettes = (L > 140 ? 3 : 2) * qty;
      const tirettePrice = 2.500; // HT (2.975 TTC)
      rawAccessories.push({
        id: `acc_tirette_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Tirette simple 55',
        reference: 'Tirette simple 55',
        category: 'accessoire',
        quantity: nbTirettes,
        unit: 'unité',
        unitPriceHt: tirettePrice,
        totalPriceHt: parseFloat((nbTirettes * tirettePrice).toFixed(3)),
        details: `${L > 140 ? 3 : 2} attaches tablier par volet`
      });

      // Silicone (Sélicomne)
      rawAccessories.push({
        id: `acc_silicone_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Sélicomne (Cartouche étanchéité)',
        reference: 'Sélicomne',
        category: 'accessoire',
        quantity: 1 * qty,
        unit: 'unité',
        unitPriceHt: 7.250, // HT (8.628 TTC)
        totalPriceHt: parseFloat((7.250 * qty).toFixed(3)),
        details: 'Étanchéité caisson et coulisses'
      });

      // Vis et chevilles
      rawAccessories.push({
        id: `acc_vis_chev_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Vis et chevis',
        reference: 'Vis et chevis',
        category: 'visserie',
        quantity: 12 * qty,
        unit: 'unité',
        unitPriceHt: 0.160, // HT (0.190 TTC)
        totalPriceHt: parseFloat((12 * qty * 0.160).toFixed(3)),
        details: 'Fixation complète coulisses'
      });

      // Kit Moteur
      rawAccessories.push({
        id: `acc_kit_moteur_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel,
        designation: 'Kit Moteur',
        reference: 'Kit Moteur',
        category: 'moteur',
        quantity: 1 * qty,
        unit: 'unité',
        unitPriceHt: 4.000, // HT (4.760 TTC)
        totalPriceHt: parseFloat((4.000 * qty).toFixed(3)),
        details: 'Support moteur et adaptateur'
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
        reference: 'J242 / ML03V',
        category: 'joint',
        quantity: jVitMeters,
        unit: 'm',
        unitPriceHt: jVitPrice,
        totalPriceHt: parseFloat((jVitMeters * jVitPrice).toFixed(3)),
        details: 'Joint extérieur et intérieur vitrage fixe'
      });
    }
    // -------------------------------------------------------------
    // F. FRAPPE / FENÊTRES & PORTES (Toutes Gammes : EX45, S40, Aluco, Alu Eco)
    // -------------------------------------------------------------
    else {
      const isEX45 = item.family_id === '51' || item.family_id === '64';
      const isAluco = fam?.group === 'ALUCO';
      const isAluEco = fam?.group === 'ALU ECO';

      // 1. Profilés de dormant (Tapée vs Plat) & Déductions par Gamme
      let dormantTapeeRef = item.comp_dormant_ref || '40402';
      let dormantFlatRef = '40100';
      let tapeeExtensionCm = 2.5; // +25mm par côté -> +5.0cm L et H
      let ouvrantFrappeRef = item.comp_ouvrant_ref || (isPorte ? '40403' : '40401');
      let battementRef = '40112';
      let parcloseFrappeRef = item.comp_parclose_ref || '40110';
      let meneauDefaultRef = '40121';

      if (isEX45) {
        dormantTapeeRef = item.comp_dormant_ref && item.comp_dormant_ref.includes('1123') ? item.comp_dormant_ref : 'EX45 1123';
        dormantFlatRef = 'EX45 1125';
        tapeeExtensionCm = 2.1; // +21mm par côté -> +4.2cm L et H
        ouvrantFrappeRef = item.comp_ouvrant_ref || 'EX45 1210';
        battementRef = 'EX45 1212';
        parcloseFrappeRef = item.comp_parclose_ref || 'EX45 1312';
        meneauDefaultRef = 'EX45 1130';
      } else if (isAluco) {
        dormantTapeeRef = item.comp_dormant_ref || 'FSQ 124';
        dormantFlatRef = 'FSQ 100';
        tapeeExtensionCm = 2.5;
        ouvrantFrappeRef = item.comp_ouvrant_ref || (isPorte ? 'FSQ 403' : 'FSQ 104');
        battementRef = 'FSQ 112';
        parcloseFrappeRef = item.comp_parclose_ref || 'FSQ 110';
        meneauDefaultRef = 'FSQ 107';
      } else if (isAluEco) {
        dormantTapeeRef = item.comp_dormant_ref || 'AE_40402';
        dormantFlatRef = 'AE_40100';
        tapeeExtensionCm = 2.5;
        ouvrantFrappeRef = item.comp_ouvrant_ref || (isPorte ? 'AE_40403' : 'AE_40401');
        battementRef = 'AE_40112';
        parcloseFrappeRef = item.comp_parclose_ref || 'AE_40110';
        meneauDefaultRef = 'AE_40121';
      }

      // 2. Gestion Côté par Côté du Dormant (Tapée vs Sans Couvre-joint)
      const sansCJ = !!item.sans_couvre_joint;
      const cjPos = item.couvre_joint_type || '';

      const hasGaucheTapee = !sansCJ || !['Gauche', 'Droite et Gauche', 'Tous'].includes(cjPos);
      const hasDroiteTapee = !sansCJ || !['Droite', 'Droite et Gauche', 'Tous'].includes(cjPos);
      const hasHautTapee = !sansCJ || !['Haut', 'Haut et Bas', 'Tous'].includes(cjPos);
      const hasBasTapee = isPorte ? false : (!sansCJ || !['Bas', 'Haut et Bas', 'Tous'].includes(cjPos));

      const lenMGauche = hasGaucheTapee ? parseFloat((H + 2 * tapeeExtensionCm).toFixed(2)) : H;
      const refMGauche = hasGaucheTapee ? dormantTapeeRef : dormantFlatRef;
      const lenMDroit = hasDroiteTapee ? parseFloat((H + 2 * tapeeExtensionCm).toFixed(2)) : H;
      const refMDroit = hasDroiteTapee ? dormantTapeeRef : dormantFlatRef;

      const lenTHaut = hasHautTapee ? parseFloat((L + 2 * tapeeExtensionCm).toFixed(2)) : L;
      const refTHaut = hasHautTapee ? dormantTapeeRef : dormantFlatRef;
      const lenTBas = hasBasTapee ? parseFloat((L + 2 * tapeeExtensionCm).toFixed(2)) : L;
      const refTBas = hasBasTapee ? dormantTapeeRef : dormantFlatRef;

      // Débitage des Montants Dormant
      if (lenMGauche === lenMDroit && refMGauche === refMDroit) {
        cuttingPieces.push({
          id: `cut_${itemIdx}_frappe_dorm_h`,
          itemIndex: itemIdx,
          elementLabel,
          pieceType: 'dormant_h',
          profilRef: refMGauche,
          profilDesignation: `Dormant Montants verticaux (${refMGauche})`,
          lengthCm: lenMGauche,
          quantity: 2 * qty,
          angleLeft: '45°',
          angleRight: '45°',
          notes: 'Cadre dormant extérieur montants'
        });
      } else {
        if (hasDroiteTapee) {
          cuttingPieces.push({
            id: `cut_${itemIdx}_frappe_dorm_hd`,
            itemIndex: itemIdx,
            elementLabel,
            pieceType: 'dormant_h',
            profilRef: refMDroit,
            profilDesignation: `Dormant Montant Droit (${refMDroit})`,
            lengthCm: lenMDroit,
            quantity: 1 * qty,
            angleLeft: '45°',
            angleRight: '45°',
            notes: 'Montant droit avec tapée'
          });
        }
        cuttingPieces.push({
          id: `cut_${itemIdx}_frappe_dorm_hg`,
          itemIndex: itemIdx,
          elementLabel,
          pieceType: 'dormant_h',
          profilRef: refMGauche,
          profilDesignation: `Dormant Montant Gauche (${refMGauche})`,
          lengthCm: lenMGauche,
          quantity: 1 * qty,
          angleLeft: '45°',
          angleRight: '45°',
          notes: hasGaucheTapee ? 'Montant gauche avec tapée' : 'Montant gauche sans tapée'
        });
        if (!hasDroiteTapee && hasGaucheTapee) {
          cuttingPieces.push({
            id: `cut_${itemIdx}_frappe_dorm_hd_flat`,
            itemIndex: itemIdx,
            elementLabel,
            pieceType: 'dormant_h',
            profilRef: refMDroit,
            profilDesignation: `Dormant Montant Droit (${refMDroit})`,
            lengthCm: lenMDroit,
            quantity: 1 * qty,
            angleLeft: '45°',
            angleRight: '45°',
            notes: 'Montant droit sans tapée'
          });
        }
      }

      // Débitage des Traverses Dormant
      if (isPorte) {
        cuttingPieces.push({
          id: `cut_${itemIdx}_frappe_dorm_l`,
          itemIndex: itemIdx,
          elementLabel,
          pieceType: 'dormant_l',
          profilRef: refTHaut,
          profilDesignation: `Dormant Traverse haute (${refTHaut})`,
          lengthCm: lenTHaut,
          quantity: 1 * qty,
          angleLeft: '45°',
          angleRight: '45°',
          notes: 'Dormant traverse haute porte'
        });
      } else if (lenTHaut === lenTBas && refTHaut === refTBas) {
        cuttingPieces.push({
          id: `cut_${itemIdx}_frappe_dorm_l`,
          itemIndex: itemIdx,
          elementLabel,
          pieceType: 'dormant_l',
          profilRef: refTHaut,
          profilDesignation: `Dormant Traverse horizontale (${refTHaut})`,
          lengthCm: lenTHaut,
          quantity: 2 * qty,
          angleLeft: '45°',
          angleRight: '45°',
          notes: 'Dormant haut et bas'
        });
      } else {
        cuttingPieces.push({
          id: `cut_${itemIdx}_frappe_dorm_lh`,
          itemIndex: itemIdx,
          elementLabel,
          pieceType: 'dormant_l',
          profilRef: refTHaut,
          profilDesignation: `Dormant Traverse haute (${refTHaut})`,
          lengthCm: lenTHaut,
          quantity: 1 * qty,
          angleLeft: '45°',
          angleRight: '45°',
          notes: 'Traverse haute'
        });
        cuttingPieces.push({
          id: `cut_${itemIdx}_frappe_dorm_lb`,
          itemIndex: itemIdx,
          elementLabel,
          pieceType: 'dormant_l',
          profilRef: refTBas,
          profilDesignation: `Dormant Traverse basse (${refTBas})`,
          lengthCm: lenTBas,
          quantity: 1 * qty,
          angleLeft: '45°',
          angleRight: '45°',
          notes: 'Traverse basse'
        });
      }

      // 3. Formules Ouvrant Battant
      const hasPartieFixe = item.partie_fixe_type && item.partie_fixe_type !== 'Sans';
      const pfDim = parseFloat(String(item.pf_dim_1)) || 0;

      let hOuvrant = 0;
      let lOuvrant = 0;

      if (isEX45) {
        hOuvrant = Math.max(10, parseFloat((H - 4.20).toFixed(2)));
        if (hasPartieFixe) {
          lOuvrant = Math.max(10, parseFloat((L - (pfDim > 0 ? pfDim : 0) - 3.70).toFixed(2)));
        } else if (nbVantaux === 1) {
          lOuvrant = Math.max(10, parseFloat((L - 4.20).toFixed(2)));
        } else {
          lOuvrant = Math.max(10, parseFloat(((L - 4.90) / 2).toFixed(2)));
        }
      } else {
        hOuvrant = Math.max(10, parseFloat((H - (isPorte ? 4.6 : 4.4)).toFixed(1)));
        lOuvrant = Math.max(10, parseFloat((isPorte 
          ? (nbVantaux === 1 ? L - 7.8 : (L - 8.3) / 2) 
          : (nbVantaux === 1 ? L - 4.4 : (L - 4.9) / 2)
        ).toFixed(1)));
      }

      // Ouvrant Montants (45°)
      cuttingPieces.push({
        id: `cut_${itemIdx}_frappe_ouvr_h`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'ouvrant_h',
        profilRef: ouvrantFrappeRef,
        profilDesignation: `Ouvrant Montant battant (${ouvrantFrappeRef})`,
        lengthCm: hOuvrant,
        quantity: 2 * nbVantaux * qty,
        angleLeft: '45°',
        angleRight: '45°',
        notes: 'Montants ouvrants battants'
      });

      // Ouvrant Traverses (45°)
      cuttingPieces.push({
        id: `cut_${itemIdx}_frappe_ouvr_l`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'ouvrant_l',
        profilRef: ouvrantFrappeRef,
        profilDesignation: `Ouvrant Traverse battant (${ouvrantFrappeRef})`,
        lengthCm: lOuvrant,
        quantity: 2 * nbVantaux * qty,
        angleLeft: '45°',
        angleRight: '45°',
        notes: 'Traverses haute et basse ouvrant'
      });

      // 4. Battement central (UNIQUEMENT pour 2 vantaux)
      if (nbVantaux > 1) {
        const hBattement = Math.max(10, parseFloat((H - (isPorte ? 7.9 : 11.1)).toFixed(1)));
        cuttingPieces.push({
          id: `cut_${itemIdx}_frappe_batt`,
          itemIndex: itemIdx,
          elementLabel,
          pieceType: 'chicane',
          profilRef: battementRef,
          profilDesignation: `Battement Central (${battementRef})`,
          lengthCm: hBattement,
          quantity: 1 * qty,
          angleLeft: '90°',
          angleRight: '90°',
          notes: 'Battement central de fermeture'
        });
      }

      // 5. Socle bas pour portes
      if (isPorte) {
        const lSocle = Math.max(10, parseFloat((nbVantaux === 1 ? L - 21.5 : (L - 35.7) / 2).toFixed(1)));
        cuttingPieces.push({
          id: `cut_${itemIdx}_porte_socle`,
          itemIndex: itemIdx,
          elementLabel,
          pieceType: 'traverse',
          profilRef: isEX45 ? 'EX45 1215' : '40121',
          profilDesignation: 'Socle bas de porte (130mm)',
          lengthCm: lSocle,
          quantity: (nbVantaux === 1 ? 2 : 4) * qty,
          angleLeft: '90°',
          angleRight: '90°',
          notes: 'Socle inférieur renforcé'
        });
      }

      // 6. Parcloses Ouvrant
      const skipParclose = PROFILES_WITHOUT_PARCLOSE.includes(item.comp_ouvrant_ref || '');
      if (!skipParclose) {
        let hParc = 0;
        let lParc = 0;
        let angleParc: '45°' | '90°' = '45°';

        if (isEX45) {
          hParc = Math.max(5, parseFloat((hOuvrant - 9.80).toFixed(2)));
          lParc = Math.max(5, parseFloat((lOuvrant - 9.50).toFixed(2)));
          angleParc = '90°';
        } else {
          hParc = Math.max(5, parseFloat((isPorte ? H - 26.6 : H - 17.8).toFixed(1)));
          lParc = Math.max(5, parseFloat((isPorte 
            ? (nbVantaux === 1 ? L - 21.5 : (L - 35.5) / 2) 
            : (nbVantaux === 1 ? L - 13.4 : (L - 22.9) / 2)
          ).toFixed(1)));
          angleParc = '45°';
        }

        cuttingPieces.push({
          id: `cut_${itemIdx}_frappe_parc_h`,
          itemIndex: itemIdx,
          elementLabel,
          pieceType: 'parclose',
          profilRef: parcloseFrappeRef,
          profilDesignation: `Parclose Montant (${parcloseFrappeRef})`,
          lengthCm: hParc,
          quantity: 2 * nbVantaux * qty,
          angleLeft: angleParc,
          angleRight: angleParc,
          notes: 'Parclose verticale ouvrant'
        });

        cuttingPieces.push({
          id: `cut_${itemIdx}_frappe_parc_l`,
          itemIndex: itemIdx,
          elementLabel,
          pieceType: 'parclose',
          profilRef: parcloseFrappeRef,
          profilDesignation: `Parclose Traverse (${parcloseFrappeRef})`,
          lengthCm: lParc,
          quantity: 2 * nbVantaux * qty,
          angleLeft: angleParc,
          angleRight: angleParc,
          notes: 'Parclose horizontale ouvrant'
        });
      }

      // 7. Partie Fixe & Meneaux
      if (hasPartieFixe) {
        const meneauRef = item.comp_meneau_ref || meneauDefaultRef;
        const pfType = item.partie_fixe_type || 'Droite';
        const isVertical = !['Haut', 'Bas', 'Haut et Bas'].includes(pfType);
        const nbMeneaux = ['Droite et Gauche', 'Haut et Bas'].includes(pfType) ? 2 : 1;

        let meneauLen = 0;
        if (isEX45) {
          meneauLen = Math.max(10, parseFloat((isVertical ? H - 5.80 : L - 5.80).toFixed(2)));
        } else {
          meneauLen = Math.max(10, parseFloat((isVertical ? H - 8.00 : L - 8.00).toFixed(1)));
        }

        cuttingPieces.push({
          id: `cut_${itemIdx}_meneau_pf`,
          itemIndex: itemIdx,
          elementLabel: `${elementLabel} - Meneau (${pfType})`,
          pieceType: 'traverse',
          profilRef: meneauRef,
          profilDesignation: `Meneau profil de séparation (${meneauRef})`,
          lengthCm: meneauLen,
          quantity: nbMeneaux * qty,
          angleLeft: '90°',
          angleRight: '90°',
          notes: `Séparation Partie Fixe (${pfType})`
        });

        // Parcloses Fixe
        if (isEX45) {
          const hPfParc = Math.max(5, parseFloat((H - 5.60).toFixed(2)));
          cuttingPieces.push({
            id: `cut_${itemIdx}_pf_parc_h`,
            itemIndex: itemIdx,
            elementLabel: `${elementLabel} - Parclose Fixe`,
            pieceType: 'parclose',
            profilRef: parcloseFrappeRef,
            profilDesignation: `Parclose Fixe Montant (${parcloseFrappeRef})`,
            lengthCm: hPfParc,
            quantity: 2 * nbMeneaux * qty,
            angleLeft: '90°',
            angleRight: '90°'
          });
        } else {
          const hPfParc = Math.max(5, isVertical ? H - 8.0 : pfDim - 4.0);
          const lPfParc = Math.max(5, isVertical ? pfDim - 4.0 : L - 8.0);
          cuttingPieces.push({
            id: `cut_${itemIdx}_pf_parc_h`,
            itemIndex: itemIdx,
            elementLabel: `${elementLabel} - Parclose Fixe`,
            pieceType: 'parclose',
            profilRef: parcloseFrappeRef,
            profilDesignation: `Parclose Fixe Montant (${parcloseFrappeRef})`,
            lengthCm: hPfParc,
            quantity: 2 * nbMeneaux * qty,
            angleLeft: '45°',
            angleRight: '45°'
          });
          cuttingPieces.push({
            id: `cut_${itemIdx}_pf_parc_l`,
            itemIndex: itemIdx,
            elementLabel: `${elementLabel} - Parclose Fixe`,
            pieceType: 'parclose',
            profilRef: parcloseFrappeRef,
            profilDesignation: `Parclose Fixe Traverse (${parcloseFrappeRef})`,
            lengthCm: lPfParc,
            quantity: 2 * nbMeneaux * qty,
            angleLeft: '45°',
            angleRight: '45°'
          });
        }
      }

      // 8. Accessoires & Quincaillerie Gamme par Gamme
      if (isEX45) {
        // Joints Spécifiques EX45
        rawAccessories.push({
          id: `acc_ex45_n101_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: 'Ex45 N101 (Joint dormant)',
          reference: 'Ex45 N101',
          category: 'joint',
          quantity: 4 * 0.90 * qty,
          unit: 'm',
          unitPriceHt: 1.785,
          totalPriceHt: parseFloat((4 * 0.90 * qty * 1.785).toFixed(3)),
          details: 'Joint dormant EX45'
        });
        rawAccessories.push({
          id: `acc_ex45_n103_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: 'Ex45 N103 (Joint ouvrant)',
          reference: 'Ex45 N103',
          category: 'joint',
          quantity: 4 * 0.90 * qty,
          unit: 'm',
          unitPriceHt: 1.785,
          totalPriceHt: parseFloat((4 * 0.90 * qty * 1.785).toFixed(3)),
          details: 'Joint ouvrant EX45'
        });
        rawAccessories.push({
          id: `acc_ex45_n105_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: 'EX45 N105 (Joint battement)',
          reference: 'EX45 N105',
          category: 'joint',
          quantity: 2 * 0.90 * qty,
          unit: 'm',
          unitPriceHt: 1.428,
          totalPriceHt: parseFloat((2 * 0.90 * qty * 1.428).toFixed(3)),
          details: 'Joint battement EX45'
        });
        rawAccessories.push({
          id: `acc_n52_035_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: 'N52 035 (Joint vitrage)',
          reference: 'N52 035',
          category: 'joint',
          quantity: 2 * 0.90 * qty,
          unit: 'm',
          unitPriceHt: 4.165,
          totalPriceHt: parseFloat((2 * 0.90 * qty * 4.165).toFixed(3)),
          details: 'Joint vitrage haute performance'
        });

        // Équerres & Quincaillerie EX45
        rawAccessories.push({
          id: `acc_ex45_a114_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: 'EX45 A 114 (Équerre dormant)',
          reference: 'EX45 A 114',
          category: 'equerre',
          quantity: 4 * qty,
          unit: 'unité',
          unitPriceHt: 1.190,
          totalPriceHt: parseFloat((4 * qty * 1.190).toFixed(3)),
          details: '4 équerres cadre dormant EX45'
        });
        rawAccessories.push({
          id: `acc_ex45_a115_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: 'EX45 A 115 (Équerre ouvrant)',
          reference: 'EX45 A 115',
          category: 'equerre',
          quantity: 4 * qty,
          unit: 'unité',
          unitPriceHt: 1.190,
          totalPriceHt: parseFloat((4 * qty * 1.190).toFixed(3)),
          details: '4 équerres ouvrant EX45'
        });
        rawAccessories.push({
          id: `acc_ex45_a112_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: 'EX45 A 112 (Équerres renfort)',
          reference: 'EX45 A 112',
          category: 'equerre',
          quantity: 8 * qty,
          unit: 'unité',
          unitPriceHt: 1.190,
          totalPriceHt: parseFloat((8 * qty * 1.190).toFixed(3)),
          details: 'Équerres d’alignement onglet EX45'
        });
        rawAccessories.push({
          id: `acc_ex60_a256_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: 'EX60 A256 (Busettes évacuation eau)',
          reference: 'EX60 A256',
          category: 'accessoire',
          quantity: 2 * qty,
          unit: 'unité',
          unitPriceHt: 1.428,
          totalPriceHt: parseFloat((2 * qty * 1.428).toFixed(3)),
          details: 'Drainage extérieur dormant'
        });
        rawAccessories.push({
          id: `acc_bouchon_parc_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: 'Bouchon Paraclose',
          reference: 'Bouchon Paraclose',
          category: 'accessoire',
          quantity: 8 * qty,
          unit: 'unité',
          unitPriceHt: 0.107,
          totalPriceHt: parseFloat((8 * qty * 0.107).toFixed(3)),
          details: 'Bouchons de maintien parclose'
        });
        rawAccessories.push({
          id: `acc_bouchon_trou_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: 'Bouchon trou',
          reference: 'Bouchon trou',
          category: 'accessoire',
          quantity: 4 * qty,
          unit: 'unité',
          unitPriceHt: 0.119,
          totalPriceHt: parseFloat((4 * qty * 0.119).toFixed(3)),
          details: 'Obturateurs trous d’usinage'
        });
        rawAccessories.push({
          id: `acc_vis_chevis_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: 'Vis et chevis',
          reference: 'Vis et chevis',
          category: 'visserie',
          quantity: 4 * qty,
          unit: 'unité',
          unitPriceHt: 0.190,
          totalPriceHt: parseFloat((4 * qty * 0.190).toFixed(3)),
          details: 'Fixation maçonnerie'
        });
        rawAccessories.push({
          id: `acc_selicomne_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: 'Selicomne',
          reference: 'Selicomne',
          category: 'accessoire',
          quantity: 1 * qty,
          unit: 'unité',
          unitPriceHt: 8.628,
          totalPriceHt: parseFloat((1 * qty * 8.628).toFixed(3)),
          details: 'Mastic d’étanchéité'
        });
        rawAccessories.push({
          id: `acc_ex45_a130_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: 'EX45 A 130 (A la française)',
          reference: 'EX45 A 130',
          category: 'verrou',
          quantity: 1 * qty,
          unit: 'unité',
          unitPriceHt: 1.190,
          totalPriceHt: parseFloat((1 * qty * 1.190).toFixed(3)),
          details: 'Accessoire verrouillage frappe EX45'
        });
        rawAccessories.push({
          id: `acc_ex45_a132_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: 'EX45 A 132 (A la française)',
          reference: 'EX45 A 132',
          category: 'verrou',
          quantity: 1 * qty,
          unit: 'unité',
          unitPriceHt: 1.190,
          totalPriceHt: parseFloat((1 * qty * 1.190).toFixed(3)),
          details: 'Guide tringle EX45'
        });
        rawAccessories.push({
          id: `acc_ex45_a133_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: 'EX45 A 133 (A la française)',
          reference: 'EX45 A 133',
          category: 'verrou',
          quantity: 2 * qty,
          unit: 'unité',
          unitPriceHt: 1.190,
          totalPriceHt: parseFloat((2 * qty * 1.190).toFixed(3)),
          details: 'Verrouillage d’angle EX45'
        });
        rawAccessories.push({
          id: `acc_ex45_a134_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: 'EX45 A 134 (A la française)',
          reference: 'EX45 A 134',
          category: 'verrou',
          quantity: 2 * qty,
          unit: 'unité',
          unitPriceHt: 1.190,
          totalPriceHt: parseFloat((2 * qty * 1.190).toFixed(3)),
          details: 'Pions de fermeture EX45'
        });
        rawAccessories.push({
          id: `acc_ex45_a120_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: 'EX45 A 120 (Paumelle frappe)',
          reference: 'EX45 A 120',
          category: 'verrou',
          quantity: 2 * qty,
          unit: 'unité',
          unitPriceHt: 1.190,
          totalPriceHt: parseFloat((2 * qty * 1.190).toFixed(3)),
          details: 'Paumelle d’articulation EX45'
        });
      } else {
        // Standard S40 / Aluco / Alu Eco Accessories
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

        const isOscillo = item.type_ouverture?.toLowerCase().includes('oscillo') || item.ouverture_type?.toLowerCase().includes('oscillo');
        const isSoufflet = item.type_ouverture?.toLowerCase().includes('soufflet') || item.ouverture_type?.toLowerCase().includes('soufflet');
        const isCremoneCle = item.cremone_type === 'cle' || item.supplements?.some(s => s.toLowerCase().includes('clé') || s.toLowerCase().includes('cle'));

        if (isOscillo) {
          const oscilloPrice = getAccPrice('acc_kit_oscillo_battant', 65.000);
          rawAccessories.push({
            id: `acc_oscillo_${itemIdx}`,
            itemIndex: itemIdx,
            elementLabel,
            designation: 'Kit Oscillo-battant complet (compas, tringles, gâches)',
            reference: 'Kit Oscillo-battant',
            category: 'verrou',
            quantity: 1 * qty,
            unit: 'unité',
            unitPriceHt: oscilloPrice,
            totalPriceHt: parseFloat((oscilloPrice * qty).toFixed(3)),
            details: 'Mécanisme oscillo-battant complet'
          });
        } else if (isSoufflet) {
          const loqPrice = getAccPrice('acc_loqueteau', 3.780);
          rawAccessories.push({
            id: `acc_loqueteau_${itemIdx}`,
            itemIndex: itemIdx,
            elementLabel,
            designation: 'Loqueteau vasistas / soufflet avec compas',
            reference: 'Loqueteau soufflet',
            category: 'verrou',
            quantity: 1 * qty,
            unit: 'unité',
            unitPriceHt: loqPrice,
            totalPriceHt: parseFloat((loqPrice * qty).toFixed(3)),
            details: 'Fermeture et compas vasistas'
          });
        } else if (isCremoneCle) {
          const cremClePrice = getAccPrice('acc_cremone_cle', 32.000);
          rawAccessories.push({
            id: `acc_cremone_cle_${itemIdx}`,
            itemIndex: itemIdx,
            elementLabel,
            designation: 'Crémone à clé de sécurité (Barillet intégré)',
            reference: 'Crémone à clé',
            category: 'verrou',
            quantity: 1 * qty,
            unit: 'unité',
            unitPriceHt: cremClePrice,
            totalPriceHt: parseFloat((cremClePrice * qty).toFixed(3)),
            details: 'Crémone avec verrouillage par clé'
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

        // Joints S40
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
      }

      // 9. Vitrage Frappe (Calcul Miroiterie)
      let hVerre = 0;
      let lVerre = 0;

      if (isEX45) {
        hVerre = 35.00;
        lVerre = 25.80;
      } else {
        hVerre = Math.max(5, parseFloat((H - (isPorte ? 23.6 : 14.9)).toFixed(1)));
        lVerre = Math.max(5, parseFloat((isPorte 
          ? (nbVantaux === 1 ? L - 22.7 : (L - 38.5) / 2) 
          : (nbVantaux === 1 ? L - 14.9 : (L - 25.7) / 2)
        ).toFixed(1)));
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
    }

    // -------------------------------------------------------------
    // G. COUVRE JOINT SPÉCIFIQUE (Si profilé clipsable sur dormant plat)
    // -------------------------------------------------------------
    if (includeMenuiserie && item.couvre_joint_type && item.couvre_joint_type !== 'Sans' && !item.sans_couvre_joint) {
      const cjRef = item.comp_couvre_joint_ref || (fam?.group === 'ALUCO' ? 'CJ 101' : '40108');
      const cjPos = item.couvre_joint_type;
      
      if (cjPos === 'Haut') {
        cuttingPieces.push({
          id: `cut_${itemIdx}_cj_haut`,
          itemIndex: itemIdx,
          elementLabel: `${elementLabel} - Couvre Joint (Haut)`,
          pieceType: 'couvre_joint',
          profilRef: cjRef,
          profilDesignation: `Couvre-joint ${cjRef} (Haut)`,
          lengthCm: L,
          quantity: 1 * qty,
          angleLeft: '45°',
          angleRight: '45°'
        });
      } else if (cjPos === 'Gauche' || cjPos === 'Droite') {
        cuttingPieces.push({
          id: `cut_${itemIdx}_cj_${cjPos.toLowerCase()}`,
          itemIndex: itemIdx,
          elementLabel: `${elementLabel} - Couvre Joint (${cjPos})`,
          pieceType: 'couvre_joint',
          profilRef: cjRef,
          profilDesignation: `Couvre-joint ${cjRef} (${cjPos})`,
          lengthCm: H,
          quantity: 1 * qty,
          angleLeft: '45°',
          angleRight: '45°'
        });
      } else if (cjPos === 'Droite et Gauche') {
        cuttingPieces.push({
          id: `cut_${itemIdx}_cj_dg`,
          itemIndex: itemIdx,
          elementLabel: `${elementLabel} - Couvre Joint (Gauche & Droite)`,
          pieceType: 'couvre_joint',
          profilRef: cjRef,
          profilDesignation: `Couvre-joint ${cjRef} (Montants)`,
          lengthCm: H,
          quantity: 2 * qty,
          angleLeft: '45°',
          angleRight: '45°'
        });
      } else if (cjPos === 'Haut et Bas') {
        cuttingPieces.push({
          id: `cut_${itemIdx}_cj_hb`,
          itemIndex: itemIdx,
          elementLabel: `${elementLabel} - Couvre Joint (Haut & Bas)`,
          pieceType: 'couvre_joint',
          profilRef: cjRef,
          profilDesignation: `Couvre-joint ${cjRef} (Traverses)`,
          lengthCm: L,
          quantity: 2 * qty,
          angleLeft: '45°',
          angleRight: '45°'
        });
      } else if (cjPos === 'Tous' || cjPos === '4 Côtés') {
        cuttingPieces.push({
          id: `cut_${itemIdx}_cj_tous_h`,
          itemIndex: itemIdx,
          elementLabel: `${elementLabel} - Couvre Joint (4 côtés - H)`,
          pieceType: 'couvre_joint',
          profilRef: cjRef,
          profilDesignation: `Couvre-joint ${cjRef} (Montants)`,
          lengthCm: H,
          quantity: 2 * qty,
          angleLeft: '45°',
          angleRight: '45°'
        });
        cuttingPieces.push({
          id: `cut_${itemIdx}_cj_tous_l`,
          itemIndex: itemIdx,
          elementLabel: `${elementLabel} - Couvre Joint (4 côtés - L)`,
          pieceType: 'couvre_joint',
          profilRef: cjRef,
          profilDesignation: `Couvre-joint ${cjRef} (Traverses)`,
          lengthCm: L,
          quantity: (isPorte ? 1 : 2) * qty,
          angleLeft: '45°',
          angleRight: '45°'
        });
      }
    }

    // -------------------------------------------------------------
    // I. QUINCAILLERIE SPÉCIFIQUE (Oscillo-battant, Crémones, Serrures)
    // -------------------------------------------------------------
    if (includeMenuiserie) {
      // Kit Oscillo-battant
      if (item.ouverture_type === 'Osilobattante' || item.ouverture_type === 'Oscillo-battante' || item.ouverture_type === 'oscillo_battant') {
        const obPrice = getAccPrice('acc_kit_ob', 105.000);
        rawAccessories.push({
          id: `acc_kit_ob_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: 'Kit mécanisme Oscillo-battant complet (OB Roto/Master)',
          reference: 'Kit Oscillo-battant',
          category: 'verrou',
          quantity: 1 * qty,
          unit: 'unité',
          unitPriceHt: obPrice,
          totalPriceHt: parseFloat((obPrice * qty).toFixed(3)),
          details: 'Compas, crémone OB, renvois d’angle et gâches micro-ventilation'
        });
      }

      // Crémone à clé
      if (item.cremone_id === 'cle' || item.cremone_id === 'A clé') {
        const cremoneClePrice = getAccPrice('acc_cremone_cle', 32.000);
        rawAccessories.push({
          id: `acc_cremone_cle_${itemIdx}`,
          itemIndex: itemIdx,
          elementLabel,
          designation: 'Poignée Crémone à clé avec barillet de sécurité',
          reference: 'Crémone à clé',
          category: 'verrou',
          quantity: 1 * qty,
          unit: 'unité',
          unitPriceHt: cremoneClePrice,
          totalPriceHt: parseFloat((cremoneClePrice * qty).toFixed(3)),
          details: 'Verrouillage sécurisé par clé'
        });
      }
    }

    // Attached Shutter (Volet Intégré)
    if (hasAttachedStore) {
      const slatCfg = detectSlatConfig(item);
      const isEncastre = item.store_encastre !== false;
      const isExtrude = slatCfg.lameRef.toLowerCase().includes('extrud');

      const lLame = Math.max(10, isEncastre ? parseFloat((L + 4.5).toFixed(2)) : parseFloat((L - 5.0).toFixed(2)));
      const lGlissiere = isEncastre ? parseFloat((H + 15.0).toFixed(2)) : H;
      const lAxe = Math.max(10, isEncastre ? parseFloat((L + 9.0).toFixed(2)) : parseFloat((L - 7.0).toFixed(2)));
      const debitageJointBrosse = isEncastre ? parseFloat((H + 15.0 + L / 4.0).toFixed(2)) : H;
      const nbLames = Math.round(H / 5.0) + 1;

      const glissRef = isExtrude ? 'Glissière 55' : (slatCfg.lameRef.includes('55') ? 'Glissière 55' : 'Glissière 45');
      cuttingPieces.push({
        id: `cut_${itemIdx}_att_store_coul`,
        itemIndex: itemIdx,
        elementLabel: `${elementLabel} - Volet Intégré`,
        pieceType: 'dormant_h',
        profilRef: glissRef,
        profilDesignation: `${glissRef} de guidage latéral Volet Intégré`,
        lengthCm: lGlissiere,
        quantity: 2 * qty,
        angleLeft: '90°',
        angleRight: '90°'
      });

      if (item.store_coffre && item.store_coffre !== '— Sans coffre —') {
        cuttingPieces.push({
          id: `cut_${itemIdx}_att_store_coffre`,
          itemIndex: itemIdx,
          elementLabel: `${elementLabel} - Volet Intégré`,
          pieceType: 'dormant_l',
          profilRef: 'CSQ_Coffre',
          profilDesignation: `Caisson Coffre Volet Intégré (${item.store_coffre})`,
          lengthCm: L,
          quantity: 1 * qty,
          angleLeft: '90°',
          angleRight: '90°'
        });
      }

      cuttingPieces.push({
        id: `cut_${itemIdx}_att_store_axe`,
        itemIndex: itemIdx,
        elementLabel: `${elementLabel} - Volet Intégré`,
        pieceType: 'traverse',
        profilRef: 'Axe 60 Garv',
        profilDesignation: 'Axe 60 Garv (Tube octogonal Ø60)',
        lengthCm: lAxe,
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
        lengthCm: lLame,
        quantity: 1 * qty,
        angleLeft: '90°',
        angleRight: '90°'
      });

      if (isExtrude) {
        cuttingPieces.push({
          id: `cut_${itemIdx}_att_store_lame_s`,
          itemIndex: itemIdx,
          elementLabel: `${elementLabel} - Volet Intégré`,
          pieceType: 'couvre_joint',
          profilRef: 'Lame S',
          profilDesignation: 'Lame S (Couvre-joint tablier extrudé)',
          lengthCm: lLame,
          quantity: 4 * qty,
          angleLeft: '90°',
          angleRight: '90°'
        });
      }

      cuttingPieces.push({
        id: `cut_${itemIdx}_att_store_lames`,
        itemIndex: itemIdx,
        elementLabel: `${elementLabel} - Volet Intégré`,
        pieceType: 'lame_volet',
        profilRef: slatCfg.lameRef,
        profilDesignation: slatCfg.lameDesignation,
        lengthCm: lLame,
        quantity: nbLames * qty,
        angleLeft: '90°',
        angleRight: '90°'
      });

      const nbBouchons = nbLames * qty;
      const bouchonPrice = isExtrude ? 0.359 : 0.093;
      const bouchonNom = isExtrude ? 'Bouchon extrudé' : 'Bouchon lame 55';
      rawAccessories.push({
        id: `acc_att_bouchons_lame_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel: `${elementLabel} - Volet Intégré`,
        designation: `${bouchonNom} (Embouts latéraux)`,
        reference: bouchonNom,
        category: 'accessoire',
        quantity: nbBouchons,
        unit: 'unité',
        unitPriceHt: bouchonPrice,
        totalPriceHt: parseFloat((nbBouchons * bouchonPrice).toFixed(3)),
        details: '1 embout par lame'
      });

      const rallongePrice = 3.500;
      rawAccessories.push({
        id: `acc_att_rallonge_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel: `${elementLabel} - Volet Intégré`,
        designation: 'Rallonge Axe 60',
        reference: 'Rallonge Axe 60',
        category: 'accessoire',
        quantity: 1 * qty,
        unit: 'unité',
        unitPriceHt: rallongePrice,
        totalPriceHt: parseFloat((rallongePrice * qty).toFixed(3)),
        details: 'Embout réglable tube d’enroulement 60'
      });

      const storeBrosseM = parseFloat(((4 * qty * debitageJointBrosse) / 100).toFixed(2));
      totalJointBrosseCmGlobal += 4 * qty * debitageJointBrosse;
      const jBrossePrice = 0.190;
      rawAccessories.push({
        id: `acc_att_jbrosse_${itemIdx}`,
        itemIndex: itemIdx,
        elementLabel: `${elementLabel} - Volet Intégré`,
        designation: 'Joint brosse de 6mm',
        reference: 'Joint brosse de 6mm',
        category: 'joint',
        quantity: storeBrosseM,
        unit: 'm',
        unitPriceHt: jBrossePrice,
        totalPriceHt: parseFloat((storeBrosseM * jBrossePrice).toFixed(3)),
        details: `4 coupes de ${debitageJointBrosse} cm par volet`
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
    'Glissière 55': 'Profilé Glissière 55mm Volet Roulant',
    'Glissière 45': 'Profilé Glissière 45mm Volet Roulant',
    'CSQ_Coffre': 'Caisson / Coffre Volet Roulant',
    'Axe_60': 'Tube Axe Octogonal Ø60 Volet',
    'Axe 60 Garv': 'Tube Axe Octogonal Ø60 Galvanisé (Axe 60 Garv)',
    'Lame S': 'Lame S (Couvre-joint tablier extrudé)',
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
    const isSlat = cp.pieceType === 'lame_volet' || 
      cp.profilRef === 'Axe_60' || 
      cp.profilRef === 'Axe 60 Garv' || 
      cp.profilRef === '2878' || 
      cp.profilRef === 'Lame S' ||
      cp.profilRef.toLowerCase().includes('lame inject') || 
      cp.profilRef.toLowerCase().includes('lame extrud');
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
