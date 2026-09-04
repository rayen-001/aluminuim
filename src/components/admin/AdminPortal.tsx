import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  ShieldCheck, 
  Users, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Power, 
  RefreshCw, 
  Phone, 
  Mail, 
  AlertTriangle,
  UserPlus,
  LogOut,
  Sparkles,
  Lock,
  X,
  Loader2,
  Calendar
} from 'lucide-react';

export interface UserProfileSummary {
  id: string;
  nom_atelier: string;
  email: string;
  telephone: string;
  adresse: string;
  role: string;
  is_active: boolean;
  subscription_end?: string;
  created_at: string;
}

export const AdminPortal: React.FC = () => {
  const { user, signOut } = useApp();
  const [profiles, setProfiles] = useState<UserProfileSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Create Workshop Modal
  const [createModal, setCreateModal] = useState(false);
  const [newNom, setNewNom] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const fetchProfiles = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch profiles error:', error);
        // Fallback: If RLS blocked, fetch current profile at least
        const { data: fallbackData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user?.id);
        setProfiles(fallbackData || []);
        setMsg({ 
          text: "Attention : Exécutez le script SQL RLS dans Supabase pour afficher tous les ateliers clients.", 
          type: 'error' 
        });
      } else {
        setProfiles(data || []);
      }
    } catch (err: any) {
      console.error('Fetch profiles exception:', err);
      setMsg({ text: "Erreur de connexion à la base de données.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleToggleActive = async (profileId: string, currentStatus: boolean) => {
    if (profileId === user?.id) {
      alert("Vous ne pouvez pas désactiver votre propre compte administrateur.");
      return;
    }

    const newStatus = !currentStatus;
    setActionLoading(profileId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: newStatus })
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, is_active: newStatus } : p));
      setMsg({ 
        text: `Compte atelier ${newStatus ? 'activé' : 'suspendu'} avec succès ! Les données restent 100% conservées.`, 
        type: 'success' 
      });
      setTimeout(() => setMsg(null), 4000);
    } catch (err: any) {
      console.error('Update status error:', err);
      setMsg({ text: "Erreur lors de la modification du statut.", type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNom.trim() || !newEmail.trim() || !newPassword.trim()) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setCreateLoading(true);
    try {
      // 1. Create auth user in Supabase
      const { data, error } = await supabase.auth.signUp({
        email: newEmail.trim(),
        password: newPassword,
        options: {
          data: {
            nom_atelier: newNom.trim(),
            telephone: newPhone.trim()
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // 2. Ensure profile entry exists
        await supabase.from('profiles').upsert({
          id: data.user.id,
          nom_atelier: newNom.trim(),
          email: newEmail.trim(),
          telephone: newPhone.trim() || '+216 58 829 700',
          role: 'user',
          is_active: true
        });

        setMsg({ 
          text: `Atelier "${newNom}" créé avec succès ! Identifiants : ${newEmail} / ${newPassword}`, 
          type: 'success' 
        });

        setCreateModal(false);
        setNewNom('');
        setNewEmail('');
        setNewPassword('');
        setNewPhone('');
        fetchProfiles();
      }
    } catch (err: any) {
      console.error('Create workshop error:', err);
      alert("Erreur création : " + (err.message || "Une erreur est survenue"));
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(p => {
    const matchSearch = 
      (p.nom_atelier || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.telephone || '').includes(search);

    const matchStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? p.is_active !== false :
      p.is_active === false;

    return matchSearch && matchStatus;
  });

  const totalAteliers = profiles.length;
  const activeAteliers = profiles.filter(p => p.is_active !== false).length;
  const suspendedAteliers = totalAteliers - activeAteliers;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* 1. TOP HEADER (Super Admin Brand & Actions) */}
      <header className="bg-slate-900/80 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo & SaaS Badge */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 border border-purple-400/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white tracking-tight">
                  AtelierPro <span className="text-purple-400 font-normal">Super-Admin</span>
                </h1>
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Portail Gestion SaaS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Administration & Contrôle des abonnements ateliers
              </p>
            </div>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCreateModal(true)}
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-purple-600/25 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Créer un Atelier Client</span>
            </button>

            <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>

            <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center border border-purple-500/30">
                AD
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-white leading-tight">Super Administrateur</p>
                <p className="text-[10px] text-slate-400 font-mono">{user?.email}</p>
              </div>
              <button
                onClick={() => signOut()}
                title="Se déconnecter"
                className="p-1.5 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 rounded-lg transition ml-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* 2. MAIN BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Mobile quick create button */}
        <div className="sm:hidden">
          <button
            onClick={() => setCreateModal(true)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl text-xs font-bold shadow-lg"
          >
            <UserPlus className="w-4 h-4" />
            <span>Créer un Atelier Client</span>
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Ateliers Inscrits</p>
                <p className="text-3xl font-black text-white mt-1.5">{totalAteliers}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ateliers Actifs (Abonnés)</p>
                <p className="text-3xl font-black text-emerald-400 mt-1.5">{activeAteliers}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ateliers Suspendus / Expirés</p>
                <p className="text-3xl font-black text-rose-400 mt-1.5">{suspendedAteliers}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {msg && (
          <div className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-3 ${
            msg.type === 'success' 
              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800' 
              : 'bg-rose-950/60 text-rose-300 border border-rose-800'
          }`}>
            {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}

        {/* Controls: Search, Filters & Refresh */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher atelier, email, téléphone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-purple-500 outline-none transition"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  statusFilter === 'all' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tous ({totalAteliers})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  statusFilter === 'active' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Actifs ({activeAteliers})
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  statusFilter === 'inactive' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Suspendus ({suspendedAteliers})
              </button>
            </div>

            <button
              onClick={fetchProfiles}
              disabled={loading}
              title="Actualiser la liste"
              className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* 3. WORKSHOPS TABLE */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Nom de l'Atelier Client</th>
                  <th className="px-6 py-4">Coordonnées</th>
                  <th className="px-6 py-4">Rôle</th>
                  <th className="px-6 py-4">Statut d'Accès</th>
                  <th className="px-6 py-4 text-right">Contrôle Abonnement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                      <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-3 text-purple-500" />
                      <span className="text-sm font-semibold">Chargement des ateliers clients depuis Supabase...</span>
                    </td>
                  </tr>
                ) : filteredProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                      <Users className="w-8 h-8 mx-auto mb-2 text-slate-600 stroke-1" />
                      <p className="text-sm font-semibold text-slate-300">Aucun atelier trouvé</p>
                      <p className="text-xs text-slate-500 mt-1">Cliquez sur "Créer un Atelier Client" pour ajouter votre premier abonné.</p>
                    </td>
                  </tr>
                ) : (
                  filteredProfiles.map(p => {
                    const isActive = p.is_active !== false;
                    const isCurrentAdmin = p.id === user?.id;

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-3.5">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border ${
                              isCurrentAdmin 
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                                : isActive 
                                ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' 
                                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            }`}>
                              {(p.nom_atelier || p.email || 'AT').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm flex items-center gap-2">
                                <span>{p.nom_atelier || 'Atelier sans nom'}</span>
                                {isCurrentAdmin && (
                                  <span className="bg-purple-500/30 text-purple-200 border border-purple-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                                    VOUS (Super-Admin)
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-slate-500 font-mono mt-0.5">
                                ID: {p.id.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4.5 space-y-1">
                          <p className="text-xs text-slate-300 flex items-center gap-2 font-medium">
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span>{p.email || '—'}</span>
                          </p>
                          <p className="text-xs text-slate-400 flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span>{p.telephone || 'Non renseigné'}</span>
                          </p>
                        </td>

                        <td className="px-6 py-4.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            p.role === 'admin' 
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {p.role === 'admin' ? 'Super Admin' : 'Client Atelier'}
                          </span>
                        </td>

                        <td className="px-6 py-4.5">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                              Actif (Autorisé)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                              Suspendu / Bloqué
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4.5 text-right">
                          {isCurrentAdmin ? (
                            <span className="text-xs text-slate-500 italic">Compte Principal</span>
                          ) : (
                            <button
                              onClick={() => handleToggleActive(p.id, isActive)}
                              disabled={actionLoading === p.id}
                              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-lg cursor-pointer ${
                                isActive
                                  ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                              }`}
                            >
                              {actionLoading === p.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Power className="w-3.5 h-3.5" />
                              )}
                              <span>{isActive ? 'Suspendre l’accès' : 'Activer l’accès'}</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. DATA INTEGRITY INFO BANNER */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex items-start gap-4 text-xs text-slate-400">
          <ShieldCheck className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <p className="font-bold text-slate-200 text-sm">Garantie d'intégrité & Conservation des données :</p>
            <p className="text-slate-400">
              La suspension d'un atelier bloque son accès à l'application avec un message de support, mais <strong>ne supprime absolument aucune donnée</strong>. Tous les devis, calculs, profilés et factures restent précieusement conservés dans votre base PostgreSQL Supabase, prêts à être débloqués immédiatement lors du réabonnement.
            </p>
          </div>
        </div>

      </main>

      {/* 5. MODAL: CREER UN ATELIER CLIENT */}
      {createModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 animate-in fade-in">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Créer un Atelier Client</h3>
                  <p className="text-xs text-slate-400">Attribuer des identifiants à un abonné</p>
                </div>
              </div>
              <button 
                onClick={() => setCreateModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkshop} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Nom de l'Atelier / Société *</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={newNom}
                    onChange={e => setNewNom(e.target.value)}
                    placeholder="Ex: Atelier Aluminium Sfax"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Téléphone Atelier</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    placeholder="+216 50 000 000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Adresse Email de Connexion *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="client@atelier.tn"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Mot de Passe Initial *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Ex: Alu2026!#"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white font-mono placeholder:text-slate-600 focus:border-purple-500 outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Vous pourrez communiquer ce mot de passe au client.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 transition cursor-pointer disabled:opacity-50"
                >
                  {createLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Créer le Compte Client</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
