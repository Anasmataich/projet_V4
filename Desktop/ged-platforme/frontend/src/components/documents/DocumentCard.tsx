// frontend/src/components/documents/DocumentCard.tsx
import { useMemo } from 'react';
import { FileText, Eye, Download, Clock, Lock, User2, Tag as TagIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Document } from '@/types/document.types';
import { cn } from '@/utils/helpers';
import { CATEGORY_LABELS, CONFIDENTIALITY_LABELS } from '@/utils/constants';

const STATUS_BADGE: Record<string, string> = {
  APPROUVE: 'badge-green',
  EN_ATTENTE: 'badge-amber',
  REJETE: 'badge-red',
  BROUILLON: 'badge-gray',
  ARCHIVE: 'badge-purple',
  EN_REVISION: 'badge-cyan',
};

const STATUS_LABEL: Record<string, string> = {
  APPROUVE: 'Approuvé',
  EN_ATTENTE: 'En attente',
  REJETE: 'Rejeté',
  BROUILLON: 'Brouillon',
  ARCHIVE: 'Archivé',
  EN_REVISION: 'En révision',
};

const CONF_BADGE: Record<string, string> = {
  PUBLIC: 'badge-green',
  INTERNE: 'badge-blue',
  CONFIDENTIEL: 'badge-amber',
  SECRET: 'badge-red',
};

type Props = {
  document: Document;
  onDownload?: (id: string) => void;
};

function safeRelativeDate(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: fr });
  } catch {
    return '—';
  }
}

export function DocumentCard({ document: doc, onDownload }: Props) {
  const navigate = useNavigate();
  const hasDownload = useMemo(() => typeof onDownload === 'function', [onDownload]);

  const goDetails = () => navigate(`/documents/${doc.id}`);

  return (
    <article
      className="card-hover p-5 flex flex-col gap-4 cursor-pointer group"
      onClick={goDetails}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') goDetails();
      }}
      aria-label={`Ouvrir le document ${doc.title}`}
    >
      {/* Title row */}
      <div className="flex items-start gap-3">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(37,99,235,0.15)' }}
        >
          <FileText className="h-5 w-5 text-blue-400" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-tight truncate group-hover:text-blue-300 transition-colors">
            {doc.title}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="badge-gray">{CATEGORY_LABELS[doc.category] ?? doc.category}</span>

            {doc.uploaderName && (
              <span className="inline-flex items-center gap-1">
                <User2 className="h-3.5 w-3.5" />
                <span className="truncate max-w-[180px]">{doc.uploaderName}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <span className={STATUS_BADGE[doc.status] ?? 'badge-gray'}>
          {STATUS_LABEL[doc.status] ?? doc.status}
        </span>

        <span className={cn(CONF_BADGE[doc.confidentialityLevel] ?? 'badge-gray', 'inline-flex items-center gap-1')}>
          <Lock className="h-3 w-3" />
          {CONFIDENTIALITY_LABELS[doc.confidentialityLevel] ?? doc.confidentialityLevel}
        </span>

        <span className="badge-purple">v{doc.currentVersion ?? 1}</span>

        {doc.tags?.length ? (
          <span className="badge-blue inline-flex items-center gap-1">
            <TagIcon className="h-3 w-3" />
            {doc.tags.length}
          </span>
        ) : null}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between mt-auto pt-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <Clock className="h-3 w-3" />
          {safeRelativeDate(doc.createdAt)}
        </span>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              goDetails();
            }}
            title="Voir"
            aria-label="Voir"
          >
            <Eye className="h-4 w-4" />
          </button>

          {hasDownload && (
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onDownload?.(doc.id);
              }}
              title="Télécharger"
              aria-label="Télécharger"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

