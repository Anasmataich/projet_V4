import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Upload,
  GitBranch,
  Cpu,
  Users,
  Shield,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/utils/helpers';
import { useUiStore } from '@/store/uiStore';
import { usePermissions } from '@/hooks/usePermissions';

import logoMinistere from '@/assets/logo-ministere.png';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  show?: boolean;
  group?: string;
}

const GROUPS = [
  { key: 'main', label: 'Navigation' },
  { key: 'admin', label: 'Administration' },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const {
    canManageUsers,
    canViewAudit,
    canViewReports,
    canUseAITools,
    canUpload,
    canApproveWorkflow,
  } = usePermissions();

  const navItems: NavItem[] = [
    { to: '/', label: 'Tableau de bord', icon: LayoutDashboard, group: 'main' },
    { to: '/documents', label: 'Documents', icon: FileText, group: 'main' },
    { to: '/upload', label: 'Dépôt documentaire', icon: Upload, group: 'main', show: canUpload },
    { to: '/workflow', label: 'Workflows', icon: GitBranch, group: 'main', show: canApproveWorkflow },
    { to: '/ai', label: 'Outils IA', icon: Cpu, group: 'main', show: canUseAITools },
    { to: '/reports', label: 'Rapports', icon: BarChart3, group: 'admin', show: canViewReports },
    { to: '/audit', label: 'Audit & traçabilité', icon: Shield, group: 'admin', show: canViewAudit },
    { to: '/users', label: 'Utilisateurs', icon: Users, group: 'admin', show: canManageUsers },
    { to: '/settings', label: 'Paramètres', icon: Settings, group: 'admin' },
  ];

  const visible = navItems.filter((item) => item.show !== false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-30 flex h-screen flex-col transition-all duration-300 ease-in-out',
        sidebarOpen ? 'w-[var(--sidebar-w)]' : 'w-[var(--sidebar-collapsed)]'
      )}
      style={{
        background: 'linear-gradient(180deg, #0b1630 0%, #060d1f 100%)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div
        className="flex h-16 shrink-0 items-center gap-3 px-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white/5 p-2 ring-1 ring-white/10">
          <img src={logoMinistere} alt="Logo Ministère" className="h-full w-full object-contain" />
        </div>

        {sidebarOpen && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight text-white">
              GED — Plateforme
            </p>
            <p className="truncate text-[10px] text-slate-400">
              Ministère de l&apos;Éducation
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {GROUPS.map((group) => {
          const items = visible.filter((item) => item.group === group.key);
          if (!items.length) return null;

          return (
            <div key={group.key} className="mb-5">
              {sidebarOpen && (
                <p
                  className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: 'rgba(148,163,184,0.45)' }}
                >
                  {group.label}
                </p>
              )}

              <div className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      title={!sidebarOpen ? item.label : undefined}
                      className={({ isActive }) =>
                        cn(
                          'nav-item',
                          isActive && 'active',
                          !sidebarOpen && 'justify-center px-0'
                        )
                      }
                      end={item.to === '/'}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      {sidebarOpen && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {sidebarOpen && (
        <div className="mx-3 mb-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-xs font-semibold text-white">Plateforme institutionnelle</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            Gestion, sécurisation, traçabilité et valorisation des documents administratifs.
          </p>
        </div>
      )}

      <div className="px-3 pb-4">
        <button
          onClick={toggleSidebar}
          className="nav-item w-full"
          title={sidebarOpen ? 'Réduire' : 'Agrandir'}
        >
          {sidebarOpen ? (
            <>
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span>Réduire</span>
            </>
          ) : (
            <ChevronRight className="mx-auto h-4 w-4 shrink-0" />
          )}
        </button>
      </div>
    </aside>
  );
}