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
  { id: 'acc_equerre_40', nom: 'Équerre 40', categorie: 'assemblage', prix_unitaire_ht: 2.160, unite: 'unité', description: 'Équerre d’assemblage cadre série 40 (36440FR)' },
  { id: 'acc_equerre_67', nom: 'Équerre 67', categorie: 'assemblage', prix_unitaire_ht: 1.944, unite: 'unité', description: 'Équerre d’assemblage cadre série 67 (13622CO)' },
  { id: 'acc_vis_six_pans', nom: 'Vis à six pans 4.8×25 SIP', categorie: 'assemblage', prix_unitaire_ht: 0.216, unite: 'unité', description: 'Vis d’assemblage montants et traverses' },
  { id: 'acc_vis_chevilles', nom: 'Vis et chevilles de pose', categorie: 'assemblage', prix_unitaire_ht: 0.160, unite: 'unité', description: 'Fixation complète coulisses et maçonnerie' },
  { id: 'acc_selicomne', nom: 'Sélicomne (Cartouche étanchéité)', categorie: 'assemblage', prix_unitaire_ht: 7.250, unite: 'unité', description: 'Mastic silicone neutre pour étanchéité caisson et coulisses' },

  // 2. Roulement & Guidage
  { id: 'acc_galet', nom: 'Galet réglable double', categorie: 'roulement', prix_unitaire_ht: 2.700, unite: 'unité', description: 'Galet de roulement double réglable (0312000)' },
  { id: 'acc_kit_67', nom: 'Kit 67 complet', categorie: 'roulement', prix_unitaire_ht: 4.860, unite: 'unité', description: 'Kit complet de guidage et étanchéité série 67' },
  { id: 'acc_bouchon_112', nom: 'Bouchon 112', categorie: 'roulement', prix_unitaire_ht: 3.132, unite: 'unité', description: 'Bouchon de battement central et finition' },
  { id: 'acc_bouchon_central', nom: 'Bouchon central', categorie: 'roulement', prix_unitaire_ht: 0.378, unite: 'unité', description: 'Bouchon chicane centrale coulissant' },
  { id: 'acc_bouchon_lateral', nom: 'Bouchon latéral', categorie: 'roulement', prix_unitaire_ht: 0.378, unite: 'unité', description: 'Bouchon montant latéral ouvrant' },
  { id: 'acc_busette_eau', nom: 'Busette d’évacuation d’eau', categorie: 'roulement', prix_unitaire_ht: 0.378, unite: 'unité', description: 'Clapet de drainage dormant extérieur' },

  // 3. Verrouillage, Crémones & Serrures
  { id: 'acc_paumelle', nom: 'Paumelle de fenêtre', categorie: 'verrouillage', prix_unitaire_ht: 5.940, unite: 'unité', description: 'Paumelle de frappe pour ouvrant battant' },
  { id: 'acc_paumelle_bridge', nom: 'Paumelle Bridge porte renforcée', categorie: 'verrouillage', prix_unitaire_ht: 8.500, unite: 'unité', description: 'Paumelle lourde 3 lames pour porte d’entrée' },
  { id: 'acc_cremone', nom: 'Crémone standard', categorie: 'verrouillage', prix_unitaire_ht: 15.876, unite: 'unité', description: 'Crémone de fenêtre à frappe (00957)' },
  { id: 'acc_kit_cremone', nom: 'Kit tringles crémone', categorie: 'verrouillage', prix_unitaire_ht: 7.344, unite: 'unité', description: 'Kit d’adaptation tringles haut/bas crémone' },
  { id: 'acc_cremone_cle', nom: 'Crémone à clé de sécurité', categorie: 'verrouillage', prix_unitaire_ht: 32.000, unite: 'unité', description: 'Crémone verrouillable avec barillet à clé' },
  { id: 'acc_kit_oscillo_battant', nom: 'Kit Oscillo-battant complet', categorie: 'verrouillage', prix_unitaire_ht: 65.000, unite: 'unité', description: 'Mécanisme oscillo-battant complet (compas, tringles, gâches)' },
  { id: 'acc_fast_lock_point', nom: 'Fast Lock (par point de fermeture)', categorie: 'verrouillage', prix_unitaire_ht: 22.000, unite: 'unité', description: 'Verrouillage de sécurité multipoints Fast Lock' },
  { id: 'acc_loqueteau', nom: 'Loqueteau vasistas / soufflet', categorie: 'verrouillage', prix_unitaire_ht: 3.780, unite: 'unité', description: 'Loqueteau à bascule pour châssis soufflet' },
  { id: 'acc_verrou_semi_fixe', nom: 'Verrouillage semi-fixe', categorie: 'verrouillage', prix_unitaire_ht: 7.020, unite: 'unité', description: 'Verrou haut/bas pour vantail semi-fixe' },
  { id: 'acc_fermeture', nom: 'Fermeture encastrée BRIO', categorie: 'verrouillage', prix_unitaire_ht: 10.260, unite: 'unité', description: 'Fermeture latérale de condamnation coulissant' },
  { id: 'acc_gache_fermeture', nom: 'Gâche de fermeture dormant', categorie: 'verrouillage', prix_unitaire_ht: 2.160, unite: 'unité', description: 'Gâche de verrouillage pour montant dormant' },
  { id: 'acc_gache', nom: 'Gâche standard', categorie: 'verrouillage', prix_unitaire_ht: 2.700, unite: 'unité', description: 'Gâche standard pour serrure et crémone' },
  { id: 'acc_serrure_montante', nom: 'Serrure montante multipoints', categorie: 'verrouillage', prix_unitaire_ht: 48.600, unite: 'unité', description: 'Serrure à clé multipoints pour porte (SMSQR / 950302)' },
  { id: 'acc_serrure_traverse', nom: 'Serrure traverse basse', categorie: 'verrouillage', prix_unitaire_ht: 28.000, unite: 'unité', description: 'Serrure de condamnation basse sur socle / traverse' },
  { id: 'acc_poignee_bequille', nom: 'Paire de poignées béquilles', categorie: 'verrouillage', prix_unitaire_ht: 14.580, unite: 'unité', description: 'Béquille double aluminium avec rosaces' },
  { id: 'acc_groom', nom: 'Ferme-porte hydraulique (Groom)', categorie: 'verrouillage', prix_unitaire_ht: 45.000, unite: 'unité', description: 'Ferme-porte aérien hydraulique à vitesse réglable' },

  // 4. Joints & Étanchéité
  { id: 'acc_joint_plat_035', nom: 'Joint plat 0.35', categorie: 'joints', prix_unitaire_ht: 0.702, unite: 'm', description: 'Joint plat EPDM pour maintien et étanchéité vitrage' },
  { id: 'acc_joint_brosse_76', nom: 'Joint brosse 7/6', categorie: 'joints', prix_unitaire_ht: 0.378, unite: 'm', description: 'Joint brosse d’étanchéité rails et chicanes' },
  { id: 'acc_joint_brosse_58', nom: 'Joint brosse 5/8', categorie: 'joints', prix_unitaire_ht: 0.378, unite: 'm', description: 'Joint brosse d’étanchéité fin pour dormant' },
  { id: 'acc_joint_brosse_6mm', nom: 'Joint brosse de 6mm (Volets)', categorie: 'joints', prix_unitaire_ht: 0.190, unite: 'm', description: 'Joint brosse de guidage silencieux pour coulisses de volet' },
  { id: 'acc_joint_220', nom: 'Joint 220', categorie: 'joints', prix_unitaire_ht: 0.324, unite: 'm', description: 'Joint d’étanchéité frappe / battement' },
  { id: 'acc_joint_242', nom: 'Joint 242', categorie: 'joints', prix_unitaire_ht: 0.324, unite: 'm', description: 'Joint de vitrage ouvrant' },
  { id: 'acc_joint_247', nom: 'Joint 247', categorie: 'joints', prix_unitaire_ht: 0.324, unite: 'm', description: 'Joint d’étanchéité cadre dormant' },

  // 5. Moteurs & Accessoires Volets Roulants
  { id: 'acc_kit_moteur', nom: 'Kit Moteur (Support & Adaptateurs)', categorie: 'moteurs_volets', prix_unitaire_ht: 4.000, unite: 'unité', description: 'Kit support moteur et bague d’adaptation pour axe 60' },
  { id: 'acc_tirette_55', nom: 'Tirette simple 55 (Attache tablier)', categorie: 'moteurs_volets', prix_unitaire_ht: 1.100, unite: 'unité', description: 'Attache tablier souple / rigide pour axe' },
  { id: 'acc_moteur_40kg', nom: 'Moteur tubulaire 40 kg', categorie: 'moteurs_volets', prix_unitaire_ht: 70.200, unite: 'unité', description: 'Moteur tubulaire 40 kg pour volet jusqu’à 2.2 m²' },
  { id: 'acc_moteur_60kg', nom: 'Moteur tubulaire 60 kg', categorie: 'moteurs_volets', prix_unitaire_ht: 81.000, unite: 'unité', description: 'Moteur tubulaire 60 kg pour volet 2.5 à 4.5 m²' },
  { id: 'acc_moteur_100kg', nom: 'Moteur tubulaire 100 kg', categorie: 'moteurs_volets', prix_unitaire_ht: 102.600, unite: 'unité', description: 'Moteur tubulaire 100 kg pour grande baie' },
  { id: 'acc_moteur_160kg', nom: 'Moteur tubulaire 160 kg', categorie: 'moteurs_volets', prix_unitaire_ht: 194.400, unite: 'unité', description: 'Moteur tubulaire renforcé 160 kg' },
  { id: 'acc_moteur_250kg', nom: 'Moteur tubulaire 250 kg', categorie: 'moteurs_volets', prix_unitaire_ht: 237.600, unite: 'unité', description: 'Moteur tubulaire industriel 250 kg' },
  { id: 'acc_moteur_special', nom: 'Moteur spécial', categorie: 'moteurs_volets', prix_unitaire_ht: 302.400, unite: 'unité', description: 'Moteur spécial haute puissance / débrayable' },
  { id: 'acc_bloc_secu_60', nom: 'Bloc de sécurité type 60', categorie: 'moteurs_volets', prix_unitaire_ht: 31.212, unite: 'unité', description: 'Verrou automatique anti-soulèvement pour axe 60' },
  { id: 'acc_bloc_secu_70', nom: 'Bloc de sécurité type 70', categorie: 'moteurs_volets', prix_unitaire_ht: 42.012, unite: 'unité', description: 'Verrou automatique anti-soulèvement pour axe 70' },
  { id: 'acc_rallonge_axe_60', nom: 'Rallonge Axe 60', categorie: 'moteurs_volets', prix_unitaire_ht: 3.500, unite: 'unité', description: 'Embout télescopique pour tube d’enroulement 60' },
  { id: 'acc_rallonge_axe_70', nom: 'Rallonge axe type 70', categorie: 'moteurs_volets', prix_unitaire_ht: 5.940, unite: 'unité', description: 'Embout télescopique pour tube d’enroulement 70' },
  { id: 'acc_sangle_gm', nom: 'Sangle GM', categorie: 'moteurs_volets', prix_unitaire_ht: 2.160, unite: 'unité', description: 'Sangle de manœuvre grand modèle avec enrouleur' },
  { id: 'acc_sangle_pm', nom: 'Sangle PM', categorie: 'moteurs_volets', prix_unitaire_ht: 1.620, unite: 'unité', description: 'Sangle de manœuvre petit modèle' },
  { id: 'acc_bouchon_lame_55', nom: 'Bouchon lame 55', categorie: 'moteurs_volets', prix_unitaire_ht: 0.093, unite: 'unité', description: 'Embout latéral pour lame de volet 55 mm' },
  { id: 'acc_bouchon_lame_45', nom: 'Bouchon lame 45', categorie: 'moteurs_volets', prix_unitaire_ht: 0.162, unite: 'unité', description: 'Embout latéral pour lame de volet 45 mm' },
  { id: 'acc_bouchon_lame_extrude', nom: 'Bouchon lame extrudée', categorie: 'moteurs_volets', prix_unitaire_ht: 0.359, unite: 'unité', description: 'Embout pour lame aluminium extrudé haute résistance' },

  // 6. Gamme Spécifique EX45 & EX60
  { id: 'acc_ex45_n101', nom: 'Joint dormant Ex45 N101', categorie: 'joints', prix_unitaire_ht: 1.785, unite: 'm', description: 'Joint d’étanchéité cadre dormant série EX45' },
  { id: 'acc_ex45_n103', nom: 'Joint ouvrant Ex45 N103', categorie: 'joints', prix_unitaire_ht: 1.785, unite: 'm', description: 'Joint d’étanchéité ouvrant battant série EX45' },
  { id: 'acc_ex45_n105', nom: 'Joint battement EX45 N105', categorie: 'joints', prix_unitaire_ht: 1.428, unite: 'm', description: 'Joint de battement central série EX45' },
  { id: 'acc_n52_035', nom: 'Joint vitrage N52 035', categorie: 'joints', prix_unitaire_ht: 4.165, unite: 'm', description: 'Joint calfeutrement vitrage haute performance' },
  { id: 'acc_ex45_a114', nom: 'Équerre dormant EX45 A 114', categorie: 'assemblage', prix_unitaire_ht: 1.190, unite: 'unité', description: 'Équerre d’assemblage cadre dormant série EX45' },
  { id: 'acc_ex45_a115', nom: 'Équerre ouvrant EX45 A 115', categorie: 'assemblage', prix_unitaire_ht: 1.190, unite: 'unité', description: 'Équerre d’assemblage cadre ouvrant série EX45' },
  { id: 'acc_ex45_a112', nom: 'Équerre alignement EX45 A 112', categorie: 'assemblage', prix_unitaire_ht: 1.190, unite: 'unité', description: 'Équerre de renfort et alignement onglet EX45' },
  { id: 'acc_ex60_a256', nom: 'Busette évacuation eau EX60 A256', categorie: 'roulement', prix_unitaire_ht: 1.428, unite: 'unité', description: 'Clapet de drainage spécifique séries EX45 / EX60' },
  { id: 'acc_bouchon_parclose', nom: 'Bouchon Parclose', categorie: 'accessoires', prix_unitaire_ht: 0.107, unite: 'unité', description: 'Bouchon de finition et calage parclose' },
  { id: 'acc_bouchon_trou', nom: 'Bouchon trou de drainage', categorie: 'accessoires', prix_unitaire_ht: 0.119, unite: 'unité', description: 'Bouchon obturateur trou d’usinage / drainage' },
  { id: 'acc_ex45_a130', nom: 'Accessoire frappe EX45 A 130', categorie: 'verrouillage', prix_unitaire_ht: 1.190, unite: 'unité', description: 'Gâche et support de verrouillage EX45' },
  { id: 'acc_ex45_a132', nom: 'Accessoire frappe EX45 A 132', categorie: 'verrouillage', prix_unitaire_ht: 1.190, unite: 'unité', description: 'Guide tringle haut/bas EX45' },
  { id: 'acc_ex45_a133', nom: 'Accessoire frappe EX45 A 133', categorie: 'verrouillage', prix_unitaire_ht: 1.190, unite: 'unité', description: 'Verrouillage d’angle EX45' },
  { id: 'acc_ex45_a134', nom: 'Accessoire frappe EX45 A 134', categorie: 'verrouillage', prix_unitaire_ht: 1.190, unite: 'unité', description: 'Embout de tringle et pion de fermeture EX45' },
  { id: 'acc_ex45_a120', nom: 'Paumelle frappe EX45 A 120', categorie: 'verrouillage', prix_unitaire_ht: 1.190, unite: 'unité', description: 'Paumelle d’articulation ouvrant EX45' }
];
