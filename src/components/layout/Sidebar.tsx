import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Layers, 
  FileText, 
  Truck, 
  Receipt, 
  Package, 
  Users, 
  Building2, 
  UserCheck, 
  Wallet, 
  Settings, 
  ChevronDown, 
  LogOut,
  X,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  openCGU: () => void;
  openCharte: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  sidebarOpen,
  setSidebarOpen,
  openCGU,
  openCharte
}) => {
  const { settings, user, signOut, userRole } = useApp();
  const [alumOpen, setAlumOpen] = useState(true);
  const [rhOpen, setRhOpen] = useState(false);

  const navigateTo = (tab: string) => {
    setCurrentTab(tab);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const isAdmin = userRole === 'admin';

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={`w-64 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white flex-shrink-0 fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col justify-between border-r border-slate-800/60 shadow-xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between px-6 h-20 border-b border-slate-800/80 bg-slate-950/50 backdrop-blur-md">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/25 border border-blue-400/30">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">AluPro</h1>
                <p className="text-[11px] text-blue-400 font-medium">Gestion Atelier Aluminium</p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
            {/* Tableau de bord */}
            <button
              onClick={() => navigateTo('dashboard')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Tableau de bord</span>
            </button>

            {/* Module Aluminium */}
            <div className="space-y-1">
              <button
                onClick={() => setAlumOpen(!alumOpen)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-150 text-slate-300 hover:bg-slate-800/70 hover:text-white cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <Layers className="w-5 h-5 text-blue-400" />
                  <span>Aluminium</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${alumOpen ? 'rotate-180' : ''}`} />
              </button>

              {alumOpen && (
                <div className="ml-3 pl-3 border-l-2 border-blue-500/30 space-y-1 py-1">
                  <button
                    onClick={() => navigateTo('chantiers')}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition duration-150 cursor-pointer ${
                      currentTab === 'chantiers'
                        ? 'bg-blue-600/80 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <span>Chantiers & Débit</span>
                  </button>

                  <button
                    onClick={() => navigateTo('devis')}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition duration-150 cursor-pointer ${
                      currentTab.startsWith('devis')
                        ? 'bg-blue-600/80 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span>Devis</span>
                  </button>

                  <button
                    onClick={() => navigateTo('bl')}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition duration-150 cursor-pointer ${
                      currentTab === 'bl'
                        ? 'bg-blue-600/80 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-blue-400" />
                    <span>Bons de Sortie & BL</span>
                  </button>

                  <button
                    onClick={() => navigateTo('factures')}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition duration-150 cursor-pointer ${
                      currentTab === 'factures'
                        ? 'bg-blue-600/80 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <Receipt className="w-4 h-4 text-blue-400" />
                    <span>Factures</span>
                  </button>

                  <button
                    onClick={() => navigateTo('articles')}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition duration-150 cursor-pointer ${
                      currentTab === 'articles'
                        ? 'bg-blue-600/80 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <Package className="w-4 h-4 text-blue-400" />
                    <span>Articles (Profilés)</span>
                  </button>

                  <button
                    onClick={() => navigateTo('accessoires')}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition duration-150 cursor-pointer ${
                      currentTab === 'accessoires'
                        ? 'bg-blue-600/80 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-blue-400" />
                    <span>Quincaillerie (40)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Clients */}
            <button
              onClick={() => navigateTo('clients')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                currentTab === 'clients'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <Users className="w-5 h-5 text-indigo-400" />
              <span>Clients</span>
            </button>

            {/* Fournisseurs */}
            <button
              onClick={() => navigateTo('fournisseurs')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                currentTab === 'fournisseurs'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <Building2 className="w-5 h-5 text-indigo-400" />
              <span>Fournisseurs</span>
            </button>

            {/* Module RH */}
            <div className="space-y-1">
              <button
                onClick={() => setRhOpen(!rhOpen)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-150 text-slate-300 hover:bg-slate-800/70 hover:text-white cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                  <span>RH & Salaires</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${rhOpen ? 'rotate-180' : ''}`} />
              </button>

              {rhOpen && (
                <div className="ml-3 pl-3 border-l-2 border-emerald-500/30 space-y-1 py-1">
                  <button
                    onClick={() => navigateTo('rh_employes')}
                    className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition duration-150 cursor-pointer ${
                      currentTab === 'rh_employes' ? 'bg-emerald-600/80 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <span>Employés</span>
                  </button>
                  <button
                    onClick={() => navigateTo('rh_avances')}
                    className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition duration-150 cursor-pointer ${
                      currentTab === 'rh_avances' ? 'bg-emerald-600/80 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <span>Avances sur Salaire</span>
                  </button>
                  <button
                    onClick={() => navigateTo('rh_conges')}
                    className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition duration-150 cursor-pointer ${
                      currentTab === 'rh_conges' ? 'bg-emerald-600/80 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <span>Congés</span>
                  </button>
                  <button
                    onClick={() => navigateTo('rh_paies')}
                    className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition duration-150 cursor-pointer ${
                      currentTab === 'rh_paies' ? 'bg-emerald-600/80 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <span>Bulletins de Paie</span>
                  </button>
                </div>
              )}
            </div>

            {/* Gestion Caisse */}
            <button
              onClick={() => navigateTo('caisse')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                currentTab === 'caisse'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <Wallet className="w-5 h-5 text-amber-400" />
              <span>Gestion Caisse</span>
            </button>

            {/* Paramètres */}
            <div className="pt-2 mt-2 border-t border-slate-800/80">
              <button
                onClick={() => navigateTo('settings')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                  currentTab === 'settings'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Settings className="w-5 h-5 text-slate-400" />
                <span>Paramètres Atelier</span>
              </button>
            </div>
          </nav>

          {/* Legal Links */}
          <div className="px-4 py-2 text-center text-[10px] text-slate-400/80 space-y-1">
            <div>
              <button type="button" onClick={openCGU} className="hover:text-slate-200 underline cursor-pointer">
                Conditions d'utilisation
              </button>
              <span className="mx-1.5">•</span>
              <button type="button" onClick={openCharte} className="hover:text-slate-200 underline cursor-pointer">
                Charte des données
              </button>
            </div>
          </div>

          {/* User Info & Profile */}
          <div className="px-4 py-3.5 border-t border-slate-800/80 bg-slate-950/60">
            <div className="flex items-center space-x-3 px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
                <span className="text-xs font-bold text-white uppercase">
                  {(settings.nom_atelier || user?.email || 'AL').slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-xs font-semibold text-white truncate">
                    {settings.nom_atelier || 'Mon Atelier'}
                  </p>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email || 'Compte Cloud'}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => signOut()}
                title="Se déconnecter" 
                className="p-1.5 hover:bg-rose-500/20 hover:text-rose-300 rounded-lg text-slate-400 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
