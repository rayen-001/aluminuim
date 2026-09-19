export interface FamilyDef {
  id: string;
  name: string;
  group: 'TPR' | 'ALUCO' | 'ALU ECO' | 'AUTRES';
  drawType: 'francaise' | 'coulissante' | 'fixe' | 'partie_fix' | 'garde_corps' | 'store' | 'mousti';
}

export interface ProductTypeComposition {
  coulissant?: boolean;
  ouvrant: { default: string; options: string[]; eliminate_parclose?: string[] };
  dormant: { default: string; options: string[] };
  traverse: { default: string; options: string[] };
  parclose: {
    simple: { default: string; options: string[] };
    double: { default: string; options: string[] };
  };
  meneau: { default: string; options: string[] };
  couvre_joint: { default: string; options: string[]; triggers: string[] };
  lateral?: { default: string; count: number; options: string[] };
  central?: { default: string; count: number; options: string[] };
  dormant_composite?: Record<string, string[]>;
}

export interface ProductTypeDef {
  id: string;
  family_id: string;
  name: string;
  display_name?: string;
  category: 'fenetre' | 'porte' | 'coulissant' | 'chassi_fix' | 'garde_corps' | 'standalone_store' | 'standalone_mousti';
  has_cremone?: boolean;
  composition?: ProductTypeComposition;
  defaultProfiles?: {
    dormant?: string;
    ouvrant?: string;
    parclose?: string;
    lateral?: string;
    central?: string;
    chicane?: string;
    couvreJoint?: string;
    couvre_joint?: string;
    meneau?: string;
    traverse?: string;
    seuil?: string;
  };
  optionProfiles?: {
    dormant?: string[];
    dormants?: string[];
    ouvrant?: string[];
    ouvrants?: string[];
    parclose?: string[];
    parcloses?: string[];
    lateral?: string[];
    lateraux?: string[];
    central?: string[];
    centraux?: string[];
    chicane?: string[];
    chicanes?: string[];
    couvreJoint?: string[];
    couvre_joints?: string[];
    meneau?: string[];
    meneaux?: string[];
    traverse?: string[];
    traverses?: string[];
    seuil?: string[];
    seuils?: string[];
  };
  options?: {
    vitrage?: string[];
    ouverture?: string[];
    serrure?: string[];
    supplements?: string[];
    is_partie_fix?: boolean;
    partie_fix_label?: string;
    partie_fix_def_dim?: string;
  };
}

export const FAMILIES: FamilyDef[] = [
  { id: '50', name: 'A la française TPR S40', group: 'TPR', drawType: 'francaise' },
  { id: '51', name: 'A la française TPR EX45', group: 'TPR', drawType: 'francaise' },
  { id: '60', name: 'Coulissante TPR S67', group: 'TPR', drawType: 'coulissante' },
  { id: '61', name: 'Coulissante TPR EX60', group: 'TPR', drawType: 'coulissante' },
  { id: '52', name: 'A la française Aluco SQ40', group: 'ALUCO', drawType: 'francaise' },
  { id: '62', name: 'Coulissante Aluco Square 67', group: 'ALUCO', drawType: 'coulissante' },
  { id: '63', name: 'A la française Alu Eco S40', group: 'ALU ECO', drawType: 'francaise' },
  { id: '64', name: 'A la française Alu Eco EX45', group: 'ALU ECO', drawType: 'francaise' },
  { id: '65', name: 'Coulissante Alu Eco S67', group: 'ALU ECO', drawType: 'coulissante' },
  { id: '66', name: 'Coulissante Alu Eco EX60', group: 'ALU ECO', drawType: 'coulissante' },
  { id: '46', name: 'Garde Corps', group: 'AUTRES', drawType: 'garde_corps' },
  { id: '67', name: 'Store Rideaux', group: 'AUTRES', drawType: 'store' },
  { id: '68', name: 'Moustiquaire', group: 'AUTRES', drawType: 'mousti' }
];

