import React, { useState } from 'react';
import { useApp, Fournisseur } from '../../context/AppContext';
import { Building2, Plus, Search, Trash2, X } from 'lucide-react';

export const FournisseursView: React.FC = () => {
  const { fournisseurs, addFournisseur, deleteFournisseur } = useApp();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [nom, setNom] = useState('');
  const [tel, setTel] = useState('');
  const [adresse, setAdresse] = useState('');
  const [dette, setDette] = useState('0');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;
    addFournisseur({
      nom,
      telephone: tel,
      adresse,
      solde_dette: parseFloat(dette) || 0
    });
    setModalOpen(false);
    setNom('');
    setTel('');
    setAdresse('');
    setDette('0');
  };

  const filtered = fournisseurs.filter(f => f.nom.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Fournisseurs</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Gestion des fournisseurs d'aluminium, accessoires & verre ({fournisseurs.length} fournisseurs)
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Fournisseur</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher fournisseur..."
          className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
            <tr>
              <th className="px-5 py-3">Fournisseur</th>
              <th className="px-5 py-3">Téléphone</th>
              <th className="px-5 py-3">Adresse</th>
              <th className="px-5 py-3 text-right">Solde dû (Dette)</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(f => (
              <tr key={f.id} className="hover:bg-gray-50/50">
                <td className="px-5 py-3.5 font-bold text-gray-900">{f.nom}</td>
                <td className="px-5 py-3.5 text-gray-600">{f.telephone}</td>
                <td className="px-5 py-3.5 text-gray-500">{f.adresse || '—'}</td>
                <td className="px-5 py-3.5 text-right font-mono font-bold text-red-600">
                  {f.solde_dette.toFixed(2)} DT
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => { if (confirm(`Supprimer le fournisseur ${f.nom} ?`)) deleteFournisseur(f.id); }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Nouveau Fournisseur</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nom du fournisseur *</label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={e => setNom(e.target.value)}
                  placeholder="Ex: TPR Aluminium"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone</label>
                <input
                  type="text"
                  value={tel}
                  onChange={e => setTel(e.target.value)}
                  placeholder="Ex: 71 234 567"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Adresse</label>
                <input
                  type="text"
                  value={adresse}
                  onChange={e => setAdresse(e.target.value)}
                  placeholder="Ex: Z.I Megrine"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Solde dû (Dette DT)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dette}
                  onChange={e => setDette(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500"
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
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
