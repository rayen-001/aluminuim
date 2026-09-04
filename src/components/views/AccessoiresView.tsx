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
  Sliders,
  DollarSign,
  Package,
  AlertTriangle
} from 'lucide-react';

export const AccessoiresView: React.FC = () => {
  const { accessories, updateAccessoryPrice, updateAccessoryStock } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
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
                  {editingId === acc.id ? (
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={editStock}
                        onChange={e => setEditStock(e.target.value)}
                        placeholder="—"
                        className="w-16 border border-emerald-400 rounded-lg px-2 py-1 text-xs font-mono font-bold text-center bg-emerald-50 focus:outline-hidden"
                      />
                    </div>
                  ) : (
                    !stockDefined ? (
                      <span
                        title="Stock non renseigné"
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 border border-gray-200"
                      >
                        <Package className="w-3 h-3" /> —
                      </span>
                    ) : inStock ? (
                      <span
                        title={`En stock : ${acc.stock_qty}`}
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
                      >
                        <Package className="w-3 h-3" /> {acc.stock_qty}
                      </span>
                    ) : (
                      <span
                        title="Rupture — À commander"
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200 animate-pulse"
                      >
                        <AlertTriangle className="w-3 h-3" /> Cmd
                      </span>
                    )
                  )}
                </td>

                <td className="px-5 py-3.5 text-center text-gray-500 font-mono text-xs">
                  {acc.unite}
                </td>
                <td className="px-5 py-3.5 text-right font-mono font-extrabold text-gray-900 text-sm">
                  {editingId === acc.id ? (
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={editPrice}
                        onChange={e => setEditPrice(e.target.value)}
                        className="w-24 border border-blue-500 rounded-lg px-2 py-1 text-xs font-mono font-bold text-right bg-blue-50 focus:outline-hidden"
                        autoFocus
                      />
                      <span className="text-xs text-gray-500 font-sans">DT</span>
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
                        className="p-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition"
                        title="Enregistrer"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg transition"
                        title="Annuler"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(acc)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
                      title="Modifier le prix"
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
    </div>
  );
};
