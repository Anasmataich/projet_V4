// frontend/src/pages/WorkflowPage.tsx
import { GitBranch, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WorkflowBoard } from '@/components/workflow/WorkflowBoard';

export function WorkflowPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="hover:text-slate-300 transition-colors"
        >
          Accueil
        </button>
        <span className="opacity-40">/</span>
        <span className="text-slate-300">Workflows</span>
      </div>

      {/* Header */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="page-title flex items-center gap-2.5">
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(139,92,246,0.15)' }}
              >
                <GitBranch className="h-4 w-4 text-violet-400" />
              </div>
              Workflows de validation
            </h1>
            <p className="page-sub mt-2">
              Gérez les flux de validation (soumission → approbation → archivage) avec traçabilité et sécurité.
            </p>
          </div>

          <span className="hidden sm:inline-flex badge-blue">
            <ShieldCheck className="h-3.5 w-3.5" />
            Audit & conformité
          </span>
        </div>
      </div>

      {/* Board */}
      <WorkflowBoard />
    </div>
  );
}