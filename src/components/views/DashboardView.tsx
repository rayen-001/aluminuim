import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Wallet, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  Package, 
  Clock, 
  PlusCircle,
  ChevronRight
} from 'lucide-react';

interface DashboardViewProps {
  setCurrentTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setCurrentTab }) => {
  const { 
    soldeCaisse, 
    clients, 
    devisList, 
    factures, 
    caisseMovements, 
    settings 
  } = useApp();

  // Compute total customer debt / unpaid invoices
  const totalCreances = clients.reduce((acc, c) => acc + (c.solde_creance || 0), 0);
  const clientsDebiteurs = clients.filter(c => (c.solde_creance || 0) > 0);

  // Month entries
  const currentMonth = new Date().toISOString().slice(0, 7);
  const entreesMois = caisseMovements
    .filter(m => m.type === 'entree' && m.date.startsWith(currentMonth))
    .reduce((acc, m) => acc + m.montant, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const paiementsJour = caisseMovements.filter(m => m.type === 'entree' && m.date === todayStr);
  const mouvementsJour = caisseMovements.filter(m => m.date === todayStr);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Notice */}
      <div className="bg-amber-500 text-white px-4 py-3 rounded-xl shadow-xs flex items-center justify-between text-xs sm:text-sm font-medium">
        <div className="flex items-center gap-2">
          <span>✨</span>
          <span>Bienvenue sur AtelierPro — Système de gestion de menuiserie aluminium & calcul de devis.</span>
        </div>
        <span className="hidden md:inline-block opacity-90">Support : {settings.telephone}</span>
      </div>

      {/* Stats Cards Grid (Matching reference tableau_de_bord.png) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Solde Caisse */}
        <div className="bg-blue-600 rounded-2xl p-5 text-white shadow-md shadow-blue-600/10 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Solde Caisse</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-1">
              {soldeCaisse.toFixed(2)} <span className="text-base font-bold">TND</span>
            </h3>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-xs">
            <Wallet className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Card 2: Total Clients */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Clients</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">{clients.length}</h3>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Créances */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Créances clients</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-orange-600 mt-1">
              {totalCreances.toFixed(2)} <span className="text-base font-bold text-gray-700">TND</span>
            </h3>
          </div>
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Entrées Mois */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Entrées Mois</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
              {entreesMois.toFixed(2)} <span className="text-base font-bold text-gray-700">TND</span>
            </h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setCurrentTab('devis_create')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nouveau Devis Aluminium</span>
        </button>
        <button
          onClick={() => setCurrentTab('articles')}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xs transition"
        >
          <Package className="w-4 h-4 text-blue-600" />
          <span>Catalogue & Prix (318 Profilés)</span>
        </button>
        <button
          onClick={() => setCurrentTab('clients')}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xs transition"
        >
          <Users className="w-4 h-4 text-indigo-600" />
          <span>Gestion Clients</span>
        </button>
      </div>

      {/* Middle Grid: Clients Débiteurs & Paiements du Jour */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clients Débiteurs */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Clients Débiteurs</h3>
            <button 
              onClick={() => setCurrentTab('clients')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Voir tout
            </button>
          </div>

          {clientsDebiteurs.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-2 stroke-1 text-gray-300" />
              <p className="text-sm">Aucun client débiteur</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {clientsDebiteurs.slice(0, 5).map(c => (
                <div key={c.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{c.nom}</p>
                    <p className="text-xs text-gray-500">{c.telephone}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-orange-600">
                      {c.solde_creance.toFixed(2)} DT
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paiements du Jour */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Paiements du Jour</h3>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {paiementsJour.length} paiement(s)
            </span>
          </div>

          {paiementsJour.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Clock className="w-10 h-10 mx-auto mb-2 stroke-1 text-gray-300" />
              <p className="text-sm">Aucun paiement enregistré aujourd'hui</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {paiementsJour.map(p => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{p.motif}</p>
                    <p className="text-xs text-gray-500">{p.client_ou_tiers || 'Client'} • {p.mode_paiement}</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">
                    +{p.montant.toFixed(2)} DT
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Card: Mouvements de Caisse récents */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">Mouvements de Caisse récents</h3>
          <button 
            onClick={() => setCurrentTab('caisse')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Voir la caisse
          </button>
        </div>

        {caisseMovements.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Wallet className="w-10 h-10 mx-auto mb-2 stroke-1 text-gray-300" />
            <p className="text-sm">Aucun mouvement de caisse</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Date</th>
                  <th className="px-4 py-2.5 font-semibold">Type</th>
                  <th className="px-4 py-2.5 font-semibold">Motif</th>
                  <th className="px-4 py-2.5 font-semibold">Mode</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {caisseMovements.slice(0, 5).map(m => (
                  <tr key={m.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 text-gray-600">{m.date}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                        m.type === 'entree' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {m.type === 'entree' ? 'Entrée' : 'Sortie'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{m.motif}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{m.mode_paiement}</td>
                    <td className={`px-4 py-3 text-right font-bold ${
                      m.type === 'entree' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {m.type === 'entree' ? '+' : '-'}{m.montant.toFixed(2)} DT
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
