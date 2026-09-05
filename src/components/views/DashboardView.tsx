import React, { useState } from 'react';
import { useApp, FactureRecord } from '../../context/AppContext';
import { 
  Wallet, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  Package, 
  Clock, 
  PlusCircle,
  ChevronRight,
  DollarSign,
  Receipt,
  CheckCircle2,
  Trash2,
  X
} from 'lucide-react';

interface DashboardViewProps {
  setCurrentTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setCurrentTab }) => {
  const { 
    soldeCaisse, 
    clients, 
    devisList, 
    factures, 
    addPaymentToFacture,
    caisseMovements, 
    deleteCaisseMovement,
    settings 
  } = useApp();

  const [paymentModalFacture, setPaymentModalFacture] = useState<FactureRecord | null>(null);
  const [deleteConfirmMovementId, setDeleteConfirmMovementId] = useState<string | null>(null);
  const [payMontant, setPayMontant] = useState('');
  const [payMode, setPayMode] = useState<'especes' | 'cheque' | 'virement'>('especes');

  // Compute total real customer debt / unpaid balances on invoices
  const totalCreances = factures.reduce((acc, f) => {
    return acc + Math.max(0, f.total_ttc - (f.montant_paye || 0));
  }, 0);

  // Invoices that have a remaining unpaid balance
  const facturesImpayees = factures.filter(f => f.status !== 'payee' && (f.total_ttc - (f.montant_paye || 0)) > 0);

  // Devis pipeline (non encore convertis ni refusés)
  const devisEnCours = devisList.filter(d => d.status !== 'converti' && d.status !== 'refuse');
  const totalDevisEnCours = devisEnCours.reduce((acc, d) => acc + (d.totals?.total_ttc || 0), 0);

  // Month entries (Real Cash Flow In)
  const currentMonth = new Date().toISOString().slice(0, 7);
  const entreesMois = caisseMovements
    .filter(m => m.type === 'entree' && m.date.startsWith(currentMonth))
    .reduce((acc, m) => acc + m.montant, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const paiementsJour = caisseMovements.filter(m => m.type === 'entree' && m.date === todayStr);

  const openPayment = (f: FactureRecord) => {
    setPaymentModalFacture(f);
    const restant = Math.max(0, f.total_ttc - f.montant_paye);
    setPayMontant(String(restant));
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

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Notice */}
      <div className="bg-amber-500 text-white px-4 py-3 rounded-xl shadow-xs flex items-center justify-between text-xs sm:text-sm font-medium">
        <div className="flex items-center gap-2">
          <span>✨</span>
          <span>Bienvenue sur AtelierPro — Système de gestion de menuiserie aluminium & calcul de devis.</span>
        </div>
        <span className="hidden md:inline-block opacity-90">Support : {settings.telephone}</span>
      </div>

      {/* Stats Cards Grid (5 Financial KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Solde Caisse Réel */}
        <div className="bg-blue-600 rounded-2xl p-5 text-white shadow-md shadow-blue-600/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Solde Caisse Réel</p>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-1 font-mono">
              {soldeCaisse.toFixed(2)} <span className="text-base font-bold">DT</span>
            </h3>
            <p className="text-[11px] text-blue-200 mt-0.5">Espèces & fonds encaissés</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-xs shrink-0">
            <Wallet className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Card 2: Créances Clients (Factures Impayées) */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Créances Clients (Crédits)</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-orange-600 mt-1 font-mono">
              {totalCreances.toFixed(2)} <span className="text-base font-bold text-gray-700">DT</span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {facturesImpayees.length} facture{facturesImpayees.length > 1 ? 's' : ''} en attente
            </p>
          </div>
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Entrées Mois (Flux Encaissé) */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Entrées du Mois</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1 font-mono">
              {entreesMois.toFixed(2)} <span className="text-base font-bold text-gray-700">DT</span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Total encaissé ce mois</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Devis en Cours (Estimations / Non convertis) */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Devis en Cours</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-indigo-600 mt-1 font-mono">
              {totalDevisEnCours.toFixed(2)} <span className="text-base font-bold text-gray-700">DT</span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {devisEnCours.length} devis non converti{devisEnCours.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setCurrentTab('devis_create')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nouveau Devis Aluminium</span>
        </button>
        <button
          onClick={() => setCurrentTab('factures')}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xs transition"
        >
          <Receipt className="w-4 h-4 text-emerald-600" />
          <span>Facturation & Règlements</span>
        </button>
        <button
          onClick={() => setCurrentTab('articles')}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xs transition"
        >
          <Package className="w-4 h-4 text-blue-600" />
          <span>Catalogue & Prix (318 Profilés)</span>
        </button>
        <button
          onClick={() => setCurrentTab('clients')}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xs transition"
        >
          <Users className="w-4 h-4 text-indigo-600" />
          <span>Gestion Clients ({clients.length})</span>
        </button>
      </div>

      {/* Middle Grid: Créances & Factures Impayées vs Paiements du Jour */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Factures & Créances Impayées */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Créances & Factures Impayées</h3>
                <p className="text-xs text-gray-500">Reste à recouvrer auprès des clients</p>
              </div>
              <button 
                onClick={() => setCurrentTab('factures')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Voir Factures
              </button>
            </div>

            {facturesImpayees.length === 0 ? (
              <div className="text-center py-10 text-gray-400 space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 stroke-1" />
                <p className="text-sm font-medium text-gray-700">Toutes les factures sont réglées !</p>
                <p className="text-xs text-gray-400">Aucune créance client en attente.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[280px] overflow-y-auto">
                {facturesImpayees.slice(0, 6).map(f => {
                  const restant = f.total_ttc - (f.montant_paye || 0);
                  return (
                    <div key={f.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900">{f.client_nom}</p>
                          <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                            {f.numero}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Total : {f.total_ttc.toFixed(2)} DT • Payé : {f.montant_paye.toFixed(2)} DT
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <div>
                          <p className="text-xs text-gray-500">Reste à payer</p>
                          <span className="text-sm font-bold font-mono text-orange-600">
                            {restant.toFixed(2)} DT
                          </span>
                        </div>
                        <button
                          onClick={() => openPayment(f)}
                          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xs transition shrink-0"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Régler</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Paiements du Jour */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Paiements Encaissés du Jour</h3>
              <p className="text-xs text-gray-500">Flux financiers réels entrés en caisse</p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {paiementsJour.length} paiement(s)
            </span>
          </div>

          {paiementsJour.length === 0 ? (
            <div className="text-center py-10 text-gray-400 space-y-2">
              <Clock className="w-10 h-10 mx-auto stroke-1 text-gray-300" />
              <p className="text-sm font-medium">Aucun encaissement enregistré aujourd'hui</p>
              <p className="text-xs text-gray-400">Les règlements apparaîtront ici dès l'encaissement.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[280px] overflow-y-auto">
              {paiementsJour.map(p => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{p.motif}</p>
                    <p className="text-xs text-gray-500">{p.client_ou_tiers || 'Client'} • {p.mode_paiement}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono text-emerald-600">
                      +{p.montant.toFixed(2)} DT
                    </span>
                    <button
                      onClick={() => setDeleteConfirmMovementId(p.id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Supprimer ce mouvement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Card: Mouvements de Caisse récents */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Mouvements de Caisse récents</h3>
            <p className="text-xs text-gray-500">Historique des entrées et sorties réelles</p>
          </div>
          <button 
            onClick={() => setCurrentTab('caisse')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Voir toute la caisse
          </button>
        </div>

        {caisseMovements.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Wallet className="w-10 h-10 mx-auto mb-2 stroke-1 text-gray-300" />
            <p className="text-sm">Aucun mouvement de caisse</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Date</th>
                  <th className="px-4 py-2.5 font-semibold">Type</th>
                  <th className="px-4 py-2.5 font-semibold">Motif</th>
                  <th className="px-4 py-2.5 font-semibold">Mode</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Montant</th>
                  <th className="px-4 py-2.5 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {caisseMovements.slice(0, 5).map(m => (
                  <tr key={m.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 text-gray-600">{m.date}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                        m.type === 'entree' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {m.type === 'entree' ? 'Entrée' : 'Sortie'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{m.motif}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{m.mode_paiement}</td>
                    <td className={`px-4 py-3 text-right font-bold font-mono ${
                      m.type === 'entree' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {m.type === 'entree' ? '+' : '-'}{m.montant.toFixed(2)} DT
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setDeleteConfirmMovementId(m.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Supprimer ce mouvement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Movement Confirm Modal */}
      {deleteConfirmMovementId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Supprimer ce mouvement ?</h3>
                <p className="text-xs text-gray-500">Le solde de caisse et le reste dû de la facture seront ajustés en temps réel.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setDeleteConfirmMovementId(null)}
                className="px-3.5 py-1.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  deleteCaisseMovement(deleteConfirmMovementId);
                  setDeleteConfirmMovementId(null);
                }}
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
                <h3 className="text-base font-bold text-gray-900">Enregistrer un Règlement</h3>
                <p className="text-xs text-gray-500">Facture {paymentModalFacture.numero} • {paymentModalFacture.client_nom}</p>
              </div>
              <button 
                onClick={() => setPaymentModalFacture(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
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
                  <span className="text-gray-500">Reste :</span>
                  <p className="font-bold text-orange-600 font-mono">{(paymentModalFacture.total_ttc - paymentModalFacture.montant_paye).toFixed(3)} DT</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Montant à Encaisser (DT) *</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  max={paymentModalFacture.total_ttc - paymentModalFacture.montant_paye}
                  required
                  value={payMontant}
                  onChange={e => setPayMontant(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-base font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mode de Règlement</label>
                <select
                  value={payMode}
                  onChange={e => setPayMode(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="especes">Espèces (Caisse)</option>
                  <option value="cheque">Chèque bancaire</option>
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
                  Encaisser en Caisse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
