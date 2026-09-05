import { ArticleItem } from '../data/initialArticles';
import { REMPLISSAGES, MOTIFS } from '../data/productCatalog';

export interface DevisItemState {
  _uid: string | number;
  is_manual?: boolean;
  manual_nom?: string;
  manual_designation?: string;
  hauteur: string | number;
  largeur: string | number;
  quantity: number;
  manual_unit_price?: string | number;
  
  family_id: string;
  product_type_id: string;
  couleur: 'blanc' | 'gris' | 'noir' | 'couleur_mat' | 'couleur_givre';
  remplissage_id: string;
  vitrage_type: 'simple' | 'double';
  motif_id: string;
  ouverture_type?: string;
  supplements: string[];
  fast_lock_points?: string;
  cremone_id?: string;

  // Composition refs
  comp_ouvrant_ref?: string;
  comp_dormant_ref?: string;
  comp_traverse_ref?: string;
  comp_parclose_ref?: string;
  comp_meneau_ref?: string;
  comp_couvre_joint_ref?: string;
  comp_lateral_qty?: Record<string, number>;
  comp_central_qty?: Record<string, number>;
  comp_seuil_ref?: string;

  // Chassi fixe
  is_chassi_fix?: boolean;
  chassi_cadre_ref?: string;
  chassi_socle_ref?: string;
  chassi_montant_enabled?: boolean;
  chassi_montant_ref?: string;
  chassi_montant_qty?: number;
  chassi_traverse_enabled?: boolean;
  chassi_traverse_ref?: string;
  chassi_traverse_qty?: number;

  // Garde corps
  is_garde_corps?: boolean;
  gc_nb_poteaux?: number;
  gc_nb_lignes?: number;
  gc_nb_coudes?: number;
  gc_fin_type?: string;
  gc_fin_qty?: number;
  gc_ongle?: string;

  // Store Rideau (Volet Roulant)
  store_enabled?: boolean;
  store_lame_type?: string;
  store_couleur?: string;
  store_coffre?: string;
  store_encastre?: boolean;
  store_axe70?: boolean;
  store_renforce?: boolean;
  store_bloc_secu?: boolean;
  store_lame_s_qty?: number;
  store_manoeuvre?: 'manuel_sangle' | 'moteur_filaire' | 'moteur_radio' | 'tirage_direct';
  store_moteur_id?: string;

  // Moustiquaire
  mousti_enabled?: boolean;
  mousti_type?: 'enroulable' | 'plissee' | 'fixe' | 'battante';
  mousti_hauteur?: string | number;
  mousti_largeur?: string | number;

  // Partie Fixe & Couvre Joint
  partie_fixe_type?: string;
  pf_dim_1?: string | number;
  pf_dim_2?: string | number;
  sans_couvre_joint?: boolean;
  couvre_joint_type?: string;

  _showErrors?: boolean;
}

export interface StoreMotorDef {
  id: string;
  nom: string;
  capacite_kg: number;
  prix_unitaire_ht: number;
}

export const STORE_MOTORS: StoreMotorDef[] = [
  { id: 'auto', nom: 'Automatique (Recommandé selon dimensions)', capacite_kg: 0, prix_unitaire_ht: 0 },
  { id: 'acc_moteur_40kg', nom: 'Moteur tubulaire 40 kg (jusqu’à 2.5 m²)', capacite_kg: 40, prix_unitaire_ht: 70.200 },
  { id: 'acc_moteur_60kg', nom: 'Moteur tubulaire 60 kg (2.5 à 4.5 m²)', capacite_kg: 60, prix_unitaire_ht: 81.000 },
  { id: 'acc_moteur_100kg', nom: 'Moteur tubulaire 100 kg (4.5 à 7.5 m²)', capacite_kg: 100, prix_unitaire_ht: 102.600 },
  { id: 'acc_moteur_160kg', nom: 'Moteur tubulaire 160 kg (grandes baies)', capacite_kg: 160, prix_unitaire_ht: 194.400 },
  { id: 'acc_moteur_250kg', nom: 'Moteur tubulaire 250 kg (industriel)', capacite_kg: 250, prix_unitaire_ht: 237.600 }
];

