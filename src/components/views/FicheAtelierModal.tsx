import React, { useState } from 'react';
import { DevisRecord, DevisItemState, useApp } from '../../context/AppContext';
import { calculateAluFabrication, AluCalculResult } from '../../utils/aluCalculEngine';
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
  Sparkles
} from 'lucide-react';

interface FicheAtelierModalProps {
  devis: DevisRecord;
  onClose: () => void;
  onEditDevis?: (devisId: string) => void;
}

export const FicheAtelierModal: React.FC<FicheAtelierModalProps> = ({ devis, onClose, onEditDevis }) => {
  const { settings, saveDevis, articlesMap } = useApp();
  const [activeTab, setActiveTab] = useState<'decoupage' | 'debitage' | 'composants' | 'vitrage'>('decoupage');
  
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
    const margesConfig = updatedDevis.marges || {
      margeType: 'percent' as const,
      margeValue: 30,
      margeGcType: 'percent' as const,
      margeGcValue: 30,
      margeMoustiType: 'percent' as const,
      margeMoustiValue: 30,
      margeStoreType: 'percent' as const,
      margeStoreValue: 30,
      tva: settings.tva_default || 19
    };

    // Calculate full synchronized financial totals (HT, TVA, TTC, item costs)
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
      designation: (item.manual_designation || item.manual_nom || `Produit ${idx + 1}`) as string,
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
      manual_designation: `${itemToClone.manual_designation || 'Produit'} (Copie)`
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
      // Profile references
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

  // Compute exact fabrication data
  const result: AluCalculResult = calculateAluFabrication(currentDevis.items);

  const totalPiecesCount = result.cuttingPieces.reduce((sum, p) => sum + p.quantity, 0);

  // Check for suspiciously high quantities (likely data entry error)
  const highQtyItems = currentDevis.items.filter(it => !it.is_manual && (Number(it.quantity) || 1) > 10);
  const hasHighQty = highQtyItems.length > 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-6xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-700/30 ring-1 ring-black/10">
        
        {/* Top Header Bar (No Print) */}
        <div className="no-print px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
              <Scissors className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-extrabold text-sm sm:text-base tracking-tight text-white">Fiche Technique Atelier & Découpe</h2>
                <span className="text-[11px] sm:text-xs bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-lg font-mono font-bold">
                  {currentDevis.numero}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Client : <strong className="text-slate-200">{currentDevis.client_nom || 'Sans client'}</strong> • {currentDevis.items.length} ouvrage{currentDevis.items.length > 1 ? 's' : ''} à fabriquer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEditDevis && (
              <button
                onClick={() => onEditDevis(currentDevis.id)}
                className="hidden sm:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl transition border border-slate-700 cursor-pointer"
                title="Modifier dans l'éditeur de devis complet"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                <span>Studio Devis</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold px-3 sm:px-4 py-2 rounded-xl transition shadow-md shadow-blue-600/30 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimer (PDF Atelier)</span>
              <span className="sm:hidden">Imprimer</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Fixed Size 4-Column Grid (No Print) */}
        <div className="no-print bg-slate-100/95 border-b border-slate-200/90 p-2 sm:p-2.5 shrink-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              { id: 'decoupage', label: '1. Feuille de Découpage', sublabel: 'Scie à onglet', icon: Scissors, badge: `${totalPiecesCount} pièces` },
              { id: 'debitage', label: '2. Débitage & Barres 6m', sublabel: 'Stock & Chutes', icon: Layers, badge: `${result.totalProfileBarsCount} barres 6m` },
              { id: 'composants', label: '3. Composants & Quincaillerie', sublabel: 'Accessoires & Joints', icon: Box, badge: `${result.accessories.length} types` },
              { id: 'vitrage', label: '4. Cotes Miroiterie', sublabel: 'Plan de vitrage', icon: Grid, badge: `${result.totalGlassAreaM2} m²` }
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
                    <div className="flex items-center gap-2 min-w-0">
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

        {/* Printable Document Body with custom sleek scrollbar */}
        <div className="flex-1 p-3 sm:p-5 overflow-y-auto bg-slate-50 printable-area space-y-3 sm:space-y-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 [&::-webkit-scrollbar-track]:bg-slate-100/50">
          
          {/* Header Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-[10px] uppercase font-extrabold text-blue-700 tracking-wider">
                Atelier de Menuiserie Aluminium
              </span>
              <h1 className="text-base sm:text-xl font-black text-slate-900 mt-0.5">
                {settings.nom_atelier || 'AtelierPro'} — FICHE DE FABRICATION ATELIER
              </h1>
              <p className="text-xs text-slate-600 mt-0.5 flex flex-wrap items-center gap-2 sm:gap-3">
                <span>Dossier : <strong className="text-slate-900 font-mono font-bold">{currentDevis.numero}</strong></span>
                <span className="text-slate-300">•</span>
                <span>Client : <strong className="text-slate-900 font-bold">{currentDevis.client_nom || 'Client Atelier'}</strong></span>
                <span className="text-slate-300">•</span>
                <span>Date : <strong className="text-slate-900 font-mono font-bold">{currentDevis.date}</strong></span>
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <div className="bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-xl text-center shadow-2xs">
                <p className="text-[10px] text-blue-800 uppercase font-bold tracking-wider">Barres 6m Profilés</p>
                <p className="text-lg font-black text-blue-950 font-mono leading-none mt-0.5">
                  {result.totalProfileBarsCount} <span className="text-xs font-bold text-blue-800">barres</span>
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-center shadow-2xs">
                <p className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider">Surface Totale Verre</p>
                <p className="text-lg font-black text-emerald-950 font-mono leading-none mt-0.5">
                  {result.totalGlassAreaM2} <span className="text-xs font-bold text-emerald-800">m²</span>
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

          {/* Récapitulatif des ouvrages avec Boutons Modifier / Ajouter */}
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
                    const nom = it.is_manual ? (it.manual_nom || 'Ligne libre') : (it.manual_designation || `Produit ${idx + 1}`);

                    return (
                      <tr key={idx} className={isHigh ? 'bg-orange-50/60' : 'hover:bg-slate-50/80 transition'}>
                        <td className="px-4 py-2.5 font-mono font-bold text-slate-400">{idx + 1}</td>
                        <td className="px-4 py-2.5">
                          <div className="font-bold text-slate-900 text-sm">{nom}</div>
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
                        <td className="px-4 py-2.5 text-center">
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
                        <td className="no-print px-4 py-2.5 text-right">
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

          {/* TAB 1: FEUILLE DE DÉCOUPAGE */}
          <div className={`space-y-3 ${activeTab !== 'decoupage' ? 'hidden print:block' : 'block'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Scissors className="w-4 h-4 text-blue-600" />
                <span>Feuille de Découpage pour Scie à Onglet ({result.cuttingPieces.length} lignes de coupe — {totalPiecesCount} pièces au total)</span>
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
                  {result.cuttingPieces.map((p, idx) => (
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
                      <td className="px-4 py-3 text-slate-600 text-xs font-medium">{p.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TAB 2: DÉBITAGE & BARRES 6M */}
          <div className={`space-y-4 ${activeTab !== 'debitage' ? 'hidden print:block' : 'block'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Besoins en Barres Brutes (Standard 6,00 m) & Optimisation des Chutes</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.debitageSummary.map((deb, idx) => (
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
                        Métrage net total : <strong className="text-slate-900 font-mono font-bold">{deb.totalLinearMeters.toFixed(2)} m</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs ${deb.isProfileBar ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white'}`}>
                        {deb.totalBarsCount} {deb.isProfileBar ? 'barre' : 'unité'}{deb.totalBarsCount > 1 ? 's' : ''} {deb.isProfileBar ? 'de 6m' : ''}
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
                          <div className="flex justify-between items-center text-xs text-slate-800 font-semibold">
                            <span className="font-bold flex items-center gap-1.5 text-slate-900">
                              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                              Barre #{bar.barIndex} (600 cm)
                            </span>
                            <span className="font-mono text-slate-700 text-xs bg-white border border-slate-200 px-2.5 py-0.5 rounded-md shadow-2xs">
                              Reste chute : <strong className="text-amber-800 font-bold">{bar.scrapCm.toFixed(1)} cm</strong>
                            </span>
                          </div>

                          {/* Progress bar of cuts with clear height and distinct colors */}
                          <div className="w-full bg-slate-200/80 h-7 sm:h-8 rounded-lg overflow-hidden flex border border-slate-300 shadow-inner">
                            {bar.cuts.map((c, cIdx) => {
                              const pct = (c.lengthCm / 600) * 100;
                              const colorClass = segmentColors[cIdx % segmentColors.length];
                              return (
                                <div
                                  key={cIdx}
                                  style={{ width: `${pct}%` }}
                                  title={`${c.label} : ${c.lengthCm.toFixed(1)} cm (${pct.toFixed(1)}%)`}
                                  className={`${colorClass} border-r border-white/60 flex items-center justify-center text-[11px] sm:text-xs text-white font-mono font-black truncate px-1 shadow-2xs hover:brightness-110 transition-all`}
                                >
                                  {c.lengthCm >= 30 ? `${c.lengthCm.toFixed(0)}cm` : `${c.lengthCm.toFixed(0)}`}
                                </div>
                              );
                            })}
                            {bar.scrapCm > 0 && (
                              <div
                                style={{ width: `${(bar.scrapCm / 600) * 100}%` }}
                                title={`Chute inutilisée : ${bar.scrapCm.toFixed(1)} cm`}
                                className="bg-amber-100 text-amber-900 text-[10px] sm:text-[11px] flex items-center justify-center font-mono truncate font-bold border-dashed border-l border-amber-300 px-1"
                              >
                                {bar.scrapCm >= 40 ? `Chute ${bar.scrapCm.toFixed(0)}cm` : `${bar.scrapCm.toFixed(0)}`}
                              </div>
                            )}
                          </div>

                          {/* Chips breakdown of all pieces in this bar for easy reading */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {bar.cuts.map((c, cIdx) => {
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
                                Chute: {bar.scrapCm.toFixed(1)} cm
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TAB 3: COMPOSANTS & QUINCAILLERIE */}
          <div className={`space-y-6 ${activeTab !== 'composants' ? 'hidden print:block' : 'block'}`}>
            
            {/* SECTION A: PROFILÉS ALUMINIUM À SORTIR DU STOCK */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>1. Profilés Aluminium (Barres Standard 6,00 m à sortir du Stock)</span>
                </h3>
                <span className="font-mono font-bold text-xs bg-blue-900 text-white px-3 py-1 rounded-xl shadow-2xs">
                  {result.totalProfileBarsCount} barre{result.totalProfileBarsCount > 1 ? 's' : ''} 6m au total
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Composant Profilé</th>
                      <th className="px-5 py-3">Référence Série</th>
                      <th className="px-5 py-3">Métrage Net Nécessaire</th>
                      <th className="px-5 py-3 text-center">Nombre de Barres 6m</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.debitageSummary.map((deb, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3.5 font-bold text-slate-950 flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
                          <span>{deb.profilDesignation}</span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-900 font-bold">
                          <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-xs">
                            Série {deb.profilRef}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-800 font-semibold">
                          {deb.totalLinearMeters.toFixed(2)} mètres
                        </td>
                        <td className="px-5 py-3.5 text-center font-mono font-black text-blue-900 text-sm">
                          <span className="bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg">
                            {deb.totalBarsCount} {deb.isProfileBar ? 'barre' : 'unité'}{deb.totalBarsCount > 1 ? 's' : ''} {deb.isProfileBar ? 'de 6m' : ''}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION B: JOINTS & QUINCAILLERIE DÉTAILLÉE */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Box className="w-4 h-4 text-emerald-600" />
                  <span>2. Joints, Quincaillerie & Accessoires de Pose</span>
                </h3>
                <span className="font-mono font-bold text-xs bg-emerald-50 text-emerald-900 border border-emerald-300 px-3.5 py-1 rounded-xl shadow-2xs">
                  Total Quincaillerie : {result.totalAccessoriesCostHt.toFixed(3)} DT HT
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Composant</th>
                      <th className="px-5 py-3">Référence / Modèle</th>
                      <th className="px-5 py-3">Rôle & Emplacement</th>
                      <th className="px-5 py-3 text-center">Quantité / Mesure</th>
                      <th className="px-5 py-3 text-right font-mono">P.U (HT)</th>
                      <th className="px-5 py-3 text-right font-mono">Total HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.accessories.map((acc, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3.5 font-bold text-slate-950 flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{acc.designation}</span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-800 font-bold">{acc.reference || 'STD'}</td>
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
                        TOTAL ESTIMATION QUINCAILLERIE & JOINTS (HT) :
                      </td>
                      <td className="px-5 py-3.5 text-right text-emerald-800 font-black text-base">
                        {result.totalAccessoriesCostHt.toFixed(3)} DT
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* TAB 4: VITRAGE (MIROITERIE) */}
          <div className={`space-y-3 ${activeTab !== 'vitrage' ? 'hidden print:block' : 'block'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Grid className="w-4 h-4 text-blue-600" />
                <span>Cotes de Coupe Verre pour le Miroitier (Surface totale : {result.totalGlassAreaM2} m²)</span>
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
                  {result.glassItems.map((g, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3.5 font-sans font-semibold text-slate-900">{g.elementLabel}</td>
                      <td className="px-5 py-3.5 font-sans text-slate-900 font-bold">{g.vitrageType}</td>
                      <td className="px-5 py-3.5 text-right font-black text-slate-950 text-base">{g.hauteurCm.toFixed(1)} cm</td>
                      <td className="px-5 py-3.5 text-right font-black text-slate-950 text-base">{g.largeurCm.toFixed(1)} cm</td>
                      <td className="px-5 py-3.5 text-center font-black text-slate-950 text-base">×{g.quantity}</td>
                      <td className="px-5 py-3.5 text-right font-black text-emerald-800 text-base">{g.totalAreaM2.toFixed(3)} m²</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Notes for Workshop */}
          <div className="text-xs text-slate-500 border-t border-slate-200 pt-3 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p>Document généré par AtelierPro — Module ALU CALCUL de Fabrication Aluminium.</p>
            <p className="font-mono font-semibold text-slate-700">Feuille prête pour exécution atelier</p>
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
                <label className="block font-bold text-slate-700 mb-1">Désignation / Nom</label>
                <input
                  type="text"
                  value={editForm.designation}
                  onChange={e => setEditForm(prev => ({ ...prev, designation: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: Fenêtre Salon"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Largeur L (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="10"
                    value={editForm.largeur}
                    onChange={e => setEditForm(prev => ({ ...prev, largeur: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hauteur H (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="10"
                    value={editForm.hauteur}
                    onChange={e => setEditForm(prev => ({ ...prev, hauteur: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantité (Unités)</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditForm(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={editForm.quantity}
                      onChange={e => setEditForm(prev => ({ ...prev, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
                      className="w-full text-center px-2 py-2 border border-slate-300 rounded-xl font-mono font-black text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setEditForm(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Couleur</label>
                  <select
                    value={editForm.couleur}
                    onChange={e => setEditForm(prev => ({ ...prev, couleur: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Blanc">Blanc Standard</option>
                    <option value="Faux bois">Faux Bois Chêne/Noyer</option>
                    <option value="Gris 7016">Gris Anthracite (7016)</option>
                    <option value="Noir 9005">Noir Mat (9005)</option>
                    <option value="Bronze">Bronze Anodisé</option>
                    <option value="Naturel">Anodisé Naturel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Type de Vitrage</label>
                <select
                  value={editForm.remplissage_id}
                  onChange={e => setEditForm(prev => ({ ...prev, remplissage_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Simple Clair 6mm">Simple Clair 6mm</option>
                  <option value="Simple Clair 5mm">Simple Clair 5mm</option>
                  <option value="Double 4/12/4">Double Vitrage 4/12/4 Isolation</option>
                  <option value="Double 6/12/6">Double Vitrage 6/12/6 Renforcé</option>
                  <option value="Verre Dépoli 6mm">Verre Dépoli Acide 6mm</option>
                  <option value="Stop-sol Gris 6mm">Stop-sol Solaire Gris 6mm</option>
                  <option value="Stop-sol Bronze 6mm">Stop-sol Solaire Bronze 6mm</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              {onEditDevis && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingItemIdx(null);
                    onEditDevis(currentDevis.id);
                  }}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Éditeur complet</span>
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setEditingItemIdx(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditItem}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer & Recalculer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ADD ITEM MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center p-4 animate-in fade-in duration-150 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Ajouter un Ouvrage à la Fiche Atelier
                  </h3>
                  <p className="text-[11px] text-slate-500">Ajout rapide de fenêtre, porte ou châssis alu</p>
                </div>
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
                <label className="block font-bold text-slate-700 mb-1">Type de Menuiserie Aluminium</label>
                <select
                  value={`${addForm.family_id}|${addForm.product_type_id}`}
                  onChange={e => {
                    const [fId, pId] = e.target.value.split('|');
                    const types = getProductTypesForFamily(fId);
                    const selType = types.find(t => t.id === pId);
                    setAddForm(prev => ({
                      ...prev,
                      family_id: fId,
                      product_type_id: pId,
                      designation: selType ? selType.name : prev.designation
                    }));
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <optgroup label="Série 67 Coulissant (EX60 / TPR)">
                    <option value="60|coul_2v">Fenêtre Coulissante 2 Vantaux</option>
                    <option value="60|coul_3v">Fenêtre Coulissante 3 Vantaux</option>
                    <option value="60|coul_4v">Baie Coulissante 4 Vantaux</option>
                    <option value="60|porte_fenetre_coul">Porte-Fenêtre Coulissante 2V</option>
                  </optgroup>
                  <optgroup label="Série 40 Frappe (Portes & Battants)">
                    <option value="50|porte_frappe_2v">Porte à la française 2 Vantaux</option>
                    <option value="50|porte_frappe_1v">Porte à la française 1 Vantail</option>
                    <option value="50|fenetre_frappe_2v">Fenêtre Battante 2 Vantaux</option>
                    <option value="50|fenetre_frappe_1v">Fenêtre Battante 1 Vantail</option>
                    <option value="50|soufflet">Châssis à Soufflet / Abattant</option>
                  </optgroup>
                  <optgroup label="Châssis Fixes, Stores & Garde-Corps">
                    <option value="50|fixe_standard">Châssis Fixe Vitré</option>
                    <option value="67|store_1">Store Rideau Roulant Aluminium</option>
                    <option value="68|mousti_1">Moustiquaire</option>
                    <option value="46|gc_1">Garde-Corps Aluminium</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Désignation</label>
                <input
                  type="text"
                  value={addForm.designation}
                  onChange={e => setAddForm(prev => ({ ...prev, designation: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: Baie Salon"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Largeur L (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="10"
                    value={addForm.largeur}
                    onChange={e => setAddForm(prev => ({ ...prev, largeur: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hauteur H (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="10"
                    value={addForm.hauteur}
                    onChange={e => setAddForm(prev => ({ ...prev, hauteur: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantité (Unités)</label>
                  <input
                    type="number"
                    min="1"
                    value={addForm.quantity}
                    onChange={e => setAddForm(prev => ({ ...prev, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-black text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Couleur</label>
                  <select
                    value={addForm.couleur}
                    onChange={e => setAddForm(prev => ({ ...prev, couleur: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Blanc">Blanc Standard</option>
                    <option value="Faux bois">Faux Bois Chêne/Noyer</option>
                    <option value="Gris 7016">Gris Anthracite (7016)</option>
                    <option value="Noir 9005">Noir Mat (9005)</option>
                    <option value="Bronze">Bronze Anodisé</option>
                    <option value="Naturel">Anodisé Naturel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Type de Vitrage</label>
                <select
                  value={addForm.remplissage_id}
                  onChange={e => setAddForm(prev => ({ ...prev, remplissage_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Simple Clair 6mm">Simple Clair 6mm</option>
                  <option value="Simple Clair 5mm">Simple Clair 5mm</option>
                  <option value="Double 4/12/4">Double Vitrage 4/12/4 Isolation</option>
                  <option value="Double 6/12/6">Double Vitrage 6/12/6 Renforcé</option>
                  <option value="Verre Dépoli 6mm">Verre Dépoli Acide 6mm</option>
                  <option value="Stop-sol Gris 6mm">Stop-sol Solaire Gris 6mm</option>
                  <option value="Stop-sol Bronze 6mm">Stop-sol Solaire Bronze 6mm</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveAddItem}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter à la Fiche & Calculer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
