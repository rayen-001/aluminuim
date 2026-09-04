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

  const dormantDefault = isTPR ? (isCoulissant ? '67101' : '40100') : (isAluco ? (isCoulissant ? 'CSQ 103' : 'FSQ 102') : (isCoulissant ? 'AE_67101' : 'AE_40100'));
  const dormantOptions = isTPR ? (isCoulissant ? ['67101', '67103', '67110', '67203'] : ['40100', '40102', '40148', '40150', '40165', '40402', '40405', '40407', '40408'])
    : (isAluco ? (isCoulissant ? ['CSQ 103', 'CSQ 203', 'CSQ 210'] : ['FSQ 102', 'FSQ 104'])
    : (isCoulissant ? ['AE_67101', 'AE_67103', 'AE_EX60 2114'] : ['AE_40100', 'AE_40102', 'AE_40402']));

  const ouvrantDefault = isTPR ? '40401' : (isAluco ? 'FSQ 104' : 'AE_40401');
  const ouvrantOptions = isTPR ? ['40401', '40150', '40151', '40403', '40404'] : (isAluco ? ['FSQ 104', 'FSQ 102'] : ['AE_40401', 'AE_40150']);

  const parcloseSimple = isTPR ? { default: '40110', options: ['40110', '40111', '40139', '40166', '40168', '80116', '67207'] } : (isAluco ? { default: 'CSQ 114', options: ['CSQ 114'] } : { default: 'AE_40110', options: ['AE_40110', 'AE_40139'] });
  const parcloseDouble = isTPR ? { default: '40129', options: ['40129', '40135', '40410', '40411', '80116', '67207'] } : (isAluco ? { default: 'CSQ 124', options: ['CSQ 124', 'CSQ 125'] } : { default: 'AE_40129', options: ['AE_40129'] });

  const latDefault = isTPR ? '67104' : (isAluco ? 'CSQ 104' : 'AE_67104');
  const latOptions = isTPR ? ['67104', '67108', '67105', '67107', '67109', '67112', '67114', '67115'] : (isAluco ? ['CSQ 104', 'CSQ 108'] : ['AE_67104', 'AE_Ex60 2214']);

  const cenDefault = isTPR ? '67105' : (isAluco ? 'CSQ 105' : 'AE_67105');
  const cenOptions = isTPR ? ['67105', '67107', '67104', '67108', '67109', '67112', '67114', '67115', '67117'] : (isAluco ? ['CSQ 105', 'CSQ 107'] : ['AE_67105', 'AE_Ex60 2213']);

  const standardComposition: ProductTypeComposition = {
    coulissant: isCoulissant,
    ouvrant: { default: ouvrantDefault, options: ouvrantOptions, eliminate_parclose: ['40404'] },
    dormant: { default: dormantDefault, options: dormantOptions },
    traverse: { default: isTPR ? '40104' : 'CSQ 106', options: isTPR ? ['40104', '40121', '40135', '40156'] : ['CSQ 106'] },
    parclose: { simple: parcloseSimple, double: parcloseDouble },
    meneau: { default: isTPR ? '40155' : 'FSQ 104', options: isTPR ? ['40155', '40156'] : ['FSQ 104'] },
    couvre_joint: { default: isTPR ? '40133' : 'CSQ 302', options: isTPR ? ['40133', '40402'] : ['CSQ 302', 'CSQ 301'], triggers: ['40100', '40102', '67101', '67103', 'CSQ 103', 'AE_40100', 'AE_67101'] },
    lateral: isCoulissant ? { default: latDefault, count: 2, options: latOptions } : undefined,
    central: isCoulissant ? { default: cenDefault, count: 2, options: cenOptions } : undefined,
    dormant_composite: isCoulissant ? {
      '67101': ['— Sans seuil —', '67201', '67202', '67205', '67207'],
      '67103': ['— Sans seuil —', '67203', '67204', '67205', '67207'],
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
        options: { vitrage: ['simple', 'double'], serrure: ['Crémone', 'Serrure montant'], supplements: ['Fast Lock', 'Traverse'] }
      },
      {
        id: `${familyId}_c2`, family_id: familyId,
        name: `Fenêtre coulissante en 3 vantaux`,
        category: 'coulissant',
        composition: { ...standardComposition, central: { default: cenDefault, count: 4, options: cenOptions } },
        options: { vitrage: ['simple', 'double'], serrure: ['Crémone', 'Serrure montant'], supplements: ['Fast Lock', 'Traverse'] }
      },
      {
        id: `${familyId}_c3`, family_id: familyId,
        name: `Fenêtre coulissante en 4 vantaux`,
        category: 'coulissant',
        composition: { ...standardComposition, central: { default: cenDefault, count: 6, options: cenOptions } },
        options: { vitrage: ['simple', 'double'], serrure: ['Crémone', 'Serrure montant'], supplements: ['Fast Lock', 'Traverse'] }
      },
      {
        id: `${familyId}_c4`, family_id: familyId,
        name: `Porte coulissante en 2 vantaux`,
        category: 'porte',
        composition: { ...standardComposition, central: { default: cenDefault, count: 2, options: cenOptions } },
        options: { vitrage: ['simple', 'double'], serrure: ['Serrure montant', 'Serrure traverse', 'Crémone'], supplements: ['Fast Lock', 'Traverse'] }
      },
      {
        id: `${familyId}_c5`, family_id: familyId,
        name: `Porte coulissante en 3 vantaux`,
        category: 'porte',
        composition: { ...standardComposition, central: { default: cenDefault, count: 4, options: cenOptions } },
        options: { vitrage: ['simple', 'double'], serrure: ['Serrure montant', 'Serrure traverse', 'Crémone'], supplements: ['Fast Lock', 'Traverse'] }
      },
      {
        id: `${familyId}_c6`, family_id: familyId,
        name: `Porte coulissante en 4 vantaux`,
        category: 'porte',
        composition: { ...standardComposition, central: { default: cenDefault, count: 6, options: cenOptions } },
        options: { vitrage: ['simple', 'double'], serrure: ['Serrure montant', 'Serrure traverse', 'Crémone'], supplements: ['Fast Lock', 'Traverse'] }
      },
      {
        id: `${familyId}_c7`, family_id: familyId,
        name: `Partie fixe coulissante droite`,
        category: 'coulissant',
        options: { is_partie_fix: true, partie_fix_label: 'Droite', partie_fix_def_dim: '40' }
      },
      {
        id: `${familyId}_c8`, family_id: familyId,
        name: `Partie fixe coulissante gauche`,
        category: 'coulissant',
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
      options: { vitrage: ['simple', 'double'] }
    }
  ];
}
