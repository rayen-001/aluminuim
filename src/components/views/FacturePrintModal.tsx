import React from 'react';
import { createPortal } from 'react-dom';
import { useApp, FactureRecord } from '../../context/AppContext';
import { FAMILIES, getProductTypesForFamily } from '../../data/productCatalog';
import { numberToWordsDinar } from '../../utils/numberToWordsFr';
import { Printer, X, Receipt } from 'lucide-react';

interface FacturePrintModalProps {
  facture: FactureRecord | null;
  onClose: () => void;
}

export const FacturePrintModal: React.FC<FacturePrintModalProps> = ({ facture, onClose }) => {
  const { settings, clients, devisList } = useApp();

  if (!facture) return null;

  const clientMatch = clients.find(
    c => c.nom.toLowerCase() === (facture.client_nom || '').toLowerCase()
  );

  const linkedDevis = facture.devis_id
    ? devisList.find(d => d.id === facture.devis_id)
    : undefined;

  const timbreFiscal = 1.000; // Timbre fiscal standard en Tunisie (1.000 DT)
  const netAPayer = (facture.total_ttc || 0) + timbreFiscal;
  const montantPaye = facture.montant_paye || 0;
  const resteDu = Math.max(0, netAPayer - montantPaye);

  const modalElement = (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:block print:overflow-visible print:h-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 sm:p-10 space-y-6 animate-in fade-in zoom-in-95 duration-150 my-auto print:max-h-none print:h-auto print:overflow-visible print:shadow-none print:border-none print:rounded-none print:max-w-none print:w-full print:block print:p-0">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-cyan-700" />
            <h3 className="text-base font-bold text-gray-900">
              Impression Facture : <span className="font-mono text-cyan-800">{facture.numero}</span>
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-cyan-700 hover:bg-cyan-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / Sauvegarder PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document A4 Body */}
        <div id="printable-facture-content" className="space-y-6 text-gray-900 font-sans p-2 sm:p-4 print:p-0 print:overflow-visible print:h-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-cyan-800 pb-5 gap-4">
            {/* Workshop Info & Logo */}
            <div className="flex items-start gap-4">
              {settings.logo_url ? (
                <div className="logo-print-box w-16 h-16 max-w-[64px] max-h-[64px] rounded-xl border border-gray-200 p-1 bg-white shadow-2xs shrink-0 flex items-center justify-center overflow-hidden">
                  <img src={settings.logo_url} alt="Logo" className="max-w-full max-h-full w-auto h-auto object-contain" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-cyan-800 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
                  {settings.nom_atelier?.charAt(0) || 'A'}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-black text-cyan-950 uppercase tracking-tight">
                  {settings.nom_atelier || 'ATELIER PRO'}
                </h2>
                <p className="text-xs font-semibold text-cyan-800">
                  {settings.activite || 'Menuiserie Aluminium & Vitrerie'}
                </p>
                <div className="text-xs text-gray-600 space-y-0.5 mt-1">
                  {settings.adresse && <p>{settings.adresse}</p>}
                  {settings.telephone && (
                    <p>Tél : <span className="font-semibold text-gray-800">{settings.telephone}</span></p>
                  )}
                  {settings.email && <p>Email : <span className="text-gray-800">{settings.email}</span></p>}
                  {settings.matricule_fiscal && (
                    <p className="font-mono text-gray-900 font-bold">MF : {settings.matricule_fiscal}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Document Header Box */}
            <div className="text-right self-stretch sm:self-auto shrink-0 min-w-[240px]">
              <div className="bg-gradient-to-br from-cyan-700 to-cyan-900 text-white p-4 rounded-2xl shadow-sm text-right">
                <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-200 block">
                  Document Officiel
                </span>
                <h3 className="text-lg font-black tracking-wide mt-0.5 text-white">
                  FACTURE N° {facture.numero}
                </h3>
                <div className="mt-2 pt-2 border-t border-cyan-600/60 font-mono text-xs space-y-0.5">
                  <p className="text-cyan-100">
                    Date : <span className="font-bold text-white">{facture.date}</span>
                  </p>
                  {facture.devis_id && (
                    <p className="text-cyan-200 text-[11px]">
                      Réf. Devis : <span className="font-medium text-white">{linkedDevis?.numero || facture.devis_id.slice(0, 8)}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Client Details Box (Facturé à) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <span className="text-[11px] uppercase font-black tracking-wider text-cyan-900 block border-b border-slate-200 pb-1">
                Facturé à (Client / Destinataire) :
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-baseline gap-2">
                  <span className="text-gray-500 font-bold min-w-[100px]">Client :</span>
                  <span className="font-black text-gray-900 text-sm">
                    {clientMatch?.nom || facture.client_nom || 'Client sans nom'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-gray-500 font-bold min-w-[100px]">MF / CIN :</span>
                  {clientMatch?.matricule_fiscale ? (
                    <span className="font-mono font-bold text-gray-800">{clientMatch.matricule_fiscale}</span>
                  ) : (
                    <span className="flex-1 border-b border-dashed border-gray-300 self-end mb-1"></span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-gray-500 font-bold min-w-[100px]">Adresse :</span>
                  {clientMatch?.adresse ? (
                    <span className="text-gray-800">{clientMatch.adresse}</span>
                  ) : (
                    <span className="flex-1 border-b border-dashed border-gray-300 self-end mb-1"></span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-gray-500 font-bold min-w-[100px]">Téléphone :</span>
                  {clientMatch?.telephone ? (
                    <span className="font-mono text-gray-800 font-semibold">{clientMatch.telephone}</span>
                  ) : (
                    <span className="flex-1 border-b border-dashed border-gray-300 self-end mb-1"></span>
                  )}
                </div>
              </div>
            </div>

            {/* Modalités & Statut */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-[11px] uppercase font-black tracking-wider text-cyan-900 block border-b border-slate-200 pb-1">
                  Conditions & Règlement :
                </span>
                <div className="mt-2 text-xs space-y-1 text-gray-600">
                  <p>Mode de paiement : <span className="font-semibold text-gray-800">Espèces / Chèque / Virement</span></p>
                  <p>Échéance : <span className="font-semibold text-gray-800">À réception de la facture</span></p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-semibold">Statut du paiement :</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono uppercase ${
                  facture.status === 'payee'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : facture.status === 'partielle'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}>
                  {facture.status === 'payee' ? 'Facture Payée' : facture.status === 'partielle' ? 'Paiement Partiel' : 'Facture Impayée'}
                </span>
              </div>
            </div>
          </div>

          {/* Table of Items */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex justify-between items-center">
              <span>Désignation des Articles & Prestations ({facture.items.length})</span>
              <span className="text-[10px] text-gray-400 font-normal">Montants en Dinars Tunisiens (DT)</span>
            </h4>

            <table className="w-full text-left text-xs border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-cyan-900 text-white font-bold">
                <tr>
                  <th className="px-4 py-2.5">DÉSIGNATION</th>
                  <th className="px-3 py-2.5 text-center w-20">QTÉ</th>
                  <th className="px-3 py-2.5 text-center w-20">TVA %</th>
                  <th className="px-4 py-2.5 text-right w-28">P.U. HT</th>
                  <th className="px-4 py-2.5 text-right w-32">TOTAL HT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {facture.items.map((it, idx) => {
                  const linkedItem = linkedDevis?.items?.[idx];
                  let itemTitle = it.designation;

                  if (linkedItem) {
                    if (linkedItem.is_manual) {
                      itemTitle = linkedItem.manual_nom || linkedItem.manual_designation || itemTitle;
                    } else if (linkedItem.family_id && linkedItem.product_type_id) {
                      const types = getProductTypesForFamily(linkedItem.family_id);
                      const typeDef = types.find(t => t.id === linkedItem.product_type_id);
                      if (typeDef?.name) itemTitle = typeDef.name;
                    }
                  }

                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-900 text-xs sm:text-sm">{itemTitle}</p>
                        {linkedItem && (
                          <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-gray-500 mt-0.5">
                            {linkedItem.largeur && linkedItem.hauteur && (
                              <span>Dim : <strong className="text-gray-700">{linkedItem.largeur}×{linkedItem.hauteur} cm</strong></span>
                            )}
                            {linkedItem.couleur && (
                              <span>• Couleur : <strong className="text-gray-700 capitalize">{linkedItem.couleur.replace('_', ' ')}</strong></span>
                            )}
                            {linkedItem.vitrage_type && (
                              <span>• Vitrage : <strong className="text-gray-700">{linkedItem.vitrage_type}</strong></span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center font-mono font-medium text-gray-700">
                        {it.quantite.toFixed(3)}
                      </td>
                      <td className="px-3 py-3 text-center font-mono font-medium text-gray-700">
                        {facture.tva_taux || 19}%
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-gray-800">
                        {it.prix_unitaire_ht.toFixed(3)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-gray-900">
                        {it.total_ht.toFixed(3)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* TVA Summary & Totals Box */}
          <div className="break-inside-avoid print:break-inside-avoid grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 items-start">
            {/* Left: Tableau Récapitulatif TVA */}
            <div>
              <table className="w-full text-left text-xs border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-center">TAUX</th>
                    <th className="px-3 py-2 text-right">BASE HT</th>
                    <th className="px-3 py-2 text-right">MONTANT TVA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-mono text-xs">
                  <tr>
                    <td className="px-3 py-2 text-center font-bold text-gray-800">{facture.tva_taux || 19}%</td>
                    <td className="px-3 py-2 text-right text-gray-700">{(facture.total_ht || 0).toFixed(3)}</td>
                    <td className="px-3 py-2 text-right font-bold text-cyan-900">{(facture.total_tva || 0).toFixed(3)}</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td className="px-3 py-2 text-center text-cyan-900">TOTAL</td>
                    <td className="px-3 py-2 text-right text-gray-900">{(facture.total_ht || 0).toFixed(3)}</td>
                    <td className="px-3 py-2 text-right text-cyan-950">{(facture.total_tva || 0).toFixed(3)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right: Totals Box */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="font-sans text-gray-600">Total HT :</span>
                <span className="font-bold text-gray-900">{(facture.total_ht || 0).toFixed(3)} DT</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="font-sans text-gray-600">TVA ({facture.tva_taux || 19}%) :</span>
                <span className="font-bold text-gray-900">{(facture.total_tva || 0).toFixed(3)} DT</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="font-sans text-gray-600">Total TTC :</span>
                <span className="font-bold text-gray-900">{(facture.total_ttc || 0).toFixed(3)} DT</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="font-sans text-gray-600">Timbre fiscal :</span>
                <span className="font-bold text-gray-900">{timbreFiscal.toFixed(3)} DT</span>
              </div>

              {/* NET A PAYER */}
              <div className="bg-cyan-700 text-white p-3 rounded-xl flex items-center justify-between shadow-xs mt-2">
                <span className="font-sans font-black uppercase text-xs tracking-wider">NET À PAYER :</span>
                <span className="text-base sm:text-lg font-black">{netAPayer.toFixed(3)} DT</span>
              </div>

              {montantPaye > 0 && (
                <div className="pt-2 space-y-1 text-[11px]">
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span className="font-sans">Montant Déjà Réglé :</span>
                    <span>{montantPaye.toFixed(3)} DT</span>
                  </div>
                  {resteDu > 0 && (
                    <div className="flex justify-between text-red-600 font-bold">
                      <span className="font-sans">Reste Dû :</span>
                      <span>{resteDu.toFixed(3)} DT</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Arrêté en toutes lettres */}
          <div className="break-inside-avoid print:break-inside-avoid border-l-4 border-cyan-700 bg-cyan-50/50 p-3.5 rounded-r-xl space-y-1">
            <p className="text-[11px] text-gray-600 italic">
              Arrêtée la présente facture, sauf erreur ou omission, à la somme de :
            </p>
            <p className="font-black text-cyan-950 text-xs sm:text-sm tracking-wide uppercase font-sans">
              {numberToWordsDinar(netAPayer)}
            </p>
          </div>

          {/* Cachet & Signature */}
          <div className="break-inside-avoid print:break-inside-avoid flex justify-end pt-4">
            <div className="border border-gray-300 rounded-xl p-4 w-64 min-h-[110px] flex flex-col justify-between bg-gray-50/40 text-center">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Cachet & Signature</p>
              <p className="text-[10px] text-gray-400 italic">Pour l'entreprise</p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-3 text-center text-[10px] text-gray-500 space-y-0.5 font-sans">
            <p className="font-semibold text-gray-700">{settings.nom_atelier || 'AtelierPro'} — {settings.activite || 'Menuiserie Aluminium & Vitrerie'}</p>
            <p>
              {settings.matricule_fiscal && <span>MF : {settings.matricule_fiscal} • </span>}
              {settings.telephone && <span>Tél : {settings.telephone} • </span>}
              {settings.adresse && <span>Adresse : {settings.adresse}</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalElement, document.body) : modalElement;
};
