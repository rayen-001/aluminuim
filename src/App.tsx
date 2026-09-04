import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/views/DashboardView';
import { ArticlesView } from './components/views/ArticlesView';
import { AccessoiresView } from './components/views/AccessoiresView';
import { DevisListView } from './components/views/DevisListView';
import { DevisCreateView } from './components/views/DevisCreateView';
import { ClientsView } from './components/views/ClientsView';
import { FournisseursView } from './components/views/FournisseursView';
import { BonsLivraisonView } from './components/views/BonsLivraisonView';
import { FacturesView } from './components/views/FacturesView';
import { CaisseView } from './components/views/CaisseView';
import { SettingsView } from './components/views/SettingsView';
import { RHView } from './components/views/RHView';
import { ChantiersView } from './components/views/ChantiersView';
import { CGUModal, CharteModal } from './components/modals/LegalModals';
import { AuthView } from './components/auth/AuthView';
import { SuspendedAccountView } from './components/auth/SuspendedAccountView';
import { AdminPortal } from './components/admin/AdminPortal';
import { Loader2 } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { settings, user, isLoadingAuth, isSuspended, userRole } = useApp();

  const isAdmin = userRole === 'admin';

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editDevisId, setEditDevisId] = useState<string | null>(null);

  // PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  // Modals
  const [cguOpen, setCguOpen] = useState(false);
  const [charteOpen, setCharteOpen] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-slate-200">AtelierPro Cloud</p>
          <p className="text-xs text-slate-500 font-mono">Connexion sécurisée Supabase...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  if (isSuspended) {
    return <SuspendedAccountView />;
  }

  // If Super-Admin, render dedicated Admin Portal (Separate interface, no craftsman menu)
  if (isAdmin) {
    return <AdminPortal />;
  }

  const handleInstallPWA = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        setCanInstall(false);
      }
      setDeferredPrompt(null);
    });
  };

  const handleEditDevis = (devisId: string) => {
    setEditDevisId(devisId);
    setCurrentTab('devis_create');
  };

  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return { title: 'Tableau de Bord', subtitle: `Vue d'ensemble • ${settings.nom_atelier}` };
      case 'chantiers':
        return { title: 'Chantiers & Fabrication Atelier', subtitle: 'Gestion des projets, débitage et fiches de coupe' };
      case 'devis':
        return { title: 'Devis Aluminium', subtitle: 'Gestion des devis et chiffrages' };
      case 'devis_create':
        return { title: editDevisId ? 'Modifier Devis' : 'Nouveau Devis Aluminium', subtitle: 'Calcul & Dessin technique en temps réel' };
      case 'bl':
        return { title: 'Bons de Livraison', subtitle: 'Suivi des livraisons atelier' };
      case 'factures':
        return { title: 'Facturation & Règlements', subtitle: 'Gestion des factures clients' };
      case 'articles':
        return { title: 'Catalogue Articles & Profilés', subtitle: 'Gestion des prix aluminium HT & TTC' };
      case 'accessoires':
        return { title: 'Catalogue Accessoires & Quincaillerie', subtitle: 'Gestion des prix des 40 accessoires réels' };
      case 'clients':
        return { title: 'Gestion Clients', subtitle: 'Carnet de contacts et créances' };
      case 'fournisseurs':
        return { title: 'Fournisseurs', subtitle: 'Fournisseurs aluminium et accessoires' };
      case 'caisse':
        return { title: 'Gestion Caisse', subtitle: 'Suivi de la trésorerie et des flux' };
      case 'settings':
        return { title: 'Paramètres Atelier', subtitle: 'Coordonnées et configuration TVA' };
      case 'rh_employes':
        return { title: 'RH — Employés', subtitle: 'Gestion de l’équipe' };
      case 'rh_avances':
        return { title: 'RH — Avances sur Salaire', subtitle: 'Avances et acomptes' };
      case 'rh_conges':
        return { title: 'RH — Congés', subtitle: 'Suivi des absences' };
      case 'rh_paies':
        return { title: 'RH — Bulletins de Paie', subtitle: 'Rémunérations' };
      case 'admin_super':
        return { title: 'Console Super-Admin SaaS', subtitle: 'Gestion des abonnements & activation ateliers' };
      default:
        return { title: 'AtelierPro', subtitle: 'Gestion Atelier Aluminium' };
    }
  };

  const { title, subtitle } = getTabTitle();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'devis') setEditDevisId(null);
          setCurrentTab(tab);
        }}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        openCGU={() => setCguOpen(true)}
        openCharte={() => setCharteOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setSidebarOpen(true)}
          onInstallPWA={handleInstallPWA}
          canInstallPWA={canInstall}
        />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {currentTab === 'dashboard' && (
            <DashboardView
              setCurrentTab={(tab) => {
                if (tab === 'devis_create') setEditDevisId(null);
                setCurrentTab(tab);
              }}
            />
          )}

          {currentTab === 'chantiers' && (
            <ChantiersView
              setCurrentTab={(tab) => {
                if (tab === 'devis_create') setEditDevisId(null);
                setCurrentTab(tab);
              }}
              onEditDevis={handleEditDevis}
            />
          )}

          {currentTab === 'articles' && <ArticlesView />}
          {currentTab === 'accessoires' && <AccessoiresView />}

          {currentTab === 'devis' && (
            <DevisListView
              setCurrentTab={(tab) => {
                if (tab === 'devis_create') setEditDevisId(null);
                setCurrentTab(tab);
              }}
              onEditDevis={handleEditDevis}
            />
          )}

          {currentTab === 'devis_create' && (
            <DevisCreateView
              editDevisId={editDevisId}
              setCurrentTab={(tab) => {
                setEditDevisId(null);
                setCurrentTab(tab);
              }}
              onSaved={(devisId) => {
                setEditDevisId(null);
                setCurrentTab('devis');
              }}
            />
          )}

          {currentTab === 'clients' && <ClientsView />}
          {currentTab === 'fournisseurs' && <FournisseursView />}
          {currentTab === 'bl' && <BonsLivraisonView />}
          {currentTab === 'factures' && <FacturesView />}
          {currentTab === 'caisse' && <CaisseView />}
          {currentTab === 'settings' && <SettingsView />}
          {currentTab.startsWith('rh_') && <RHView subTab={currentTab as any} />}
        </main>
      </div>

      {/* Legal Modals */}
      <CGUModal isOpen={cguOpen} onClose={() => setCguOpen(false)} />
      <CharteModal isOpen={charteOpen} onClose={() => setCharteOpen(false)} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;
