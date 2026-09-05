import React, { useState, useMemo } from 'react';
import { useApp, FactureRecord } from '../../context/AppContext';
import { 
  Receipt, 
  DollarSign, 
  Printer, 
  Trash2, 
  X, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp,
  Clock
} from 'lucide-react';

export const FacturesView: React.FC = () => {
  const { factures, addPaymentToFacture, deleteFacture } = useApp();

  const [paymentModalFacture, setPaymentModalFacture] = useState<FactureRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [payMontant, setPayMontant] = useState('');
  const [payMode, setPayMode] = useState<'especes' | 'cheque' | 'virement'>('especes');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'impayee' | 'partielle' | 'payee'>('all');

  const openPayment = (f: FactureRecord) => {
    setPaymentModalFacture(f);
    const restant = Math.max(0, f.total_ttc - (f.montant_paye || 0));
    setPayMontant(String(restant.toFixed(3)));
    setPayMode('especes');
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalFacture) return;
    const m = parseFloat(payMontant) || 0;
    if (m <= 0) return;
    addPaymentToFacture(paymentModalFacture.id, m, payMode);
    setPaymentModalFacture(null);
  };

  const handleDelete = (id: string) => {
    deleteFacture(id);
    setDeleteConfirmId(null);
  };

  // Financial KPIs
  const totalFacture = useMemo(() => {
    return factures.reduce((acc, f) => acc + (f.total_ttc || 0), 0);
  }, [factures]);

  const totalEncaisse = useMemo(() => {
    return factures.reduce((acc, f) => acc + (f.montant_paye || 0), 0);
  }, [factures]);

  const totalCreances = useMemo(() => {
    return factures.reduce((acc, f) => acc + Math.max(0, (f.total_ttc || 0) - (f.montant_paye || 0)), 0);
  }, [factures]);

  // Filtered list
  const filteredFactures = useMemo(() => {
    return factures.filter(f => {
      const matchStatus = filterStatus === 'all' || f.status === filterStatus;
      const search = searchTerm.toLowerCase();
      const matchSearch = !searchTerm ||
        (f.numero && f.numero.toLowerCase().includes(search)) ||
        (f.client_nom && f.client_nom.toLowerCase().includes(search)) ||
        (f.date && f.date.includes(search));
      return matchStatus && matchSearch;
    });
  }, [factures, filterStatus, searchTerm]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Factures & Règlements</h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Suivi de la facturation, encaissements et gestion des créances clients ({factures.length} factures)
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Facturé */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Facturé TTC</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1 font-mono">
              {totalFacture.toFixed(3)} <span className="text-sm font-bold text-gray-600">DT</span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">{factures.length} facture(s) émises</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Total Encaissé */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Encaissé (Payé)</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1 font-mono">
              {totalEncaisse.toFixed(3)} <span className="text-sm font-bold text-gray-600">DT</span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Entré en caisse</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Total Créances / Reste Dû */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Créances Clients (Reste Dû)</p>
            <h3 className="text-2xl font-extrabold text-orange-600 mt-1 font-mono">
              {totalCreances.toFixed(3)} <span className="text-sm font-bold text-gray-600">DT</span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {factures.filter(f => f.status !== 'payee').length} facture(s) en attente
            </p>
          </div>
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterStatus === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Toutes ({factures.length})
          </button>
          <button
            onClick={() => setFilterStatus('impayee')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterStatus === 'impayee' ? 'bg-red-600 text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Impayées ({factures.filter(f => f.status === 'impayee').length})
          </button>
          <button
            onClick={() => setFilterStatus('partielle')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterStatus === 'partielle' ? 'bg-amber-500 text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Partielles ({factures.filter(f => f.status === 'partielle').length})
          </button>
          <button
            onClick={() => setFilterStatus('payee')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterStatus === 'payee' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Payées ({factures.filter(f => f.status === 'payee').length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher numéro, client..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-1.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Factures Table */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
        {filteredFactures.length === 0 ? (
          <div className="text-center py-16 text-gray-400 space-y-2">
            <Receipt className="w-12 h-12 mx-auto stroke-1 text-gray-300" />
            <p className="text-sm">Aucune facture trouvée</p>
            <p className="text-xs text-gray-400">
              {factures.length === 0 
                ? "Convertissez vos devis acceptés en factures directement depuis l'onglet Devis." 
                : "Aucun résultat ne correspond à vos filtres."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                <tr>
                  <th className="px-5 py-3">Numéro</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Total HT</th>
                  <th className="px-5 py-3 text-right">Total TTC</th>
                  <th className="px-5 py-3 text-right">Payé</th>
                  <th className="px-5 py-3 text-right">Reste Dû</th>
                  <th className="px-5 py-3 text-center">Statut</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFactures.map(f => {
                  const resteDu = Math.max(0, (f.total_ttc || 0) - (f.montant_paye || 0));
                  return (
                    <tr key={f.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-5 py-3.5 font-mono font-bold text-blue-700 whitespace-nowrap">{f.numero}</td>
                      <td className="px-5 py-3.5 font-bold text-gray-900">{f.client_nom}</td>
                      <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{f.date}</td>
                      <td className="px-5 py-3.5 text-right font-mono text-gray-700 whitespace-nowrap">{f.total_ht.toFixed(3)} DT</td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-gray-900 whitespace-nowrap">{f.total_ttc.toFixed(3)} DT</td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-emerald-600 whitespace-nowrap">{f.montant_paye.toFixed(3)} DT</td>
                      <td className={`px-5 py-3.5 text-right font-mono font-bold whitespace-nowrap ${resteDu > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                        {resteDu.toFixed(3)} DT
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        {f.status === 'payee' ? (
                          <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-emerald-200">
                            Payée
                          </span>
                        ) : f.status === 'partielle' ? (
                          <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-amber-200">
                            Partielle
                          </span>
                        ) : (
                          <span className="bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-red-200">
                            Impayée
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {f.status !== 'payee' && (
                            <button
                              onClick={() => openPayment(f)}
                              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xs transition"
                              title="Enregistrer un paiement"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>Régler</span>
                            </button>
                          )}
                          <button
                            onClick={() => window.print()}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
                            title="Imprimer Facture"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(f.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Supprimer cette facture"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                <h3 className="text-sm font-bold text-gray-900">Supprimer cette facture ?</h3>
                <p className="text-xs text-gray-500">Le devis d'origine repassera en statut « Accepté » pour pouvoir être re-converti si nécessaire.</p>
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

      {/* Payment Modal */}
      {paymentModalFacture && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Règlement de facture : {paymentModalFacture.numero}
                </h3>
                <p className="text-xs text-gray-500">{paymentModalFacture.client_nom}</p>
              </div>
              <button 
                onClick={() => setPaymentModalFacture(null)} 
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 flex justify-between items-center text-xs">
                <div>
                  <span className="text-gray-500">Total Facture :</span>
                  <p className="font-bold text-gray-900 font-mono">{paymentModalFacture.total_ttc.toFixed(3)} DT</p>
                </div>
                <div>
                  <span className="text-gray-500">Déjà Payé :</span>
                  <p className="font-bold text-emerald-600 font-mono">{paymentModalFacture.montant_paye.toFixed(3)} DT</p>
                </div>
                <div>
                  <span className="text-gray-500">Reste Dû :</span>
                  <p className="font-bold text-orange-600 font-mono">
                    {(paymentModalFacture.total_ttc - paymentModalFacture.montant_paye).toFixed(3)} DT
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Montant à encaisser (DT) *</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  max={paymentModalFacture.total_ttc - paymentModalFacture.montant_paye}
                  required
                  value={payMontant}
                  onChange={e => setPayMontant(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mode de règlement</label>
                <select
                  value={payMode}
                  onChange={e => setPayMode(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="especes">Espèces (Caisse)</option>
                  <option value="cheque">Chèque</option>
                  <option value="virement">Virement bancaire</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setPaymentModalFacture(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  Valider et Encaisser
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