export const REMPLISSAGES = [
  { id: '406873', label: 'Clair de 6 mm', pricePerM2: 55 },
  { id: '406874', label: 'Clair de 8 mm', pricePerM2: 75 },
  { id: '406882', label: "Peaux d'orange", pricePerM2: 60 },
  { id: '406884', label: 'Planche 11026', pricePerM2: 85 },
  { id: '406883', label: 'Planche PVC', pricePerM2: 45 },
  { id: '406885', label: 'Plaque MDF', pricePerM2: 40 },
  { id: '406886', label: 'Plaque plexi policarbonate', pricePerM2: 95 },
  { id: '406877', label: 'Solarit bronze de 6 mm', pricePerM2: 70 },
  { id: '406876', label: 'Solarit clair de 6 mm', pricePerM2: 65 },
  { id: '406878', label: 'Solarit dark bronze de 6 mm', pricePerM2: 78 },
  { id: '406875', label: 'Stop sol clair super silver AGC', pricePerM2: 90 },
  { id: '406881', label: 'Tenta sol bleu 6 mm', pricePerM2: 72 },
  { id: '406880', label: 'Tenta sol bronze 6 mm', pricePerM2: 72 },
  { id: '406879', label: 'Tenta sol clair 6 mm classique', pricePerM2: 68 }
];

export const MOTIFS = [
  { id: '406890', label: 'Double vitrage avec Gaz', pricePerM2: 45 },
  { id: '406888', label: 'Facon sablage bonde', pricePerM2: 25 },
  { id: '406887', label: 'Facon sablage total', pricePerM2: 35 },
  { id: '406891', label: 'Feuilleté', pricePerM2: 55 },
  { id: '406889', label: 'Sécurité', pricePerM2: 65 }
];

export const CHASSI_FIX_REFS_DEFAULT = {
  cadre: ['40100', '40102', '40148', '40165', '40402', '40407', '40408'],
  socle: ['40154', '40121', '40100', '40102'],
  montant: ['40155', '40156', '40121', '40104'],
  traverse: ['40104', '40121', '40156']
};

export const CHASSI_FIX_REFS_ALUCO = {
  cadre: ['FSQ 102', 'FSQ 104', 'CSQ 103'],
  socle: ['FSQ 104', 'CSQ 103'],
  montant: ['FSQ 104', 'FSQ 107'],
  traverse: ['FSQ 104', 'FSQ 108']
};

export const CHASSI_FIX_REFS_ALUECO = {
  cadre: ['AE_40100', 'AE_40102', 'AE_40402'],
  socle: ['AE_40154', 'AE_40121'],
  montant: ['AE_40155', 'AE_40156'],
  traverse: ['AE_40104', 'AE_40121']
};

