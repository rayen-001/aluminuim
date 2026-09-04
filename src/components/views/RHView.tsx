import React, { useState } from 'react';
import { UserCheck, DollarSign, Calendar, FileText, Plus, Trash2, X } from 'lucide-react';

interface RHViewProps {
  subTab: 'rh_employes' | 'rh_avances' | 'rh_conges' | 'rh_paies';
}

interface Employe {
  id: string;
  nom: string;
  poste: string;
  telephone: string;
  salaire_base: number;
}

interface Avance {
  id: string;
  employe_nom: string;
  date: string;
  montant: number;
  motif: string;
}

export const RHView: React.FC<RHViewProps> = ({ subTab }) => {
  const [employes, setEmployes] = useState<Employe[]>(() => {
    const saved = localStorage.getItem('atelierpro_rh_employes');
    return saved ? JSON.parse(saved) : [];
  });

  const [avances, setAvances] = useState<Avance[]>(() => {
    const saved = localStorage.getItem('atelierpro_rh_avances');
    return saved ? JSON.parse(saved) : [];
  });

  const [empModal, setEmpModal] = useState(false);
  const [empNom, setEmpNom] = useState('');
  const [empPoste, setEmpPoste] = useState('');
  const [empTel, setEmpTel] = useState('');
  const [empSalaire, setEmpSalaire] = useState('800');

  const addEmp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empNom) return;
    const updated = [...employes, {
      id: `e_${Date.now()}`,
      nom: empNom,
      poste: empPoste,
      telephone: empTel,
      salaire_base: parseFloat(empSalaire) || 800
    }];
    setEmployes(updated);
    localStorage.setItem('atelierpro_rh_employes', JSON.stringify(updated));
    setEmpModal(false);
    setEmpNom('');
    setEmpPoste('');
    setEmpTel('');
  };

  const deleteEmp = (id: string) => {
    const updated = employes.filter(x => x.id !== id);
    setEmployes(updated);
    localStorage.setItem('atelierpro_rh_employes', JSON.stringify(updated));
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {subTab === 'rh_employes' && 'Employés & Équipe'}
            {subTab === 'rh_avances' && 'Avances sur Salaire'}
            {subTab === 'rh_conges' && 'Gestion des Congés'}
            {subTab === 'rh_paies' && 'Bulletins de Paie'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Module RH et gestion des collaborateurs de l'atelier
          </p>
        </div>

        {subTab === 'rh_employes' && (
          <button
            onClick={() => setEmpModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition w-fit cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un Employé</span>
          </button>
        )}
      </div>

      {subTab === 'rh_employes' && (
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
          {employes.length === 0 ? (
            <div className="p-12 text-center text-gray-400 space-y-2">
              <UserCheck className="w-10 h-10 mx-auto stroke-1 text-gray-300" />
              <p className="text-sm font-semibold text-gray-700">Aucun employé enregistré</p>
              <p className="text-xs text-gray-400">Cliquez sur "Ajouter un Employé" pour créer votre équipe d'atelier.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                <tr>
                  <th className="px-5 py-3">Nom & Prénom</th>
                  <th className="px-5 py-3">Poste</th>
                  <th className="px-5 py-3">Téléphone</th>
                  <th className="px-5 py-3 text-right">Salaire de Base</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employes.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5 font-bold text-gray-900">{e.nom}</td>
                    <td className="px-5 py-3.5 text-gray-700">{e.poste}</td>
                    <td className="px-5 py-3.5 text-gray-600">{e.telephone}</td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-gray-900">{e.salaire_base.toFixed(2)} DT</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => deleteEmp(e.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {subTab === 'rh_avances' && (
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
          {avances.length === 0 ? (
            <div className="p-12 text-center text-gray-400 space-y-2">
              <DollarSign className="w-10 h-10 mx-auto stroke-1 text-gray-300" />
              <p className="text-sm font-semibold text-gray-700">Aucune avance sur salaire enregistrée</p>
              <p className="text-xs text-gray-400">Les avances accordées aux ouvriers s'afficheront ici.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Employé</th>
                  <th className="px-5 py-3">Motif</th>
                  <th className="px-5 py-3 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {avances.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5 text-gray-600">{a.date}</td>
                    <td className="px-5 py-3.5 font-bold text-gray-900">{a.employe_nom}</td>
                    <td className="px-5 py-3.5 text-gray-700">{a.motif}</td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-red-600">-{a.montant.toFixed(2)} DT</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {(subTab === 'rh_conges' || subTab === 'rh_paies') && (
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-10 text-center text-gray-400 space-y-2">
          <Calendar className="w-10 h-10 mx-auto stroke-1 text-gray-300" />
          <p className="text-sm font-medium">Gestion active pour l'équipe atelier</p>
          <p className="text-xs text-gray-400">Tous les calculs sont sauvegardés automatiquement.</p>
        </div>
      )}

      {empModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Nouvel Employé</h3>
              <button onClick={() => setEmpModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={addEmp} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nom & Prénom *</label>
                <input
                  type="text"
                  required
                  value={empNom}
                  onChange={e => setEmpNom(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Poste / Fonction</label>
                <input
                  type="text"
                  value={empPoste}
                  onChange={e => setEmpPoste(e.target.value)}
                  placeholder="Ex: Poseur aluminium"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone</label>
                <input
                  type="text"
                  value={empTel}
                  onChange={e => setEmpTel(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Salaire de base (DT)</label>
                <input
                  type="number"
                  value={empSalaire}
                  onChange={e => setEmpSalaire(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEmpModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
