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
        className={`w-64 bg-gradient-to-b from-blue-900 via-blue-900 to-indigo-950 text-white flex-shrink-0 fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col justify-between ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between px-6 h-20 border-b border-blue-800/60 bg-blue-950/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-400 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">AtelierPro</h1>
                <p className="text-xs text-blue-300 font-medium">Gestion Atelier</p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-blue-300 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto custom-scrollbar">
            {/* Tableau de bord */}
            <button
              onClick={() => navigateTo('dashboard')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-150 ${
                currentTab === 'dashboard'
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Tableau de bord</span>
            </button>

            {/* Module Aluminium */}
            <div className="space-y-1">
              <button
                onClick={() => setAlumOpen(!alumOpen)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-150 text-blue-100 hover:bg-white/10 hover:text-white"
              >
                <div className="flex items-center space-x-3">
                  <Layers className="w-5 h-5" />
                  <span>Aluminium</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${alumOpen ? 'rotate-180' : ''}`} />
              </button>

              {alumOpen && (
                <div className="ml-4 pl-3 border-l border-blue-700/50 space-y-1 py-0.5">
                  <button
                    onClick={() => navigateTo('chantiers')}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition duration-150 ${
                      currentTab === 'chantiers'
                        ? 'bg-blue-600/60 text-white font-semibold shadow-inner'
                        : 'text-blue-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Chantiers & Débit</span>
                  </button>

                  <button
                    onClick={() => navigateTo('devis')}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition duration-150 ${
                      currentTab.startsWith('devis')
                        ? 'bg-blue-600/60 text-white font-semibold shadow-inner'
                        : 'text-blue-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Devis</span>
                  </button>

                  <button
                    onClick={() => navigateTo('bl')}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition duration-150 ${
                      currentTab === 'bl'
                        ? 'bg-blue-600/60 text-white font-semibold shadow-inner'
                        : 'text-blue-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>Bons de Livraison</span>
                  </button>

                  <button
                    onClick={() => navigateTo('factures')}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition duration-150 ${
                      currentTab === 'factures'
                        ? 'bg-blue-600/60 text-white font-semibold shadow-inner'
                        : 'text-blue-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Factures</span>
                  </button>

                  <button
                    onClick={() => navigateTo('articles')}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition duration-150 ${
                      currentTab === 'articles'
                        ? 'bg-blue-600/60 text-white font-semibold shadow-inner'
                        : 'text-blue-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span>Articles (Profilés)</span>
                  </button>

                  <button
                    onClick={() => navigateTo('accessoires')}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition duration-150 ${
                      currentTab === 'accessoires'
                        ? 'bg-blue-600/60 text-white font-semibold shadow-inner'
                        : 'text-blue-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Quincaillerie (40)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Clients */}
            <button
              onClick={() => navigateTo('clients')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-150 ${
                currentTab === 'clients'
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Clients</span>
            </button>

            {/* Fournisseurs */}
            <button
              onClick={() => navigateTo('fournisseurs')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-150 ${
                currentTab === 'fournisseurs'
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span>Fournisseurs</span>
            </button>

            {/* Module RH */}
            <div className="space-y-1">
              <button
                onClick={() => setRhOpen(!rhOpen)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-150 text-blue-100 hover:bg-white/10 hover:text-white"
              >
                <div className="flex items-center space-x-3">
                  <UserCheck className="w-5 h-5" />
                  <span>RH</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${rhOpen ? 'rotate-180' : ''}`} />
              </button>

              {rhOpen && (
                <div className="ml-4 pl-3 border-l border-blue-700/50 space-y-1 py-0.5">
                  <button
                    onClick={() => navigateTo('rh_employes')}
                    className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition duration-150 ${
                      currentTab === 'rh_employes' ? 'bg-blue-600/60 text-white' : 'text-blue-200 hover:bg-white/10'
                    }`}
                  >
                    <span>Employés</span>
                  </button>
                  <button
                    onClick={() => navigateTo('rh_avances')}
                    className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition duration-150 ${
                      currentTab === 'rh_avances' ? 'bg-blue-600/60 text-white' : 'text-blue-200 hover:bg-white/10'
                    }`}
                  >
                    <span>Avances sur Salaire</span>
                  </button>
                  <button
                    onClick={() => navigateTo('rh_conges')}
                    className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition duration-150 ${
                      currentTab === 'rh_conges' ? 'bg-blue-600/60 text-white' : 'text-blue-200 hover:bg-white/10'
                    }`}
                  >
                    <span>Congés</span>
                  </button>
                  <button
                    onClick={() => navigateTo('rh_paies')}
                    className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition duration-150 ${
                      currentTab === 'rh_paies' ? 'bg-blue-600/60 text-white' : 'text-blue-200 hover:bg-white/10'
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
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-150 ${
                currentTab === 'caisse'
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Wallet className="w-5 h-5" />
              <span>Gestion Caisse</span>
            </button>

            {/* Paramètres */}
            <div className="pt-2 mt-2 border-t border-blue-800/50">
              <button
                onClick={() => navigateTo('settings')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-150 ${
                  currentTab === 'settings'
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Paramètres</span>
              </button>
            </div>
          </nav>

          {/* Legal Links */}
          <div className="px-4 py-2 text-center text-[11px] text-blue-300/80 space-y-1">
            <div>
              <button type="button" onClick={openCGU} className="hover:text-white underline">
                Conditions générales d'utilisation
              </button>
            </div>
            <div>
              <button type="button" onClick={openCharte} className="hover:text-white underline">
                Charte des données & cookies
              </button>
            </div>
          </div>

          {/* User Info & Profile */}
          <div className="px-4 py-3.5 border-t border-blue-800/60 bg-blue-950/40">
            <div className="flex items-center space-x-3 px-3 py-2 bg-white/10 rounded-xl">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full flex items-center justify-center shadow shrink-0">
                <span className="text-xs font-bold text-white uppercase">
                  {(settings.nom_atelier || user?.email || 'AP').slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {settings.nom_atelier || 'Mon Atelier'}
                </p>
                <p className="text-[10px] text-blue-200 truncate">
                  {user?.email || 'Compte Cloud'}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => signOut()}
                title="Se déconnecter" 
                className="p-1.5 hover:bg-rose-500/20 hover:text-rose-300 rounded-lg text-blue-200 transition cursor-pointer"
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
