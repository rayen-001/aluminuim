import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { DevisRecord } from '../../context/AppContext';
import { useApp } from '../../context/AppContext';
import { renderAlumDrawing } from '../../utils/productDrawing';
import { FAMILIES, getProductTypesForFamily } from '../../data/productCatalog';
import { calculateDevisTotals } from '../../utils/devisCalculator';
import { Printer, X, User } from 'lucide-react';

interface DevisPrintModalProps {
  devis: DevisRecord;
  onClose: () => void;
}

export const DevisPrintModal: React.FC<DevisPrintModalProps> = ({ devis, onClose }) => {
  const { settings, clients, articlesMap } = useApp();

  const handlePrint = () => {
    window.print();
  };

  // Re-calculate totals on the fly to guarantee exact breakdown
  const liveTotals = useMemo(() => {
    try {
      return calculateDevisTotals(devis.items, articlesMap, devis.marges);
    } catch (e) {
      console.error('Error recalculating devis totals:', e);
      return devis.totals;
    }
  }, [devis.items, devis.marges, articlesMap, devis.totals]);

  const clientObj = clients.find(c => c.id === devis.client_id || c.nom.toLowerCase() === (devis.client_nom || '').toLowerCase());

  const modalElement = (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-2 sm:p-4 overflow-y-auto backdrop-blur-xs print:p-0 print:bg-white print:static print:block print:overflow-visible print:h-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 print:max-h-none print:h-auto print:overflow-visible print:shadow-none print:border-none print:rounded-none print:max-w-none print:w-full print:block">
        {/* Modal Controls (Not printed) */}
        <div className="no-print px-6 py-4 bg-gray-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">Aperçu & Impression : {devis.numero}</span>
            <span className="text-xs bg-blue-600 text-white px-2.5 py-0.5 rounded-full font-semibold">
              Devis Technique
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer (PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body (Printable A4 Sheet) */}
        <div className="flex-1 p-6 sm:p-10 overflow-y-auto bg-white text-gray-900 printable-area space-y-6 text-sm print:p-0 print:overflow-visible print:h-auto print:max-h-none print:block">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6 border-b-2 border-blue-900 pb-5">
            {/* Workshop / Company Info with Logo */}
            <div className="flex items-start gap-4">
              {settings.logo_url ? (
                <div className="logo-print-box w-16 h-16 max-w-[64px] max-h-[64px] rounded-xl border border-gray-200 p-1 bg-white shadow-2xs shrink-0 flex items-center justify-center overflow-hidden">
                  <img src={settings.logo_url} alt="Logo" className="max-w-full max-h-full w-auto h-auto object-contain" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                  {settings.nom_atelier?.charAt(0) || 'A'}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-black text-blue-950 uppercase tracking-tight">
                  {settings.nom_atelier || 'ATELIER PRO'}
                </h1>
                <p className="text-xs font-semibold text-blue-800 tracking-wide">{settings.activite || 'Menuiserie Aluminium & Vitrerie'}</p>
                
                <div className="text-xs text-gray-600 space-y-0.5 mt-1 font-sans">
                  {settings.telephone && <p>Tél : <span className="font-semibold text-gray-800">{settings.telephone}</span></p>}
                  {settings.adresse && <p>Adresse : {settings.adresse}</p>}
                  {settings.email && <p>Email : {settings.email}</p>}
                  {settings.matricule_fiscal && (
                    <p className="font-mono text-gray-800 font-semibold pt-0.5">
                      Matricule Fiscal (MF) : {settings.matricule_fiscal}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Document Details Box */}
            <div className="text-right self-stretch sm:self-auto shrink-0">
              <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-4 rounded-2xl shadow-sm text-right min-w-[240px]">
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-300 block">
                  Proposition Commerciale & Technique
                </span>
                <h2 className="text-base sm:text-lg font-black tracking-wide mt-0.5 text-white">
                  DEVIS & PROPOSITION TECHNIQUE
                </h2>
                <div className="mt-2 pt-2 border-t border-blue-800/80 font-mono text-xs space-y-0.5">
                  <p className="text-blue-100">
                    N° : <span className="font-bold text-white text-sm">{devis.numero}</span>
                  </p>
                  <p className="text-blue-200 text-[11px]">
                    Date : <span className="font-semibold text-white">{devis.date}</span>
                  </p>
                  <p className="text-blue-200 text-[11px]">
                    Validité : <span className="font-semibold text-white">30 jours</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Client Details Box (Handwriting Lines for clean printing) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-[11px] text-blue-950 font-black uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-700" />
                Destinataire / Client
              </span>
              {devis.client_id && (
                <span className="text-[10px] text-gray-400 font-mono">Code Client : CLI-{devis.client_id.slice(0, 6).toUpperCase()}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-xs">
              {/* Client Name */}
              <div className="flex items-baseline gap-2 min-w-0">
                <span className="text-gray-500 font-bold shrink-0 min-w-[90px]">Nom / Client :</span>
                {devis.client_nom && devis.client_nom !== 'Sans client' ? (
                  <span className="font-black text-gray-900 text-sm truncate">{devis.client_nom}</span>
                ) : (
                  <span className="flex-1 border-b border-dashed border-gray-400 self-end mb-1 min-w-[80px]"></span>
                )}
              </div>

              {/* Telephone */}
              <div className="flex items-baseline gap-2 min-w-0">
                <span className="text-gray-500 font-bold shrink-0 min-w-[90px]">Téléphone :</span>
                {clientObj?.telephone ? (
                  <span className="font-mono font-bold text-gray-800 truncate">{clientObj.telephone}</span>
                ) : (
                  <span className="flex-1 border-b border-dashed border-gray-400 self-end mb-1 min-w-[80px]"></span>
                )}
              </div>

              {/* CIN / MF */}
              <div className="flex items-baseline gap-2 min-w-0">
                <span className="text-gray-500 font-bold shrink-0 min-w-[90px]">CIN / MF Client :</span>
                {clientObj?.matricule_fiscale ? (
                  <span className="font-mono font-bold text-gray-800 truncate">{clientObj.matricule_fiscale}</span>
                ) : (
                  <span className="flex-1 border-b border-dashed border-gray-400 self-end mb-1 min-w-[80px]"></span>
                )}
              </div>

              {/* Chantier / Ville */}
              <div className="flex items-baseline gap-2 min-w-0">
                <span className="text-gray-500 font-bold shrink-0 min-w-[90px]">Chantier / Ville :</span>
                {devis.notes || clientObj?.adresse ? (
                  <span className="text-gray-700 truncate">{devis.notes || clientObj?.adresse}</span>
                ) : (
                  <span className="flex-1 border-b border-dashed border-gray-400 self-end mb-1 min-w-[80px]"></span>
                )}
              </div>
            </div>
          </div>

          {/* Items Table: Product Cards in original full beauty */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-2 flex items-center justify-between">
              <span>Détails des articles et menuiseries ({devis.items.length})</span>
              <span className="text-[10px] font-normal text-gray-400 capitalize">Cotes & Dessins réels</span>
            </h3>

            <div className="space-y-4">
              {devis.items.map((it, idx) => {
                const cost = liveTotals?.items_costs?.[idx] || devis.totals?.items_costs?.[idx];
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

                  let nbVantaux = 1;
                  const match = (typeDef?.name || '').match(/(\d+)\s*vantaux/i);
                  if (match) nbVantaux = parseInt(match[1]);
                  else if (drawType === 'coulissante' || (typeDef?.name || '').includes('2')) nbVantaux = 2;

                  svg = renderAlumDrawing({
                    drawType,
                    largeur: parseFloat(String(it.largeur)) || 100,
                    hauteur: parseFloat(String(it.hauteur)) || 100,
                    nbVantaux,
                    couleur: it.couleur,
                    estPorte: typeDef?.category === 'porte',
                    partieFixeType: it.partie_fixe_type,
                    pfDim1: parseFloat(String(it.pf_dim_1)) || 0,
                    pfDim2: parseFloat(String(it.pf_dim_2)) || 0,
                    store_enabled: it.store_enabled || false,
                    store_coffre: it.store_coffre || '',
                    store_couleur: it.store_couleur || '',
                    store_lame_type: it.store_lame_type || '',
                    mousti_enabled: it.mousti_enabled || false,
                    remplissage_id: it.remplissage_id,
                    vitrage_type: it.vitrage_type,
                    motif_id: it.motif_id,
                    cotations: true,
                    svgW: 240,
                    svgH: 180,
                    responsive: true
                  });
                }

                return (
                  <div
                    key={idx}
                    className="break-inside-avoid print:break-inside-avoid border border-gray-200 rounded-xl p-4 bg-white shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    {/* Left: Info, Specs & Options */}
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm sm:text-base">
                          {idx + 1}. {it.is_manual ? it.manual_nom : (typeDef?.name || `Produit ${idx + 1}`)}
                        </span>
                        <span className="text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-bold text-slate-700 capitalize shrink-0">
                          {it.couleur?.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-600 font-medium flex-wrap">
                        <span>{it.hauteur && it.largeur ? `Dimensions : ${it.largeur} cm × ${it.hauteur} cm` : ''}</span>
                        <span>•</span>
                        <span className="font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-bold">Qté : {it.quantity}</span>
                        {it.vitrage_type && (
                          <>
                            <span>•</span>
                            <span className="text-gray-500">Vitrage : {it.vitrage_type}</span>
                          </>
                        )}
                      </div>

                      {/* Store Details with Separate Price */}
                      {it.store_enabled && (
                        <div className="flex items-center justify-between gap-2 text-xs bg-blue-50/80 border border-blue-200 p-2 rounded-xl text-blue-900 font-medium">
                          <span>
                            🪟 Store Volet Roulant : {it.store_lame_type || 'Lame 55'} ({it.store_couleur || 'Blanc'}) {it.store_coffre ? `• Coffre ${it.store_coffre}` : ''}
                          </span>
                          {(cost?.net_store_ht || 0) > 0 && (
                            <span className="font-mono font-black text-blue-950 bg-white px-2 py-0.5 rounded-lg border border-blue-200 shadow-2xs shrink-0 text-xs">
                              + {(cost!.net_store_ht!).toFixed(3)} DT
                            </span>
                          )}
                        </div>
                      )}

                      {/* Moustiquaire Details with Separate Price */}
                      {it.mousti_enabled && (
                        <div className="flex items-center justify-between gap-2 text-xs bg-emerald-50/80 border border-emerald-200 p-2 rounded-xl text-emerald-900 font-medium">
                          <span>
                            🦟 Moustiquaire Intégrée : {it.mousti_type === 'plissee' ? 'Plissée Latérale' : 
                               it.mousti_type === 'fixe' ? 'Cadre Fixe' : 
                               it.mousti_type === 'battante' ? 'Porte Battante' : 'Enroulable Verticale'}
                          </span>
                          {(cost?.net_mousti_ht || 0) > 0 && (
                            <span className="font-mono font-black text-emerald-950 bg-white px-2 py-0.5 rounded-lg border border-emerald-200 shadow-2xs shrink-0 text-xs">
                              + {(cost!.net_mousti_ht!).toFixed(3)} DT
                            </span>
                          )}
                        </div>
                      )}

                      {/* Other Supplements */}
                      {it.supplements && it.supplements.length > 0 && (
                        <div className="text-xs text-gray-500 pt-1">
                          Suppléments : <span className="font-medium text-gray-700">{it.supplements.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* SVG Vector Drawing Sketch */}
                    {svg && (
                      <div
                        className="w-36 h-28 shrink-0 flex items-center justify-center bg-slate-50 rounded-xl p-1 border border-slate-200"
                        dangerouslySetInnerHTML={{ __html: svg }}
                      />
                    )}

                    {/* Cost Breakdown */}
                    {cost && (
                      <div className="text-right shrink-0 font-mono min-w-[155px]">
                        {((cost.net_store_ht || 0) > 0 || (cost.net_mousti_ht || 0) > 0 || it.store_enabled || it.mousti_enabled) ? (
                          <div className="space-y-1 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200">
                            <div className="text-[11px] text-gray-600 flex items-center justify-between gap-2.5">
                              <span className="font-sans text-gray-500 text-[10px] uppercase font-bold">Menuiserie :</span>
                              <span className="font-bold text-gray-900">
                                {(cost.net_menuiserie_ht ?? (cost.net_ht - (cost.net_store_ht || 0) - (cost.net_mousti_ht || 0))).toFixed(3)} DT
                              </span>
                            </div>
                            {(cost.net_store_ht || 0) > 0 && (
                              <div className="text-[11px] text-blue-800 bg-blue-50/90 px-1.5 py-0.5 rounded-md border border-blue-200 flex items-center justify-between gap-2.5">
                                <span className="font-sans text-[10px] uppercase font-bold text-blue-600">+ Store :</span>
                                <span className="font-extrabold text-blue-950">{cost.net_store_ht!.toFixed(3)} DT</span>
                              </div>
                            )}
                            {(cost.net_mousti_ht || 0) > 0 && (
                              <div className="text-[11px] text-emerald-800 bg-emerald-50/90 px-1.5 py-0.5 rounded-md border border-emerald-200 flex items-center justify-between gap-2.5">
                                <span className="font-sans text-[10px] uppercase font-bold text-emerald-600">+ Mousti :</span>
                                <span className="font-extrabold text-emerald-950">{cost.net_mousti_ht!.toFixed(3)} DT</span>
                              </div>
                            )}
                            <div className="pt-1.5 border-t border-slate-300 mt-1">
                              <p className="text-[10px] text-gray-400 uppercase font-sans font-semibold">
                                {it.quantity > 1 ? `P.U : ${cost.net_ht.toFixed(3)} DT` : 'Total Ligne HT'}
                              </p>
                              <p className="text-sm font-black text-gray-950">{cost.total_ht.toFixed(3)} DT HT</p>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200">
                            <p className="text-[10px] text-gray-400 uppercase font-sans font-semibold">
                              {it.quantity > 1 ? `P.U : ${cost.net_ht.toFixed(3)} DT` : 'Total Ligne HT'}
                            </p>
                            <p className="text-base font-black text-gray-950">{cost.total_ht.toFixed(3)} DT HT</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals Box */}
          <div className="break-inside-avoid print:break-inside-avoid flex justify-end pt-4 border-t border-gray-200">
            <div className="w-80 space-y-2 font-mono text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              {(devis.totals?.frais_pose > 0 || devis.totals?.frais_transport > 0) && (
                <>
                  {devis.totals?.frais_pose > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Frais de Pose / Montage :</span>
                      <span className="font-bold">{devis.totals.frais_pose.toFixed(3)} DT</span>
                    </div>
                  )}
                  {devis.totals?.frais_transport > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Transport / Livraison :</span>
                      <span className="font-bold">{devis.totals.frais_transport.toFixed(3)} DT</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between text-gray-700">
                <span>Total Net HT :</span>
                <span className="font-bold">{(liveTotals?.total_ht ?? devis.totals.total_ht).toFixed(3)} DT</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>TVA ({devis.marges.tva}%) :</span>
                <span className="font-bold">{(liveTotals?.total_tva ?? devis.totals.total_tva).toFixed(3)} DT</span>
              </div>
              <div className="flex justify-between text-base font-black text-blue-950 border-t-2 border-blue-900 pt-2">
                <span>TOTAL TTC :</span>
                <span className="text-lg">{(liveTotals?.total_ttc ?? devis.totals.total_ttc).toFixed(3)} DT</span>
              </div>
            </div>
          </div>

          {/* Double Signature & Validation Box */}
          <div className="break-inside-avoid print:break-inside-avoid grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t-2 border-gray-200">
            {/* Atelier Stamp Box */}
            <div className="border border-gray-300 rounded-xl p-4 min-h-[110px] flex flex-col justify-between bg-gray-50/50">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                Cachet & Signature de l'Entreprise :
              </p>
              <div className="text-[10px] text-gray-400 italic">
                Date & Cachet officiel de l'atelier
              </div>
            </div>

            {/* Client Bon pour Accord Box */}
            <div className="border border-blue-300 rounded-xl p-4 min-h-[110px] flex flex-col justify-between bg-blue-50/30">
              <div>
                <p className="text-xs font-bold text-blue-950 uppercase tracking-wide">
                  Signature & Bon pour Accord du Client :
                </p>
                <p className="text-[10px] text-blue-700 mt-0.5 italic font-medium">
                  Mention manuscrite « Lu et approuvé - Bon pour commande »
                </p>
              </div>
              <div className="flex justify-between items-end text-[10px] text-gray-400 italic pt-3">
                <span>Date : ..... / ..... / 202...</span>
                <span>Signature :</span>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="text-center text-[10px] text-gray-400 pt-4 border-t border-gray-100 space-y-0.5 font-sans">
            <p className="font-medium text-gray-500">Devis valable pour une durée de 30 jours à compter de sa date d'émission.</p>
            <p>{settings.nom_atelier || 'AtelierPro'} — Menuiserie Aluminium & Vitrerie professionnelle.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalElement, document.body) : modalElement;
};
