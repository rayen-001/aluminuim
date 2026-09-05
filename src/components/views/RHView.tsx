import React, { useState } from 'react';
import { useApp, Employe, AvanceSalaire, Conge, BulletinPaie } from '../../context/AppContext';
import {
  UserCheck, DollarSign, Calendar, FileText, Plus, Trash2, X,
  Edit2, CheckCircle, XCircle, Clock, Users, ArrowLeft,
  Phone, Briefcase, TrendingDown, CreditCard, AlertCircle,
  CalendarCheck, ChevronRight, Printer, Wallet, Search,
  ArrowRight
} from 'lucide-react';

interface RHViewProps {
  subTab: 'rh_employes' | 'rh_avances' | 'rh_conges' | 'rh_paies';
}

export const RHView: React.FC<RHViewProps> = ({ subTab }) => {
  const {
    employes, addEmploye, updateEmploye, deleteEmploye,
    avancesSalaire, addAvanceSalaire, deleteAvanceSalaire,
    conges, addConge, updateCongeStatus, deleteConge,
    bulletinsPaie, addBulletinPaie, updateBulletinStatut, paySalaryBulletin,
    settleSalaryPayment, deleteBulletinPaie
  } = useApp();

  const currentMonthStr = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const currentMonthName = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date());

  const getNextMonthStr = (monthStr: string) => {
    const [yStr, mStr] = monthStr.split('-');
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);
    if (m === 12) return `${y + 1}-01`;
    return `${y}-${String(m + 1).padStart(2, '0')}`;
  };

  const nextMonthStr = getNextMonthStr(currentMonthStr);
  const nextMonthName = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
  );

  // Unified helper for month attribution
  const isAvanceForMonth = (a: AvanceSalaire, targetMois: string) => {
    return a.mois_imputation ? a.mois_imputation === targetMois : a.date.startsWith(targetMois);
  };

  // Selected Employee for Fiche Détaillée
  const [selectedEmp, setSelectedEmp] = useState<Employe | null>(null);
  const [empActiveTab, setEmpActiveTab] = useState<'avances' | 'conges' | 'paies' | 'journal'>('avances');
  const [searchEmp, setSearchEmp] = useState('');

  // ── Quick Pay Modal state ─────────────────────────────────────────
  const [payModal, setPayModal] = useState(false);
  const [payEmp, setPayEmp] = useState<Employe | null>(null);
  const [payMontant, setPayMontant] = useState('');
  const [payMode, setPayMode] = useState<'especes' | 'cheque' | 'virement'>('especes');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payMois, setPayMois] = useState(currentMonthStr);
  const [payNotes, setPayNotes] = useState('');

  // ── Employes Modal state ──────────────────────────────────────────
  const [empModal, setEmpModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employe | null>(null);
  const [empNom, setEmpNom] = useState('');
  const [empPoste, setEmpPoste] = useState('');
  const [empTel, setEmpTel] = useState('');
  const [empSalaire, setEmpSalaire] = useState('800');
  const [empDate, setEmpDate] = useState('');

  // ── Avances Modal state ───────────────────────────────────────────
  const [avanceModal, setAvanceModal] = useState(false);
  const [avEmpId, setAvEmpId] = useState('');
  const [avDate, setAvDate] = useState(new Date().toISOString().split('T')[0]);
  const [avMoisImputation, setAvMoisImputation] = useState(currentMonthStr);
  const [avMontant, setAvMontant] = useState('');
  const [avMotif, setAvMotif] = useState('');

  // ── Congés Modal state ────────────────────────────────────────────
  const [congeModal, setCongeModal] = useState(false);
  const [cgEmpId, setCgEmpId] = useState('');
  const [cgDebut, setCgDebut] = useState(new Date().toISOString().split('T')[0]);
  const [cgFin, setCgFin] = useState(new Date().toISOString().split('T')[0]);
  const [cgType, setCgType] = useState<Conge['type']>('paye');
  const [cgNotes, setCgNotes] = useState('');

  // ── Bulletins Modal state ─────────────────────────────────────────
  const [bulletinModal, setBulletinModal] = useState(false);
  const [blEmpId, setBlEmpId] = useState('');
  const [blMois, setBlMois] = useState(currentMonthStr);

  // ── Employes handlers ─────────────────────────────────────────────
  const openNewEmp = () => {
    setEditingEmp(null);
    setEmpNom(''); setEmpPoste(''); setEmpTel(''); setEmpSalaire('800'); setEmpDate('');
    setEmpModal(true);
  };

  const openEditEmp = (e: Employe) => {
    setEditingEmp(e);
    setEmpNom(e.nom); setEmpPoste(e.poste || ''); setEmpTel(e.telephone || '');
    setEmpSalaire(String(e.salaire_base || 0)); setEmpDate(e.date_embauche || '');
    setEmpModal(true);
  };

  const handleSaveEmp = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!empNom.trim()) return;
    const data = {
      nom: empNom.trim(),
      poste: empPoste.trim(),
      telephone: empTel.trim(),
      salaire_base: parseFloat(empSalaire) || 0,
      date_embauche: empDate,
      actif: true
    };
    if (editingEmp) {
      updateEmploye(editingEmp.id, data);
      if (selectedEmp?.id === editingEmp.id) {
        setSelectedEmp(prev => prev ? { ...prev, ...data } : null);
      }
    } else {
      addEmploye(data);
    }
    setEmpModal(false);
  };

  // ── Avances handler ───────────────────────────────────────────────
  const openNewAvanceForEmp = (empId?: string) => {
    const targetId = empId || (employes[0]?.id || '');
    setAvEmpId(targetId);
    setAvDate(new Date().toISOString().split('T')[0]);
    
    // Auto-detect if current month is already paid
    const bulCeMois = bulletinsPaie.find(b => b.employe_id === targetId && b.mois === currentMonthStr);
    const isPaid = bulCeMois?.statut_paiement === 'paye';
    setAvMoisImputation(isPaid ? nextMonthStr : currentMonthStr);

    setAvMontant('');
    setAvMotif('');
    setAvanceModal(true);
  };

  const handleSaveAvance = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!avEmpId || !avMontant) return;
    const emp = employes.find(e => e.id === avEmpId);
    if (!emp) return;
    addAvanceSalaire({
      employe_id: avEmpId,
      employe_nom: emp.nom,
      date: avDate,
      mois_imputation: avMoisImputation || currentMonthStr,
      montant: parseFloat(avMontant) || 0,
      motif: avMotif.trim()
    });
    setAvMontant(''); setAvMotif(''); setAvanceModal(false);
  };

  // ── Congés handler ────────────────────────────────────────────────
  const openNewCongeForEmp = (empId?: string) => {
    setCgEmpId(empId || (employes[0]?.id || ''));
    setCgDebut(new Date().toISOString().split('T')[0]);
    setCgFin(new Date().toISOString().split('T')[0]);
    setCgType('paye');
    setCgNotes('');
    setCongeModal(true);
  };

  const handleSaveConge = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!cgEmpId) return;
    const emp = employes.find(e => e.id === cgEmpId);
    if (!emp) return;
    addConge({
      employe_id: cgEmpId,
      employe_nom: emp.nom,
      date_debut: cgDebut,
      date_fin: cgFin,
      type: cgType,
      status: 'attente',
      notes: cgNotes.trim()
    });
    setCgNotes(''); setCongeModal(false);
  };

  // ── Bulletins handler ─────────────────────────────────────────────
  const openNewBulletinForEmp = (empId?: string) => {
    setBlEmpId(empId || (employes[0]?.id || ''));
    setBlMois(currentMonthStr);
    setBulletinModal(true);
  };

  const handleGenerateBulletin = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!blEmpId || !blMois) return;
    const emp = employes.find(e => e.id === blEmpId);
    if (!emp) return;
    
    // Check if bulletin already exists for this month
    const existing = bulletinsPaie.find(b => b.employe_id === blEmpId && b.mois === blMois);
    if (existing) {
      alert(`Un bulletin de paie existe déjà pour ${emp.nom} pour le mois ${blMois}`);
      return;
    }

    // Sum avances for this month using isAvanceForMonth
    const avancesMonth = avancesSalaire
      .filter(a => a.employe_id === blEmpId && isAvanceForMonth(a, blMois))
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

  // ── Quick Pay Handlers ────────────────────────────────────────────
  const openQuickPay = (e: Employe, moisToPay = currentMonthStr) => {
    setPayEmp(e);
    setPayMois(moisToPay);
    setPayDate(new Date().toISOString().split('T')[0]);
    setPayMode('especes');
    setPayNotes('');

    // Calculate advances and remainder for this month using isAvanceForMonth
    const empAv = avancesSalaire
      .filter(a => a.employe_id === e.id && isAvanceForMonth(a, moisToPay))
      .reduce((s, a) => s + a.montant, 0);
    const bul = bulletinsPaie.find(b => b.employe_id === e.id && b.mois === moisToPay);
    const netTotal = Math.max(0, (e.salaire_base || 0) - empAv);
    const isAlreadyPaid = bul ? bul.statut_paiement === 'paye' : false;
    const reste = isAlreadyPaid ? 0 : netTotal;

    setPayMontant(reste > 0 ? String(reste) : String(netTotal > 0 ? netTotal : e.salaire_base));
    setPayModal(true);
  };

  const handleConfirmQuickPay = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!payEmp || !payMontant) return;
    const montant = parseFloat(payMontant) || 0;
    if (montant <= 0) return;

    settleSalaryPayment(payEmp.id, montant, payMode, payDate, payMois, payNotes);
    setPayModal(false);
  };

  const calcNbJours = (debut: string, fin: string) => {
    const d1 = new Date(debut); const d2 = new Date(fin);
    return Math.max(1, Math.round((d2.getTime() - d1.getTime()) / 86400000) + 1);
  };

  // Next pay date estimation (end of current month)
  const getNextPayDate = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return lastDay.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const titleMap = {
    rh_employes: 'Employés & Équipe',
    rh_avances: 'Avances sur Salaire',
    rh_conges: 'Gestion des Congés',
    rh_paies: 'Bulletins de Paie'
  };

  // ══════════════════════════════════════════════════════════════════
  // FICHE EMPLOYÉ ULTRA-DÉTAILLÉE
  // ══════════════════════════════════════════════════════════════════
  if (selectedEmp && subTab === 'rh_employes') {
    const empAvances = avancesSalaire.filter(a => a.employe_id === selectedEmp.id);
    const empConges = conges.filter(c => c.employe_id === selectedEmp.id);
    const empBulletins = bulletinsPaie.filter(b => b.employe_id === selectedEmp.id);

    // Calculations for this employee
    const totalAvancesHistorique = empAvances.reduce((s, a) => s + a.montant, 0);
    const avancesCeMois = empAvances
      .filter(a => isAvanceForMonth(a, currentMonthStr))
      .reduce((s, a) => s + a.montant, 0);
    const avancesMoisProchain = empAvances
      .filter(a => isAvanceForMonth(a, nextMonthStr))
      .reduce((s, a) => s + a.montant, 0);

    const totalBulletinsPayes = empBulletins
      .filter(b => b.statut_paiement === 'paye')
      .reduce((s, b) => s + b.net_a_payer, 0);

    const totalDebourseHistorique = totalBulletinsPayes + totalAvancesHistorique;
    const netCeMois = Math.max(0, selectedEmp.salaire_base - avancesCeMois);
    const bulCeMois = empBulletins.find(b => b.mois === currentMonthStr);
    const isCeMoisPaye = bulCeMois?.statut_paiement === 'paye';
    const resteNetCeMois = isCeMoisPaye ? 0 : netCeMois;

    const totalJoursCongesApprouves = empConges
      .filter(c => c.status === 'approuve')
      .reduce((s, c) => s + calcNbJours(c.date_debut, c.date_fin), 0);

    // Combined Journal Chronologique
    const journalTimeline = [
      ...empAvances.map(a => ({
        id: a.id,
        date: a.date,
        type: 'avance' as const,
        title: `Avance sur salaire (-${a.montant.toFixed(2)} DT)`,
        details: a.motif || 'Avance accordée',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
      })),
      ...empConges.map(c => ({
        id: c.id,
        date: c.date_debut,
        type: 'conge' as const,
        title: `Congé (${c.type}) — ${calcNbJours(c.date_debut, c.date_fin)} jour(s)`,
        details: `Du ${c.date_debut} au ${c.date_fin} • Statut : ${c.status}`,
        badgeColor: c.status === 'approuve' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-purple-50 text-purple-700 border-purple-200'
      })),
      ...empBulletins.map(b => ({
        id: b.id,
        date: `${b.mois}-01`,
        type: 'bulletin' as const,
        title: `Bulletin de paie mois ${b.mois} (${b.net_a_payer.toFixed(2)} DT)`,
        details: `Salaire base: ${b.salaire_base.toFixed(2)} DT • Avances: -${b.avances_deduites.toFixed(2)} DT • ${b.statut_paiement === 'paye' ? 'Payé' : 'En attente'}`,
        badgeColor: b.statut_paiement === 'paye' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => setSelectedEmp(null)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la liste des employés</span>
        </button>

        {/* Header Profil Employé */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-2xl font-black shadow-md shrink-0">
              {selectedEmp.nom.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-gray-900">{selectedEmp.nom}</h1>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Actif
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs sm:text-sm text-gray-500">
                <span className="flex items-center gap-1.5 font-medium text-gray-700">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  {selectedEmp.poste || 'Poste non spécifié'}
                </span>
                {selectedEmp.telephone && (
                  <a href={`tel:${selectedEmp.telephone}`} className="flex items-center gap-1.5 text-blue-600 hover:underline">
                    <Phone className="w-4 h-4" />
                    {selectedEmp.telephone}
                  </a>
                )}
                {selectedEmp.date_embauche && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Embauché le {selectedEmp.date_embauche}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => openQuickPay(selectedEmp)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                isCeMoisPaye
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{isCeMoisPaye ? '✓ Salaire Soldé' : `Payer Salaire (${resteNetCeMois.toFixed(2)} DT)`}</span>
            </button>
            <button
              onClick={() => openNewAvanceForEmp(selectedEmp.id)}
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouvelle Avance</span>
            </button>
            <button
              onClick={() => openNewCongeForEmp(selectedEmp.id)}
              className="flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Poser un Congé</span>
            </button>
            <button
              onClick={() => openNewBulletinForEmp(selectedEmp.id)}
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Générer Bulletin</span>
            </button>
            <button
              onClick={() => openEditEmp(selectedEmp)}
              className="p-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition"
              title="Modifier les coordonnées"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* KPIs / Statistiques Financières de l'Employé */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider">
              <span>Salaire de Base</span>
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900 font-mono">
              {selectedEmp.salaire_base.toFixed(2)} <span className="text-sm font-normal text-gray-500">DT/mois</span>
            </p>
            <p className="text-xs text-gray-400">Rémunération contractuelle</p>
          </div>

          <div className="bg-amber-50/70 rounded-2xl border border-amber-200/90 p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-amber-800 text-xs font-semibold uppercase tracking-wider">
              <span>Avances {currentMonthName}</span>
              <TrendingDown className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-extrabold text-amber-900 font-mono">
              -{avancesCeMois.toFixed(2)} <span className="text-sm font-normal text-amber-700">DT</span>
            </p>
            <p className="text-xs text-amber-700">
              Total historique : -{totalAvancesHistorique.toFixed(2)} DT
            </p>
          </div>

          <div className={`${isCeMoisPaye ? 'bg-emerald-50/90 border-emerald-300' : 'bg-emerald-50/70 border-emerald-200/90'} rounded-2xl border p-5 shadow-xs space-y-2`}>
            <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold uppercase tracking-wider">
              <span>Reste Dû ({currentMonthName})</span>
              <CreditCard className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-900 font-mono">
              {resteNetCeMois.toFixed(2)} <span className="text-sm font-normal text-emerald-700">DT</span>
            </p>
            <p className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
              {isCeMoisPaye ? (
                <span className="font-bold flex items-center gap-1 text-emerald-800"><CheckCircle className="w-3.5 h-3.5" /> Salaire du mois soldé & payé</span>
              ) : (
                <>
                  <Clock className="w-3 h-3" /> Échéance : {getNextPayDate()}
                </>
              )}
            </p>
          </div>

          <div className="bg-purple-50/70 rounded-2xl border border-purple-200/90 p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-purple-800 text-xs font-semibold uppercase tracking-wider">
              <span>Congés Approuvés</span>
              <CalendarCheck className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-extrabold text-purple-900 font-mono">
              {totalJoursCongesApprouves} <span className="text-sm font-normal text-purple-700">jour(s)</span>
            </p>
            <p className="text-xs text-purple-700">
              {empConges.length} demande(s) enregistrée(s)
            </p>
          </div>
        </div>

        {/* Onglets de Détails pour cet Employé */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          {/* Navigation sub-tabs */}
          <div className="flex items-center border-b border-gray-200 bg-gray-50/80 px-4 overflow-x-auto">
            <button
              onClick={() => setEmpActiveTab('avances')}
              className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                empActiveTab === 'avances'
                  ? 'border-amber-600 text-amber-700 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Avances sur Salaire ({empAvances.length})</span>
            </button>
            <button
              onClick={() => setEmpActiveTab('conges')}
              className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                empActiveTab === 'conges'
                  ? 'border-purple-600 text-purple-700 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Congés & Absences ({empConges.length})</span>
            </button>
            <button
              onClick={() => setEmpActiveTab('paies')}
              className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                empActiveTab === 'paies'
                  ? 'border-emerald-600 text-emerald-700 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Bulletins de Paie ({empBulletins.length})</span>
            </button>
            <button
              onClick={() => setEmpActiveTab('journal')}
              className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                empActiveTab === 'journal'
                  ? 'border-blue-600 text-blue-700 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Journal Complet ({journalTimeline.length})</span>
            </button>
          </div>

          {/* TAB 1: AVANCES DE CET EMPLOYÉ */}
          {empActiveTab === 'avances' && (
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">Historique des avances accordées</h3>
                <button
                  onClick={() => openNewAvanceForEmp(selectedEmp.id)}
                  className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter une avance</span>
                </button>
              </div>

              {empAvances.length === 0 ? (
                <div className="py-12 text-center text-gray-400 space-y-1">
                  <DollarSign className="w-10 h-10 mx-auto text-gray-300 stroke-1" />
                  <p className="text-xs font-semibold text-gray-600">Aucune avance pour cet employé</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Mois Déduit</th>
                        <th className="px-4 py-3">Motif & Justificatif</th>
                        <th className="px-4 py-3 text-right">Montant</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {empAvances.map(a => {
                        const mImp = a.mois_imputation || a.date.slice(0, 7);
                        return (
                          <tr key={a.id} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3 text-gray-600 font-medium">{a.date}</td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                                {mImp}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-800">{a.motif || 'Avance sur salaire'}</td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-amber-700">
                              -{a.montant.toFixed(2)} DT
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => { if (confirm('Supprimer cette avance ?')) deleteAvanceSalaire(a.id); }}
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-amber-50 border-t border-amber-100">
                      <tr>
                        <td colSpan={3} className="px-4 py-2.5 text-xs font-bold text-amber-900">TOTAL CUMULÉ DES AVANCES</td>
                        <td className="px-4 py-2.5 text-right font-mono font-extrabold text-amber-900">
                          -{totalAvancesHistorique.toFixed(2)} DT
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CONGÉS DE CET EMPLOYÉ */}
          {empActiveTab === 'conges' && (
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">Historique des congés et absences</h3>
                <button
                  onClick={() => openNewCongeForEmp(selectedEmp.id)}
                  className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nouvelle demande de congé</span>
                </button>
              </div>

              {empConges.length === 0 ? (
                <div className="py-12 text-center text-gray-400 space-y-1">
                  <Calendar className="w-10 h-10 mx-auto text-gray-300 stroke-1" />
                  <p className="text-xs font-semibold text-gray-600">Aucun congé enregistré pour cet employé</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3">Période (Du / Au)</th>
                        <th className="px-4 py-3 text-center">Durée</th>
                        <th className="px-4 py-3 text-center">Type</th>
                        <th className="px-4 py-3">Notes</th>
                        <th className="px-4 py-3 text-center">Statut</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {empConges.map(c => (
                        <tr key={c.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-medium text-gray-800">
                            Du {c.date_debut} au {c.date_fin}
                          </td>
                          <td className="px-4 py-3 text-center font-mono font-bold text-purple-900">
                            {calcNbJours(c.date_debut, c.date_fin)} jour(s)
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
                              c.type === 'paye' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              c.type === 'maladie' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-gray-50 text-gray-600 border-gray-200'
                            }`}>
                              {c.type === 'paye' ? 'Payé' : c.type === 'maladie' ? 'Maladie' : 'Sans solde'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{c.notes || '—'}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                              c.status === 'approuve' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              c.status === 'refuse' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {c.status === 'approuve' ? '✓ Approuvé' : c.status === 'refuse' ? '✗ Refusé' : '⏳ En attente'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1.5">
                              {c.status === 'attente' && (
                                <>
                                  <button onClick={() => updateCongeStatus(c.id, 'approuve')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Approuver"><CheckCircle className="w-4 h-4" /></button>
                                  <button onClick={() => updateCongeStatus(c.id, 'refuse')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Refuser"><XCircle className="w-4 h-4" /></button>
                                </>
                              )}
                              <button onClick={() => { if (confirm('Supprimer ce congé ?')) deleteConge(c.id); }} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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

          {/* TAB 3: BULLETINS DE PAIE DE CET EMPLOYÉ */}
          {empActiveTab === 'paies' && (
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">Bulletins de paie & Règlements mensuels</h3>
                <button
                  onClick={() => openNewBulletinForEmp(selectedEmp.id)}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Générer bulletin</span>
                </button>
              </div>

              {empBulletins.length === 0 ? (
                <div className="py-12 text-center text-gray-400 space-y-1">
                  <FileText className="w-10 h-10 mx-auto text-gray-300 stroke-1" />
                  <p className="text-xs font-semibold text-gray-600">Aucun bulletin de paie généré pour cet employé</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3">Mois</th>
                        <th className="px-4 py-3 text-right">Salaire Base</th>
                        <th className="px-4 py-3 text-right">Avances Déduites</th>
                        <th className="px-4 py-3 text-right">Net à Payer</th>
                        <th className="px-4 py-3 text-center">Statut</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {empBulletins.map(b => (
                        <tr key={b.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-mono font-bold text-gray-800">{b.mois}</td>
                          <td className="px-4 py-3 text-right font-mono text-gray-700">{b.salaire_base.toFixed(2)} DT</td>
                          <td className="px-4 py-3 text-right font-mono text-amber-700">-{b.avances_deduites.toFixed(2)} DT</td>
                          <td className="px-4 py-3 text-right font-mono font-extrabold text-emerald-800">{b.net_a_payer.toFixed(2)} DT</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                              b.statut_paiement === 'paye'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {b.statut_paiement === 'paye' ? '✓ Payé' : 'Non payé'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1.5">
                              {b.statut_paiement === 'non_paye' && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Régler le solde de salaire (${b.net_a_payer.toFixed(2)} DT) pour ${selectedEmp?.nom} ? Une sortie de caisse sera créée.`)) {
                                      paySalaryBulletin(b.id, b.net_a_payer, 'especes');
                                    }
                                  }}
                                  className="text-xs font-bold px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition cursor-pointer"
                                >
                                  Payer solde ({b.net_a_payer.toFixed(2)} DT)
                                </button>
                              )}
                              <button
                                onClick={() => { if (confirm('Supprimer ce bulletin ?')) deleteBulletinPaie(b.id); }}
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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

          {/* TAB 4: JOURNAL CHRONOLOGIQUE GLOBAL */}
          {empActiveTab === 'journal' && (
            <div className="p-4 sm:p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Historique chronologique de tous les flux</h3>
              {journalTimeline.length === 0 ? (
                <div className="py-12 text-center text-gray-400 space-y-1">
                  <Clock className="w-10 h-10 mx-auto text-gray-300 stroke-1" />
                  <p className="text-xs font-semibold text-gray-600">Aucune activité enregistrée</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {journalTimeline.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3.5 bg-gray-50/70 border border-gray-100 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 text-gray-600">
                        {item.type === 'avance' ? <DollarSign className="w-4 h-4 text-amber-600" /> :
                         item.type === 'conge' ? <Calendar className="w-4 h-4 text-purple-600" /> :
                         <FileText className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-gray-900">{item.title}</p>
                          <span className="text-xs font-mono text-gray-400">{item.date}</span>
                        </div>
                        <p className="text-xs text-gray-600">{item.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // LISTES GLOBALES DES 4 SOUS-ONGLETS
  // ══════════════════════════════════════════════════════════════════
  const filteredEmployes = employes.filter(e =>
    e.nom.toLowerCase().includes(searchEmp.toLowerCase()) ||
    (e.poste || '').toLowerCase().includes(searchEmp.toLowerCase()) ||
    (e.telephone || '').includes(searchEmp)
  );

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
          <button onClick={() => openNewAvanceForEmp()} disabled={employes.length === 0}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition w-fit">
            <Plus className="w-4 h-4" /><span>Nouvelle Avance</span>
          </button>
        )}
        {subTab === 'rh_conges' && (
          <button onClick={() => openNewCongeForEmp()} disabled={employes.length === 0}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition w-fit">
            <Plus className="w-4 h-4" /><span>Demande de Congé</span>
          </button>
        )}
        {subTab === 'rh_paies' && (
          <button onClick={() => openNewBulletinForEmp()} disabled={employes.length === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition w-fit">
            <Plus className="w-4 h-4" /><span>Générer Bulletin</span>
          </button>
        )}
      </div>

      {/* ══════════════ EMPLOYÉS LIST VIEW ══════════════ */}
      {subTab === 'rh_employes' && (
        <div className="space-y-4">
          {/* Summary KPIs bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Total Employés</p>
                <p className="text-lg font-bold text-gray-900">{employes.length} collaborateur(s)</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Masse Salariale Base</p>
                <p className="text-lg font-bold text-emerald-900 font-mono">
                  {employes.reduce((s, e) => s + (e.salaire_base || 0), 0).toFixed(2)} DT
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Avances {currentMonthName}</p>
                <p className="text-lg font-bold text-amber-800 font-mono">
                  -{avancesSalaire.filter(a => isAvanceForMonth(a, currentMonthStr)).reduce((s, a) => s + a.montant, 0).toFixed(2)} DT
                </p>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchEmp}
              onChange={e => setSearchEmp(e.target.value)}
              placeholder="Rechercher par nom, poste, téléphone..."
              className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-xs">
            {filteredEmployes.length === 0 ? (
              <div className="p-12 text-center text-gray-400 space-y-2">
                <UserCheck className="w-12 h-12 mx-auto stroke-1 text-gray-300" />
                <p className="text-sm font-semibold text-gray-700">Aucun employé trouvé</p>
                <p className="text-xs text-gray-400">Commencez par ajouter vos collaborateurs.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                    <tr>
                      <th className="px-5 py-3">Employé</th>
                      <th className="px-5 py-3">Poste</th>
                      <th className="px-5 py-3">Téléphone</th>
                      <th className="px-5 py-3 text-right">Salaire Base</th>
                      <th className="px-5 py-3 text-right">Avances ({currentMonthName})</th>
                      <th className="px-5 py-3 text-right">Reste Net ({currentMonthName})</th>
                      <th className="px-5 py-3 text-right">Fiche & Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredEmployes.map(e => {
                      const empAvCeMois = avancesSalaire
                        .filter(a => a.employe_id === e.id && isAvanceForMonth(a, currentMonthStr))
                        .reduce((s, a) => s + a.montant, 0);
                      const empBulCeMois = bulletinsPaie.find(b => b.employe_id === e.id && b.mois === currentMonthStr);
                      const isCeMoisPaye = empBulCeMois?.statut_paiement === 'paye';
                      const netTheorique = Math.max(0, e.salaire_base - empAvCeMois);
                      const resteAPayer = isCeMoisPaye ? 0 : netTheorique;

                      // Check for advances on next month
                      const nextMonthAdvances = avancesSalaire
                        .filter(a => a.employe_id === e.id && isAvanceForMonth(a, nextMonthStr))
                        .reduce((s, a) => s + a.montant, 0);

                      return (
                        <tr
                          key={e.id}
                          className="hover:bg-blue-50/40 transition cursor-pointer"
                          onClick={() => setSelectedEmp(e)}
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white text-xs font-black flex items-center justify-center shadow-xs">
                                {e.nom.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-gray-900 hover:text-blue-600 block">{e.nom}</span>
                                {e.date_embauche && <span className="text-[11px] text-gray-400">Depuis {e.date_embauche}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-gray-700 font-medium">{e.poste || '—'}</td>
                          <td className="px-5 py-3.5 text-gray-600 font-mono">{e.telephone || '—'}</td>
                          <td className="px-5 py-3.5 text-right font-mono font-bold text-gray-900">
                            {e.salaire_base.toFixed(2)} DT
                          </td>
                          <td className="px-5 py-3.5 text-right font-mono font-bold text-amber-700">
                            {empAvCeMois > 0 ? `-${empAvCeMois.toFixed(2)} DT` : '0.00 DT'}
                          </td>
                          <td className="px-5 py-3.5 text-right font-mono font-extrabold">
                            {isCeMoisPaye ? (
                              <div className="flex flex-col items-end">
                                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Payé (0.00 DT)
                                </span>
                                {nextMonthAdvances > 0 && (
                                  <span className="text-[10px] text-blue-600 font-bold mt-0.5">
                                    -{nextMonthAdvances.toFixed(2)} DT avance sur {nextMonthStr}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col items-end">
                                <span className="text-emerald-700 font-extrabold text-sm font-mono">
                                  {resteAPayer.toFixed(2)} DT
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium">À régler ce mois</span>
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right" onClick={ev => ev.stopPropagation()}>
                            <div className="flex justify-end items-center gap-1.5">
                              <button
                                onClick={() => openQuickPay(e)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                                  isCeMoisPaye
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                                }`}
                                title={isCeMoisPaye ? "Mois déjà soldé — cliquer pour réajuster ou verser un acompte" : `Payer le salaire de ${e.nom}`}
                              >
                                <Wallet className="w-3.5 h-3.5" />
                                <span>{isCeMoisPaye ? '✓ Soldé' : 'Payer'}</span>
                              </button>
                              <button
                                onClick={() => setSelectedEmp(e)}
                                className="flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                              >
                                <span>Fiche</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEditEmp(e)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                                title="Modifier"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => { if (confirm(`Supprimer ${e.nom} ?`)) deleteEmploye(e.id); }}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ AVANCES GLOBALES ══════════════ */}
      {subTab === 'rh_avances' && (
        <>
          {employes.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 font-semibold">
              ⚠️ Ajoutez d'abord des employés dans l'onglet "Employés".
            </div>
          )}
          <div className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-xs">
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
                      <th className="px-5 py-3">Date Décaissement</th>
                      <th className="px-5 py-3">Employé</th>
                      <th className="px-5 py-3">Mois Concerné</th>
                      <th className="px-5 py-3">Motif & Justificatif</th>
                      <th className="px-5 py-3 text-right">Montant</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {avancesSalaire.map(a => {
                      const mImp = a.mois_imputation || a.date.slice(0, 7);
                      return (
                        <tr key={a.id} className="hover:bg-gray-50/50">
                          <td className="px-5 py-3 text-gray-600 font-medium">{a.date}</td>
                          <td className="px-5 py-3 font-bold text-gray-900">{a.employe_nom}</td>
                          <td className="px-5 py-3">
                            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                              {mImp}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-gray-600">{a.motif || '—'}</td>
                          <td className="px-5 py-3 text-right font-mono font-bold text-amber-700">-{a.montant.toFixed(2)} DT</td>
                          <td className="px-5 py-3 text-right">
                            <button onClick={() => { if (confirm('Supprimer cette avance ?')) deleteAvanceSalaire(a.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-amber-50 border-t border-amber-100">
                    <tr>
                      <td colSpan={4} className="px-5 py-2.5 text-xs font-bold text-amber-700">TOTAL AVANCES ENREGISTRÉES</td>
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

      {/* ══════════════ CONGÉS GLOBAUX ══════════════ */}
      {subTab === 'rh_conges' && (
        <>
          {employes.length === 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-700 font-semibold">
              ⚠️ Ajoutez d'abord des employés dans l'onglet "Employés".
            </div>
          )}
          <div className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-xs">
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

      {/* ══════════════ BULLETINS GLOBAUX ══════════════ */}
      {subTab === 'rh_paies' && (
        <>
          {employes.length === 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700 font-semibold">
              ⚠️ Ajoutez d'abord des employés dans l'onglet "Employés".
            </div>
          )}
          <div className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-xs">
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
                              <button
                                onClick={() => {
                                  if (confirm(`Régler le solde de salaire (${b.net_a_payer.toFixed(2)} DT) pour ${b.employe_nom} ? Une sortie de caisse sera créée.`)) {
                                    paySalaryBulletin(b.id, b.net_a_payer, 'especes');
                                  }
                                }}
                                className="text-xs font-bold px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition cursor-pointer"
                              >
                                Payer solde ({b.net_a_payer.toFixed(2)} DT)
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
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
                <input type="text" value={empPoste} onChange={e => setEmpPoste(e.target.value)} placeholder="Ex: Poseur aluminium / Chef d'atelier"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone</label>
                <input type="text" value={empTel} onChange={e => setEmpTel(e.target.value)} placeholder="Ex: +216 98 123 456"
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Nouvelle Avance sur Salaire</h3>
              <button onClick={() => setAvanceModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            {(() => {
              const bulCeMois = bulletinsPaie.find(b => b.employe_id === avEmpId && b.mois === currentMonthStr);
              const isCurMonthPaid = bulCeMois?.statut_paiement === 'paye';
              return (
                <form onSubmit={handleSaveAvance} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Employé *</label>
                    <select
                      required
                      value={avEmpId}
                      onChange={e => {
                        const newId = e.target.value;
                        setAvEmpId(newId);
                        const bul = bulletinsPaie.find(b => b.employe_id === newId && b.mois === currentMonthStr);
                        const isPaid = bul?.statut_paiement === 'paye';
                        setAvMoisImputation(isPaid ? nextMonthStr : currentMonthStr);
                      }}
                      className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm bg-white focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">-- Sélectionner un employé --</option>
                      {employes.map(e => <option key={e.id} value={e.id}>{e.nom} ({e.poste || 'Employé'})</option>)}
                    </select>
                  </div>

                  {isCurMonthPaid && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-blue-900 shadow-xs">
                      <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="font-bold">Salaire de {currentMonthName} déjà soldé & payé</p>
                        <p className="text-[11px] text-blue-700 leading-relaxed">
                          La sortie de caisse se fera aujourd'hui (<strong>{avDate}</strong>), et cette avance sera automatiquement déduite du salaire d'<strong>{nextMonthName}</strong> (mois {nextMonthStr}).
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Mois d'imputation (Salaire à déduire) *</label>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setAvMoisImputation(currentMonthStr)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          avMoisImputation === currentMonthStr
                            ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-500/20'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        Ce mois ({currentMonthStr})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvMoisImputation(nextMonthStr)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          avMoisImputation === nextMonthStr
                            ? 'bg-blue-100 text-blue-900 border-blue-300 ring-2 ring-blue-500/20'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        Mois prochain ({nextMonthStr})
                      </button>
                    </div>
                    <input
                      type="month"
                      required
                      value={avMoisImputation}
                      onChange={e => setAvMoisImputation(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Date Décaissement *</label>
                      <input
                        type="date"
                        required
                        value={avDate}
                        onChange={e => setAvDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Montant (DT) *</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="0.01"
                        value={avMontant}
                        onChange={e => setAvMontant(e.target.value)}
                        placeholder="0.00"
                        className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm font-mono focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Motif / Justification</label>
                    <input
                      type="text"
                      value={avMotif}
                      onChange={e => setAvMotif(e.target.value)}
                      placeholder="Ex: Avance exceptionnelle pour fournitures..."
                      className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                    <button type="button" onClick={() => setAvanceModal(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 cursor-pointer">Annuler</button>
                    <button type="submit" className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs">Enregistrer l'avance</button>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}

      {/* ══════ MODAL Congé ══════ */}
      {congeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notes / Motif</label>
                <input type="text" value={cgNotes} onChange={e => setCgNotes(e.target.value)} placeholder="Optionnel"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-purple-500" />
              </div>
              {cgDebut && cgFin && (
                <p className="text-xs text-purple-700 font-semibold bg-purple-50 px-3 py-2 rounded-lg">
                  Durée estimée : {calcNbJours(cgDebut, cgFin)} jour(s)
                </p>
              )}
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setCongeModal(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold">Enregistrer la demande</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════ MODAL Bulletin ══════ */}
      {bulletinModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
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
                  {employes.map(e => <option key={e.id} value={e.id}>{e.nom} — Salaire: {e.salaire_base.toFixed(2)} DT</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mois de Paie *</label>
                <input type="month" required value={blMois} onChange={e => setBlMois(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500" />
              </div>
              {blEmpId && blMois && (() => {
                const emp = employes.find(e => e.id === blEmpId);
                const avancesM = avancesSalaire.filter(a => a.employe_id === blEmpId && isAvanceForMonth(a, blMois)).reduce((s, a) => s + a.montant, 0);
                if (!emp) return null;
                return (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-gray-600">Salaire de base</span><span className="font-mono font-bold">{emp.salaire_base.toFixed(2)} DT</span></div>
                    <div className="flex justify-between"><span className="text-amber-700">Avances du mois</span><span className="font-mono font-bold text-amber-700">-{avancesM.toFixed(2)} DT</span></div>
                    <div className="flex justify-between border-t border-emerald-200 pt-1.5"><span className="font-bold text-emerald-800">Net à verser</span><span className="font-mono font-extrabold text-emerald-800 text-sm">{Math.max(0, emp.salaire_base - avancesM).toFixed(2)} DT</span></div>
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

      {/* ══════ MODAL PAIEMENT SALAIRE RAPIDE ══════ */}
      {payModal && payEmp && (() => {
        const empAv = avancesSalaire
          .filter(a => a.employe_id === payEmp.id && isAvanceForMonth(a, payMois))
          .reduce((s, a) => s + a.montant, 0);
        const bul = bulletinsPaie.find(b => b.employe_id === payEmp.id && b.mois === payMois);
        const isPaid = bul ? bul.statut_paiement === 'paye' : false;
        const netTheorique = Math.max(0, (payEmp.salaire_base || 0) - empAv);
        const resteDu = isPaid ? 0 : netTheorique;
        const inputNum = parseFloat(payMontant) || 0;
        const isOver = inputNum > resteDu;
        const excedent = Math.max(0, inputNum - resteDu);

        // Next month label
        const [yStr, mStr] = payMois.split('-');
        const nextMois = mStr === '12' ? `${parseInt(yStr, 10)+1}-01` : `${yStr}-${String(parseInt(mStr, 10)+1).padStart(2,'0')}`;

        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Règlement Salaire — {payEmp.nom}</h3>
                    <p className="text-xs text-gray-500">{payEmp.poste || 'Collaborateur atelier'}</p>
                  </div>
                </div>
                <button onClick={() => setPayModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Monthly Breakdown Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Salaire contractuel de base</span>
                  <span className="font-mono font-bold text-gray-900">{(payEmp.salaire_base || 0).toFixed(2)} DT</span>
                </div>
                <div className="flex justify-between items-center text-amber-700">
                  <span>Avances perçues ({payMois})</span>
                  <span className="font-mono font-bold">-{empAv.toFixed(2)} DT</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 pt-2 font-bold">
                  <span className="text-gray-900">Reste net dû pour {payMois}</span>
                  <span className={`font-mono text-sm ${resteDu > 0 ? 'text-emerald-700 font-extrabold' : 'text-gray-500'}`}>
                    {resteDu.toFixed(2)} DT {isPaid && '(Déjà soldé)'}
                  </span>
                </div>
              </div>

              <form onSubmit={handleConfirmQuickPay} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Mois concerné *</label>
                  <input
                    type="month"
                    required
                    value={payMois}
                    onChange={e => {
                      const newMois = e.target.value;
                      setPayMois(newMois);
                      const newAv = avancesSalaire.filter(a => a.employe_id === payEmp.id && a.date.startsWith(newMois)).reduce((s, a) => s + a.montant, 0);
                      const newBul = bulletinsPaie.find(b => b.employe_id === payEmp.id && b.mois === newMois);
                      const newNet = Math.max(0, (payEmp.salaire_base || 0) - newAv);
                      const newReste = newBul?.statut_paiement === 'paye' ? 0 : newNet;
                      setPayMontant(newReste > 0 ? String(newReste) : String(newNet));
                    }}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Montant versé (DT) *</label>
                  <input
                    type="number"
                    required
                    step="0.001"
                    min="0.001"
                    value={payMontant}
                    onChange={e => setPayMontant(e.target.value)}
                    placeholder="0.000"
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-base font-mono font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Dynamic Explanation Alert */}
                <div className="text-xs p-3 rounded-xl border space-y-1">
                  {inputNum > 0 && !isOver && inputNum === resteDu && (
                    <div className="text-emerald-800 bg-emerald-50/70 border-emerald-200 p-2 rounded-lg">
                      🟢 <strong>Sortie Caisse: {inputNum.toFixed(2)} DT</strong>. Le salaire de <strong>{payMois}</strong> sera clôturé et marqué <strong>Payé à 100%</strong>.
                    </div>
                  )}
                  {inputNum > 0 && !isOver && inputNum < resteDu && (
                    <div className="text-amber-800 bg-amber-50/70 border-amber-200 p-2 rounded-lg">
                      🟠 <strong>Sortie Caisse: {inputNum.toFixed(2)} DT</strong>. Règlement partiel. Il restera <strong>{(resteDu - inputNum).toFixed(2)} DT</strong> à régler pour {payMois}.
                    </div>
                  )}
                  {inputNum > 0 && isOver && (
                    <div className="text-blue-900 bg-blue-50/80 border-blue-200 p-2.5 rounded-lg space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-blue-700">
                        ⚡ Excédent de trop-perçu : +{excedent.toFixed(2)} DT
                      </p>
                      <p className="text-[11px] text-blue-800 leading-relaxed">
                        • <strong>Sortie Caisse: {inputNum.toFixed(2)} DT</strong> réels.<br />
                        • Le mois de <strong>{payMois}</strong> sera soldé (0.00 DT).<br />
                        • L'excédent de <strong>{excedent.toFixed(2)} DT</strong> sera automatiquement reporté en <strong>Avance sur {nextMois}</strong>.<br />
                        • Reste à payer estimé en <strong>{nextMois}</strong> : <strong>{Math.max(0, (payEmp.salaire_base || 0) - excedent).toFixed(2)} DT</strong>.
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Mode de règlement</label>
                    <select
                      value={payMode}
                      onChange={e => setPayMode(e.target.value as any)}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="especes">Espèces (Caisse)</option>
                      <option value="virement">Virement bancaire</option>
                      <option value="cheque">Chèque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Date versement</label>
                    <input
                      type="date"
                      required
                      value={payDate}
                      onChange={e => setPayDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
                  <input
                    type="text"
                    value={payNotes}
                    onChange={e => setPayNotes(e.target.value)}
                    placeholder="Optionnel (ex: Réf virement, prime, reçu signé...)"
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setPayModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Valider le Paiement</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
