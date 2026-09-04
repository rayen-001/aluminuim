import React, { useState } from 'react';
import { useApp, FactureRecord } from '../../context/AppContext';
import { Receipt, DollarSign, Printer, CheckCircle, Clock, XCircle, X } from 'lucide-react';

export const FacturesView: React.FC = () => {
  const { factures, addPaymentToFacture } = useApp();

  const [paymentModalFacture, setPaymentModalFacture] = useState<FactureRecord | null>(null);
  const [payMontant, setPayMontant] = useState('');
  const [payMode, setPayMode] = useState<'especes' | 'cheque' | 'virement'>('especes');

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
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Factures</h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Gestion de la facturation et enregistrement des règlements ({factures.length} factures)
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
        {factures.length === 0 ? (
          <div className="text-center py-16 text-gray-400 space-y-2">
            <Receipt className="w-12 h-12 mx-auto stroke-1 text-gray-300" />
            <p className="text-sm">Aucune facture enregistrée</p>
            <p className="text-xs text-gray-400">Convertissez vos devis acceptés en factures directement depuis l'onglet Devis.</p>
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
                  <th className="px-5 py-3 text-center">Statut</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {factures.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5 font-mono font-bold text-blue-700">{f.numero}</td>
                    <td className="px-5 py-3.5 font-bold text-gray-900">{f.client_nom}</td>
                    <td className="px-5 py-3.5 text-gray-600">{f.date}</td>
                    <td className="px-5 py-3.5 text-right font-mono text-gray-700">{f.total_ht.toFixed(3)} DT</td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-gray-900">{f.total_ttc.toFixed(3)} DT</td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-emerald-600">{f.montant_paye.toFixed(3)} DT</td>
                    <td className="px-5 py-3.5 text-center">
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
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {f.status !== 'payee' && (
                          <button
                            onClick={() => openPayment(f)}
                            className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-lg transition"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Régler</span>
                          </button>
                        )}
                        <button
                          onClick={() => window.print()}
                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
                          title="Imprimer Facture"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {paymentModalFacture && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                Enregistrer un paiement : {paymentModalFacture.numero}
              </h3>
              <button onClick={() => setPaymentModalFacture(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Montant à encaisser (DT) *</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Valider le paiement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
