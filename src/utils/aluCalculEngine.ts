import { DevisItemState } from '../context/AppContext';
import { FAMILIES, getProductTypesForFamily } from '../data/productCatalog';
import { INITIAL_ACCESSORIES, AccessoryItemDef } from '../data/initialAccessories';

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

export interface BarCutAllocation {
  barIndex: number;
  profilRef: string;
  barLengthCm: number;
  cuts: { pieceId: string; lengthCm: number; label: string }[];
  usedLengthCm: number;
  scrapCm: number;
  scrapPercent: number;
}

export interface DebitageSummary {
  profilRef: string;
  profilDesignation: string;
  isProfileBar: boolean; // true for standard 6m aluminum extrusion bars, false for shutter slats
  totalLinearMeters: number;
  totalBarsCount: number;
  barLengthMeters: number;
  scrapPercentageAverage: number;
  allocatedBars: BarCutAllocation[];
}

export interface AccessoryItem {
  id: string;
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

export interface AluCalculResult {
  cuttingPieces: CuttingPiece[];
  debitageSummary: DebitageSummary[];
  totalBarsCount: number;
  totalProfileBarsCount: number;
  accessories: AccessoryItem[];
  totalAccessoriesCostHt: number;
  glassItems: GlassItem[];
  totalGlassAreaM2: number;
  totalJointBrosseMeters: number;
  totalJointVitrageMeters: number;
}

/**
 * 1D First-Fit Decreasing (FFD) Cutting Stock Optimizer
 * Organizes cut lengths into minimal standard 6.00m (600 cm) bars.
 */
function optimizeCuttingStock(
  pieces: { pieceId: string; lengthCm: number; label: string }[],
  profilRef: string,
  profilDesignation: string,
  isProfileBar = true,
  barLengthCm = 600
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
 * Main Fabrication Calculation Engine (ALU CALCUL)
 */
export function calculateAluFabrication(items: DevisItemState[]): AluCalculResult {
  const cuttingPieces: CuttingPiece[] = [];
  const glassItems: GlassItem[] = [];

  // Hardware counters
  let totalEquerresCadre = 0;
  let totalEquerresOuvrant = 0;
  let totalGalets = 0;
  let totalPointsVerrou = 0;
  let totalJointBrosseCm = 0;
  let totalJointVitrageCm = 0;
  let totalEmboutsChicane = 0;
  let totalBouchonsEvac = 0;
  let totalPaumelles = 0;
  let totalCremones = 0;
  let totalAnglesParclose = 0;
  let totalVerrouSemiFixe = 0;
  let totalBouchon112 = 0;
  let totalJoint247Cm = 0;
  let totalJoint242Cm = 0;
  let hasFrappeItems = false;
  let hasCoulissantItems = false;

  items.forEach((item, itemIdx) => {
    if (item.is_manual) return;

    const H = parseFloat(String(item.hauteur)) || 0;
    const L = parseFloat(String(item.largeur)) || 0;
    const qty = Math.max(1, parseInt(String(item.quantity)) || 1);

    if (H <= 0 || L <= 0 || !item.family_id || !item.product_type_id) return;

    const fam = FAMILIES.find(f => f.id === item.family_id);
    const types = getProductTypesForFamily(item.family_id);
    const typeDef = types.find(t => t.id === item.product_type_id);
    const elementLabel = `${itemIdx + 1}. ${typeDef ? typeDef.name : 'Châssis'} (${L}×${H} cm)`;

    const desLower = ((item.manual_designation || item.manual_nom || '') as string).toLowerCase();
    const typeNameLower = (typeDef?.name || '').toLowerCase();
    
    const isStandaloneStore = (typeDef?.category === 'standalone_store' || fam?.drawType === 'store' || item.family_id === '67') && !desLower.includes('fenêtre') && !desLower.includes('porte') && !desLower.includes('couliss');
    const hasAttachedStore = !isStandaloneStore && Boolean(item.store_enabled || (item as any).volet_integre || item.supplements?.some((s: string) => s.toLowerCase().includes('volet') || s.toLowerCase().includes('store')));
    const isMousti = typeDef?.category === 'standalone_mousti' || fam?.drawType === 'mousti' || item.family_id === '68' || desLower.includes('mousti') || typeNameLower.includes('mousti');
    const isGardeCorps = typeDef?.category === 'garde_corps' || fam?.drawType === 'garde_corps' || item.family_id === '46' || desLower.includes('garde') || typeNameLower.includes('garde');
    const isChassiFix = typeDef?.category === 'chassi_fix' || fam?.drawType === 'fixe' || desLower.includes('châssis fixe') || desLower.includes('chassis fixe') || typeNameLower.includes('fixe');
    const isCoulissant = !isStandaloneStore && !isMousti && !isGardeCorps && !isChassiFix && (fam?.drawType === 'coulissante' || typeDef?.category === 'coulissant' || item.family_id === '60' || item.family_id === '61' || item.family_id === '62' || item.family_id === '65' || item.family_id === '66' || desLower.includes('couliss') || typeNameLower.includes('couliss'));
    const isFrappe = !isCoulissant && !isStandaloneStore && !isMousti && !isGardeCorps && !isChassiFix;
    const isStore = isStandaloneStore;

    let nbVantaux = 2;
    const vantauxMatch = typeDef?.name.match(/(\d+)\s*vantaux/i);
    if (vantauxMatch) {
      nbVantaux = parseInt(vantauxMatch[1]);
    } else if (typeDef?.name.toLowerCase().includes('1 vantail') || typeDef?.name.toLowerCase().includes('soufflet') || typeDef?.category === 'porte' && !typeDef?.name.toLowerCase().includes('2')) {
      nbVantaux = 1;
    }

    // Default Profile References based on selected series
    const dormantRef = item.comp_dormant_ref || (isCoulissant ? '67101' : '40100');
    const ouvrantRef = item.comp_ouvrant_ref || (isCoulissant ? '67104' : '40401');
    const chicaneRef = '67105';
    const traverseOuvrantRef = '67106';
    const parcloseRef = item.comp_parclose_ref || (isCoulissant ? '80116' : '40110');

    // -------------------------------------------------------------
    // A. COULISSANT (Série 67, Alu Eco EX60, TPR Coulissant)
    // -------------------------------------------------------------
    if (isCoulissant) {
      hasCoulissantItems = true;
      const dormantHautRef = item.comp_dormant_ref || '67101';
      const railBasRef = item.comp_seuil_ref && item.comp_seuil_ref !== '— Sans seuil —' ? item.comp_seuil_ref : '67101';
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
        profilDesignation: `Dormant Montant (${dormantHautRef})`,
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
        profilDesignation: `Dormant Traverse (${dormantHautRef})`,
        lengthCm: L,
        quantity: 2 * qty,
        angleLeft: '45°',
        angleRight: '45°',
        notes: 'Cadre dormant supérieur / inférieur'
      });

      // Deductions exactes ALU CALCUL Série 67:
      // H_ouvrant = H - 6.4 cm
      // L_ouvrant = (L - 15.4) / nbVantaux
      const hOuvrant = Math.max(10, parseFloat((H - 6.4).toFixed(1)));
      const lOuvrant = Math.max(10, parseFloat(((L - 15.4) / nbVantaux).toFixed(1)));
      const hChicane = Math.max(10, parseFloat((hOuvrant - 10.8).toFixed(1)));

      // 3. Montants Ouvrant latéraux
      cuttingPieces.push({
        id: `cut_${itemIdx}_coul_ouvr_lat`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'ouvrant_h',
        profilRef: ouvrantCoulRef,
        profilDesignation: `Montant Ouvrant (${ouvrantCoulRef})`,
        lengthCm: hOuvrant,
        quantity: 2 * nbVantaux * qty,
        angleLeft: '90°',
        angleRight: '90°',
        notes: 'Montant latéral ouvrant coulissant'
      });

      // 4. Chicanes Centrales (2 pour 2 vantaux, 4 pour 4 vantaux)
      const nbChicanesPerUnit = nbVantaux === 2 ? 2 : (nbVantaux === 4 ? 4 : 2);
      cuttingPieces.push({
        id: `cut_${itemIdx}_coul_chic`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'chicane',
        profilRef: chicaneProfilRef,
        profilDesignation: `Chicane Centrale (${chicaneProfilRef})`,
        lengthCm: hChicane,
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
        profilDesignation: `Traverse Ouvrant (${travOuvrRef})`,
        lengthCm: lOuvrant,
        quantity: nbVantaux * 2 * qty,
        angleLeft: '90°',
        angleRight: '90°',
        notes: 'Traverses haute et basse ouvrant'
      });

      // 6. Parcloses Vitrage Coulissant
      const hParclose = Math.max(5, parseFloat((hOuvrant - 11.6).toFixed(1)));
      cuttingPieces.push({
        id: `cut_${itemIdx}_coul_parc_h`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'parclose',
        profilRef: parcRef,
        profilDesignation: `Pareclose Montant (${parcRef})`,
        lengthCm: hParclose,
        quantity: 2 * nbVantaux * qty,
        angleLeft: '90°',
        angleRight: '90°',
        notes: 'Maintien vitrage montant'
      });

      // Quincaillerie coulissant
      totalEquerresCadre += 4 * qty;
      totalEquerresOuvrant += 4 * nbVantaux * qty;
      totalGalets += 2 * nbVantaux * qty;
      const points = item.fast_lock_points ? (parseInt(item.fast_lock_points) || 1) : 1;
      totalPointsVerrou += points * qty;
      totalEmboutsChicane += 2 * (nbVantaux > 1 ? 1 : 0) * qty;
      totalBouchonsEvac += 2 * qty;

      const brosseDormant = 2 * (2 * H + 2 * L);
      const brosseChicane = nbVantaux * 2 * hOuvrant;
      totalJointBrosseCm += (brosseDormant + brosseChicane) * qty;

      // Cotes exactes Vitrage AluCalcul Coulissant:
      // H_verre = H_ouvr - 8.7 cm
      // L_verre = L_ouvr - 1.4 cm
      const hVerre = Math.max(5, parseFloat((hOuvrant - 8.7).toFixed(1)));
      const lVerre = Math.max(5, parseFloat((lOuvrant - 1.4).toFixed(1)));
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
      totalJointVitrageCm += perimetreVerre * 2 * totalVerresQty;
    }
    // -------------------------------------------------------------
    // B. STORE RIDEAU / VOLET ROULANT
    // -------------------------------------------------------------
    else if (isStore) {
      // 2 Coulisses de guidage H
      cuttingPieces.push({
        id: `cut_${itemIdx}_store_coul`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'dormant_h',
        profilRef: 'CSQ_Coulisse',
        profilDesignation: 'Coulisse de guidage Store',
        lengthCm: H,
        quantity: 2 * qty,
        angleLeft: '90°',
        angleRight: '90°',
        notes: 'Montants coulisses gauche et droite'
      });

      // 1 Coffre supérieur L
      cuttingPieces.push({
        id: `cut_${itemIdx}_store_coffre`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'dormant_l',
        profilRef: 'CSQ_Coffre',
        profilDesignation: 'Coffre / Caisson Store',
        lengthCm: L,
        quantity: 1 * qty,
        angleLeft: '90°',
        angleRight: '90°',
        notes: 'Caisson supérieur enroulement'
      });

      // 1 Tube Axe d'enroulement L - 7cm
      const lAxe = Math.max(10, L - 7.0);
      cuttingPieces.push({
        id: `cut_${itemIdx}_store_axe`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'traverse',
        profilRef: 'Axe_60',
        profilDesignation: 'Tube axe d’enroulement octogonal',
        lengthCm: lAxe,
        quantity: 1 * qty,
        angleLeft: '90°',
        angleRight: '90°',
        notes: 'Axe d’enroulement tablier'
      });

      // 1 Lame finale basse L - 5cm
      const lLame = Math.max(10, L - 5.0);
      cuttingPieces.push({
        id: `cut_${itemIdx}_store_lame_fin`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'traverse',
        profilRef: 'Lame_Finale',
        profilDesignation: 'Lame finale renforcée',
        lengthCm: lLame,
        quantity: 1 * qty,
        angleLeft: '90°',
        angleRight: '90°',
        notes: 'Lame basse avec joint arrêt'
      });

      // Tablier de lames
      const nbLames = Math.ceil(H / 4.5);
      cuttingPieces.push({
        id: `cut_${itemIdx}_store_lames`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'lame_volet',
        profilRef: 'Lame_Alu_45',
        profilDesignation: 'Lames aluminium injecté 45/55',
        lengthCm: lLame,
        quantity: nbLames * qty,
        angleLeft: '90°',
        angleRight: '90°',
        notes: `${nbLames} lames par volet (${nbLames * qty} au total)`
      });

      totalJointBrosseCm += 4 * H * qty;
    }
    // -------------------------------------------------------------
    // C. GARDE CORPS
    // -------------------------------------------------------------
    else if (isGardeCorps) {
      const nbPoteaux = item.gc_nb_poteaux || Math.max(2, Math.ceil(L / 100) + 1);
      const nbLignes = item.gc_nb_lignes || 4;

      // Main courante L
      cuttingPieces.push({
        id: `cut_${itemIdx}_gc_main`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'dormant_l',
        profilRef: '2984',
        profilDesignation: 'Main courante supérieure (2984)',
        lengthCm: L,
        quantity: 1 * qty,
        angleLeft: '90°',
        angleRight: '90°',
        notes: 'Main courante tubulaire'
      });

      // Poteaux verticaux H
      cuttingPieces.push({
        id: `cut_${itemIdx}_gc_pot`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'dormant_h',
        profilRef: '4085',
        profilDesignation: 'Poteau vertical de support (4085)',
        lengthCm: H > 0 ? H : 100,
        quantity: nbPoteaux * qty,
        angleLeft: '90°',
        angleRight: '90°',
        notes: 'Fixation au sol / sabots'
      });

      // Lisses horizontales L
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
        profilDesignation: 'Caisson d’enroulement Moustiquaire',
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
        profilDesignation: 'Barre de tirage basse',
        lengthCm: Math.max(10, L - 3.0),
        quantity: 1 * qty,
        angleLeft: '90°',
        angleRight: '90°'
      });
      totalJointBrosseCm += 2 * H * qty;
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
        profilDesignation: `Cadre Fixe Montant (${cadreRef})`,
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
        profilDesignation: `Cadre Fixe Traverse (${cadreRef})`,
        lengthCm: L,
        quantity: 2 * qty,
        angleLeft: '45°',
        angleRight: '45°',
        notes: 'Traverse extérieure cadre fixe'
      });

      // Parcloses Châssis Fixe
      cuttingPieces.push({
        id: `cut_${itemIdx}_fix_parc_h`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'parclose',
        profilRef: parcFixeRef,
        profilDesignation: `Parclose Montant (${parcFixeRef})`,
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
        profilDesignation: `Parclose Traverse (${parcFixeRef})`,
        lengthCm: Math.max(10, L - 8.0),
        quantity: 2 * qty,
        angleLeft: '45°',
        angleRight: '45°'
      });

      // Optional Montant intermédiaire
      if (item.chassi_montant_enabled && item.chassi_montant_qty) {
        const mRef = item.chassi_montant_ref || '40155';
        cuttingPieces.push({
          id: `cut_${itemIdx}_fix_montant_int`,
          itemIndex: itemIdx,
          elementLabel,
          pieceType: 'traverse',
          profilRef: mRef,
          profilDesignation: `Meneau / Montant Intermédiaire (${mRef})`,
          lengthCm: H - 4.0,
          quantity: item.chassi_montant_qty * qty,
          angleLeft: '90°',
          angleRight: '90°'
        });
      }

      // Optional Traverse intermédiaire
      if (item.chassi_traverse_enabled && item.chassi_traverse_qty) {
        const tRef = item.chassi_traverse_ref || '40104';
        cuttingPieces.push({
          id: `cut_${itemIdx}_fix_trav_int`,
          itemIndex: itemIdx,
          elementLabel,
          pieceType: 'traverse',
          profilRef: tRef,
          profilDesignation: `Traverse Intermédiaire (${tRef})`,
          lengthCm: L - 4.0,
          quantity: item.chassi_traverse_qty * qty,
          angleLeft: '90°',
          angleRight: '90°'
        });
      }

      totalEquerresCadre += 4 * qty;

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

      totalJointVitrageCm += 2 * (hVerre + lVerre) * 2 * qty;
    }
    // -------------------------------------------------------------
    // F. FRAPPE / PORTES / FENÊTRES (Série 40, EX45, Porte TPR)
    // -------------------------------------------------------------
    else {
      hasFrappeItems = true;
      const dormantFrappeRef = item.comp_dormant_ref || '40100';
      const ouvrantFrappeRef = item.comp_ouvrant_ref || '40401';
      const battementRef = '40154';
      const parcloseFrappeRef = item.comp_parclose_ref || '40110';

      // 1. Dormant Montants H (45°)
      cuttingPieces.push({
        id: `cut_${itemIdx}_frappe_dorm_h`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'dormant_h',
        profilRef: dormantFrappeRef,
        profilDesignation: `Dormant Montant (${dormantFrappeRef})`,
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
        profilDesignation: `Dormant Traverse (${dormantFrappeRef})`,
        lengthCm: L,
        quantity: 2 * qty,
        angleLeft: '45°',
        angleRight: '45°',
        notes: 'Dormant haut et bas'
      });

      // Deductions exactes ALU CALCUL Série 40 Frappe:
      // H_ouvrant = H - 2.8 cm
      // L_ouvrant = (L - 4.8) / nbVantaux
      const hOuvrant = Math.max(10, parseFloat((H - 2.8).toFixed(1)));
      const lOuvrant = Math.max(10, parseFloat(((L - 4.8) / nbVantaux).toFixed(1)));

      // 3. Ouvrant Montants (45°)
      cuttingPieces.push({
        id: `cut_${itemIdx}_frappe_ouvr_h`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'ouvrant_h',
        profilRef: ouvrantFrappeRef,
        profilDesignation: `Ouvrant Montant (${ouvrantFrappeRef})`,
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
        profilDesignation: `Ouvrant Traverse (${ouvrantFrappeRef})`,
        lengthCm: lOuvrant,
        quantity: 2 * nbVantaux * qty,
        angleLeft: '45°',
        angleRight: '45°',
        notes: 'Traverses haute et basse ouvrant'
      });

      // 5. Battement central (UNIQUEMENT pour 2 vantaux)
      if (nbVantaux > 1) {
        cuttingPieces.push({
          id: `cut_${itemIdx}_frappe_batt`,
          itemIndex: itemIdx,
          elementLabel,
          pieceType: 'chicane',
          profilRef: battementRef,
          profilDesignation: `Battement Central (${battementRef})`,
          lengthCm: hOuvrant,
          quantity: 1 * qty,
          angleLeft: '90°',
          angleRight: '90°',
          notes: 'Battement de fermeture central'
        });
      }

      // 6. Parecloses H et L
      const hParc = Math.max(5, parseFloat((hOuvrant - 8.0).toFixed(1)));
      const lParc = Math.max(5, parseFloat((lOuvrant - 8.0).toFixed(1)));

      cuttingPieces.push({
        id: `cut_${itemIdx}_frappe_parc_h`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'parclose',
        profilRef: parcloseFrappeRef,
        profilDesignation: `Pareclose Montant (${parcloseFrappeRef})`,
        lengthCm: hParc,
        quantity: 2 * nbVantaux * qty,
        angleLeft: '45°',
        angleRight: '45°',
        notes: 'Pareclose verticale ouvrant'
      });

      cuttingPieces.push({
        id: `cut_${itemIdx}_frappe_parc_l`,
        itemIndex: itemIdx,
        elementLabel,
        pieceType: 'parclose',
        profilRef: parcloseFrappeRef,
        profilDesignation: `Pareclose Traverse (${parcloseFrappeRef})`,
        lengthCm: lParc,
        quantity: 2 * nbVantaux * qty,
        angleLeft: '45°',
        angleRight: '45°',
        notes: 'Pareclose horizontale ouvrant'
      });

      // 7. Traverse intermédiaire (UNIQUEMENT SI explicitement demandée — UNE SEULE fois)
      const hasTraverseFromSupplement = item.supplements?.includes('Traverse') ?? false;
      const hasTraverseFromPartie = (item.partie_fixe_type === 'Imposte' || item.partie_fixe_type === 'Allège') && !hasTraverseFromSupplement;
      const hasTraverse = hasTraverseFromSupplement || hasTraverseFromPartie;
      if (hasTraverse) {
        const traverseFrappeRef = item.comp_traverse_ref || '40135';
        const traverseLabel = hasTraverseFromPartie ? item.partie_fixe_type! : 'Traverse';
        cuttingPieces.push({
          id: `cut_${itemIdx}_frappe_trav_supp`,
          itemIndex: itemIdx,
          elementLabel,
          pieceType: 'traverse',
          profilRef: traverseFrappeRef,
          profilDesignation: `Traverse ${traverseLabel} (${traverseFrappeRef})`,
          lengthCm: Math.max(10, lOuvrant - 2.0),
          quantity: nbVantaux * qty,
          angleLeft: '90°',
          angleRight: '90°',
          notes: `Traverse ${traverseLabel} de vantail`
        });
      }

      // 8. Couvre-joint (UNIQUEMENT SI non désactivé)
      if (!item.sans_couvre_joint && (item.couvre_joint_type || item.comp_couvre_joint_ref)) {
        const cjRef = item.comp_couvre_joint_ref || '40402';
        cuttingPieces.push({
          id: `cut_${itemIdx}_frappe_cj_h`,
          itemIndex: itemIdx,
          elementLabel,
          pieceType: 'couvre_joint',
          profilRef: cjRef,
          profilDesignation: `Couvre Joint H (${cjRef})`,
          lengthCm: parseFloat((H + 3.5).toFixed(1)),
          quantity: 2 * qty,
          angleLeft: '45°',
          angleRight: '45°',
          notes: 'Finition tapée latérale'
        });
        cuttingPieces.push({
          id: `cut_${itemIdx}_frappe_cj_l`,
          itemIndex: itemIdx,
          elementLabel,
          pieceType: 'couvre_joint',
          profilRef: cjRef,
          profilDesignation: `Couvre Joint L (${cjRef})`,
          lengthCm: parseFloat((L + 3.5).toFixed(1)),
          quantity: 2 * qty,
          angleLeft: '45°',
          angleRight: '45°',
          notes: 'Finition tapée haute/basse'
        });
      }

      // Quincaillerie Frappe
      totalEquerresCadre += 4 * qty;
      totalEquerresOuvrant += 4 * nbVantaux * qty;
      totalPaumelles += (H > 160 ? 3 : 2) * nbVantaux * qty;
      totalCremones += 1 * qty;
      totalAnglesParclose += nbVantaux * 8 * qty;
      if (nbVantaux > 1) {
        totalVerrouSemiFixe += 1 * qty;
        totalBouchon112 += 1 * qty;
      }
      totalJoint247Cm += 2 * (H + L) * 2 * qty;

      const hVitJ = hOuvrant - 10.0;
      const lVitJ = lOuvrant - 10.0;
      totalJoint242Cm += 2 * (hVitJ + lVitJ) * 2 * nbVantaux * qty;

      // Vitrage Frappe
      const hVerre = Math.max(5, parseFloat((hOuvrant - 10.0).toFixed(1)));
      const lVerre = Math.max(5, parseFloat((lOuvrant - 10.0).toFixed(1)));
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

      totalJointVitrageCm += 2 * (hVerre + lVerre) * 2 * totalVerresQty;
    }

    // Attached Rolling Shutter (Monobloc / Volet Intégré)
    if (hasAttachedStore) {
      // Coulisses H
      cuttingPieces.push({
        id: `cut_${itemIdx}_att_store_coul`,
        itemIndex: itemIdx,
        elementLabel: `${elementLabel} - Volet Intégré`,
        pieceType: 'dormant_h',
        profilRef: 'CSQ_Coulisse',
        profilDesignation: 'Coulisse Volet Intégré',
        lengthCm: H,
        quantity: 2 * qty,
        angleLeft: '90°',
        angleRight: '90°'
      });
      // Coffre L
      cuttingPieces.push({
        id: `cut_${itemIdx}_att_store_coffre`,
        itemIndex: itemIdx,
        elementLabel: `${elementLabel} - Volet Intégré`,
        pieceType: 'dormant_l',
        profilRef: 'CSQ_Coffre',
        profilDesignation: 'Coffre / Caisson Volet Intégré',
        lengthCm: L,
        quantity: 1 * qty,
        angleLeft: '90°',
        angleRight: '90°'
      });
      // Axe 60
      cuttingPieces.push({
        id: `cut_${itemIdx}_att_store_axe`,
        itemIndex: itemIdx,
        elementLabel: `${elementLabel} - Volet Intégré`,
        pieceType: 'traverse',
        profilRef: 'Axe_60',
        profilDesignation: 'Tube axe d’enroulement',
        lengthCm: Math.max(10, L - 7.0),
        quantity: 1 * qty,
        angleLeft: '90°',
        angleRight: '90°'
      });
      // Lame finale
      cuttingPieces.push({
        id: `cut_${itemIdx}_att_store_lame_fin`,
        itemIndex: itemIdx,
        elementLabel: `${elementLabel} - Volet Intégré`,
        pieceType: 'traverse',
        profilRef: 'Lame_Finale',
        profilDesignation: 'Lame finale renforcée',
        lengthCm: Math.max(10, L - 5.0),
        quantity: 1 * qty,
        angleLeft: '90°',
        angleRight: '90°'
      });
      // Tablier lames
      // Tablier lames
      const nbLames = Math.ceil(H / 4.5);
      cuttingPieces.push({
        id: `cut_${itemIdx}_att_store_lames`,
        itemIndex: itemIdx,
        elementLabel: `${elementLabel} - Volet Intégré`,
        pieceType: 'lame_volet',
        profilRef: 'Lame_Alu_45',
        profilDesignation: 'Lames aluminium injecté (Tablier)',
        lengthCm: Math.max(10, L - 5.0),
        quantity: nbLames * qty,
        angleLeft: '90°',
        angleRight: '90°'
      });
      totalJointBrosseCm += 4 * H * qty;
    }

    // Attached Flyscreen (Moustiquaire Intégrée / Apparente)
    const hasAttachedMousti = !isMousti && Boolean(item.mousti_enabled);
    if (hasAttachedMousti) {
      cuttingPieces.push({
        id: `cut_${itemIdx}_att_mousti_coul`,
        itemIndex: itemIdx,
        elementLabel: `${elementLabel} - Moustiquaire`,
        pieceType: 'dormant_h',
        profilRef: 'MOUSTI_Coulisse',
        profilDesignation: 'Coulisses latérales Moustiquaire',
        lengthCm: H,
        quantity: 2 * qty,
        angleLeft: '90°',
        angleRight: '90°'
      });
      cuttingPieces.push({
        id: `cut_${itemIdx}_att_mousti_coffre`,
        itemIndex: itemIdx,
        elementLabel: `${elementLabel} - Moustiquaire`,
        pieceType: 'dormant_l',
        profilRef: 'MOUSTI_Coffre',
        profilDesignation: 'Caisson d’enroulement Moustiquaire',
        lengthCm: L,
        quantity: 1 * qty,
        angleLeft: '90°',
        angleRight: '90°'
      });
      cuttingPieces.push({
        id: `cut_${itemIdx}_att_mousti_barre`,
        itemIndex: itemIdx,
        elementLabel: `${elementLabel} - Moustiquaire`,
        pieceType: 'traverse',
        profilRef: 'MOUSTI_Tirage',
        profilDesignation: 'Barre de tirage basse Moustiquaire',
        lengthCm: Math.max(10, L - 3.0),
        quantity: 1 * qty,
        angleLeft: '90°',
        angleRight: '90°'
      });
      totalJointBrosseCm += 2 * H * qty;
    }
  });

  // Group cutting pieces by Profile Reference
  const piecesByRef: { 
    [ref: string]: { 
      pieces: { pieceId: string; lengthCm: number; label: string }[]; 
      designation: string;
      isProfileBar: boolean;
    } 
  } = {};

  cuttingPieces.forEach(cp => {
    const isSlat = cp.pieceType === 'lame_volet';
    if (!piecesByRef[cp.profilRef]) {
      piecesByRef[cp.profilRef] = { 
        pieces: [], 
        designation: cp.profilDesignation,
        isProfileBar: !isSlat
      };
    }
    for (let i = 0; i < cp.quantity; i++) {
      piecesByRef[cp.profilRef].pieces.push({
        pieceId: `${cp.id}_${i}`,
        lengthCm: cp.lengthCm,
        label: `${cp.elementLabel} - ${cp.pieceType}`
      });
    }
  });

  const debitageSummary: DebitageSummary[] = Object.keys(piecesByRef).map(ref => {
    return optimizeCuttingStock(
      piecesByRef[ref].pieces,
      ref,
      piecesByRef[ref].designation,
      piecesByRef[ref].isProfileBar,
      600 // Standard 6.00m bars
    );
  });

  // Count standard structural profile bars
  const totalProfileBarsCount = debitageSummary
    .filter(d => d.isProfileBar)
    .reduce((sum, d) => sum + d.totalBarsCount, 0);

  const totalBarsCount = debitageSummary.reduce((sum, d) => sum + d.totalBarsCount, 0);

  // -------------------------------------------------------------
  // Quincaillerie & Accessoires (Prix Réels)
  // -------------------------------------------------------------
  const accessories: AccessoryItem[] = [];

  const getAccPrice = (id: string, defaultPrice: number): number => {
    const found = INITIAL_ACCESSORIES.find(a => a.id === id);
    return found ? found.prix_unitaire_ht : defaultPrice;
  };

  const hasCoulissant = hasCoulissantItems;
  const hasFrappe = hasFrappeItems;

  if (totalEquerresCadre > 0) {
    const eqRef = hasCoulissant ? 'acc_equerre_67' : 'acc_equerre_40';
    const eqNom = hasCoulissant ? 'Équerre 67' : 'Équerre 40';
    const unitPrice = getAccPrice(eqRef, hasCoulissant ? 1.944 : 2.160);
    accessories.push({
      id: 'acc_eq_cadre',
      designation: `Équerres d’assemblage cadre dormant (${eqNom})`,
      reference: eqNom,
      category: 'equerre',
      quantity: totalEquerresCadre,
      unit: 'unité',
      unitPriceHt: unitPrice,
      totalPriceHt: parseFloat((totalEquerresCadre * unitPrice).toFixed(3)),
      details: '4 équerres par cadre extérieur'
    });
  }

  if (totalEquerresOuvrant > 0) {
    const eqRef = hasCoulissant ? 'acc_equerre_67' : 'acc_equerre_40';
    const eqNom = hasCoulissant ? 'Équerre 67' : 'Équerre 40';
    const unitPrice = getAccPrice(eqRef, hasCoulissant ? 1.944 : 2.160);
    accessories.push({
      id: 'acc_eq_ouvrant',
      designation: `Équerres d’assemblage ouvrant (${eqNom})`,
      reference: eqNom,
      category: 'equerre',
      quantity: totalEquerresOuvrant,
      unit: 'unité',
      unitPriceHt: unitPrice,
      totalPriceHt: parseFloat((totalEquerresOuvrant * unitPrice).toFixed(3)),
      details: '4 équerres par vantail mobile'
    });
  }

  if (totalAnglesParclose > 0) {
    const unitPrice = getAccPrice('acc_angle_pareclose', 0.270);
    accessories.push({
      id: 'acc_angles_parclose',
      designation: 'Angles de pareclose (Coins parcloses)',
      reference: 'Angle de pareclose',
      category: 'accessoire',
      quantity: totalAnglesParclose,
      unit: 'unité',
      unitPriceHt: unitPrice,
      totalPriceHt: parseFloat((totalAnglesParclose * unitPrice).toFixed(3)),
      details: '8 angles de pareclose par vantail'
    });
  }

  if (totalGalets > 0) {
    const unitPrice = getAccPrice('acc_galet', 2.700);
    accessories.push({
      id: 'acc_galets',
      designation: 'Galets de roulement (Roulettes coulissant)',
      reference: 'Galet',
      category: 'roulette',
      quantity: totalGalets,
      unit: 'unité',
      unitPriceHt: unitPrice,
      totalPriceHt: parseFloat((totalGalets * unitPrice).toFixed(3)),
      details: '2 galets réglables par vantail coulissant'
    });
  }

  if (totalPointsVerrou > 0) {
    const unitPrice = getAccPrice('acc_fermeture', 10.260);
    accessories.push({
      id: 'acc_fermetures',
      designation: 'Fermetures latérales / Gâches de sécurité',
      reference: 'Fermeture',
      category: 'verrou',
      quantity: totalPointsVerrou,
      unit: 'unité',
      unitPriceHt: unitPrice,
      totalPriceHt: parseFloat((totalPointsVerrou * unitPrice).toFixed(3)),
      details: 'Points de condamnation et poignées cuvettes'
    });
  }

  if (totalPaumelles > 0) {
    const unitPrice = getAccPrice('acc_paumelle', 5.940);
    accessories.push({
      id: 'acc_paumelles',
      designation: 'Paumelles de frappe aluminium',
      reference: 'Paumelle',
      category: 'verrou',
      quantity: totalPaumelles,
      unit: 'unité',
      unitPriceHt: unitPrice,
      totalPriceHt: parseFloat((totalPaumelles * unitPrice).toFixed(3)),
      details: '2 à 3 paumelles renforcées par vantail'
    });
  }

  if (totalCremones > 0) {
    const isPorte = items.some(i => i.family_id === 'portes_lourdes' || i.product_type_id?.includes('porte') || (getProductTypesForFamily(i.family_id).find(t => t.id === i.product_type_id)?.category === 'porte'));
    if (isPorte) {
      const serrurePrice = getAccPrice('acc_serrure_montante', 48.600);
      accessories.push({
        id: 'acc_serrure_montante',
        designation: 'Serrure montante multipoints pour porte',
        reference: 'Serrure montante',
        category: 'verrou',
        quantity: totalCremones,
        unit: 'unité',
        unitPriceHt: serrurePrice,
        totalPriceHt: parseFloat((totalCremones * serrurePrice).toFixed(3)),
        details: 'Serrure principale barillet'
      });

      const poigneePrice = getAccPrice('acc_poignee_bequille', 14.580);
      accessories.push({
        id: 'acc_poignee_bequille',
        designation: 'Paire de poignées béquilles aluminium',
        reference: 'Poignée béquille',
        category: 'verrou',
        quantity: totalCremones,
        unit: 'unité',
        unitPriceHt: poigneePrice,
        totalPriceHt: parseFloat((totalCremones * poigneePrice).toFixed(3)),
        details: 'Béquille double avec rosaces'
      });
    } else {
      const unitPrice = getAccPrice('acc_cremone', 15.876);
      accessories.push({
        id: 'acc_cremones',
        designation: 'Crémones / Poignées de fenêtre à frappe',
        reference: 'Crémone',
        category: 'verrou',
        quantity: totalCremones,
        unit: 'unité',
        unitPriceHt: unitPrice,
        totalPriceHt: parseFloat((totalCremones * unitPrice).toFixed(3)),
        details: '1 crémone avec tringles par vantail ouvrant'
      });
    }
  }

  if (totalVerrouSemiFixe > 0) {
    const unitVerrouPrice = getAccPrice('acc_verrou_semi_fixe', 7.020);
    accessories.push({
      id: 'acc_verrou_semi_fixe',
      designation: 'Verrouillage vantail semi-fixe haut et bas',
      reference: 'Verrouillage semi-fixe',
      category: 'verrou',
      quantity: totalVerrouSemiFixe,
      unit: 'unité',
      unitPriceHt: unitVerrouPrice,
      totalPriceHt: parseFloat((totalVerrouSemiFixe * unitVerrouPrice).toFixed(3)),
      details: 'Verrouillage vantail passif'
    });

    const unitBouchonPrice = getAccPrice('acc_bouchon_112', 3.132);
    accessories.push({
      id: 'acc_bouchon_112',
      designation: 'Bouchon d’étanchéité battement central',
      reference: 'Bouchon 112',
      category: 'accessoire',
      quantity: totalBouchon112,
      unit: 'unité',
      unitPriceHt: unitBouchonPrice,
      totalPriceHt: parseFloat((totalBouchon112 * unitBouchonPrice).toFixed(3)),
      details: 'Finition et étanchéité battement'
    });
  }

  // Joints
  const joint247Meters = parseFloat((totalJoint247Cm / 100).toFixed(2));
  if (joint247Meters > 0) {
    const unitPrice = getAccPrice('acc_joint_247', 0.324);
    accessories.push({
      id: 'acc_joint_247',
      designation: 'Joint 247 d’étanchéité cadre dormant & battement',
      reference: 'Joint 247',
      category: 'joint',
      quantity: joint247Meters,
      unit: 'm',
      unitPriceHt: unitPrice,
      totalPriceHt: parseFloat((joint247Meters * unitPrice).toFixed(3)),
      details: 'Étanchéité périphérique cadre extérieur'
    });
  }

  const joint242Meters = parseFloat((totalJoint242Cm / 100).toFixed(2));
  if (joint242Meters > 0) {
    const unitPrice = getAccPrice('acc_joint_242', 0.324);
    accessories.push({
      id: 'acc_joint_242',
      designation: 'Joint 242 de vitrage ouvrant',
      reference: 'Joint 242',
      category: 'joint',
      quantity: joint242Meters,
      unit: 'm',
      unitPriceHt: unitPrice,
      totalPriceHt: parseFloat((joint242Meters * unitPrice).toFixed(3)),
      details: 'Maintien étanche du vitrage'
    });
  }

  const totalJointBrosseMeters = parseFloat((totalJointBrosseCm / 100).toFixed(2));
  if (totalJointBrosseMeters > 0) {
    const unitPrice = getAccPrice('acc_joint_brosse_76', 0.378);
    accessories.push({
      id: 'acc_joint_brosse',
      designation: 'Joint brosse d’étanchéité 7/6',
      reference: 'Joint brosse 7/6',
      category: 'joint',
      quantity: totalJointBrosseMeters,
      unit: 'm',
      unitPriceHt: unitPrice,
      totalPriceHt: parseFloat((totalJointBrosseMeters * unitPrice).toFixed(3)),
      details: 'Étanchéité rails coulissant'
    });
  }

  const nonFrappeGlassMeters = parseFloat((totalJointVitrageCm / 100).toFixed(2));
  if (!hasFrappe && nonFrappeGlassMeters > 0) {
    const unitPrice = getAccPrice('acc_joint_plat_035', 0.702);
    accessories.push({
      id: 'acc_joint_vitrage_plat',
      designation: 'Joint plat de vitrage 0.35 EPDM',
      reference: 'Joint plat 0.35',
      category: 'joint',
      quantity: nonFrappeGlassMeters,
      unit: 'm',
      unitPriceHt: unitPrice,
      totalPriceHt: parseFloat((nonFrappeGlassMeters * unitPrice).toFixed(3)),
      details: 'Calfeutrement vitrage'
    });
  }

  if (totalEmboutsChicane > 0) {
    const unitPrice = getAccPrice('acc_bouchon_central', 0.378);
    accessories.push({
      id: 'acc_embouts_chicane',
      designation: 'Embouts et feutres de chicane centrale',
      reference: 'Bouchon central',
      category: 'accessoire',
      quantity: totalEmboutsChicane,
      unit: 'unité',
      unitPriceHt: unitPrice,
      totalPriceHt: parseFloat((totalEmboutsChicane * unitPrice).toFixed(3)),
      details: 'Guidage chicane coulissant'
    });
  }

  if (totalBouchonsEvac > 0) {
    const unitPrice = getAccPrice('acc_bouchon_lateral', 0.378);
    accessories.push({
      id: 'acc_bouchons_evac',
      designation: 'Bouchons d’évacuation d’eau / drainage',
      reference: 'Bouchon drainage',
      category: 'accessoire',
      quantity: totalBouchonsEvac,
      unit: 'unité',
      unitPriceHt: unitPrice,
      totalPriceHt: parseFloat((totalBouchonsEvac * unitPrice).toFixed(3)),
      details: 'Clapets de drainage dormant bas'
    });
  }

  // -------------------------------------------------------------
  // Moteurs, Commandes & Sécurités de Volets Roulants
  // -------------------------------------------------------------
  items.forEach((item, itemIdx) => {
    if (item.is_manual) return;
    const qty = Math.max(1, parseInt(String(item.quantity)) || 1);
    const H = parseFloat(String(item.hauteur)) || 0;
    const L = parseFloat(String(item.largeur)) || 0;
    const surfaceM2 = (L * H) / 10000;

    const isStandaloneStore = (item.family_id === '67') || ((item.product_type_id || '').includes('store'));
    const hasStore = isStandaloneStore || item.store_enabled;

    if (hasStore) {
      const manoeuvre = item.store_manoeuvre || 'moteur_filaire';

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

        accessories.push({
          id: `motor_${itemIdx}`,
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
        accessories.push({
          id: `sangle_${itemIdx}`,
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

      if (item.store_bloc_secu ?? true) {
        const secuPrice = getAccPrice('acc_bloc_secu_60', 31.212);
        accessories.push({
          id: `secu_${itemIdx}`,
          designation: `Blocs de sécurité anti-soulèvement (Ouvrage #${itemIdx + 1})`,
          reference: 'Bloc sécu 60',
          category: 'accessoire',
          quantity: 2 * qty,
          unit: 'unité',
          unitPriceHt: secuPrice,
          totalPriceHt: parseFloat((secuPrice * 2 * qty).toFixed(3)),
          details: 'Attaches tablier rigides anti-effraction'
        });
      }
    }

    // Moustiquaires
    const isMousti = (item.family_id === '68') || ((item.product_type_id || '').includes('mousti'));
    const hasMousti = isMousti || item.mousti_enabled;
    if (hasMousti) {
      const typeLabel = item.mousti_type === 'plissee' ? 'Plissée Coulissante' : (item.mousti_type === 'fixe' ? 'Cadre Fixe' : (item.mousti_type === 'battante' ? 'Porte Battante' : 'Enroulable Verticale'));
      accessories.push({
        id: `mousti_kit_${itemIdx}`,
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

    // Supplements (Groom, Serrure)
    if (item.supplements?.includes('Ferme-porte Groom')) {
      accessories.push({
        id: `groom_${itemIdx}`,
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
      accessories.push({
        id: `serrure_cle_${itemIdx}`,
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

  const totalAccessoriesCostHt = parseFloat(accessories.reduce((sum, a) => sum + a.totalPriceHt, 0).toFixed(3));
  const totalGlassAreaM2 = parseFloat(glassItems.reduce((sum, g) => sum + g.totalAreaM2, 0).toFixed(3));
  const totalJointVitrageMeters = parseFloat((totalJointVitrageCm / 100).toFixed(2));

  return {
    cuttingPieces,
    debitageSummary,
    totalBarsCount,
    totalProfileBarsCount,
    accessories,
    totalAccessoriesCostHt,
    glassItems,
    totalGlassAreaM2,
    totalJointBrosseMeters,
    totalJointVitrageMeters
  };
}
