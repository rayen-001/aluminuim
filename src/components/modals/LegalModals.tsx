import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CGUModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-base font-bold text-gray-900">Conditions générales d'utilisation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs sm:text-sm text-gray-600 space-y-3 leading-relaxed">
          <p><strong>1. Objet</strong><br />AtelierPro est une plateforme destinée à la gestion des devis, bons de livraison et factures pour les ateliers de menuiserie aluminium.</p>
          <p><strong>2. Accès au service</strong><br />L'accès est réservé aux utilisateurs autorisés. Chaque atelier est responsable de ses chiffrages et de la conformité de ses devis.</p>
          <p><strong>3. Confidentialité</strong><br />Les tarifs, prix des profilés et données clients restent la propriété stricte de votre atelier.</p>
          <p><strong>4. Responsabilités</strong><br />Les formules de calcul fournies permettent une estimation précise des matériaux (aluminium, vitrage, quincaillerie).</p>
        </div>

        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export const CharteModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-base font-bold text-gray-900">Charte des données & cookies</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs sm:text-sm text-gray-600 space-y-3 leading-relaxed">
          <p><strong>1. Données collectées</strong><br />AtelierPro conserve vos données localement pour un fonctionnement fluide et autonome même sans connexion Internet (hors-ligne).</p>
          <p><strong>2. Sécurité</strong><br />Vos devis et factures sont stockés en toute sécurité dans la mémoire de votre appareil.</p>
          <p><strong>3. Respect de la vie privée</strong><br />Aucune donnée confidentielle ou financière n'est transmise à des tiers sans votre consentement.</p>
        </div>

        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
