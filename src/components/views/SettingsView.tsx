import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Save, Check, Percent, Layers, Wrench } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings } = useApp();

  const [nom, setNom] = useState(settings.nom_atelier);
  const [activite, setActivite] = useState(settings.activite);
  const [tel, setTel] = useState(settings.telephone);
  const [adresse, setAdresse] = useState(settings.adresse);
  const [email, setEmail] = useState(settings.email);
  const [matriculeFiscal, setMatriculeFiscal] = useState(settings.matricule_fiscal || '');
  const [logoUrl, setLogoUrl] = useState(settings.logo_url || '');
  const [tva, setTva] = useState(String(settings.tva_default));
  const [margeAlu, setMargeAlu] = useState(String(settings.marge_alu_default ?? 0));
  const [margeGc, setMargeGc] = useState(String(settings.marge_gc_default ?? 0));
  const [margeMousti, setMargeMousti] = useState(String(settings.marge_mousti_default ?? 0));
  const [margeStore, setMargeStore] = useState(String(settings.marge_store_default ?? 0));
  const [fraisPoseDefault, setFraisPoseDefault] = useState(String(settings.frais_pose_default ?? 0));
  const [fraisTransportDefault, setFraisTransportDefault] = useState(String(settings.frais_transport_default ?? 0));

  // Profilés par défaut de l'atelier
  const [s40Dormant, setS40Dormant] = useState(settings.default_profiles?.s40_dormant || '40100');
  const [s40Ouvrant, setS40Ouvrant] = useState(settings.default_profiles?.s40_ouvrant || '40401');
  const [s40Parclose, setS40Parclose] = useState(settings.default_profiles?.s40_parclose || '40110');
  const [s67Dormant, setS67Dormant] = useState(settings.default_profiles?.s67_dormant || '67101');
  const [s67Lateral, setS67Lateral] = useState(settings.default_profiles?.s67_lateral || '67104');
  const [s67Central, setS67Central] = useState(settings.default_profiles?.s67_central || '67105');
  const [fixCadre, setFixCadre] = useState(settings.default_profiles?.fix_cadre || '40100');
  const [fixSocle, setFixSocle] = useState(settings.default_profiles?.fix_socle || '40154');

  const [savedMsg, setSavedMsg] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      nom_atelier: nom,
      activite,
      telephone: tel,
      adresse,
      email,
      matricule_fiscal: matriculeFiscal,
      logo_url: logoUrl,
      tva_default: parseFloat(tva) || 19,
      marge_alu_default: parseFloat(margeAlu) || 0,
      marge_gc_default: parseFloat(margeGc) || 0,
      marge_mousti_default: parseFloat(margeMousti) || 0,
      marge_store_default: parseFloat(margeStore) || 0,
      frais_pose_default: parseFloat(fraisPoseDefault) || 0,
      frais_transport_default: parseFloat(fraisTransportDefault) || 0,
      default_profiles: {
        s40_dormant: s40Dormant,
        s40_ouvrant: s40Ouvrant,
        s40_parclose: s40Parclose,
        s67_dormant: s67Dormant,
        s67_lateral: s67Lateral,
        s67_central: s67Central,
        fix_cadre: fixCadre,
        fix_socle: fixSocle
      }
    });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Paramètres de l'Atelier</h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Configuration des informations d'en-tête, logo et devis imprimés
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section: Informations Atelier */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Informations de l'Atelier & Société</p>
            
            {/* Logo Upload / Preview */}
            <div className="mb-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-16 h-16 rounded-xl border border-gray-200 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo Atelier" className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-[10px] font-bold text-gray-400 text-center uppercase leading-tight">Pas de logo</span>
                )}
              </div>
              <div className="flex-1 space-y-1.5 text-center sm:text-left">
                <label className="block text-xs font-bold text-gray-800">Logo de l'Atelier / Société</label>
                <p className="text-[11px] text-gray-500">Apparaîtra en haut à gauche de vos Devis Techniques et Factures</p>
                <div className="flex items-center gap-2 pt-1">
                  <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold transition shadow-2xs">
                    <span>{logoUrl ? 'Changer de Logo' : 'Importer une Image'}</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            </div>

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

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Matricule Fiscal (MF)</label>
                <input
                  type="text"
                  value={matriculeFiscal}
                  onChange={e => setMatriculeFiscal(e.target.value)}
                  placeholder="Ex: 1234567/A/M/000"
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

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Adresse de l'Atelier</label>
                <input
                  type="text"
                  value={adresse}
                  onChange={e => setAdresse(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500"
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
                  🏪 Store Rideau (%)
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

          {/* Section: Prestations de Chantier par Défaut */}
          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Wrench className="w-4 h-4 text-indigo-600" />
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Prestations de Chantier par Défaut</p>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Montants fixes pré-remplis automatiquement lors de la création d'un devis (modifiables par devis).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  🔧 Pose & Montage par défaut (DT)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={fraisPoseDefault}
                    onChange={e => setFraisPoseDefault(e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 pr-10 text-sm font-mono font-bold focus:ring-2 focus:ring-indigo-400"
                  />
                  <span className="absolute right-3 top-2 text-gray-400 text-xs font-bold">DT</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  🚚 Transport / Livraison par défaut (DT)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={fraisTransportDefault}
                    onChange={e => setFraisTransportDefault(e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 pr-10 text-sm font-mono font-bold focus:ring-2 focus:ring-indigo-400"
                  />
                  <span className="absolute right-3 top-2 text-gray-400 text-xs font-bold">DT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Profilés & Références par Défaut de l'Atelier */}
          <div className="border-t border-gray-100 pt-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Profilés & Références Préférés de l'Atelier</p>
            </div>
            <p className="text-xs text-gray-500">
              Sélectionnez les références d'aluminium que vous utilisez couramment. Elles seront chargées automatiquement par défaut lors de la création de vos nouveaux devis (avec possibilité de les changer par devis).
            </p>

            {/* S40 Frappe Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  🪟 Série 40 — Frappe (Fenêtres & Portes à la française)
                </span>
                {s40Ouvrant === '40404' && (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                    ⭐ Ouvrant Monobloc (Parclose intégrée)
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Dormant par défaut</label>
                  <select
                    value={s40Dormant}
                    onChange={e => setS40Dormant(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="40100">40100 — Dormant standard</option>
                    <option value="40402">40402 — Dormant avec couvre-joint (35mm)</option>
                    <option value="40102">40102 — Dormant tubulaire</option>
                    <option value="40148">40148 — Dormant rénovation</option>
                    <option value="40165">40165 — Dormant large</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Ouvrant par défaut</label>
                  <select
                    value={s40Ouvrant}
                    onChange={e => setS40Ouvrant(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="40401">40401 — Ouvrant standard</option>
                    <option value="40404">40404 — Ouvrant monobloc (Sans parclose)</option>
                    <option value="40150">40150 — Ouvrant porte</option>
                    <option value="40403">40403 — Ouvrant arrondi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Parclose {s40Ouvrant === '40404' ? '(Désactivée car Monobloc)' : 'par défaut'}
                  </label>
                  <select
                    disabled={s40Ouvrant === '40404'}
                    value={s40Parclose}
                    onChange={e => setS40Parclose(e.target.value)}
                    className={`w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 bg-white ${s40Ouvrant === '40404' ? 'opacity-40 cursor-not-allowed bg-gray-100' : ''}`}
                  >
                    <option value="40110">40110 — Parclose simple 15mm</option>
                    <option value="40111">40111 — Parclose simple 19mm</option>
                    <option value="40139">40139 — Parclose simple moulurée</option>
                    <option value="40166">40166 — Parclose simple ronde</option>
                  </select>
                </div>
              </div>
            </div>

            {/* S67 Coulissant Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                🪟 Série 67 — Coulissant
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Dormant par défaut</label>
                  <select
                    value={s67Dormant}
                    onChange={e => setS67Dormant(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="67101">67101 — Dormant standard 2 rails</option>
                    <option value="67103">67103 — Dormant avec couvre-joint</option>
                    <option value="67110">67110 — Dormant 3 rails</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Montant Latéral par défaut</label>
                  <select
                    value={s67Lateral}
                    onChange={e => setS67Lateral(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="67104">67104 — Montant latéral standard</option>
                    <option value="67108">67108 — Montant latéral renforcé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Chicane Centrale par défaut</label>
                  <select
                    value={s67Central}
                    onChange={e => setS67Central(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="67105">67105 — Chicane centrale standard</option>
                    <option value="67107">67107 — Chicane centrale renforcée</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Châssis Fixe Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                🖼️ Châssis Fixe
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Cadre par défaut</label>
                  <select
                    value={fixCadre}
                    onChange={e => setFixCadre(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="40100">40100 — Cadre standard</option>
                    <option value="40402">40402 — Cadre avec couvre-joint</option>
                    <option value="40102">40102 — Cadre tubulaire</option>
                    <option value="40148">40148 — Cadre rénovation</option>
                    <option value="40165">40165 — Cadre large</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Socle par défaut</label>
                  <select
                    value={fixSocle}
                    onChange={e => setFixSocle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="40154">40154 — Socle standard</option>
                    <option value="40121">40121 — Socle renforcé</option>
                    <option value="40100">40100 — Socle 40100</option>
                    <option value="40102">40102 — Socle 40102</option>
                  </select>
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
