import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Phone, Mail, LogOut, CheckCircle2 } from 'lucide-react';

export const SuspendedAccountView: React.FC = () => {
  const { user, signOut, settings } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Background Glow */}
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-lg w-full relative z-10 space-y-6">
        
        {/* Card */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
          
          {/* Icon Badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-500/10 border-2 border-rose-500/30 rounded-3xl text-rose-500 shadow-xl shadow-rose-500/10 mx-auto">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Compte Atelier Suspendu
            </h1>
            <p className="text-sm text-slate-400">
              L'accès à votre espace atelier <span className="font-semibold text-slate-200">"{settings.nom_atelier || user?.email}"</span> est temporairement désactivé ou votre abonnement est arrivé à expiration.
            </p>
          </div>

          {/* Reassurance Banner */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-left flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-slate-200">Vos données sont 100% conservées en sécurité</p>
              <p className="text-slate-400 leading-relaxed">
                Tous vos devis, clients, factures et configurations d'atelier sont précieusement sauvegardés dans le cloud. Rien n'est supprimé.
              </p>
            </div>
          </div>

          {/* Contact Support & Admin */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pour réactiver votre compte :
            </p>
            
            <a
              href="tel:+21658829700"
              className="flex items-center justify-center gap-2.5 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/25 transition text-sm cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Appeler le Support : +216 58 829 700</span>
            </a>

            <a
              href="mailto:contact@atelierpro.tn"
              className="flex items-center justify-center gap-2.5 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 px-4 rounded-xl transition text-xs cursor-pointer border border-slate-700"
            >
              <Mail className="w-4 h-4" />
              <span>Envoyer un Email : contact@atelierpro.tn</span>
            </a>
          </div>

          {/* Sign out */}
          <div className="pt-4 border-t border-slate-800/80">
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-rose-400 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Se déconnecter</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600">
          AtelierPro SaaS • Plateforme Sécurisée Cloud
        </p>

      </div>
    </div>
  );
};
