import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArticleItem, INITIAL_ARTICLES } from '../data/initialArticles';
import { AccessoryItemDef, INITIAL_ACCESSORIES } from '../data/initialAccessories';
import { DevisItemState, DevisTotals, calculateDevisTotals } from '../utils/devisCalculator';
export type { DevisItemState, DevisTotals, AccessoryItemDef };

export interface Client {
  id: string;
  nom: string;
  telephone: string;
  adresse?: string;
  email?: string;
  matricule_fiscale?: string;
  solde_creance: number;
}

export interface Fournisseur {
  id: string;
  nom: string;
  telephone: string;
  adresse?: string;
  solde_dette: number;
}

export interface AchatFournisseur {
  id: string;
  fournisseur_id: string;
  date: string;
  designation: string;
  montant: number;
  notes?: string;
  created_at: string;
}

export interface PaiementFournisseur {
  id: string;
  fournisseur_id: string;
  date: string;
  montant: number;
  mode_paiement: 'especes' | 'cheque' | 'virement';
  notes?: string;
  created_at: string;
}

export interface Employe {
  id: string;
  nom: string;
  poste: string;
  telephone: string;
  salaire_base: number;
  date_embauche?: string;
  actif: boolean;
  created_at: string;
}

export interface AvanceSalaire {
  id: string;
  employe_id: string;
  employe_nom: string;
  date: string;
  montant: number;
  motif: string;
  created_at: string;
}

export interface Conge {
  id: string;
  employe_id: string;
  employe_nom: string;
  date_debut: string;
  date_fin: string;
  type: 'paye' | 'non_paye' | 'maladie';
  status: 'attente' | 'approuve' | 'refuse';
  notes?: string;
  created_at: string;
}

export interface BulletinPaie {
  id: string;
  employe_id: string;
  employe_nom: string;
  mois: string;
  salaire_base: number;
  avances_deduites: number;
  net_a_payer: number;
  statut_paiement: 'paye' | 'non_paye';
  created_at: string;
}

export interface DevisRecord {
  id: string;
  numero: string;
  client_id?: string;
  client_nom?: string;
  date: string;
  notes?: string;
  items: DevisItemState[];
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
  };
  totals: DevisTotals;
  status: 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'converti';
  created_at: string;
}

export interface BonLivraisonRecord {
  id: string;
  numero: string;
  devis_id?: string;
  client_nom: string;
  date: string;
  items: Array<{
    designation: string;
    hauteur?: string | number;
    largeur?: string | number;
    quantite: number;
  }>;
  notes?: string;
  status: 'livre' | 'en_cours';
  created_at: string;
}

export interface FactureRecord {
  id: string;
  numero: string;
  devis_id?: string;
  client_nom: string;
  date: string;
  items: Array<{
    designation: string;
    quantite: number;
    prix_unitaire_ht: number;
    total_ht: number;
  }>;
  total_ht: number;
  tva_taux: number;
  total_tva: number;
  total_ttc: number;
  montant_paye: number;
  status: 'impayee' | 'partielle' | 'payee';
  created_at: string;
}

export interface CaisseMovement {
  id: string;
  date: string;
  type: 'entree' | 'sortie';
  montant: number;
  motif: string;
  mode_paiement: 'especes' | 'cheque' | 'virement';
  client_ou_tiers?: string;
  facture_id?: string;
  created_at: string;
}

export interface AtelierSettings {
  nom_atelier: string;
  activite: string;
  telephone: string;
  adresse: string;
  email: string;
  tva_default: number;
  devise: string;
}
interface AppContextType {
  user: any;
  session: any;
  isLoadingAuth: boolean;
  userRole: string;
  isSuspended: boolean;
  signOut: () => Promise<void>;

  articles: ArticleItem[];
  articlesMap: Map<string, ArticleItem>;
  updateArticlePrice: (id: number, colorKey: string, ht: number, ttc: number) => void;
  bulkUpdatePrices: (
    family: string,
    color: string,
    value: number,
    mode?: 'percent' | 'amount',
    direction?: 'increase' | 'decrease'
  ) => void;
  resetArticlesToDefault: () => void;
  updateGlobalTVA: (newTva: number) => void;
  updateArticleStock: (id: number, qty: number) => void;

  accessories: AccessoryItemDef[];
  updateAccessoryPrice: (id: string, newHt: number) => void;
  updateAccessoryStock: (id: string, qty: number) => void;
  bulkUpdateAccessories: (
    category: string,
    value: number,
    mode?: 'percent' | 'amount',
    direction?: 'increase' | 'decrease'
  ) => void;
  resetAccessoriesToDefault: () => void;

