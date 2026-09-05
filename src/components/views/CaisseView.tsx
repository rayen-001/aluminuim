import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Wallet, ArrowDownRight, ArrowUpRight, Plus, X, Search, Trash2, Filter } from 'lucide-react';

export const CaisseView: React.FC = () => {
  const { caisseMovements, addCaisseMovement, deleteCaisseMovement, soldeCaisse } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [type, setType] = useState<'entree' | 'sortie'>('entree');
  const [montant, setMontant] = useState('');
  const [motif, setMotif] = useState('');
  const [mode, setMode] = useState<'especes' | 'cheque' | 'virement'>('especes');
  const [tiers, setTiers] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'entree' | 'sortie'>('all');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(montant) || 0;
    if (val <= 0 || !motif.trim()) return;

    addCaisseMovement({
      date: new Date().toISOString().split('T')[0],
      type,
      montant: val,
      motif,
      mode_paiement: mode,
      client_ou_tiers: tiers
    });

    setModalOpen(false);
    setMontant('');
    setMotif('');
    setTiers('');
  };

  const handleDelete = (id: string) => {
    deleteCaisseMovement(id);
    setDeleteConfirmId(null);
  };

  // KPIs
  const totalEntrees = useMemo(() => {
    return caisseMovements
      .filter(m => m.type === 'entree')
      .reduce((acc, m) => acc + m.montant, 0);
  }, [caisseMovements]);

  const totalSorties = useMemo(() => {
    return caisseMovements
      .filter(m => m.type === 'sortie')
      .reduce((acc, m) => acc + m.montant, 0);
  }, [caisseMovements]);

  // Filtered movements
  const filteredMovements = useMemo(() => {
    return caisseMovements.filter(m => {
      const matchType = filterType === 'all' || m.type === filterType;
      const search = searchTerm.toLowerCase();
      const matchSearch = !searchTerm ||
        (m.motif && m.motif.toLowerCase().includes(search)) ||
        (m.client_ou_tiers && m.client_ou_tiers.toLowerCase().includes(search)) ||
        (m.date && m.date.includes(search)) ||
        (m.mode_paiement && m.mode_paiement.toLowerCase().includes(search));
      return matchType && matchSearch;
    });
  }, [caisseMovements, filterType, searchTerm]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestion Caisse & Trésorerie</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Journal des flux financiers réels, encaissements et dépenses
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { setType('entree'); setModalOpen(true); }}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Encaissement (Entrée)</span>
          </button>
          <button
            onClick={() => { setType('sortie'); setModalOpen(true); }}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Dépense (Sortie)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Solde Card */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-5 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Solde Total en Caisse</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 font-mono">
              {soldeCaisse.toFixed(3)} <span className="text-base font-bold">DT</span>
            </h2>
            <p className="text-[11px] text-blue-300 mt-0.5">Liquidités & fonds réels disponibles</p>
          </div>
          <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-xs shrink-0">
            <Wallet className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Total Entrées */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Entrées (Recettes)</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1 font-mono">
              +{totalEntrees.toFixed(3)} <span className="text-sm font-bold text-gray-700">DT</span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {caisseMovements.filter(m => m.type === 'entree').length} opération(s)
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>

        {/* Total Sorties */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Sorties (Dépenses)</p>
            <h3 className="text-2xl font-extrabold text-red-600 mt-1 font-mono">
              -{totalSorties.toFixed(3)} <span className="text-sm font-bold text-gray-700">DT</span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {caisseMovements.filter(m => m.type === 'sortie').length} opération(s)
            </p>
          </div>
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Tous ({caisseMovements.length})
          </button>
          <button
            onClick={() => setFilterType('entree')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === 'entree' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Entrées ({caisseMovements.filter(m => m.type === 'entree').length})
          </button>
          <button
            onClick={() => setFilterType('sortie')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === 'sortie' ? 'bg-red-600 text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Sorties ({caisseMovements.filter(m => m.type === 'sortie').length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher motif, client, date..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-1.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Journal Table */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
        {filteredMovements.length === 0 ? (
          <div className="text-center py-16 text-gray-400 space-y-2">
            <Wallet className="w-12 h-12 mx-auto stroke-1 text-gray-300" />
            <p className="text-sm">Aucun mouvement trouvé</p>
            <p className="text-xs text-gray-400">
              {caisseMovements.length === 0 ? 'Ajoutez vos encaissements et dépenses pour suivre votre trésorerie.' : 'Essayez de modifier vos critères de recherche.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Motif & Justificatif</th>
                  <th className="px-5 py-3">Mode</th>
                  <th className="px-5 py-3">Tiers / Client</th>
                  <th className="px-5 py-3 text-right">Montant</th>
                  <th className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMovements.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{m.date}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                        m.type === 'entree' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {m.type === 'entree' ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        {m.type === 'entree' ? 'Entrée' : 'Sortie'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-gray-900">{m.motif}</td>
                    <td className="px-5 py-3.5 text-gray-600 capitalize">{m.mode_paiement || 'especes'}</td>
                    <td className="px-5 py-3.5 text-gray-500">{m.client_ou_tiers || '—'}</td>
                    <td className={`px-5 py-3.5 text-right font-mono font-bold text-sm sm:text-base whitespace-nowrap ${
                      m.type === 'entree' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {m.type === 'entree' ? '+' : '-'}{m.montant.toFixed(3)} DT
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => setDeleteConfirmId(m.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Supprimer ce mouvement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Supprimer le mouvement ?</h3>
                <p className="text-xs text-gray-500">Cette action réajustera le solde de caisse immédiatement.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Movement Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                {type === 'entree' ? 'Nouvel Encaissement' : 'Nouvelle Dépense'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Montant (DT) *</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  required
                  value={montant}
                  onChange={e => setMontant(e.target.value)}
                  placeholder="0.000"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Motif / Description *</label>
                <input
                  type="text"
                  required
                  value={motif}
                  onChange={e => setMotif(e.target.value)}
                  placeholder="Ex: Achat quincaillerie, Avance devis..."
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mode de paiement</label>
                <select
                  value={mode}
                  onChange={e => setMode(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="especes">Espèces</option>
                  <option value="cheque">Chèque</option>
                  <option value="virement">Virement</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tiers / Client (optionnel)</label>
                <input
                  type="text"
                  value={tiers}
                  onChange={e => setTiers(e.target.value)}
                  placeholder="Nom de la personne ou société"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white rounded-xl text-xs font-semibold shadow-xs ${
                    type === 'entree' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
