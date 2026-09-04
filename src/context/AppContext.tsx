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
  bulkUpdatePrices: (family: string, color: string, percent: number) => void;
  updateGlobalTVA: (newTva: number) => void;
  updateArticleStock: (id: number, qty: number) => void;

  accessories: AccessoryItemDef[];
  updateAccessoryPrice: (id: string, newHt: number) => void;
  updateAccessoryStock: (id: string, qty: number) => void;

  clients: Client[];
  addClient: (c: Omit<Client, 'id'>) => Client;
  updateClient: (id: string, c: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  fournisseurs: Fournisseur[];
  addFournisseur: (f: Omit<Fournisseur, 'id'>) => Fournisseur;
  deleteFournisseur: (id: string) => void;

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

  caisseMovements: CaisseMovement[];
  addCaisseMovement: (m: Omit<CaisseMovement, 'id' | 'created_at'>) => void;
  soldeCaisse: number;

  settings: AtelierSettings;
  updateSettings: (s: Partial<AtelierSettings>) => void;
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

  // Devis
  const [devisList, setDevisList] = useState<DevisRecord[]>([]);

  // BL
  const [bonsLivraison, setBonsLivraison] = useState<BonLivraisonRecord[]>([]);

  // Factures
  const [factures, setFactures] = useState<FactureRecord[]>([]);

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

        // Fetch Clients
        const { data: remoteClients } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        setClients(remoteClients || []);

        // Fetch Fournisseurs
        const { data: remoteFournisseurs } = await supabase
          .from('fournisseurs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        setFournisseurs(remoteFournisseurs || []);

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
      } catch (err) {
        console.error('Error loading data from Supabase:', err);
      }
    };

    loadUserData();
  }, [user]);

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
    localStorage.setItem('atelierpro_settings', JSON.stringify(settings));
  }, [settings]);

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsSuspended(false);
    setUserRole('user');
    setClients([]);
    setFournisseurs([]);
    setDevisList([]);
    setBonsLivraison([]);
    setFactures([]);
    setCaisseMovements([]);
    localStorage.removeItem('atelierpro_clients');
    localStorage.removeItem('atelierpro_fournisseurs');
    localStorage.removeItem('atelierpro_devis');
    localStorage.removeItem('atelierpro_bl');
    localStorage.removeItem('atelierpro_factures');
    localStorage.removeItem('atelierpro_caisse');
  };

  // Article operations
  const updateArticlePrice = (id: number, colorKey: string, ht: number, ttc: number) => {
    setArticles(prev => prev.map(a => {
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
    }));
  };

  const updateArticleStock = (id: number, qty: number) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, stock_qty: qty } : a));
  };

  const bulkUpdatePrices = (family: string, color: string, percent: number) => {
    const factor = 1 + percent / 100;
    setArticles(prev => prev.map(a => {
      if (family && family !== 'Toutes' && a.family !== family) return a;
      const newPrix = { ...a.prix };
      const colorsToUpdate = (color && color !== 'Toutes') ? [color] : ['blanc', 'gris', 'noir', 'couleur_mat', 'couleur_givre'];
      colorsToUpdate.forEach(c => {
        if (newPrix[c]) {
          const newHT = Math.round(newPrix[c].ht * factor * 1000) / 1000;
          const newTTC = Math.round(newHT * (1 + settings.tva_default / 100) * 1000) / 1000;
          newPrix[c] = { ht: newHT, ttc: newTTC };
        }
      });
      return { ...a, prix: newPrix };
    }));
  };

  const updateGlobalTVA = (newTva: number) => {
    setSettings(prev => ({ ...prev, tva_default: newTva }));
    setArticles(prev => prev.map(a => {
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
    }));

    if (user?.id) {
      supabase.from('profiles').update({ tva_default: newTva }).eq('id', user.id);
    }
  };

  const updateAccessoryPrice = (id: string, newHt: number) => {
    setAccessories(prev => prev.map(a => a.id === id ? { ...a, prix_unitaire_ht: newHt } : a));
  };

  const updateAccessoryStock = (id: string, qty: number) => {
    setAccessories(prev => prev.map(a => a.id === id ? { ...a, stock_qty: qty } : a));
  };

  // Client operations
  const addClient = (c: Omit<Client, 'id'>): Client => {
    const newClient: Client = { ...c, id: `c_${Date.now()}` };
    setClients(prev => [newClient, ...prev]);

    if (user?.id) {
      supabase.from('clients').insert({
        id: newClient.id,
        user_id: user.id,
        nom: newClient.nom,
        telephone: newClient.telephone || '',
        adresse: newClient.adresse || '',
        email: newClient.email || '',
        solde_initial: newClient.solde_creance || 0
      }).then(({ error }) => { if (error) console.error('Supabase addClient error:', error); });
    }

    return newClient;
  };

  const updateClient = (id: string, c: Partial<Client>) => {
    setClients(prev => prev.map(item => item.id === id ? { ...item, ...c } : item));

    if (user?.id) {
      supabase.from('clients').update(c).eq('id', id).eq('user_id', user.id);
    }
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));

    if (user?.id) {
      supabase.from('clients').delete().eq('id', id).eq('user_id', user.id);
    }
  };

  // Fournisseurs
  const addFournisseur = (f: Omit<Fournisseur, 'id'>): Fournisseur => {
    const newF: Fournisseur = { ...f, id: `f_${Date.now()}` };
    setFournisseurs(prev => [newF, ...prev]);

    if (user?.id) {
      supabase.from('fournisseurs').insert({
        id: newF.id,
        user_id: user.id,
        nom: newF.nom,
        telephone: newF.telephone || '',
        adresse: newF.adresse || ''
      }).then(({ error }) => { if (error) console.error('Supabase addFournisseur error:', error); });
    }

    return newF;
  };

  const deleteFournisseur = (id: string) => {
    setFournisseurs(prev => prev.filter(f => f.id !== id));

    if (user?.id) {
      supabase.from('fournisseurs').delete().eq('id', id).eq('user_id', user.id);
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
        id: `dev_${Date.now()}`,
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
      supabase.from('devis').delete().eq('id', id).eq('user_id', user.id);
    }
  };

  const duplicateDevis = (id: string): DevisRecord => {
    const original = devisList.find(d => d.id === id);
    if (!original) throw new Error('Devis not found');
    const ts = String(Date.now()).slice(-6);
    const clone: DevisRecord = {
      ...JSON.parse(JSON.stringify(original)),
      id: `dev_${Date.now()}`,
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
      });
    }

    return clone;
  };

  const updateDevisStatus = (id: string, status: DevisRecord['status']) => {
    setDevisList(prev => prev.map(d => d.id === id ? { ...d, status } : d));

    if (user?.id) {
      supabase.from('devis').update({ status }).eq('id', id).eq('user_id', user.id);
    }
  };

  const convertToBL = (devisId: string): BonLivraisonRecord => {
    const devis = devisList.find(d => d.id === devisId);
    if (!devis) throw new Error('Devis not found');
    const nextBL = `BL-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const bl: BonLivraisonRecord = {
      id: `bl_${Date.now()}`,
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
      });
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
      id: `fac_${Date.now()}`,
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
      setClients(prev => prev.map(c => c.id === devis.client_id ? { ...c, solde_creance: c.solde_creance + fac.total_ttc } : c));
    }

    if (user?.id) {
      supabase.from('factures').insert({
        id: fac.id,
        user_id: user.id,
        numero: fac.numero,
        devis_id: fac.devis_id,
        client_nom: fac.client_nom,
        date: fac.date,
        total_ht: fac.total_ht,
        total_tva: fac.total_tva,
        total_ttc: fac.total_ttc,
        montant_paye: fac.montant_paye,
        status: fac.status,
        paiements: []
      });
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
        setClients(prev => prev.map(c =>
          c.id === devis.client_id
            ? { ...c, solde_creance: Math.max(0, c.solde_creance - montantReel) }
            : c
        ));
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
      }).eq('id', factureId).eq('user_id', user.id);
    }
  };

  const addCaisseMovement = (m: Omit<CaisseMovement, 'id' | 'created_at'>) => {
    const item: CaisseMovement = {
      ...m,
      id: `m_${Date.now()}`,
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
        facture_id: item.facture_id || null
      });
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
      });
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
        updateGlobalTVA,
        updateArticleStock,
        accessories,
        updateAccessoryPrice,
        updateAccessoryStock,
        clients,
        addClient,
        updateClient,
        deleteClient,
        fournisseurs,
        addFournisseur,
        deleteFournisseur,
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
        caisseMovements,
        addCaisseMovement,
        soldeCaisse,
        settings,
        updateSettings
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