// Generates the comprehensive standard product types catalog
export function getProductTypesForFamily(familyId: string): ProductTypeDef[] {
  const fam = FAMILIES.find(f => f.id === familyId);
  if (!fam) return [];

  if (familyId === '46') {
    // Garde corps
    return [
      { id: 'gc_1', family_id: '46', name: 'Garde corps Rond Linaire', category: 'garde_corps' },
      { id: 'gc_2', family_id: '46', name: 'Garde corps Rond Vitré', category: 'garde_corps' },
      { id: 'gc_3', family_id: '46', name: 'Garde corps Corpsen', category: 'garde_corps' },
      { id: 'gc_4', family_id: '46', name: 'Garde corps Corpsen Sabot', category: 'garde_corps' },
      { id: 'gc_5', family_id: '46', name: 'Pass Main', category: 'garde_corps' }
    ];
  }

  if (familyId === '67') {
    return [{ id: 'store_1', family_id: '67', name: 'Store Rideau Autonome', category: 'standalone_store' }];
  }

  if (familyId === '68') {
    return [{ id: 'mousti_1', family_id: '68', name: 'Moustiquaire Autonome', category: 'standalone_mousti' }];
  }

  const isTPR = fam.group === 'TPR';
  const isAluco = fam.group === 'ALUCO';
  const isAluEco = fam.group === 'ALU ECO';
  const isCoulissant = fam.drawType === 'coulissante';

  const isEX45 = familyId === '51' || familyId === '64';
  const isEX60 = familyId === '61' || familyId === '66';

  let dormantDefault = '40402';
  let dormantOptions = ['40402', '40100', '40102', '40148', '40165'];
  let ouvrantDefault = '40401';
  let ouvrantOptions = ['40401', '40404', '40150', '40403', '40151'];
  let parcloseSimple = { default: '40110', options: ['40110', '40111', '40139', '40166'] };
  let parcloseDouble = { default: '40129', options: ['40129', '40135', '40410', '40411'] };
  let meneauDefault = '40121';
  let meneauOptions = ['40121', '40156', '40154', '40155', '40104'];
  let couvreJointDefault = '40103';
  let couvreJointOptions = ['40103', '40108', '40167'];
  let traverseDefault = '40104';
  let traverseOptions = ['40104', '40121', '40135', '40156'];
  let latDefault = '67104';
  let latOptions = ['67104', '67108', '67204', '67205'];
  let cenDefault = '67105';
  let cenOptions = ['67105', '67107'];

  if (isCoulissant) {
    if (isEX60) {
      if (isAluEco) {
        dormantDefault = 'AE_EX60 2114';
        dormantOptions = ['AE_EX60 2114', 'AE_EX60 2115', 'AE_EX60 2116', 'AE_EX60 2117', 'AE_EX60 2118', 'AE_EX60 2119', 'AE_EX60 2121', 'AE_EX60 2122', 'AE_EX60 2125', 'AE_EX60 2126'];
        latDefault = 'AE_Ex60 2211';
        latOptions = ['AE_Ex60 2211', 'AE_Ex60 2214', 'AE_EX60 2218', 'AE_EX60 2221'];
        cenDefault = 'AE_Ex60 2212';
        cenOptions = ['AE_Ex60 2212', 'AE_Ex60 2213', 'AE_EX60 2216', 'AE_EX60 2217'];
        traverseDefault = 'AE_Ex60 2210';
        traverseOptions = ['AE_Ex60 2210', 'AE_Ex60 2215'];
        parcloseSimple = { default: 'AE_Ex60 2312', options: ['AE_Ex60 2312', 'AE_80116', '67207'] };
        parcloseDouble = { default: '67207', options: ['67207', 'AE_Ex60 2312'] };
      } else {
        dormantDefault = 'EX60 2114';
        dormantOptions = ['EX60 2114', 'EX60 2115', 'EX60 2116', 'EX60 2117'];
        latDefault = 'EX60 2211';
        latOptions = ['EX60 2211', 'EX60 2214', 'EX60 2218', 'EX60 2221'];
        cenDefault = 'EX60 2212';
        cenOptions = ['EX60 2212', 'EX60 2213', 'EX60 2216', 'EX60 2217'];
        traverseDefault = 'EX60 2210';
        traverseOptions = ['EX60 2210', 'EX60 2215'];
        parcloseSimple = { default: 'EX60 2312', options: ['EX60 2312', '80116', '67207'] };
        parcloseDouble = { default: '67207', options: ['67207', 'EX60 2312'] };
      }
    } else if (isAluco) {
      dormantDefault = 'CSQ 103';
      dormantOptions = ['CSQ 103', 'CSQ 203', 'CSQ 210'];
      latDefault = 'CSQ 104';
      latOptions = ['CSQ 104', 'CSQ 108'];
      cenDefault = 'CSQ 105';
      cenOptions = ['CSQ 105', 'CSQ 107'];
      traverseDefault = 'CSQ 106';
      traverseOptions = ['CSQ 106'];
      parcloseSimple = { default: 'CSQ 114', options: ['CSQ 114'] };
      parcloseDouble = { default: 'CSQ 114', options: ['CSQ 114'] };
      couvreJointDefault = 'CSQ 302';
      couvreJointOptions = ['CSQ 302', 'CSQ 301'];
    } else if (isAluEco) {
      dormantDefault = 'AE_67101';
      dormantOptions = ['AE_67101', 'AE_67103'];
      latDefault = 'AE_67104';
      latOptions = ['AE_67104', 'AE_67108'];
      cenDefault = 'AE_67105';
      cenOptions = ['AE_67105', 'AE_67107'];
      traverseDefault = 'AE_67106';
      traverseOptions = ['AE_67106'];
      parcloseSimple = { default: 'AE_40110', options: ['AE_40110', '80116'] };
      parcloseDouble = { default: '80116', options: ['80116', 'AE_40110'] };
    } else {
      // TPR S67
      dormantDefault = '67103';
      dormantOptions = ['67103', '67101', '67110', '67203'];
      latDefault = '67104';
      latOptions = ['67104', '67108', '67204', '67205'];
      cenDefault = '67105';
      cenOptions = ['67105', '67107'];
      traverseDefault = '67106';
      traverseOptions = ['67106'];
      parcloseSimple = { default: '80116', options: ['80116', '67207'] };
      parcloseDouble = { default: '67207', options: ['67207', '80116'] };
    }
  } else {
    // Frappe (À la française)
    if (isEX45) {
      if (isAluEco) {
        dormantDefault = 'AE_EX45 1123';
        dormantOptions = ['AE_EX45 1123', 'AE_EX45 1125'];
        ouvrantDefault = 'AE_EX45 1210';
        ouvrantOptions = ['AE_EX45 1210', 'AE_EX45 1218'];
        parcloseSimple = { default: 'AE_EX45 1312', options: ['AE_EX45 1312', 'AE_40110'] };
        parcloseDouble = { default: 'AE_EX45 1312', options: ['AE_EX45 1312', 'AE_40129'] };
        meneauDefault = 'AE_EX45 1130';
        meneauOptions = ['AE_EX45 1130'];
        couvreJointDefault = 'AE_40103';
        couvreJointOptions = ['AE_40103', 'AE_40108'];
      } else {
        dormantDefault = 'EX45 1123';
        dormantOptions = ['EX45 1123', 'EX45 1125', 'EX45 1120'];
        ouvrantDefault = 'EX45 1210';
        ouvrantOptions = ['EX45 1210', 'EX45 1212', 'EX45 1215', 'EX45 1218'];
        parcloseSimple = { default: 'EX45 1312', options: ['EX45 1312', 'EX45 1310', 'EX45 1314'] };
        parcloseDouble = { default: 'EX45 1320', options: ['EX45 1320', 'EX45 1310'] };
        meneauDefault = 'EX45 1130';
        meneauOptions = ['EX45 1130', 'EX45 1132'];
        couvreJointDefault = '40108';
        couvreJointOptions = ['40108', '40103', 'TW60 1314'];
      }
    } else if (isAluco) {
      dormantDefault = 'FSQ 124';
      dormantOptions = ['FSQ 124', 'FSQ 408', 'FSQ 402', 'FSQ 100', 'FSQ 150'];
      ouvrantDefault = 'FSQ 104';
      ouvrantOptions = ['FSQ 104', 'FSQ 102', 'FSQ 401', 'FSQ 403', 'FSQ 407'];
      parcloseSimple = { default: 'FSQ 111', options: ['FSQ 111', 'FSQ 112', 'FSQ 139'] };
      parcloseDouble = { default: 'FSQ 112', options: ['FSQ 112', 'FSQ 111'] };
      meneauDefault = 'FSQ 121';
      meneauOptions = ['FSQ 121', 'FSQ 107', 'FSQ 108'];
      couvreJointDefault = 'CJ 101';
      couvreJointOptions = ['CJ 101', 'CJ 102'];
    } else if (isAluEco) {
      dormantDefault = 'AE_40402';
      dormantOptions = ['AE_40402', 'AE_40100', 'AE_40102'];
      ouvrantDefault = 'AE_40401';
      ouvrantOptions = ['AE_40401', 'AE_40404', 'AE_40150'];
      parcloseSimple = { default: 'AE_40110', options: ['AE_40110', 'AE_40139'] };
      parcloseDouble = { default: 'AE_40129', options: ['AE_40129'] };
      meneauDefault = 'AE_40121';
      meneauOptions = ['AE_40121'];
      couvreJointDefault = 'AE_40103';
      couvreJointOptions = ['AE_40103'];
    }
  }

  const seuilDefault = isCoulissant ? (isEX60 ? (isAluEco ? 'AE_80116' : '80116') : isAluco ? 'CSQ 116' : '67201') : '';
  const seuilOptions = isCoulissant ? (isEX60 ? (isAluEco ? ['AE_80116', '— Sans seuil —'] : ['80116', '— Sans seuil —']) : isAluco ? ['CSQ 116', '— Sans seuil —'] : ['67201', '67202', '67203', '67205', 'CSQ 116', 'AE_80116', '— Sans seuil —']) : [];

  const defaultProfiles = {
    dormant: dormantDefault,
    ouvrant: ouvrantDefault,
    parclose: parcloseSimple.default,
    lateral: latDefault,
    central: cenDefault,
    chicane: cenDefault,
    couvreJoint: couvreJointDefault,
    couvre_joint: couvreJointDefault,
    meneau: meneauDefault,
    traverse: traverseDefault,
    seuil: seuilDefault,
  };

  const optionProfiles = {
    dormant: dormantOptions,
    dormants: dormantOptions,
    ouvrant: ouvrantOptions,
    ouvrants: ouvrantOptions,
    parclose: parcloseSimple.options,
    parcloses: parcloseSimple.options,
    lateral: latOptions,
    lateraux: latOptions,
    central: cenOptions,
    centraux: cenOptions,
    chicane: cenOptions,
    chicanes: cenOptions,
    couvreJoint: couvreJointOptions,
    couvre_joints: couvreJointOptions,
    meneau: meneauOptions,
    meneaux: meneauOptions,
    traverse: traverseOptions,
    traverses: traverseOptions,
    seuil: seuilOptions,
    seuils: seuilOptions,
  };

  const standardComposition: ProductTypeComposition = {
    coulissant: isCoulissant,
    ouvrant: { default: ouvrantDefault, options: ouvrantOptions, eliminate_parclose: ['40404', '40405', '40406', 'AE_40404'] },
    dormant: { default: dormantDefault, options: dormantOptions },
    traverse: { default: traverseDefault, options: traverseOptions },
    parclose: { simple: parcloseSimple, double: parcloseDouble },
    meneau: { default: meneauDefault, options: meneauOptions },
    couvre_joint: { default: couvreJointDefault, options: couvreJointOptions, triggers: ['40100', '40102', '67101', '67103', 'CSQ 103', 'AE_40100', 'AE_67101', 'EX45 1125'] },
    lateral: isCoulissant ? { default: latDefault, count: 2, options: latOptions } : undefined,
    central: isCoulissant ? { default: cenDefault, count: 2, options: cenOptions } : undefined,
    dormant_composite: isCoulissant ? {
      '67101': ['— Sans seuil —', '67201', '67202', '67203', '67205'],
      '67103': ['— Sans seuil —', '67203', '67204', '67205'],
      'CSQ 103': ['— Sans seuil —', 'CSQ 116']
    } : undefined
  };

  if (isCoulissant) {
    return [
      {
        id: `${familyId}_c1`, family_id: familyId,
        name: `Fenêtre coulissante en 2 vantaux`,
        category: 'coulissant',
        composition: { ...standardComposition, central: { default: cenDefault, count: 2, options: cenOptions } },
        defaultProfiles,
        optionProfiles,
        options: { vitrage: ['simple', 'double'], serrure: ['Crémone', 'Serrure montant'], supplements: ['Fast Lock', 'Traverse'] }
      },
      {
        id: `${familyId}_c2`, family_id: familyId,
        name: `Fenêtre coulissante en 3 vantaux`,
        category: 'coulissant',
        composition: { ...standardComposition, central: { default: cenDefault, count: 4, options: cenOptions } },
        defaultProfiles,
        optionProfiles,
        options: { vitrage: ['simple', 'double'], serrure: ['Crémone', 'Serrure montant'], supplements: ['Fast Lock', 'Traverse'] }
      },
      {
        id: `${familyId}_c3`, family_id: familyId,
        name: `Fenêtre coulissante en 4 vantaux`,
        category: 'coulissant',
        composition: { ...standardComposition, central: { default: cenDefault, count: 6, options: cenOptions } },
        defaultProfiles,
        optionProfiles,
        options: { vitrage: ['simple', 'double'], serrure: ['Crémone', 'Serrure montant'], supplements: ['Fast Lock', 'Traverse'] }
      },
      {
        id: `${familyId}_c4`, family_id: familyId,
        name: `Porte coulissante en 2 vantaux`,
        category: 'porte',
        composition: { ...standardComposition, central: { default: cenDefault, count: 2, options: cenOptions } },
        defaultProfiles,
        optionProfiles,
        options: { vitrage: ['simple', 'double'], serrure: ['Serrure montant', 'Serrure traverse', 'Crémone'], supplements: ['Fast Lock', 'Traverse'] }
      },
      {
        id: `${familyId}_c5`, family_id: familyId,
        name: `Porte coulissante en 3 vantaux`,
        category: 'porte',
        composition: { ...standardComposition, central: { default: cenDefault, count: 4, options: cenOptions } },
        defaultProfiles,
        optionProfiles,
        options: { vitrage: ['simple', 'double'], serrure: ['Serrure montant', 'Serrure traverse', 'Crémone'], supplements: ['Fast Lock', 'Traverse'] }
      },
      {
        id: `${familyId}_c6`, family_id: familyId,
        name: `Porte coulissante en 4 vantaux`,
        category: 'porte',
        composition: { ...standardComposition, central: { default: cenDefault, count: 6, options: cenOptions } },
        defaultProfiles,
        optionProfiles,
        options: { vitrage: ['simple', 'double'], serrure: ['Serrure montant', 'Serrure traverse', 'Crémone'], supplements: ['Fast Lock', 'Traverse'] }
      },
      {
        id: `${familyId}_c7`, family_id: familyId,
        name: `Partie fixe coulissante droite`,
        category: 'coulissant',
        defaultProfiles,
        optionProfiles,
        options: { is_partie_fix: true, partie_fix_label: 'Droite', partie_fix_def_dim: '40' }
      },
      {
        id: `${familyId}_c8`, family_id: familyId,
        name: `Partie fixe coulissante gauche`,
        category: 'coulissant',
        defaultProfiles,
        optionProfiles,
        options: { is_partie_fix: true, partie_fix_label: 'Gauche', partie_fix_def_dim: '40' }
      }
    ];
  }

  // Frappe (À la française)
  return [
    {
      id: `${familyId}_f1`, family_id: familyId,
      name: `Fenêtre à la française en 1 vantail`,
      category: 'fenetre',
      has_cremone: true,
      composition: standardComposition,
      defaultProfiles,
      optionProfiles,
      options: {
        vitrage: ['simple', 'double'],
        ouverture: ['Française', 'Osilobattante', 'Basculante'],
        serrure: ['Crémone'],
        supplements: ['Fast Lock']
      }
    },
    {
      id: `${familyId}_f2`, family_id: familyId,
      name: `Fenêtre à la française en 2 vantaux`,
      category: 'fenetre',
      has_cremone: true,
      composition: standardComposition,
      defaultProfiles,
      optionProfiles,
      options: {
        vitrage: ['simple', 'double'],
        ouverture: ['Française', 'Osilobattante'],
        serrure: ['Crémone'],
        supplements: ['Fast Lock']
      }
    },
    {
      id: `${familyId}_f3`, family_id: familyId,
      name: `Fenêtre à la française en 3 vantaux`,
      category: 'fenetre',
      has_cremone: true,
      composition: standardComposition,
      defaultProfiles,
      optionProfiles,
      options: {
        vitrage: ['simple', 'double'],
        ouverture: ['Française'],
        serrure: ['Crémone'],
        supplements: ['Fast Lock']
      }
    },
    {
      id: `${familyId}_f4`, family_id: familyId,
      name: `Porte à la française en 1 vantail`,
      category: 'porte',
      has_cremone: false,
      composition: standardComposition,
      defaultProfiles,
      optionProfiles,
      options: {
        vitrage: ['simple', 'double'],
        serrure: ['Serrure montant', 'Serrure traverse', 'Crémone'],
        supplements: ['Traverse', 'Fast Lock']
      }
    },
    {
      id: `${familyId}_f5`, family_id: familyId,
      name: `Porte à la française en 2 vantaux`,
      category: 'porte',
      has_cremone: false,
      composition: standardComposition,
      defaultProfiles,
      optionProfiles,
      options: {
        vitrage: ['simple', 'double'],
        serrure: ['Serrure montant', 'Serrure traverse', 'Crémone'],
        supplements: ['Traverse', 'Fast Lock']
      }
    },
    {
      id: `${familyId}_f6`, family_id: familyId,
      name: `Châssis Fixe`,
      category: 'chassi_fix',
      composition: standardComposition,
      defaultProfiles,
      optionProfiles,
      options: { vitrage: ['simple', 'double'] }
    }
  ];
}
