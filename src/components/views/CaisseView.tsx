import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Wallet, ArrowDownRight, ArrowUpRight, Plus, X } from 'lucide-react';

export const CaisseView: React.FC = () => {
  const { caisseMovements, addCaisseMovement, soldeCaisse } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [type, setType] = useState<'entree' | 'sortie'>('entree');
  const [montant, setMontant] = useState('');
  const [motif, setMotif] = useState('');
  const [mode, setMode] = useState<'especes' | 'cheque' | 'virement'>('especes');
  const [tiers, setTiers] = useState('');

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

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestion Caisse & Trésorerie</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Journal des flux financiers, encaissements et dépenses
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { setType('entree'); setModalOpen(true); }}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Encaissement (Entrée)</span>
          </button>
          <button
            onClick={() => { setType('sortie'); setModalOpen(true); }}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Dépense (Sortie)</span>
          </button>
        </div>
      </div>

      {/* Solde Card */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Solde Total en Caisse</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-1 font-mono">
            {soldeCaisse.toFixed(3)} <span className="text-xl font-bold">DT</span>
          </h2>
        </div>
        <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-xs">
          <Wallet className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Journal Table */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
            <tr>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Motif & Justificatif</th>
              <th className="px-5 py-3">Mode</th>
              <th className="px-5 py-3">Tiers / Client</th>
              <th className="px-5 py-3 text-right">Montant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {caisseMovements.map(m => (
              <tr key={m.id} className="hover:bg-gray-50/50">
                <td className="px-5 py-3.5 text-gray-600">{m.date}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                    m.type === 'entree' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {m.type === 'entree' ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                    {m.type === 'entree' ? 'Entrée' : 'Sortie'}
                  </span>
                </td>
                <td className="px-5 py-3.5 font-bold text-gray-900">{m.motif}</td>
                <td className="px-5 py-3.5 text-gray-600 capitalize">{m.mode_paiement}</td>
                <td className="px-5 py-3.5 text-gray-500">{m.client_ou_tiers || '—'}</td>
                <td className={`px-5 py-3.5 text-right font-mono font-bold text-base ${
                  m.type === 'entree' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {m.type === 'entree' ? '+' : '-'}{m.montant.toFixed(3)} DT
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
