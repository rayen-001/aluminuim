import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArticleItem } from '../../data/initialArticles';
import { REMPLISSAGES, MOTIFS } from '../../data/productCatalog';
import { getStoreElementPrice, StoreColorPrices } from '../../utils/devisCalculator';
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
  Sparkles,
  Edit3,
  Sliders,
  ShieldCheck,
  Eye,
  Info,
  SlidersHorizontal
} from 'lucide-react';

export const ArticlesView: React.FC = () => {
  const { 
    articles, 
    updateArticlePrice, 
    bulkUpdatePrices, 
    resetArticlesToDefault, 
    settings, 
    updateGlobalTVA, 
    updateArticleStock,
    updateM2Price,
    bulkUpdateM2Prices,
    resetM2PricesToDefault
  } = useApp();

  const [activeTab, setActiveTab] = useState<'Toutes' | 'TPR' | 'Aluco' | 'Alu Eco' | 'Garde Corps' | 'm2_surfaces'>('Toutes');
  const [searchQuery, setSearchQuery] = useState('');
  const [tvaInput, setTvaInput] = useState(String(settings.tva_default));

  // Advanced Bulk update states for aluminium profile bars
  const [bulkFamily, setBulkFamily] = useState<string>('Toutes');
  const [bulkColor, setBulkColor] = useState<string>('Toutes');
  const [bulkDirection, setBulkDirection] = useState<'increase' | 'decrease'>('increase');
  const [bulkMode, setBulkMode] = useState<'percent' | 'amount'>('percent');
  const [bulkValue, setBulkValue] = useState<string>('');
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string>('');

  // Bulk update states for M² surfaces (Stores, Moustiquaires, Vitrages)
  const [bulkM2Category, setBulkM2Category] = useState<'all' | 'stores' | 'moustiquaires' | 'vitrages' | 'motifs'>('all');
  const [bulkM2Direction, setBulkM2Direction] = useState<'increase' | 'decrease'>('increase');
  const [bulkM2Mode, setBulkM2Mode] = useState<'percent' | 'amount'>('percent');
  const [bulkM2Value, setBulkM2Value] = useState<string>('');

  // Modals for aluminium profile bars
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleItem | null>(null);
  const [editPrices, setEditPrices] = useState<Record<string, number>>({});
  const [editStockQty, setEditStockQty] = useState<string>('');

  // Modals for M² prices
  const [resetM2ModalOpen, setResetM2ModalOpen] = useState(false);
  const [editingM2Item, setEditingM2Item] = useState<{
    category: 'stores' | 'moustiquaires' | 'vitrages' | 'motifs';
    key: string;
    label: string;
    description?: string;
    unit: string;
    currentHt: number;
    hasColors?: boolean;
  } | null>(null);
  const [editM2Input, setEditM2Input] = useState<string>('');
  const [editingStoreColors, setEditingStoreColors] = useState<Record<string, number>>({
    blanc: 0,
    gris: 0,
    noir: 0,
    effet_bois: 0,
    bronze: 0
  });

  // Family tabs with counts
  const familyTabs = [
    { id: 'Toutes', label: 'Toutes les barres', count: articles.length },
    { id: 'TPR', label: 'TPR', count: articles.filter(a => a.family === 'TPR').length },
    { id: 'Aluco', label: 'Aluco', count: articles.filter(a => a.family === 'Aluco').length },
    { id: 'Alu Eco', label: 'Alu Eco', count: articles.filter(a => a.family === 'Alu Eco').length },
    { id: 'Garde Corps', label: 'Garde Corps', count: articles.filter(a => a.family === 'Garde Corps').length },
    { id: 'm2_surfaces', label: '🪟 Stores, Moustiquaires & Vitrages (m²)', count: 33 },
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

  // Open simulation preview for bars
  const handleOpenSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(bulkValue);
    if (isNaN(val) || val <= 0) return;
    setPreviewModalOpen(true);
  };

  // Compute simulation data for bars
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
    setBulkSuccessMsg('Prix et stocks des profilés réinitialisés aux valeurs catalogue.');
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

  // M2 Handlers
  const startEditM2 = (
    category: 'stores' | 'moustiquaires' | 'vitrages' | 'motifs',
    key: string,
    label: string,
    currentHt: number,
    unit: string,
    description?: string,
    hasColors: boolean = false,
    colorPrices?: { blanc: number; gris: number; noir: number; effet_bois: number; bronze: number }
  ) => {
    setEditingM2Item({
      category,
      key,
      label,
      description,
      unit,
      currentHt,
      hasColors
    });
    if (hasColors && colorPrices) {
      setEditingStoreColors({
        blanc: colorPrices.blanc,
        gris: colorPrices.gris,
        noir: colorPrices.noir,
        effet_bois: colorPrices.effet_bois,
        bronze: colorPrices.bronze
      });
    } else {
      setEditM2Input(String(currentHt));
    }
  };

  const saveM2Edit = () => {
    if (!editingM2Item) return;
    if (editingM2Item.hasColors) {
      updateM2Price(editingM2Item.category, editingM2Item.key, editingStoreColors);
      setBulkSuccessMsg(`Prix multi-couleurs de "${editingM2Item.label}" mis à jour avec succès !`);
    } else {
      const newHt = parseFloat(editM2Input);
      if (isNaN(newHt) || newHt < 0) return;
      updateM2Price(editingM2Item.category, editingM2Item.key, newHt);
      setBulkSuccessMsg(`Prix de "${editingM2Item.label}" mis à jour (${newHt.toFixed(3)} DT HT) !`);
    }
    setTimeout(() => setBulkSuccessMsg(''), 4000);
    setEditingM2Item(null);
  };

  const handleApplyBulkM2 = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(bulkM2Value);
    if (isNaN(val) || val <= 0) return;
    bulkUpdateM2Prices(bulkM2Category, val, bulkM2Mode, bulkM2Direction);
    setBulkSuccessMsg(`${bulkM2Direction === 'increase' ? 'Augmentation' : 'Diminution'} de ${val}${bulkM2Mode === 'percent' ? '%' : ' DT'} appliquée avec succès sur les surfaces !`);
    setTimeout(() => setBulkSuccessMsg(''), 4000);
    setBulkM2Value('');
  };

  const confirmResetM2 = () => {
    resetM2PricesToDefault();
    setResetM2ModalOpen(false);
    setBulkSuccessMsg('Prix des vitrages, stores et moustiquaires réinitialisés aux valeurs standards.');
    setTimeout(() => setBulkSuccessMsg(''), 4000);
  };

  // Stores data definition with 5 standard aluminium colors
  const storeItems = [
    {
      key: 'lame_inj_55',
      label: 'Lame injectée 55mm (Standard)',
      description: 'Lame aluminium injectée mousse polyuréthane haute densité 55mm — Standard fenêtres & portes',
      unit: 'm²',
      hasColors: true,
      defaultPrices: { blanc: 105, gris: 115, noir: 118, effet_bois: 135, bronze: 115 },
      prices: {
        blanc: getStoreElementPrice(settings.m2_prices?.stores?.lame_inj_55, 'blanc', 105),
        gris: getStoreElementPrice(settings.m2_prices?.stores?.lame_inj_55, 'gris', 115),
        noir: getStoreElementPrice(settings.m2_prices?.stores?.lame_inj_55, 'noir', 118),
        effet_bois: getStoreElementPrice(settings.m2_prices?.stores?.lame_inj_55, 'effet_bois', 135),
        bronze: getStoreElementPrice(settings.m2_prices?.stores?.lame_inj_55, 'bronze', 115)
      }
    },
    {
      key: 'lame_inj_45',
      label: 'Lame injectée 45mm',
      description: 'Lame aluminium injectée 45mm profil compact',
      unit: 'm²',
      hasColors: true,
      defaultPrices: { blanc: 95, gris: 105, noir: 108, effet_bois: 125, bronze: 105 },
      prices: {
        blanc: getStoreElementPrice(settings.m2_prices?.stores?.lame_inj_45, 'blanc', 95),
        gris: getStoreElementPrice(settings.m2_prices?.stores?.lame_inj_45, 'gris', 105),
        noir: getStoreElementPrice(settings.m2_prices?.stores?.lame_inj_45, 'noir', 108),
        effet_bois: getStoreElementPrice(settings.m2_prices?.stores?.lame_inj_45, 'effet_bois', 125),
        bronze: getStoreElementPrice(settings.m2_prices?.stores?.lame_inj_45, 'bronze', 105)
      }
    },
    {
      key: 'lame_inj_42',
      label: 'Lame injectée 42mm',
      description: 'Lame aluminium injectée 42mm économique pour petites fenêtres',
      unit: 'm²',
      hasColors: true,
      defaultPrices: { blanc: 90, gris: 99, noir: 102, effet_bois: 118, bronze: 99 },
      prices: {
        blanc: getStoreElementPrice(settings.m2_prices?.stores?.lame_inj_42, 'blanc', 90),
        gris: getStoreElementPrice(settings.m2_prices?.stores?.lame_inj_42, 'gris', 99),
        noir: getStoreElementPrice(settings.m2_prices?.stores?.lame_inj_42, 'noir', 102),
        effet_bois: getStoreElementPrice(settings.m2_prices?.stores?.lame_inj_42, 'effet_bois', 118),
        bronze: getStoreElementPrice(settings.m2_prices?.stores?.lame_inj_42, 'bronze', 99)
      }
    },
    {
      key: 'lame_extrud',
      label: 'Lame extrudée renforcée',
      description: 'Lame aluminium extrudé massif haute sécurité anti-effraction',
      unit: 'm²',
      hasColors: true,
      defaultPrices: { blanc: 145, gris: 160, noir: 165, effet_bois: 190, bronze: 160 },
      prices: {
        blanc: getStoreElementPrice(settings.m2_prices?.stores?.lame_extrud, 'blanc', 145),
        gris: getStoreElementPrice(settings.m2_prices?.stores?.lame_extrud, 'gris', 160),
        noir: getStoreElementPrice(settings.m2_prices?.stores?.lame_extrud, 'noir', 165),
        effet_bois: getStoreElementPrice(settings.m2_prices?.stores?.lame_extrud, 'effet_bois', 190),
        bronze: getStoreElementPrice(settings.m2_prices?.stores?.lame_extrud, 'bronze', 160)
      }
    },
    {
      key: 'coffre_alu_15',
      label: 'Coffre aluminium 15 cm (DT/ml)',
      description: 'Caisson coffre aluminium pan coupé 15 cm pour fenêtres standards (par ml)',
      unit: 'ml',
      hasColors: true,
      defaultPrices: { blanc: 45, gris: 50, noir: 52, effet_bois: 62, bronze: 50 },
      prices: {
        blanc: getStoreElementPrice(settings.m2_prices?.stores?.coffre_alu_15, 'blanc', 45),
        gris: getStoreElementPrice(settings.m2_prices?.stores?.coffre_alu_15, 'gris', 50),
        noir: getStoreElementPrice(settings.m2_prices?.stores?.coffre_alu_15, 'noir', 52),
        effet_bois: getStoreElementPrice(settings.m2_prices?.stores?.coffre_alu_15, 'effet_bois', 62),
        bronze: getStoreElementPrice(settings.m2_prices?.stores?.coffre_alu_15, 'bronze', 50)
      }
    },
    {
      key: 'coffre_alu_20',
      label: 'Coffre aluminium 20 cm (DT/ml)',
      description: 'Caisson coffre aluminium pan coupé 20 cm pour portes-fenêtres & baies (par ml)',
      unit: 'ml',
      hasColors: true,
      defaultPrices: { blanc: 55, gris: 61, noir: 63, effet_bois: 75, bronze: 61 },
      prices: {
        blanc: getStoreElementPrice(settings.m2_prices?.stores?.coffre_alu_20, 'blanc', 55),
        gris: getStoreElementPrice(settings.m2_prices?.stores?.coffre_alu_20, 'gris', 61),
        noir: getStoreElementPrice(settings.m2_prices?.stores?.coffre_alu_20, 'noir', 63),
        effet_bois: getStoreElementPrice(settings.m2_prices?.stores?.coffre_alu_20, 'effet_bois', 75),
        bronze: getStoreElementPrice(settings.m2_prices?.stores?.coffre_alu_20, 'bronze', 61)
      }
    },
    {
      key: 'coffre_alu_25',
      label: 'Coffre aluminium 25 cm (DT/ml)',
      description: 'Caisson coffre aluminium grande capacité 25 cm pour baies vitrées hautes (par ml)',
      unit: 'ml',
      hasColors: true,
      defaultPrices: { blanc: 65, gris: 72, noir: 75, effet_bois: 88, bronze: 72 },
      prices: {
        blanc: getStoreElementPrice(settings.m2_prices?.stores?.coffre_alu_25, 'blanc', 65),
        gris: getStoreElementPrice(settings.m2_prices?.stores?.coffre_alu_25, 'gris', 72),
        noir: getStoreElementPrice(settings.m2_prices?.stores?.coffre_alu_25, 'noir', 75),
        effet_bois: getStoreElementPrice(settings.m2_prices?.stores?.coffre_alu_25, 'effet_bois', 88),
        bronze: getStoreElementPrice(settings.m2_prices?.stores?.coffre_alu_25, 'bronze', 72)
      }
    },
    {
      key: 'coffre_pvc',
      label: 'Coffre PVC Monobloc (DT/ml)',
      description: 'Caisson coffre PVC monobloc isolé thermo-acoustique pour pose sur dormant (par ml)',
      unit: 'ml',
      hasColors: true,
      defaultPrices: { blanc: 50, gris: 55, noir: 56, effet_bois: 68, bronze: 55 },
      prices: {
        blanc: getStoreElementPrice(settings.m2_prices?.stores?.coffre_pvc, 'blanc', 50),
        gris: getStoreElementPrice(settings.m2_prices?.stores?.coffre_pvc, 'gris', 55),
        noir: getStoreElementPrice(settings.m2_prices?.stores?.coffre_pvc, 'noir', 56),
        effet_bois: getStoreElementPrice(settings.m2_prices?.stores?.coffre_pvc, 'effet_bois', 68),
        bronze: getStoreElementPrice(settings.m2_prices?.stores?.coffre_pvc, 'bronze', 55)
      }
    },
    {
      key: 'coulisse_ml',
      label: 'Coulisses / Glissières alu (DT/ml)',
      description: 'Barres de glissières latérales verticales en aluminium avec joint brosse feutrine anti-bruit (par ml)',
      unit: 'ml',
      hasColors: true,
      defaultPrices: { blanc: 18, gris: 20, noir: 21, effet_bois: 25, bronze: 20 },
      prices: {
        blanc: getStoreElementPrice(settings.m2_prices?.stores?.coulisse_ml, 'blanc', 18),
        gris: getStoreElementPrice(settings.m2_prices?.stores?.coulisse_ml, 'gris', 20),
        noir: getStoreElementPrice(settings.m2_prices?.stores?.coulisse_ml, 'noir', 21),
        effet_bois: getStoreElementPrice(settings.m2_prices?.stores?.coulisse_ml, 'effet_bois', 25),
        bronze: getStoreElementPrice(settings.m2_prices?.stores?.coulisse_ml, 'bronze', 20)
      }
    },
    {
      key: 'axe_ml',
      label: 'Axe tubulaire octogonal (DT/ml)',
      description: 'Tube octogonal acier d\'enroulement avec embouts, roulements et attaches de tablier (par ml)',
      unit: 'ml',
      hasColors: false,
      defaultPrices: 15,
      prices: {
        blanc: typeof settings.m2_prices?.stores?.axe_ml === 'number' ? settings.m2_prices.stores.axe_ml : 15,
        gris: typeof settings.m2_prices?.stores?.axe_ml === 'number' ? settings.m2_prices.stores.axe_ml : 15,
        noir: typeof settings.m2_prices?.stores?.axe_ml === 'number' ? settings.m2_prices.stores.axe_ml : 15,
        effet_bois: typeof settings.m2_prices?.stores?.axe_ml === 'number' ? settings.m2_prices.stores.axe_ml : 15,
        bronze: typeof settings.m2_prices?.stores?.axe_ml === 'number' ? settings.m2_prices.stores.axe_ml : 15
      }
    }
  ];

  // Moustiquaires data definition
  const moustiItems = [
    {
      key: 'enroulable',
      label: 'Moustiquaire Enroulable Verticale',
      description: 'Enroulement vertical avec coffre compact et glissières avec brosse coupe-vent (Standard)',
      unit: 'm²',
      defaultHt: 65,
      ht: settings.m2_prices?.moustiquaires?.enroulable ?? 65
    },
    {
      key: 'plissee',
      label: 'Moustiquaire Plissée Coulissante',
      description: 'Toile plissée latérale sans seuil au sol — Idéale pour baies vitrées et portes-fenêtres',
      unit: 'm²',
      defaultHt: 110,
      ht: settings.m2_prices?.moustiquaires?.plissee ?? 110
    },
    {
      key: 'fixe',
      label: 'Moustiquaire Cadre Fixe Clipsé',
      description: 'Cadre aluminium fixe économique avec attaches rapides pour fenêtres de service',
      unit: 'm²',
      defaultHt: 40,
      ht: settings.m2_prices?.moustiquaires?.fixe ?? 40
    },
    {
      key: 'battante',
      label: 'Moustiquaire Porte Battante',
      description: 'Porte moustiquaire robuste avec charnières à rappel automatique et poignée',
      unit: 'm²',
      defaultHt: 90,
      ht: settings.m2_prices?.moustiquaires?.battante ?? 90
    }
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600" />
            <span>Catalogue & Tarification Atelier</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Personnalisez librement les prix d'usine des profilés aluminium, stores, moustiquaires et vitrages pour votre atelier.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'm2_surfaces' ? (
            <button
              onClick={() => setResetM2ModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-900 border border-gray-200 rounded-xl transition shadow-xs cursor-pointer"
              title="Restaurer les prix par défaut des vitrages, stores et moustiquaires"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              <span>Restaurer prix standards (m²)</span>
            </button>
          ) : (
            <button
              onClick={() => setResetModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-900 border border-gray-200 rounded-xl transition shadow-xs cursor-pointer"
              title="Réinitialiser tous les profilés aux prix officiels par défaut"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              <span>Restaurer prix d'usine (Profilés)</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Banner: Taux TVA */}
      <div className="bg-blue-50 border border-blue-200/90 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
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

        {bulkSuccessMsg && (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/90 px-3 py-1.5 rounded-lg border border-emerald-300 animate-fade-in flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            {bulkSuccessMsg}
          </span>
        )}
      </div>

      {/* Bulk Price Modification Card for Aluminium Bars */}
      {activeTab !== 'm2_surfaces' && (
        <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-amber-50/90 border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/10 text-amber-700 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950">Mise à jour des prix des profilés en masse</h3>
                <p className="text-xs text-amber-800/80">Ajustez les prix par famille et couleur avec simulation préalable</p>
              </div>
            </div>
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
      )}

      {/* Bulk Price Modification Card for M² Surfaces */}
      {activeTab === 'm2_surfaces' && (
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-blue-50/90 border border-blue-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-600/10 text-blue-700 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-blue-950">Mise à jour en masse des prix au m²</h3>
                <p className="text-xs text-blue-800/80">Appliquez une augmentation ou réduction générale sur les stores, moustiquaires ou vitrages</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleApplyBulkM2} className="flex flex-wrap items-center gap-3">
            {/* Direction */}
            <div className="flex items-center bg-white rounded-lg p-0.5 border border-blue-300/80 shadow-xs">
              <button
                type="button"
                onClick={() => setBulkM2Direction('increase')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                  bulkM2Direction === 'increase'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Augmenter (+)</span>
              </button>
              <button
                type="button"
                onClick={() => setBulkM2Direction('decrease')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                  bulkM2Direction === 'decrease'
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
                onClick={() => setBulkM2Mode('percent')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                  bulkM2Mode === 'percent'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                % Pourcentage
              </button>
              <button
                type="button"
                onClick={() => setBulkM2Mode('amount')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                  bulkM2Mode === 'amount'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                DT Montant fixe
              </button>
            </div>

            {/* Category Select */}
            <select
              value={bulkM2Category}
              onChange={e => setBulkM2Category(e.target.value as any)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">— Toutes les surfaces (Stores, Mousti, Vitrages) —</option>
              <option value="stores">🪟 Volets Roulants & Stores</option>
              <option value="moustiquaires">🦟 Moustiquaires</option>
              <option value="vitrages">🪟 Vitrages & Panneaux</option>
              <option value="motifs">✨ Finitions & Double Vitrage</option>
            </select>

            {/* Value Input */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-gray-700">
                {bulkM2Direction === 'increase' ? '+' : '-'}
              </span>
              <div className="relative">
                <input
                  type="number"
                  value={bulkM2Value}
                  onChange={e => setBulkM2Value(e.target.value)}
                  placeholder={bulkM2Mode === 'percent' ? "Ex: 10" : "Ex: 5.000"}
                  step="any"
                  min="0"
                  required
                  className="w-24 bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-2.5 top-2 text-gray-400 text-xs font-bold">
                  {bulkM2Mode === 'percent' ? '%' : 'DT'}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-5 py-2 rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Appliquer sur m²</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Tabs Filter & Search Bar */}
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

        {/* Search Bar (When on bars tabs) */}
        {activeTab !== 'm2_surfaces' && (
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
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW A: Aluminium Profile Bars Table                                      */}
      {/* ========================================================================= */}
      {activeTab !== 'm2_surfaces' && (
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
      )}

      {/* ========================================================================= */}
      {/* VIEW B: M² Surfaces (Stores, Moustiquaires, Vitrages, Finitions)          */}
      {/* ========================================================================= */}
      {activeTab === 'm2_surfaces' && (
        <div className="space-y-6">
          {/* Card 1: Volets Roulants & Stores */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-200 bg-gradient-to-r from-blue-50/80 to-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-600/10 text-blue-700 rounded-lg">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    🪟 Volets Roulants & Stores Rideaux (au m² & mètre linéaire)
                  </h3>
                  <p className="text-xs text-gray-500">Tarifs des lames de tablier et coffre aluminium appliqués aux devis</p>
                </div>
              </div>
              <span className="text-xs text-blue-700 font-semibold bg-blue-100/70 px-2.5 py-1 rounded-lg">
                {storeItems.length} éléments configurables
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Type de Lame / Élément</th>
                    <th className="px-4 py-3 min-w-[200px]">Description & Usage</th>
                    <th className="px-3 py-3 text-center">Unité</th>
                    <th className="px-3 py-3 text-right">Blanc</th>
                    <th className="px-3 py-3 text-right">Gris</th>
                    <th className="px-3 py-3 text-right">Noir 9005</th>
                    <th className="px-3 py-3 text-right">Effet Bois</th>
                    <th className="px-3 py-3 text-right">Bronze</th>
                    <th className="px-3 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  {storeItems.map(item => {
                    const tva = settings.tva_default;
                    const calcTtc = (ht: number) => Math.round(ht * (1 + tva / 100) * 1000) / 1000;
                    return (
                      <tr key={item.key} className="hover:bg-blue-50/40 transition">
                        <td className="px-4 py-3 font-bold text-gray-900">
                          {item.label}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{item.description}</td>
                        <td className="px-3 py-3 text-center">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                            {item.unit}
                          </span>
                        </td>
                        {item.hasColors ? (
                          <>
                            {/* Blanc */}
                            <td className="px-3 py-3 text-right font-mono">
                              <div className="font-bold text-gray-900">{(item.prices.blanc || 0).toFixed(3)}</div>
                              <div className="text-[10px] text-blue-600 font-semibold">{calcTtc(item.prices.blanc || 0).toFixed(3)}</div>
                            </td>
                            {/* Gris */}
                            <td className="px-3 py-3 text-right font-mono">
                              <div className="font-bold text-gray-900">{(item.prices.gris || 0).toFixed(3)}</div>
                              <div className="text-[10px] text-blue-600 font-semibold">{calcTtc(item.prices.gris || 0).toFixed(3)}</div>
                            </td>
                            {/* Noir */}
                            <td className="px-3 py-3 text-right font-mono">
                              <div className="font-bold text-gray-900">{(item.prices.noir || 0).toFixed(3)}</div>
                              <div className="text-[10px] text-blue-600 font-semibold">{calcTtc(item.prices.noir || 0).toFixed(3)}</div>
                            </td>
                            {/* Effet Bois */}
                            <td className="px-3 py-3 text-right font-mono">
                              <div className="font-bold text-gray-900">{(item.prices.effet_bois || 0).toFixed(3)}</div>
                              <div className="text-[10px] text-blue-600 font-semibold">{calcTtc(item.prices.effet_bois || 0).toFixed(3)}</div>
                            </td>
                            {/* Bronze */}
                            <td className="px-3 py-3 text-right font-mono">
                              <div className="font-bold text-gray-900">{(item.prices.bronze || 0).toFixed(3)}</div>
                              <div className="text-[10px] text-blue-600 font-semibold">{calcTtc(item.prices.bronze || 0).toFixed(3)}</div>
                            </td>
                          </>
                        ) : (
                          <td colSpan={5} className="px-3 py-3 text-center bg-gray-50/50">
                            <div className="font-mono font-bold text-gray-900 text-xs">
                              {(item.prices.blanc || 0).toFixed(3)} DT HT ({calcTtc(item.prices.blanc || 0).toFixed(3)} TTC)
                            </div>
                            <div className="text-[10px] text-gray-500 font-sans font-medium">Prix uniforme (Tube acier galvanisé)</div>
                          </td>
                        )}
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => startEditM2(
                              'stores',
                              item.key,
                              item.label,
                              item.prices.blanc,
                              item.unit,
                              item.description,
                              item.hasColors,
                              item.prices
                            )}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition cursor-pointer border border-blue-200"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Modifier</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 2: Moustiquaires */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-200 bg-gradient-to-r from-emerald-50/80 to-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-600/10 text-emerald-700 rounded-lg">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    🦟 Moustiquaires (au m²)
                  </h3>
                  <p className="text-xs text-gray-500">Tarifs au mètre carré selon le mécanisme et modèle de moustiquaire</p>
                </div>
              </div>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                4 modèles
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Type de Moustiquaire</th>
                    <th className="px-4 py-3 min-w-[240px]">Description & Usage</th>
                    <th className="px-3 py-3 text-center">Unité</th>
                    <th className="px-4 py-3 text-right">Prix HT (DT)</th>
                    <th className="px-4 py-3 text-right text-emerald-700">Prix TTC (DT)</th>
                    <th className="px-3 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  {moustiItems.map(item => {
                    const ttc = Math.round(item.ht * (1 + settings.tva_default / 100) * 1000) / 1000;
                    const isCustom = item.ht !== item.defaultHt;
                    return (
                      <tr key={item.key} className="hover:bg-emerald-50/40 transition">
                        <td className="px-4 py-3 font-bold text-gray-900 flex items-center gap-2">
                          <span>{item.label}</span>
                          {isCustom && (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300">
                              Personnalisé
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{item.description}</td>
                        <td className="px-3 py-3 text-center">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                            {item.unit}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-gray-900 text-sm">
                          {item.ht.toFixed(3)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700 text-sm">
                          {ttc.toFixed(3)}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => startEditM2('moustiquaires', item.key, item.label, item.ht, item.unit, item.description)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition cursor-pointer border border-emerald-200"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Modifier</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 3: Vitrages & Panneaux */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-200 bg-gradient-to-r from-purple-50/80 to-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-600/10 text-purple-700 rounded-lg">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    🪟 Vitrages, Panneaux & Remplissages (au m²)
                  </h3>
                  <p className="text-xs text-gray-500">Tarifs au mètre carré pour le simple vitrage, teinté, stop-sol, panneaux PVC et MDF</p>
                </div>
              </div>
              <span className="text-xs text-purple-700 font-semibold bg-purple-100/70 px-2.5 py-1 rounded-lg">
                {REMPLISSAGES.length} remplissages
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Référence</th>
                    <th className="px-4 py-3 min-w-[240px]">Désignation / Verre</th>
                    <th className="px-3 py-3 text-center">Unité</th>
                    <th className="px-4 py-3 text-right">Prix HT (DT)</th>
                    <th className="px-4 py-3 text-right text-purple-700">Prix TTC (DT)</th>
                    <th className="px-3 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  {REMPLISSAGES.map(remp => {
                    const currentHt = settings.m2_prices?.vitrages?.[remp.id] ?? remp.pricePerM2;
                    const ttc = Math.round(currentHt * (1 + settings.tva_default / 100) * 1000) / 1000;
                    const isCustom = currentHt !== remp.pricePerM2;
                    return (
                      <tr key={remp.id} className="hover:bg-purple-50/40 transition">
                        <td className="px-4 py-3 font-mono font-bold text-gray-500 text-xs">{remp.id}</td>
                        <td className="px-4 py-3 font-bold text-gray-900 flex items-center gap-2">
                          <span>{remp.label}</span>
                          {isCustom && (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300">
                              Personnalisé
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                            m²
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-gray-900 text-sm">
                          {currentHt.toFixed(3)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-purple-700 text-sm">
                          {ttc.toFixed(3)}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => startEditM2('vitrages', remp.id, remp.label, currentHt, 'm²')}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-bold transition cursor-pointer border border-purple-200"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Modifier</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 4: Finitions & Double Vitrage */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-200 bg-gradient-to-r from-amber-50/80 to-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-600/10 text-amber-700 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    ✨ Finitions, Motifs & Traitement Verre (au m²)
                  </h3>
                  <p className="text-xs text-gray-500">Suppléments au mètre carré pour le double vitrage gaz argon, sablage, verre feuilleté et sécurité</p>
                </div>
              </div>
              <span className="text-xs text-amber-700 font-semibold bg-amber-100/70 px-2.5 py-1 rounded-lg">
                {MOTIFS.length} finitions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Référence</th>
                    <th className="px-4 py-3 min-w-[240px]">Désignation / Finition</th>
                    <th className="px-3 py-3 text-center">Unité</th>
                    <th className="px-4 py-3 text-right">Supplément HT (DT)</th>
                    <th className="px-4 py-3 text-right text-amber-700">Supplément TTC (DT)</th>
                    <th className="px-3 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  {MOTIFS.map(motif => {
                    const currentHt = settings.m2_prices?.motifs?.[motif.id] ?? motif.pricePerM2;
                    const ttc = Math.round(currentHt * (1 + settings.tva_default / 100) * 1000) / 1000;
                    const isCustom = currentHt !== motif.pricePerM2;
                    return (
                      <tr key={motif.id} className="hover:bg-amber-50/40 transition">
                        <td className="px-4 py-3 font-mono font-bold text-gray-500 text-xs">{motif.id}</td>
                        <td className="px-4 py-3 font-bold text-gray-900 flex items-center gap-2">
                          <span>{motif.label}</span>
                          {isCustom && (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300">
                              Personnalisé
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                            m²
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-gray-900 text-sm">
                          {currentHt.toFixed(3)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-amber-700 text-sm">
                          {ttc.toFixed(3)}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => startEditM2('motifs', motif.id, motif.label, currentHt, 'm²')}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold transition cursor-pointer border border-amber-200"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Modifier</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: Simulation & Preview Confirmation for Aluminium Bars             */}
      {/* ========================================================================= */}
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
                    Confirmation de la simulation des prix des profilés
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

      {/* ========================================================================= */}
      {/* MODAL 2: Reset Aluminium Bars to Factory Modal                            */}
      {/* ========================================================================= */}
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

      {/* ========================================================================= */}
      {/* MODAL 3: Reset M² Surfaces to Default Modal                               */}
      {/* ========================================================================= */}
      {resetM2ModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <div className="p-2.5 bg-blue-100 rounded-xl">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Restaurer les prix standards au m² ?</h3>
                <p className="text-xs text-gray-500">Vitrages, Volets Roulants et Moustiquaires</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Voulez-vous restaurer les tarifs de référence standards pour tous les <strong>volets roulants, moustiquaires, vitrages et finitions au m²</strong> ?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setResetM2ModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmResetM2}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Oui, restaurer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: Edit Single Aluminium Bar                                        */}
      {/* ========================================================================= */}
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

      {/* ========================================================================= */}
      {/* MODAL 5: Edit Single M² Surface Price                                     */}
      {/* ========================================================================= */}
      {editingM2Item && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-blue-600" />
                  <span>Modifier le prix</span>
                </h3>
                <p className="text-xs text-gray-500 font-medium">{editingM2Item.label}</p>
              </div>
              <button 
                onClick={() => setEditingM2Item(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editingM2Item.description && (
              <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                {editingM2Item.description}
              </p>
            )}

            {editingM2Item.hasColors ? (
              <div className="space-y-3 pt-1">
                <div className="text-xs font-semibold text-gray-700 mb-1">
                  Tarifs HT par couleur ({editingM2Item.unit}) :
                </div>
                {[
                  { key: 'blanc', label: '⚪ Blanc (Laqué Standard)' },
                  { key: 'gris', label: '🔘 Gris (7016 / 9006)' },
                  { key: 'noir', label: '⚫ Noir 9005 (Sablé/Mat)' },
                  { key: 'effet_bois', label: '🪵 Effet Bois (Chêne doré/Noyer)' },
                  { key: 'bronze', label: '🟤 Bronze (Anodisé)' }
                ].map(c => {
                  const htVal = editingStoreColors[c.key] || 0;
                  const ttc = Math.round(htVal * (1 + settings.tva_default / 100) * 1000) / 1000;
                  return (
                    <div key={c.key} className="grid grid-cols-2 items-center gap-3 bg-gray-50/70 p-2 rounded-xl border border-gray-100">
                      <label className="text-xs font-medium text-gray-700">{c.label} :</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editingStoreColors[c.key] !== undefined ? editingStoreColors[c.key] : ''}
                          onChange={e => setEditingStoreColors(prev => ({ ...prev, [c.key]: parseFloat(e.target.value) || 0 }))}
                          step="0.001"
                          min="0"
                          className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                        <span className="text-[11px] text-blue-600 font-mono font-semibold shrink-0">
                          {ttc.toFixed(3)} TTC
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nouveau Prix HT (par {editingM2Item.unit}) :
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={editM2Input}
                      onChange={e => setEditM2Input(e.target.value)}
                      step="0.001"
                      min="0"
                      autoFocus
                      className="w-full border border-gray-300 rounded-xl pl-3 pr-16 py-2.5 text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-500 text-xs font-bold">
                      DT / {editingM2Item.unit}
                    </span>
                  </div>
                </div>

                {/* Live TTC Preview */}
                {(() => {
                  const val = parseFloat(editM2Input) || 0;
                  const ttc = Math.round(val * (1 + settings.tva_default / 100) * 1000) / 1000;
                  return (
                    <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 flex items-center justify-between text-xs">
                      <span className="text-blue-900 font-medium">Prix TTC calculé (TVA {settings.tva_default}%) :</span>
                      <span className="text-sm font-mono font-bold text-blue-700">{ttc.toFixed(3)} DT / {editingM2Item.unit}</span>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEditingM2Item(null)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={saveM2Edit}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Enregistrer le prix</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
