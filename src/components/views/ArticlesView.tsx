import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArticleItem } from '../../data/initialArticles';
import { 
  Search, 
  Plus, 
  Minus, 
  Percent, 
  Check, 
  X, 
  RotateCcw, 
  Layers, 
  Package, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Sparkles
} from 'lucide-react';

export const ArticlesView: React.FC = () => {
  const { 
    articles, 
    updateArticlePrice, 
    bulkUpdatePrices, 
    resetArticlesToDefault, 
    settings, 
    updateGlobalTVA, 
    updateArticleStock 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'Toutes' | 'TPR' | 'Aluco' | 'Alu Eco' | 'Garde Corps'>('Toutes');
  const [searchQuery, setSearchQuery] = useState('');
  const [tvaInput, setTvaInput] = useState(String(settings.tva_default));

  // Advanced Bulk update states
  const [bulkFamily, setBulkFamily] = useState<string>('Toutes');
  const [bulkColor, setBulkColor] = useState<string>('Toutes');
  const [bulkDirection, setBulkDirection] = useState<'increase' | 'decrease'>('increase');
  const [bulkMode, setBulkMode] = useState<'percent' | 'amount'>('percent');
  const [bulkValue, setBulkValue] = useState<string>('');
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string>('');

  // Modals
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleItem | null>(null);
  const [editPrices, setEditPrices] = useState<Record<string, number>>({});
  const [editStockQty, setEditStockQty] = useState<string>('');

  // Family tabs with counts
  const familyTabs = [
    { id: 'Toutes', label: 'Toutes', count: articles.length },
    { id: 'TPR', label: 'TPR', count: articles.filter(a => a.family === 'TPR').length },
    { id: 'Aluco', label: 'Aluco', count: articles.filter(a => a.family === 'Aluco').length },
    { id: 'Alu Eco', label: 'Alu Eco', count: articles.filter(a => a.family === 'Alu Eco').length },
    { id: 'Garde Corps', label: 'Garde Corps', count: articles.filter(a => a.family === 'Garde Corps').length },
  ] as const;

  // Filter articles
  const filteredArticles = articles.filter(a => {
    if (activeTab !== 'Toutes' && a.family !== activeTab) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return a.reference.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleApplyTVA = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tvaInput) || 0;
    updateGlobalTVA(val);
  };

  // Open simulation preview
  const handleOpenSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(bulkValue);
    if (isNaN(val) || val <= 0) return;
    setPreviewModalOpen(true);
  };

  // Compute simulation data
  const affectedArticles = articles.filter(a => bulkFamily === 'Toutes' || a.family === bulkFamily);
  const colorsToSimulate = (bulkColor === 'Toutes') 
    ? ['blanc', 'gris', 'noir', 'couleur_mat', 'couleur_givre'] 
    : [bulkColor];

  const colorLabels: Record<string, string> = {
    blanc: 'Blanc',
    gris: 'Gris',
    noir: 'Noir',
    couleur_mat: 'Mat',
    couleur_givre: 'Givré'
  };

  const previewSamples = affectedArticles.slice(0, 4).map(art => {
    const colorPreviews = colorsToSimulate.map(c => {
      const origHt = art.prix[c]?.ht || 0;
      const numVal = parseFloat(bulkValue) || 0;
      let newHt = origHt;
      if (bulkMode === 'amount') {
        newHt = bulkDirection === 'decrease' ? Math.max(0, origHt - numVal) : origHt + numVal;
      } else {
        const factor = bulkDirection === 'decrease' ? (1 - numVal / 100) : (1 + numVal / 100);
        newHt = Math.max(0, origHt * factor);
      }
      newHt = Math.round(newHt * 1000) / 1000;
      const origTtc = Math.round(origHt * (1 + settings.tva_default / 100) * 1000) / 1000;
      const newTtc = Math.round(newHt * (1 + settings.tva_default / 100) * 1000) / 1000;
      return {
        colorKey: c,
        colorName: colorLabels[c] || c,
        origHt,
        origTtc,
        newHt,
        newTtc,
        diff: Math.round((newHt - origHt) * 1000) / 1000
      };
    });
    return {
      reference: art.reference,
      description: art.description,
      family: art.family,
      colorPreviews
    };
  });

  const confirmApplyBulk = () => {
    const numVal = parseFloat(bulkValue);
    if (isNaN(numVal) || numVal <= 0) return;
    bulkUpdatePrices(bulkFamily, bulkColor, numVal, bulkMode, bulkDirection);
    setPreviewModalOpen(false);
    setBulkSuccessMsg(`${bulkDirection === 'increase' ? 'Augmentation' : 'Diminution'} de ${numVal}${bulkMode === 'percent' ? '%' : ' DT'} appliquée avec succès sur ${affectedArticles.length} profilés !`);
    setTimeout(() => setBulkSuccessMsg(''), 4000);
    setBulkValue('');
  };

  const confirmResetCatalog = () => {
    resetArticlesToDefault();
    setResetModalOpen(false);
    setBulkSuccessMsg('Prix et stocks réinitialisés aux valeurs catalogue par défaut.');
    setTimeout(() => setBulkSuccessMsg(''), 4000);
  };

  const startEdit = (art: ArticleItem) => {
    setEditingArticle(art);
    setEditPrices({
      blanc: art.prix.blanc?.ht || 0,
      gris: art.prix.gris?.ht || 0,
      noir: art.prix.noir?.ht || 0,
      couleur_mat: art.prix.couleur_mat?.ht || 0,
      couleur_givre: art.prix.couleur_givre?.ht || 0
    });
    setEditStockQty(art.stock_qty !== undefined ? String(art.stock_qty) : '');
  };

  const saveEdit = () => {
    if (!editingArticle) return;
    const tva = settings.tva_default;
    ['blanc', 'gris', 'noir', 'couleur_mat', 'couleur_givre'].forEach(c => {
      const ht = editPrices[c] || 0;
      const ttc = Math.round(ht * (1 + tva / 100) * 1000) / 1000;
      updateArticlePrice(editingArticle.id, c, ht, ttc);
    });
    const stockVal = editStockQty.trim() === '' ? undefined : parseInt(editStockQty, 10);
    updateArticleStock(editingArticle.id, stockVal !== undefined ? stockVal : 0);
    setEditingArticle(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600" />
            <span>Articles & Profilés Aluminium</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Gestion personnalisée des prix et profilés aluminium ({articles.length} références disponibles)
          </p>
        </div>

        <button
          onClick={() => setResetModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-900 border border-gray-200 rounded-xl transition shadow-xs cursor-pointer"
          title="Réinitialiser tous les profilés aux prix officiels par défaut"
        >
          <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
          <span>Restaurer prix d'usine</span>
        </button>
      </div>

      {/* Top Banner: Taux TVA */}
      <div className="bg-blue-50 border border-blue-200/90 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleApplyTVA} className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-semibold text-gray-800">Taux TVA global :</label>
          <div className="relative">
            <input
              type="number"
              value={tvaInput}
              onChange={e => setTvaInput(e.target.value)}
              step="0.1"
              min="0"
              className="w-20 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-2 text-gray-400 text-sm">%</span>
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-xs cursor-pointer"
          >
            Mettre à jour TVA
          </button>
          <span className="text-xs text-blue-700 font-medium">
            Prix TTC = Prix HT × (1 + TVA/100)
          </span>
        </form>
      </div>

      {/* Modern Bulk Price Modification Card */}
      <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-amber-50/90 border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/10 text-amber-700 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950">Mise à jour des prix en masse</h3>
              <p className="text-xs text-amber-800/80">Ajustez les prix par famille et couleur avec simulation préalable</p>
            </div>
          </div>

          {bulkSuccessMsg && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/90 px-3 py-1 rounded-lg border border-emerald-300">
              ✓ {bulkSuccessMsg}
            </span>
          )}
        </div>

        <form onSubmit={handleOpenSimulation} className="flex flex-wrap items-center gap-3">
          {/* Direction: Augmentation / Diminution */}
          <div className="flex items-center bg-white rounded-lg p-0.5 border border-amber-300/80 shadow-xs">
            <button
              type="button"
              onClick={() => setBulkDirection('increase')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                bulkDirection === 'increase'
                  ? 'bg-amber-500 text-white shadow-xs'
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

          {/* Mode: % or DT */}
          <div className="flex items-center bg-white rounded-lg p-0.5 border border-amber-300/80 shadow-xs">
            <button
              type="button"
              onClick={() => setBulkMode('percent')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                bulkMode === 'percent'
                  ? 'bg-blue-600 text-white shadow-xs'
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
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              DT Montant fixe
            </button>
          </div>

          {/* Family Select */}
          <select
            value={bulkFamily}
            onChange={e => setBulkFamily(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="Toutes">— Toutes les familles ({articles.length}) —</option>
            <option value="TPR">TPR ({articles.filter(a => a.family === 'TPR').length})</option>
            <option value="Aluco">Aluco ({articles.filter(a => a.family === 'Aluco').length})</option>
            <option value="Alu Eco">Alu Eco ({articles.filter(a => a.family === 'Alu Eco').length})</option>
            <option value="Garde Corps">Garde Corps ({articles.filter(a => a.family === 'Garde Corps').length})</option>
          </select>

          {/* Color Select */}
          <select
            value={bulkColor}
            onChange={e => setBulkColor(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="Toutes">— Toutes les 5 couleurs —</option>
            <option value="blanc">Blanc</option>
            <option value="gris">Gris</option>
            <option value="noir">Noir</option>
            <option value="couleur_mat">Mat</option>
            <option value="couleur_givre">Givré</option>
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
                placeholder={bulkMode === 'percent' ? "Ex: 5" : "Ex: 2.500"}
                step="any"
                min="0"
                required
                className="w-24 bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-mono font-bold focus:ring-2 focus:ring-amber-500"
              />
              <span className="absolute right-2.5 top-2 text-gray-400 text-xs font-bold">
                {bulkMode === 'percent' ? '%' : 'DT'}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold px-5 py-2 rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Simuler & Appliquer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Tabs Filter (All 5 families with dynamic badges) & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl border border-gray-200/80 overflow-x-auto">
          {familyTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher référence ou description..."
            className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-800">
              Barres aluminium — {activeTab}
            </h3>
          </div>
          <span className="text-xs text-gray-500 font-medium">
            {filteredArticles.length} référence(s) — prix en DT/barre, TTC en bleu
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
              <tr>
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3 min-w-[200px]">Description</th>
                <th className="px-3 py-3 text-center">Stock</th>
                <th className="px-3 py-3 text-right">Blanc</th>
                <th className="px-3 py-3 text-right">Gris</th>
                <th className="px-3 py-3 text-right">Noir</th>
                <th className="px-3 py-3 text-right">Mat</th>
                <th className="px-3 py-3 text-right">Givré</th>
                <th className="px-3 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400 font-sans text-sm">
                    Aucune référence trouvée pour cette recherche
                  </td>
                </tr>
              ) : (
                filteredArticles.map(art => {
                  const inStock = art.stock_qty !== undefined && art.stock_qty > 0;
                  const stockDefined = art.stock_qty !== undefined;
                  return (
                    <tr key={art.id} className="hover:bg-blue-50/40 transition">
                      <td className="px-4 py-3 font-bold text-gray-900">{art.reference}</td>
                      <td className="px-4 py-3 font-sans font-medium text-gray-700">{art.description}</td>

                      {/* Stock Badge */}
                      <td className="px-3 py-3 text-center">
                        {!stockDefined ? (
                          <span
                            title="Stock non renseigné"
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 border border-gray-200"
                          >
                            <Package className="w-3 h-3" /> —
                          </span>
                        ) : inStock ? (
                          <span
                            title={`En stock : ${art.stock_qty} barres`}
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
                          >
                            <Package className="w-3 h-3" /> {art.stock_qty}
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
                      
                      {/* Blanc */}
                      <td className="px-3 py-3 text-right">
                        <div className="font-bold text-gray-900">{(art.prix.blanc?.ht || 0).toFixed(3)}</div>
                        <div className="text-[10px] text-blue-600 font-semibold">{(art.prix.blanc?.ttc || 0).toFixed(3)}</div>
                      </td>

                      {/* Gris */}
                      <td className="px-3 py-3 text-right">
                        <div className="font-bold text-gray-900">{(art.prix.gris?.ht || 0).toFixed(3)}</div>
                        <div className="text-[10px] text-blue-600 font-semibold">{(art.prix.gris?.ttc || 0).toFixed(3)}</div>
                      </td>

                      {/* Noir */}
                      <td className="px-3 py-3 text-right">
                        <div className="font-bold text-gray-900">{(art.prix.noir?.ht || 0).toFixed(3)}</div>
                        <div className="text-[10px] text-blue-600 font-semibold">{(art.prix.noir?.ttc || 0).toFixed(3)}</div>
                      </td>

                      {/* Mat */}
                      <td className="px-3 py-3 text-right">
                        <div className="font-bold text-gray-900">{(art.prix.couleur_mat?.ht || 0).toFixed(3)}</div>
                        <div className="text-[10px] text-blue-600 font-semibold">{(art.prix.couleur_mat?.ttc || 0).toFixed(3)}</div>
                      </td>

                      {/* Givré */}
                      <td className="px-3 py-3 text-right">
                        <div className="font-bold text-gray-900">{(art.prix.couleur_givre?.ht || 0).toFixed(3)}</div>
                        <div className="text-[10px] text-blue-600 font-semibold">{(art.prix.couleur_givre?.ttc || 0).toFixed(3)}</div>
                      </td>

                      {/* Action */}
                      <td className="px-3 py-3 text-center font-sans">
                        <button
                          onClick={() => startEdit(art)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          Modifier
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulation & Preview Confirmation Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${bulkDirection === 'increase' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                  {bulkDirection === 'increase' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Confirmation de la simulation des prix
                  </h3>
                  <p className="text-xs text-gray-500">
                    Vérifiez les calculs avant d'enregistrer dans votre compte
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

            {/* Summary Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="text-gray-500 block">Opération :</span>
                  <span className={`font-bold ${bulkDirection === 'increase' ? 'text-amber-600' : 'text-rose-600'}`}>
                    {bulkDirection === 'increase' ? 'Augmentation (+)' : 'Diminution (-)'} {bulkValue}{bulkMode === 'percent' ? '%' : ' DT'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Famille ciblée :</span>
                  <span className="font-bold text-gray-800">{bulkFamily}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Couleur ciblée :</span>
                  <span className="font-bold text-gray-800">
                    {bulkColor === 'Toutes' ? 'Toutes les 5 couleurs' : (colorLabels[bulkColor] || bulkColor)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Profilés affectés :</span>
                  <span className="font-bold text-blue-600">{affectedArticles.length} articles</span>
                </div>
              </div>
            </div>

            {/* Live Sample Previews */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-700">Aperçu direct sur quelques exemples :</h4>
              <div className="border border-gray-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-gray-100 text-gray-600 font-sans font-semibold sticky top-0">
                    <tr>
                      <th className="px-3 py-2">Réf & Famille</th>
                      <th className="px-2 py-2">Couleur</th>
                      <th className="px-3 py-2 text-right">Ancien HT</th>
                      <th className="px-3 py-2 text-right text-blue-600">Nouveau HT</th>
                      <th className="px-3 py-2 text-right text-emerald-600">Nouveau TTC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans">
                    {previewSamples.map(sample => (
                      sample.colorPreviews.map((cp, idx) => (
                        <tr key={`${sample.reference}-${cp.colorKey}`} className="hover:bg-gray-50">
                          {idx === 0 ? (
                            <td rowSpan={sample.colorPreviews.length} className="px-3 py-2 font-bold text-gray-900 border-r border-gray-100 align-top">
                              {sample.reference}
                              <span className="block text-[10px] text-gray-500 font-normal">{sample.family}</span>
                            </td>
                          ) : null}
                          <td className="px-2 py-2 text-gray-700 font-medium">{cp.colorName}</td>
                          <td className="px-3 py-2 text-right font-mono text-gray-500">{cp.origHt.toFixed(3)} DT</td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-blue-700">{cp.newHt.toFixed(3)} DT</td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-emerald-700">{cp.newTtc.toFixed(3)} DT</td>
                        </tr>
                      ))
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
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
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
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
                <h3 className="text-base font-bold text-gray-900">Restaurer les prix d'usine ?</h3>
                <p className="text-xs text-gray-500">Remise à zéro des prix et stocks</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Voulez-vous restaurer les prix officiels par défaut pour tous les <strong>{articles.length} profilés aluminium</strong> ? Toutes vos modifications manuelles sur les prix et le stock seront réinitialisées aux valeurs constructeur.
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

      {/* Edit Single Article Modal */}
      {editingArticle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Modifier les prix : {editingArticle.reference}</h3>
                <p className="text-xs text-gray-500">{editingArticle.description}</p>
              </div>
              <button 
                onClick={() => setEditingArticle(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { key: 'blanc', label: 'Blanc (Laqué)' },
                { key: 'gris', label: 'Gris (Laqué)' },
                { key: 'noir', label: 'Noir 9005' },
                { key: 'couleur_mat', label: 'Couleur Mat' },
                { key: 'couleur_givre', label: 'Couleur Givré' }
              ].map(c => {
                const ht = editPrices[c.key] || 0;
                const ttc = Math.round(ht * (1 + settings.tva_default / 100) * 1000) / 1000;
                return (
                  <div key={c.key} className="grid grid-cols-2 items-center gap-3">
                    <label className="text-xs font-medium text-gray-700">{c.label} (HT) :</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editPrices[c.key] || ''}
                        onChange={e => setEditPrices({ ...editPrices, [c.key]: parseFloat(e.target.value) || 0 })}
                        step="0.001"
                        min="0"
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-[11px] text-blue-600 font-mono shrink-0">
                        {ttc.toFixed(3)} TTC
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Stock Qty */}
              <div className="border-t border-gray-100 pt-3">
                <div className="grid grid-cols-2 items-center gap-3">
                  <label className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-gray-500" />
                    Stock (barres) :
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editStockQty}
                      onChange={e => setEditStockQty(e.target.value)}
                      placeholder="Non défini"
                      min="0"
                      step="1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      editStockQty === '' ? 'bg-gray-100 text-gray-400'
                      : parseInt(editStockQty) > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-orange-50 text-orange-600 border border-orange-200'
                    }`}>
                      {editStockQty === '' ? '—' : parseInt(editStockQty) > 0 ? 'En stock' : 'À cmd'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEditingArticle(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
