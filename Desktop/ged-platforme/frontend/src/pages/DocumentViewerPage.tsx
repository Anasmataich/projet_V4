import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, GitBranch, FileText, ShieldCheck, Clock3 } from 'lucide-react';

import { Spinner } from '@/components/common/Spinner';
import { Modal } from '@/components/common/Modal';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import { VersionHistory } from '@/components/documents/VersionHistory';

import { documentService } from '@/services/documentService';
import { workflowService } from '@/services/workflowService';
import { usePermissions } from '@/hooks/usePermissions';

import type { Document } from '@/types/document.types';
import { cn } from '@/utils/helpers';
import toast from 'react-hot-toast';
import { STATUS_LABELS, CONFIDENTIALITY_LABELS, CATEGORY_LABELS } from '@/utils/constants';

type TabKey = 'details' | 'versions';

export function DocumentViewerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canDelete } = usePermissions();

  const [doc, setDoc] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('details');

  useEffect(() => {
    if (!id) return;

    let alive = true;
    setIsLoading(true);

    documentService
      .getById(id)
      .then((d) => alive && setDoc(d))
      .catch(() => {
        toast.error('Document introuvable');
        navigate('/documents');
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [id, navigate]);

  const canSubmitWorkflow = useMemo(() => doc?.status === 'BROUILLON', [doc?.status]);

  const handleDelete = async () => {
    if (!id) return;

    try {
      await documentService.remove(id);
      toast.success('Document supprimé');
      navigate('/documents');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleSubmitWorkflow = async () => {
    if (!id) return;

    try {
      await workflowService.submit(id);
      toast.success('Document soumis pour validation');
      const updated = await documentService.getById(id);
      setDoc(updated);
    } catch {
      toast.error('Erreur lors de la soumission');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" className="text-blue-400" />
      </div>
    );
  }

  if (!doc) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="card relative overflow-hidden p-6">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -top-16 right-0 h-44 w-44 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <button
              onClick={() => navigate('/documents')}
              className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux documents
            </button>

            <div className="mt-4 flex items-start gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: 'rgba(37,99,235,0.15)' }}
              >
                <FileText className="h-5 w-5 text-blue-400" />
              </div>

              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="badge-blue">Document</span>
                  <span className="badge-cyan inline-flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    {CONFIDENTIALITY_LABELS[doc.confidentialityLevel]}
                  </span>
                </div>

                <h1 className="truncate text-2xl font-extrabold text-white">{doc.title}</h1>
                <p className="mt-1 truncate text-sm text-slate-500">{doc.fileName}</p>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                    {CATEGORY_LABELS[doc.category]}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                    {STATUS_LABELS[doc.status]}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                    <Clock3 className="h-3.5 w-3.5" />
                    Version {doc.currentVersion ?? 1}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canSubmitWorkflow && (
              <button className="btn-secondary px-3 py-2 text-xs" onClick={handleSubmitWorkflow}>
                <GitBranch className="h-4 w-4" />
                Soumettre pour validation
              </button>
            )}

            {canDelete && (
              <button className="btn-danger px-3 py-2 text-xs" onClick={() => setShowDeleteModal(true)}>
                <Trash2 className="h-4 w-4" />
                Supprimer
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6">
          <div className="flex gap-2">
            <TabButton active={activeTab === 'details'} onClick={() => setActiveTab('details')}>
              Détails
            </TabButton>
            <TabButton active={activeTab === 'versions'} onClick={() => setActiveTab('versions')}>
              Historique des versions
            </TabButton>
          </div>

          <span className="hidden sm:inline-flex badge-blue">Consultation</span>
        </div>

        <div className="divider" />

        <div className="p-4 sm:p-6">
          {activeTab === 'details' && <DocumentViewer document={doc} />}
          {activeTab === 'versions' && <VersionHistory documentId={doc.id} />}
        </div>
      </section>

      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirmer la suppression">
        <p className="mb-5 text-sm text-slate-400">
          Êtes-vous sûr de vouloir supprimer le document{' '}
          <strong className="text-white">"{doc.title}"</strong> ? Cette action est irréversible.
        </p>
        <div className="flex justify-end gap-2">
          <button className="btn-secondary px-3 py-2 text-xs" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </button>
          <button className="btn-danger px-3 py-2 text-xs" onClick={handleDelete}>
            Supprimer
          </button>
        </div>
      </Modal>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'border-b-2 px-4 py-3 text-sm font-semibold transition-colors',
        active
          ? 'border-blue-500 text-blue-300'
          : 'border-transparent text-slate-500 hover:text-slate-300'
      )}
    >
      {children}
    </button>
  );
}