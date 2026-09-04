import React, { useState } from 'react';
import { useApp, Client } from '../../context/AppContext';
import { Users, Plus, Search, Phone, MapPin, Trash2, Edit2, X, AlertCircle } from 'lucide-react';

export const ClientsView: React.FC = () => {
  const { clients, addClient, updateClient, deleteClient } = useApp();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [formNom, setFormNom] = useState('');
  const [formTel, setFormTel] = useState('');
  const [formAdresse, setFormAdresse] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCreance, setFormCreance] = useState('');

  const openNew = () => {
    setEditingClient(null);
    setFormNom('');
    setFormTel('');
    setFormAdresse('');
    setFormEmail('');
    setFormCreance('0');
    setModalOpen(true);
  };

  const openEdit = (c: Client) => {
    setEditingClient(c);
    setFormNom(c.nom);
    setFormTel(c.telephone);
    setFormAdresse(c.adresse || '');
    setFormEmail(c.email || '');
    setFormCreance(String(c.solde_creance || 0));
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNom.trim() || !formTel.trim()) return;

    if (editingClient) {
      updateClient(editingClient.id, {
        nom: formNom,
        telephone: formTel,
        adresse: formAdresse,
        email: formEmail,
        solde_creance: parseFloat(formCreance) || 0
      });
    } else {
      addClient({
        nom: formNom,
        telephone: formTel,
        adresse: formAdresse,
        email: formEmail,
        solde_creance: parseFloat(formCreance) || 0
      });
    }
    setModalOpen(false);
  };

  const filteredClients = clients.filter(c => {
    const q = search.toLowerCase();
    return c.nom.toLowerCase().includes(q) || c.telephone.includes(q);
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Gestion du carnet d'adresses et des créances clients ({clients.length} clients)
          </p>
        </div>

        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Client</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou numéro..."
          className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="text-center py-16 text-gray-400 space-y-2">
            <Users className="w-12 h-12 mx-auto stroke-1 text-gray-300" />
            <p className="text-sm">Aucun client trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                <tr>
                  <th className="px-5 py-3">Nom & Entreprise</th>
                  <th className="px-5 py-3">Téléphone</th>
                  <th className="px-5 py-3">Adresse</th>
                  <th className="px-5 py-3 text-right">Créance (Impayés)</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClients.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5 font-bold text-gray-900">{c.nom}</td>
                    <td className="px-5 py-3.5 text-gray-600">{c.telephone}</td>
                    <td className="px-5 py-3.5 text-gray-500">{c.adresse || '—'}</td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold">
                      <span className={c.solde_creance > 0 ? 'text-orange-600' : 'text-gray-400'}>
                        {c.solde_creance.toFixed(2)} DT
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Supprimer le client ${c.nom} ?`)) deleteClient(c.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                {editingClient ? 'Modifier Client' : 'Nouveau Client'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nom / Société *</label>
                <input
                  type="text"
                  required
                  value={formNom}
                  onChange={e => setFormNom(e.target.value)}
                  placeholder="Ex: Mohamed Ben Ali"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone *</label>
                <input
                  type="text"
                  required
                  value={formTel}
                  onChange={e => setFormTel(e.target.value)}
                  placeholder="Ex: 98 123 456"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Adresse</label>
                <input
                  type="text"
                  value={formAdresse}
                  onChange={e => setFormAdresse(e.target.value)}
                  placeholder="Ex: Ariana, Tunis"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Créance initiale (DT)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formCreance}
                  onChange={e => setFormCreance(e.target.value)}
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
