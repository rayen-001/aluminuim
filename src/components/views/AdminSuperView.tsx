import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Users, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Power, 
  RefreshCw, 
  Calendar, 
  Phone, 
  Mail, 
  Building2,
  AlertTriangle,
  UserPlus
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

export const AdminSuperView: React.FC = () => {
  const { user } = useApp();
  const [profiles, setProfiles] = useState<UserProfileSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (err: any) {
      console.error('Fetch profiles error:', err);
      setMsg({ text: "Erreur lors du chargement des comptes ateliers.", type: 'error' });
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Console Super-Admin SaaS
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Gestion des abonnements et activation des comptes ateliers clients
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchProfiles}
            disabled={loading}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Total Ateliers Inscrits</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{totalAteliers}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Comptes Actifs (Abonnés)</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{activeAteliers}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Comptes Suspendus / Expirés</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{suspendedAteliers}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Alert Notification */}
      {msg && (
        <div className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 ${
          msg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher atelier, email, téléphone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl text-xs font-bold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              statusFilter === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tous ({totalAteliers})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              statusFilter === 'active' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Actifs ({activeAteliers})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              statusFilter === 'inactive' ? 'bg-rose-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Suspendus ({suspendedAteliers})
          </button>
        </div>
      </div>

      {/* Table of Workshops */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50/80 text-gray-600 border-b border-gray-200 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Atelier & Contact</th>
                <th className="px-5 py-3.5">Coordonnées</th>
                <th className="px-5 py-3.5">Rôle</th>
                <th className="px-5 py-3.5">Statut Accès</th>
                <th className="px-5 py-3.5 text-right">Actions Contrôle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <span>Chargement des ateliers clients...</span>
                  </td>
                </tr>
              ) : filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-500">
                    Aucun atelier trouvé.
                  </td>
                </tr>
              ) : (
                filteredProfiles.map(p => {
                  const isActive = p.is_active !== false;
                  const isCurrentAdmin = p.id === user?.id;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isActive ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {(p.nom_atelier || p.email || 'AT').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 flex items-center gap-1.5">
                              <span>{p.nom_atelier || 'Atelier sans nom'}</span>
                              {isCurrentAdmin && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                                  VOUS (Super-Admin)
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">
                              ID: {p.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 space-y-1">
                        <p className="text-xs text-gray-700 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span>{p.email || '—'}</span>
                        </p>
                        <p className="text-xs text-gray-600 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span>{p.telephone || 'Non renseigné'}</span>
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold ${
                          p.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {p.role === 'admin' ? 'Super Admin' : 'Client Atelier'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Actif (Autorisé)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                            Suspendu / Inactif
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {isCurrentAdmin ? (
                          <span className="text-xs text-gray-400 italic">Compte Principal</span>
                        ) : (
                          <button
                            onClick={() => handleToggleActive(p.id, isActive)}
                            disabled={actionLoading === p.id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                              isActive
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
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

      {/* Info Card on Data Retention */}
      <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-blue-900">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <p className="font-bold">Garantie d'intégrité des données clients :</p>
          <p className="text-blue-800">
            La suspension d'un compte bloque immédiatement l'accès à l'interface pour le client mais <strong>ne supprime absolument aucune donnée</strong>. Tous les devis, calculs, clients et factures de cet atelier restent stockés et prêts à être réactivés à tout moment lorsque le client renouvelle son abonnement.
          </p>
        </div>
      </div>

    </div>
  );
};
