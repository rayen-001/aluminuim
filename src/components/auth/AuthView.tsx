import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Building2, 
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ShieldCheck,
  Zap,
  PhoneCall
} from 'lucide-react';

interface AuthViewProps {
  onAuthSuccess?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'forgot_password'>('login');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) throw error;
      if (data.session) {
        onAuthSuccess?.();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(
        err.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect. Vérifiez vos identifiants.'
          : (err.message || 'Une erreur est survenue lors de la connexion.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin
      });

      if (error) throw error;
      setSuccessMsg("Un email contenant le lien de réinitialisation de votre mot de passe vous a été envoyé.");
    } catch (err: any) {
      console.error('Reset password error:', err);
      setErrorMsg(err.message || "Impossible d'envoyer le lien de réinitialisation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10 space-y-6">
        
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl shadow-xl shadow-blue-500/25 border border-blue-400/30 text-white mb-2">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            AtelierPro <span className="text-blue-500 font-normal">Cloud</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Plateforme Sécurisée de Menuiserie Aluminium & Découpe
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          
          {/* Header text */}
          <div className="mb-6 text-center">
            <h2 className="text-lg font-bold text-white">
              {mode === 'login' ? 'Connexion Espace Atelier' : 'Réinitialiser le mot de passe'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'login' 
                ? 'Saisissez vos identifiants pour accéder à votre atelier' 
                : 'Indiquez votre email professionnel ci-dessous'}
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="mb-5 bg-rose-950/60 border border-rose-800/80 rounded-xl p-3.5 flex items-start gap-2.5 text-rose-300 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 bg-emerald-950/60 border border-emerald-800/80 rounded-xl p-3.5 flex items-start gap-2.5 text-emerald-300 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Adresse Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="contact@atelier.tn"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">Mot de Passe</label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot_password'); setErrorMsg(null); setSuccessMsg(null); }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline cursor-pointer font-medium"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white text-xs sm:text-sm font-bold py-3 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Accéder à l'Atelier</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. FORGOT PASSWORD FORM */}
          {mode === 'forgot_password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Votre Adresse Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="contact@atelier.tn"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
                  className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Envoyer le lien</span>}
                </button>
              </div>
            </form>
          )}

          {/* Help & Contact Notice */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <div className="inline-flex items-center gap-1.5 text-slate-400 text-xs">
              <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
              <span>Nouveau client ou renouvellement ?</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Contactez votre administrateur au <span className="font-bold text-slate-300">+216 58 829 700</span>
            </p>
          </div>

        </div>

        {/* Feature Badges Footer */}
        <div className="flex items-center justify-center gap-6 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            Sécurité RLS Supabase
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            Cloud Multi-Tenant
          </span>
        </div>
      </div>
    </div>
  );
};
