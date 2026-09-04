import React, { useState } from 'react';
import { useApp, DevisRecord } from '../../context/AppContext';
import { DevisPrintModal } from './DevisPrintModal';
import { FicheAtelierModal } from './FicheAtelierModal';
import { 
  Plus, 
  Search, 
  FileText, 
  Copy, 
  Printer, 
  Trash2, 
  Edit3, 
  Truck, 
  Receipt, 
  CheckCircle, 
  Clock, 
  XCircle,
  MoreVertical,
  Scissors
} from 'lucide-react';

interface DevisListViewProps {
  setCurrentTab: (tab: string) => void;
  onEditDevis: (devisId: string) => void;
}

export const DevisListView: React.FC<DevisListViewProps> = ({
  setCurrentTab,
  onEditDevis
}) => {
  const { 
    devisList, 
    deleteDevis, 
    duplicateDevis, 
    updateDevisStatus, 
    convertToBL, 
    convertToFacture 
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [printDevis, setPrintDevis] = useState<DevisRecord | null>(null);
  const [ficheDevis, setFicheDevis] = useState<DevisRecord | null>(null);

  const filteredDevis = devisList.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        d.numero.toLowerCase().includes(q) ||
        (d.client_nom && d.client_nom.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getStatusBadge = (status: DevisRecord['status']) => {
    switch (status) {
      case 'accepte':
        return <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-emerald-200">Accepté</span>;
      case 'envoye':
        return <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-blue-200">Envoyé</span>;
      case 'refuse':
        return <span className="bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-red-200">Refusé</span>;
      case 'converti':
        return <span className="bg-purple-50 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-purple-200">Converti</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-md">Brouillon</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Devis Aluminium</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Consultez, imprimez et convertissez vos devis ({devisList.length} devis enregistrés)
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('devis_create')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Devis</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-gray-100 p-1 rounded-xl border border-gray-200/80">
          {[
            { id: 'all', label: 'Tous' },
            { id: 'brouillon', label: 'Brouillons' },
            { id: 'envoye', label: 'Envoyés' },
            { id: 'accepte', label: 'Acceptés' },
            { id: 'converti', label: 'Convertis' },
            { id: 'refuse', label: 'Refusés' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par client ou numéro..."
            className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Devis List Table */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
        {filteredDevis.length === 0 ? (
          <div className="text-center py-16 text-gray-400 space-y-3">
            <FileText className="w-12 h-12 mx-auto stroke-1 text-gray-300" />
            <p className="text-sm font-medium">Aucun devis trouvé</p>
            <button
              onClick={() => setCurrentTab('devis_create')}
              className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-blue-100 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Créer le premier devis</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                <tr>
                  <th className="px-4 py-3">Numéro</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Menuiseries</th>
                  <th className="px-4 py-3 text-right">Total TTC</th>
                  <th className="px-4 py-3 text-center">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDevis.map(d => (
                  <tr key={d.id} className="hover:bg-blue-50/30 transition">
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-700">
                      {d.numero}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-gray-900">
                      {d.client_nom || 'Sans client'}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">
                      {d.date}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">
                      {d.items.length} produit{d.items.length > 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-extrabold text-gray-900">
                      {d.totals.total_ttc.toFixed(3)} DT
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {getStatusBadge(d.status)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setFicheDevis(d)}
                          title="Fiche Découpage & Débit Atelier"
                          className="p-1.5 text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 rounded-lg transition font-semibold"
                        >
                          <Scissors className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPrintDevis(d)}
                          title="Imprimer / PDF"
                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditDevis(d.id)}
                          title="Modifier"
                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => duplicateDevis(d.id)}
                          title="Dupliquer"
                          className="p-1.5 text-gray-600 hover:text-orange-600 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Convertir ce devis en Bon de Livraison ?')) {
                              convertToBL(d.id);
                              setCurrentTab('bl');
                            }
                          }}
                          title="Convertir en BL"
                          className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Truck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Convertir ce devis en Facture ?')) {
                              convertToFacture(d.id);
                              setCurrentTab('factures');
                            }
                          }}
                          title="Convertir en Facture"
                          className="p-1.5 text-gray-600 hover:text-emerald-600 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
                              deleteDevis(d.id);
                            }
                          }}
                          title="Supprimer"
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

      {/* Print / Preview Modal */}
      {printDevis && (
        <DevisPrintModal
          devis={printDevis}
          onClose={() => setPrintDevis(null)}
        />
      )}

      {/* Fiche Atelier (ALU CALCUL) Modal */}
      {ficheDevis && (
        <FicheAtelierModal
          devis={ficheDevis}
          onClose={() => setFicheDevis(null)}
          onEditDevis={(id) => {
            setFicheDevis(null);
            onEditDevis(id);
          }}
        />
      )}
    </div>
  );
};
