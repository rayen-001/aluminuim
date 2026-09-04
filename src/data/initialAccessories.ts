export interface AccessoryItemDef {
  id: string;
  nom: string;
  categorie: 'assemblage' | 'roulement' | 'verrouillage' | 'joints' | 'moteurs_volets' | 'accessoires';
  prix_unitaire_ht: number;
  stock_qty?: number;
  unite: 'unité' | 'm' | 'paquet';
  description?: string;
}

export const INITIAL_ACCESSORIES: AccessoryItemDef[] = [
  // 1. Assemblage & Visserie
  { id: 'acc_angle_pareclose', nom: 'Angle de pareclose', categorie: 'assemblage', prix_unitaire_ht: 0.270, unite: 'unité', description: 'Angle de fixation pareclose' },
  { id: 'acc_equerre_40', nom: 'Équerre 40', categorie: 'assemblage', prix_unitaire_ht: 2.160, unite: 'unité', description: 'Équerre d’assemblage cadre série 40' },
  { id: 'acc_equerre_67', nom: 'Équerre 67', categorie: 'assemblage', prix_unitaire_ht: 1.944, unite: 'unité', description: 'Équerre d’assemblage cadre série 67' },
  { id: 'acc_vis_six_pans', nom: 'Vis à six pans 0.38/25', categorie: 'assemblage', prix_unitaire_ht: 0.216, unite: 'unité', description: 'Vis d’assemblage montants et traverses' },

  // 2. Roulement & Guidage
  { id: 'acc_galet', nom: 'Galet', categorie: 'roulement', prix_unitaire_ht: 2.700, unite: 'unité', description: 'Galet de roulement simple / double' },
  { id: 'acc_kit_67', nom: 'Kit 67', categorie: 'roulement', prix_unitaire_ht: 4.860, unite: 'unité', description: 'Kit complet de guidage et étanchéité série 67' },
  { id: 'acc_bouchon_112', nom: 'Bouchon 112', categorie: 'roulement', prix_unitaire_ht: 3.132, unite: 'unité', description: 'Bouchon de profilé et finition' },
  { id: 'acc_bouchon_central', nom: 'Bouchon central', categorie: 'roulement', prix_unitaire_ht: 0.378, unite: 'unité', description: 'Bouchon chicane centrale coulissant' },
  { id: 'acc_bouchon_lateral', nom: 'Bouchon latéral', categorie: 'roulement', prix_unitaire_ht: 0.378, unite: 'unité', description: 'Bouchon montant latéral ouvrant' },

  // 3. Verrouillage & Sécurité
  { id: 'acc_paumelle', nom: 'Paumelle', categorie: 'verrouillage', prix_unitaire_ht: 5.940, unite: 'unité', description: 'Paumelle de frappe pour ouvrant et porte' },
  { id: 'acc_cremone', nom: 'Crémone', categorie: 'verrouillage', prix_unitaire_ht: 15.876, unite: 'unité', description: 'Crémone pour fenêtre à frappe' },
  { id: 'acc_kit_cremone', nom: 'Kit crémone', categorie: 'verrouillage', prix_unitaire_ht: 7.344, unite: 'unité', description: 'Kit d’adaptation et tringles crémone' },
  { id: 'acc_loqueteau', nom: 'Loqueteau', categorie: 'verrouillage', prix_unitaire_ht: 3.780, unite: 'unité', description: 'Loqueteau à bascule pour soufflet et vasistas' },
  { id: 'acc_verrou_semi_fixe', nom: 'Verrouillage semi-fixe', categorie: 'verrouillage', prix_unitaire_ht: 7.020, unite: 'unité', description: 'Verrou haut/bas pour vantail semi-fixe' },
  { id: 'acc_fermeture', nom: 'Fermeture', categorie: 'verrouillage', prix_unitaire_ht: 10.260, unite: 'unité', description: 'Fermeture latérale coulissant' },
  { id: 'acc_gache_fermeture', nom: 'Gâche de fermeture', categorie: 'verrouillage', prix_unitaire_ht: 2.160, unite: 'unité', description: 'Gâche de verrouillage pour dormant' },
  { id: 'acc_gache', nom: 'Gâche', categorie: 'verrouillage', prix_unitaire_ht: 2.700, unite: 'unité', description: 'Gâche standard pour serrure et crémone' },
  { id: 'acc_serrure_montante', nom: 'Serrure montante', categorie: 'verrouillage', prix_unitaire_ht: 48.600, unite: 'unité', description: 'Serrure à clé multipoints pour porte' },
  { id: 'acc_poignee_bequille', nom: 'Poignée béquille', categorie: 'verrouillage', prix_unitaire_ht: 14.580, unite: 'unité', description: 'Paire de poignées béquilles pour porte' },

  // 4. Joints & Étanchéité
  { id: 'acc_joint_plat_035', nom: 'Joint plat 0.35', categorie: 'joints', prix_unitaire_ht: 0.702, unite: 'm', description: 'Joint plat EPDM pour maintien et étanchéité vitrage' },
  { id: 'acc_joint_brosse_76', nom: 'Joint brosse 7/6', categorie: 'joints', prix_unitaire_ht: 0.378, unite: 'm', description: 'Joint brosse d’étanchéité rails et chicanes' },
  { id: 'acc_joint_brosse_58', nom: 'Joint brosse 5/8', categorie: 'joints', prix_unitaire_ht: 0.378, unite: 'm', description: 'Joint brosse d’étanchéité fin pour dormant' },
  { id: 'acc_joint_220', nom: 'Joint 220', categorie: 'joints', prix_unitaire_ht: 0.324, unite: 'm', description: 'Joint d’étanchéité frappe / battement' },
  { id: 'acc_joint_242', nom: 'Joint 242', categorie: 'joints', prix_unitaire_ht: 0.324, unite: 'm', description: 'Joint de vitrage extérieur' },
  { id: 'acc_joint_247', nom: 'Joint 247', categorie: 'joints', prix_unitaire_ht: 0.324, unite: 'm', description: 'Joint d’étanchéité périphérique cadre' },

  // 5. Moteurs & Accessoires Volets Roulants
  { id: 'acc_moteur_40kg', nom: 'Moteur 40 kg', categorie: 'moteurs_volets', prix_unitaire_ht: 70.200, unite: 'unité', description: 'Moteur tubulaire 40 kg pour volet roulant' },
  { id: 'acc_moteur_60kg', nom: 'Moteur 60 kg', categorie: 'moteurs_volets', prix_unitaire_ht: 81.000, unite: 'unité', description: 'Moteur tubulaire 60 kg pour volet roulant' },
  { id: 'acc_moteur_100kg', nom: 'Moteur 100 kg', categorie: 'moteurs_volets', prix_unitaire_ht: 102.600, unite: 'unité', description: 'Moteur tubulaire 100 kg pour grande baie' },
  { id: 'acc_moteur_160kg', nom: 'Moteur 160 kg', categorie: 'moteurs_volets', prix_unitaire_ht: 194.400, unite: 'unité', description: 'Moteur tubulaire renforcé 160 kg' },
  { id: 'acc_moteur_250kg', nom: 'Moteur 250 kg', categorie: 'moteurs_volets', prix_unitaire_ht: 237.600, unite: 'unité', description: 'Moteur tubulaire industriel 250 kg' },
  { id: 'acc_moteur_special', nom: 'Moteur spécial', categorie: 'moteurs_volets', prix_unitaire_ht: 302.400, unite: 'unité', description: 'Moteur spécial haute puissance / débrayable' },
  { id: 'acc_bloc_secu_60', nom: 'Bloc de sécurité type 60', categorie: 'moteurs_volets', prix_unitaire_ht: 31.212, unite: 'unité', description: 'Verrou automatique anti-soulèvement pour axe 60' },
  { id: 'acc_bloc_secu_70', nom: 'Bloc de sécurité type 70', categorie: 'moteurs_volets', prix_unitaire_ht: 42.012, unite: 'unité', description: 'Verrou automatique anti-soulèvement pour axe 70' },
  { id: 'acc_rallonge_axe_60', nom: 'Rallonge axe type 60', categorie: 'moteurs_volets', prix_unitaire_ht: 3.240, unite: 'unité', description: 'Embout télescopique pour tube d’enroulement 60' },
  { id: 'acc_rallonge_axe_70', nom: 'Rallonge axe type 70', categorie: 'moteurs_volets', prix_unitaire_ht: 5.940, unite: 'unité', description: 'Embout télescopique pour tube d’enroulement 70' },
  { id: 'acc_sangle_gm', nom: 'Sangle GM', categorie: 'moteurs_volets', prix_unitaire_ht: 2.160, unite: 'unité', description: 'Sangle de manœuvre grand modèle avec enrouleur' },
  { id: 'acc_sangle_pm', nom: 'Sangle PM', categorie: 'moteurs_volets', prix_unitaire_ht: 1.620, unite: 'unité', description: 'Sangle de manœuvre petit modèle' },
  { id: 'acc_bouchon_lame_55', nom: 'Bouchon lame 55', categorie: 'moteurs_volets', prix_unitaire_ht: 0.216, unite: 'unité', description: 'Embout latéral pour lame de volet 55 mm' },
  { id: 'acc_bouchon_lame_45', nom: 'Bouchon lame 45', categorie: 'moteurs_volets', prix_unitaire_ht: 0.162, unite: 'unité', description: 'Embout latéral pour lame de volet 45 mm' },
  { id: 'acc_bouchon_lame_extrude', nom: 'Bouchon lame extrudée', categorie: 'moteurs_volets', prix_unitaire_ht: 0.378, unite: 'unité', description: 'Embout pour lame aluminium extrudé haute résistance' }
];
