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
  subtitle = 'Bienvenue sur AtelierPro',
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
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3.5 sticky top-0 z-30 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 bg-blue-900 text-white rounded-lg shadow hover:bg-blue-800 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">{title}</h2>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canInstallPWA && onInstallPWA && (
            <button
              onClick={onInstallPWA}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Installer l'app (APK)</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-600 font-medium bg-gray-100 px-3 py-1.5 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <span className="capitalize">{todayFormatted}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
