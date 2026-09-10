import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useApp, BonLivraisonRecord, DevisRecord } from '../../context/AppContext';
import { FAMILIES, getProductTypesForFamily, REMPLISSAGES, MOTIFS } from '../../data/productCatalog';
import { ProductVisualizer } from '../common/ProductVisualizer';
import { FicheAtelierModal } from './FicheAtelierModal';
import { DevisPrintModal } from './DevisPrintModal';
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
  FileText,
  MapPin,
  Car,
  Edit3
} from 'lucide-react';

interface BonsLivraisonViewProps {
  setCurrentTab?: (tab: string) => void;
}

export const BonsLivraisonView: React.FC<BonsLivraisonViewProps> = ({ setCurrentTab }) => {
  const { 
    bonsLivraison, 
    devisList, 
    factures, 
    clients,
    updateBLStatus, 
    updateBLTransport,
    deleteBL, 
    settings 
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'en_cours' | 'livre'>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [ficheDevis, setFicheDevis] = useState<DevisRecord | null>(null);
  const [printBL, setPrintBL] = useState<BonLivraisonRecord | null>(null);
  const [printDevisModal, setPrintDevisModal] = useState<DevisRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Edit Transport modal state
  const [editTransportBL, setEditTransportBL] = useState<BonLivraisonRecord | null>(null);
  const [driverName, setDriverName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [destinationText, setDestinationText] = useState('');
  const [exitHour, setExitHour] = useState('');

  const openEditTransport = (bl: BonLivraisonRecord) => {
    setEditTransportBL(bl);
    setDriverName(bl.chauffeur || '');
    setPlateNumber(bl.matricule_vehicule || '');
    const clientMatch = clients.find(c => c.nom.toLowerCase() === (bl.client_nom || '').toLowerCase());
    setDestinationText(bl.destination || bl.notes || clientMatch?.adresse || '');
    setExitHour(bl.heure_sortie || new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
  };

  const handleSaveTransport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTransportBL) return;
    updateBLTransport(editTransportBL.id, {
      chauffeur: driverName.trim(),
      matricule_vehicule: plateNumber.trim(),
      destination: destinationText.trim(),
      heure_sortie: exitHour.trim()
    });
    setEditTransportBL(null);
  };

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
          (bl.chauffeur && bl.chauffeur.toLowerCase().includes(q)) ||
          (bl.matricule_vehicule && bl.matricule_vehicule.toLowerCase().includes(q)) ||
          (bl.destination && bl.destination.toLowerCase().includes(q)) ||
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
            <span>Bons de Sortie & Livraison</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Gestion des sorties d'atelier, transport routier et livraisons chantiers ({bonsLivraison.length} bons générés)
          </p>
        </div>

        {setCurrentTab && (
          <button
            onClick={() => setCurrentTab('devis')}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition w-fit cursor-pointer"
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
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Bons de Sortie & BL</p>
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
            <p className="text-[11px] text-gray-500 mt-0.5">À transporter & livrer</p>
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
            <p className="text-[11px] text-gray-500 mt-0.5">Pièces chargées</p>
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
            placeholder="Rechercher numéro BL, client, chauffeur, destination..."
            className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Bons de Livraison Table */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
        {filteredBL.length === 0 ? (
          <div className="text-center py-16 text-gray-400 space-y-2">
            <Truck className="w-12 h-12 mx-auto stroke-1 text-gray-300" />
            <p className="text-sm">Aucun bon de sortie / livraison trouvé</p>
            <p className="text-xs text-gray-400">
              {bonsLivraison.length === 0 
                ? "Convertissez vos devis acceptés en Bons de Sortie & Livraison depuis l'onglet Devis." 
                : "Aucun résultat ne correspond à vos critères de recherche."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                <tr>
                  <th className="w-10 px-3 py-3 text-center"></th>
                  <th className="px-4 py-3">Numéro</th>
                  <th className="px-4 py-3">Client & Transport</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Menuiseries</th>
                  <th className="px-4 py-3">Réf. Devis / Facture</th>
                  <th className="px-4 py-3 text-center">Statut</th>
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

                        {/* Client & Transport info */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-0.5">
                            <p className="font-bold text-gray-900">{bl.client_nom || 'Sans client'}</p>
                            {(bl.chauffeur || bl.matricule_vehicule || bl.destination) && (
                              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-600 font-sans">
                                {bl.chauffeur && (
                                  <span className="inline-flex items-center gap-1 text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded font-medium">
                                    <User className="w-3 h-3 text-purple-600" />
                                    {bl.chauffeur}
                                  </span>
                                )}
                                {bl.matricule_vehicule && (
                                  <span className="inline-flex items-center gap-1 text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded font-mono font-semibold">
                                    <Car className="w-3 h-3 text-gray-500" />
                                    {bl.matricule_vehicule}
                                  </span>
                                )}
                                {bl.destination && (
                                  <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                                    <MapPin className="w-3 h-3 text-slate-500" />
                                    {bl.destination}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
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
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition shadow-2xs cursor-pointer ${
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
                            {/* Renseigner Chauffeur & Véhicule */}
                            <button
                              onClick={() => openEditTransport(bl)}
                              title="Renseigner Chauffeur, Véhicule & Destination (Police / 7akem)"
                              className="p-1.5 text-amber-800 hover:text-white hover:bg-amber-600 bg-amber-50 rounded-lg transition font-semibold cursor-pointer"
                            >
                              <Truck className="w-4 h-4" />
                            </button>

                            {devisLinked && (
                              <button
                                onClick={() => setPrintDevisModal(devisLinked)}
                                title="Imprimer Devis & Proposition Technique"
                                className="p-1.5 text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 rounded-lg transition font-semibold cursor-pointer"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                            )}

                            {devisLinked && (
                              <button
                                onClick={() => setFicheDevis(devisLinked)}
                                title="Fiche Découpage & Débit Atelier"
                                className="p-1.5 text-purple-600 hover:text-white hover:bg-purple-600 bg-purple-50 rounded-lg transition font-semibold cursor-pointer"
                              >
                                <Scissors className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => setPrintBL(bl)}
                              title="Imprimer Bon de Sortie & Livraison"
                              className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {linkedFac && setCurrentTab && (
                              <button
                                onClick={() => setCurrentTab('factures')}
                                title="Voir Facture"
                                className="p-1.5 text-emerald-600 hover:text-white hover:bg-emerald-600 bg-emerald-50 rounded-lg transition cursor-pointer"
                              >
                                <Receipt className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => setDeleteConfirmId(bl.id)}
                              title="Supprimer Bon de Livraison"
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
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
                                  <PackageCheck className="w-5 h-5 text-purple-600" />
                                  <h4 className="text-sm font-bold text-gray-900">
                                    Détails des {bl.items.length} menuiserie(s) pour {bl.client_nom}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => openEditTransport(bl)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold border border-amber-200 transition cursor-pointer"
                                  >
                                    <Truck className="w-3.5 h-3.5" />
                                    <span>Transport : {bl.chauffeur ? `${bl.chauffeur} (${bl.matricule_vehicule || 'Sans plaque'})` : 'Non renseigné'}</span>
                                  </button>
                                  {devisLinked && (
                                    <button
                                      onClick={() => setFicheDevis(devisLinked)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                                    >
                                      <Scissors className="w-3.5 h-3.5" />
                                      <span>Fiche Découpe Atelier</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setPrintBL(bl)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                                  >
                                    <Printer className="w-3.5 h-3.5 text-purple-600" />
                                    <span>Imprimer Bon de Sortie</span>
                                  </button>
                                </div>
                              </div>

                              {/* Products Cards Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {bl.items.map((it, idx) => {
                                  const origDevisItem = bl.devis_items ? bl.devis_items[idx] : devisLinked?.items?.[idx];
                                  let itemTitle = it.designation;
                                  if (origDevisItem) {
                                    if (origDevisItem.is_manual) {
                                      itemTitle = origDevisItem.manual_nom || origDevisItem.manual_designation || itemTitle;
                                    } else if (origDevisItem.family_id && origDevisItem.product_type_id) {
                                      const types = getProductTypesForFamily(origDevisItem.family_id);
                                      const typeDef = types.find(t => t.id === origDevisItem.product_type_id);
                                      if (typeDef?.name) itemTitle = typeDef.name;
                                    }
                                  }
                                  if ((!itemTitle || /^Produit \d+/i.test(itemTitle)) && origDevisItem?.family_id) {
                                    const fam = FAMILIES.find(f => f.id === origDevisItem.family_id);
                                    if (fam?.name) itemTitle = fam.name;
                                  }

                                  return (
                                    <div 
                                      key={idx}
                                      className="bg-white rounded-xl p-4 border border-gray-200/90 shadow-2xs hover:shadow-xs transition space-y-3 flex flex-col justify-between"
                                    >
                                      <div className="space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                          <span className="font-bold text-gray-900 text-xs sm:text-sm">
                                            {idx + 1}. {itemTitle}
                                          </span>
                                          <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded text-xs font-mono font-bold shrink-0">
                                            × {it.quantite}
                                          </span>
                                        </div>

                                        {/* Dimensions */}
                                        {it.largeur && it.hauteur && (
                                          <p className="text-xs text-gray-600 font-mono">
                                            Dimensions : <span className="font-bold text-gray-900">{it.largeur} × {it.hauteur} cm</span>
                                          </p>
                                        )}

                                        {/* Original item details if available */}
                                        {origDevisItem && (
                                          <div className="space-y-1.5 text-xs text-gray-600">
                                            <div className="flex items-center gap-2">
                                              <span>Finition :</span>
                                              {getColorBadge(origDevisItem.couleur)}
                                            </div>

                                            {origDevisItem.store_enabled && (
                                              <p className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-medium">
                                                + 🪟 Store : {origDevisItem.store_lame_type || 'Lame 55'} ({origDevisItem.store_couleur || 'Blanc'})
                                              </p>
                                            )}

                                            {origDevisItem.mousti_enabled && (
                                              <p className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-medium">
                                                + 🦟 Moustiquaire {origDevisItem.mousti_type || 'Enroulable'}
                                              </p>
                                            )}
                                          </div>
                                        )}
                                      </div>

                                      {/* Mini Visualizer */}
                                      {origDevisItem && !origDevisItem.is_manual && origDevisItem.family_id && origDevisItem.product_type_id && (
                                        <div className="w-full h-32 bg-slate-50 rounded-lg p-1 border border-slate-200 flex items-center justify-center">
                                          <ProductVisualizer item={origDevisItem} />
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
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
      {/* EDIT TRANSPORT MODAL (Chauffeur, Matricule, Destination) */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {editTransportBL && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-gray-900">
                  Données de Transport & Sortie
                </h3>
              </div>
              <button 
                onClick={() => setEditTransportBL(null)} 
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Ces informations apparaîtront sur le <strong>Bon de Sortie & de Livraison</strong> pour les contrôles routiers (Police / Garde Nationale).
            </p>

            <form onSubmit={handleSaveTransport} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nom du Chauffeur / Transporteur</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={e => setDriverName(e.target.value)}
                  placeholder="Ex: Mohamed Ben Salah"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Matricule du Véhicule (Camionnette / Voiture)</label>
                <input
                  type="text"
                  value={plateNumber}
                  onChange={e => setPlateNumber(e.target.value)}
                  placeholder="Ex: 215 TN 4589"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm font-mono focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Destination / Chantier / Ville de Livraison</label>
                <input
                  type="text"
                  value={destinationText}
                  onChange={e => setDestinationText(e.target.value)}
                  placeholder="Ex: Chantier Villa La Soukra, Tunis"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Heure de Sortie d'Atelier</label>
                <input
                  type="text"
                  value={exitHour}
                  onChange={e => setExitHour(e.target.value)}
                  placeholder="Ex: 08:30"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm font-mono focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditTransportBL(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
      {/* DEVIS & PROPOSITION TECHNIQUE MODAL */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {printDevisModal && (
        <DevisPrintModal
          devis={printDevisModal}
          onClose={() => setPrintDevisModal(null)}
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
                className="px-3.5 py-1.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  deleteBL(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* PRINTABLE BON DE SORTIE & DE LIVRAISON MODAL (A4 READY) */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {printBL && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:block print:overflow-visible print:h-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 sm:p-10 space-y-6 animate-in fade-in zoom-in-95 duration-150 my-auto print:max-h-none print:h-auto print:overflow-visible print:shadow-none print:border-none print:rounded-none print:max-w-none print:w-full print:block print:p-0">
            {/* Modal Top Bar (Hidden on print) */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 print:hidden">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-gray-900">Impression Bon de Sortie & Livraison : {printBL.numero}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
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
            <div id="printable-bl-content" className="space-y-6 text-gray-900 font-sans p-2 sm:p-4 print:p-0 print:overflow-visible print:h-auto">
              {/* Header with Workshop & Document info */}
              <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-purple-900 pb-5 gap-4">
                {/* Workshop Logo & Coordinates */}
                <div className="flex items-start gap-4">
                  {settings.logo_url ? (
                    <div className="logo-print-box w-16 h-16 max-w-[64px] max-h-[64px] rounded-xl border border-gray-200 p-1 bg-white shadow-2xs shrink-0 flex items-center justify-center overflow-hidden">
                      <img src={settings.logo_url} alt="Logo" className="max-w-full max-h-full w-auto h-auto object-contain" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-purple-900 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                      {settings.nom_atelier?.charAt(0) || 'A'}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-black text-purple-950 uppercase tracking-tight">{settings.nom_atelier || 'ATELIER PRO'}</h2>
                    <p className="text-xs font-semibold text-purple-800">{settings.activite || 'Menuiserie Aluminium & Vitrerie'}</p>
                    <div className="text-xs text-gray-600 space-y-0.5 mt-1 font-sans">
                      {settings.telephone && <p>Tél : <span className="font-semibold text-gray-800">{settings.telephone}</span></p>}
                      {settings.adresse && <p>Lieu de Départ : <span className="text-gray-800">{settings.adresse}</span></p>}
                      {settings.matricule_fiscal && (
                        <p className="font-mono text-gray-800 font-semibold">MF : {settings.matricule_fiscal}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Document Details Box */}
                <div className="text-right self-stretch sm:self-auto shrink-0">
                  <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white p-4 rounded-2xl shadow-sm text-right min-w-[240px]">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-purple-300 block">
                      Transport & Livraison Chantier
                    </span>
                    <h3 className="text-base sm:text-lg font-black tracking-wide mt-0.5 text-white">
                      BON DE SORTIE & DE LIVRAISON
                    </h3>
                    <div className="mt-2 pt-2 border-t border-purple-800/80 font-mono text-xs space-y-0.5">
                      <p className="text-purple-100">
                        N° : <span className="font-bold text-white text-sm">{printBL.numero}</span>
                      </p>
                      <p className="text-purple-200 text-[11px]">
                        Date de sortie : <span className="font-semibold text-white">{printBL.date}</span>
                      </p>
                      {printBL.heure_sortie && (
                        <p className="text-purple-200 text-[11px]">
                          Heure : <span className="font-semibold text-white">{printBL.heure_sortie}</span>
                        </p>
                      )}
                      {printBL.devis_numero && (
                        <p className="text-purple-300 text-[11px]">
                          Réf. Devis : <span className="font-semibold text-white">{printBL.devis_numero}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transport & Contrôle Routier Box (Police / Garde Nationale) */}
              <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-4.5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-[11px] text-purple-950 font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-purple-700" />
                    Informations de Transport & Contrôle Routier
                  </span>
                  <span className="text-[10px] text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded font-bold font-mono uppercase">
                    Transport Professionnel
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-xs">
                  {/* Destinataire Client */}
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-gray-500 font-bold shrink-0 min-w-[110px]">Client / Destinataire :</span>
                    {printBL.client_nom && printBL.client_nom !== 'Sans client' ? (
                      <span className="font-black text-gray-900 text-sm truncate">{printBL.client_nom}</span>
                    ) : (
                      <span className="flex-1 border-b border-dashed border-gray-400 self-end mb-1 min-w-[80px]"></span>
                    )}
                  </div>

                  {/* Destination Chantier */}
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-gray-500 font-bold shrink-0 min-w-[110px]">Destination / Chantier :</span>
                    {printBL.destination ? (
                      <span className="font-bold text-gray-900 truncate">{printBL.destination}</span>
                    ) : (
                      <span className="flex-1 border-b border-dashed border-gray-400 self-end mb-1 min-w-[80px]"></span>
                    )}
                  </div>

                  {/* Chauffeur */}
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-gray-500 font-bold shrink-0 min-w-[110px]">Chauffeur / Transport :</span>
                    {printBL.chauffeur ? (
                      <span className="font-bold text-purple-950 text-sm truncate">{printBL.chauffeur}</span>
                    ) : (
                      <span className="flex-1 border-b border-dashed border-gray-400 self-end mb-1 min-w-[80px]"></span>
                    )}
                  </div>

                  {/* Matricule Véhicule */}
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-gray-500 font-bold shrink-0 min-w-[110px]">Matricule Véhicule :</span>
                    {printBL.matricule_vehicule ? (
                      <span className="font-mono font-black text-gray-900 text-sm bg-gray-100 px-2 py-0.5 rounded border border-gray-300">
                        {printBL.matricule_vehicule}
                      </span>
                    ) : (
                      <span className="flex-1 border-b border-dashed border-gray-400 self-end mb-1 min-w-[80px]"></span>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex justify-between items-center">
                  <span>Désignation des Menuiseries & Marchandises Transportées ({printBL.items.length})</span>
                  <span className="text-[10px] text-gray-400 font-normal">Cotes en centimètres</span>
                </h4>

                <table className="w-full text-left text-xs border border-gray-200 rounded-xl overflow-hidden">
                  <thead className="bg-purple-950 text-white font-bold">
                    <tr>
                      <th className="px-3 py-2.5 w-10 text-center">#</th>
                      <th className="px-4 py-2.5">Désignation des Menuiseries / Articles</th>
                      <th className="px-4 py-2.5 text-center">Dimensions (Largeur × Hauteur)</th>
                      <th className="px-4 py-2.5 text-right">Quantité Chargée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {printBL.items.map((it, idx) => {
                      const printDevisLinked = getDevisForBL(printBL);
                      const origDevisItem = printBL.devis_items?.[idx] || printDevisLinked?.items?.[idx];
                      let itemTitle = it.designation;
                      if (origDevisItem) {
                        if (origDevisItem.is_manual) {
                          itemTitle = origDevisItem.manual_nom || origDevisItem.manual_designation || itemTitle;
                        } else if (origDevisItem.family_id && origDevisItem.product_type_id) {
                          const types = getProductTypesForFamily(origDevisItem.family_id);
                          const typeDef = types.find(t => t.id === origDevisItem.product_type_id);
                          if (typeDef?.name) itemTitle = typeDef.name;
                        }
                      }
                      if ((!itemTitle || /^Produit \d+/i.test(itemTitle)) && origDevisItem?.family_id) {
                        const fam = FAMILIES.find(f => f.id === origDevisItem.family_id);
                        if (fam?.name) itemTitle = fam.name;
                      }

                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-3 py-3 text-center font-bold text-gray-500">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <div className="space-y-0.5">
                              <p className="font-bold text-gray-900 text-xs sm:text-sm">{itemTitle}</p>
                              {origDevisItem && (
                                <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-gray-600">
                                  {origDevisItem.couleur && (
                                    <span>
                                      Finition : <span className="font-semibold text-gray-800 capitalize">{origDevisItem.couleur.replace('_', ' ')}</span>
                                    </span>
                                  )}
                                  {origDevisItem.vitrage_type && (
                                    <span>• Vitrage : <span className="font-medium text-gray-800">{origDevisItem.vitrage_type}</span></span>
                                  )}
                                  {origDevisItem.store_enabled && (
                                    <span className="text-blue-800 font-medium">
                                      • Store {origDevisItem.store_lame_type || ''}
                                    </span>
                                  )}
                                  {origDevisItem.mousti_enabled && (
                                    <span className="text-emerald-800 font-medium">
                                      • Moustiquaire
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-gray-700 font-medium">
                            {it.largeur && it.hauteur ? `${it.largeur} cm × ${it.hauteur} cm` : '—'}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-extrabold text-purple-950 text-sm">
                            {it.quantite} pcs
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary / Total items */}
              <div className="break-inside-avoid print:break-inside-avoid flex justify-end pt-1">
                <div className="bg-purple-50 border border-purple-200 rounded-xl px-5 py-2.5 text-right">
                  <span className="text-xs text-purple-900 font-semibold">Volume Total de Menuiseries Chargées : </span>
                  <span className="text-base font-black text-purple-950 font-mono ml-1">
                    {printBL.items.reduce((s, it) => s + (it.quantite || 1), 0)} Pièces
                  </span>
                </div>
              </div>

              {/* Tripartite Signatures Box (3 Cases de signature) */}
              <div className="break-inside-avoid print:break-inside-avoid grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t-2 border-gray-200 text-xs">
                {/* 1. Sortie Atelier */}
                <div className="border border-gray-300 rounded-xl p-3.5 min-h-[115px] flex flex-col justify-between bg-gray-50/50">
                  <div>
                    <p className="font-bold text-gray-800 uppercase text-[11px]">1. Sortie d'Atelier :</p>
                    <p className="text-[10px] text-gray-500 italic mt-0.5">Cachet & Signature Entreprise</p>
                  </div>
                  <div className="text-[10px] text-gray-400 italic pt-2">
                    Date : ..... / ..... / 202...
                  </div>
                </div>

                {/* 2. Chauffeur / Transport */}
                <div className="border border-amber-300 rounded-xl p-3.5 min-h-[115px] flex flex-col justify-between bg-amber-50/30">
                  <div>
                    <p className="font-bold text-amber-950 uppercase text-[11px]">2. Transporteur / Chauffeur :</p>
                    <p className="text-[10px] text-amber-800 italic mt-0.5">Prise en charge de la marchandise</p>
                  </div>
                  <div className="text-[10px] text-gray-400 italic pt-2">
                    Signature Chauffeur :
                  </div>
                </div>

                {/* 3. Réception Client */}
                <div className="border border-purple-300 rounded-xl p-3.5 min-h-[115px] flex flex-col justify-between bg-purple-50/30">
                  <div>
                    <p className="font-bold text-purple-950 uppercase text-[11px]">3. Réception Client (Chantier) :</p>
                    <p className="text-[10px] text-purple-800 italic mt-0.5">Marchandise reçue en bon état</p>
                  </div>
                  <div className="flex justify-between items-end text-[10px] text-gray-400 italic pt-2">
                    <span>Date : ..... / ..... / 202...</span>
                    <span>Signature :</span>
                  </div>
                </div>
              </div>

              {/* Footer Legal Terms */}
              <div className="text-center text-[10px] text-gray-400 pt-3 border-t border-gray-100 space-y-0.5">
                <p className="font-medium text-gray-500">Document officiel tenant lieu de bon de transport et de livraison conforme aux réglementations de contrôle routier.</p>
                <p>{settings.nom_atelier || 'AtelierPro'} — Menuiserie Aluminium & Vitrerie professionnelle.</p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
