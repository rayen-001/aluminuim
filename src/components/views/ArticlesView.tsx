import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArticleItem } from '../../data/initialArticles';
import { Search, Plus, Edit2, Percent, Check, X, RefreshCw, Layers, Package, AlertTriangle } from 'lucide-react';

export const ArticlesView: React.FC = () => {
  const { articles, updateArticlePrice, bulkUpdatePrices, settings, updateGlobalTVA, updateArticleStock } = useApp();

  const [activeTab, setActiveTab] = useState<'Toutes' | 'TPR' | 'Aluco' | 'Alu Eco'>('Toutes');
  const [searchQuery, setSearchQuery] = useState('');
  const [tvaInput, setTvaInput] = useState(String(settings.tva_default));

  // Bulk update states
  const [bulkFamily, setBulkFamily] = useState('Toutes');
  const [bulkColor, setBulkColor] = useState('Toutes');
  const [bulkPercent, setBulkPercent] = useState('');
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState('');

  // Edit single article modal
  const [editingArticle, setEditingArticle] = useState<ArticleItem | null>(null);
  const [editPrices, setEditPrices] = useState<Record<string, number>>({});
  const [editStockQty, setEditStockQty] = useState<string>('');

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

  const handleApplyBulk = (e: React.FormEvent) => {
    e.preventDefault();
    const pct = parseFloat(bulkPercent);
    if (isNaN(pct) || pct === 0) return;
    bulkUpdatePrices(bulkFamily, bulkColor, pct);
    setBulkSuccessMsg(`Augmentation de ${pct}% appliquée avec succès !`);
    setTimeout(() => setBulkSuccessMsg(''), 3000);
    setBulkPercent('');
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
    // Save stock
    const stockVal = editStockQty.trim() === '' ? undefined : parseInt(editStockQty, 10);
    updateArticleStock(editingArticle.id, stockVal !== undefined ? stockVal : 0);
    setEditingArticle(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Articles & Catalogue</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Gestion des prix et profilés aluminium ({articles.length} références disponibles)
          </p>
        </div>
      </div>

      {/* Top Banner: Taux TVA */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleApplyTVA} className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-semibold text-gray-800">Taux TVA :</label>
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
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-xs"
          >
            Mettre à jour
          </button>
          <span className="text-xs text-blue-700 font-medium">
            Prix TTC = Prix HT × (1 + TVA/100)
          </span>
        </form>
      </div>

      {/* Box: Augmenter prix barres par couleur */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5">
        <h3 className="text-sm font-bold text-amber-950 mb-3">Augmenter prix barres par couleur :</h3>
        <form onSubmit={handleApplyBulk} className="flex flex-wrap items-center gap-3">
          <select
            value={bulkFamily}
            onChange={e => setBulkFamily(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500"
          >
            <option value="Toutes">— Toutes les familles —</option>
            <option value="TPR">TPR</option>
            <option value="Aluco">Aluco</option>
            <option value="Alu Eco">Alu Eco</option>
            <option value="Garde Corps">Garde Corps</option>
          </select>

          <select
            value={bulkColor}
            onChange={e => setBulkColor(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500"
          >
            <option value="Toutes">— Toutes les couleurs —</option>
            <option value="blanc">Blanc</option>
            <option value="gris">Gris</option>
            <option value="noir">Noir</option>
            <option value="couleur_mat">Mat</option>
            <option value="couleur_givre">Givré</option>
          </select>

          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-gray-700">+</span>
            <div className="relative">
              <input
                type="number"
                value={bulkPercent}
                onChange={e => setBulkPercent(e.target.value)}
                placeholder="0"
                step="0.1"
                className="w-20 bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-amber-500"
              />
              <span className="absolute right-2.5 top-2 text-gray-400 text-xs sm:text-sm">%</span>
            </div>
          </div>

          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-semibold px-5 py-2 rounded-lg transition shadow-xs"
          >
            Appliquer
          </button>

          {bulkSuccessMsg && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              {bulkSuccessMsg}
            </span>
          )}
        </form>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl border border-gray-200/80">
          {(['Toutes', 'TPR', 'Aluco', 'Alu Eco'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              {tab}
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

      {/* Articles Table (Matching 100% reference image) */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-800">Barres aluminium</h3>
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
                  <td colSpan={8} className="py-12 text-center text-gray-400 font-sans text-sm">
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
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
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

      {/* Edit Article Modal */}
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
                className="text-gray-400 hover:text-gray-600 p-1"
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
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
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
