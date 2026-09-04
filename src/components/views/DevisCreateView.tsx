import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FAMILIES, 
  REMPLISSAGES, 
  MOTIFS, 
  getProductTypesForFamily, 
  ProductTypeDef,
  CHASSI_FIX_REFS_DEFAULT,
  CHASSI_FIX_REFS_ALUCO,
  CHASSI_FIX_REFS_ALUECO
} from '../../data/productCatalog';
import { renderAlumDrawing, DrawingParams } from '../../utils/productDrawing';
import { DevisItemState, calculateDevisTotals } from '../../utils/devisCalculator';
import { FicheAtelierModal } from './FicheAtelierModal';
import { 
  Plus, 
  Copy, 
  Trash2, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft, 
  FileText, 
  Maximize2,
  AlertCircle,
  Eye,
  Scissors
} from 'lucide-react';

interface DevisCreateViewProps {
  editDevisId?: string | null;
  setCurrentTab: (tab: string) => void;
  onSaved?: (devisId: string) => void;
}

export const DevisCreateView: React.FC<DevisCreateViewProps> = ({
  editDevisId,
  setCurrentTab,
  onSaved
}) => {
  const { clients, articlesMap, devisList, saveDevis, settings } = useApp();

  const existingDevis = editDevisId ? devisList.find(d => d.id === editDevisId) : null;

  const [clientId, setClientId] = useState(existingDevis?.client_id || '');
  const [date, setDate] = useState(existingDevis?.date || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(existingDevis?.notes || '');
  const [ficheOpen, setFicheOpen] = useState(false);

  const [margeType, setMargeType] = useState<'percent' | 'dt'>(existingDevis?.marges.margeType || 'percent');
  const [margeValue, setMargeValue] = useState<number>(existingDevis?.marges.margeValue || 0);

  const [margeGcType, setMargeGcType] = useState<'percent' | 'dt'>(existingDevis?.marges.margeGcType || 'percent');
  const [margeGcValue, setMargeGcValue] = useState<number>(existingDevis?.marges.margeGcValue || 0);

  const [margeMoustiType, setMargeMoustiType] = useState<'percent' | 'dt'>(existingDevis?.marges.margeMoustiType || 'percent');
  const [margeMoustiValue, setMargeMoustiValue] = useState<number>(existingDevis?.marges.margeMoustiValue || 0);

  const [margeStoreType, setMargeStoreType] = useState<'percent' | 'dt'>(existingDevis?.marges.margeStoreType || 'percent');
  const [margeStoreValue, setMargeStoreValue] = useState<number>(existingDevis?.marges.margeStoreValue || 0);

  const [tvaRate, setTvaRate] = useState<number>(existingDevis?.marges.tva ?? settings.tva_default);

  const createInitialItem = (): DevisItemState => ({
    _uid: `${Date.now()}_${Math.random()}`,
    is_manual: false,
    hauteur: '',
    largeur: '',
    quantity: 1,
    family_id: '',
    product_type_id: '',
    couleur: 'blanc',
    remplissage_id: '',
    vitrage_type: 'simple',
    motif_id: '',
    ouverture_type: '',
    supplements: [],
    fast_lock_points: '1',
    comp_ouvrant_ref: '',
    comp_dormant_ref: '',
    comp_traverse_ref: '',
    comp_parclose_ref: '',
    comp_lateral_qty: {},
    comp_central_qty: {},
    comp_seuil_ref: '',
    partie_fixe_type: 'Sans',
    pf_dim_1: '',
    pf_dim_2: '',
    sans_couvre_joint: false,
    couvre_joint_type: '',
    store_enabled: false,
    store_lame_type: 'lame inj 55',
    store_couleur: 'Blanc',
    store_coffre: '',
    mousti_enabled: false,
    mousti_hauteur: '',
    mousti_largeur: '',
    _showErrors: false
  });

  const [items, setItems] = useState<DevisItemState[]>(() => {
    if (existingDevis?.items && existingDevis.items.length > 0) {
      return JSON.parse(JSON.stringify(existingDevis.items));
    }
    return [createInitialItem()];
  });

  const [validationError, setValidationError] = useState('');

  // Marges bundle for calculations
  const margesConfig = {
    margeType,
    margeValue,
    margeGcType,
    margeGcValue,
    margeMoustiType,
    margeMoustiValue,
    margeStoreType,
    margeStoreValue,
    tva: tvaRate
  };

  // Live Totals calculation
  const totals = calculateDevisTotals(items, articlesMap, margesConfig);

  const addItem = () => {
    setItems(prev => [...prev, createInitialItem()]);
  };

  const addManualItem = () => {
    setItems(prev => [
      ...prev,
      {
        _uid: `${Date.now()}_${Math.random()}`,
        is_manual: true,
        manual_nom: '',
        manual_designation: '',
        hauteur: '',
        largeur: '',
        quantity: 1,
        manual_unit_price: '',
        family_id: '',
        product_type_id: '',
        couleur: 'blanc',
        remplissage_id: '',
        vitrage_type: 'simple',
        motif_id: '',
        supplements: [],
        _showErrors: false
      }
    ]);
  };

  const duplicateItem = (idx: number) => {
    const clone = JSON.parse(JSON.stringify(items[idx]));
    clone._uid = `${Date.now()}_${Math.random()}`;
    setItems(prev => {
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      return next;
    });
  };

  const removeItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, updates: Partial<DevisItemState>) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...updates } : it));
  };

  const handleFamilyChange = (idx: number, familyId: string) => {
    const types = getProductTypesForFamily(familyId);
    const firstType = types[0];
    updateItem(idx, {
      family_id: familyId,
      product_type_id: firstType ? firstType.id : '',
      hauteur: items[idx].hauteur || 140,
      largeur: items[idx].largeur || 120
    });
    if (firstType) {
      applyTypeOptions(idx, firstType, familyId);
    }
  };

  const handleTypeChange = (idx: number, typeId: string) => {
    const famId = items[idx].family_id;
    const types = getProductTypesForFamily(famId);
    const typeDef = types.find(t => t.id === typeId);
    if (!typeDef) return;
    updateItem(idx, { product_type_id: typeId });
    applyTypeOptions(idx, typeDef, famId);
  };

  const applyTypeOptions = (idx: number, typeDef: ProductTypeDef, familyId: string) => {
    const isChassi = typeDef.category === 'chassi_fix';
    const isGardeCorps = typeDef.category === 'garde_corps';
    const isStore = typeDef.category === 'standalone_store';
    const isMousti = typeDef.category === 'standalone_mousti';
    const isPorte = typeDef.category === 'porte' || typeDef.name.toLowerCase().startsWith('porte');

    const fam = FAMILIES.find(f => f.id === familyId);
    const isAluco = fam?.group === 'ALUCO';
    const isAluEco = fam?.group === 'ALU ECO';

    let chassiRefs = CHASSI_FIX_REFS_DEFAULT;
    if (isAluco) chassiRefs = CHASSI_FIX_REFS_ALUCO;
    if (isAluEco) chassiRefs = CHASSI_FIX_REFS_ALUECO;

    const comp = typeDef.composition;

    updateItem(idx, {
      is_chassi_fix: isChassi,
      is_garde_corps: isGardeCorps,
      chassi_cadre_ref: chassiRefs.cadre[0],
      chassi_socle_ref: chassiRefs.socle[0],
      chassi_montant_ref: chassiRefs.montant[0],
      chassi_traverse_ref: chassiRefs.traverse[0],
      comp_dormant_ref: comp?.dormant.default || '',
      comp_ouvrant_ref: comp?.ouvrant.default || '',
      comp_parclose_ref: comp?.parclose.simple.default || '',
      comp_traverse_ref: comp?.traverse.default || '',
      comp_lateral_qty: comp?.lateral ? { [comp.lateral.default]: comp.lateral.count } : {},
      comp_central_qty: comp?.central ? { [comp.central.default]: comp.central.count } : {},
      comp_seuil_ref: (comp?.dormant_composite && comp.dormant_composite[comp.dormant.default]) ? comp.dormant_composite[comp.dormant.default][0] : '',
      store_enabled: isStore,
      mousti_enabled: isMousti,
      gc_nb_poteaux: isGardeCorps ? 3 : undefined,
      gc_nb_lignes: isGardeCorps ? 4 : undefined,
      gc_fin_type: isGardeCorps ? 'Support Mur' : undefined,
      gc_fin_qty: isGardeCorps ? 2 : undefined,
      gc_ongle: isGardeCorps ? '90°' : undefined
    });
  };

  const getDrawingSVG = (item: DevisItemState): string => {
    if (item.is_manual || !item.family_id || !item.product_type_id) return '';
    const fam = FAMILIES.find(f => f.id === item.family_id);
    const types = getProductTypesForFamily(item.family_id);
    const typeDef = types.find(t => t.id === item.product_type_id);
    if (!typeDef) return '';

    let drawType = fam?.drawType || 'francaise';
    if (typeDef.category === 'chassi_fix') drawType = 'fixe';
    if (typeDef.category === 'garde_corps') drawType = 'garde_corps';
    if (typeDef.category === 'standalone_store') drawType = 'store';
    if (typeDef.category === 'standalone_mousti') drawType = 'mousti';

    let nbVantaux = 1;
    const match = typeDef.name.match(/(\d+)\s*vantaux/i);
    if (match) nbVantaux = parseInt(match[1]);

    const isPorte = typeDef.category === 'porte' || typeDef.name.toLowerCase().startsWith('porte');

    const params: DrawingParams = {
      drawType,
      largeur: parseFloat(String(item.largeur)) || 120,
      hauteur: parseFloat(String(item.hauteur)) || 140,
      nbVantaux,
      couleur: item.couleur || 'blanc',
      estPorte: isPorte,
      partieFixeType: item.partie_fixe_type || 'Sans',
      pfDim1: parseFloat(String(item.pf_dim_1)) || 0,
      pfDim2: parseFloat(String(item.pf_dim_2)) || 0,
      gcKind: typeDef.name.includes('Vitré') ? 'vitre' : (typeDef.name.includes('Sabot') ? 'corpsen_sabot' : (typeDef.name.includes('Corpsen') ? 'corpsen' : 'linaire')),
      chassiMontants: item.chassi_montant_enabled ? (item.chassi_montant_qty || 1) : 0,
      chassiTraverses: item.chassi_traverse_enabled ? (item.chassi_traverse_qty || 1) : 0,
      chassiSocleWide: ['40121', '40154', 'AE_40121', 'AE_40154'].includes(item.chassi_socle_ref || ''),
      serrureTraverse: item.supplements?.some(s => s.toLowerCase().includes('traverse')),
      typeOuverture: item.ouverture_type === 'Basculante' ? 'basculante' : (item.ouverture_type === 'Osilobattante' ? 'oscillo' : 'francaise'),
      storeCoffre: item.store_enabled ? !!item.store_coffre : true,
      cotations: true,
      svgW: 500,
      svgH: 430
    };

    return renderAlumDrawing(params);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Mark errors
    let hasError = false;
    const checkedItems = items.map(item => {
      if (item.is_manual) {
        if (!item.manual_nom || !item.manual_unit_price || Number(item.quantity) < 1) {
          hasError = true;
          return { ...item, _showErrors: true };
        }
      } else {
        if (!item.family_id || !item.product_type_id || !item.hauteur || !item.largeur || Number(item.quantity) < 1) {
          hasError = true;
          return { ...item, _showErrors: true };
        }
      }
      return { ...item, _showErrors: false };
    });

    setItems(checkedItems);

    if (hasError) {
      setValidationError('Veuillez remplir tous les champs obligatoires marqués d’un astérisque rouge (*).');
      return;
    }

    const selectedClient = clients.find(c => c.id === clientId);

    const saved = saveDevis({
      id: existingDevis?.id,
      client_id: clientId,
      client_nom: selectedClient ? selectedClient.nom : 'Sans client',
      date,
      notes,
      items,
      marges: margesConfig,
      totals,
      status: existingDevis?.status || 'brouillon'
    });

    if (onSaved) {
      onSaved(saved.id);
    } else {
      setCurrentTab('devis');
    }
  };

  return (
    <div className="p-3 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setCurrentTab('devis')}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {existingDevis ? `Modifier Devis ${existingDevis.numero}` : 'Nouveau Devis Aluminium'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Remplissez les détails et dimensions des menuiseries
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setFicheOpen(true)}
          className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3.5 py-2 rounded-xl text-xs font-bold transition border border-blue-200"
        >
          <Scissors className="w-4 h-4" />
          <span>Fiche Découpage & Débit (Atelier)</span>
        </button>
      </div>

      {validationError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Informations Générales */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Informations générales</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Client</label>
              <select
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Sans client —</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nom} ({c.telephone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes & Remarques</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Spécifications chantier, accès, couleur spéciale..."
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Section 2: Produits Commandés */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-4 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Produits commandés ({items.length})</span>
            </h2>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un produit</span>
              </button>
              <button
                type="button"
                onClick={addManualItem}
                className="flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ligne libre</span>
              </button>
            </div>
          </div>

          {/* Items Loop */}
          <div className="space-y-6">
            {items.map((item, index) => {
              const types = getProductTypesForFamily(item.family_id);
              const svgContent = getDrawingSVG(item);
              const itemCost = totals.items_costs[index];

              return (
                <div
                  key={item._uid}
                  className={`rounded-2xl border transition-all p-4 sm:p-5 relative ${
                    item.is_manual
                      ? 'border-purple-200 bg-purple-50/40'
                      : 'border-gray-200 bg-gray-50/50'
                  }`}
                >
                  {/* Item Actions (Duplicate, Delete) */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => duplicateItem(index)}
                      title="Dupliquer ce produit"
                      className="p-1.5 text-orange-500 hover:text-orange-700 bg-white border border-gray-200 rounded-lg hover:shadow-xs transition"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        title="Supprimer ce produit"
                        className="p-1.5 text-red-500 hover:text-red-700 bg-white border border-gray-200 rounded-lg hover:shadow-xs transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Header Title */}
                  <div className="mb-4">
                    <span className={`text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                      item.is_manual ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.is_manual ? `Ligne libre ${index + 1}` : `Produit ${index + 1}`}
                    </span>
                  </div>

                  {/* Manual Line vs Standard Product */}
                  {item.is_manual ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nom du produit <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={item.manual_nom || ''}
                          onChange={e => updateItem(index, { manual_nom: e.target.value })}
                          placeholder="Ex: Porte blindée, Quincaillerie spécifique..."
                          className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Désignation / Description
                        </label>
                        <input
                          type="text"
                          value={item.manual_designation || ''}
                          onChange={e => updateItem(index, { manual_designation: e.target.value })}
                          placeholder="Détails, couleur, quincaillerie..."
                          className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Hauteur (cm)</label>
                        <input
                          type="number"
                          value={item.hauteur || ''}
                          onChange={e => updateItem(index, { hauteur: e.target.value })}
                          placeholder="Optionnel"
                          className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Largeur (cm)</label>
                        <input
                          type="number"
                          value={item.largeur || ''}
                          onChange={e => updateItem(index, { largeur: e.target.value })}
                          placeholder="Optionnel"
                          className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Quantité <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity || 1}
                          onChange={e => updateItem(index, { quantity: parseInt(e.target.value) || 1 })}
                          className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Prix unitaire (DT HT) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={item.manual_unit_price || ''}
                          onChange={e => updateItem(index, { manual_unit_price: e.target.value })}
                          placeholder="0.000"
                          className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-purple-500"
                        />
                        <p className="text-[11px] text-purple-600 font-medium mt-1">
                          ⚠ Aucune marge appliquée — incluez votre marge directement dans ce prix.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Family & Product Type */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Famille <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={item.family_id}
                            onChange={e => handleFamilyChange(index, e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">— Choisir une famille —</option>
                            <optgroup label="TPR">
                              <option value="50">A la française TPR S40</option>
                              <option value="51">A la française TPR EX45</option>
                              <option value="60">Coulissante TPR S67</option>
                              <option value="61">Coulissante TPR EX60</option>
                            </optgroup>
                            <optgroup label="ALU ECO (PALMA, PRAL...)">
                              <option value="63">A la française Alu Eco S40</option>
                              <option value="64">A la française Alu Eco EX45</option>
                              <option value="65">Coulissante Alu Eco S67</option>
                              <option value="66">Coulissante Alu Eco EX60</option>
                            </optgroup>
                            <optgroup label="ALUCO">
                              <option value="52">A la française Aluco SQ40</option>
                              <option value="62">Coulissante Aluco Square 67</option>
                            </optgroup>
                            <optgroup label="Autres">
                              <option value="46">Garde Corps</option>
                              <option value="67">Store Rideaux</option>
                              <option value="68">Moustiquaire</option>
                            </optgroup>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Type de produit <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={item.product_type_id}
                            onChange={e => handleTypeChange(index, e.target.value)}
                            disabled={!types.length}
                            className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          >
                            <option value="">— Choisir un type —</option>
                            {types.map(t => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Dimensions & Color */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Hauteur (cm) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="1"
                            value={item.hauteur || ''}
                            onChange={e => updateItem(index, { hauteur: e.target.value })}
                            placeholder="Ex: 140"
                            className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Largeur (cm) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="1"
                            value={item.largeur || ''}
                            onChange={e => updateItem(index, { largeur: e.target.value })}
                            placeholder="Ex: 120"
                            className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Quantité</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity || 1}
                            onChange={e => updateItem(index, { quantity: parseInt(e.target.value) || 1 })}
                            className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Couleur</label>
                          <select
                            value={item.couleur || 'blanc'}
                            onChange={e => updateItem(index, { couleur: e.target.value as any })}
                            className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="blanc">Laqué Blanc</option>
                            <option value="gris">Laqué Gris</option>
                            <option value="noir">Laqué Noir 9005</option>
                            <option value="couleur_mat">Laqué Couleur Mat</option>
                            <option value="couleur_givre">Laqué Couleur Givré</option>
                          </select>
                        </div>
                      </div>

                      {/* Remplissage + Vitrage + Motif */}
                      {!item.is_garde_corps && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Remplissage</label>
                            <select
                              value={item.remplissage_id || ''}
                              onChange={e => updateItem(index, { remplissage_id: e.target.value })}
                              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">— Choisir un remplissage —</option>
                              {REMPLISSAGES.map(r => (
                                <option key={r.id} value={r.id}>
                                  {r.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Vitrage</label>
                            <select
                              value={item.vitrage_type || 'simple'}
                              onChange={e => updateItem(index, { vitrage_type: e.target.value as any })}
                              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="simple">Simple vitrage</option>
                              <option value="double">Double vitrage</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Motif</label>
                            <select
                              value={item.motif_id || ''}
                              onChange={e => updateItem(index, { motif_id: e.target.value })}
                              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">— Sans motif —</option>
                              {MOTIFS.map(m => (
                                <option key={m.id} value={m.id}>
                                  {m.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Suppléments Quincaillerie */}
                      {!item.is_chassi_fix && !item.is_garde_corps && (
                        <div className="flex flex-wrap items-center gap-4 pt-1">
                          <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.supplements?.includes('Fast Lock')}
                              onChange={e => {
                                const sups = item.supplements || [];
                                updateItem(index, {
                                  supplements: e.target.checked
                                    ? [...sups, 'Fast Lock']
                                    : sups.filter(s => s !== 'Fast Lock')
                                });
                              }}
                              className="rounded text-blue-600"
                            />
                            <span>Fast Lock</span>
                          </label>

                          {item.supplements?.includes('Fast Lock') && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600">Points :</span>
                              <select
                                value={item.fast_lock_points || '1'}
                                onChange={e => updateItem(index, { fast_lock_points: e.target.value })}
                                className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs"
                              >
                                <option value="1">1 point</option>
                                <option value="2">2 points</option>
                                <option value="3">3 points</option>
                              </select>
                            </div>
                          )}

                          <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.supplements?.includes('Traverse')}
                              onChange={e => {
                                const sups = item.supplements || [];
                                updateItem(index, {
                                  supplements: e.target.checked
                                    ? [...sups, 'Traverse']
                                    : sups.filter(s => s !== 'Traverse')
                                });
                              }}
                              className="rounded text-blue-600"
                            />
                            <span>Traverse</span>
                          </label>
                        </div>
                      )}

                      {/* Store Rideau Option */}
                      {!item.is_garde_corps && (
                        <div className="pt-2 border-t border-gray-200/80">
                          <label className="flex items-center space-x-2 text-xs font-semibold text-gray-800 cursor-pointer w-fit">
                            <input
                              type="checkbox"
                              checked={item.store_enabled || false}
                              onChange={e => updateItem(index, { store_enabled: e.target.checked })}
                              className="rounded text-blue-600"
                            />
                            <span>Store Rideau</span>
                          </label>

                          {item.store_enabled && (
                            <div className="mt-2 bg-blue-50/70 border border-blue-200 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Type de lame</label>
                                <select
                                  value={item.store_lame_type || 'lame inj 55'}
                                  onChange={e => updateItem(index, { store_lame_type: e.target.value })}
                                  className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs"
                                >
                                  <option value="lame inj 55">Lame injectée 55mm</option>
                                  <option value="lame inj 45">Lame injectée 45mm</option>
                                  <option value="lame inj 42">Lame injectée 42mm</option>
                                  <option value="lame extrud">Lame extrudée</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Couleur store</label>
                                <select
                                  value={item.store_couleur || 'Blanc'}
                                  onChange={e => updateItem(index, { store_couleur: e.target.value })}
                                  className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs"
                                >
                                  <option value="Blanc">Blanc</option>
                                  <option value="Noir">Noir</option>
                                  <option value="Gris">Gris</option>
                                  <option value="Effet Bois">Effet Bois</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Coffre</label>
                                <select
                                  value={item.store_coffre || ''}
                                  onChange={e => updateItem(index, { store_coffre: e.target.value })}
                                  className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs"
                                >
                                  <option value="">— Sans coffre —</option>
                                  <option value="Coffre alu 15">Coffre alu 15</option>
                                  <option value="Coffre alu 20">Coffre alu 20</option>
                                  <option value="Coffre alu 25">Coffre alu 25</option>
                                  <option value="Coffre PVC">Coffre PVC</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Moustiquaire Option */}
                      {!item.is_garde_corps && (
                        <div className="pt-1">
                          <label className="flex items-center space-x-2 text-xs font-semibold text-gray-800 cursor-pointer w-fit">
                            <input
                              type="checkbox"
                              checked={item.mousti_enabled || false}
                              onChange={e => updateItem(index, { mousti_enabled: e.target.checked })}
                              className="rounded text-emerald-600"
                            />
                            <span>Moustiquaire</span>
                          </label>
                        </div>
                      )}

                      {/* Live SVG Drawing Preview */}
                      {svgContent && (
                        <div className="mt-4 rounded-xl border border-blue-100 bg-gradient-to-br from-slate-50 via-white to-blue-50/50 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5" />
                              Aperçu produit temps réel
                            </span>
                            <span className="text-xs font-mono font-bold text-gray-500">
                              {item.largeur || '—'} × {item.hauteur || '—'} cm
                            </span>
                          </div>
                          <div
                            className="flex justify-center max-h-[300px] overflow-hidden"
                            dangerouslySetInnerHTML={{ __html: svgContent }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Individual Item Subtotal */}
                  {itemCost && (
                    <div className="mt-4 pt-3 border-t border-gray-200/80 flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-semibold text-gray-600">
                        Sous-total ({item.quantity} unité{item.quantity > 1 ? 's' : ''}) :
                      </span>
                      <span className="font-mono font-bold text-gray-900 text-base">
                        {itemCost.total_ht.toFixed(3)} DT HT
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Item Bottom Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={addItem}
              className="flex items-center justify-center gap-2 border-2 border-dashed border-blue-200 hover:border-blue-400 text-blue-600 hover:bg-blue-50 py-3 rounded-xl text-xs sm:text-sm font-semibold transition"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un autre produit</span>
            </button>
            <button
              type="button"
              onClick={addManualItem}
              className="flex items-center justify-center gap-2 border-2 border-dashed border-purple-300 hover:border-purple-500 text-purple-600 hover:bg-purple-50 py-3 rounded-xl text-xs sm:text-sm font-semibold transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ajouter une ligne libre</span>
            </button>
          </div>
        </div>

        {/* Section 3: Marges & TVA */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-4 sm:p-6 space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
            Marges & TVA <span className="text-xs font-normal text-gray-500">(optionnel)</span>
          </h2>

          <div className="space-y-3">
            {/* Fenêtres / Portes */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs sm:text-sm font-semibold text-gray-700 w-36">Fenêtres / Portes :</span>
              <select
                value={margeType}
                onChange={e => setMargeType(e.target.value as any)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm"
              >
                <option value="percent">Pourcentage (%)</option>
                <option value="dt">Montant fixe (DT)</option>
              </select>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={margeValue || ''}
                  onChange={e => setMargeValue(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-24 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-mono font-bold"
                />
                <span className="absolute right-2.5 top-1.5 text-gray-400 text-xs">{margeType === 'percent' ? '%' : 'DT'}</span>
              </div>
            </div>

            {/* Store Rideau */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs sm:text-sm font-semibold text-gray-700 w-36">Store Rideau :</span>
              <select
                value={margeStoreType}
                onChange={e => setMargeStoreType(e.target.value as any)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm"
              >
                <option value="percent">Pourcentage (%)</option>
                <option value="dt">Montant fixe (DT)</option>
              </select>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={margeStoreValue || ''}
                  onChange={e => setMargeStoreValue(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-24 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-mono font-bold"
                />
                <span className="absolute right-2.5 top-1.5 text-gray-400 text-xs">{margeStoreType === 'percent' ? '%' : 'DT'}</span>
              </div>
            </div>

            {/* TVA */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100">
              <span className="text-xs sm:text-sm font-semibold text-gray-700 w-36">TVA :</span>
              <select
                value={tvaRate}
                onChange={e => setTvaRate(parseFloat(e.target.value) || 0)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold"
              >
                <option value="0">Sans TVA (0%)</option>
                <option value="7">TVA 7%</option>
                <option value="13">TVA 13%</option>
                <option value="19">TVA 19%</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Totals Summary & Submit Bar */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto font-mono">
            <div>
              <p className="text-[11px] text-blue-200 uppercase tracking-wider font-sans">Total Brut HT</p>
              <p className="text-base font-bold">{totals.total_brut_ht.toFixed(3)} DT</p>
            </div>
            <div>
              <p className="text-[11px] text-blue-200 uppercase tracking-wider font-sans">Total Marge</p>
              <p className="text-base font-bold text-amber-300">+{totals.total_marge.toFixed(3)} DT</p>
            </div>
            <div>
              <p className="text-[11px] text-blue-200 uppercase tracking-wider font-sans">Total Net HT</p>
              <p className="text-base font-bold">{totals.total_ht.toFixed(3)} DT</p>
            </div>
            <div>
              <p className="text-[11px] text-emerald-300 uppercase tracking-wider font-sans">Total TTC</p>
              <p className="text-xl font-extrabold text-emerald-400">{totals.total_ttc.toFixed(3)} DT</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => setCurrentTab('devis')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm shadow-md transition"
            >
              {existingDevis ? 'Enregistrer les modifications' : 'Créer le devis'}
            </button>
          </div>
        </div>
      </form>

      {/* Fiche Atelier (ALU CALCUL) Live Modal */}
      {ficheOpen && (
        <FicheAtelierModal
          devis={{
            id: existingDevis?.id || 'temp_devis',
            numero: existingDevis?.numero || 'DEV-EN-COURS',
            client_nom: clients.find(c => c.id === clientId)?.nom || 'Client Devis',
            date,
            items,
            marges: {
              margeType,
              margeValue,
              margeGcType,
              margeGcValue,
              margeMoustiType,
              margeMoustiValue,
              margeStoreType,
              margeStoreValue,
              tva: tvaRate
            },
            totals,
            status: 'brouillon',
            created_at: new Date().toISOString()
          }}
          onClose={() => setFicheOpen(false)}
        />
      )}
    </div>
  );
};
