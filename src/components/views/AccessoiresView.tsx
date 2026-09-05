import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AccessoryItemDef } from '../../data/initialAccessories';
import { 
  Box, 
  Search, 
  Edit2, 
  Check, 
  X, 
  Layers, 
  Wrench, 
  Package, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowRight
} from 'lucide-react';

export const AccessoiresView: React.FC = () => {
  const { 
    accessories, 
    updateAccessoryPrice, 
    updateAccessoryStock,
    bulkUpdateAccessories,
    resetAccessoriesToDefault 
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Bulk update states
  const [bulkCategory, setBulkCategory] = useState<string>('all');
  const [bulkDirection, setBulkDirection] = useState<'increase' | 'decrease'>('increase');
  const [bulkMode, setBulkMode] = useState<'percent' | 'amount'>('percent');
  const [bulkValue, setBulkValue] = useState<string>('');
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string>('');

  // Modals
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editStock, setEditStock] = useState<string>('');

  const categories = [
    { id: 'all', label: 'Tous' },
    { id: 'assemblage', label: 'Assemblage & Visserie' },
    { id: 'roulement', label: 'Roulement & Guidage' },
    { id: 'verrouillage', label: 'Verrouillage & Sécurité' },
    { id: 'joints', label: 'Joints & Étanchéité' },
    { id: 'moteurs_volets', label: 'Moteurs & Volets' }
  ];

  const filtered = accessories.filter(a => {
    if (selectedCategory !== 'all' && a.categorie !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        a.nom.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const affectedAccessories = accessories.filter(a => bulkCategory === 'all' || a.categorie === bulkCategory);

  const previewSamples = affectedAccessories.slice(0, 4).map(acc => {
    const origHt = acc.prix_unitaire_ht || 0;
    const numVal = parseFloat(bulkValue) || 0;
    let newHt = origHt;
    if (bulkMode === 'amount') {
      newHt = bulkDirection === 'decrease' ? Math.max(0, origHt - numVal) : origHt + numVal;
    } else {
      const factor = bulkDirection === 'decrease' ? (1 - numVal / 100) : (1 + numVal / 100);
      newHt = Math.max(0, origHt * factor);
    }
    newHt = Math.round(newHt * 1000) / 1000;
    return {
      nom: acc.nom,
      categorie: acc.categorie,
      origHt,
      newHt,
      diff: Math.round((newHt - origHt) * 1000) / 1000
    };
  });

  const handleOpenSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(bulkValue);
    if (isNaN(val) || val <= 0) return;
    setPreviewModalOpen(true);
  };

  const confirmApplyBulk = () => {
    const numVal = parseFloat(bulkValue);
    if (isNaN(numVal) || numVal <= 0) return;
    bulkUpdateAccessories(bulkCategory, numVal, bulkMode, bulkDirection);
    setPreviewModalOpen(false);
    setBulkSuccessMsg(`${bulkDirection === 'increase' ? 'Augmentation' : 'Diminution'} de ${numVal}${bulkMode === 'percent' ? '%' : ' DT'} appliquée avec succès sur ${affectedAccessories.length} articles !`);
    setTimeout(() => setBulkSuccessMsg(''), 4000);
    setBulkValue('');
  };

  const confirmResetCatalog = () => {
    resetAccessoriesToDefault();
    setResetModalOpen(false);
    setBulkSuccessMsg('Catalogue accessoires réinitialisé aux valeurs d\'origine.');
    setTimeout(() => setBulkSuccessMsg(''), 4000);
  };

  const startEdit = (acc: AccessoryItemDef) => {
    setEditingId(acc.id);
    setEditPrice(String(acc.prix_unitaire_ht));
    setEditStock(acc.stock_qty !== undefined ? String(acc.stock_qty) : '');
  };

  const saveEdit = (id: string) => {
    const val = parseFloat(editPrice);
    if (!isNaN(val) && val >= 0) {
      updateAccessoryPrice(id, val);
    }
    const stockVal = editStock.trim() === '' ? undefined : parseInt(editStock, 10);
    updateAccessoryStock(id, stockVal !== undefined ? stockVal : 0);
    setEditingId(null);
  };

  const getCategoryBadge = (cat: AccessoryItemDef['categorie']) => {
    switch (cat) {
      case 'assemblage':
        return <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-blue-200">Assemblage</span>;
      case 'roulement':
        return <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-emerald-200">Roulement</span>;
      case 'verrouillage':
        return <span className="bg-purple-50 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-purple-200">Verrouillage</span>;
      case 'joints':
        return <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-amber-200">Étanchéité</span>;
      case 'moteurs_volets':
        return <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-indigo-200">Moteurs & Volets</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md">Accessoire</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Box className="w-6 h-6 text-blue-600" />
            <span>Catalogue Accessoires & Quincaillerie</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Gestion des prix unitaires HT de la quincaillerie, joints et motorisations ({accessories.length} articles réels)
          </p>
        </div>

        <button
          onClick={() => setResetModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-900 border border-gray-200 rounded-xl transition shadow-xs cursor-pointer"
          title="Réinitialiser tous les accessoires aux prix officiels par défaut"
        >
          <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
          <span>Restaurer prix d'usine</span>
        </button>
      </div>

      {/* Modern Bulk Price Modification Card */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-blue-50/80 border border-blue-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600/10 text-blue-700 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-950">Mise à jour groupée des accessoires</h3>
              <p className="text-xs text-blue-800/80">Ajustez les prix par catégorie avec simulation avant validation</p>
            </div>
          </div>

          {bulkSuccessMsg && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/90 px-3 py-1 rounded-lg border border-emerald-300">
              ✓ {bulkSuccessMsg}
            </span>
          )}
        </div>

        <form onSubmit={handleOpenSimulation} className="flex flex-wrap items-center gap-3">
          {/* Direction */}
          <div className="flex items-center bg-white rounded-lg p-0.5 border border-blue-300/80 shadow-xs">
            <button
              type="button"
              onClick={() => setBulkDirection('increase')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                bulkDirection === 'increase'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Augmenter (+)</span>
            </button>
            <button
              type="button"
              onClick={() => setBulkDirection('decrease')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                bulkDirection === 'decrease'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Diminuer (-)</span>
            </button>
          </div>

          {/* Mode */}
          <div className="flex items-center bg-white rounded-lg p-0.5 border border-blue-300/80 shadow-xs">
            <button
              type="button"
              onClick={() => setBulkMode('percent')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                bulkMode === 'percent'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              % Pourcentage
            </button>
            <button
              type="button"
              onClick={() => setBulkMode('amount')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                bulkMode === 'amount'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              DT Montant fixe
            </button>
          </div>

          {/* Category Select */}
          <select
            value={bulkCategory}
            onChange={e => setBulkCategory(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">— Toutes les catégories ({accessories.length}) —</option>
            <option value="assemblage">Assemblage & Visserie ({accessories.filter(a => a.categorie === 'assemblage').length})</option>
            <option value="roulement">Roulement & Guidage ({accessories.filter(a => a.categorie === 'roulement').length})</option>
            <option value="verrouillage">Verrouillage & Sécurité ({accessories.filter(a => a.categorie === 'verrouillage').length})</option>
            <option value="joints">Joints & Étanchéité ({accessories.filter(a => a.categorie === 'joints').length})</option>
            <option value="moteurs_volets">Moteurs & Volets ({accessories.filter(a => a.categorie === 'moteurs_volets').length})</option>
          </select>

          {/* Value Input */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gray-700">
              {bulkDirection === 'increase' ? '+' : '-'}
            </span>
            <div className="relative">
              <input
                type="number"
                value={bulkValue}
                onChange={e => setBulkValue(e.target.value)}
                placeholder={bulkMode === 'percent' ? "Ex: 5" : "Ex: 0.500"}
                step="any"
                min="0"
                required
                className="w-24 bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-2.5 top-2 text-gray-400 text-xs font-bold">
                {bulkMode === 'percent' ? '%' : 'DT'}
              </span>
            </div>
          </div>

          {/* Action */}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-5 py-2 rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Simuler & Appliquer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-gray-100 p-1 rounded-xl border border-gray-200/80">
          {categories.map(cat => {
            const count = cat.id === 'all' 
              ? accessories.length 
              : accessories.filter(a => a.categorie === cat.id).length;
            const isSel = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isSel
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isSel ? 'bg-blue-700 text-blue-100' : 'bg-gray-200 text-gray-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher accessoire, joint, moteur..."
            className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
            <tr>
              <th className="px-5 py-3.5">Désignation</th>
              <th className="px-5 py-3.5">Catégorie</th>
              <th className="px-5 py-3.5">Rôle / Description</th>
              <th className="px-4 py-3.5 text-center">Stock</th>
              <th className="px-5 py-3.5 text-center">Unité</th>
              <th className="px-5 py-3.5 text-right font-mono">Prix Unitaire (HT)</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-sans">
            {filtered.map(acc => {
              const inStock = acc.stock_qty !== undefined && acc.stock_qty > 0;
              const stockDefined = acc.stock_qty !== undefined;
              return (
              <tr key={acc.id} className="hover:bg-blue-50/20 transition">
                <td className="px-5 py-3.5 font-bold text-gray-900">
                  {acc.nom}
                </td>
                <td className="px-5 py-3.5">
                  {getCategoryBadge(acc.categorie)}
                </td>
                <td className="px-5 py-3.5 text-gray-600 text-xs">
                  {acc.description || '—'}
                </td>

                {/* Stock Badge */}
                <td className="px-4 py-3.5 text-center">
                  {!stockDefined ? (
                    <span
                      title="Stock non renseigné"
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 border border-gray-200"
                    >
                      <Package className="w-3 h-3" /> —
                    </span>
                  ) : inStock ? (
                    <span
                      title={`En stock : ${acc.stock_qty} unités`}
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
                    >
                      <Package className="w-3 h-3" /> {acc.stock_qty}
                    </span>
                  ) : (
                    <span
                      title="Rupture de stock — À commander"
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200 animate-pulse"
                    >
                      <AlertTriangle className="w-3 h-3" /> Cmd
                    </span>
                  )}
                </td>

                <td className="px-5 py-3.5 text-center text-gray-500 font-medium">
                  {acc.unite}
                </td>
                <td className="px-5 py-3.5 text-right font-mono font-bold text-gray-900">
                  {editingId === acc.id ? (
                    <div className="flex items-center justify-end gap-1">
                      <input 
                        type="number"
                        value={editPrice}
                        onChange={e => setEditPrice(e.target.value)}
                        className="w-24 border border-blue-400 rounded-md px-2 py-1 text-right text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500"
                        step="0.001"
                        autoFocus
                      />
                      <span className="text-gray-400 text-xs">DT</span>
                    </div>
                  ) : (
                    <span>{acc.prix_unitaire_ht.toFixed(3)} DT</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right">
                  {editingId === acc.id ? (
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => saveEdit(acc.id)}
                        className="p-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-md transition cursor-pointer"
                        title="Enregistrer"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setEditingId(null)}
                        className="p-1.5 bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-md transition cursor-pointer"
                        title="Annuler"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => startEdit(acc)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                      title="Modifier prix et stock"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Stock Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold text-gray-900">
                Modifier : {accessories.find(a => a.id === editingId)?.nom}
              </h3>
              <button 
                onClick={() => setEditingId(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Prix Unitaire HT (DT) :</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={e => setEditPrice(e.target.value)}
                  step="0.001"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 mb-1">
                  <Package className="w-3.5 h-3.5 text-gray-500" />
                  <span>Stock ({accessories.find(a => a.id === editingId)?.unite}) :</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editStock}
                    onChange={e => setEditStock(e.target.value)}
                    placeholder="Non défini"
                    min="0"
                    step="1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${
                    editStock === '' ? 'bg-gray-100 text-gray-400'
                    : parseInt(editStock) > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-orange-50 text-orange-600 border border-orange-200'
                  }`}>
                    {editStock === '' ? '—' : parseInt(editStock) > 0 ? 'En stock' : 'À cmd'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => saveEdit(editingId)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulation Preview Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${bulkDirection === 'increase' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>
                  {bulkDirection === 'increase' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Simulation des prix accessoires
                  </h3>
                  <p className="text-xs text-gray-500">
                    Aperçu avant enregistrement dans votre compte
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setPreviewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
              <p>
                <strong className="text-gray-700">Opération :</strong>{' '}
                <span className={`font-bold ${bulkDirection === 'increase' ? 'text-blue-600' : 'text-rose-600'}`}>
                  {bulkDirection === 'increase' ? 'Augmentation (+)' : 'Diminution (-)'} {bulkValue}{bulkMode === 'percent' ? '%' : ' DT'}
                </span>
              </p>
              <p><strong className="text-gray-700">Articles ciblés :</strong> {affectedAccessories.length} accessoires</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold text-gray-700">Exemples d'articles modifiés :</h4>
              <div className="border border-gray-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-gray-100 text-gray-600 font-sans font-semibold sticky top-0">
                    <tr>
                      <th className="px-3 py-2">Désignation</th>
                      <th className="px-3 py-2 text-right">Ancien HT</th>
                      <th className="px-3 py-2 text-right text-blue-700">Nouveau HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans">
                    {previewSamples.map(sample => (
                      <tr key={sample.nom} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-900">{sample.nom}</td>
                        <td className="px-3 py-2 text-right font-mono text-gray-500">{sample.origHt.toFixed(3)} DT</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-blue-700">{sample.newHt.toFixed(3)} DT</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmApplyBulk}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirmer et enregistrer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset to Factory Prices Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2.5 bg-amber-100 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Restaurer prix d'usine ?</h3>
                <p className="text-xs text-gray-500">Remise à zéro des prix accessoires</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Voulez-vous restaurer les prix et stocks par défaut pour tous les <strong>{accessories.length} accessoires</strong> ?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmResetCatalog}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Oui, restaurer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
