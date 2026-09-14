import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { DevisRecord, DevisItemState, useApp } from '../../context/AppContext';
import { calculateAluFabrication, AluCalculResult, SupplierOrderCategory, getOuvrageDetailedTitle, getOuvrageShortTitle } from '../../utils/aluCalculEngine';
import { calculateDevisTotals } from '../../utils/devisCalculator';
import { FAMILIES, getProductTypesForFamily } from '../../data/productCatalog';
import { 
  X, 
  Printer, 
  Scissors, 
  Layers, 
  Box, 
  Grid, 
  CheckCircle2, 
  Calendar,
  Building,
  Ruler,
  FileSpreadsheet,
  AlertCircle,
  Plus,
  Edit3,
  Copy,
  Trash2,
  ExternalLink,
  Save,
  Minus,
  Sparkles,
  ShoppingCart,
  Filter,
  Check,
  RotateCcw
} from 'lucide-react';

interface FicheAtelierModalProps {
  devis: DevisRecord;
  onClose: () => void;
  onEditDevis?: (devisId: string) => void;
}

export const FicheAtelierModal: React.FC<FicheAtelierModalProps> = ({ devis, onClose, onEditDevis }) => {
  const { settings, saveDevis, articles, articlesMap } = useApp();
  const [activeTab, setActiveTab] = useState<'fournisseur' | 'decoupage' | 'debitage' | 'composants' | 'vitrage'>('fournisseur');
  
  // Selected Ouvrage filter state ('all' for global view, or 0, 1, 2... for specific product)
  const [selectedOuvrageIdx, setSelectedOuvrageIdx] = useState<number | 'all'>('all');

  // Local live state of the quote being viewed/fabricated
  const [currentDevis, setCurrentDevis] = useState<DevisRecord>(devis);

  // Quick Edit Modal State
  const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    designation: string;
    largeur: string | number;
    hauteur: string | number;
    quantity: number;
    couleur: string;
    remplissage_id: string;
  }>({
    designation: '',
    largeur: 120,
    hauteur: 140,
    quantity: 1,
    couleur: 'Blanc',
    remplissage_id: 'Simple Clair 6mm'
  });

  // Quick Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState<{
    family_id: string;
    product_type_id: string;
    designation: string;
    largeur: number;
    hauteur: number;
    quantity: number;
    couleur: string;
    remplissage_id: string;
  }>({
    family_id: '60',
    product_type_id: 'coul_2v',
    designation: 'Fenêtre Coulissante 2 Vantaux',
    largeur: 120,
    hauteur: 120,
    quantity: 1,
    couleur: 'Blanc',
    remplissage_id: 'Simple Clair 6mm'
  });

  // Helper to persist changes with live full financial recalculation
  const persistDevisUpdate = (updatedDevis: DevisRecord) => {
    const margesConfig = {
      ...(updatedDevis.marges || {
        margeType: 'percent' as const,
        margeValue: 30,
        margeGcType: 'percent' as const,
        margeGcValue: 30,
        margeMoustiType: 'percent' as const,
        margeMoustiValue: 30,
        margeStoreType: 'percent' as const,
        margeStoreValue: 30,
        tva: settings.tva_default || 19
      }),
      m2_prices: (updatedDevis.marges as any)?.m2_prices || settings.m2_prices
    };

    const updatedTotals = calculateDevisTotals(
      updatedDevis.items,
      articlesMap,
      margesConfig
    );

    const fullUpdatedDevis: DevisRecord = {
      ...updatedDevis,
      totals: updatedTotals
    };

    setCurrentDevis(fullUpdatedDevis);

    if (fullUpdatedDevis.id && !fullUpdatedDevis.id.startsWith('temp_')) {
      try {
        saveDevis(fullUpdatedDevis);
      } catch (err) {
        console.error('Failed to save updated devis:', err);
      }
    }
  };

  // Quick inline quantity update
  const handleQuantityDelta = (idx: number, delta: number) => {
    const updatedItems = [...currentDevis.items];
    const item = updatedItems[idx];
    if (!item) return;

    const currentQty = Number(item.quantity) || 1;
    const newQty = Math.max(1, currentQty + delta);
    if (newQty === currentQty) return;

    updatedItems[idx] = { ...item, quantity: newQty };
    persistDevisUpdate({ ...currentDevis, items: updatedItems });
  };

  // Open Edit Modal for an item
  const openEditModal = (idx: number) => {
    const item = currentDevis.items[idx];
    if (!item) return;
    setEditingItemIdx(idx);
    setEditForm({
      designation: getOuvrageDetailedTitle(item, idx),
      largeur: item.largeur || 120,
      hauteur: item.hauteur || 140,
      quantity: Number(item.quantity) || 1,
      couleur: item.couleur || 'Blanc',
      remplissage_id: item.remplissage_id || 'Simple Clair 6mm'
    });
  };

  // Save edited item
  const handleSaveEditItem = () => {
    if (editingItemIdx === null) return;
    const updatedItems = [...currentDevis.items];
    const orig = updatedItems[editingItemIdx];

    updatedItems[editingItemIdx] = {
      ...orig,
      manual_designation: editForm.designation,
      largeur: parseFloat(String(editForm.largeur)) || orig.largeur,
      hauteur: parseFloat(String(editForm.hauteur)) || orig.hauteur,
      quantity: Math.max(1, Number(editForm.quantity) || 1),
      couleur: (editForm.couleur.toLowerCase().includes('blanc') ? 'blanc' : (editForm.couleur.toLowerCase().includes('noir') ? 'noir' : (editForm.couleur.toLowerCase().includes('gris') ? 'gris' : 'couleur_mat'))) as any,
      remplissage_id: editForm.remplissage_id
    };

    persistDevisUpdate({ ...currentDevis, items: updatedItems });
    setEditingItemIdx(null);
  };

  // Duplicate an item
  const handleDuplicateItem = (idx: number) => {
    const itemToClone = currentDevis.items[idx];
    if (!itemToClone) return;

    const cloned: DevisItemState = {
      ...itemToClone,
      _uid: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      manual_designation: `${getOuvrageShortTitle(itemToClone, idx)} (Copie)`
    };

    const updatedItems = [...currentDevis.items, cloned];
    persistDevisUpdate({ ...currentDevis, items: updatedItems });
  };

  // Delete an item
  const handleDeleteItem = (idx: number) => {
    if (currentDevis.items.length <= 1) {
      alert('Impossible de supprimer le seul ouvrage restant.');
      return;
    }
    if (!window.confirm('Voulez-vous vraiment supprimer cet ouvrage de la fiche atelier ?')) return;

    const updatedItems = currentDevis.items.filter((_, i) => i !== idx);
    persistDevisUpdate({ ...currentDevis, items: updatedItems });
    if (selectedOuvrageIdx === idx) {
      setSelectedOuvrageIdx('all');
    }
  };

  // Add new item from Quick Add Modal
  const handleSaveAddItem = () => {
    const isCoulissant = addForm.family_id === '60' || addForm.family_id === '61' || addForm.family_id === '62' || addForm.family_id === '65' || addForm.family_id === '66' || addForm.product_type_id.includes('coul');
    const isChassi = addForm.product_type_id.includes('fixe');
    const isStore = addForm.family_id === '67' || addForm.product_type_id.includes('store');
    const isMousti = addForm.family_id === '68' || addForm.product_type_id.includes('mousti');
    const isGardeCorps = addForm.family_id === '46' || addForm.product_type_id.includes('gc');

    const newItem: DevisItemState = {
      _uid: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      family_id: addForm.family_id,
      product_type_id: addForm.product_type_id,
      manual_designation: addForm.designation,
      largeur: Number(addForm.largeur) || 120,
      hauteur: Number(addForm.hauteur) || 140,
      quantity: Math.max(1, Number(addForm.quantity) || 1),
      couleur: (addForm.couleur.toLowerCase().includes('blanc') ? 'blanc' : (addForm.couleur.toLowerCase().includes('noir') ? 'noir' : (addForm.couleur.toLowerCase().includes('gris') ? 'gris' : 'couleur_mat'))) as any,
      remplissage_id: addForm.remplissage_id,
      vitrage_type: addForm.remplissage_id.toLowerCase().includes('double') ? 'double' : 'simple',
      motif_id: 'aucun',
      supplements: [],
      comp_dormant_ref: isCoulissant ? '67101' : '40100',
      comp_ouvrant_ref: isCoulissant ? '67104' : '40401',
      comp_parclose_ref: isCoulissant ? '80116' : '40110',
      comp_seuil_ref: isCoulissant ? '67101' : undefined,
      is_chassi_fix: isChassi,
      chassi_cadre_ref: isChassi ? '40100' : undefined,
      is_garde_corps: isGardeCorps
    };

    const updatedItems = [...currentDevis.items, newItem];
    persistDevisUpdate({ ...currentDevis, items: updatedItems });
    setIsAddModalOpen(false);
  };

  // Compute exact fabrication data for the entire quote
  const result: AluCalculResult = calculateAluFabrication(currentDevis.items, articles);

  // Filtered views based on selectedOuvrageIdx
  const displayedPieces = selectedOuvrageIdx === 'all' 
    ? result.cuttingPieces 
    : result.cuttingPieces.filter(p => p.itemIndex === selectedOuvrageIdx);

  const displayedPiecesCount = displayedPieces.reduce((sum, p) => sum + p.quantity, 0);

  const displayedAccessories = selectedOuvrageIdx === 'all'
    ? result.accessories
    : result.accessories.filter(a => a.itemIndex === selectedOuvrageIdx || a.itemIndex === undefined);

  const displayedAccessoriesCost = parseFloat(displayedAccessories.reduce((sum, a) => sum + a.totalPriceHt, 0).toFixed(3));

  const displayedGlass = selectedOuvrageIdx === 'all'
    ? result.glassItems
    : result.glassItems.filter(g => g.itemIndex === selectedOuvrageIdx);

  const displayedGlassAreaM2 = parseFloat(displayedGlass.reduce((sum, g) => sum + g.totalAreaM2, 0).toFixed(3));

  // Helper to resolve short title for an item index
  const getShortTitleForIndex = (idx?: number) => {
    if (idx === undefined || !currentDevis.items[idx]) return 'Ouvrage';
    return getOuvrageShortTitle(currentDevis.items[idx], idx);
  };

  // Debitage filtered or global with full multi-product sharing awareness
  const displayedDebitage = result.debitageSummary.map(deb => {
    const enhancedBars = deb.allocatedBars.map(bar => {
      const distinctIndices = Array.from(new Set(bar.cuts.map(c => c.itemIndex).filter((x): x is number => x !== undefined)));
      const isShared = distinctIndices.length > 1;
      
      const activeCuts = selectedOuvrageIdx === 'all' 
        ? bar.cuts 
        : bar.cuts.filter(c => c.itemIndex === selectedOuvrageIdx);
      
      const otherCuts = selectedOuvrageIdx === 'all' 
        ? [] 
        : bar.cuts.filter(c => c.itemIndex !== selectedOuvrageIdx);

      const otherReservedLengthCm = otherCuts.reduce((sum, c) => sum + c.lengthCm, 0);
      const otherOuvrageNames = Array.from(new Set(otherCuts.map(c => getShortTitleForIndex(c.itemIndex))));
      const allSharedOuvrageNames = distinctIndices.map(idx => getShortTitleForIndex(idx));

      return {
        ...bar,
        activeCuts,
        otherCuts,
        isShared,
        otherReservedLengthCm,
        otherOuvrageNames,
        allSharedOuvrageNames,
        hasActiveCuts: activeCuts.length > 0
      };
    }).filter(bar => bar.hasActiveCuts);

    return {
      ...deb,
      allocatedBars: enhancedBars,
      totalBarsCount: enhancedBars.length
    };
  }).filter(deb => deb.allocatedBars.length > 0);

  // Dynamic bar metrics
  const displayedProfileBarsCount = displayedDebitage
    .filter(d => d.isProfileBar)
    .reduce((sum, d) => sum + d.totalBarsCount, 0);

  const displayedSlatBarsCount = displayedDebitage
    .filter(d => !d.isProfileBar)
    .reduce((sum, d) => sum + d.totalBarsCount, 0);

  const activeProfileBars = selectedOuvrageIdx === 'all' ? result.totalProfileBarsCount : displayedProfileBarsCount;
  const activeSlatBars = selectedOuvrageIdx === 'all' ? result.totalSlatBarsCount : displayedSlatBarsCount;
  const activeGlassArea = selectedOuvrageIdx === 'all' ? result.totalGlassAreaM2 : displayedGlassAreaM2;

  // Check for high quantity warning
  const highQtyItems = currentDevis.items.filter(it => !it.is_manual && (Number(it.quantity) || 1) > 10);
  const hasHighQty = highQtyItems.length > 0;

  const handlePrint = () => {
    window.print();
  };

  const selectedItem = typeof selectedOuvrageIdx === 'number' ? currentDevis.items[selectedOuvrageIdx] : null;
  const selectedLabel = selectedItem 
    ? `#${(selectedOuvrageIdx as number) + 1} — ${getOuvrageDetailedTitle(selectedItem, selectedOuvrageIdx as number)}`
    : 'Tous les Ouvrages (Commande Globale)';

  const modalElement = (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-6xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-700/40 ring-1 ring-black/10 mx-auto my-auto">
        
        {/* Top Header Bar (No Print) */}
        <div className="no-print px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-extrabold text-sm sm:text-base tracking-tight text-white">Fiche Technique Atelier & Découpe</h2>
                <span className="text-[11px] sm:text-xs bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-md font-mono font-bold">
                  {currentDevis.numero}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Client : <strong className="text-slate-200">{currentDevis.client_nom || 'Sans client'}</strong> • {currentDevis.items.length} ouvrage{currentDevis.items.length > 1 ? 's' : ''} à fabriquer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEditDevis && (
              <button
                onClick={() => onEditDevis(currentDevis.id)}
                className="hidden sm:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg transition border border-slate-700 cursor-pointer"
                title="Modifier dans l'éditeur de devis complet"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                <span>Studio Devis</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold px-3 sm:px-3.5 py-1.5 rounded-lg transition shadow-md shadow-blue-600/30 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimer (PDF Atelier)</span>
              <span className="sm:hidden">Imprimer</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs - 5 Clear Organized Modules (No Print) */}
        <div className="no-print bg-slate-100/95 border-b border-slate-200/90 p-2 sm:p-2.5 shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              { id: 'fournisseur', label: '1. Bon Commande Global', sublabel: 'Approvisionnement A à Z', icon: ShoppingCart, badge: `${result.totalProfileBarsCount + result.totalSlatBarsCount} barres` },
              { id: 'decoupage', label: '2. Feuille Découpe', sublabel: 'Scie à onglet', icon: Scissors, badge: `${displayedPiecesCount} pièces` },
              { id: 'debitage', label: '3. Débitage Barres', sublabel: 'Barres & Chutes', icon: Layers, badge: `${displayedDebitage.length} profils` },
              { id: 'composants', label: '4. Quincaillerie & Joints', sublabel: '100% Accessoires', icon: Box, badge: `${displayedAccessories.length} types` },
              { id: 'vitrage', label: '5. Cotes Miroiterie', sublabel: 'Plan de vitrage', icon: Grid, badge: `${activeGlassArea.toFixed(2)} m²` }
            ].map(t => {
              const Icon = t.icon;
              const isSel = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex flex-col justify-between text-left p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer min-h-[52px] sm:min-h-[58px] border ${
                    isSel
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 border-blue-500 ring-2 ring-blue-500/20'
                      : 'bg-white text-slate-700 hover:text-blue-700 hover:bg-blue-50/50 border-slate-200/90 shadow-2xs hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 w-full">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className={`p-1 rounded-lg shrink-0 ${isSel ? 'bg-blue-500/40 text-white' : 'bg-slate-100 text-blue-600'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-xs truncate">{t.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-100/20 w-full text-[11px]">
                    <span className={`text-[10px] truncate ${isSel ? 'text-blue-100' : 'text-slate-500'}`}>
                      {t.sublabel}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] shrink-0 ${
                      isSel 
                        ? 'bg-blue-700/90 text-white shadow-2xs' 
                        : 'bg-slate-100 text-slate-700 border border-slate-200/60'
                    }`}>
                      {t.badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 🎯 SÉLECTEUR DE FILTRAGE PAR OUVRAGE (No Print) */}
        <div className="no-print bg-white px-3 sm:px-6 py-2 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0 shadow-2xs [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Afficher :</span>
          </div>

          <button
            type="button"
            onClick={() => setSelectedOuvrageIdx('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
              selectedOuvrageIdx === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-slate-900/20'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <span>🌐 Tous les Ouvrages ({currentDevis.items.length})</span>
            {selectedOuvrageIdx === 'all' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          {currentDevis.items.map((it, idx) => {
            const isSel = selectedOuvrageIdx === idx;
            const shortTitle = getOuvrageShortTitle(it, idx);
            const qty = Number(it.quantity) || 1;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedOuvrageIdx(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                  isSel
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-600/25'
                    : 'bg-slate-50 text-slate-700 hover:bg-blue-50/60 hover:text-blue-700 border-slate-200'
                }`}
                title={getOuvrageDetailedTitle(it, idx)}
              >
                <span className="font-mono font-black text-[11px] opacity-80">#{idx + 1}</span>
                <span className="truncate max-w-[150px] sm:max-w-[200px]">{shortTitle}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${isSel ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-800'}`}>
                  ×{qty}
                </span>
                {isSel && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            );
          })}
        </div>

        {/* Printable Document Body with custom sleek scrollbar */}
        <div className="flex-1 p-3 sm:p-5 overflow-y-auto bg-slate-50 printable-area space-y-3 sm:space-y-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 [&::-webkit-scrollbar-track]:bg-slate-100/50">
          
          {/* Header Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-[10px] uppercase font-extrabold text-blue-700 tracking-wider">
                Atelier de Menuiserie Aluminium & Volets Roulants
              </span>
              <h1 className="text-base sm:text-xl font-black text-slate-900 mt-0.5">
                {settings.nom_atelier || 'AluPro'} — FICHE DE FABRICATION ATELIER
              </h1>
              <p className="text-xs text-slate-600 mt-0.5 flex flex-wrap items-center gap-2 sm:gap-3">
                <span>Dossier : <strong className="text-slate-900 font-mono font-bold">{currentDevis.numero}</strong></span>
                <span className="text-slate-300">•</span>
                <span>Client : <strong className="text-slate-900 font-bold">{currentDevis.client_nom || 'Client Atelier'}</strong></span>
                <span className="text-slate-300">•</span>
                <span>Date : <strong className="text-slate-900 font-mono font-bold">{currentDevis.date}</strong></span>
                {selectedOuvrageIdx !== 'all' && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md font-bold">
                      Vue isolée : {selectedLabel}
                    </span>
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <div className={`px-3.5 py-1.5 rounded-xl text-center shadow-2xs border transition-all ${
                selectedOuvrageIdx === 'all' 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-500/20'
              }`}>
                <p className={`text-[10px] uppercase font-bold tracking-wider ${selectedOuvrageIdx === 'all' ? 'text-blue-800' : 'text-blue-100'}`}>
                  Barres Profilés (6.5m)
                </p>
                <p className={`text-lg font-black font-mono leading-none mt-0.5 ${selectedOuvrageIdx === 'all' ? 'text-blue-950' : 'text-white'}`}>
                  {activeProfileBars} <span className={`text-xs font-bold ${selectedOuvrageIdx === 'all' ? 'text-blue-800' : 'text-blue-200'}`}>barres</span>
                </p>
              </div>
              <div className={`px-3.5 py-1.5 rounded-xl text-center shadow-2xs border transition-all ${
                selectedOuvrageIdx === 'all' 
                  ? 'bg-indigo-50 border-indigo-200' 
                  : 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-500/20'
              }`}>
                <p className={`text-[10px] uppercase font-bold tracking-wider ${selectedOuvrageIdx === 'all' ? 'text-indigo-800' : 'text-indigo-100'}`}>
                  Barres Lames (6.0m)
                </p>
                <p className={`text-lg font-black font-mono leading-none mt-0.5 ${selectedOuvrageIdx === 'all' ? 'text-indigo-950' : 'text-white'}`}>
                  {activeSlatBars} <span className={`text-xs font-bold ${selectedOuvrageIdx === 'all' ? 'text-indigo-800' : 'text-indigo-200'}`}>barres</span>
                </p>
              </div>
              <div className={`px-3.5 py-1.5 rounded-xl text-center shadow-2xs border transition-all ${
                selectedOuvrageIdx === 'all' 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-500/20'
              }`}>
                <p className={`text-[10px] uppercase font-bold tracking-wider ${selectedOuvrageIdx === 'all' ? 'text-emerald-800' : 'text-emerald-100'}`}>
                  Surface Totale Verre
                </p>
                <p className={`text-lg font-black font-mono leading-none mt-0.5 ${selectedOuvrageIdx === 'all' ? 'text-emerald-950' : 'text-white'}`}>
                  {activeGlassArea.toFixed(2)} <span className={`text-xs font-bold ${selectedOuvrageIdx === 'all' ? 'text-emerald-800' : 'text-emerald-200'}`}>m²</span>
                </p>
              </div>
            </div>
          </div>

          {/* ⚠️ High Quantity Warning Banner */}
          {hasHighQty && (
            <div className="bg-orange-50 border border-orange-300 rounded-2xl p-3 sm:p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-orange-800">⚠️ Quantité anormale détectée</p>
                <p className="text-xs text-orange-700 mt-0.5">
                  {highQtyItems.map((it, i) => (
                    <span key={i}>
                      Ouvrage {currentDevis.items.indexOf(it) + 1} — quantité = <strong className="font-black">{it.quantity}</strong>.{' '}
                    </span>
                  ))}
                  Vérifiez la quantité ou modifiez-la directement ci-dessous avant de lancer la fabrication.
                </p>
              </div>
            </div>
          )}

          {/* Récapitulatif des ouvrages : Vue Isolée (Hero Card) OU Tableau Complet */}
          {selectedOuvrageIdx !== 'all' && selectedItem ? (
            <div className="bg-blue-50/90 border-2 border-blue-400/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-200/80 pb-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/30 shrink-0">
                    #{(selectedOuvrageIdx as number) + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded-md tracking-wider">
                        Ouvrage Sélectionné
                      </span>
                      <span className="text-xs text-blue-900 font-mono font-bold">
                        {selectedItem.family_id ? `Série ${selectedItem.family_id}` : 'Menuiserie Aluminium'}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                      {getOuvrageDetailedTitle(selectedItem, selectedOuvrageIdx as number)}
                    </h3>
                  </div>
                </div>

                <div className="no-print flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(selectedOuvrageIdx as number)}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicateItem(selectedOuvrageIdx as number)}
                    className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Dupliquer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedOuvrageIdx('all')}
                    className="flex items-center gap-1 bg-white hover:bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-blue-300 shadow-2xs transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Voir tous ({currentDevis.items.length})</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-blue-200/80 shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Dimensions (L × H)</p>
                  <p className="font-mono font-black text-slate-900 text-sm mt-0.5">
                    {selectedItem.largeur || '—'} × {selectedItem.hauteur || '—'} cm
                  </p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-blue-200/80 shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Quantité à Fabriquer</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono font-black text-blue-900 text-base">
                      ×{selectedItem.quantity || 1}
                    </span>
                    <div className="no-print inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleQuantityDelta(selectedOuvrageIdx as number, -1)}
                        disabled={(Number(selectedItem.quantity) || 1) <= 1}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 cursor-pointer"
                        title="Diminuer"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuantityDelta(selectedOuvrageIdx as number, 1)}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        title="Augmenter"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-blue-200/80 shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Couleur Profilés</p>
                  <p className="font-bold text-slate-900 capitalize text-xs mt-0.5 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400"></span>
                    {selectedItem.couleur || 'Blanc'}
                  </p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-blue-200/80 shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Remplissage / Vitrage</p>
                  <p className="font-bold text-slate-900 text-xs mt-0.5 truncate" title={selectedItem.remplissage_id || 'Vitrage simple'}>
                    {selectedItem.remplissage_id || 'Vitrage simple'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Récapitulatif global des ouvrages avec Tableau complet */
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="px-4 sm:px-5 py-2.5 sm:py-3 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Récapitulatif des Ouvrages ({currentDevis.items.length})
                  </h3>
                </div>

                {/* Action Buttons for Adding & Editing */}
                <div className="no-print flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter un Ouvrage</span>
                  </button>
                  {onEditDevis && (
                    <button
                      type="button"
                      onClick={() => onEditDevis(currentDevis.id)}
                      className="hidden sm:flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      <span>Éditeur complet</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5 text-left w-12">N°</th>
                      <th className="px-4 py-2.5 text-left">Désignation de l'Ouvrage</th>
                      <th className="px-4 py-2.5 text-center">Dimensions (L × H)</th>
                      <th className="px-4 py-2.5 text-center font-black">Quantité</th>
                      <th className="px-4 py-2.5 text-left">Couleur</th>
                      <th className="no-print px-4 py-2.5 text-right w-36">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentDevis.items.map((it, idx) => {
                      const qty = Number(it.quantity) || 1;
                      const isHigh = !it.is_manual && qty > 10;
                      const nom = getOuvrageDetailedTitle(it, idx);
                      const isRowFiltered = selectedOuvrageIdx === idx;

                      return (
                        <tr 
                          key={idx} 
                          className={`transition cursor-pointer ${
                            isRowFiltered 
                              ? 'bg-blue-50/80 ring-1 ring-blue-300' 
                              : (isHigh ? 'bg-orange-50/60' : 'hover:bg-slate-50/80')
                          }`}
                          onClick={() => setSelectedOuvrageIdx(isRowFiltered ? 'all' : idx)}
                        >
                          <td className="px-4 py-2.5 font-mono font-bold text-slate-400">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                              isRowFiltered ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <span>{nom}</span>
                              {isRowFiltered && (
                                <span className="text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.2 rounded">
                                  Sélectionné
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-[10px] text-slate-600">
                                {it.family_id ? `Série ${it.family_id}` : 'Standard'}
                              </span>
                              <span>{it.remplissage_id || 'Vitrage simple'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className="font-mono font-bold text-slate-800 bg-slate-100/90 border border-slate-200 px-2.5 py-1 rounded-lg text-xs">
                              {it.largeur || '—'} × {it.hauteur || '—'} cm
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-center" onClick={e => e.stopPropagation()}>
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleQuantityDelta(idx, -1)}
                                disabled={qty <= 1}
                                className="no-print p-1 rounded-md bg-white hover:bg-slate-200 text-slate-600 disabled:opacity-30 border border-slate-200 transition cursor-pointer"
                                title="Diminuer la quantité"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className={`inline-flex items-center gap-1 font-black px-2.5 py-0.5 rounded-lg text-xs ${
                                isHigh
                                  ? 'bg-orange-100 text-orange-700 border border-orange-300'
                                  : 'bg-blue-50 text-blue-800 border border-blue-200'
                              }`}>
                                {isHigh && <AlertCircle className="w-3 h-3 text-orange-600" />}
                                ×{qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuantityDelta(idx, 1)}
                                className="no-print p-1 rounded-md bg-white hover:bg-slate-200 text-slate-600 border border-slate-200 transition cursor-pointer"
                                title="Augmenter la quantité"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="inline-flex items-center gap-1.5 text-slate-700 capitalize">
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400"></span>
                              <span>{it.couleur || 'Blanc'}</span>
                            </span>
                          </td>
                          <td className="no-print px-4 py-2.5 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditModal(idx)}
                                className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded-lg transition text-[11px] border border-blue-200 cursor-pointer"
                                title="Modifier les dimensions et options"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Modifier</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDuplicateItem(idx)}
                                className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition border border-slate-200 cursor-pointer"
                                title="Dupliquer cet ouvrage"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(idx)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition border border-rose-200 cursor-pointer"
                                title="Supprimer cet ouvrage"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 1: FEUILLE DE DÉCOUPAGE */}
          <div className={`space-y-3 ${activeTab !== 'decoupage' ? 'hidden print:block' : 'block'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Scissors className="w-4 h-4 text-blue-600" />
                <span>
                  Feuille de Découpage Scie à Onglet ({displayedPieces.length} lignes — {displayedPiecesCount} pièces au total)
                  {selectedOuvrageIdx !== 'all' && <span className="text-blue-600 font-bold"> [ {selectedLabel} ]</span>}
                </span>
              </h3>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Ouvrage / Repère</th>
                    <th className="px-4 py-3">Réf Profilé</th>
                    <th className="px-4 py-3">Désignation de la Pièce</th>
                    <th className="px-4 py-3 text-center">Coupe G</th>
                    <th className="px-4 py-3 text-right font-mono">Longueur (cm)</th>
                    <th className="px-4 py-3 text-center">Coupe D</th>
                    <th className="px-4 py-3 text-center">Quantité</th>
                    <th className="px-4 py-3">Notes / Position</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedPieces.map((p, idx) => {
                    const pieceDeb = result.debitageSummary.find(d => d.profilRef === p.profilRef);
                    const matchedBars = pieceDeb?.allocatedBars.filter(b => b.cuts.some(c => c.pieceId.startsWith(p.id) || (c.label === p.profilDesignation && Math.abs(c.lengthCm - p.lengthCm) < 0.01 && c.itemIndex === p.itemIndex)));
                    const barIndices = matchedBars && matchedBars.length > 0 ? Array.from(new Set(matchedBars.map(b => b.barIndex))) : [];

                    return (
                      <tr key={idx} className="hover:bg-blue-50/40 transition">
                        <td className="px-4 py-3 font-semibold text-slate-800 text-xs sm:text-sm">{p.elementLabel}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono font-black text-white bg-blue-900 px-2.5 py-1 rounded-md text-xs shadow-2xs">
                            {p.profilRef}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-950 text-sm sm:text-base">{p.profilDesignation}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-black shadow-2xs ${
                            p.angleLeft === '45°' 
                              ? 'bg-amber-600 text-white' 
                              : 'bg-slate-800 text-white'
                          }`}>
                            {p.angleLeft}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-black text-base sm:text-lg text-slate-950 bg-slate-100/60 rounded-lg">
                          {p.lengthCm.toFixed(1)} <span className="text-xs text-slate-600 font-semibold">cm</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-black shadow-2xs ${
                            p.angleRight === '45°' 
                              ? 'bg-amber-600 text-white' 
                              : 'bg-slate-800 text-white'
                          }`}>
                            {p.angleRight}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-black text-slate-950 text-base sm:text-lg">
                          ×{p.quantity}
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs">
                          <div className="flex flex-col gap-1">
                            {barIndices.length > 0 && (
                              <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] bg-slate-100 text-blue-900 border border-slate-200 px-2 py-0.5 rounded-md w-fit">
                                <span>Barre #{barIndices.join(', #')}</span>
                              </span>
                            )}
                            <span className="font-medium">{p.notes || '—'}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* TAB 2: DÉBITAGE & OPTIMISATION DES BARRES */}
          <div className={`space-y-4 ${activeTab !== 'debitage' ? 'hidden print:block' : 'block'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>
                  Besoins en Barres Brutes & Optimisation des Chutes (Profilés 6.5m / Lames 6.0m)
                  {selectedOuvrageIdx !== 'all' && <span className="text-blue-600 font-bold"> [ {selectedLabel} ]</span>}
                </span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedDebitage.map((deb, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-white bg-slate-900 px-2.5 py-0.5 rounded-lg text-xs shadow-2xs">
                          {deb.profilRef}
                        </span>
                        <span className="font-bold text-slate-950 text-sm sm:text-base">{deb.profilDesignation}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Métrage net : <strong className="text-slate-900 font-mono font-bold">{deb.totalLinearMeters.toFixed(2)} m</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs ${deb.isProfileBar ? 'bg-blue-600 text-white' : 'bg-indigo-600 text-white'}`}>
                        {deb.totalBarsCount} barre{deb.totalBarsCount > 1 ? 's' : ''} ({deb.barLengthMeters.toFixed(2)}m)
                      </span>
                      <p className="text-[10px] text-slate-500 mt-1 font-mono font-semibold">Chute moy : {deb.scrapPercentageAverage.toFixed(1)}%</p>
                    </div>
                  </div>

                  {/* Bars visual cuts */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-800">Plan de coupe optimisé :</p>
                    {deb.allocatedBars.map((bar, bIdx) => {
                      const segmentColors = [
                        'bg-blue-600',
                        'bg-indigo-600',
                        'bg-sky-600',
                        'bg-teal-600',
                        'bg-cyan-600',
                        'bg-violet-600'
                      ];

                      return (
                        <div key={bIdx} className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 sm:p-3.5 text-xs space-y-2.5">
                          <div className="flex justify-between items-center text-xs text-slate-800 font-semibold flex-wrap gap-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold flex items-center gap-1.5 text-slate-900">
                                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                Barre #{bar.barIndex} ({bar.barLengthCm} cm)
                              </span>
                              {bar.isShared && (
                                <span 
                                  className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md text-[10px] font-bold"
                                  title={`Barre partagée pour : ${bar.allSharedOuvrageNames.join(' + ')}`}
                                >
                                  🔗 Partagée ({bar.allSharedOuvrageNames.length} ouvrages)
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-slate-700 text-xs bg-white border border-slate-200 px-2.5 py-0.5 rounded-md shadow-2xs">
                              Reste chute finale : <strong className="text-amber-800 font-bold">{bar.scrapCm.toFixed(1)} cm</strong>
                            </span>
                          </div>

                          {/* Visual Bar Container */}
                          <div className="w-full bg-slate-200/90 h-8 sm:h-9 rounded-lg overflow-hidden flex border border-slate-300 shadow-inner">
                            {/* 1. Active Cuts (Solid colored blocks) */}
                            {bar.activeCuts.map((c, cIdx) => {
                              const pct = (c.lengthCm / bar.barLengthCm) * 100;
                              const colorClass = segmentColors[cIdx % segmentColors.length];
                              const exactFormatted = c.lengthCm % 1 === 0 ? `${c.lengthCm.toFixed(0)}cm` : `${c.lengthCm.toFixed(1)}cm`;

                              return (
                                <div
                                  key={cIdx}
                                  style={{ width: `${pct}%` }}
                                  title={`${c.label} : ${c.lengthCm.toFixed(1)} cm (${pct.toFixed(1)}%)`}
                                  className={`${colorClass} border-r border-white/60 flex items-center justify-center text-[11px] sm:text-xs text-white font-mono font-black truncate px-1 shadow-2xs hover:brightness-110 transition-all`}
                                >
                                  {exactFormatted}
                                </div>
                              );
                            })}

                            {/* 2. Reserved Segment for Other Products on Shared Bar (in Filtered View) */}
                            {bar.otherReservedLengthCm > 0 && (
                              <div
                                style={{ width: `${(bar.otherReservedLengthCm / bar.barLengthCm) * 100}%` }}
                                title={`Réservé pour : ${bar.otherOuvrageNames.join(' • ')} (${bar.otherReservedLengthCm.toFixed(1)} cm) — NE PAS JETER`}
                                className="bg-amber-100/90 border-r border-dashed border-amber-400 text-amber-950 text-[10px] sm:text-[11px] flex items-center justify-center font-bold px-1.5 truncate shadow-inner select-none font-mono"
                              >
                                <span className="truncate flex items-center gap-1">
                                  🔒 Réservé : {bar.otherReservedLengthCm.toFixed(1)}cm
                                </span>
                              </div>
                            )}

                            {/* 3. True End-of-Bar Unusable Scrap */}
                            {bar.scrapCm > 0 && (
                              <div
                                style={{ width: `${(bar.scrapCm / bar.barLengthCm) * 100}%` }}
                                title={`Chute finale non réutilisable : ${bar.scrapCm.toFixed(1)} cm`}
                                className="bg-amber-50 text-amber-900 text-[10px] sm:text-[11px] flex items-center justify-center font-mono truncate font-bold border-dashed border-l border-amber-300 px-1"
                              >
                                {bar.scrapCm >= 30 ? `Chute ${bar.scrapCm.toFixed(1)}cm` : `${bar.scrapCm.toFixed(1)}`}
                              </div>
                            )}
                          </div>

                          {/* Badges and Pieces Detail below bar */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {bar.activeCuts.map((c, cIdx) => {
                              const colorClass = segmentColors[cIdx % segmentColors.length];
                              return (
                                <span 
                                  key={cIdx}
                                  className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-800 px-2.5 py-1 rounded-lg font-sans text-xs font-semibold shadow-2xs"
                                  title={c.label}
                                >
                                  <span className={`w-2 h-2 rounded-full ${colorClass}`}></span>
                                  <span className="text-slate-700">{c.label} :</span>
                                  <span className="font-mono font-black text-slate-950">{c.lengthCm.toFixed(1)} cm</span>
                                </span>
                              );
                            })}
                            {bar.scrapCm > 0 && (
                              <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-300 text-amber-950 px-2.5 py-1 rounded-lg font-mono text-xs font-bold shadow-2xs">
                                Chute finale: {bar.scrapCm.toFixed(1)} cm
                              </span>
                            )}
                          </div>

                          {/* Workshop Cutting Instruction Callout for Shared Bar */}
                          {bar.isShared && (
                            <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-2 sm:p-2.5 flex items-start gap-2 text-xs text-amber-950 mt-1 shadow-2xs">
                              <span className="font-bold text-amber-800 shrink-0">💡 Consigne Atelier :</span>
                              <p className="text-[11px] leading-relaxed">
                                {selectedOuvrageIdx !== 'all' 
                                  ? `Après découpe des ${bar.activeCuts.length} pièce(s) de cet ouvrage, étiqueter et conserver le reste de ${bar.otherReservedLengthCm.toFixed(1)} cm pour : ${bar.otherOuvrageNames.join(' • ')}.`
                                  : `Barre partagée multi-ouvrages (${bar.allSharedOuvrageNames.join(' + ')}) : découper selon la séquence pour utiliser l'intégralité des ${bar.usedLengthCm.toFixed(1)} cm utiles.`}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TAB 3: QUINCAILLERIE & ACCESSOIRES DÉTAILLÉS */}
          <div className={`space-y-4 ${activeTab !== 'composants' ? 'hidden print:block' : 'block'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Box className="w-4 h-4 text-emerald-600" />
                <span>
                  Composants, Quincaillerie & Visserie (100% Catalogue ALLUCO)
                  {selectedOuvrageIdx !== 'all' && <span className="text-blue-600 font-bold"> [ {selectedLabel} ]</span>}
                </span>
              </h3>
              <span className="font-mono font-bold text-xs bg-emerald-50 text-emerald-900 border border-emerald-300 px-3.5 py-1 rounded-xl shadow-2xs">
                Total Quincaillerie : {displayedAccessoriesCost.toFixed(3)} DT HT
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Composant / Article</th>
                    <th className="px-5 py-3">Référence Catalogue</th>
                    <th className="px-5 py-3">Rôle & Emplacement</th>
                    <th className="px-5 py-3 text-center">Quantité</th>
                    <th className="px-5 py-3 text-right font-mono">P.U (HT)</th>
                    <th className="px-5 py-3 text-right font-mono">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedAccessories.map((acc, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3.5 font-bold text-slate-950 flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <span>{acc.designation}</span>
                          {acc.elementLabel && selectedOuvrageIdx === 'all' && (
                            <div className="text-[10px] text-slate-500 font-medium">{acc.elementLabel}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-800 font-bold">
                        <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-xs">
                          {acc.reference || 'STD'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 text-xs">{acc.details}</td>
                      <td className="px-5 py-3.5 text-center font-mono font-black text-slate-950 text-sm">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-md">
                          {acc.quantity} {acc.unit}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-slate-700">
                        {acc.unitPriceHt.toFixed(3)} DT
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-black text-slate-950 text-sm">
                        {acc.totalPriceHt.toFixed(3)} DT
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50/80 border-t border-slate-200 font-mono font-bold">
                  <tr>
                    <td colSpan={5} className="px-5 py-3.5 text-right text-slate-700 font-sans text-xs uppercase tracking-wider">
                      TOTAL QUINCAILLERIE & JOINTS (HT) :
                    </td>
                    <td className="px-5 py-3.5 text-right text-emerald-800 font-black text-base">
                      {displayedAccessoriesCost.toFixed(3)} DT
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* TAB 1: BON DE COMMANDE FOURNISSEUR & APPROVISIONNEMENT GLOBAL (5 Catégories avec Prix HT) */}
          <div className={`space-y-5 ${activeTab !== 'fournisseur' ? 'hidden print:block' : 'block'}`}>
            <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-blue-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                    Approvisionnement A à Z
                  </span>
                  <span className="text-blue-200 text-xs font-mono font-bold">
                    Dossier {currentDevis.numero}
                  </span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Chiffré Catalogue
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white mt-1">
                  Bon de Commande & Achats Fournisseurs Global
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                  Liste récapitulative consolidée des achats avec prix unitaire (HT), métrages, quantités de barres et totaux pour chaque fournisseur.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-3 text-right">
                  <span className="text-[10px] uppercase font-extrabold text-blue-200 tracking-wider block">
                    Budget Matériaux Total (HT)
                  </span>
                  <p className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-0.5 leading-none">
                    {result.supplierOrderSummary.grandTotalCostHt.toFixed(3)} <span className="text-xs text-white font-bold">DT</span>
                  </p>
                  <span className="text-[10px] text-slate-300">Coût de revient matière première</span>
                </div>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition shadow-md shadow-blue-600/30 cursor-pointer h-full"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer le Bon d'Achat</span>
                </button>
              </div>
            </div>

            {/* Subtotal summary cards by category */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
              {result.supplierOrderSummary.categories.map((cat, idx) => {
                const borderColors = [
                  'border-blue-300 bg-blue-50/70',
                  'border-indigo-300 bg-indigo-50/70',
                  'border-amber-300 bg-amber-50/70',
                  'border-emerald-300 bg-emerald-50/70',
                  'border-sky-300 bg-sky-50/70'
                ];
                const textColors = [
                  'text-blue-950',
                  'text-indigo-950',
                  'text-amber-950',
                  'text-emerald-950',
                  'text-sky-950'
                ];
                return (
                  <div key={idx} className={`p-2.5 rounded-xl border shadow-2xs ${borderColors[idx % borderColors.length]}`}>
                    <p className="text-[10px] uppercase font-extrabold text-slate-600 truncate">{cat.title.replace(/^\d+\.\s*/, '')}</p>
                    <p className={`text-base font-black font-mono mt-0.5 ${textColors[idx % textColors.length]}`}>
                      {cat.totalCostHt.toFixed(3)} <span className="text-[10px] font-bold">DT</span>
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500 mt-0.5">{cat.badge}</p>
                  </div>
                );
              })}
            </div>

            {/* 5 CATEGORIES EXPANDED IN FULL A TO Z VIEW WITH PRICES */}
            <div className="space-y-4">
              {result.supplierOrderSummary.categories.map((cat, catIdx) => {
                const categoryColors = [
                  { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', badge: 'bg-blue-600 text-white' },
                  { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-900', badge: 'bg-indigo-600 text-white' },
                  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', badge: 'bg-amber-600 text-white' },
                  { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', badge: 'bg-emerald-600 text-white' },
                  { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-900', badge: 'bg-sky-600 text-white' }
                ];
                const color = categoryColors[catIdx % categoryColors.length];

                return (
                  <div key={catIdx} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className={`px-4 sm:px-5 py-3 ${color.bg} border-b ${color.border} flex items-center justify-between flex-wrap gap-2`}>
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
                        <h4 className={`font-black text-sm sm:text-base ${color.text} tracking-tight`}>{cat.title}</h4>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-mono font-black text-xs ${color.badge} px-3 py-1 rounded-xl shadow-2xs`}>
                          {cat.badge}
                        </span>
                        <span className="font-mono font-black text-xs bg-slate-900 text-emerald-400 border border-slate-800 px-3 py-1 rounded-xl shadow-2xs">
                          Sous-Total : {cat.totalCostHt.toFixed(3)} DT HT
                        </span>
                      </div>
                    </div>

                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-4 sm:px-5 py-2.5 w-28">Référence</th>
                          <th className="px-4 sm:px-5 py-2.5">Désignation de l'Article</th>
                          <th className="px-4 sm:px-5 py-2.5">Détails / Rôle</th>
                          <th className="px-4 sm:px-5 py-2.5 text-center w-36">Quantité</th>
                          <th className="px-4 sm:px-5 py-2.5 text-right font-mono w-28">P.U (HT)</th>
                          <th className="px-4 sm:px-5 py-2.5 text-right font-mono w-32">Total HT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {cat.items.map((item, iIdx) => (
                          <tr key={iIdx} className="hover:bg-slate-50/80 transition">
                            <td className="px-4 sm:px-5 py-3 font-mono font-black text-slate-950 text-xs">
                              <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                                {item.reference}
                              </span>
                            </td>
                            <td className="px-4 sm:px-5 py-3 font-bold text-slate-900">{item.designation}</td>
                            <td className="px-4 sm:px-5 py-3 text-slate-600 text-xs">{item.details || '—'}</td>
                            <td className="px-4 sm:px-5 py-3 text-center font-mono font-black text-blue-900 text-sm">
                              <span className="bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg">
                                {item.quantity} {item.unit}
                              </span>
                            </td>
                            <td className="px-4 sm:px-5 py-3 text-right font-mono font-semibold text-slate-700 text-xs">
                              {item.unitPriceHt !== undefined ? `${item.unitPriceHt.toFixed(3)} DT` : '—'}
                            </td>
                            <td className="px-4 sm:px-5 py-3 text-right font-mono font-black text-slate-950 text-sm sm:text-base">
                              {item.totalPriceHt !== undefined ? `${item.totalPriceHt.toFixed(3)} DT` : '—'}
                            </td>
                          </tr>
                        ))}
                        {cat.items.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-5 py-4 text-center text-slate-400 italic">
                              Aucun élément requis pour cette catégorie dans ce devis.
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="bg-slate-50/90 border-t border-slate-200 font-mono font-bold">
                        <tr>
                          <td colSpan={5} className="px-4 sm:px-5 py-3 text-right text-slate-700 font-sans text-xs uppercase tracking-wider">
                            SOUS-TOTAL {cat.title.replace(/^\d+\.\s*/, '').toUpperCase()} (HT) :
                          </td>
                          <td className="px-4 sm:px-5 py-3 text-right text-emerald-800 font-black text-sm sm:text-base">
                            {cat.totalCostHt.toFixed(3)} DT
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TAB 5: VITRAGE (MIROITERIE) */}
          <div className={`space-y-3 ${activeTab !== 'vitrage' ? 'hidden print:block' : 'block'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Grid className="w-4 h-4 text-blue-600" />
                <span>
                  Cotes de Coupe Verre pour le Miroitier (Surface totale : {displayedGlassAreaM2} m²)
                  {selectedOuvrageIdx !== 'all' && <span className="text-blue-600 font-bold"> [ {selectedLabel} ]</span>}
                </span>
              </h3>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Ouvrage</th>
                    <th className="px-5 py-3">Type de Vitrage</th>
                    <th className="px-5 py-3 text-right font-mono">Hauteur Verre (cm)</th>
                    <th className="px-5 py-3 text-right font-mono">Largeur Verre (cm)</th>
                    <th className="px-5 py-3 text-center">Nombre Carreaux</th>
                    <th className="px-5 py-3 text-right font-mono">Surface Totale (m²)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                  {displayedGlass.map((g, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3.5 font-sans font-semibold text-slate-900">{g.elementLabel}</td>
                      <td className="px-5 py-3.5 font-sans text-slate-900 font-bold">{g.vitrageType}</td>
                      <td className="px-5 py-3.5 text-right font-black text-slate-950 text-base">{g.hauteurCm.toFixed(1)} cm</td>
                      <td className="px-5 py-3.5 text-right font-black text-slate-950 text-base">{g.largeurCm.toFixed(1)} cm</td>
                      <td className="px-5 py-3.5 text-center font-black text-slate-950 text-base">×{g.quantity}</td>
                      <td className="px-5 py-3.5 text-right font-black text-emerald-800 text-base">{g.totalAreaM2.toFixed(3)} m²</td>
                    </tr>
                  ))}
                  {displayedGlass.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-4 text-center text-slate-400 italic">
                        Aucun vitrage requis pour cet ouvrage (ex: volet roulant ou garde-corps).
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Notes for Workshop */}
          <div className="text-xs text-slate-500 border-t border-slate-200 pt-3 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p>Document généré par AluPro — Module ALU CALCUL de Fabrication Aluminium.</p>
            <p className="font-mono font-semibold text-slate-700">Feuille prête pour exécution atelier & approvisionnement</p>
          </div>
        </div>
      </div>

      {/* QUICK EDIT ITEM MODAL */}
      {editingItemIdx !== null && (
        <div className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center p-4 animate-in fade-in duration-150 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Modifier l'Ouvrage #{editingItemIdx + 1}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setEditingItemIdx(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Désignation</label>
                <input
                  type="text"
                  value={editForm.designation}
                  onChange={e => setEditForm({ ...editForm, designation: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Largeur (cm)</label>
                  <input
                    type="number"
                    value={editForm.largeur}
                    onChange={e => setEditForm({ ...editForm, largeur: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hauteur (cm)</label>
                  <input
                    type="number"
                    value={editForm.hauteur}
                    onChange={e => setEditForm({ ...editForm, hauteur: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantité</label>
                  <input
                    type="number"
                    min={1}
                    value={editForm.quantity}
                    onChange={e => setEditForm({ ...editForm, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Couleur</label>
                  <select
                    value={editForm.couleur}
                    onChange={e => setEditForm({ ...editForm, couleur: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                  >
                    <option value="Blanc">Blanc</option>
                    <option value="Gris">Gris</option>
                    <option value="Noir">Noir</option>
                    <option value="Couleur Mat">Couleur Mat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Type de Vitrage</label>
                <input
                  type="text"
                  value={editForm.remplissage_id}
                  onChange={e => setEditForm({ ...editForm, remplissage_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingItemIdx(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveEditItem}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ADD ITEM MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center p-4 animate-in fade-in duration-150 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Ajouter un Ouvrage à Fabriquer
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Famille / Série</label>
                <select
                  value={addForm.family_id}
                  onChange={e => {
                    const famId = e.target.value;
                    const types = getProductTypesForFamily(famId);
                    setAddForm({
                      ...addForm,
                      family_id: famId,
                      product_type_id: types[0]?.id || 'std',
                      designation: types[0]?.name || 'Menuiserie Alu'
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                >
                  {FAMILIES.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Type d'Ouvrage</label>
                <select
                  value={addForm.product_type_id}
                  onChange={e => {
                    const types = getProductTypesForFamily(addForm.family_id);
                    const found = types.find(t => t.id === e.target.value);
                    setAddForm({
                      ...addForm,
                      product_type_id: e.target.value,
                      designation: found?.name || addForm.designation
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                >
                  {getProductTypesForFamily(addForm.family_id).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Largeur (cm)</label>
                  <input
                    type="number"
                    value={addForm.largeur}
                    onChange={e => setAddForm({ ...addForm, largeur: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hauteur (cm)</label>
                  <input
                    type="number"
                    value={addForm.hauteur}
                    onChange={e => setAddForm({ ...addForm, hauteur: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantité</label>
                  <input
                    type="number"
                    min={1}
                    value={addForm.quantity}
                    onChange={e => setAddForm({ ...addForm, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Couleur</label>
                  <select
                    value={addForm.couleur}
                    onChange={e => setAddForm({ ...addForm, couleur: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                  >
                    <option value="Blanc">Blanc</option>
                    <option value="Gris">Gris</option>
                    <option value="Noir">Noir</option>
                    <option value="Couleur Mat">Couleur Mat</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveAddItem}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(modalElement, document.body);
};