  clients: Client[];
  addClient: (c: Omit<Client, 'id'>) => Client;
  updateClient: (id: string, c: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  fournisseurs: Fournisseur[];
  addFournisseur: (f: Omit<Fournisseur, 'id'>) => Fournisseur;
  updateFournisseur: (id: string, f: Partial<Fournisseur>) => void;
  deleteFournisseur: (id: string) => void;

  achatsFournisseur: AchatFournisseur[];
  addAchatFournisseur: (a: Omit<AchatFournisseur, 'id' | 'created_at'>) => void;
  deleteAchatFournisseur: (id: string) => void;

  paiementsFournisseur: PaiementFournisseur[];
  addPaiementFournisseur: (p: Omit<PaiementFournisseur, 'id' | 'created_at'>) => void;
  deletePaiementFournisseur: (id: string) => void;

  devisList: DevisRecord[];
  saveDevis: (d: Omit<DevisRecord, 'id' | 'numero' | 'created_at'> & { id?: string }) => DevisRecord;
  deleteDevis: (id: string) => void;
  duplicateDevis: (id: string) => DevisRecord;
  updateDevisStatus: (id: string, status: DevisRecord['status']) => void;
  convertToBL: (devisId: string) => BonLivraisonRecord;
  convertToFacture: (devisId: string) => FactureRecord;

  bonsLivraison: BonLivraisonRecord[];
  factures: FactureRecord[];
  addPaymentToFacture: (factureId: string, montant: number, mode: 'especes' | 'cheque' | 'virement') => void;
  deleteFacture: (id: string) => void;

  caisseMovements: CaisseMovement[];
  addCaisseMovement: (m: Omit<CaisseMovement, 'id' | 'created_at'>) => void;
  deleteCaisseMovement: (id: string) => void;
  soldeCaisse: number;

  settings: AtelierSettings;
  updateSettings: (s: Partial<AtelierSettings>) => void;

  employes: Employe[];
  addEmploye: (e: Omit<Employe, 'id' | 'created_at'>) => void;
  updateEmploye: (id: string, e: Partial<Employe>) => void;
  deleteEmploye: (id: string) => void;

  avancesSalaire: AvanceSalaire[];
  addAvanceSalaire: (a: Omit<AvanceSalaire, 'id' | 'created_at'>) => void;
  deleteAvanceSalaire: (id: string) => void;

  conges: Conge[];
  addConge: (c: Omit<Conge, 'id' | 'created_at'>) => void;
  updateCongeStatus: (id: string, status: Conge['status']) => void;
  deleteConge: (id: string) => void;

  bulletinsPaie: BulletinPaie[];
  addBulletinPaie: (b: Omit<BulletinPaie, 'id' | 'created_at'>) => void;
  updateBulletinStatut: (id: string, statut: BulletinPaie['statut_paiement']) => void;
  deleteBulletinPaie: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const DEFAULT_SETTINGS: AtelierSettings = {
  nom_atelier: 'AtelierPro',
  activite: 'Menuiserie Aluminium & Vitrerie',
  telephone: '+216 58 829 700',
  adresse: 'Zone Industrielle, Tunis',
  email: 'contact@atelierpro.tn',
  tva_default: 19,
  devise: 'DT'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Supabase Auth State
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [userRole, setUserRole] = useState<string>('user');
  const [isSuspended, setIsSuspended] = useState<boolean>(false);

  // Articles & Catalog State
  const [articles, setArticles] = useState<ArticleItem[]>(() => {
    const saved = localStorage.getItem('atelierpro_articles');
    return saved ? JSON.parse(saved) : INITIAL_ARTICLES;
  });

  const articlesMap = React.useMemo(() => {
    const map = new Map<string, ArticleItem>();
    articles.forEach(art => {
      map.set(art.reference.trim(), art);
    });
    return map;
  }, [articles]);

  const [accessories, setAccessories] = useState<AccessoryItemDef[]>(() => {
    const saved = localStorage.getItem('atelierpro_accessories');
    return saved ? JSON.parse(saved) : INITIAL_ACCESSORIES;
  });

  // Clients (Empty by default, loaded per-user from Supabase)
  const [clients, setClients] = useState<Client[]>([]);

  // Fournisseurs (Empty by default, loaded per-user from Supabase)
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [achatsFournisseur, setAchatsFournisseur] = useState<AchatFournisseur[]>([]);
  const [paiementsFournisseur, setPaiementsFournisseur] = useState<PaiementFournisseur[]>([]);

  // Devis
  const [devisList, setDevisList] = useState<DevisRecord[]>([]);

  // BL
  const [bonsLivraison, setBonsLivraison] = useState<BonLivraisonRecord[]>([]);

  // Factures
  const [factures, setFactures] = useState<FactureRecord[]>([]);

  // RH
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [avancesSalaire, setAvancesSalaire] = useState<AvanceSalaire[]>([]);
  const [conges, setConges] = useState<Conge[]>([]);
  const [bulletinsPaie, setBulletinsPaie] = useState<BulletinPaie[]>([]);

  // Caisse
  const [caisseMovements, setCaisseMovements] = useState<CaisseMovement[]>([]);

  // Settings
  const [settings, setSettings] = useState<AtelierSettings>(() => {
    const saved = localStorage.getItem('atelierpro_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // 1. Listen to Supabase Auth Changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch User Data from Supabase when User is Authenticated
  useEffect(() => {
    if (!user) return;

    const loadUserData = async () => {
      try {
        // Fetch Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          setIsSuspended(profile.is_active === false);
          setUserRole(profile.role || 'user');

          setSettings(prev => ({
            ...prev,
            nom_atelier: profile.nom_atelier || prev.nom_atelier,
            activite: profile.activite || prev.activite,
            telephone: profile.telephone || prev.telephone,
            adresse: profile.adresse || prev.adresse,
            email: profile.email || user.email || prev.email,
            tva_default: Number(profile.tva_default) || prev.tva_default,
            devise: profile.devise || prev.devise
          }));
        } else {
          // If profile does not exist yet, create default user profile
          const newProfile = {
            id: user.id,
            email: user.email,
            nom_atelier: user.user_metadata?.nom_atelier || 'Mon Atelier Aluminium',
            telephone: user.user_metadata?.telephone || '+216 58 829 700',
            role: user.user_metadata?.role || 'user',
            is_active: true,
            tva_default: 19,
            devise: 'DT'
          };
          await supabase.from('profiles').upsert(newProfile);
          setUserRole(newProfile.role);
          setIsSuspended(false);
          setSettings(prev => ({
            ...prev,
            nom_atelier: newProfile.nom_atelier,
            email: user.email,
            telephone: newProfile.telephone
          }));
        }

        // Fetch User Catalog
        const { data: remoteCatalog } = await supabase
          .from('user_catalogs')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (remoteCatalog) {
          if (remoteCatalog.articles_data && Array.isArray(remoteCatalog.articles_data) && remoteCatalog.articles_data.length > 0) {
            setArticles(remoteCatalog.articles_data);
          }
          if (remoteCatalog.accessories_data && Array.isArray(remoteCatalog.accessories_data) && remoteCatalog.accessories_data.length > 0) {
            setAccessories(remoteCatalog.accessories_data);
          }
        }

        // Fetch Clients
        const { data: remoteClients } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        let finalClients = (remoteClients || []).map((c: any) => ({
          ...c,
          solde_creance: c.solde_creance ?? c.solde_initial ?? 0
        }));

        // Fetch Fournisseurs
        const { data: remoteFournisseurs } = await supabase
          .from('fournisseurs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        let finalFournisseurs = remoteFournisseurs || [];

        // Fetch Achats Fournisseur
        const { data: remoteAchats } = await supabase
          .from('achats_fournisseur')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
        setAchatsFournisseur(remoteAchats || []);

        // Fetch Paiements Fournisseur
        const { data: remotePaiements } = await supabase
          .from('paiements_fournisseur')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
        setPaiementsFournisseur(remotePaiements || []);

        // Fetch RH - Employes
        const { data: remoteEmployes } = await supabase
          .from('employes')
          .select('*')
          .eq('user_id', user.id)
          .order('nom');

        let finalEmployes: Employe[] = remoteEmployes || [];

        // Fetch RH - Avances
        const { data: remoteAvances } = await supabase
          .from('avances_salaire')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
        setAvancesSalaire(remoteAvances || []);

        // Fetch RH - Congés
        const { data: remoteConges } = await supabase
          .from('conges')
          .select('*')
          .eq('user_id', user.id)
          .order('date_debut', { ascending: false });
        setConges(remoteConges || []);

        // Fetch RH - Bulletins
        const { data: remoteBulletins } = await supabase
          .from('bulletins_paie')
          .select('*')
          .eq('user_id', user.id)
          .order('mois', { ascending: false });
        setBulletinsPaie(remoteBulletins || []);

        // Fetch Devis
        const { data: remoteDevis } = await supabase
          .from('devis')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        setDevisList(remoteDevis || []);

        // Fetch BL
        const { data: remoteBL } = await supabase
          .from('bons_livraison')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        setBonsLivraison(remoteBL || []);

        // Fetch Factures
        const { data: remoteFactures } = await supabase
          .from('factures')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        setFactures(remoteFactures || []);

        // Fetch Caisse
        const { data: remoteCaisse } = await supabase
          .from('caisse_movements')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        setCaisseMovements(remoteCaisse || []);

        // ════════════════════════════════════════════════════════════
        // AUTO-HEALING: Recover any orphaned employee referenced in
        // advances, leaves, or payslips so they appear in Employes tab
        // ════════════════════════════════════════════════════════════
        const existingEmpIds = new Set(finalEmployes.map(e => e.id));
        const existingEmpNames = new Set(finalEmployes.map(e => e.nom.toLowerCase().trim()));
        const recoveredEmployes: Employe[] = [];

        const checkAndRecoverEmp = (id: string, nom: string, dateStr?: string) => {
          if (!id || !nom) return;
          const cleanName = nom.trim();
          if (!existingEmpIds.has(id) && !existingEmpNames.has(cleanName.toLowerCase())) {
            existingEmpIds.add(id);
            existingEmpNames.add(cleanName.toLowerCase());
            const newRecovered: Employe = {
              id,
              nom: cleanName,
              poste: 'Employé atelier',
              telephone: '',
              salaire_base: 800,
              date_embauche: dateStr || new Date().toISOString().split('T')[0],
              actif: true,
              created_at: new Date().toISOString()
            };
            recoveredEmployes.push(newRecovered);
            // Persist recovered employee to Supabase
            supabase.from('employes').upsert({
              id: newRecovered.id,
              user_id: user.id,
              nom: newRecovered.nom,
              poste: newRecovered.poste,
              telephone: newRecovered.telephone,
              salaire_base: newRecovered.salaire_base,
              date_embauche: newRecovered.date_embauche,
              actif: true
            }).then(({ error }) => {
              if (error) console.error('Auto-recovery employe error:', error);
            });
          }
        };

        (remoteAvances || []).forEach(a => checkAndRecoverEmp(a.employe_id, a.employe_nom, a.date));
        (remoteConges || []).forEach(c => checkAndRecoverEmp(c.employe_id, c.employe_nom, c.date_debut));
        (remoteBulletins || []).forEach(b => checkAndRecoverEmp(b.employe_id, b.employe_nom));

        if (recoveredEmployes.length > 0) {
          finalEmployes = [...finalEmployes, ...recoveredEmployes];
        }
        setEmployes(finalEmployes);
        setClients(finalClients);
        setFournisseurs(finalFournisseurs);
      } catch (err) {
        console.error('Error loading data from Supabase:', err);
      }
    };

    loadUserData();
  }, [user]);

  // Helper to persist user catalog to Supabase
  const saveUserCatalog = async (updatedArticles: ArticleItem[], updatedAccessories: AccessoryItemDef[]) => {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from('user_catalogs')
        .upsert({
          user_id: user.id,
          articles_data: updatedArticles,
          accessories_data: updatedAccessories,
          updated_at: new Date().toISOString()
        });
      if (error) {
        console.error('Supabase saveUserCatalog error:', error);
      }
    } catch (err) {
      console.error('Error saving user catalog:', err);
    }
  };

  // Sync state to local storage cache for offline / instant availability
  useEffect(() => {
    localStorage.setItem('atelierpro_articles', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem('atelierpro_accessories', JSON.stringify(accessories));
  }, [accessories]);

  useEffect(() => {
    localStorage.setItem('atelierpro_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('atelierpro_fournisseurs', JSON.stringify(fournisseurs));
  }, [fournisseurs]);

  useEffect(() => {
    localStorage.setItem('atelierpro_devis', JSON.stringify(devisList));
  }, [devisList]);

  useEffect(() => {
    localStorage.setItem('atelierpro_bl', JSON.stringify(bonsLivraison));
  }, [bonsLivraison]);

  useEffect(() => {
    localStorage.setItem('atelierpro_factures', JSON.stringify(factures));
  }, [factures]);

  useEffect(() => {
    localStorage.setItem('atelierpro_caisse', JSON.stringify(caisseMovements));
  }, [caisseMovements]);

  useEffect(() => {
    localStorage.setItem('atelierpro_achats', JSON.stringify(achatsFournisseur));
  }, [achatsFournisseur]);

  useEffect(() => {
    localStorage.setItem('atelierpro_paiements_f', JSON.stringify(paiementsFournisseur));
  }, [paiementsFournisseur]);

  useEffect(() => {
    localStorage.setItem('atelierpro_employes', JSON.stringify(employes));
  }, [employes]);

  useEffect(() => {
    localStorage.setItem('atelierpro_avances', JSON.stringify(avancesSalaire));
  }, [avancesSalaire]);

  useEffect(() => {
    localStorage.setItem('atelierpro_conges', JSON.stringify(conges));
  }, [conges]);

  useEffect(() => {
    localStorage.setItem('atelierpro_bulletins', JSON.stringify(bulletinsPaie));
  }, [bulletinsPaie]);

  useEffect(() => {
    localStorage.setItem('atelierpro_settings', JSON.stringify(settings));
  }, [settings]);

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsSuspended(false);
    setUserRole('user');
    setArticles(INITIAL_ARTICLES);
    setAccessories(INITIAL_ACCESSORIES);
    setClients([]);
    setFournisseurs([]);
    setAchatsFournisseur([]);
    setPaiementsFournisseur([]);
    setDevisList([]);
    setBonsLivraison([]);
    setFactures([]);
    setCaisseMovements([]);
    setEmployes([]);
    setAvancesSalaire([]);
    setConges([]);
    setBulletinsPaie([]);
    localStorage.clear();
  };

  // Article operations
  const updateArticlePrice = (id: number, colorKey: string, ht: number, ttc: number) => {
    setArticles(prev => {
      const updated = prev.map(a => {
        if (a.id === id) {
          return {
            ...a,
            prix: {
              ...a.prix,
              [colorKey]: { ht, ttc }
            }
          };
        }
        return a;
      });
      saveUserCatalog(updated, accessories);
      return updated;
    });
  };

  const updateArticleStock = (id: number, qty: number) => {
    setArticles(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, stock_qty: qty } : a);
      saveUserCatalog(updated, accessories);
      return updated;
    });
  };

  const bulkUpdatePrices = (
    family: string,
    color: string,
    value: number,
    mode: 'percent' | 'amount' = 'percent',
    direction: 'increase' | 'decrease' = 'increase'
  ) => {
    const isAmount = mode === 'amount';
    const isDecrease = direction === 'decrease';

    setArticles(prev => {
      const updated = prev.map(a => {
        if (family && family !== 'Toutes' && a.family !== family) return a;
        const newPrix = { ...a.prix };
        const colorsToUpdate = (color && color !== 'Toutes') ? [color] : ['blanc', 'gris', 'noir', 'couleur_mat', 'couleur_givre'];
        colorsToUpdate.forEach(c => {
          if (newPrix[c]) {
            let newHT = newPrix[c].ht;
            if (isAmount) {
              newHT = isDecrease ? Math.max(0, newHT - value) : newHT + value;
            } else {
              const factor = isDecrease ? (1 - value / 100) : (1 + value / 100);
              newHT = Math.max(0, newHT * factor);
            }
            newHT = Math.round(newHT * 1000) / 1000;
            const newTTC = Math.round(newHT * (1 + settings.tva_default / 100) * 1000) / 1000;
            newPrix[c] = { ht: newHT, ttc: newTTC };
          }
        });
        return { ...a, prix: newPrix };
      });
      saveUserCatalog(updated, accessories);
      return updated;
    });
  };

  const resetArticlesToDefault = () => {
    setArticles(INITIAL_ARTICLES);
    saveUserCatalog(INITIAL_ARTICLES, accessories);
  };

  const updateGlobalTVA = (newTva: number) => {
    setSettings(prev => ({ ...prev, tva_default: newTva }));
    setArticles(prev => {
      const updated = prev.map(a => {
        const newPrix = { ...a.prix };
        ['blanc', 'gris', 'noir', 'couleur_mat', 'couleur_givre'].forEach(c => {
          if (newPrix[c]) {
            newPrix[c] = {
              ht: newPrix[c].ht,
              ttc: Math.round(newPrix[c].ht * (1 + newTva / 100) * 1000) / 1000
            };
          }
        });
        return { ...a, prix: newPrix };
      });
      saveUserCatalog(updated, accessories);
      return updated;
    });

    if (user?.id) {
      supabase.from('profiles').update({ tva_default: newTva }).eq('id', user.id);
    }
  };

  const updateAccessoryPrice = (id: string, newHt: number) => {
    setAccessories(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, prix_unitaire_ht: newHt } : a);
      saveUserCatalog(articles, updated);
      return updated;
    });
  };

  const updateAccessoryStock = (id: string, qty: number) => {
    setAccessories(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, stock_qty: qty } : a);
      saveUserCatalog(articles, updated);
      return updated;
    });
  };

  const bulkUpdateAccessories = (
    category: string,
    value: number,
    mode: 'percent' | 'amount' = 'percent',
    direction: 'increase' | 'decrease' = 'increase'
  ) => {
    const isAmount = mode === 'amount';
    const isDecrease = direction === 'decrease';

    setAccessories(prev => {
      const updated = prev.map(a => {
        if (category && category !== 'all' && a.categorie !== category) return a;
        let newHT = a.prix_unitaire_ht;
        if (isAmount) {
          newHT = isDecrease ? Math.max(0, newHT - value) : newHT + value;
        } else {
          const factor = isDecrease ? (1 - value / 100) : (1 + value / 100);
          newHT = Math.max(0, newHT * factor);
        }
        newHT = Math.round(newHT * 1000) / 1000;
        return { ...a, prix_unitaire_ht: newHT };
      });
      saveUserCatalog(articles, updated);
      return updated;
    });
  };

  const resetAccessoriesToDefault = () => {
    setAccessories(INITIAL_ACCESSORIES);
    saveUserCatalog(articles, INITIAL_ACCESSORIES);
  };

  // Client operations
  const addClient = (c: Omit<Client, 'id'>): Client => {
    const newClient: Client = { ...c, id: crypto.randomUUID() };
    setClients(prev => [newClient, ...prev]);

    if (user?.id) {
      supabase.from('clients').upsert({
        id: newClient.id,
        user_id: user.id,
        nom: newClient.nom,
        telephone: newClient.telephone || '',
        adresse: newClient.adresse || '',
        email: newClient.email || '',
        matricule_fiscale: newClient.matricule_fiscale || '',
        solde_creance: Number(newClient.solde_creance) || 0
      }).then(({ error }) => { if (error) console.error('Supabase addClient error:', error); });
    }

    return newClient;
  };

  const updateClient = (id: string, c: Partial<Client>) => {
    setClients(prev => prev.map(item => item.id === id ? { ...item, ...c } : item));

    if (user?.id) {
      supabase.from('clients').update(c).eq('id', id).eq('user_id', user.id)
        .then(({ error }) => { if (error) console.error('Supabase updateClient error:', error); });
    }
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));

    if (user?.id) {
      supabase.from('clients').delete().eq('id', id).eq('user_id', user.id)
        .then(({ error }) => { if (error) console.error('Supabase deleteClient error:', error); });
    }
  };

  // Fournisseurs
  const addFournisseur = (f: Omit<Fournisseur, 'id'>): Fournisseur => {
    const newF: Fournisseur = { ...f, id: crypto.randomUUID() };
    setFournisseurs(prev => [newF, ...prev]);

    if (user?.id) {
      supabase.from('fournisseurs').upsert({
        id: newF.id,
        user_id: user.id,
        nom: newF.nom,
        telephone: newF.telephone || '',
        adresse: newF.adresse || '',
        solde_dette: Number(newF.solde_dette) || 0
      }).then(({ error }) => { if (error) console.error('Supabase addFournisseur error:', error); });
    }

    return newF;
  };

  const updateFournisseur = (id: string, f: Partial<Fournisseur>) => {
    setFournisseurs(prev => prev.map(item => item.id === id ? { ...item, ...f } : item));

    if (user?.id) {
      supabase.from('fournisseurs').update(f).eq('id', id).eq('user_id', user.id)
        .then(({ error }) => { if (error) console.error('Supabase updateFournisseur error:', error); });
    }
  };

  const deleteFournisseur = (id: string) => {
    setFournisseurs(prev => prev.filter(f => f.id !== id));

    if (user?.id) {
      supabase.from('fournisseurs').delete().eq('id', id).eq('user_id', user.id)
        .then(({ error }) => { if (error) console.error('Supabase deleteFournisseur error:', error); });
    }
  };

  // Achats Fournisseur
  const addAchatFournisseur = (a: Omit<AchatFournisseur, 'id' | 'created_at'>) => {
    const newA: AchatFournisseur = {
      ...a,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    setAchatsFournisseur(prev => [newA, ...prev]);

    if (user?.id) {
      supabase.from('achats_fournisseur').upsert({
        id: newA.id,
        user_id: user.id,
        fournisseur_id: newA.fournisseur_id,
        date: newA.date || new Date().toISOString().split('T')[0],
        designation: newA.designation,
        montant: Number(newA.montant) || 0,
        notes: newA.notes || ''
      }).then(({ error }) => { if (error) console.error('Supabase addAchatFournisseur error:', error); });
    }
  };

  const deleteAchatFournisseur = (id: string) => {
    setAchatsFournisseur(prev => prev.filter(a => a.id !== id));
    if (user?.id) {
      supabase.from('achats_fournisseur').delete().eq('id', id).eq('user_id', user.id)
        .then(({ error }) => { if (error) console.error('Supabase deleteAchatFournisseur error:', error); });
    }
  };

  // Paiements Fournisseur
  const addPaiementFournisseur = (p: Omit<PaiementFournisseur, 'id' | 'created_at'>) => {
    const newP: PaiementFournisseur = {
      ...p,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    setPaiementsFournisseur(prev => [newP, ...prev]);

    if (user?.id) {
      supabase.from('paiements_fournisseur').upsert({
        id: newP.id,
        user_id: user.id,
        fournisseur_id: newP.fournisseur_id,
        date: newP.date || new Date().toISOString().split('T')[0],
        montant: Number(newP.montant) || 0,
        mode_paiement: newP.mode_paiement || 'especes',
        notes: newP.notes || ''
      }).then(({ error }) => { if (error) console.error('Supabase addPaiementFournisseur error:', error); });
    }
  };

  const deletePaiementFournisseur = (id: string) => {
    setPaiementsFournisseur(prev => prev.filter(p => p.id !== id));
    if (user?.id) {
      supabase.from('paiements_fournisseur').delete().eq('id', id).eq('user_id', user.id)
        .then(({ error }) => { if (error) console.error('Supabase deletePaiementFournisseur error:', error); });
    }
  };

  // Devis operations
  const saveDevis = (d: Omit<DevisRecord, 'id' | 'numero' | 'created_at'> & { id?: string }): DevisRecord => {
    if (d.id) {
      const existing = devisList.find(x => x.id === d.id);
      const updated: DevisRecord = {
        ...d,
        id: d.id,
        numero: existing?.numero || `DEV-${new Date().getFullYear()}-${String(devisList.length + 1).padStart(4, '0')}`,
        created_at: existing?.created_at || new Date().toISOString()
      };
      setDevisList(prev => prev.map(x => x.id === d.id ? updated : x));

      if (user?.id) {
        supabase.from('devis').upsert({
          id: updated.id,
          user_id: user.id,
          numero: updated.numero,
          client_id: updated.client_id || null,
          client_nom: updated.client_nom || '',
          date: updated.date,
          notes: updated.notes || '',
          items: updated.items,
          marges: updated.marges,
          totals: updated.totals,
          status: updated.status
        }).then(({ error }) => { if (error) console.error('Supabase saveDevis error:', error); });
      }

      return updated;
    } else {
      const ts = String(Date.now()).slice(-6);
      const nextNum = `DEV-${new Date().getFullYear()}-${ts}`;
      const newDevis: DevisRecord = {
        ...d,
        id: crypto.randomUUID(),
        numero: nextNum,
        created_at: new Date().toISOString()
      };
      setDevisList(prev => [newDevis, ...prev]);

      if (user?.id) {
        supabase.from('devis').insert({
          id: newDevis.id,
          user_id: user.id,
          numero: newDevis.numero,
          client_id: newDevis.client_id || null,
          client_nom: newDevis.client_nom || '',
          date: newDevis.date,
          notes: newDevis.notes || '',
          items: newDevis.items,
          marges: newDevis.marges,
          totals: newDevis.totals,
          status: newDevis.status
        }).then(({ error }) => { if (error) console.error('Supabase insert devis error:', error); });
      }

      return newDevis;
    }
  };

  const deleteDevis = (id: string) => {
    setDevisList(prev => prev.filter(d => d.id !== id));

    if (user?.id) {
      supabase.from('devis').delete().eq('id', id).eq('user_id', user.id)
        .then(({ error }) => { if (error) console.error('Supabase deleteDevis error:', error); });
    }
  };

  const duplicateDevis = (id: string): DevisRecord => {
    const original = devisList.find(d => d.id === id);
    if (!original) throw new Error('Devis not found');
    const ts = String(Date.now()).slice(-6);
    const clone: DevisRecord = {
      ...JSON.parse(JSON.stringify(original)),
      id: crypto.randomUUID(),
      numero: `DEV-${new Date().getFullYear()}-${ts}-COPIE`,
      status: 'brouillon',
      created_at: new Date().toISOString()
    };
    setDevisList(prev => [clone, ...prev]);

    if (user?.id) {
      supabase.from('devis').insert({
        id: clone.id,
        user_id: user.id,
        numero: clone.numero,
        client_id: clone.client_id || null,
        client_nom: clone.client_nom || '',
        date: clone.date,
        notes: clone.notes || '',
        items: clone.items,
        marges: clone.marges,
        totals: clone.totals,
        status: clone.status
      }).then(({ error }) => { if (error) console.error('Supabase duplicateDevis error:', error); });
    }

    return clone;
  };

  const updateDevisStatus = (id: string, status: DevisRecord['status']) => {
    setDevisList(prev => prev.map(d => d.id === id ? { ...d, status } : d));

    if (user?.id) {
      supabase.from('devis').update({ status }).eq('id', id).eq('user_id', user.id)
        .then(({ error }) => { if (error) console.error('Supabase updateDevisStatus error:', error); });
    }
  };

  const convertToBL = (devisId: string): BonLivraisonRecord => {
    const devis = devisList.find(d => d.id === devisId);
    if (!devis) throw new Error('Devis not found');
    const nextBL = `BL-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const bl: BonLivraisonRecord = {
      id: crypto.randomUUID(),
      numero: nextBL,
      devis_id: devis.id,
      client_nom: devis.client_nom || 'Client sans nom',
      date: new Date().toISOString().split('T')[0],
      items: devis.items.map((it, idx) => ({
        designation: it.is_manual ? (it.manual_nom || `Ligne libre ${idx + 1}`) : `Produit ${idx + 1} (${it.couleur})`,
        hauteur: it.hauteur,
        largeur: it.largeur,
        quantite: it.quantity || 1
      })),
      notes: devis.notes,
      status: 'en_cours',
      created_at: new Date().toISOString()
    };
    setBonsLivraison(prev => [bl, ...prev]);
    updateDevisStatus(devisId, 'converti');

    if (user?.id) {
      supabase.from('bons_livraison').insert({
        id: bl.id,
        user_id: user.id,
        numero: bl.numero,
        devis_id: bl.devis_id,
        client_nom: bl.client_nom,
        date: bl.date,
        items: bl.items,
        notes: bl.notes || '',
        status: bl.status
      }).then(({ error }) => { if (error) console.error('Supabase insert BL error:', error); });
    }

    return bl;
  };

  const convertToFacture = (devisId: string): FactureRecord => {
    const devis = devisList.find(d => d.id === devisId);
    if (!devis) throw new Error('Devis not found');

    const alreadyConverted = factures.some(f => f.devis_id === devisId);
    if (alreadyConverted) {
      throw new Error(`Ce devis a déjà été converti en facture. Conversion multiple interdite.`);
    }

    const nextFac = `FAC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const fac: FactureRecord = {
      id: crypto.randomUUID(),
      numero: nextFac,
      devis_id: devis.id,
      client_nom: devis.client_nom || 'Client sans nom',
      date: new Date().toISOString().split('T')[0],
      items: devis.items.map((it, idx) => ({
        designation: it.is_manual ? (it.manual_nom || 'Article manuel') : `Menuiserie ${it.largeur}×${it.hauteur} cm`,
        quantite: it.quantity,
        prix_unitaire_ht: devis.totals.items_costs[idx]?.net_ht || 0,
        total_ht: devis.totals.items_costs[idx]?.total_ht || 0
      })),
      total_ht: devis.totals.total_ht,
      tva_taux: devis.marges.tva,
      total_tva: devis.totals.total_tva,
      total_ttc: devis.totals.total_ttc,
      montant_paye: 0,
      status: 'impayee',
      created_at: new Date().toISOString()
    };
    setFactures(prev => [fac, ...prev]);
    updateDevisStatus(devisId, 'converti');

    if (devis.client_id) {
      const clientObj = clients.find(c => c.id === devis.client_id);
      const newSolde = (clientObj?.solde_creance || 0) + fac.total_ttc;
      setClients(prev => prev.map(c => c.id === devis.client_id ? { ...c, solde_creance: newSolde } : c));
      if (user?.id) {
        supabase.from('clients').update({ solde_creance: newSolde }).eq('id', devis.client_id).eq('user_id', user.id)
          .then(({ error }) => { if (error) console.error('Supabase client solde update error:', error); });
      }
    }

    if (user?.id) {
      supabase.from('factures').insert({
        id: fac.id,
        user_id: user.id,
        numero: fac.numero,
        devis_id: fac.devis_id,
        client_nom: fac.client_nom,
        date: fac.date,
        items: fac.items,
        total_ht: fac.total_ht,
        tva_taux: fac.tva_taux,
        total_tva: fac.total_tva,
        total_ttc: fac.total_ttc,
        montant_paye: fac.montant_paye,
        status: fac.status,
        paiements: []
      }).then(({ error }) => { if (error) console.error('Supabase convertToFacture error:', error); });
    }

    return fac;
  };

  const addPaymentToFacture = (factureId: string, montant: number, mode: 'especes' | 'cheque' | 'virement') => {
    const fac = factures.find(f => f.id === factureId);
    if (!fac) return;

    const restant = fac.total_ttc - fac.montant_paye;
    const montantReel = Math.min(Math.max(0, montant), restant);
    if (montantReel <= 0) return;

    const newPaye = fac.montant_paye + montantReel;
    const newStatus = newPaye >= fac.total_ttc ? 'payee' : 'partielle';

    setFactures(prev => prev.map(f => {
      if (f.id === factureId) {
        return { ...f, montant_paye: newPaye, status: newStatus };
      }
      return f;
    }));

    if (fac.devis_id) {
      const devis = devisList.find(d => d.id === fac.devis_id);
      if (devis?.client_id) {
        const clientObj = clients.find(c => c.id === devis.client_id);
        const newClientSolde = Math.max(0, (clientObj?.solde_creance || 0) - montantReel);
        setClients(prev => prev.map(c =>
          c.id === devis.client_id ? { ...c, solde_creance: newClientSolde } : c
        ));
        if (user?.id) {
          supabase.from('clients').update({ solde_creance: newClientSolde }).eq('id', devis.client_id).eq('user_id', user.id)
            .then(({ error }) => { if (error) console.error('Supabase client solde decrease error:', error); });
        }
      }
    }

    addCaisseMovement({
      date: new Date().toISOString().split('T')[0],
      type: 'entree',
      montant: montantReel,
      motif: `Règlement facture ${fac.numero}`,
      mode_paiement: mode,
      client_ou_tiers: fac.client_nom,
      facture_id: factureId
    });

    if (user?.id) {
      supabase.from('factures').update({
        montant_paye: newPaye,
        status: newStatus
      }).eq('id', factureId).eq('user_id', user.id)
        .then(({ error }) => { if (error) console.error('Supabase payment update error:', error); });
    }
  };

  const deleteFacture = (factureId: string) => {
    const fac = factures.find(f => f.id === factureId);
    setFactures(prev => prev.filter(f => f.id !== factureId));
    
    // Also remove any caisse movements generated by this facture
    setCaisseMovements(prev => prev.filter(m => m.facture_id !== factureId));

    if (fac?.devis_id) {
      updateDevisStatus(fac.devis_id, 'accepte');
    }
    if (user?.id) {
      supabase.from('factures').delete().eq('id', factureId).eq('user_id', user.id)
        .then(({ error }) => { if (error) console.error('Supabase deleteFacture error:', error); });
      supabase.from('caisse_movements').delete().eq('facture_id', factureId).eq('user_id', user.id)
        .then(({ error }) => { if (error) console.error('Supabase delete linked caisse movements error:', error); });
    }
  };

  // ─── RH CRUD ──────────────────────────────────────────────────
  const addEmploye = (e: Omit<Employe, 'id' | 'created_at'>) => {
    const newE: Employe = { ...e, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    setEmployes(prev => [...prev, newE]);
    if (user?.id) {
      supabase.from('employes').upsert({
        id: newE.id,
        user_id: user.id,
        nom: newE.nom,
        poste: newE.poste || '',
        telephone: newE.telephone || '',
        salaire_base: Number(newE.salaire_base) || 0,
        date_embauche: (newE.date_embauche && newE.date_embauche.trim() !== '') ? newE.date_embauche : null,
        actif: newE.actif ?? true
      }).then(({ error }) => { if (error) console.error('addEmploye error:', error); });
    }
  };

  const updateEmploye = (id: string, e: Partial<Employe>) => {
    setEmployes(prev => prev.map(x => x.id === id ? { ...x, ...e } : x));
    if (user?.id) {
      const payload: any = { ...e };
      if ('date_embauche' in e) {
        payload.date_embauche = (e.date_embauche && e.date_embauche.trim() !== '') ? e.date_embauche : null;
      }
      supabase.from('employes').update(payload).eq('id', id).eq('user_id', user.id)
        .then(({ error }) => { if (error) console.error('updateEmploye error:', error); });
    }
  };

  const deleteEmploye = (id: string) => {
    setEmployes(prev => prev.filter(x => x.id !== id));
    if (user?.id) {
      supabase.from('employes').delete().eq('id', id).eq('user_id', user.id)
        .then(({ error }) => { if (error) console.error('deleteEmploye error:', error); });
    }
  };

  const addAvanceSalaire = (a: Omit<AvanceSalaire, 'id' | 'created_at'>) => {
    const newA: AvanceSalaire = { ...a, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    setAvancesSalaire(prev => [newA, ...prev]);
    if (user?.id) {
      supabase.from('avances_salaire').upsert({
        id: newA.id,
        user_id: user.id,
        employe_id: newA.employe_id,
        employe_nom: newA.employe_nom || '',
        date: newA.date || new Date().toISOString().split('T')[0],
        montant: Number(newA.montant) || 0,
        motif: newA.motif || ''
      }).then(({ error }) => { if (error) console.error('addAvanceSalaire error:', error); });
    }
  };

  const deleteAvanceSalaire = (id: string) => {
    setAvancesSalaire(prev => prev.filter(x => x.id !== id));
    if (user?.id) {
      supabase.from('avances_salaire').delete().eq('id', id).eq('user_id', user.id)
        .then(({ error }) => { if (error) console.error('deleteAvanceSalaire error:', error); });
    }
  };

  const addConge = (c: Omit<Conge, 'id' | 'created_at'>) => {
    const newC: Conge = { ...c, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    setConges(prev => [newC, ...prev]);
    if (user?.id) {
      supabase.from('conges').upsert({
        id: newC.id,
        user_id: user.id,
        employe_id: newC.employe_id,
        employe_nom: newC.employe_nom || '',
        date_debut: newC.date_debut || new Date().toISOString().split('T')[0],
        date_fin: newC.date_fin || new Date().toISOString().split('T')[0],
        type: newC.type || 'paye',
        status: newC.status || 'attente',
        notes: newC.notes || ''
      }).then(({ error }) => { if (error) console.error('addConge error:', error); });
    }
  };

  const updateCongeStatus = (id: string, status: Conge['status']) => {
    setConges(prev => prev.map(x => x.id === id ? { ...x, status } : x));
    if (user?.id) {
      supabase.from('conges').update({ status }).eq('id', id).eq('user_id', user.id)
        .then(({ error }) => { if (error) console.error('updateCongeStatus error:', error); });
    }
  };

  const deleteConge = (id: string) => {
    setConges(prev => prev.filter(x => x.id !== id));
    if (user?.id) {
      supabase.from('conges').delete().eq('id', id).eq('user_id', user.id)
        .then(({ error }) => { if (error) console.error('deleteConge error:', error); });
    }
  };

  const addBulletinPaie = (b: Omit<BulletinPaie, 'id' | 'created_at'>) => {
    const newB: BulletinPaie = { ...b, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    setBulletinsPaie(prev => [newB, ...prev]);
    if (user?.id) {
      supabase.from('bulletins_paie').upsert({
        id: newB.id,
        user_id: user.id,
        employe_id: newB.employe_id,
        employe_nom: newB.employe_nom || '',
        mois: newB.mois || new Date().toISOString().slice(0, 7),
        salaire_base: Number(newB.salaire_base) || 0,
        avances_deduites: Number(newB.avances_deduites) || 0,
        net_a_payer: Number(newB.net_a_payer) || 0,
        statut_paiement: newB.statut_paiement || 'non_paye'
      }).then(({ error }) => { if (error) console.error('addBulletinPaie error:', error); });
    }
  };

  const updateBulletinStatut = (id: string, statut_paiement: BulletinPaie['statut_paiement']) => {
    setBulletinsPaie(prev => prev.map(x => x.id === id ? { ...x, statut_paiement } : x));
    if (user?.id) {
      supabase.from('bulletins_paie').update({ statut_paiement }).eq('id', id).eq('user_id', user.id)
        .then(({ error }) => { if (error) console.error('updateBulletinStatut error:', error); });
    }
  };

  const deleteBulletinPaie = (id: string) => {
    setBulletinsPaie(prev => prev.filter(x => x.id !== id));
    if (user?.id) {
      supabase.from('bulletins_paie').delete().eq('id', id).eq('user_id', user.id)
        .then(({ error }) => { if (error) console.error('deleteBulletinPaie error:', error); });
    }
  };

  const addCaisseMovement = (m: Omit<CaisseMovement, 'id' | 'created_at'>) => {
    const item: CaisseMovement = {
      ...m,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    setCaisseMovements(prev => [item, ...prev]);

    if (user?.id) {
      supabase.from('caisse_movements').insert({
        id: item.id,
        user_id: user.id,
        type: item.type,
        montant: item.montant,
        motif: item.motif,
        date: item.date,
        mode_paiement: item.mode_paiement || 'especes',
        client_ou_tiers: item.client_ou_tiers || '',
        facture_id: item.facture_id || null
      }).then(({ error }) => { if (error) console.error('Supabase addCaisseMovement error:', error); });
    }
  };

  const deleteCaisseMovement = (id: string) => {
    const mov = caisseMovements.find(m => m.id === id);
    setCaisseMovements(prev => prev.filter(m => m.id !== id));

    // If movement is linked to a facture, adjust the facture's montant_paye and status
    if (mov?.facture_id && mov.type === 'entree') {
      setFactures(prev => prev.map(f => {
        if (f.id === mov.facture_id) {
          const newPaye = Math.max(0, (f.montant_paye || 0) - mov.montant);
          const newStatus = newPaye >= f.total_ttc ? 'payee' : (newPaye > 0 ? 'partielle' : 'impayee');
          if (user?.id) {
            supabase.from('factures').update({
              montant_paye: newPaye,
              status: newStatus
            }).eq('id', f.id).eq('user_id', user.id)
              .then(({ error }) => { if (error) console.error('Supabase facture paye adjust error:', error); });
          }
          return { ...f, montant_paye: newPaye, status: newStatus };
        }
        return f;
      }));
    }

    if (user?.id) {
      supabase.from('caisse_movements').delete().eq('id', id).eq('user_id', user.id)
        .then(({ error }) => { if (error) console.error('Supabase deleteCaisseMovement error:', error); });
    }
  };

  const soldeCaisse = React.useMemo(() => {
    return caisseMovements.reduce((acc, m) => {
      return m.type === 'entree' ? acc + m.montant : acc - m.montant;
    }, 0);
  }, [caisseMovements]);

  const updateSettings = (s: Partial<AtelierSettings>) => {
    const updated = { ...settings, ...s };
    setSettings(updated);

    if (user?.id) {
      supabase.from('profiles').upsert({
        id: user.id,
        nom_atelier: updated.nom_atelier,
        activite: updated.activite,
        telephone: updated.telephone,
        adresse: updated.adresse,
        email: updated.email,
        tva_default: updated.tva_default,
        devise: updated.devise
      }).then(({ error }) => { if (error) console.error('Supabase updateSettings error:', error); });
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        session,
        isLoadingAuth,
        userRole,
        isSuspended,
        signOut,
        articles,
        articlesMap,
        updateArticlePrice,
        bulkUpdatePrices,
        resetArticlesToDefault,
        updateGlobalTVA,
        updateArticleStock,
        accessories,
        updateAccessoryPrice,
        updateAccessoryStock,
        bulkUpdateAccessories,
        resetAccessoriesToDefault,
        clients,
        addClient,
        updateClient,
        deleteClient,
        fournisseurs,
        addFournisseur,
        updateFournisseur,
        deleteFournisseur,
        achatsFournisseur,
        addAchatFournisseur,
        deleteAchatFournisseur,
        paiementsFournisseur,
        addPaiementFournisseur,
        deletePaiementFournisseur,
        devisList,
        saveDevis,
        deleteDevis,
        duplicateDevis,
        updateDevisStatus,
        convertToBL,
        convertToFacture,
        bonsLivraison,
        factures,
        addPaymentToFacture,
        deleteFacture,
        caisseMovements,
        addCaisseMovement,
        deleteCaisseMovement,
        soldeCaisse,
        settings,
        updateSettings,
        employes,
        addEmploye,
        updateEmploye,
        deleteEmploye,
        avancesSalaire,
        addAvanceSalaire,
        deleteAvanceSalaire,
        conges,
        addConge,
        updateCongeStatus,
        deleteConge,
        bulletinsPaie,
        addBulletinPaie,
        updateBulletinStatut,
        deleteBulletinPaie
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
