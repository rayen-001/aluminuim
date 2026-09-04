import React, { useState } from 'react';
import { useApp, DevisRecord } from '../../context/AppContext';
import { FicheAtelierModal } from './FicheAtelierModal';
import { 
  Building, 
  Plus, 
  Scissors, 
  Search, 
  Layers, 
  CheckCircle, 
  Clock, 
  Trash2, 
  Eye, 
  User, 
  Calendar,
  FileText
} from 'lucide-react';

interface ChantiersViewProps {
  setCurrentTab: (tab: string) => void;
  onEditDevis: (devisId: string) => void;
}

export const ChantiersView: React.FC<ChantiersViewProps> = ({
  setCurrentTab,
  onEditDevis
}) => {
  const { devisList } = useApp();
  const [search, setSearch] = useState('');
  const [selectedDevisForFiche, setSelectedDevisForFiche] = useState<DevisRecord | null>(null);

  // Group quotes by client or project name
  const filteredDevis = devisList.filter(d => {
    const q = search.toLowerCase();
    return (
      d.numero.toLowerCase().includes(q) ||
      (d.client_nom && d.client_nom.toLowerCase().includes(q)) ||
      (d.notes && d.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building className="w-6 h-6 text-blue-600" />
            <span>Chantiers & Fabrication Atelier</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Gestionnaire de projets, débits de barres et fiches de coupe pour l'atelier
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('devis_create')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Chantier / Devis</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par client, chantier, référence..."
          className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Projects Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDevis.map(d => (
          <div
            key={d.id}
            className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md transition p-5 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                    {d.numero}
                  </span>
                  <h3 className="font-bold text-gray-900 text-base mt-2">
                    {d.client_nom || 'Client Particulier'}
                  </h3>
                </div>
                <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-md capitalize">
                  {d.status}
                </span>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>Date : {d.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-gray-400" />
                  <span>{d.items.length} ouvrage{d.items.length > 1 ? 's' : ''} (fenêtres, portes, coulissants)</span>
                </div>
              </div>

              {d.notes && (
                <p className="text-xs bg-gray-50 p-2 rounded-lg text-gray-600 italic line-clamp-2">
                  "{d.notes}"
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedDevisForFiche(d)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-xl transition shadow-xs"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>Fiche Découpe & Débit</span>
              </button>

              <button
                onClick={() => onEditDevis(d.id)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-xl transition"
                title="Modifier les dimensions"
              >
                <FileText className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDevis.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 text-gray-400 space-y-3">
          <Building className="w-12 h-12 mx-auto stroke-1 text-gray-300" />
          <p className="text-sm font-medium">Aucun chantier pour le moment</p>
          <button
            onClick={() => setCurrentTab('devis_create')}
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-xl text-xs hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Créer un nouveau chantier</span>
          </button>
        </div>
      )}

      {/* Fiche Atelier Modal */}
      {selectedDevisForFiche && (
        <FicheAtelierModal
          devis={selectedDevisForFiche}
          onClose={() => setSelectedDevisForFiche(null)}
          onEditDevis={(id) => {
            setSelectedDevisForFiche(null);
            onEditDevis(id);
          }}
        />
      )}
    </div>
  );
};
