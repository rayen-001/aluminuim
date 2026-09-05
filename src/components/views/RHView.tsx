import React, { useState } from 'react';
import { useApp, Employe, AvanceSalaire, Conge } from '../../context/AppContext';
import {
  UserCheck, DollarSign, Calendar, FileText, Plus, Trash2, X,
  Edit2, CheckCircle, XCircle, Clock, Users, ChevronDown
} from 'lucide-react';

interface RHViewProps {
  subTab: 'rh_employes' | 'rh_avances' | 'rh_conges' | 'rh_paies';
}

export const RHView: React.FC<RHViewProps> = ({ subTab }) => {
  const {
    employes, addEmploye, updateEmploye, deleteEmploye,
    avancesSalaire, addAvanceSalaire, deleteAvanceSalaire,
    conges, addConge, updateCongeStatus, deleteConge,
    bulletinsPaie, addBulletinPaie, updateBulletinStatut, deleteBulletinPaie
  } = useApp();

  // ── Employes state ──────────────────────────────────────────────
  const [empModal, setEmpModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employe | null>(null);
  const [empNom, setEmpNom] = useState('');
  const [empPoste, setEmpPoste] = useState('');
  const [empTel, setEmpTel] = useState('');
  const [empSalaire, setEmpSalaire] = useState('800');
  const [empDate, setEmpDate] = useState('');

  // ── Avances state ───────────────────────────────────────────────
  const [avanceModal, setAvanceModal] = useState(false);
  const [avEmpId, setAvEmpId] = useState('');
  const [avDate, setAvDate] = useState(new Date().toISOString().split('T')[0]);
  const [avMontant, setAvMontant] = useState('');
  const [avMotif, setAvMotif] = useState('');

  // ── Congés state ────────────────────────────────────────────────
  const [congeModal, setCongeModal] = useState(false);
  const [cgEmpId, setCgEmpId] = useState('');
  const [cgDebut, setCgDebut] = useState(new Date().toISOString().split('T')[0]);
  const [cgFin, setCgFin] = useState(new Date().toISOString().split('T')[0]);
  const [cgType, setCgType] = useState<Conge['type']>('paye');
  const [cgNotes, setCgNotes] = useState('');

  // ── Bulletins state ─────────────────────────────────────────────
  const [bulletinModal, setBulletinModal] = useState(false);
  const [blEmpId, setBlEmpId] = useState('');
  const [blMois, setBlMois] = useState(new Date().toISOString().slice(0, 7));

  // ── Employes handlers ───────────────────────────────────────────
  const openNewEmp = () => {
    setEditingEmp(null);
    setEmpNom(''); setEmpPoste(''); setEmpTel(''); setEmpSalaire('800'); setEmpDate('');
    setEmpModal(true);
  };

  const openEditEmp = (e: Employe) => {
    setEditingEmp(e);
    setEmpNom(e.nom); setEmpPoste(e.poste); setEmpTel(e.telephone);
    setEmpSalaire(String(e.salaire_base)); setEmpDate(e.date_embauche || '');
    setEmpModal(true);
  };

  const handleSaveEmp = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!empNom.trim()) return;
    const data = { nom: empNom, poste: empPoste, telephone: empTel, salaire_base: parseFloat(empSalaire) || 0, date_embauche: empDate, actif: true };
    if (editingEmp) {
      updateEmploye(editingEmp.id, data);
    } else {
      addEmploye(data);
    }
    setEmpModal(false);
  };

  // ── Avances handler ─────────────────────────────────────────────
  const handleSaveAvance = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!avEmpId || !avMontant) return;
    const emp = employes.find(e => e.id === avEmpId);
    if (!emp) return;
    addAvanceSalaire({ employe_id: avEmpId, employe_nom: emp.nom, date: avDate, montant: parseFloat(avMontant) || 0, motif: avMotif });
    setAvMontant(''); setAvMotif(''); setAvanceModal(false);
  };

  // ── Congés handler ──────────────────────────────────────────────
  const handleSaveConge = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!cgEmpId) return;
    const emp = employes.find(e => e.id === cgEmpId);
    if (!emp) return;
    addConge({ employe_id: cgEmpId, employe_nom: emp.nom, date_debut: cgDebut, date_fin: cgFin, type: cgType, status: 'attente', notes: cgNotes });
    setCgNotes(''); setCongeModal(false);
  };

  // ── Bulletins handler ───────────────────────────────────────────
  const handleGenerateBulletin = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!blEmpId || !blMois) return;
    const emp = employes.find(e => e.id === blEmpId);
    if (!emp) return;
    // Check if bulletin already exists for this month
    const existing = bulletinsPaie.find(b => b.employe_id === blEmpId && b.mois === blMois);
    if (existing) { alert(`Un bulletin existe déjà pour ${emp.nom} en ${blMois}`); return; }
    // Sum avances for this month
    const avancesMonth = avancesSalaire
      .filter(a => a.employe_id === blEmpId && a.date.startsWith(blMois))
      .reduce((s, a) => s + a.montant, 0);
    const net = Math.max(0, emp.salaire_base - avancesMonth);
    addBulletinPaie({
      employe_id: blEmpId,
      employe_nom: emp.nom,
      mois: blMois,
      salaire_base: emp.salaire_base,
      avances_deduites: avancesMonth,
      net_a_payer: net,
      statut_paiement: 'non_paye'
    });
    setBulletinModal(false);
  };

  const calcNbJours = (debut: string, fin: string) => {
    const d1 = new Date(debut); const d2 = new Date(fin);
    return Math.max(1, Math.round((d2.getTime() - d1.getTime()) / 86400000) + 1);
  };

  const titleMap = {
    rh_employes: 'Employés & Équipe',
    rh_avances: 'Avances sur Salaire',
    rh_conges: 'Gestion des Congés',
    rh_paies: 'Bulletins de Paie'
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{titleMap[subTab]}</h1>
          <p className="text-xs sm:text-sm text-gray-500">Module RH — gestion des collaborateurs de l'atelier</p>
        </div>
        {subTab === 'rh_employes' && (
          <button onClick={openNewEmp} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition w-fit">
            <Plus className="w-4 h-4" /><span>Ajouter un Employé</span>
          </button>
        )}
        {subTab === 'rh_avances' && (
          <button onClick={() => setAvanceModal(true)} disabled={employes.length === 0}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition w-fit">
            <Plus className="w-4 h-4" /><span>Nouvelle Avance</span>
          </button>
        )}
        {subTab === 'rh_conges' && (
          <button onClick={() => setCongeModal(true)} disabled={employes.length === 0}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition w-fit">
            <Plus className="w-4 h-4" /><span>Demande de Congé</span>
          </button>
        )}
        {subTab === 'rh_paies' && (
          <button onClick={() => setBulletinModal(true)} disabled={employes.length === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition w-fit">
            <Plus className="w-4 h-4" /><span>Générer Bulletin</span>
          </button>
        )}
      </div>

      {/* ══════════════ EMPLOYÉS ══════════════ */}
      {subTab === 'rh_employes' && (
        <div className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden">
          {employes.length === 0 ? (
            <div className="p-12 text-center text-gray-400 space-y-2">
              <UserCheck className="w-12 h-12 mx-auto stroke-1 text-gray-300" />
              <p className="text-sm font-semibold text-gray-700">Aucun employé enregistré</p>
              <p className="text-xs text-gray-400">Commencez par ajouter vos collaborateurs.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                  <tr>
                    <th className="px-5 py-3">Nom & Prénom</th>
                    <th className="px-5 py-3">Poste</th>
                    <th className="px-5 py-3">Téléphone</th>
                    <th className="px-5 py-3">Date Embauche</th>
                    <th className="px-5 py-3 text-right">Salaire Base</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {employes.map(e => (
                    <tr key={e.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                            {e.nom.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-gray-900">{e.nom}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-700">{e.poste || '—'}</td>
                      <td className="px-5 py-3.5 text-gray-600">{e.telephone || '—'}</td>
                      <td className="px-5 py-3.5 text-gray-500">{e.date_embauche || '—'}</td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-gray-900">{e.salaire_base.toFixed(2)} DT</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditEmp(e)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => { if (confirm(`Supprimer ${e.nom} ?`)) deleteEmploye(e.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ AVANCES ══════════════ */}
      {subTab === 'rh_avances' && (
        <>
          {employes.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 font-semibold">
              ⚠️ Ajoutez d'abord des employés dans l'onglet "Employés".
            </div>
          )}
          <div className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden">
            {avancesSalaire.length === 0 ? (
              <div className="p-12 text-center text-gray-400 space-y-2">
                <DollarSign className="w-12 h-12 mx-auto stroke-1 text-gray-300" />
                <p className="text-sm font-semibold text-gray-700">Aucune avance enregistrée</p>
                <p className="text-xs text-gray-400">Les avances accordées aux employés s'afficheront ici.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                    <tr>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Employé</th>
                      <th className="px-5 py-3">Motif</th>
                      <th className="px-5 py-3 text-right">Montant</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {avancesSalaire.map(a => (
                      <tr key={a.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 text-gray-600">{a.date}</td>
                        <td className="px-5 py-3 font-bold text-gray-900">{a.employe_nom}</td>
                        <td className="px-5 py-3 text-gray-600">{a.motif || '—'}</td>
                        <td className="px-5 py-3 text-right font-mono font-bold text-amber-700">-{a.montant.toFixed(2)} DT</td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => { if (confirm('Supprimer cette avance ?')) deleteAvanceSalaire(a.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-amber-50 border-t border-amber-100">
                    <tr>
                      <td colSpan={3} className="px-5 py-2.5 text-xs font-bold text-amber-700">TOTAL AVANCES</td>
                      <td className="px-5 py-2.5 text-right font-mono font-extrabold text-amber-800">
                        -{avancesSalaire.reduce((s, a) => s + a.montant, 0).toFixed(2)} DT
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ══════════════ CONGÉS ══════════════ */}
      {subTab === 'rh_conges' && (
        <>
          {employes.length === 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-700 font-semibold">
              ⚠️ Ajoutez d'abord des employés dans l'onglet "Employés".
            </div>
          )}
          <div className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden">
            {conges.length === 0 ? (
              <div className="p-12 text-center text-gray-400 space-y-2">
                <Calendar className="w-12 h-12 mx-auto stroke-1 text-gray-300" />
                <p className="text-sm font-semibold text-gray-700">Aucune demande de congé</p>
                <p className="text-xs text-gray-400">Les demandes de congé s'afficheront ici.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                    <tr>
                      <th className="px-5 py-3">Employé</th>
                      <th className="px-5 py-3">Du</th>
                      <th className="px-5 py-3">Au</th>
                      <th className="px-5 py-3 text-center">Jours</th>
                      <th className="px-5 py-3 text-center">Type</th>
                      <th className="px-5 py-3 text-center">Statut</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {conges.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 font-bold text-gray-900">{c.employe_nom}</td>
                        <td className="px-5 py-3 text-gray-600">{c.date_debut}</td>
                        <td className="px-5 py-3 text-gray-600">{c.date_fin}</td>
                        <td className="px-5 py-3 text-center font-mono font-bold">{calcNbJours(c.date_debut, c.date_fin)}j</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
                            c.type === 'paye' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            c.type === 'maladie' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-gray-50 text-gray-600 border-gray-200'
                          }`}>
                            {c.type === 'paye' ? 'Payé' : c.type === 'maladie' ? 'Maladie' : 'Non payé'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
                            c.status === 'approuve' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            c.status === 'refuse' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {c.status === 'approuve' ? '✓ Approuvé' : c.status === 'refuse' ? '✗ Refusé' : '⏳ En attente'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            {c.status === 'attente' && (
                              <>
                                <button onClick={() => updateCongeStatus(c.id, 'approuve')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Approuver"><CheckCircle className="w-4 h-4" /></button>
                                <button onClick={() => updateCongeStatus(c.id, 'refuse')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Refuser"><XCircle className="w-4 h-4" /></button>
                              </>
                            )}
                            <button onClick={() => { if (confirm('Supprimer ce congé ?')) deleteConge(c.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ══════════════ BULLETINS ══════════════ */}
      {subTab === 'rh_paies' && (
        <>
          {employes.length === 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700 font-semibold">
              ⚠️ Ajoutez d'abord des employés dans l'onglet "Employés".
            </div>
          )}
          <div className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden">
            {bulletinsPaie.length === 0 ? (
              <div className="p-12 text-center text-gray-400 space-y-2">
                <FileText className="w-12 h-12 mx-auto stroke-1 text-gray-300" />
                <p className="text-sm font-semibold text-gray-700">Aucun bulletin de paie généré</p>
                <p className="text-xs text-gray-400">Cliquez sur "Générer Bulletin" pour créer un bulletin mensuel.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                    <tr>
                      <th className="px-5 py-3">Mois</th>
                      <th className="px-5 py-3">Employé</th>
                      <th className="px-5 py-3 text-right">Salaire Base</th>
                      <th className="px-5 py-3 text-right">Avances</th>
                      <th className="px-5 py-3 text-right">Net à Payer</th>
                      <th className="px-5 py-3 text-center">Statut</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bulletinsPaie.map(b => (
                      <tr key={b.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 font-mono font-bold text-gray-700">{b.mois}</td>
                        <td className="px-5 py-3 font-bold text-gray-900">{b.employe_nom}</td>
                        <td className="px-5 py-3 text-right font-mono text-gray-700">{b.salaire_base.toFixed(2)} DT</td>
                        <td className="px-5 py-3 text-right font-mono text-amber-600">-{b.avances_deduites.toFixed(2)} DT</td>
                        <td className="px-5 py-3 text-right font-mono font-extrabold text-emerald-700">{b.net_a_payer.toFixed(2)} DT</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
                            b.statut_paiement === 'paye'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {b.statut_paiement === 'paye' ? '✓ Payé' : 'Non payé'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            {b.statut_paiement === 'non_paye' && (
                              <button onClick={() => updateBulletinStatut(b.id, 'paye')} className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition">
                                Marquer payé
                              </button>
                            )}
                            <button onClick={() => { if (confirm('Supprimer ce bulletin ?')) deleteBulletinPaie(b.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ══════ MODAL Employé ══════ */}
      {empModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">{editingEmp ? 'Modifier Employé' : 'Nouvel Employé'}</h3>
              <button onClick={() => setEmpModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveEmp} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nom & Prénom *</label>
                <input type="text" required value={empNom} onChange={e => setEmpNom(e.target.value)} placeholder="Ex: Mohamed Ben Ali"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Poste / Fonction</label>
                <input type="text" value={empPoste} onChange={e => setEmpPoste(e.target.value)} placeholder="Ex: Poseur aluminium"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone</label>
                <input type="text" value={empTel} onChange={e => setEmpTel(e.target.value)} placeholder="Ex: 98 123 456"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Salaire base (DT)</label>
                  <input type="number" step="0.01" value={empSalaire} onChange={e => setEmpSalaire(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Date embauche</label>
                  <input type="date" value={empDate} onChange={e => setEmpDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setEmpModal(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold">{editingEmp ? 'Modifier' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════ MODAL Avance ══════ */}
      {avanceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Nouvelle Avance sur Salaire</h3>
              <button onClick={() => setAvanceModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveAvance} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Employé *</label>
                <select required value={avEmpId} onChange={e => setAvEmpId(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm bg-white focus:ring-2 focus:ring-amber-500">
                  <option value="">-- Sélectionner un employé --</option>
                  {employes.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Date *</label>
                <input type="date" required value={avDate} onChange={e => setAvDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Montant (DT) *</label>
                <input type="number" required step="0.01" min="0.01" value={avMontant} onChange={e => setAvMontant(e.target.value)}
                  placeholder="0.00" className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm font-mono focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Motif</label>
                <input type="text" value={avMotif} onChange={e => setAvMotif(e.target.value)} placeholder="Avance sur salaire du mois..."
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-500" />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setAvanceModal(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════ MODAL Congé ══════ */}
      {congeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Demande de Congé</h3>
              <button onClick={() => setCongeModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveConge} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Employé *</label>
                <select required value={cgEmpId} onChange={e => setCgEmpId(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm bg-white focus:ring-2 focus:ring-purple-500">
                  <option value="">-- Sélectionner un employé --</option>
                  {employes.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Du *</label>
                  <input type="date" required value={cgDebut} onChange={e => setCgDebut(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Au *</label>
                  <input type="date" required value={cgFin} min={cgDebut} onChange={e => setCgFin(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Type de congé</label>
                <select value={cgType} onChange={e => setCgType(e.target.value as Conge['type'])}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm bg-white focus:ring-2 focus:ring-purple-500">
                  <option value="paye">Congé payé</option>
                  <option value="non_paye">Congé non payé</option>
                  <option value="maladie">Arrêt maladie</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
                <input type="text" value={cgNotes} onChange={e => setCgNotes(e.target.value)} placeholder="Optionnel"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-purple-500" />
              </div>
              {cgDebut && cgFin && (
                <p className="text-xs text-purple-700 font-semibold bg-purple-50 px-3 py-2 rounded-lg">
                  Durée: {calcNbJours(cgDebut, cgFin)} jour(s)
                </p>
              )}
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setCongeModal(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════ MODAL Bulletin ══════ */}
      {bulletinModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Générer Bulletin de Paie</h3>
              <button onClick={() => setBulletinModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleGenerateBulletin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Employé *</label>
                <select required value={blEmpId} onChange={e => setBlEmpId(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500">
                  <option value="">-- Sélectionner un employé --</option>
                  {employes.map(e => <option key={e.id} value={e.id}>{e.nom} — {e.salaire_base.toFixed(2)} DT</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mois *</label>
                <input type="month" required value={blMois} onChange={e => setBlMois(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500" />
              </div>
              {blEmpId && blMois && (() => {
                const emp = employes.find(e => e.id === blEmpId);
                const avancesM = avancesSalaire.filter(a => a.employe_id === blEmpId && a.date.startsWith(blMois)).reduce((s, a) => s + a.montant, 0);
                if (!emp) return null;
                return (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-gray-600">Salaire de base</span><span className="font-mono font-bold">{emp.salaire_base.toFixed(2)} DT</span></div>
                    <div className="flex justify-between"><span className="text-amber-700">Avances du mois</span><span className="font-mono font-bold text-amber-700">-{avancesM.toFixed(2)} DT</span></div>
                    <div className="flex justify-between border-t border-emerald-200 pt-1.5"><span className="font-bold text-emerald-800">Net à payer</span><span className="font-mono font-extrabold text-emerald-800">{Math.max(0, emp.salaire_base - avancesM).toFixed(2)} DT</span></div>
                  </div>
                );
              })()}
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setBulletinModal(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold">Générer le bulletin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
