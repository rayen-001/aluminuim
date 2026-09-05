import React, { useState } from 'react';
import { useApp, Fournisseur, AchatFournisseur, PaiementFournisseur } from '../../context/AppContext';
import {
  Building2, Plus, Search, Trash2, Edit2, X,
  Phone, MapPin, TrendingDown, ArrowLeft, ShoppingCart,
  CreditCard, Package, Wallet
} from 'lucide-react';

export const FournisseursView: React.FC = () => {
  const {
    fournisseurs, addFournisseur, updateFournisseur, deleteFournisseur,
    achatsFournisseur, addAchatFournisseur, deleteAchatFournisseur,
    paiementsFournisseur, addPaiementFournisseur, deletePaiementFournisseur
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedF, setSelectedF] = useState<Fournisseur | null>(null);

  // Fournisseur modal states
  const [fModalOpen, setFModalOpen] = useState(false);
  const [editingF, setEditingF] = useState<Fournisseur | null>(null);
  const [fNom, setFNom] = useState('');
  const [fTel, setFTel] = useState('');
  const [fAdresse, setFAdresse] = useState('');

  // Achat modal states
  const [achatModalOpen, setAchatModalOpen] = useState(false);
  const [achatDate, setAchatDate] = useState(new Date().toISOString().split('T')[0]);
  const [achatDesignation, setAchatDesignation] = useState('');
  const [achatMontant, setAchatMontant] = useState('');
  const [achatPayType, setAchatPayType] = useState<'credit' | 'comptant' | 'acompte'>('credit');
  const [achatAcompte, setAchatAcompte] = useState('');
  const [achatMode, setAchatMode] = useState<'especes' | 'cheque' | 'virement'>('especes');
  const [achatNotes, setAchatNotes] = useState('');

  // Paiement modal states
  const [paiementModalOpen, setPaiementModalOpen] = useState(false);
  const [pDate, setPDate] = useState(new Date().toISOString().split('T')[0]);
  const [pMontant, setPMontant] = useState('');
  const [pMode, setPMode] = useState<'especes' | 'cheque' | 'virement'>('especes');
  const [pNotes, setPNotes] = useState('');

  // --- Fournisseur CRUD ---
  const openNewF = () => {
    setEditingF(null);
    setFNom(''); setFTel(''); setFAdresse('');
    setFModalOpen(true);
  };

  const openEditF = (f: Fournisseur) => {
    setEditingF(f);
    setFNom(f.nom); setFTel(f.telephone || ''); setFAdresse(f.adresse || '');
    setFModalOpen(true);
  };

  const handleSaveF = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fNom.trim()) return;
    if (editingF) {
      updateFournisseur(editingF.id, { nom: fNom, telephone: fTel, adresse: fAdresse });
      if (selectedF?.id === editingF.id) {
        setSelectedF(prev => prev ? { ...prev, nom: fNom, telephone: fTel, adresse: fAdresse } : null);
      }
    } else {
      addFournisseur({ nom: fNom, telephone: fTel, adresse: fAdresse, solde_dette: 0 });
    }
    setFModalOpen(false);
  };

  // --- Achat submit ---
  const handleSaveAchat = (e: React.FormEvent) => {
    e.preventDefault();
    const totalM = parseFloat(achatMontant) || 0;
    if (!selectedF || !achatDesignation.trim() || totalM <= 0) return;

    let montantPaye = 0;
    if (achatPayType === 'comptant') {
      montantPaye = totalM;
    } else if (achatPayType === 'acompte') {
      montantPaye = Math.min(totalM, parseFloat(achatAcompte) || 0);
    }

    addAchatFournisseur({
      fournisseur_id: selectedF.id,
      date: achatDate,
      designation: achatDesignation,
      montant: totalM,
      montant_paye: montantPaye,
      mode_paiement: achatMode,
      notes: achatNotes
    });

    setAchatDate(new Date().toISOString().split('T')[0]);
    setAchatDesignation('');
    setAchatMontant('');
    setAchatPayType('credit');
    setAchatAcompte('');
    setAchatNotes('');
    setAchatModalOpen(false);
  };

  // --- Paiement submit ---
  const handleSavePaiement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedF || !pMontant) return;
    addPaiementFournisseur({
      fournisseur_id: selectedF.id,
      date: pDate,
      montant: parseFloat(pMontant) || 0,
      mode_paiement: pMode,
      notes: pNotes
    });
    setPDate(new Date().toISOString().split('T')[0]);
    setPMontant(''); setPNotes(''); setPMode('especes');
    setPaiementModalOpen(false);
  };

  const filtered = fournisseurs.filter(f =>
    f.nom.toLowerCase().includes(search.toLowerCase()) ||
    (f.telephone || '').includes(search)
  );

  const totalDetteAll = fournisseurs.reduce((acc, f) => {
    const fA = achatsFournisseur.filter(a => a.fournisseur_id === f.id);
    const fP = paiementsFournisseur.filter(p => p.fournisseur_id === f.id);
    const totalA = fA.reduce((s, a) => s + a.montant, 0);
    const totalPayeAcomptes = fA.reduce((s, a) => s + (a.montant_paye || 0), 0);
    const totalP = fP.reduce((s, p) => s + p.montant, 0);
    const detteCalculee = Math.max(0, totalA - (totalPayeAcomptes + totalP));
    return acc + (f.solde_dette !== undefined ? f.solde_dette : detteCalculee);
  }, 0);

  // ─── FICHE FOURNISSEUR ──────────────────────────────────────────
  if (selectedF) {
    const achats = achatsFournisseur.filter(a => a.fournisseur_id === selectedF.id);
    const paiements = paiementsFournisseur.filter(p => p.fournisseur_id === selectedF.id);
    const totalAchete = achats.reduce((s, a) => s + a.montant, 0);
    const totalPayeAcomptes = achats.reduce((s, a) => s + (a.montant_paye || 0), 0);
    const totalPayeReglements = paiements.reduce((s, p) => s + p.montant, 0);
    const totalPaye = totalPayeAcomptes + totalPayeReglements;
    const solde = selectedF.solde_dette !== undefined ? selectedF.solde_dette : Math.max(0, totalAchete - totalPaye);

    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Back */}
        <button onClick={() => setSelectedF(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-semibold transition">
          <ArrowLeft className="w-4 h-4" /> Retour aux fournisseurs
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold shrink-0">
            {selectedF.nom.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-gray-900">{selectedF.nom}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
              {selectedF.telephone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{selectedF.telephone}</span>}
              {selectedF.adresse && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{selectedF.adresse}</span>}
            </div>
          </div>
          <button onClick={() => openEditF(selectedF)} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            <Edit2 className="w-3.5 h-3.5" /> Modifier
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Total Acheté</p>
              <p className="text-xl font-extrabold text-blue-900 font-mono">{totalAchete.toFixed(2)} DT</p>
            </div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Total Payé</p>
              <p className="text-xl font-extrabold text-emerald-900 font-mono">{totalPaye.toFixed(2)} DT</p>
            </div>
          </div>
          <div className={`${solde > 0 ? 'bg-red-50' : 'bg-gray-50'} rounded-xl p-4 flex items-center gap-3`}>
            <div className={`w-10 h-10 ${solde > 0 ? 'bg-red-100' : 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
              <TrendingDown className={`w-5 h-5 ${solde > 0 ? 'text-red-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className={`text-xs font-semibold ${solde > 0 ? 'text-red-700' : 'text-gray-500'} uppercase tracking-wide`}>Solde Dû</p>
              <p className={`text-xl font-extrabold font-mono ${solde > 0 ? 'text-red-900' : 'text-gray-400'}`}>{solde.toFixed(2)} DT</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setAchatModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition"
          >
            <Package className="w-4 h-4" /> Enregistrer un Achat
          </button>
          <button
            onClick={() => setPaiementModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition"
          >
            <CreditCard className="w-4 h-4" /> Enregistrer un Paiement
          </button>
        </div>

        {/* Achats table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-900">Historique Achats ({achats.length})</h3>
          </div>
          {achats.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">Aucun achat enregistré</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-semibold">
                  <tr>
                    <th className="px-5 py-2.5">Date</th>
                    <th className="px-5 py-2.5">Désignation</th>
                    <th className="px-5 py-2.5">Règlement Initial</th>
                    <th className="px-5 py-2.5">Notes</th>
                    <th className="px-5 py-2.5 text-right">Montant Total</th>
                    <th className="px-5 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {achats.map(a => {
                    const paye = Number(a.montant_paye || 0);
                    const isFull = paye >= a.montant && a.montant > 0;
                    const isPartial = paye > 0 && paye < a.montant;
                    return (
                      <tr key={a.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{a.date}</td>
                        <td className="px-5 py-3 font-semibold text-gray-900">{a.designation}</td>
                        <td className="px-5 py-3">
                          {isFull ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✓ Comptant ({paye.toFixed(2)} DT)
                            </span>
                          ) : isPartial ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                              ⚡ Acompte ({paye.toFixed(2)} DT)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                              À Crédit (0 DT)
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-gray-400 text-xs">{a.notes || '—'}</td>
                        <td className="px-5 py-3 text-right font-mono font-bold text-blue-700">{a.montant.toFixed(2)} DT</td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => { if (confirm('Supprimer cet achat ?')) deleteAchatFournisseur(a.id); }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-blue-50 border-t border-blue-100">
                  <tr>
                    <td colSpan={4} className="px-5 py-2.5 text-xs font-bold text-blue-700">TOTAL ACHATS</td>
                    <td className="px-5 py-2.5 text-right font-mono font-extrabold text-blue-800">{totalAchete.toFixed(2)} DT</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Paiements table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-gray-900">Historique Règlements Dettes ({paiements.length})</h3>
          </div>
          {paiements.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">Aucun règlement enregistré</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-semibold">
                  <tr>
                    <th className="px-5 py-2.5">Date</th>
                    <th className="px-5 py-2.5">Mode</th>
                    <th className="px-5 py-2.5">Notes</th>
                    <th className="px-5 py-2.5 text-right">Montant Payé</th>
                    <th className="px-5 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paiements.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{p.date}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
                          p.mode_paiement === 'especes' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          p.mode_paiement === 'cheque' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {p.mode_paiement === 'especes' ? 'Espèces' : p.mode_paiement === 'cheque' ? 'Chèque' : 'Virement'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{p.notes || '—'}</td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-emerald-700">{p.montant.toFixed(2)} DT</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => { if (confirm('Supprimer ce paiement ?')) deletePaiementFournisseur(p.id); }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-emerald-50 border-t border-emerald-100">
                  <tr>
                    <td colSpan={3} className="px-5 py-2.5 text-xs font-bold text-emerald-700">TOTAL RÈGLEMENTS</td>
                    <td className="px-5 py-2.5 text-right font-mono font-extrabold text-emerald-800">{totalPayeReglements.toFixed(2)} DT</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Achat Modal */}
        {achatModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">Nouvel Achat — {selectedF.nom}</h3>
                <button onClick={() => setAchatModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSaveAchat} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Date *</label>
                  <input type="date" required value={achatDate} onChange={e => setAchatDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Désignation *</label>
                  <input type="text" required value={achatDesignation} onChange={e => setAchatDesignation(e.target.value)}
                    placeholder="Ex: Profilés TPR 6060 blanc 50m"
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Montant Total (DT) *</label>
                  <input type="number" required step="0.001" min="0.001" value={achatMontant} onChange={e => setAchatMontant(e.target.value)}
                    placeholder="0.000"
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500" />
                </div>

                {/* Mode de règlement à l'achat */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5">
                  <label className="block text-xs font-bold text-gray-800">Règlement à l'achat</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAchatPayType('credit')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition ${
                        achatPayType === 'credit'
                          ? 'bg-red-600 text-white border-red-600 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      À Crédit
                    </button>
                    <button
                      type="button"
                      onClick={() => setAchatPayType('comptant')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition ${
                        achatPayType === 'comptant'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      Comptant
                    </button>
                    <button
                      type="button"
                      onClick={() => setAchatPayType('acompte')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition ${
                        achatPayType === 'acompte'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      Acompte
                    </button>
                  </div>

                  {achatPayType === 'acompte' && (
                    <div className="pt-1">
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">Montant Acompte Payé (DT)</label>
                      <input
                        type="number"
                        step="0.001"
                        min="0.001"
                        max={achatMontant || undefined}
                        value={achatAcompte}
                        onChange={e => setAchatAcompte(e.target.value)}
                        placeholder="Ex: 500.000"
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-mono focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  )}

                  {achatPayType !== 'credit' && (
                    <div className="pt-1">
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">Mode de sortie caisse</label>
                      <select
                        value={achatMode}
                        onChange={e => setAchatMode(e.target.value as any)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="especes">Espèces (Caisse)</option>
                        <option value="cheque">Chèque</option>
                        <option value="virement">Virement bancaire</option>
                      </select>
                    </div>
                  )}

                  {/* Impact Summary */}
                  <div className="text-[11px] bg-white border border-gray-200 rounded-lg p-2.5 text-gray-600 space-y-1">
                    {achatPayType === 'credit' && (
                      <p className="text-red-700 font-medium">
                        🔴 <strong>Sortie Caisse: 0.00 DT</strong>. La dette fournisseur augmentera de <strong>{(parseFloat(achatMontant) || 0).toFixed(2)} DT</strong>.
                      </p>
                    )}
                    {achatPayType === 'comptant' && (
                      <p className="text-emerald-700 font-medium">
                        🟢 <strong>Sortie Caisse: {(parseFloat(achatMontant) || 0).toFixed(2)} DT</strong>. Dette fournisseur créée: <strong>0.00 DT</strong>.
                      </p>
                    )}
                    {achatPayType === 'acompte' && (
                      <p className="text-blue-700 font-medium">
                        🔵 <strong>Sortie Caisse: {(parseFloat(achatAcompte) || 0).toFixed(2)} DT</strong>. Dette fournisseur restante: <strong>{Math.max(0, (parseFloat(achatMontant) || 0) - (parseFloat(achatAcompte) || 0)).toFixed(2)} DT</strong>.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
                  <input type="text" value={achatNotes} onChange={e => setAchatNotes(e.target.value)}
                    placeholder="Optionnel (N° bon de livraison fournisseur...)"
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button type="button" onClick={() => setAchatModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700">Annuler</button>
                  <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold">Enregistrer l'Achat</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Paiement Modal */}
        {paiementModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">Paiement — {selectedF.nom}</h3>
                <button onClick={() => setPaiementModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              {solde > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 font-semibold">
                  Solde actuel dû: {solde.toFixed(2)} DT
                </div>
              )}
              <form onSubmit={handleSavePaiement} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Date *</label>
                  <input type="date" required value={pDate} onChange={e => setPDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Montant payé (DT) *</label>
                  <input type="number" required step="0.001" min="0.001" value={pMontant} onChange={e => setPMontant(e.target.value)}
                    placeholder="0.000"
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm font-mono focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Mode de paiement</label>
                  <select value={pMode} onChange={e => setPMode(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500">
                    <option value="especes">Espèces</option>
                    <option value="cheque">Chèque</option>
                    <option value="virement">Virement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
                  <input type="text" value={pNotes} onChange={e => setPNotes(e.target.value)}
                    placeholder="N° chèque, référence..."
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button type="button" onClick={() => setPaiementModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700">Annuler</button>
                  <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold">Valider</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Fournisseur Edit Modal (shared) */}
        {fModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">{editingF ? 'Modifier Fournisseur' : 'Nouveau Fournisseur'}</h3>
                <button onClick={() => setFModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSaveF} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nom *</label>
                  <input type="text" required value={fNom} onChange={e => setFNom(e.target.value)} placeholder="Ex: TPR Aluminium"
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone</label>
                  <input type="text" value={fTel} onChange={e => setFTel(e.target.value)} placeholder="Ex: 71 234 567"
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Adresse</label>
                  <input type="text" value={fAdresse} onChange={e => setFAdresse(e.target.value)} placeholder="Ex: Z.I Megrine"
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button type="button" onClick={() => setFModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700">Annuler</button>
                  <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold">{editingF ? 'Modifier' : 'Enregistrer'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── LISTE FOURNISSEURS ─────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Fournisseurs</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Gestion des fournisseurs d'aluminium, accessoires &amp; verre ({fournisseurs.length} fournisseurs)
          </p>
        </div>
        <button onClick={openNewF} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition w-fit">
          <Plus className="w-4 h-4" /><span>Nouveau Fournisseur</span>
        </button>
      </div>

      {/* Global debt summary */}
      {totalDetteAll > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Total Dettes Fournisseurs</p>
            <p className="text-xl font-extrabold text-red-800 font-mono">{totalDetteAll.toFixed(2)} DT</p>
          </div>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher fournisseur..."
          className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 space-y-2">
            <Building2 className="w-12 h-12 mx-auto stroke-1 text-gray-300" />
            <p className="text-sm">Aucun fournisseur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                <tr>
                  <th className="px-5 py-3">Fournisseur</th>
                  <th className="px-5 py-3">Téléphone</th>
                  <th className="px-5 py-3">Adresse</th>
                  <th className="px-5 py-3 text-right">Achats</th>
                  <th className="px-5 py-3 text-right">Payé</th>
                  <th className="px-5 py-3 text-right">Solde Dû</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(f => {
                  const fAchats = achatsFournisseur.filter(a => a.fournisseur_id === f.id).reduce((s, a) => s + a.montant, 0);
                  const fPaie = paiementsFournisseur.filter(p => p.fournisseur_id === f.id).reduce((s, p) => s + p.montant, 0);
                  const fSolde = Math.max(0, fAchats - fPaie);
                  return (
                    <tr key={f.id} className="hover:bg-blue-50/30 cursor-pointer" onClick={() => setSelectedF(f)}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-bold text-gray-900">{f.nom}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{f.telephone || '—'}</td>
                      <td className="px-5 py-3.5 text-gray-500">{f.adresse || '—'}</td>
                      <td className="px-5 py-3.5 text-right font-mono text-blue-700">{fAchats.toFixed(2)} DT</td>
                      <td className="px-5 py-3.5 text-right font-mono text-emerald-700">{fPaie.toFixed(2)} DT</td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold">
                        <span className={fSolde > 0 ? 'text-red-600' : 'text-gray-400'}>{fSolde.toFixed(2)} DT</span>
                      </td>
                      <td className="px-5 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditF(f)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition" title="Modifier">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => { if (confirm(`Supprimer ${f.nom} ?`)) deleteFournisseur(f.id); }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Supprimer">
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

      {/* Fournisseur Add Modal */}
      {fModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Nouveau Fournisseur</h3>
              <button onClick={() => setFModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveF} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nom *</label>
                <input type="text" required value={fNom} onChange={e => setFNom(e.target.value)} placeholder="Ex: TPR Aluminium"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone</label>
                <input type="text" value={fTel} onChange={e => setFTel(e.target.value)} placeholder="Ex: 71 234 567"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Adresse</label>
                <input type="text" value={fAdresse} onChange={e => setFAdresse(e.target.value)} placeholder="Ex: Z.I Megrine"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setFModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
