import { useMemo, useEffect, useState } from 'react';
import {
  FileText,
  TrendingUp,
  Clock,
  Users,
  ArrowRight,
  ArrowUpRight,
  Upload,
  Sparkles,
  ShieldCheck,
  FolderKanban,
  CalendarDays,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Spinner } from '@/components/common/Spinner';
import { PieChart } from '@/components/reports/PieChart';
import { BarChart } from '@/components/reports/BarChart';

import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';

import { reportService, type DashboardStats } from '@/services/reportService';
import { documentService } from '@/services/documentService';
import type { Document } from '@/types/document.types';
import { cn } from '@/utils/helpers';

type StatCard = {
  label: string;
  value: number;
  icon: React.ElementType;
  iconBg: string;
  helper: string;
  trend?: string;
  to: string;
};

function CardShell({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-white">{title}</h2>
        {badge}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-[260px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
        <FolderKanban className="h-5 w-5 text-slate-500" />
      </div>
      <p className="text-sm font-medium text-slate-300">{label}</p>
      <p className="mt-1 max-w-xs text-xs text-slate-500">
        Les visualisations seront disponibles dès que les données métiers seront alimentées.
      </p>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const { canUpload } = usePermissions();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    Promise.all([
      reportService.getDashboardStats(),
      documentService.list({ page: 1, limit: 5 }).then((r) => r.data),
    ])
      .then(([s, docs]) => {
        if (!alive) return;
        setStats(s);
        setRecentDocs(docs);
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const cards: StatCard[] = useMemo(
    () => [
      {
        label: 'Documents enregistrés',
        value: stats?.totalDocuments ?? 0,
        icon: FileText,
        iconBg: 'rgba(37,99,235,0.18)',
        helper: 'Volume documentaire global',
        to: '/documents',
      },
      {
        label: 'Documents du mois',
        value: stats?.documentsThisMonth ?? 0,
        icon: TrendingUp,
        iconBg: 'rgba(16,185,129,0.18)',
        helper: 'Production documentaire récente',
        to: '/documents',
      },
      {
        label: 'Workflows en attente',
        value: stats?.pendingWorkflows ?? 0,
        icon: Clock,
        iconBg: 'rgba(245,158,11,0.18)',
        helper: 'Éléments nécessitant validation',
        to: '/workflow',
      },
      {
        label: 'Utilisateurs actifs',
        value: stats?.totalUsers ?? 0,
        icon: Users,
        iconBg: 'rgba(139,92,246,0.18)',
        helper: 'Accès à la plateforme',
        to: '/users',
      },
    ],
    [stats]
  );

  const firstName = user?.firstName ?? 'Utilisateur';
  const lastName = user?.lastName ?? '';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" className="text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="card relative overflow-hidden p-6">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -top-20 right-0 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="badge-blue">
                <Sparkles className="h-3.5 w-3.5" />
                Vue d’ensemble
              </span>
              <span className="badge-cyan">
                <ShieldCheck className="h-3.5 w-3.5" />
                GED sécurisée
              </span>
            </div>

            <h1 className="page-title">
              Tableau de bord de la plateforme documentaire
            </h1>

            <p className="page-sub mt-2 max-w-3xl">
              Bienvenue,&nbsp;
              <span className="font-semibold text-blue-300">
                {firstName} {lastName}
              </span>
              . Vous accédez à une vue synthétique de l’activité documentaire,
              des workflows et des usages de la plateforme.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                Suivi opérationnel
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                Environnement institutionnel
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate('/documents')}
              className="btn-secondary h-10 px-4 text-sm"
            >
              <FileText className="h-4 w-4" />
              Accéder aux documents
            </button>

            {canUpload && (
              <button
                onClick={() => navigate('/upload')}
                className="btn-primary h-10 px-4 text-sm"
              >
                <Upload className="h-4 w-4" />
                Déposer un document
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, iconBg, helper, trend, to }, i) => (
          <button
            key={label}
            onClick={() => navigate(to)}
            className={cn(
              'stat-card group text-left transition-all duration-200',
              'hover:border-blue-500/20 hover:shadow-card hover:-translate-y-0.5 animate-fade-in'
            )}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ background: iconBg }}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {label}
              </p>

              <div className="flex items-end gap-2">
                <span className="text-2xl font-extrabold tabular-nums text-white">
                  {value.toLocaleString()}
                </span>

                {trend ? (
                  <span className="mb-0.5 flex items-center gap-0.5 text-xs font-semibold text-emerald-400">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    {trend}
                  </span>
                ) : null}
              </div>

              <p className="mt-1 text-xs text-slate-500">{helper}</p>
            </div>

            <ArrowRight className="h-4 w-4 shrink-0 self-center text-slate-600 transition-all group-hover:translate-x-0.5 group-hover:text-blue-400" />
          </button>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <CardShell
          title="Répartition des documents par catégorie"
          badge={<span className="badge-blue">Analyse</span>}
        >
          {stats?.byCategory?.length ? (
            <PieChart data={stats.byCategory} />
          ) : (
            <EmptyState label="Aucune répartition disponible" />
          )}
        </CardShell>

        <CardShell
          title="Activité documentaire mensuelle"
          badge={<span className="badge-purple">Tendance</span>}
        >
          {stats?.monthly?.length ? (
            <BarChart data={stats.monthly} />
          ) : (
            <EmptyState label="Aucune activité agrégée disponible" />
          )}
        </CardShell>
      </section>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <h2 className="text-sm font-bold text-white">Documents récents</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Derniers éléments ajoutés ou injectés dans la plateforme
            </p>
          </div>

          <button
            onClick={() => navigate('/documents')}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 transition-colors hover:text-blue-300"
          >
            Voir tout <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {recentDocs.length === 0 ? (
          <div className="py-14 text-center">
            <div
              className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: 'rgba(37,99,235,0.10)' }}
            >
              <FileText className="h-6 w-6 text-slate-600" />
            </div>
            <p className="text-sm font-medium text-slate-300">Aucun document récent</p>
            <p className="mt-1 text-xs text-slate-500">
              Les nouveaux documents apparaîtront ici dès leur enregistrement.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' } as React.CSSProperties}>
            {recentDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => navigate(`/documents/${doc.id}`)}
                className="flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.04]"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(37,99,235,0.15)' }}
                >
                  <FileText className="h-4 w-4 text-blue-400" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{doc.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{doc.category || 'Non catégorisé'}</span>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 shrink-0 text-slate-600" />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}