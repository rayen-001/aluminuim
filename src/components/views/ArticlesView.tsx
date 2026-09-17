import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArticleItem } from '../../data/initialArticles';
import { AccessoryItemDef } from '../../data/initialAccessories';
import { REMPLISSAGES, MOTIFS } from '../../data/productCatalog';
import { getStoreElementPrice, StoreColorPrices } from '../../utils/devisCalculator';
import { getProfileImageUrl, hasProfileImage } from '../../data/profileImages';
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
  SlidersHorizontal,
  Wrench,
  Box,
  CheckCircle2
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
    resetM2PricesToDefault,
    accessories,
    updateAccessoryPrice,
    updateAccessoryStock,
    bulkUpdateAccessories,
    resetAccessoriesToDefault
  } = useApp();

  const [activeTab, setActiveTab] = useState<'Toutes' | 'TPR' | 'Aluco' | 'Alu Eco' | 'Garde Corps' | 'm2_surfaces' | 'accessoires'>('Toutes');
  const [searchQuery, setSearchQuery] = useState('');
  const [tvaInput, setTvaInput] = useState(String(settings.tva_default));
  const [zoomProfil, setZoomProfil] = useState<string | null>(null);

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

  // Bulk update states for Accessoires & Quincaillerie
  const [selectedAccCategory, setSelectedAccCategory] = useState<string>('all');
  const [bulkAccCategory, setBulkAccCategory] = useState<string>('all');
  const [bulkAccDirection, setBulkAccDirection] = useState<'increase' | 'decrease'>('increase');
  const [bulkAccMode, setBulkAccMode] = useState<'percent' | 'amount'>('percent');
  const [bulkAccValue, setBulkAccValue] = useState<string>('');

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

  // Modals for Accessoires & Quincaillerie
  const [previewAccModalOpen, setPreviewAccModalOpen] = useState(false);
  const [resetAccModalOpen, setResetAccModalOpen] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState<AccessoryItemDef | null>(null);
  const [editAccPrice, setEditAccPrice] = useState<string>('');
  const [editAccStock, setEditAccStock] = useState<string>('');

  // Family tabs with counts
  const familyTabs = [
    { id: 'Toutes', label: 'Toutes les barres', count: articles.length },
    { id: 'TPR', label: 'TPR', count: articles.filter(a => a.family === 'TPR').length },
    { id: 'Aluco', label: 'Aluco', count: articles.filter(a => a.family === 'Aluco').length },
    { id: 'Alu Eco', label: 'Alu Eco', count: articles.filter(a => a.family === 'Alu Eco').length },
    { id: 'Garde Corps', label: 'Garde Corps', count: articles.filter(a => a.family === 'Garde Corps').length },
    { id: 'm2_surfaces', label: '🪟 Stores, Moustiquaires & Vitrages (m²)', count: 33 },
    { id: 'accessoires', label: '🔩 Accessoires & Quincaillerie', count: accessories.length },
  ] as const;

  const accCategories = [
    { id: 'all', label: 'Tous les accessoires' },
    { id: 'assemblage', label: '🔩 Assemblage & Visserie' },
    { id: 'roulement', label: '⚙️ Roulement & Guidage' },
    { id: 'verrouillage', label: '🔑 Verrouillage & Crémones' },
    { id: 'joints', label: '🛡️ Joints & Étanchéité' },
    { id: 'moteurs_volets', label: '⚡ Moteurs & Volets' }
  ];

  // Filter articles (profile bars)
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

  // Filter accessories
  const filteredAccessories = accessories.filter(a => {
    if (selectedAccCategory !== 'all' && a.categorie !== selectedAccCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.id.toLowerCase().includes(q) ||
        a.nom.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q))
      );
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
      const val = parseFloat(editM2Input);
      if (!isNaN(val) && val >= 0) {
        updateM2Price(editingM2Item.category, editingM2Item.key, val);
        setBulkSuccessMsg(`Prix de "${editingM2Item.label}" mis à jour à ${val.toFixed(3)} DT HT.`);
      }
    }
    setEditingM2Item(null);
    setTimeout(() => setBulkSuccessMsg(''), 4000);
  };

  const handleApplyBulkM2 = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(bulkM2Value);
    if (isNaN(val) || val <= 0) return;
    bulkUpdateM2Prices(bulkM2Category, val, bulkM2Mode, bulkM2Direction);
    setBulkSuccessMsg(
      `${bulkM2Direction === 'increase' ? 'Augmentation' : 'Diminution'} de ${val}${bulkM2Mode === 'percent' ? '%' : ' DT'} appliquée aux surfaces ${bulkM2Category === 'all' ? 'totales' : bulkM2Category} !`
    );
    setTimeout(() => setBulkSuccessMsg(''), 4000);
    setBulkM2Value('');
  };

  const confirmResetM2 = () => {
    resetM2PricesToDefault();
    setResetM2ModalOpen(false);
    setBulkSuccessMsg('Tous les prix des surfaces M² (Stores, Moustiquaires, Vitrages, Finitions) ont été réinitialisés aux valeurs catalogue.');
    setTimeout(() => setBulkSuccessMsg(''), 4000);
  };

  // Accessoires Handlers
  const handleOpenAccSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(bulkAccValue);
    if (isNaN(val) || val <= 0) return;
    setPreviewAccModalOpen(true);
  };

  const affectedAccessories = accessories.filter(a => bulkAccCategory === 'all' || a.categorie === bulkAccCategory);

  const previewAccSamples = affectedAccessories.slice(0, 5).map(acc => {
    const origHt = acc.prix_unitaire_ht || 0;
    const numVal = parseFloat(bulkAccValue) || 0;
    let newHt = origHt;
    if (bulkAccMode === 'amount') {
      newHt = bulkAccDirection === 'decrease' ? Math.max(0, origHt - numVal) : origHt + numVal;
    } else {
      const factor = bulkAccDirection === 'decrease' ? (1 - numVal / 100) : (1 + numVal / 100);
      newHt = Math.max(0, origHt * factor);
    }
    newHt = Math.round(newHt * 1000) / 1000;
    const origTtc = Math.round(origHt * (1 + settings.tva_default / 100) * 1000) / 1000;
    const newTtc = Math.round(newHt * (1 + settings.tva_default / 100) * 1000) / 1000;
    return {
      id: acc.id,
      nom: acc.nom,
      categorie: acc.categorie,
      origHt,
      origTtc,
      newHt,
      newTtc,
      diff: Math.round((newHt - origHt) * 1000) / 1000
    };
  });

  const confirmApplyBulkAcc = () => {
    const numVal = parseFloat(bulkAccValue);
    if (isNaN(numVal) || numVal <= 0) return;
    bulkUpdateAccessories(bulkAccCategory, numVal, bulkAccMode, bulkAccDirection);
    setPreviewAccModalOpen(false);
    setBulkSuccessMsg(`${bulkAccDirection === 'increase' ? 'Augmentation' : 'Diminution'} de ${numVal}${bulkAccMode === 'percent' ? '%' : ' DT'} appliquée avec succès sur ${affectedAccessories.length} accessoires !`);
    setTimeout(() => setBulkSuccessMsg(''), 4000);
    setBulkAccValue('');
  };

  const confirmResetAccCatalog = () => {
    resetAccessoriesToDefault();
    setResetAccModalOpen(false);
    setBulkSuccessMsg('Catalogue accessoires et quincaillerie réinitialisé aux valeurs d\'usine.');
    setTimeout(() => setBulkSuccessMsg(''), 4000);
  };

  const startEditAcc = (acc: AccessoryItemDef) => {
    setEditingAccessory(acc);
    setEditAccPrice(String(acc.prix_unitaire_ht));
    setEditAccStock(acc.stock_qty !== undefined ? String(acc.stock_qty) : '');
  };

  const saveAccEdit = () => {
    if (!editingAccessory) return;
    const val = parseFloat(editAccPrice);
    if (!isNaN(val) && val >= 0) {
      updateAccessoryPrice(editingAccessory.id, val);
    }
    const stockVal = editAccStock.trim() === '' ? undefined : parseInt(editAccStock, 10);
    updateAccessoryStock(editingAccessory.id, stockVal !== undefined ? stockVal : 0);
    setBulkSuccessMsg(`Accessoire "${editingAccessory.nom}" mis à jour avec succès !`);
    setTimeout(() => setBulkSuccessMsg(''), 4000);
    setEditingAccessory(null);
  };

  const getAccCategoryBadge = (cat: AccessoryItemDef['categorie']) => {
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
        return <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-indigo-200">Moteurs Volets</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md">Accessoire</span>;
    }
  };

  // M² Data Definitions
  const storeItems = [
    {
      key: 'lame_inj_55',
      label: 'Lame injectée 55 mm (DT/m²)',
      description: 'Lames aluminium injectées de polyuréthane 55mm (Standard)',
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
      label: 'Lame injectée 45 mm (DT/m²)',
      description: 'Lames aluminium injectées de polyuréthane 45mm (Fenêtres compactes)',
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
      label: 'Lame injectée 42 mm (DT/m²)',
      description: 'Lames aluminium injectées 42mm petit enroulement',
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
      label: 'Lame extrudée sécurité (DT/m²)',
      description: 'Lames aluminium extrudé renforcé anti-effraction',
      unit: 'm²',
      hasColors: true,
      defaultPrices: { blanc: 130, gris: 142, noir: 146, effet_bois: 165, bronze: 142 },
      prices: {
        blanc: getStoreElementPrice(settings.m2_prices?.stores?.lame_extrud, 'blanc', 130),
        gris: getStoreElementPrice(settings.m2_prices?.stores?.lame_extrud, 'gris', 142),
        noir: getStoreElementPrice(settings.m2_prices?.stores?.lame_extrud, 'noir', 146),
        effet_bois: getStoreElementPrice(settings.m2_prices?.stores?.lame_extrud, 'effet_bois', 165),
        bronze: getStoreElementPrice(settings.m2_prices?.stores?.lame_extrud, 'bronze', 142)
      }
    },
    {
      key: 'coffre_alu_15',
      label: 'Coffre aluminium 15 cm (DT/ml)',
      description: 'Caisson coffre aluminium pan coupé 15 cm pour fenêtres (par ml)',
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
      label: 'Coffre PVC (DT/ml)',
      description: 'Caisson coffre PVC isolé thermo-acoustique pour pose sur dormant (par ml)',
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
      label: 'Moustiquaire Cadre Fixe Aimanté',
      description: 'Cadre aluminium fixe démontable avec toile en fibre de verre enduite PVC',
      unit: 'm²',
      defaultHt: 45,
      ht: settings.m2_prices?.moustiquaires?.fixe ?? 45
    },
    {
      key: 'battante',
      label: 'Moustiquaire Porte Battante',
      description: 'Porte moustiquaire avec charnières à ressort de rappel et profilé renforcé avec traverse',
      unit: 'm²',
      defaultHt: 85,
      ht: settings.m2_prices?.moustiquaires?.battante ?? 85
    }
  ];

  const vitrageItems = REMPLISSAGES.map(r => ({
    key: r.id,
    label: r.label,
    description: r.label.toLowerCase().includes('double') ? 'Double vitrage avec intercalaire thermique & gaz argon' : r.label.toLowerCase().includes('plaque') || r.label.toLowerCase().includes('planche') ? 'Panneau ou plaque de remplissage' : 'Vitrage clair / teinté / sécurit',
    unit: 'm²',
    defaultHt: r.pricePerM2,
    ht: settings.m2_prices?.vitrages?.[r.id] ?? r.pricePerM2
  }));

  const motifItems = MOTIFS.map(m => ({
    key: m.id,
    label: m.label,
    description: m.id === '406890' ? 'Double vitrage avec remplissage gaz isolant argon' : 'Finitions décoratives et sécurités',
    unit: 'm²',
    defaultHt: m.pricePerM2,
    ht: settings.m2_prices?.motifs?.[m.id] ?? m.pricePerM2
  }));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            <span>Catalogue Articles, Accessoires & Tarifs</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Gérez les prix HT/TTC, les stocks et les règles de calcul des barres, accessoires et surfaces (m²)
          </p>
        </div>

        {/* Global Catalog Actions */}
        <div className="flex items-center gap-2">
          {activeTab === 'accessoires' ? (
            <button
              onClick={() => setResetAccModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-rose-600 bg-white border border-gray-200 rounded-xl hover:bg-rose-50 transition cursor-pointer shadow-xs"
              title="Réinitialiser tous les accessoires aux valeurs d'usine"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser Accessoires</span>
            </button>
          ) : activeTab === 'm2_surfaces' ? (
            <button
              onClick={() => setResetM2ModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-rose-600 bg-white border border-gray-200 rounded-xl hover:bg-rose-50 transition cursor-pointer shadow-xs"
              title="Réinitialiser tous les prix m² aux valeurs catalogue d'origine"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser M² Usine</span>
            </button>
          ) : (
            <button
              onClick={() => setResetModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-rose-600 bg-white border border-gray-200 rounded-xl hover:bg-rose-50 transition cursor-pointer shadow-xs"
              title="Réinitialiser tous les profilés aux valeurs catalogue d'origine"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser Profilés</span>
            </button>
          )}
        </div>
      </div>

      {/* Global TVA Bar */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleApplyTVA} className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs sm:text-sm">
            <Percent className="w-4 h-4 text-blue-600" />
            <span>Taux de TVA Global :</span>
          </div>
          <div className="relative">
            <input
              type="number"
              value={tvaInput}
              onChange={e => setTvaInput(e.target.value)}
              step="0.1"
              min="0"
              max="100"
              className="w-20 bg-white border border-blue-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-mono font-bold text-gray-900 focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-2 top-1.5 text-gray-400 text-xs font-bold">%</span>
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
      {activeTab !== 'm2_surfaces' && activeTab !== 'accessoires' && (
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
            {/* Direction */}
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

            {/* Mode */}
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
              <span>Simuler le calcul</span>
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
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-blue-950">Mise à jour en masse des prix au m² (Stores, Vitrages & Motifs)</h3>
                <p className="text-xs text-blue-800/80">Ajustez les prix au mètre carré directement avec répercussion sur tous les devis</p>
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
                  placeholder={bulkM2Mode === 'percent' ? "Ex: 5" : "Ex: 10"}
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
              <span>Appliquer aux prix M²</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Bulk Price Modification Card for Accessoires & Quincaillerie */}
      {activeTab === 'accessoires' && (
        <div className="bg-gradient-to-r from-purple-50/90 via-indigo-50/60 to-purple-50/90 border border-purple-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-600/10 text-purple-700 rounded-lg">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-purple-950">Mise à jour en masse des accessoires & quincaillerie</h3>
                <p className="text-xs text-purple-800/80">Ajustez les prix des serrures, crémones, kits oscillo-battants, joints et moteurs</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleOpenAccSimulation} className="flex flex-wrap items-center gap-3">
            {/* Direction */}
            <div className="flex items-center bg-white rounded-lg p-0.5 border border-purple-300/80 shadow-xs">
              <button
                type="button"
                onClick={() => setBulkAccDirection('increase')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                  bulkAccDirection === 'increase'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Augmenter (+)</span>
              </button>
              <button
                type="button"
                onClick={() => setBulkAccDirection('decrease')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                  bulkAccDirection === 'decrease'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Diminuer (-)</span>
              </button>
            </div>

            {/* Mode */}
            <div className="flex items-center bg-white rounded-lg p-0.5 border border-purple-300/80 shadow-xs">
              <button
                type="button"
                onClick={() => setBulkAccMode('percent')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                  bulkAccMode === 'percent'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                % Pourcentage
              </button>
              <button
                type="button"
                onClick={() => setBulkAccMode('amount')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                  bulkAccMode === 'amount'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                DT Montant fixe
              </button>
            </div>

            {/* Category Select */}
            <select
              value={bulkAccCategory}
              onChange={e => setBulkAccCategory(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="all">— Toutes les catégories ({accessories.length}) —</option>
              <option value="assemblage">🔩 Assemblage & Visserie</option>
              <option value="roulement">⚙️ Roulement & Guidage</option>
              <option value="verrouillage">🔑 Verrouillage & Crémones</option>
              <option value="joints">🛡️ Joints & Étanchéité</option>
              <option value="moteurs_volets">⚡ Moteurs & Volets</option>
            </select>

            {/* Value Input */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-gray-700">
                {bulkAccDirection === 'increase' ? '+' : '-'}
              </span>
              <div className="relative">
                <input
                  type="number"
                  value={bulkAccValue}
                  onChange={e => setBulkAccValue(e.target.value)}
                  placeholder={bulkAccMode === 'percent' ? "Ex: 5" : "Ex: 2.500"}
                  step="any"
                  min="0"
                  required
                  className="w-24 bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-mono font-bold focus:ring-2 focus:ring-purple-500"
                />
                <span className="absolute right-2.5 top-2 text-gray-400 text-xs font-bold">
                  {bulkAccMode === 'percent' ? '%' : 'DT'}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold px-5 py-2 rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Simuler le calcul</span>
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

        {/* Search Bar */}
        {activeTab !== 'm2_surfaces' && (
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'accessoires' ? "Rechercher accessoire, crémone, serrure, moteur..." : "Rechercher référence ou description..."}
              className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW A: Aluminium Profile Bars Table                                      */}
      {/* ========================================================================= */}
      {activeTab !== 'm2_surfaces' && activeTab !== 'accessoires' && (
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
                        <td className="px-4 py-3 font-bold text-gray-900">
                          <div className="flex items-center gap-2">
                            {hasProfileImage(art.reference) && (
                              <button
                                type="button"
                                onClick={() => setZoomProfil(art.reference)}
                                title="Voir coupe technique"
                                className="w-7 h-7 rounded-lg border border-gray-200 bg-white p-0.5 hover:border-blue-500 hover:shadow-xs transition shrink-0 cursor-pointer flex items-center justify-center overflow-hidden"
                              >
                                <img
                                  src={getProfileImageUrl(art.reference)!}
                                  alt={art.reference}
                                  className="w-full h-full object-contain"
                                />
                              </button>
                            )}
                            <span className="font-mono">{art.reference}</span>
                          </div>
                        </td>
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
                        
                        {/* Prices per color */}
                        {(['blanc', 'gris', 'noir', 'couleur_mat', 'couleur_givre'] as const).map(c => {
                          const p = art.prix[c];
                          if (!p) return <td key={c} className="px-3 py-3 text-right text-gray-300">-</td>;
                          const ttc = Math.round(p.ht * (1 + settings.tva_default / 100) * 1000) / 1000;
                          return (
                            <td key={c} className="px-3 py-3 text-right">
                              <div className="font-semibold text-gray-900">{p.ht.toFixed(3)}</div>
                              <div className="text-[10px] text-blue-600 font-medium">{ttc.toFixed(3)} TTC</div>
                            </td>
                          );
                        })}

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
                    <th className="px-3 py-3 text-right">Blanc (DT)</th>
                    <th className="px-3 py-3 text-right">Gris (DT)</th>
                    <th className="px-3 py-3 text-right">Noir (DT)</th>
                    <th className="px-3 py-3 text-right">Effet Bois (DT)</th>
                    <th className="px-3 py-3 text-right">Bronze (DT)</th>
                    <th className="px-3 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {storeItems.map(item => {
                    return (
                      <tr key={item.key} className="hover:bg-blue-50/40 transition">
                        <td className="px-4 py-3 font-bold text-gray-900 font-sans">{item.label}</td>
                        <td className="px-4 py-3 font-sans text-xs text-gray-600">{item.description}</td>
                        <td className="px-3 py-3 text-center font-bold text-gray-500 font-sans">{item.unit}</td>
                        
                        {(['blanc', 'gris', 'noir', 'effet_bois', 'bronze'] as const).map(c => {
                          const htVal = item.prices[c];
                          const ttc = Math.round(htVal * (1 + settings.tva_default / 100) * 1000) / 1000;
                          return (
                            <td key={c} className="px-3 py-3 text-right">
                              <div className="font-semibold text-gray-900">{htVal.toFixed(3)}</div>
                              <div className="text-[10px] text-blue-600 font-medium">{ttc.toFixed(3)} TTC</div>
                            </td>
                          );
                        })}

                        <td className="px-3 py-3 text-center font-sans">
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
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            Modifier
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
                  <p className="text-xs text-gray-500">Tarifs standards par mètre carré pour les moustiquaires intégrées et autonomes</p>
                </div>
              </div>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                {moustiItems.length} types disponibles
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Modèle de Moustiquaire</th>
                    <th className="px-4 py-3 min-w-[250px]">Description & Caractéristiques</th>
                    <th className="px-3 py-3 text-center">Unité</th>
                    <th className="px-3 py-3 text-right">Prix HT Usine</th>
                    <th className="px-3 py-3 text-right text-blue-700">Prix TTC Calculé</th>
                    <th className="px-3 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {moustiItems.map(item => {
                    const ttc = Math.round(item.ht * (1 + settings.tva_default / 100) * 1000) / 1000;
                    return (
                      <tr key={item.key} className="hover:bg-emerald-50/40 transition">
                        <td className="px-4 py-3 font-bold text-gray-900 font-sans">{item.label}</td>
                        <td className="px-4 py-3 font-sans text-xs text-gray-600">{item.description}</td>
                        <td className="px-3 py-3 text-center font-bold text-gray-500 font-sans">{item.unit}</td>
                        <td className="px-3 py-3 text-right font-semibold text-gray-900">{item.ht.toFixed(3)} DT</td>
                        <td className="px-3 py-3 text-right font-bold text-blue-700">{ttc.toFixed(3)} DT</td>
                        <td className="px-3 py-3 text-center font-sans">
                          <button
                            onClick={() => startEditM2('moustiquaires', item.key, item.label, item.ht, item.unit, item.description)}
                            className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 hover:underline cursor-pointer"
                          >
                            Modifier
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 3: Vitrages & Remplissages */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-200 bg-gradient-to-r from-cyan-50/80 to-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyan-600/10 text-cyan-700 rounded-lg">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    🪟 Vitrages & Panneaux de Remplissage (au m²)
                  </h3>
                  <p className="text-xs text-gray-500">Tarifs au mètre carré appliqués lors du chiffrage des châssis et ouvrants</p>
                </div>
              </div>
              <span className="text-xs text-cyan-700 font-semibold bg-cyan-100/70 px-2.5 py-1 rounded-lg">
                {vitrageItems.length} types de vitrage
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Type de Vitrage / Remplissage</th>
                    <th className="px-4 py-3 min-w-[250px]">Description & Isolation</th>
                    <th className="px-3 py-3 text-center">Unité</th>
                    <th className="px-3 py-3 text-right">Prix HT (m²)</th>
                    <th className="px-3 py-3 text-right text-blue-700">Prix TTC (m²)</th>
                    <th className="px-3 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {vitrageItems.map(item => {
                    const ttc = Math.round(item.ht * (1 + settings.tva_default / 100) * 1000) / 1000;
                    return (
                      <tr key={item.key} className="hover:bg-cyan-50/40 transition">
                        <td className="px-4 py-3 font-bold text-gray-900 font-sans">{item.label}</td>
                        <td className="px-4 py-3 font-sans text-xs text-gray-600">{item.description}</td>
                        <td className="px-3 py-3 text-center font-bold text-gray-500 font-sans">{item.unit}</td>
                        <td className="px-3 py-3 text-right font-semibold text-gray-900">{item.ht.toFixed(3)} DT</td>
                        <td className="px-3 py-3 text-right font-bold text-blue-700">{ttc.toFixed(3)} DT</td>
                        <td className="px-3 py-3 text-center font-sans">
                          <button
                            onClick={() => startEditM2('vitrages', item.key, item.label, item.ht, item.unit, item.description)}
                            className="text-xs font-semibold text-cyan-600 hover:text-cyan-800 hover:underline cursor-pointer"
                          >
                            Modifier
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 4: Motifs & Croisillons Décoratifs */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-200 bg-gradient-to-r from-amber-50/80 to-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-600/10 text-amber-700 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    ✨ Motifs, Croisillons & Finitions Décoratives (au m²)
                  </h3>
                  <p className="text-xs text-gray-500">Suppléments décoratifs au m² ajoutés aux devis</p>
                </div>
              </div>
              <span className="text-xs text-amber-700 font-semibold bg-amber-100/70 px-2.5 py-1 rounded-lg">
                {motifItems.length} finitions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Type de Finition / Motif</th>
                    <th className="px-4 py-3 min-w-[250px]">Description</th>
                    <th className="px-3 py-3 text-center">Unité</th>
                    <th className="px-3 py-3 text-right">Supplément HT (m²)</th>
                    <th className="px-3 py-3 text-right text-blue-700">Supplément TTC (m²)</th>
                    <th className="px-3 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {motifItems.map(item => {
                    const ttc = Math.round(item.ht * (1 + settings.tva_default / 100) * 1000) / 1000;
                    return (
                      <tr key={item.key} className="hover:bg-amber-50/40 transition">
                        <td className="px-4 py-3 font-bold text-gray-900 font-sans">{item.label}</td>
                        <td className="px-4 py-3 font-sans text-xs text-gray-600">{item.description}</td>
                        <td className="px-3 py-3 text-center font-bold text-gray-500 font-sans">{item.unit}</td>
                        <td className="px-3 py-3 text-right font-semibold text-gray-900">{item.ht.toFixed(3)} DT</td>
                        <td className="px-3 py-3 text-right font-bold text-blue-700">{ttc.toFixed(3)} DT</td>
                        <td className="px-3 py-3 text-center font-sans">
                          <button
                            onClick={() => startEditM2('motifs', item.key, item.label, item.ht, item.unit, item.description)}
                            className="text-xs font-semibold text-amber-600 hover:text-amber-800 hover:underline cursor-pointer"
                          >
                            Modifier
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
      {/* VIEW C: Accessoires & Quincaillerie Table                                  */}
      {/* ========================================================================= */}
      {activeTab === 'accessoires' && (
        <div className="space-y-4">
          {/* Subcategory Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {accCategories.map(cat => {
              const count = cat.id === 'all' 
                ? accessories.length 
                : accessories.filter(a => a.categorie === cat.id).length;
              const isSelected = selectedAccCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedAccCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                    isSelected 
                      ? 'bg-purple-600 text-white shadow-xs' 
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-200 bg-gradient-to-r from-purple-50/80 to-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-600/10 text-purple-700 rounded-lg">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    🔩 Quincaillerie, Serrures, Crémones & Kits Atelier
                  </h3>
                  <p className="text-xs text-gray-500">Tarifs unitaires et stocks des accessoires utilisés dans les débits et calculs de prix</p>
                </div>
              </div>
              <span className="text-xs text-purple-700 font-semibold bg-purple-100/70 px-2.5 py-1 rounded-lg">
                {filteredAccessories.length} accessoire(s)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Code / Réf</th>
                    <th className="px-4 py-3 min-w-[220px]">Désignation de l'accessoire</th>
                    <th className="px-3 py-3 text-center">Catégorie</th>
                    <th className="px-3 py-3 text-center">Unité</th>
                    <th className="px-3 py-3 text-center">Stock</th>
                    <th className="px-3 py-3 text-right">Prix Unitaire HT</th>
                    <th className="px-3 py-3 text-right text-blue-700">Prix TTC Calculé</th>
                    <th className="px-3 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {filteredAccessories.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-400 font-sans text-sm">
                        Aucun accessoire trouvé pour cette catégorie ou recherche
                      </td>
                    </tr>
                  ) : (
                    filteredAccessories.map(acc => {
                      const ttc = Math.round((acc.prix_unitaire_ht || 0) * (1 + settings.tva_default / 100) * 1000) / 1000;
                      const inStock = acc.stock_qty !== undefined && acc.stock_qty > 0;
                      const stockDefined = acc.stock_qty !== undefined;

                      return (
                        <tr key={acc.id} className="hover:bg-purple-50/40 transition">
                          <td className="px-4 py-3 font-bold text-gray-900 font-mono">{acc.id}</td>
                          <td className="px-4 py-3 font-sans">
                            <div className="font-bold text-gray-900">{acc.nom}</div>
                            {acc.description && (
                              <div className="text-xs text-gray-500 font-normal">{acc.description}</div>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center font-sans">
                            {getAccCategoryBadge(acc.categorie)}
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-gray-500 font-sans">
                            {acc.unite}
                          </td>
                          <td className="px-3 py-3 text-center font-sans">
                            {!stockDefined ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 border border-gray-200">
                                <Package className="w-3 h-3" /> —
                              </span>
                            ) : inStock ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Package className="w-3 h-3" /> {acc.stock_qty}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200 animate-pulse">
                                <AlertTriangle className="w-3 h-3" /> Cmd
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-right font-semibold text-gray-900">
                            {(acc.prix_unitaire_ht || 0).toFixed(3)} DT
                          </td>
                          <td className="px-3 py-3 text-right font-bold text-blue-700">
                            {ttc.toFixed(3)} DT
                          </td>
                          <td className="px-3 py-3 text-center font-sans">
                            <button
                              onClick={() => startEditAcc(acc)}
                              className="text-xs font-semibold text-purple-600 hover:text-purple-800 hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Modifier</span>
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
              Cette action écrasera toutes vos modifications manuelles de prix et de stocks sur les <span className="font-bold">{articles.length} profilés aluminium</span> et rétablira les valeurs du catalogue par défaut.
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
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Confirmer la réinitialisation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Reset M² Surfaces to Factory Modal                               */}
      {/* ========================================================================= */}
      {resetM2ModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <div className="p-2.5 bg-blue-100 rounded-xl">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Réinitialiser les tarifs M² ?</h3>
                <p className="text-xs text-gray-500">Stores, Moustiquaires, Vitrages & Finitions</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Êtes-vous sûr de vouloir restaurer les tarifs au mètre carré d'usine pour les lames de stores, coffres, axes, moustiquaires et vitrages ?
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
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restaurer les prix M²</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: Edit Single Aluminium Article                                    */}
      {/* ========================================================================= */}
      {editingArticle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-blue-600" />
                  <span>Modifier la référence : {editingArticle.reference}</span>
                </h3>
                <p className="text-xs text-gray-500 font-medium">{editingArticle.description}</p>
              </div>
              <button 
                onClick={() => setEditingArticle(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-semibold text-gray-700">Tarifs HT par couleur (la barre) :</div>
              {[
                { key: 'blanc', label: 'Blanc' },
                { key: 'gris', label: 'Gris' },
                { key: 'noir', label: 'Noir' },
                { key: 'couleur_mat', label: 'Couleur Mat' },
                { key: 'couleur_givre', label: 'Couleur Givré' }
              ].map(c => {
                const htVal = editPrices[c.key] || 0;
                const ttc = Math.round(htVal * (1 + settings.tva_default / 100) * 1000) / 1000;
                return (
                  <div key={c.key} className="grid grid-cols-2 items-center gap-3 bg-gray-50/70 p-2 rounded-xl border border-gray-100">
                    <label className="text-xs font-medium text-gray-700">{c.label} :</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editPrices[c.key] !== undefined ? editPrices[c.key] : ''}
                        onChange={e => setEditPrices(prev => ({ ...prev, [c.key]: parseFloat(e.target.value) || 0 }))}
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

              {/* Stock Quantity */}
              <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3 space-y-2 mt-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span>Quantité en stock (barres disponibles) :</span>
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={editStockQty}
                    onChange={e => setEditStockQty(e.target.value)}
                    placeholder="Laisser vide si non suivi"
                    min="0"
                    step="1"
                    className="w-36 bg-white border border-blue-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-1.5 text-xs">
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

      {/* ========================================================================= */}
      {/* MODAL 6: Simulation & Preview Confirmation for Accessoires                */}
      {/* ========================================================================= */}
      {previewAccModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${bulkAccDirection === 'increase' ? 'bg-purple-100 text-purple-700' : 'bg-rose-100 text-rose-700'}`}>
                  {bulkAccDirection === 'increase' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Confirmation de la simulation des accessoires & quincaillerie
                  </h3>
                  <p className="text-xs text-gray-500">
                    Vérifiez les nouveaux prix avant d'appliquer la mise à jour
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setPreviewAccModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-gray-500 block">Opération :</span>
                  <span className={`font-bold ${bulkAccDirection === 'increase' ? 'text-purple-600' : 'text-rose-600'}`}>
                    {bulkAccDirection === 'increase' ? 'Augmentation (+)' : 'Diminution (-)'} {bulkAccValue}{bulkAccMode === 'percent' ? '%' : ' DT'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Catégorie :</span>
                  <span className="font-bold text-gray-800">
                    {accCategories.find(c => c.id === bulkAccCategory)?.label || bulkAccCategory}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Articles affectés :</span>
                  <span className="font-bold text-purple-600">{affectedAccessories.length} accessoires</span>
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
                      <th className="px-3 py-2">Code & Nom</th>
                      <th className="px-2 py-2">Catégorie</th>
                      <th className="px-3 py-2 text-right">Ancien HT</th>
                      <th className="px-3 py-2 text-right text-purple-600">Nouveau HT</th>
                      <th className="px-3 py-2 text-right text-blue-600">Nouveau TTC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans">
                    {previewAccSamples.map(sample => (
                      <tr key={sample.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-bold text-gray-900">
                          {sample.nom}
                          <span className="block text-[10px] font-mono text-gray-500">{sample.id}</span>
                        </td>
                        <td className="px-2 py-2 text-gray-700">
                          {getAccCategoryBadge(sample.categorie)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-gray-500">{sample.origHt.toFixed(3)} DT</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-purple-700">{sample.newHt.toFixed(3)} DT</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-blue-700">{sample.newTtc.toFixed(3)} DT</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setPreviewAccModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmApplyBulkAcc}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirmer et enregistrer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: Reset Accessoires to Factory Modal                               */}
      {/* ========================================================================= */}
      {resetAccModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-purple-600">
              <div className="p-2.5 bg-purple-100 rounded-xl">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Restaurer les accessoires d'usine ?</h3>
                <p className="text-xs text-gray-500">Kits, serrures, crémones, joints et moteurs</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Cette action restaurera les prix d'origine et réinitialisera les stocks pour l'ensemble des <span className="font-bold">{accessories.length} articles de quincaillerie</span>.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setResetAccModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmResetAccCatalog}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Confirmer la réinitialisation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: Edit Single Accessoire Price & Stock                              */}
      {/* ========================================================================= */}
      {editingAccessory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-purple-600" />
                  <span>Modifier l'accessoire</span>
                </h3>
                <p className="text-xs text-gray-500 font-mono font-medium">{editingAccessory.id} — {editingAccessory.nom}</p>
              </div>
              <button 
                onClick={() => setEditingAccessory(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editingAccessory.description && (
              <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                {editingAccessory.description}
              </p>
            )}

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Prix Unitaire HT (DT par {editingAccessory.unite}) :
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={editAccPrice}
                    onChange={e => setEditAccPrice(e.target.value)}
                    step="0.001"
                    min="0"
                    autoFocus
                    className="w-full border border-gray-300 rounded-xl pl-3 pr-16 py-2.5 text-sm font-mono font-bold focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-500 text-xs font-bold">
                    DT / {editingAccessory.unite}
                  </span>
                </div>
              </div>

              {/* Live TTC Preview */}
              {(() => {
                const val = parseFloat(editAccPrice) || 0;
                const ttc = Math.round(val * (1 + settings.tva_default / 100) * 1000) / 1000;
                return (
                  <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-3 flex items-center justify-between text-xs">
                    <span className="text-purple-900 font-medium">Prix TTC calculé (TVA {settings.tva_default}%) :</span>
                    <span className="text-sm font-mono font-bold text-purple-700">{ttc.toFixed(3)} DT</span>
                  </div>
                );
              })()}

              {/* Stock input */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <label className="block text-xs font-bold text-gray-700">
                  Quantité en stock ({editingAccessory.unite}s) :
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={editAccStock}
                    onChange={e => setEditAccStock(e.target.value)}
                    placeholder="Laisser vide si non suivi"
                    min="0"
                    step="1"
                    className="w-36 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold focus:ring-2 focus:ring-purple-500"
                  />
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    editAccStock === '' ? 'bg-gray-100 text-gray-400'
                    : parseInt(editAccStock) > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-orange-50 text-orange-600 border border-orange-200'
                  }`}>
                    {editAccStock === '' ? 'Non suivi' : parseInt(editAccStock) > 0 ? 'En stock' : 'À commander'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEditingAccessory(null)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={saveAccEdit}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Enregistrer l'accessoire</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Cross-Section Zoom Modal */}
      {zoomProfil && (
        <div
          onClick={() => setZoomProfil(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-100 flex flex-col items-center"
          >
            <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span className="font-mono font-bold text-gray-900 text-sm">{zoomProfil}</span>
              </div>
              <button
                type="button"
                onClick={() => setZoomProfil(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full h-72 p-4 bg-gray-50/60 rounded-xl flex items-center justify-center border border-gray-200/60">
              <img
                src={getProfileImageUrl(zoomProfil)!}
                alt={`Coupe ${zoomProfil}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="mt-4 w-full flex items-center justify-between">
              <span className="text-[11px] text-gray-400">Coupe technique du profil</span>
              <button
                type="button"
                onClick={() => setZoomProfil(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
