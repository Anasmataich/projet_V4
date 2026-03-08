import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, Download, Lock, ArrowUpDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Spinner } from '@/components/common/Spinner';
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
  documents: Document[];
  isLoading: boolean;
  onDownload?: (id: string) => void;
};

function safeRelativeDate(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: fr });
  } catch {
    return '—';
  }
}

export function DocumentTable({ documents, isLoading, onDownload }: Props) {
  const navigate = useNavigate();
  const hasDownload = useMemo(() => typeof onDownload === 'function', [onDownload]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="md" className="text-blue-400" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: 'rgba(37,99,235,0.10)' }}
        >
          <FileText className="h-7 w-7 text-slate-600" />
        </div>
        <p className="text-sm text-slate-500">Aucun document trouvé</p>
      </div>
    );
  }

  return (
    <table className="table-base" role="table" aria-label="Table des documents">
      <thead>
        <tr>
          <th>
            <span className="flex items-center gap-1.5">
              Titre <ArrowUpDown className="h-3 w-3 opacity-40" />
            </span>
          </th>
          <th>Catégorie</th>
          <th>Confidentialité</th>
          <th>Version</th>
          <th>Statut</th>
          <th>Date</th>
          <th className="text-right">Actions</th>
        </tr>
      </thead>

      <tbody>
        {documents.map((doc) => (
          <tr
            key={doc.id}
            onClick={() => navigate(`/documents/${doc.id}`)}
            className="group"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate(`/documents/${doc.id}`);
            }}
          >
            <td>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: 'rgba(37,99,235,0.12)' }}
                >
                  <FileText className="h-4 w-4 text-blue-400" />
                </div>
                <span className="max-w-[260px] truncate font-medium text-white transition-colors group-hover:text-blue-300">
                  {doc.title}
                </span>
              </div>
            </td>

            <td>
              <span className="badge-gray">{CATEGORY_LABELS[doc.category] ?? doc.category}</span>
            </td>

            <td>
              <span className={cn(CONF_BADGE[doc.confidentialityLevel] ?? 'badge-gray', 'flex items-center gap-1')}>
                <Lock className="h-3 w-3" />
                {CONFIDENTIALITY_LABELS[doc.confidentialityLevel] ?? doc.confidentialityLevel}
              </span>
            </td>

            <td>
              <span className="font-mono text-xs text-slate-400">v{doc.currentVersion ?? 1}</span>
            </td>

            <td>
              <span className={STATUS_BADGE[doc.status] ?? 'badge-gray'}>
                {STATUS_LABEL[doc.status] ?? doc.status}
              </span>
            </td>

            <td>
              <span className="text-xs text-slate-500">{safeRelativeDate(doc.createdAt)}</span>
            </td>

            <td>
              <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => navigate(`/documents/${doc.id}`)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-500/10 hover:text-blue-400"
                  title="Voir"
                  aria-label="Voir"
                >
                  <Eye className="h-4 w-4" />
                </button>

                {hasDownload && (
                  <button
                    onClick={() => onDownload?.(doc.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400"
                    title="Télécharger"
                    aria-label="Télécharger"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}