export interface CalculatedItemCost {
  article_cost: number;
  vitrage_cost: number;
  store_cost: number;
  mousti_cost: number;
  accessoires_cost: number;
  brut_ht: number;
  marge_amount: number;
  net_ht: number;
  total_ht: number;
  total_ttc: number;
}

export interface DevisTotals {
  total_brut_ht: number;
  total_marge: number;
  frais_pose?: number;
  frais_transport?: number;
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  items_costs: CalculatedItemCost[];
}

export function calculateItemCost(
  item: DevisItemState,
  articlesMap: Map<string, ArticleItem>,
  marges: {
    margeType: 'percent' | 'dt';
    margeValue: number;
    margeGcType: 'percent' | 'dt';
    margeGcValue: number;
    margeMoustiType: 'percent' | 'dt';
    margeMoustiValue: number;
    margeStoreType: 'percent' | 'dt';
    margeStoreValue: number;
    tva: number;
    frais_pose?: number;
    frais_transport?: number;
  }
): CalculatedItemCost {
  const qty = Number(item.quantity) || 1;

  if (item.is_manual) {
    const unitPrice = parseFloat(String(item.manual_unit_price || 0)) || 0;
    const net_ht = unitPrice;
    const total_ht = net_ht * qty;
    const total_ttc = total_ht * (1 + (marges.tva || 0) / 100);
    return {
      article_cost: unitPrice,
      vitrage_cost: 0,
      store_cost: 0,
      mousti_cost: 0,
      accessoires_cost: 0,
      brut_ht: unitPrice,
      marge_amount: 0,
      net_ht,
      total_ht,
      total_ttc
    };
  }

  const h = parseFloat(String(item.hauteur)) || 0;
  const w = parseFloat(String(item.largeur)) || 0;

  // Unconfigured item: no family, no product type, or missing dimensions -> 0 cost
  if (!item.family_id || !item.product_type_id) {
    return {
      article_cost: 0,
      vitrage_cost: 0,
      store_cost: 0,
      mousti_cost: 0,
      accessoires_cost: 0,
      brut_ht: 0,
      marge_amount: 0,
      net_ht: 0,
      total_ht: 0,
      total_ttc: 0
    };
  }

  if (item.is_garde_corps) {
    if (w <= 0) {
      return {
        article_cost: 0,
        vitrage_cost: 0,
        store_cost: 0,
        mousti_cost: 0,
        accessoires_cost: 0,
        brut_ht: 0,
        marge_amount: 0,
        net_ht: 0,
        total_ht: 0,
        total_ttc: 0
      };
    }
  } else {
    if (h <= 0 || w <= 0) {
      return {
        article_cost: 0,
        vitrage_cost: 0,
        store_cost: 0,
        mousti_cost: 0,
        accessoires_cost: 0,
        brut_ht: 0,
        marge_amount: 0,
        net_ht: 0,
        total_ht: 0,
        total_ttc: 0
      };
    }
  }

  const surfaceM2 = (h * w) / 10000;
  const perimeterM = (2 * (h + w)) / 100;
  const color = item.couleur || 'blanc';

  const getArticlePrice = (ref: string): number => {
    if (!ref) return 0;
    const art = articlesMap.get(ref.trim());
    if (!art) {
      // FIX: Never silently return 40 DT for a missing reference.
      // Return 0 so the cost line is zero (visible) instead of wrong.
      console.warn(`[devisCalculator] Article introuvable dans le catalogue: "${ref}". Coût mis à 0.`);
      return 0;
    }
    const pr = art.prix[color as keyof typeof art.prix] || art.prix.blanc;
    return pr?.ht || 0;
  };

  let article_cost = 0;
  let vitrage_cost = 0;
  let store_cost = 0;
  let mousti_cost = 0;
  let accessoires_cost = 0;

  if (item.is_garde_corps) {
    // Garde corps calculation
    const nbPoteaux = item.gc_nb_poteaux || 2;
    const nbLignes = item.gc_nb_lignes || 1;
    const nbCoudes = item.gc_nb_coudes || 0;
    const mainCouranteP = getArticlePrice('2984') || 132;
    const barreauP = getArticlePrice('2878') || 30;
    const poteauP = getArticlePrice('4085') || 143;

    article_cost += (w / 600) * mainCouranteP; // Main courante
    article_cost += nbPoteaux * ((h || 100) / 600) * poteauP; // Poteaux
    article_cost += nbLignes * (w / 600) * barreauP; // Lisses/barreaux
    accessoires_cost += nbCoudes * 18 + (item.gc_fin_qty || 0) * 12;

    if (item.remplissage_id) {
      const remp = REMPLISSAGES.find(r => r.id === item.remplissage_id);
      if (remp) vitrage_cost += surfaceM2 * remp.pricePerM2;
    }
  } else {
    // Standard windows / doors / chassi
    const dormantRef = item.is_chassi_fix ? (item.chassi_cadre_ref || '40100') : (item.comp_dormant_ref || '40100');
    const ouvrantRef = item.comp_ouvrant_ref || '40401';
    const parcloseRef = item.comp_parclose_ref || '40110';

    const pDormant = getArticlePrice(dormantRef);
    const pOuvrant = getArticlePrice(ouvrantRef);
    const pParclose = getArticlePrice(parcloseRef);

    // Number of 6m bars approximated
    const dormantBars = Math.max(0.5, perimeterM / 6);
    article_cost += dormantBars * pDormant;

    if (item.is_chassi_fix) {
      if (item.chassi_socle_ref) {
        article_cost += (w / 600) * getArticlePrice(item.chassi_socle_ref);
      }
      if (item.chassi_montant_enabled && item.chassi_montant_qty) {
        article_cost += ((h * item.chassi_montant_qty) / 600) * getArticlePrice(item.chassi_montant_ref || '40155');
      }
      if (item.chassi_traverse_enabled && item.chassi_traverse_qty) {
        article_cost += ((w * item.chassi_traverse_qty) / 600) * getArticlePrice(item.chassi_traverse_ref || '40104');
      }
    } else {
      // Sashes
      const ouvrantBars = Math.max(0.6, (perimeterM * 1.5) / 6);
      article_cost += ouvrantBars * pOuvrant;
      article_cost += (perimeterM / 6) * pParclose;

      // Coulissant lateral & central
      if (item.comp_lateral_qty) {
        Object.entries(item.comp_lateral_qty).forEach(([ref, q]) => {
          article_cost += ((h * q) / 600) * getArticlePrice(ref);
        });
      }
      if (item.comp_central_qty) {
        Object.entries(item.comp_central_qty).forEach(([ref, q]) => {
          article_cost += ((h * q) / 600) * getArticlePrice(ref);
        });
      }
      if (item.comp_seuil_ref && item.comp_seuil_ref !== '— Sans seuil —') {
        article_cost += (w / 600) * getArticlePrice(item.comp_seuil_ref);
      }
    }

    // Vitrage / Remplissage
    if (item.remplissage_id) {
      const remp = REMPLISSAGES.find(r => r.id === item.remplissage_id);
      const baseGlassPrice = remp ? remp.pricePerM2 : 55;
      vitrage_cost += surfaceM2 * baseGlassPrice;
      if (item.vitrage_type === 'double') {
        vitrage_cost += surfaceM2 * (baseGlassPrice * 0.85); // 2nd glass pane
      }
    }
    if (item.motif_id) {
      const mot = MOTIFS.find(m => m.id === item.motif_id);
      if (mot) vitrage_cost += surfaceM2 * mot.pricePerM2;
    }

    // Quincaillerie & Accessories Suppléments
    if (item.supplements && item.supplements.length > 0) {
      item.supplements.forEach(sup => {
        const sLower = sup.toLowerCase();
        if (sLower.includes('fast lock')) {
          const pts = parseInt(item.fast_lock_points || '1') || 1;
          accessoires_cost += pts * 22;
        } else if (sLower.includes('crémone')) {
          accessoires_cost += 32;
        } else if (sLower.includes('serrure') || sLower.includes('clé') || sLower.includes('cylindre')) {
          accessoires_cost += 48.600; // Serrure à clé multipoints
        } else if (sLower.includes('béquille') || sLower.includes('poignée')) {
          accessoires_cost += 28.000; // Poignée béquille double renforcée
        } else if (sLower.includes('groom') || sLower.includes('ferme-porte')) {
          accessoires_cost += 75.000; // Ferme-porte hydraulique
        } else if (sLower.includes('traverse')) {
          accessoires_cost += 28.000;
        }
      });
    }
    // Gaskets, corners, joints & fabrication consumables
    accessoires_cost += perimeterM * 4.5 + 15;
  }

  // Store Rideau (Volet Roulant)
  if (item.store_enabled) {
    const isExtrude = item.store_lame_type === 'lame extrud';
    let pricePerM2 = 95;
    if (isExtrude) pricePerM2 = 145;
    else if (item.store_lame_type === 'lame inj 55') pricePerM2 = 105;
    else if (item.store_lame_type === 'lame inj 45') pricePerM2 = 95;
    else if (item.store_lame_type === 'lame inj 42') pricePerM2 = 90;

    // Règle d'or marché : Minimum facturable 1.3 m² pour couvrir axe, roulements et embouts
    const storeSurf = Math.max(1.3, surfaceM2);
    const storeBase = storeSurf * pricePerM2;

    let coffreCost = 0;
    if (item.store_coffre && item.store_coffre !== '— Sans coffre —') {
      coffreCost += (w / 100) * 35;
    }
    if (item.store_axe70) coffreCost += 25;
    if (item.store_bloc_secu) coffreCost += (item.store_axe70 ? 42.012 : 31.212);
    if (item.store_renforce) coffreCost += 18;

    // Manœuvre & Motorisation
    let manoeuvreCost = 0;
    const manoeuvre = item.store_manoeuvre || 'moteur_filaire';

    if (manoeuvre === 'manuel_sangle') {
      manoeuvreCost += 25; // Sangle + boîtier enrouleur + guide sangle
    } else if (manoeuvre === 'tirage_direct') {
      manoeuvreCost += 30; // Ressort de compensation + serrure lame finale
    } else if (manoeuvre === 'moteur_filaire' || manoeuvre === 'moteur_radio') {
      let motorCost = 81.000; // Moteur 60kg standard par défaut

      if (item.store_moteur_id && item.store_moteur_id !== 'auto') {
        const found = STORE_MOTORS.find(m => m.id === item.store_moteur_id);
        if (found && found.prix_unitaire_ht > 0) {
          motorCost = found.prix_unitaire_ht;
        }
      } else {
        // Auto-sélection selon la surface du volet
        if (surfaceM2 <= 2.2) motorCost = 70.200; // Moteur 40 kg
        else if (surfaceM2 <= 4.2) motorCost = 81.000; // Moteur 60 kg
        else if (surfaceM2 <= 7.0) motorCost = 102.600; // Moteur 100 kg
        else motorCost = 194.400; // Moteur 160 kg
      }

      if (manoeuvre === 'moteur_filaire') {
        manoeuvreCost += motorCost + 15; // Moteur + Bouton inverseur mural
      } else {
        manoeuvreCost += motorCost + 45; // Moteur + Récepteur radio & Télécommande sans fil
      }
    }

    store_cost = storeBase + coffreCost + manoeuvreCost;
  }

  // Moustiquaire
  if (item.mousti_enabled) {
    const mH = parseFloat(String(item.mousti_hauteur || h)) || h;
    const mW = parseFloat(String(item.mousti_largeur || w)) || w;
    const mSurf = (mH * mW) / 10000;
    const mType = item.mousti_type || 'enroulable';

    if (mType === 'plissee') {
      // Moustiquaire plissée latérale (min 1.2 m²)
      mousti_cost = Math.max(90, Math.max(1.2, mSurf) * 110);
    } else if (mType === 'fixe') {
      // Moustiquaire cadre fixe clipsé (min 0.6 m²)
      mousti_cost = Math.max(25, Math.max(0.6, mSurf) * 40);
    } else if (mType === 'battante') {
      // Moustiquaire porte battante avec cadre et charnières (min 1.0 m²)
      mousti_cost = Math.max(75, Math.max(1.0, mSurf) * 90);
    } else {
      // Moustiquaire enroulable verticale standard (min 1.0 m²)
      mousti_cost = Math.max(45, Math.max(1.0, mSurf) * 65);
    }
  }

  // Margin application
  let marge_amount = 0;
  if (item.is_garde_corps) {
    if (marges.margeGcType === 'percent') {
      marge_amount = (article_cost + vitrage_cost + accessoires_cost) * ((marges.margeGcValue || 0) / 100);
    } else {
      marge_amount = marges.margeGcValue || 0;
    }
  } else {
    // Window / door margin
    const windowBase = article_cost + vitrage_cost + accessoires_cost;
    if (marges.margeType === 'percent') {
      marge_amount += windowBase * ((marges.margeValue || 0) / 100);
    } else {
      marge_amount += marges.margeValue || 0;
    }

    // Store margin
    if (store_cost > 0) {
      if (marges.margeStoreType === 'percent') {
        marge_amount += store_cost * ((marges.margeStoreValue || 0) / 100);
      } else {
        marge_amount += marges.margeStoreValue || 0;
      }
    }

    // Mousti margin
    if (mousti_cost > 0) {
      if (marges.margeMoustiType === 'percent') {
        marge_amount += mousti_cost * ((marges.margeMoustiValue || 0) / 100);
      } else {
        marge_amount += marges.margeMoustiValue || 0;
      }
    }
  }

  const brut_ht = article_cost + vitrage_cost + store_cost + mousti_cost + accessoires_cost;
  const net_ht = brut_ht + marge_amount;
  const total_ht = net_ht * qty;
  const total_ttc = total_ht * (1 + (marges.tva || 0) / 100);

  return {
    article_cost: Math.round(article_cost * 1000) / 1000,
    vitrage_cost: Math.round(vitrage_cost * 1000) / 1000,
    store_cost: Math.round(store_cost * 1000) / 1000,
    mousti_cost: Math.round(mousti_cost * 1000) / 1000,
    accessoires_cost: Math.round(accessoires_cost * 1000) / 1000,
    brut_ht: Math.round(brut_ht * 1000) / 1000,
    marge_amount: Math.round(marge_amount * 1000) / 1000,
    net_ht: Math.round(net_ht * 1000) / 1000,
    total_ht: Math.round(total_ht * 1000) / 1000,
    total_ttc: Math.round(total_ttc * 1000) / 1000
  };
}

