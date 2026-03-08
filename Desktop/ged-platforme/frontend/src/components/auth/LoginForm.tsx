import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface Props {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
}

export function LoginForm({ onSubmit, isLoading }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const e = email.trim();
    const p = password.trim();
    return e.length > 3 && p.length > 0 && !isLoading;
  }, [email, password, isLoading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      await onSubmit(email.trim(), password);
    } catch (err: any) {
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        'Identifiants incorrects. Veuillez réessayer.';
      setError(msg);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <label className="label" htmlFor="email">
          Adresse email
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="prenom.nom@men.gov.ma"
            className="input pl-10"
            autoComplete="email"
            required
            aria-invalid={Boolean(error) || undefined}
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="label" htmlFor="password">
          Mot de passe
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
          <input
            id="password"
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="input pl-10 pr-10"
            autoComplete="current-password"
            required
            aria-invalid={Boolean(error) || undefined}
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <p className="alert-error text-xs">{error}</p>}

      {/* Submit */}
      <button type="submit" disabled={!canSubmit} className="btn-primary w-full mt-2">
        {isLoading ? (
          <span className="flex items-center gap-2 justify-center">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Connexion…
          </span>
        ) : (
          'Se connecter'
        )}
      </button>

      <div className="flex justify-end mt-2">
        <Link to="/forgot-password" className="text-xs text-primary-300 hover:text-primary-200 transition-colors">
          Mot de passe oublié ?
        </Link>
      </div>

      <p className="text-center text-xs text-slate-500 mt-3">
        Accès réservé aux agents du Ministère de l&apos;Éducation Nationale.
      </p>
    </form>
  );
}