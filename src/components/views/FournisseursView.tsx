import React, { useState } from 'react';
import { useApp, Fournisseur } from '../../context/AppContext';
import { Building2, Plus, Search, Trash2, Edit2, X, Phone, MapPin, TrendingDown } from 'lucide-react';

export const FournisseursView: React.FC = () => {
  const { fournisseurs, addFournisseur, updateFournisseur, deleteFournisseur } = useApp();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingF, setEditingF] = useState<Fournisseur | null>(null);

  const [nom, setNom] = useState('');
  const [tel, setTel] = useState('');
  const [adresse, setAdresse] = useState('');
  const [email, setEmail] = useState('');
  const [dette, setDette] = useState('0');

  const openNew = () => {
    setEditingF(null);
    setNom('');
    setTel('');
    setAdresse('');
    setEmail('');
    setDette('0');
    setModalOpen(true);
  };

  const openEdit = (f: Fournisseur) => {
    setEditingF(f);
    setNom(f.nom);
    setTel(f.telephone || '');
    setAdresse(f.adresse || '');
    setEmail((f as any).email || '');
    setDette(String(f.solde_dette || 0));
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;

    if (editingF) {
      updateFournisseur(editingF.id, {
        nom,
        telephone: tel,
        adresse,
        solde_dette: parseFloat(dette) || 0
      });
    } else {
      addFournisseur({
        nom,
        telephone: tel,
        adresse,
        solde_dette: parseFloat(dette) || 0
      });
    }
    setModalOpen(false);
  };

  const filtered = fournisseurs.filter(f =>
    f.nom.toLowerCase().includes(search.toLowerCase()) ||
    (f.telephone || '').includes(search)
  );

  const totalDette = fournisseurs.reduce((acc, f) => acc + (f.solde_dette || 0), 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Fournisseurs</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Gestion des fournisseurs d'aluminium, accessoires &amp; verre ({fournisseurs.length} fournisseurs)
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Fournisseur</span>
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
          <TrendingDown className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Total Dettes Fournisseurs</p>
          <p className="text-xl font-extrabold text-red-800 font-mono">{totalDette.toFixed(2)} DT</p>
        </div>
      </div>

      {/* Search */}
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

      {/* Table */}
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
                  <th className="px-5 py-3 text-right">Solde dû (Dette)</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-bold text-gray-900">{f.nom}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {f.telephone || '—'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {f.adresse || '—'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold">
                      <span className={f.solde_dette > 0 ? 'text-red-600' : 'text-gray-400'}>
                        {(f.solde_dette || 0).toFixed(2)} DT
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(f)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Supprimer le fournisseur ${f.nom} ?`)) deleteFournisseur(f.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal Ajouter / Modifier */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                {editingF ? 'Modifier Fournisseur' : 'Nouveau Fournisseur'}
              </h3>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Solde dû / Dette (DT)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={dette}
                  onChange={e => setDette(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  {editingF ? 'Modifier' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
