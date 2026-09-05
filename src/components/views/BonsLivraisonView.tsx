import React, { useState, useMemo } from 'react';
import { useApp, BonLivraisonRecord, DevisRecord } from '../../context/AppContext';
import { FAMILIES, getProductTypesForFamily, REMPLISSAGES, MOTIFS } from '../../data/productCatalog';
import { ProductVisualizer } from '../common/ProductVisualizer';
import { FicheAtelierModal } from './FicheAtelierModal';
import { 
  Truck, 
  Printer, 
  Package, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Scissors, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Layers, 
  PackageCheck,
  Building,
  User,
  Calendar,
  X,
  FileText
} from 'lucide-react';

interface BonsLivraisonViewProps {
  setCurrentTab?: (tab: string) => void;
}

export const BonsLivraisonView: React.FC<BonsLivraisonViewProps> = ({ setCurrentTab }) => {
  const { 
    bonsLivraison, 
    devisList, 
    factures, 
    updateBLStatus, 
    deleteBL, 
    settings 
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'en_cours' | 'livre'>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [ficheDevis, setFicheDevis] = useState<DevisRecord | null>(null);
  const [printBL, setPrintBL] = useState<BonLivraisonRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

  // KPIs
  const totalBL = bonsLivraison.length;
  const enCoursCount = bonsLivraison.filter(b => b.status === 'en_cours').length;
  const livresCount = bonsLivraison.filter(b => b.status === 'livre').length;

  const totalArticles = useMemo(() => {
    return bonsLivraison.reduce((acc, bl) => {
      return acc + bl.items.reduce((s, it) => s + (it.quantite || 1), 0);
    }, 0);
  }, [bonsLivraison]);

  // Filtered BL
  const filteredBL = useMemo(() => {
    return bonsLivraison.filter(bl => {
      if (statusFilter !== 'all' && bl.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          bl.numero.toLowerCase().includes(q) ||
          (bl.client_nom && bl.client_nom.toLowerCase().includes(q)) ||
          (bl.devis_numero && bl.devis_numero.toLowerCase().includes(q)) ||
          (bl.date && bl.date.includes(q))
        );
      }
      return true;
    });
  }, [bonsLivraison, statusFilter, search]);

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

  // Helper to get or reconstruct a DevisRecord for Fiche Débit
  const getDevisForBL = (bl: BonLivraisonRecord): DevisRecord | null => {
    if (bl.devis_id) {
      const found = devisList.find(d => d.id === bl.devis_id);
      if (found) return found;
    }
    if (bl.devis_items && bl.devis_items.length > 0) {
      return {
        id: bl.devis_id || bl.id,
        numero: bl.devis_numero || bl.numero,
        client_nom: bl.client_nom,
        date: bl.date,
        items: bl.devis_items,
        marges: {
          margeType: 'percent',
          margeValue: 0,
          margeGcType: 'percent',
          margeGcValue: 0,
          margeMoustiType: 'percent',
          margeMoustiValue: 0,
          margeStoreType: 'percent',
          margeStoreValue: 0,
          tva: 19
        },
        totals: bl.totals || {
          total_brut_ht: 0,
          total_marge: 0,
          total_ht: 0,
          total_tva: 0,
          total_ttc: 0,
          items_costs: []
        },
        status: 'converti',
        created_at: bl.created_at
      };
    }
    return null;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-purple-600" />
            <span>Bons de Livraison</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Gestion des commandes fabriquées, sorties d'atelier et livraisons clients ({bonsLivraison.length} bons générés)
          </p>
        </div>

        {setCurrentTab && (
          <button
            onClick={() => setCurrentTab('devis')}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition w-fit"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Consulter les Devis</span>
          </button>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Total BL */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Bons de Livraison</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1 font-mono">{totalBL}</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Commandes atelier</p>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        {/* En Cours / En Préparation */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">En Préparation / Sortie</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1 font-mono">{enCoursCount}</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">À livrer aux clients</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Livrés & Terminés */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Livrés & Réceptionnés</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1 font-mono">{livresCount}</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Livraisons terminées</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Total Menuiseries */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Volume Menuiseries</p>
            <h3 className="text-2xl font-extrabold text-blue-600 mt-1 font-mono">{totalArticles}</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Pièces fabriquées</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-gray-100 p-1 rounded-xl border border-gray-200/80">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === 'all'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            Tous ({totalBL})
          </button>
          <button
            onClick={() => setStatusFilter('en_cours')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === 'en_cours'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            En cours / Préparation ({enCoursCount})
          </button>
          <button
            onClick={() => setStatusFilter('livre')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === 'livre'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            Livrés ({livresCount})
          </button>
        </div>

        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher numéro BL, client, devis..."
            className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Bons de Livraison Table */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
        {filteredBL.length === 0 ? (
          <div className="text-center py-16 text-gray-400 space-y-2">
            <Truck className="w-12 h-12 mx-auto stroke-1 text-gray-300" />
            <p className="text-sm">Aucun bon de livraison trouvé</p>
            <p className="text-xs text-gray-400">
              {bonsLivraison.length === 0 
                ? "Convertissez vos devis acceptés en Bons de Livraison depuis l'onglet Devis." 
                : "Aucun résultat ne correspond à vos critères de recherche."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                <tr>
                  <th className="w-10 px-3 py-3 text-center"></th>
                  <th className="px-4 py-3">Numéro BL</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Menuiseries</th>
                  <th className="px-4 py-3">Réf. Devis / Facture</th>
                  <th className="px-4 py-3 text-center">Statut Livraison</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBL.map(bl => {
                  const isExpanded = expandedIds.has(bl.id);
                  const devisLinked = getDevisForBL(bl);
                  const linkedFac = factures.find(f => f.devis_id === bl.devis_id || f.id === bl.facture_id);

                  return (
                    <React.Fragment key={bl.id}>
                      <tr 
                        onClick={() => toggleExpand(bl.id)}
                        className={`transition cursor-pointer ${
                          isExpanded 
                            ? 'bg-purple-50/50 font-medium' 
                            : 'hover:bg-purple-50/20'
                        }`}
                      >
                        {/* Toggle Arrow Column */}
                        <td className="px-3 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(bl.id);
                            }}
                            title={isExpanded ? "Masquer les produits" : "Voir les produits et détails"}
                            className={`p-1 rounded-md transition ${
                              isExpanded 
                                ? 'bg-purple-600 text-white shadow-xs' 
                                : 'text-gray-400 hover:text-purple-600 hover:bg-gray-100'
                            }`}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Numéro BL */}
                        <td className="px-4 py-3.5 font-mono font-bold text-purple-700 whitespace-nowrap">
                          {bl.numero}
                        </td>

                        {/* Client */}
                        <td className="px-4 py-3.5 font-bold text-gray-900">
                          {bl.client_nom || 'Sans client'}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                          {bl.date}
                        </td>

                        {/* Menuiseries Badge */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">
                            <Layers className="w-3.5 h-3.5 text-gray-500" />
                            {bl.items.length} produit{bl.items.length > 1 ? 's' : ''} ({bl.items.reduce((s, it) => s + (it.quantite || 1), 0)} pcs)
                          </span>
                        </td>

                        {/* Ref Devis & Facture */}
                        <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            {bl.devis_numero && (
                              <span className="font-mono font-semibold text-blue-700">
                                {bl.devis_numero}
                              </span>
                            )}
                            {linkedFac && (
                              <span className="font-mono text-[11px] text-emerald-700">
                                {linkedFac.numero} ({linkedFac.status === 'payee' ? 'Payée' : 'Impayée'})
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Statut Livraison Toggle */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => updateBLStatus(bl.id, bl.status === 'livre' ? 'en_cours' : 'livre')}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition shadow-2xs ${
                              bl.status === 'livre'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                            }`}
                            title="Cliquer pour changer le statut de livraison"
                          >
                            {bl.status === 'livre' ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Livré</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>En cours</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {devisLinked && (
                              <button
                                onClick={() => setFicheDevis(devisLinked)}
                                title="Fiche Découpage & Débit Atelier"
                                className="p-1.5 text-purple-600 hover:text-white hover:bg-purple-600 bg-purple-50 rounded-lg transition font-semibold"
                              >
                                <Scissors className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => setPrintBL(bl)}
                              title="Imprimer Bon de Livraison"
                              className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-gray-100 rounded-lg transition"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {linkedFac && setCurrentTab && (
                              <button
                                onClick={() => setCurrentTab('factures')}
                                title="Voir Facture"
                                className="p-1.5 text-emerald-600 hover:text-white hover:bg-emerald-600 bg-emerald-50 rounded-lg transition"
                              >
                                <Receipt className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => setDeleteConfirmId(bl.id)}
                              title="Supprimer Bon de Livraison"
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* ═══════════════════════════════════════════════════════ */}
                      {/* ACCORDION EXPANDED: PRODUCT CARDS & VISUAL SVG ENGINE */}
                      {/* ═══════════════════════════════════════════════════════ */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="p-0 border-b border-purple-100 bg-slate-50/60">
                            <div className="p-4 sm:p-5 space-y-4 animate-in fade-in duration-150">
                              {/* Accordion Header */}
                              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200/80">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs sm:text-sm text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                                    <PackageCheck className="w-4 h-4 text-purple-600" />
                                    Détails des Menuiseries à Livrer ({bl.items.length})
                                  </span>
                                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-semibold font-mono">
                                    {bl.numero}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  {devisLinked && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setFicheDevis(devisLinked);
                                      }}
                                      className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 bg-white border border-purple-200 px-2.5 py-1 rounded-lg font-medium shadow-2xs hover:bg-purple-50 transition"
                                    >
                                      <Scissors className="w-3.5 h-3.5" />
                                      <span>Ouvrir Fiche Débit</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPrintBL(bl);
                                    }}
                                    className="inline-flex items-center gap-1 text-gray-700 hover:text-gray-900 bg-white border border-gray-200 px-2.5 py-1 rounded-lg font-medium shadow-2xs hover:bg-gray-50 transition"
                                  >
                                    <Printer className="w-3.5 h-3.5 text-purple-600" />
                                    <span>Imprimer BL</span>
                                  </button>
                                </div>
                              </div>

                              {/* Products Cards Grid */}
                              <div className="grid grid-cols-1 gap-3">
                                {devisLinked && devisLinked.items.length > 0 ? (
                                  devisLinked.items.map((it, idx) => {
                                    const cost = devisLinked.totals?.items_costs?.[idx];
                                    const fam = FAMILIES.find(f => f.id === it.family_id);
                                    const types = getProductTypesForFamily(it.family_id);
                                    const typeDef = types.find(t => t.id === it.product_type_id);
                                    const remplissage = REMPLISSAGES.find(r => r.id === it.remplissage_id);
                                    const motif = MOTIFS.find(m => m.id === it.motif_id);

                                    const surfaceM2 = (parseFloat(String(it.largeur || 0)) / 100) * (parseFloat(String(it.hauteur || 0)) / 100);

                                    return (
                                      <div 
                                        key={idx} 
                                        className="bg-white rounded-xl border border-gray-200/90 p-3.5 sm:p-4 shadow-2xs hover:border-purple-300 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                                      >
                                        {/* Left: Info & Specs */}
                                        <div className="flex-1 space-y-2.5">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
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
                                              <span className="text-[11px] bg-purple-50 text-purple-700 font-medium px-2 py-0.5 rounded border border-purple-200">
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
                                              Qté : <span className="text-purple-700 font-bold">{it.quantity}</span>
                                            </span>

                                            {!it.is_manual && getColorBadge(it.couleur)}
                                          </div>

                                          {/* Specs & Options Chips */}
                                          <div className="flex flex-wrap gap-1.5 text-[11px]">
                                            {!it.is_manual && (
                                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium">
                                                🪟 {remplissage ? remplissage.label : (it.remplissage_id || 'Vitrage standard')} ({it.vitrage_type === 'double' ? 'Double vitrage' : 'Simple'})
                                              </span>
                                            )}

                                            {motif && (
                                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium">
                                                ✨ {motif.label}
                                              </span>
                                            )}

                                            {it.store_enabled && (
                                              <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-semibold">
                                                + Store rideau : {it.store_lame_type || 'Alu'} ({it.store_couleur || it.couleur}) {it.store_coffre ? `[${it.store_coffre}]` : ''}
                                              </span>
                                            )}

                                            {it.mousti_enabled && (
                                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                                                + Moustiquaire {it.mousti_largeur && it.mousti_hauteur ? `(${it.mousti_largeur}×${it.mousti_hauteur} cm)` : ''}
                                              </span>
                                            )}

                                            {it.partie_fixe_type && (
                                              <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded font-medium">
                                                Partie fixe : {it.partie_fixe_type}
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        {/* Center: Dynamic SVG Drawing Visualizer */}
                                        <div className="shrink-0 flex items-center justify-center self-center">
                                          <ProductVisualizer
                                            item={it}
                                            width={175}
                                            height={130}
                                            showDimensions={true}
                                          />
                                        </div>

                                        {/* Right: Item Price */}
                                        {cost && (
                                          <div className="shrink-0 text-right bg-slate-50/80 p-3 rounded-xl border border-slate-100 min-w-[140px]">
                                            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Prix Article</p>
                                            <p className="text-base font-extrabold text-gray-900 font-mono mt-0.5">
                                              {cost.total_ttc.toFixed(3)} <span className="text-xs font-semibold text-gray-600">DT</span>
                                            </p>
                                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                                              HT : {cost.total_ht.toFixed(3)} DT
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })
                                ) : (
                                  /* Fallback when simplified items are present */
                                  bl.items.map((it, idx) => (
                                    <div key={idx} className="bg-white rounded-xl border border-gray-200/90 p-3.5 shadow-2xs flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                                          {idx + 1}
                                        </span>
                                        <div>
                                          <p className="font-bold text-gray-900 text-sm">{it.designation}</p>
                                          {it.largeur && it.hauteur && (
                                            <p className="text-xs text-gray-500 font-mono">
                                              Dimensions : {it.largeur} × {it.hauteur} cm
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <span className="bg-purple-50 text-purple-800 font-bold text-xs px-2.5 py-1 rounded-lg">
                                        Qté : {it.quantite}
                                      </span>
                                    </div>
                                  ))
                                )}
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

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FICHE ATELIER MODAL */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {ficheDevis && (
        <FicheAtelierModal
          devis={ficheDevis}
          onClose={() => setFicheDevis(null)}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Supprimer le Bon de Livraison ?</h3>
                <p className="text-xs text-gray-500">Le devis d'origine repassera en statut « Accepté » s'il n'a pas de facture active.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  deleteBL(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* PRINTABLE BON DE LIVRAISON MODAL (A4 READY) */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {printBL && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150 my-auto">
            {/* Modal Top Bar (Hidden on print) */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 print:hidden">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-gray-900">Impression Bon de Livraison : {printBL.numero}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer / Sauvegarder PDF</span>
                </button>
                <button
                  onClick={() => setPrintBL(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document A4 Body */}
            <div id="printable-bl-content" className="space-y-6 text-gray-900 font-sans p-4">
              {/* Header with Workshop & Client info */}
              <div className="flex justify-between items-start border-b-2 border-purple-600 pb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-purple-900">{settings.nom_atelier || 'ATELIER PRO'}</h2>
                  <p className="text-xs text-gray-600 mt-1">{settings.activite || 'Menuiserie Aluminium & Dérivés'}</p>
                  <p className="text-xs text-gray-600">Tél : {settings.telephone || '+216 -- --- ---'}</p>
                  <p className="text-xs text-gray-600">Adresse : {settings.adresse || 'Tunisie'}</p>
                </div>
                <div className="text-right">
                  <div className="inline-block bg-purple-100 text-purple-900 px-3 py-1 rounded-lg text-sm font-extrabold font-mono mb-2">
                    BON DE LIVRAISON : {printBL.numero}
                  </div>
                  <p className="text-xs text-gray-500">Date d'émission : <span className="font-bold text-gray-800">{printBL.date}</span></p>
                  {printBL.devis_numero && (
                    <p className="text-xs text-gray-500">Réf. Devis : <span className="font-bold text-blue-800 font-mono">{printBL.devis_numero}</span></p>
                  )}
                </div>
              </div>

              {/* Client Box */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-gray-500 font-medium">Destinataire / Client :</span>
                  <p className="text-base font-bold text-gray-900 mt-0.5">{printBL.client_nom || 'Client Particulier'}</p>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 font-medium">Statut de Livraison :</span>
                  <p className="text-sm font-extrabold text-purple-700 capitalize mt-0.5">
                    {printBL.status === 'livre' ? 'Livraison Conforme & Réceptionnée' : 'En cours d\'acheminement'}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-purple-900 text-white font-bold">
                  <tr>
                    <th className="px-3 py-2 w-10 text-center">#</th>
                    <th className="px-4 py-2">Désignation des Menuiseries & Articles</th>
                    <th className="px-4 py-2 text-center">Dimensions (L × H)</th>
                    <th className="px-4 py-2 text-right">Quantité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {printBL.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 text-center font-bold text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-2.5 font-semibold text-gray-900">{it.designation}</td>
                      <td className="px-4 py-2.5 text-center font-mono text-gray-700">
                        {it.largeur && it.hauteur ? `${it.largeur} × ${it.hauteur} cm` : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-purple-900 text-sm">
                        {it.quantite}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary / Total items */}
              <div className="flex justify-end pt-2">
                <div className="bg-purple-50 border border-purple-200 rounded-xl px-5 py-2 text-right">
                  <span className="text-xs text-purple-900 font-semibold">Total Menuiseries Livrées : </span>
                  <span className="text-base font-extrabold text-purple-900 font-mono">
                    {printBL.items.reduce((s, it) => s + (it.quantite || 1), 0)} Pièces
                  </span>
                </div>
              </div>

              {/* Signatures Box */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-200 text-xs">
                <div className="border border-dashed border-gray-300 rounded-xl p-4 h-28 flex flex-col justify-between">
                  <p className="font-bold text-gray-700">Cachet & Signature Atelier :</p>
                  <p className="text-[10px] text-gray-400">Pour accord et sortie d'atelier</p>
                </div>
                <div className="border border-dashed border-gray-300 rounded-xl p-4 h-28 flex flex-col justify-between">
                  <p className="font-bold text-gray-700">Date & Signature Client (Réception) :</p>
                  <p className="text-[10px] text-gray-400">Reconnaît avoir reçu les menuiseries conformes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
