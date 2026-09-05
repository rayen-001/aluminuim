import React, { useState } from 'react';
import { useApp, Client } from '../../context/AppContext';
import {
  Users, Plus, Search, Phone, MapPin, Trash2, Edit2, X,
  ChevronRight, FileText, Receipt, TrendingUp, AlertCircle, ArrowLeft
} from 'lucide-react';

export const ClientsView: React.FC = () => {
  const { clients, addClient, updateClient, deleteClient, devisList, factures } = useApp();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [formNom, setFormNom] = useState('');
  const [formTel, setFormTel] = useState('');
  const [formAdresse, setFormAdresse] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMatricule, setFormMatricule] = useState('');
  const [formCreance, setFormCreance] = useState('');

  const openNew = () => {
    setEditingClient(null);
    setFormNom(''); setFormTel(''); setFormAdresse('');
    setFormEmail(''); setFormMatricule(''); setFormCreance('0');
    setModalOpen(true);
  };

  const openEdit = (c: Client) => {
    setEditingClient(c);
    setFormNom(c.nom); setFormTel(c.telephone);
    setFormAdresse(c.adresse || ''); setFormEmail(c.email || '');
    setFormMatricule(c.matricule_fiscale || '');
    setFormCreance(String(c.solde_creance || 0));
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNom.trim()) return;
    if (editingClient) {
      updateClient(editingClient.id, {
        nom: formNom.trim(),
        telephone: formTel.trim(),
        adresse: formAdresse.trim(),
        email: formEmail.trim(),
        matricule_fiscale: formMatricule.trim(),
        solde_creance: parseFloat(formCreance) || 0
      });
    } else {
      addClient({
        nom: formNom.trim(),
        telephone: formTel.trim(),
        adresse: formAdresse.trim(),
        email: formEmail.trim(),
        matricule_fiscale: formMatricule.trim(),
        solde_creance: parseFloat(formCreance) || 0
      });
    }
    setModalOpen(false);
  };

  const filteredClients = clients.filter(c => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const nomMatch = (c.nom || '').toLowerCase().includes(q);
    const telMatch = (c.telephone || '').includes(q);
    const adrMatch = (c.adresse || '').toLowerCase().includes(q);
    const mfMatch = (c.matricule_fiscale || '').toLowerCase().includes(q);
    return nomMatch || telMatch || adrMatch || mfMatch;
  });

  // Calculate real-time accurate customer debt (Unpaid invoices + base client debt)
  const getClientCreance = (c: Client): number => {
    const baseDebt = Number(c.solde_creance) || 0;

    const clientFactures = factures.filter(f => {
      const matchName = f.client_nom && f.client_nom.toLowerCase().trim() === c.nom.toLowerCase().trim();
      const linkedDevis = devisList.find(d => d.id === f.devis_id);
      const matchDevis = linkedDevis && (
        linkedDevis.client_id === c.id ||
        (linkedDevis.client_nom && linkedDevis.client_nom.toLowerCase().trim() === c.nom.toLowerCase().trim())
      );
      return matchName || matchDevis;
    });

    const unpaidFactures = clientFactures.reduce((acc, f) => {
      return acc + Math.max(0, f.total_ttc - (f.montant_paye || 0));
    }, 0);

    return baseDebt + unpaidFactures;
  };

  const totalCreances = clients.reduce((a, c) => a + getClientCreance(c), 0);

  // --- Fiche Client ---
  if (selectedClient) {
    const clientDevis = devisList.filter(d => 
      d.client_id === selectedClient.id || 
      (d.client_nom && d.client_nom.toLowerCase().trim() === selectedClient.nom.toLowerCase().trim())
    );
    const clientFactures = factures.filter(f => {
      const d = devisList.find(dv => dv.id === f.devis_id);
      const matchName = f.client_nom && f.client_nom.toLowerCase().trim() === selectedClient.nom.toLowerCase().trim();
      const matchDevis = (d?.client_id === selectedClient.id) || 
                         (d?.client_nom && d.client_nom.toLowerCase().trim() === selectedClient.nom.toLowerCase().trim());
      return matchName || matchDevis;
    });
    const totalDepense = clientFactures.reduce((a, f) => a + f.total_ttc, 0);
    const totalPaye = clientFactures.reduce((a, f) => a + (f.montant_paye || 0), 0);
    const restant = getClientCreance(selectedClient);

    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => setSelectedClient(null)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux clients
        </button>

        {/* Client header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold shrink-0">
            {selectedClient.nom.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-gray-900">{selectedClient.nom}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
              {selectedClient.telephone && (
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{selectedClient.telephone}</span>
              )}
              {selectedClient.adresse && (
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{selectedClient.adresse}</span>
              )}
              {selectedClient.matricule_fiscale && (
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">MF: {selectedClient.matricule_fiscale}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { openEdit(selectedClient); }}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Edit2 className="w-3.5 h-3.5" /> Modifier
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Devis total', value: clientDevis.length, color: 'text-blue-700', bg: 'bg-blue-50' },
            { label: 'Factures', value: clientFactures.length, color: 'text-purple-700', bg: 'bg-purple-50' },
            { label: 'Total facturé', value: `${totalDepense.toFixed(2)} DT`, color: 'text-gray-900', bg: 'bg-gray-50' },
            { label: 'Solde impayé', value: `${restant.toFixed(2)} DT`, color: restant > 0 ? 'text-orange-600' : 'text-emerald-600', bg: restant > 0 ? 'bg-orange-50' : 'bg-emerald-50' },
          ].map(stat => (
            <div key={stat.label} className={`${stat.bg} rounded-xl p-4`}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</p>
              <p className={`text-lg font-extrabold mt-1 ${stat.color} font-mono`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Devis history */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-900">Historique Devis ({clientDevis.length})</h3>
          </div>
          {clientDevis.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">Aucun devis pour ce client</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-semibold">
                  <tr>
                    <th className="px-5 py-2.5">N° Devis</th>
                    <th className="px-5 py-2.5">Date</th>
                    <th className="px-5 py-2.5 text-right">Total TTC</th>
                    <th className="px-5 py-2.5 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clientDevis.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3 font-mono font-bold text-blue-700">{d.numero}</td>
                      <td className="px-5 py-3 text-gray-600">{d.date}</td>
                      <td className="px-5 py-3 text-right font-mono font-bold">{d.totals?.total_ttc?.toFixed(2) ?? '—'} DT</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
                          d.status === 'accepte' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          d.status === 'converti' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          d.status === 'refuse' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                          {d.status === 'brouillon' ? 'Brouillon' : d.status === 'envoye' ? 'Envoyé' :
                           d.status === 'accepte' ? 'Accepté' : d.status === 'refuse' ? 'Refusé' : 'Converti'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Factures history */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-gray-900">Historique Factures ({clientFactures.length})</h3>
          </div>
          {clientFactures.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">Aucune facture pour ce client</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-semibold">
                  <tr>
                    <th className="px-5 py-2.5">N° Facture</th>
                    <th className="px-5 py-2.5">Date</th>
                    <th className="px-5 py-2.5 text-right">Total TTC</th>
                    <th className="px-5 py-2.5 text-right">Payé</th>
                    <th className="px-5 py-2.5 text-right">Restant</th>
                    <th className="px-5 py-2.5 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clientFactures.map(f => (
                    <tr key={f.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3 font-mono font-bold text-purple-700">{f.numero}</td>
                      <td className="px-5 py-3 text-gray-600">{f.date}</td>
                      <td className="px-5 py-3 text-right font-mono font-bold">{f.total_ttc.toFixed(2)} DT</td>
                      <td className="px-5 py-3 text-right font-mono text-emerald-600">{f.montant_paye.toFixed(2)} DT</td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-orange-600">
                        {Math.max(0, f.total_ttc - f.montant_paye).toFixed(2)} DT
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
                          f.status === 'payee' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          f.status === 'partielle' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {f.status === 'payee' ? 'Payée' : f.status === 'partielle' ? 'Partielle' : 'Impayée'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Liste Clients ---
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

      {/* Summary */}
      {totalCreances > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-orange-700">Total créances impayées</p>
            <p className="text-lg font-extrabold text-orange-800 font-mono">{totalCreances.toFixed(2)} DT</p>
          </div>
        </div>
      )}

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
                  <th className="px-5 py-3">Nom &amp; Coordonnées</th>
                  <th className="px-5 py-3">Téléphone</th>
                  <th className="px-5 py-3">Adresse</th>
                  <th className="px-5 py-3 text-right">Créance (Impayés)</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClients.map(c => (
                  <tr
                    key={c.id}
                    className="hover:bg-blue-50/30 cursor-pointer"
                    onClick={() => setSelectedClient(c)}
                  >
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-bold text-gray-900">{c.nom}</p>
                        {c.matricule_fiscale && (
                          <p className="text-xs text-gray-400 font-mono">MF: {c.matricule_fiscale}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{c.telephone || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-500">{c.adresse || '—'}</td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold">
                      {(() => {
                        const creance = getClientCreance(c);
                        return (
                          <span className={creance > 0 ? 'inline-block px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 font-extrabold text-xs sm:text-sm' : 'text-gray-400 font-normal'}>
                            {creance.toFixed(2)} DT
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-5 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedClient(c)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
                          title="Voir la fiche client"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Supprimer le client ${c.nom} ?`)) deleteClient(c.id);
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
                  type="text" required value={formNom} onChange={e => setFormNom(e.target.value)}
                  placeholder="Ex: Mohamed Ben Ali"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone <span className="text-gray-400 font-normal">(Optionnel)</span></label>
                <input
                  type="text" value={formTel} onChange={e => setFormTel(e.target.value)}
                  placeholder="Ex: 98 123 456"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Adresse</label>
                <input
                  type="text" value={formAdresse} onChange={e => setFormAdresse(e.target.value)}
                  placeholder="Ex: Ariana, Tunis"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)}
                  placeholder="Ex: client@email.com"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Matricule Fiscale</label>
                <input
                  type="text" value={formMatricule} onChange={e => setFormMatricule(e.target.value)}
                  placeholder="Ex: 1234567A/P/M/000"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Créance initiale (DT)</label>
                <input
                  type="number" step="0.1" min="0" value={formCreance} onChange={e => setFormCreance(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button" onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  {editingClient ? 'Modifier' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
