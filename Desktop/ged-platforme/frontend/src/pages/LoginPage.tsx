import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { MFAForm } from '@/components/auth/MFAForm';
import { useAuth } from '@/hooks/useAuth';
import { Shield, FileText, Cpu, Lock } from 'lucide-react';

import logoMinistere from '@/assets/logo-ministere.png';

type Feature = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
};

export function LoginPage() {
  const { login, verifyMFA, pendingMFA } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  const FEATURES: Feature[] = useMemo(
    () => [
      { icon: Shield, label: 'Sécurité renforcée', desc: 'Authentification MFA, sessions sécurisées, chiffrement.' },
      { icon: FileText, label: 'GED intelligente', desc: 'Classement, indexation et OCR automatisés par IA.' },
      { icon: Cpu, label: 'IA intégrée', desc: "Résumé, extraction NLP et assistance à la décision." },
      { icon: Lock, label: "Contrôle & audit", desc: "RBAC multi-rôles, traçabilité complète et journalisation." },
    ],
    []
  );

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const requiresMFA = await login(email, password);
      if (!requiresMFA) navigate(from, { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFA = async (token: string) => {
    setIsLoading(true);
    try {
      await verifyMFA(token);
      navigate(from, { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-24 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-primary-600/15 blur-3xl" />
        <div className="absolute -bottom-24 right-1/3 h-80 w-[60rem] rounded-full bg-ged-cyan/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)]" />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-10 px-6 py-10 lg:grid-cols-2">
        {/* Left (Branding) */}
        <div className="hidden lg:block">
          <div className="mb-8 flex items-center gap-4">
            <div className="h-14 w-14 overflow-hidden rounded-2xl bg-white/5 p-2 ring-1 ring-white/10 shadow-card">
              <img src={logoMinistere} alt="Logo Ministère" className="h-full w-full object-contain" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-slate-300/80">
                Ministère de l’Éducation Nationale
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">GED — Plateforme Documentaire</h1>
              <p className="mt-1 text-sm text-slate-300">
                Gestion centralisée, sécurité renforcée et intelligence documentaire.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-card">
            <h2 className="text-3xl font-extrabold leading-tight">
              Plateforme sécurisée de gestion
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-ged-cyan">
                documentaire intelligente
              </span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Conçue pour les besoins institutionnels : contrôle d’accès, traçabilité et automatisation par IA.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3">
              {FEATURES.map(({ icon: Icon, label, desc }, i) => (
                <div
                  key={label}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 animate-fade-in"
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <div className="h-10 w-10 rounded-xl bg-primary-600/15 ring-1 ring-primary-400/20 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4 text-xs text-slate-400">
              🔒 Conformité & bonnes pratiques : MFA, cookies sécurisés, contrôle d’accès, journalisation.
            </div>
          </div>
        </div>

        {/* Right (Auth Card) */}
        <div className="lg:justify-self-end">
          {/* Mobile header */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="h-12 w-12 overflow-hidden rounded-2xl bg-white/5 p-2 ring-1 ring-white/10">
              <img src={logoMinistere} alt="Logo Ministère" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">GED — Plateforme</p>
              <p className="text-xs text-slate-400">Ministère de l’Éducation Nationale</p>
            </div>
          </div>

          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-card">
            {!pendingMFA ? (
              <>
                <h2 className="text-2xl font-bold text-white">Connexion</h2>
                <p className="mt-1 text-sm text-slate-300">Accédez à votre espace sécurisé</p>
                <div className="mt-6">
                  <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white">Vérification MFA</h2>
                <p className="mt-1 text-sm text-slate-300">
                  Entrez le code généré par votre application d’authentification
                </p>
                <div className="mt-6">
                  <MFAForm onSubmit={handleMFA} isLoading={isLoading} />
                </div>
              </>
            )}

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-slate-400">
              Accès réservé aux agents du Ministère. Toute action est susceptible d’être journalisée.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}