import React from 'react';
import { useApp } from '../../context/AppContext';
import { Truck, Printer, CheckCircle, Package } from 'lucide-react';

export const BonsLivraisonView: React.FC = () => {
  const { bonsLivraison } = useApp();

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Bons de Livraison</h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Suivi des livraisons et des sorties d'atelier ({bonsLivraison.length} bons générés)
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
        {bonsLivraison.length === 0 ? (
          <div className="text-center py-16 text-gray-400 space-y-2">
            <Truck className="w-12 h-12 mx-auto stroke-1 text-gray-300" />
            <p className="text-sm">Aucun bon de livraison pour le moment</p>
            <p className="text-xs text-gray-400">Vous pouvez convertir un devis en bon de livraison depuis l'onglet Devis.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                <tr>
                  <th className="px-5 py-3">Numéro BL</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Articles</th>
                  <th className="px-5 py-3 text-center">Statut</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bonsLivraison.map(bl => (
                  <tr key={bl.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5 font-mono font-bold text-blue-700">{bl.numero}</td>
                    <td className="px-5 py-3.5 font-bold text-gray-900">{bl.client_nom}</td>
                    <td className="px-5 py-3.5 text-gray-600">{bl.date}</td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {bl.items.length} article(s) à livrer
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="bg-purple-50 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-purple-200">
                        {bl.status === 'livre' ? 'Livré' : 'En cours'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => window.print()}
                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
                        title="Imprimer BL"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
