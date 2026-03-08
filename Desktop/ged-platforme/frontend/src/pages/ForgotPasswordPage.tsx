// frontend/src/pages/ForgotPasswordPage.tsx
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, ShieldCheck } from 'lucide-react';
import { authService } from '@/services/authService';

import logoMinistere from '@/assets/logo-ministere.png';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const emailHint = useMemo(() => email.trim(), [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--navy-950)' }}>
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-2">
        {/* Left branding */}
        <div className="hidden lg:flex relative overflow-hidden items-center">
          <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950" />
          <div
            className="absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full opacity-25"
            style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 65%)' }}
          />
          <div
            className="absolute -bottom-24 -right-24 h-[360px] w-[360px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 65%)' }}
          />
          <div className="relative z-10 px-12">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-14 w-14 rounded-2xl overflow-hidden bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
                <img src={logoMinistere} alt="Ministère" className="h-10 w-10 object-contain" />
              </div>
              <div>
                <p className="text-lg font-bold text-white leading-tight">Ministère de l'Éducation Nationale</p>
                <p className="text-sm text-blue-300">GED — Plateforme Documentaire</p>
              </div>
            </div>

            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Réinitialisation
              <span
                className="block text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa, #06b6d4)' }}
              >
                sécurisée
              </span>
            </h1>

            <p className="mt-4 text-slate-400 leading-relaxed max-w-md">
              Un lien de réinitialisation sera envoyé si le compte existe. Les actions peuvent être journalisées
              (audit) et protégées par des contrôles de sécurité.
            </p>

            <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Conformité & sécurité renforcée
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm animate-fade-in">
            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
              <div className="h-10 w-10 rounded-xl overflow-hidden bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
                <img src={logoMinistere} alt="Ministère" className="h-8 w-8 object-contain" />
              </div>
              <p className="text-base font-bold text-white">GED — Plateforme</p>
            </div>

            {!sent ? (
              <>
                <h2 className="text-2xl font-bold text-white mb-1">Mot de passe oublié</h2>
                <p className="text-sm text-slate-400 mb-8">
                  Entrez votre adresse email pour recevoir un lien de réinitialisation.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="label">Adresse email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="prenom.nom@men.gov.ma"
                        className="input pl-10"
                        autoComplete="email"
                        required
                      />
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500">
                      Exemple: <span className="text-slate-400">prenom.nom@men.gov.ma</span>
                    </p>
                  </div>

                  {error && <p className="alert-error text-xs">{error}</p>}

                  <button type="submit" disabled={isLoading || !email} className="btn-primary w-full mt-2">
                    {isLoading ? (
                      <span className="flex items-center gap-2 justify-center">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Envoi…
                      </span>
                    ) : (
                      'Envoyer le lien'
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-14 w-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)' }}>
                    <CheckCircle className="h-7 w-7 text-emerald-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Email envoyé !</h2>
                <p className="text-sm text-slate-400 mb-6">
                  Si un compte existe avec l'adresse{' '}
                  <strong className="text-slate-300">{emailHint || '…'}</strong>, vous recevrez un lien de réinitialisation.
                </p>
                <p className="text-xs text-slate-500">
                  Vérifiez votre dossier spam si vous ne recevez rien.
                </p>
              </div>
            )}

            <Link
              to="/login"
              className="flex items-center gap-2 justify-center text-sm text-blue-400 hover:text-blue-300 mt-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}