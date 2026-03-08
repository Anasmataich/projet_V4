import { useState, useRef, useEffect } from 'react';
import { Bell, Search, LogOut, Settings, ChevronDown, ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUiStore } from '@/store/uiStore';
import { cn } from '@/utils/helpers';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrateur',
  CADRE: 'Cadre',
  INSPECTEUR: 'Inspecteur',
  RH: 'Ressources humaines',
  COMPTABLE: 'Comptable',
  CONSULTANT: 'Consultant',
};

export function Header() {
  const { user, logout } = useAuth();
  const { sidebarOpen } = useUiStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (location.pathname !== '/documents') {
      setSearch('');
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const term = search.trim();

    if (!term) {
      navigate('/documents');
      return;
    }

    navigate(`/documents?search=${encodeURIComponent(term)}`);
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '??';

  const left = sidebarOpen ? 'left-[var(--sidebar-w)]' : 'left-[var(--sidebar-collapsed)]';

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-20 flex h-16 items-center justify-between px-4 sm:px-6 transition-[left] duration-300',
        left
      )}
      style={{
        background: 'rgba(6,13,31,0.88)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="hidden xl:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
          Espace documentaire sécurisé
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un document, une catégorie, un mot-clé..."
            className="input h-10 pl-9 pr-3 text-sm"
          />
        </form>
      </div>

      <div className="ml-4 flex items-center gap-3">
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border transition-colors hover:bg-white/[0.08]"
          style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 text-slate-300" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-navy-950" />
        </button>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-xl border px-3 py-2 transition-colors hover:bg-white/[0.08]"
            style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
            >
              {initials}
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold leading-tight text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-blue-400">
                {user?.role ? ROLE_LABELS[user.role] : ''}
              </p>
            </div>

            <ChevronDown className={cn('h-3.5 w-3.5 text-slate-400 transition-transform', menuOpen && 'rotate-180')} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border shadow-card animate-fade-in"
              style={{ background: '#0f2048', borderColor: 'rgba(255,255,255,0.10)' }}
              role="menu"
            >
              <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-sm font-semibold text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/settings');
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-white"
                  role="menuitem"
                >
                  <Settings className="h-4 w-4" />
                  Paramètres
                </button>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 transition-colors hover:bg-rose-500/10"
                  role="menuitem"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}