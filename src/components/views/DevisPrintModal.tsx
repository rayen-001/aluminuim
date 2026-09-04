import React from 'react';
import { DevisRecord } from '../../context/AppContext';
import { useApp } from '../../context/AppContext';
import { renderAlumDrawing } from '../../utils/productDrawing';
import { FAMILIES, getProductTypesForFamily } from '../../data/productCatalog';
import { Printer, X, Download } from 'lucide-react';

interface DevisPrintModalProps {
  devis: DevisRecord;
  onClose: () => void;
}

export const DevisPrintModal: React.FC<DevisPrintModalProps> = ({ devis, onClose }) => {
  const { settings } = useApp();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Controls (Not printed) */}
        <div className="no-print px-6 py-4 bg-gray-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">Aperçu & Impression : {devis.numero}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer (PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body (Printable A4 Sheet) */}
        <div className="flex-1 p-8 sm:p-12 overflow-y-auto bg-white text-gray-900 printable-area space-y-6 text-sm">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-gray-200 pb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-blue-900">{settings.nom_atelier}</h1>
              <p className="text-xs text-gray-500 font-medium">{settings.activite}</p>
              <p className="text-xs text-gray-600 mt-1">Tél : {settings.telephone}</p>
              <p className="text-xs text-gray-600">Adresse : {settings.adresse}</p>
            </div>

            <div className="text-right">
              <div className="inline-block bg-blue-50 border border-blue-200 text-blue-900 px-4 py-2 rounded-xl text-right">
                <h2 className="text-lg font-bold">DEVIS #{devis.numero}</h2>
                <p className="text-xs text-gray-600">Date : {devis.date}</p>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Client :</p>
              <p className="text-base font-bold text-gray-900">{devis.client_nom || 'Client Particulier'}</p>
            </div>
            {devis.notes && (
              <div className="max-w-xs text-right">
                <p className="text-xs text-gray-500 font-semibold uppercase">Notes :</p>
                <p className="text-xs text-gray-700 italic">{devis.notes}</p>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b pb-1">
              Détails des articles et menuiseries
            </h3>

            <div className="space-y-6">
              {devis.items.map((it, idx) => {
                const cost = devis.totals.items_costs[idx];
                const fam = FAMILIES.find(f => f.id === it.family_id);
                const types = getProductTypesForFamily(it.family_id);
                const typeDef = types.find(t => t.id === it.product_type_id);

                let svg = '';
                if (!it.is_manual && it.family_id && it.product_type_id) {
                  let drawType = fam?.drawType || 'francaise';
                  if (typeDef?.category === 'chassi_fix') drawType = 'fixe';
                  if (typeDef?.category === 'garde_corps') drawType = 'garde_corps';
                  if (typeDef?.category === 'standalone_store') drawType = 'store';
                  if (typeDef?.category === 'standalone_mousti') drawType = 'mousti';

                  svg = renderAlumDrawing({
                    drawType,
                    largeur: parseFloat(String(it.largeur)) || 100,
                    hauteur: parseFloat(String(it.hauteur)) || 100,
                    couleur: it.couleur,
                    estPorte: typeDef?.category === 'porte',
                    partieFixeType: it.partie_fixe_type,
                    pfDim1: parseFloat(String(it.pf_dim_1)) || 0,
                    pfDim2: parseFloat(String(it.pf_dim_2)) || 0,
                    cotations: true,
                    svgW: 240,
                    svgH: 180,
                    responsive: false
                  });
                }

                return (
                  <div key={idx} className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">
                          {idx + 1}. {it.is_manual ? it.manual_nom : (typeDef?.name || `Produit ${idx + 1}`)}
                        </span>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-medium text-gray-600 capitalize">
                          {it.couleur}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600">
                        {it.hauteur && it.largeur ? `Dimensions : ${it.largeur} cm × ${it.hauteur} cm` : ''} • Quantité : <span className="font-bold">{it.quantity}</span>
                      </p>

                      {it.store_enabled && (
                        <p className="text-[11px] text-blue-700">
                          + Store rideau : {it.store_lame_type} ({it.store_couleur}) {it.store_coffre ? `avec ${it.store_coffre}` : ''}
                        </p>
                      )}

                      {it.mousti_enabled && (
                        <p className="text-[11px] text-emerald-700">+ Moustiquaire sur mesure incluse</p>
                      )}
                    </div>

                    {/* SVG Vector Drawing Sketch */}
                    {svg && (
                      <div
                        className="w-36 h-28 shrink-0 flex items-center justify-center bg-gray-50 rounded-lg p-1 border border-gray-100"
                        dangerouslySetInnerHTML={{ __html: svg }}
                      />
                    )}

                    {/* Cost */}
                    {cost && (
                      <div className="text-right shrink-0 font-mono">
                        <p className="text-xs text-gray-500">P.U HT : {cost.net_ht.toFixed(3)} DT</p>
                        <p className="text-base font-extrabold text-gray-900">{cost.total_ht.toFixed(3)} DT HT</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals Box */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <div className="w-64 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Total Net HT :</span>
                <span className="font-bold">{devis.totals.total_ht.toFixed(3)} DT</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>TVA ({devis.marges.tva}%) :</span>
                <span className="font-bold">{devis.totals.total_tva.toFixed(3)} DT</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-blue-900 border-t border-gray-300 pt-2">
                <span>TOTAL TTC :</span>
                <span>{devis.totals.total_ttc.toFixed(3)} DT</span>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="text-center text-[10px] text-gray-400 pt-6 border-t border-gray-100">
            <p>Devis valable pour une durée de 30 jours à compter de sa date d'émission.</p>
            <p>AtelierPro — Logiciel de gestion et de chiffrage pour ateliers de menuiserie aluminium.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
