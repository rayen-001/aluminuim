import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Save, Check, Percent } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings } = useApp();

  const [nom, setNom] = useState(settings.nom_atelier);
  const [activite, setActivite] = useState(settings.activite);
  const [tel, setTel] = useState(settings.telephone);
  const [adresse, setAdresse] = useState(settings.adresse);
  const [email, setEmail] = useState(settings.email);
  const [tva, setTva] = useState(String(settings.tva_default));
  const [margeAlu, setMargeAlu] = useState(String(settings.marge_alu_default ?? 0));
  const [margeGc, setMargeGc] = useState(String(settings.marge_gc_default ?? 0));
  const [margeMousti, setMargeMousti] = useState(String(settings.marge_mousti_default ?? 0));
  const [margeStore, setMargeStore] = useState(String(settings.marge_store_default ?? 0));
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      nom_atelier: nom,
      activite,
      telephone: tel,
      adresse,
      email,
      tva_default: parseFloat(tva) || 19,
      marge_alu_default: parseFloat(margeAlu) || 0,
      marge_gc_default: parseFloat(margeGc) || 0,
      marge_mousti_default: parseFloat(margeMousti) || 0,
      marge_store_default: parseFloat(margeStore) || 0
    });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Paramètres de l'Atelier</h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Configuration des informations d'en-tête et devis imprimés
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section: Informations Atelier */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Informations de l'Atelier</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nom de l'Atelier / Entreprise</label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={e => setNom(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Activité / Sous-titre</label>
                <input
                  type="text"
                  value={activite}
                  onChange={e => setActivite(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone de contact</label>
                <input
                  type="text"
                  value={tel}
                  onChange={e => setTel(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Adresse de l'Atelier</label>
                <input
                  type="text"
                  value={adresse}
                  onChange={e => setAdresse(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Taux TVA par défaut (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={tva}
                  onChange={e => setTva(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Marges par Défaut */}
          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Percent className="w-4 h-4 text-amber-600" />
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Marges Bénéficiaires par Défaut</p>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Ces valeurs seront pré-remplies automatiquement lors de la création de chaque nouveau devis.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  🪟 Fenêtres / Portes (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={margeAlu}
                    onChange={e => setMargeAlu(e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 pr-8 text-sm font-mono font-bold focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="absolute right-3 top-2 text-gray-400 text-xs font-bold">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  🛡️ Garde-Corps (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={margeGc}
                    onChange={e => setMargeGc(e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 pr-8 text-sm font-mono font-bold focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="absolute right-3 top-2 text-gray-400 text-xs font-bold">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  🦟 Moustiquaire (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={margeMousti}
                    onChange={e => setMargeMousti(e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 pr-8 text-sm font-mono font-bold focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="absolute right-3 top-2 text-gray-400 text-xs font-bold">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  🪟 Store Rideau (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={margeStore}
                    onChange={e => setMargeStore(e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 pr-8 text-sm font-mono font-bold focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="absolute right-3 top-2 text-gray-400 text-xs font-bold">%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-gray-100">
            {savedMsg ? (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg">
                <Check className="w-4 h-4" />
                Paramètres enregistrés !
              </span>
            ) : <span />}

            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xs transition"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer les paramètres</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
