import React from 'react';
import { Menu, Download, Calendar } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  onInstallPWA?: () => void;
  canInstallPWA?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle = 'Bienvenue sur AluPro',
  onMenuClick,
  onInstallPWA,
  canInstallPWA
}) => {
  // Format current French date
  const todayFormatted = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  return (
    <header className="bg-white/85 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-6 py-3.5 sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 bg-blue-900 text-white rounded-xl shadow-md hover:bg-blue-800 active:scale-95 transition cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 leading-tight tracking-tight">{title}</h2>
            <p className="text-xs text-gray-500 font-medium">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canInstallPWA && onInstallPWA && (
            <button
              onClick={onInstallPWA}
              className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm shadow-blue-600/20 active:scale-95 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Installer l'app (APK)</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 font-medium bg-slate-100/90 border border-slate-200/80 px-3.5 py-1.5 rounded-xl shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span className="capitalize">{todayFormatted}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
