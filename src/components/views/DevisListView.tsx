import React, { useState } from 'react';
import { useApp, DevisRecord } from '../../context/AppContext';
import { DevisPrintModal } from './DevisPrintModal';
import { FicheAtelierModal } from './FicheAtelierModal';
import { FAMILIES, getProductTypesForFamily, REMPLISSAGES, MOTIFS } from '../../data/productCatalog';
import { renderAlumDrawing } from '../../utils/productDrawing';
import { ProductVisualizer } from '../common/ProductVisualizer';
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
  Scissors,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  ShieldCheck,
  Maximize2,
  PackageCheck,
  Eye
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
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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

  const getColorBadge = (couleur: string) => {
    const map: Record<string, { label: string; dot: string; bg: string; text: string }> = {
      blanc: { label: 'Blanc', dot: 'bg-white border border-gray-300', bg: 'bg-gray-100', text: 'text-gray-700' },
      gris: { label: 'Gris', dot: 'bg-gray-500', bg: 'bg-gray-100', text: 'text-gray-800' },
      noir: { label: 'Noir', dot: 'bg-gray-900', bg: 'bg-gray-100', text: 'text-gray-900' },
      couleur_mat: { label: 'Couleur Mat', dot: 'bg-amber-600', bg: 'bg-amber-50', text: 'text-amber-800' },
      couleur_givre: { label: 'Couleur Givré', dot: 'bg-teal-500', bg: 'bg-teal-50', text: 'text-teal-800' }
    };
    const c = map[couleur] || { label: couleur, dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-800' };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${c.bg} ${c.text}`}>
        <span className={`w-2 h-2 rounded-full ${c.dot}`} />
        {c.label}
      </span>
    );
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
                  <th className="px-3 py-3 w-10 text-center"></th>
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
                {filteredDevis.map(d => {
                  const isExpanded = expandedIds.has(d.id);
                  return (
                    <React.Fragment key={d.id}>
                      <tr 
                        onClick={() => toggleExpand(d.id)}
                        className={`transition cursor-pointer ${
                          isExpanded 
                            ? 'bg-blue-50/60 font-medium' 
                            : 'hover:bg-blue-50/30'
                        }`}
                      >
                        {/* Toggle Arrow Column */}
                        <td className="px-3 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(d.id);
                            }}
                            title={isExpanded ? "Masquer les produits" : "Voir les produits et détails"}
                            className={`p-1 rounded-md transition ${
                              isExpanded 
                                ? 'bg-blue-600 text-white shadow-xs' 
                                : 'text-gray-400 hover:text-blue-600 hover:bg-gray-100'
                            }`}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Numéro */}
                        <td className="px-4 py-3.5 font-mono font-bold text-blue-700">
                          <div className="flex items-center gap-1.5">
                            <span>{d.numero}</span>
                          </div>
                        </td>

                        {/* Client */}
                        <td className="px-4 py-3.5 font-semibold text-gray-900">
                          {d.client_nom || 'Sans client'}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5 text-gray-600">
                          {d.date}
                        </td>

                        {/* Menuiseries count with badge */}
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">
                            <Layers className="w-3.5 h-3.5 text-gray-500" />
                            {d.items.length} produit{d.items.length > 1 ? 's' : ''}
                          </span>
                        </td>

                        {/* Total TTC */}
                        <td className="px-4 py-3.5 text-right font-mono font-extrabold text-gray-900">
                          {d.totals.total_ttc.toFixed(3)} DT
                        </td>

                        {/* Statut */}
                        <td className="px-4 py-3.5 text-center">
                          {getStatusBadge(d.status)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
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

                      {/* Expandable Details Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 border-y-2 border-blue-200">
                          <td colSpan={8} className="p-3 sm:p-5">
                            <div className="space-y-4">
                              {/* Header inside drawer */}
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs sm:text-sm text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                                    <PackageCheck className="w-4 h-4 text-blue-600" />
                                    Détails des menuiseries & articles ({d.items.length})
                                  </span>
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                                    Devis {d.numero}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFicheDevis(d);
                                    }}
                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 bg-white border border-blue-200 px-2.5 py-1 rounded-lg font-medium shadow-2xs hover:bg-blue-50 transition"
                                  >
                                    <Scissors className="w-3.5 h-3.5" />
                                    <span>Ouvrir Fiche Débit</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditDevis(d.id);
                                    }}
                                    className="inline-flex items-center gap-1 text-gray-700 hover:text-gray-900 bg-white border border-gray-200 px-2.5 py-1 rounded-lg font-medium shadow-2xs hover:bg-gray-50 transition"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Modifier Devis</span>
                                  </button>
                                </div>
                              </div>

                              {/* Products Cards Grid */}
                              <div className="grid grid-cols-1 gap-3">
                                {d.items.map((it, idx) => {
                                  const cost = d.totals?.items_costs?.[idx];
                                  const fam = FAMILIES.find(f => f.id === it.family_id);
                                  const types = getProductTypesForFamily(it.family_id);
                                  const typeDef = types.find(t => t.id === it.product_type_id);
                                  const remplissage = REMPLISSAGES.find(r => r.id === it.remplissage_id);
                                  const motif = MOTIFS.find(m => m.id === it.motif_id);

                                  const surfaceM2 = (parseFloat(String(it.largeur || 0)) / 100) * (parseFloat(String(it.hauteur || 0)) / 100);

                                  return (
                                    <div 
                                      key={idx} 
                                      className="bg-white rounded-xl border border-gray-200/90 p-3.5 sm:p-4 shadow-2xs hover:border-blue-300 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                                    >
                                      {/* Left: Info & Specs */}
                                      <div className="flex-1 space-y-2.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                            {idx + 1}
                                          </span>
                                          <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                                            {it.is_manual 
                                              ? (it.manual_nom || it.manual_designation || 'Article Personnalisé')
                                              : (typeDef?.name || `Produit ${idx + 1}`)}
                                          </h4>
                                          {it.is_manual ? (
                                            <span className="text-[11px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">
                                              Manuel
                                            </span>
                                          ) : fam ? (
                                            <span className="text-[11px] bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded border border-blue-200">
                                              {fam.name}
                                            </span>
                                          ) : null}
                                        </div>

                                        {/* Dimension & Quantity Badges */}
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                                          {it.largeur && it.hauteur ? (
                                            <span className="bg-gray-100 px-2.5 py-1 rounded-md font-mono font-semibold text-gray-800">
                                              📏 {it.largeur} × {it.hauteur} cm
                                              {surfaceM2 > 0 && ` (${surfaceM2.toFixed(2)} m²)`}
                                            </span>
                                          ) : null}

                                          <span className="bg-gray-100 px-2.5 py-1 rounded-md font-semibold text-gray-800">
                                            Qté : <span className="text-blue-700 font-bold">{it.quantity}</span>
                                          </span>

                                          {!it.is_manual && getColorBadge(it.couleur)}
                                        </div>

                                        {/* Specs & Options Chips */}
                                        <div className="flex flex-wrap gap-1.5 text-[11px]">
                                          {/* Remplissage / Vitrage */}
                                          {!it.is_manual && (
                                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium">
                                              🪟 {remplissage ? remplissage.label : (it.remplissage_id || 'Vitrage standard')} ({it.vitrage_type === 'double' ? 'Double vitrage' : 'Simple'})
                                            </span>
                                          )}

                                          {/* Motif */}
                                          {motif && (
                                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium">
                                              ✨ {motif.label}
                                            </span>
                                          )}

                                          {/* Store */}
                                          {it.store_enabled && (
                                            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
                                              + Store rideau : {it.store_lame_type || 'Alu'} ({it.store_couleur || it.couleur}) {it.store_coffre ? `[${it.store_coffre}]` : ''}
                                            </span>
                                          )}

                                          {/* Moustiquaire */}
                                          {it.mousti_enabled && (
                                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                                              + Moustiquaire {it.mousti_largeur && it.mousti_hauteur ? `(${it.mousti_largeur}×${it.mousti_hauteur} cm)` : ''}
                                            </span>
                                          )}

                                          {/* Partie Fixe */}
                                          {it.partie_fixe_type && (
                                            <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded font-medium">
                                              Partie fixe : {it.partie_fixe_type}
                                            </span>
                                          )}

                                          {/* Garde corps specifics */}
                                          {it.is_garde_corps && (
                                            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-medium">
                                              {it.gc_nb_poteaux || 2} poteaux • {it.gc_nb_lignes || 3} lisses
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Center: High-Definition Realistic Product Visualizer */}
                                      <div className="shrink-0 flex items-center justify-center self-center">
                                        <ProductVisualizer 
                                          item={it} 
                                          width={175} 
                                          height={130} 
                                          showDimensions={true}
                                          interactive={true}
                                        />
                                      </div>

                                      {/* Right: Item Cost breakdown */}
                                      <div className="w-full md:w-44 shrink-0 bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-right space-y-1">
                                        <p className="text-[11px] text-gray-500 font-semibold uppercase">Prix Article</p>
                                        {cost ? (
                                          <>
                                            <div className="text-sm sm:text-base font-extrabold text-gray-900 font-mono">
                                              {cost.total_ttc.toFixed(3)} DT <span className="text-[10px] text-gray-500 font-normal">TTC</span>
                                            </div>
                                            <div className="text-xs text-gray-600 font-mono">
                                              HT : {cost.total_ht.toFixed(3)} DT
                                            </div>
                                            {it.quantity > 1 && (
                                              <div className="text-[11px] text-blue-700 font-mono">
                                                {(cost.total_ttc / it.quantity).toFixed(3)} DT / unité
                                              </div>
                                            )}
                                          </>
                                        ) : (
                                          <div className="text-xs text-gray-400 italic">Non calculé</div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Devis Notes & Total Bar */}
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200 text-xs">
                                <div className="text-gray-600">
                                  {d.notes ? (
                                    <p className="italic">
                                      <span className="font-semibold not-italic text-gray-800">📝 Notes du devis : </span>
                                      {d.notes}
                                    </p>
                                  ) : (
                                    <span className="text-gray-400 italic">Aucune note pour ce devis</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 font-mono font-bold text-gray-900 self-end sm:self-auto">
                                  <span className="text-gray-500 font-normal">Total Devis :</span>
                                  <span className="text-blue-700 text-sm font-extrabold">{d.totals.total_ttc.toFixed(3)} DT TTC</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
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