export function calculateDevisTotals(
  items: DevisItemState[],
  articlesMap: Map<string, ArticleItem>,
  marges: {
    margeType: 'percent' | 'dt';
    margeValue: number;
    margeGcType: 'percent' | 'dt';
    margeGcValue: number;
    margeMoustiType: 'percent' | 'dt';
    margeMoustiValue: number;
    margeStoreType: 'percent' | 'dt';
    margeStoreValue: number;
    tva: number;
    frais_pose?: number;
    frais_transport?: number;
  }
): DevisTotals {
  let total_brut_ht = 0;
  let total_marge = 0;
  let items_total_ht = 0;

  const items_costs: CalculatedItemCost[] = [];

  items.forEach(item => {
    const cost = calculateItemCost(item, articlesMap, marges);
    items_costs.push(cost);
    total_brut_ht += cost.brut_ht * (item.quantity || 1);
    total_marge += cost.marge_amount * (item.quantity || 1);
    items_total_ht += cost.total_ht;
  });

  const frais_pose = Number(marges.frais_pose) || 0;
  const frais_transport = Number(marges.frais_transport) || 0;
  const total_ht = items_total_ht + frais_pose + frais_transport;

  const total_tva = total_ht * ((marges.tva || 0) / 100);
  const total_ttc = total_ht + total_tva;

  return {
    total_brut_ht: Math.round(total_brut_ht * 1000) / 1000,
    total_marge: Math.round(total_marge * 1000) / 1000,
    frais_pose: Math.round(frais_pose * 1000) / 1000,
    frais_transport: Math.round(frais_transport * 1000) / 1000,
    total_ht: Math.round(total_ht * 1000) / 1000,
    total_tva: Math.round(total_tva * 1000) / 1000,
    total_ttc: Math.round(total_ttc * 1000) / 1000,
    items_costs
  };
}
