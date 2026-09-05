import React, { useState } from 'react';
import { DevisItemState } from '../../utils/devisCalculator';
import { FAMILIES, getProductTypesForFamily } from '../../data/productCatalog';
import { renderAlumDrawing } from '../../utils/productDrawing';
import { Maximize2, X, Sparkles } from 'lucide-react';

interface ProductVisualizerProps {
  item: DevisItemState;
  className?: string;
  width?: number;
  height?: number;
  showDimensions?: boolean;
  interactive?: boolean;
}

export const ProductVisualizer: React.FC<ProductVisualizerProps> = ({
  item,
  className = '',
  width = 180,
  height = 140,
  showDimensions = true,
  interactive = true
}) => {
  const [showModal, setShowModal] = useState(false);

  const fam = FAMILIES.find(f => f.id === item.family_id);
  const types = getProductTypesForFamily(item.family_id);
  const typeDef = types.find(t => t.id === item.product_type_id);
  const typeName = (typeDef?.name || item.manual_nom || '').toLowerCase();

  let drawType = fam?.drawType || 'francaise';
  if (typeDef?.category === 'chassi_fix') drawType = 'fixe';
  if (typeDef?.category === 'garde_corps') drawType = 'garde_corps';
  if (typeDef?.category === 'standalone_store') drawType = 'store';
  if (typeDef?.category === 'standalone_mousti') drawType = 'mousti';

  let nbVantaux = 1;
  const match = typeName.match(/(\d+)\s*vantaux/i);
  if (match) nbVantaux = parseInt(match[1]);
  else if (drawType === 'coulissante' || typeName.includes('2') || typeName.includes('couliss')) nbVantaux = 2;

  const isPorte = typeDef?.category === 'porte' || typeName.includes('porte');

  const svgSmall = renderAlumDrawing({
    drawType,
    largeur: parseFloat(String(item.largeur)) || 100,
    hauteur: parseFloat(String(item.hauteur)) || 100,
    nbVantaux,
    couleur: item.couleur || 'blanc',
    estPorte: isPorte,
    partieFixeType: item.partie_fixe_type || 'Sans',
    pfDim1: parseFloat(String(item.pf_dim_1)) || 0,
    pfDim2: parseFloat(String(item.pf_dim_2)) || 0,
    gcKind: typeName.includes('vitré') ? 'vitre' : (typeName.includes('sabot') ? 'corpsen_sabot' : (typeName.includes('corpsen') ? 'corpsen' : 'linaire')),
    chassiMontants: item.chassi_montant_enabled ? (item.chassi_montant_qty || 1) : 0,
    chassiTraverses: item.chassi_traverse_enabled ? (item.chassi_traverse_qty || 1) : 0,
    chassiSocleWide: ['40121', '40154', 'AE_40121', 'AE_40154'].includes(item.chassi_socle_ref || ''),
    serrureTraverse: item.supplements?.some(s => s.toLowerCase().includes('traverse')),
    typeOuverture: item.ouverture_type === 'Basculante' ? 'basculante' : (item.ouverture_type === 'Osilobattante' ? 'oscillo' : 'francaise'),
    store_enabled: item.store_enabled || false,
    store_coffre: item.store_coffre || '',
    store_couleur: item.store_couleur || '',
    store_lame_type: item.store_lame_type || '',
    mousti_enabled: item.mousti_enabled || false,
    remplissage_id: item.remplissage_id,
    vitrage_type: item.vitrage_type,
    motif_id: item.motif_id,
    cotations: false,
    svgW: 240,
    svgH: 180,
    responsive: true
  });

  const svgModal = renderAlumDrawing({
    drawType,
    largeur: parseFloat(String(item.largeur)) || 100,
    hauteur: parseFloat(String(item.hauteur)) || 100,
    nbVantaux,
    couleur: item.couleur || 'blanc',
    estPorte: isPorte,
    partieFixeType: item.partie_fixe_type || 'Sans',
    pfDim1: parseFloat(String(item.pf_dim_1)) || 0,
    pfDim2: parseFloat(String(item.pf_dim_2)) || 0,
    gcKind: typeName.includes('vitré') ? 'vitre' : (typeName.includes('sabot') ? 'corpsen_sabot' : (typeName.includes('corpsen') ? 'corpsen' : 'linaire')),
    chassiMontants: item.chassi_montant_enabled ? (item.chassi_montant_qty || 1) : 0,
    chassiTraverses: item.chassi_traverse_enabled ? (item.chassi_traverse_qty || 1) : 0,
    chassiSocleWide: ['40121', '40154', 'AE_40121', 'AE_40154'].includes(item.chassi_socle_ref || ''),
    serrureTraverse: item.supplements?.some(s => s.toLowerCase().includes('traverse')),
    typeOuverture: item.ouverture_type === 'Basculante' ? 'basculante' : (item.ouverture_type === 'Osilobattante' ? 'oscillo' : 'francaise'),
    store_enabled: item.store_enabled || false,
    store_coffre: item.store_coffre || '',
    store_couleur: item.store_couleur || '',
    store_lame_type: item.store_lame_type || '',
    mousti_enabled: item.mousti_enabled || false,
    remplissage_id: item.remplissage_id,
    vitrage_type: item.vitrage_type,
    motif_id: item.motif_id,
    cotations: true,
    svgW: 520,
    svgH: 400,
    responsive: true
  });

  return (
    <>
      <div 
        className={`relative group bg-gradient-to-b from-slate-50 to-slate-100/90 rounded-xl border border-slate-200/90 p-2 shadow-2xs hover:shadow-xs hover:border-blue-400 transition flex flex-col items-center justify-center overflow-hidden select-none ${className}`}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {/* Vector SVG View */}
        <div 
          className="w-full h-full flex items-center justify-center pointer-events-none"
          dangerouslySetInnerHTML={{ __html: svgSmall }}
        />

        {/* Crisp Dimension Tag Bar */}
        {showDimensions && item.largeur && item.hauteur && (
          <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
            <span className="text-[10px] font-mono font-bold bg-white/90 text-gray-800 px-1.5 py-0.5 rounded shadow-2xs border border-gray-200 backdrop-blur-xs">
              {item.largeur}×{item.hauteur}
            </span>
            <span className="text-[9px] font-semibold bg-blue-600/90 text-white px-1.5 py-0.5 rounded shadow-2xs backdrop-blur-xs">
              {item.quantity} {item.quantity > 1 ? 'pcs' : 'pc'}
            </span>
          </div>
        )}

        {/* Hover Zoom Button */}
        {interactive && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
            title="Agrandir l'aperçu HD avec cotations"
            className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 bg-white/90 hover:bg-blue-600 hover:text-white text-gray-700 p-1 rounded-md shadow-xs transition border border-gray-200"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Full Size Modal Preview */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 text-base">
                  {item.is_manual ? item.manual_nom : (typeDef?.name || 'Aperçu Menuiserie HD')}
                </h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Big Preview */}
            <div className="bg-gradient-to-b from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-4 flex items-center justify-center min-h-[300px]">
              <div 
                className="w-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: svgModal }}
              />
            </div>

            {/* Details Badges */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <span className="text-gray-500 font-medium">Dimensions :</span>
                <p className="font-mono font-bold text-gray-900">{item.largeur} cm × {item.hauteur} cm</p>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <span className="text-gray-500 font-medium">Couleur profil :</span>
                <p className="font-bold text-gray-900 capitalize">{(item.couleur || 'blanc').replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
