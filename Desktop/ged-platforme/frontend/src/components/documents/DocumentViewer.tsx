import { useMemo, useState, useEffect } from 'react';
import { Download, Eye, ExternalLink, Copy, Check, FileText, ImageIcon, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

import { Badge } from '@/components/common/Badge';
import { Spinner } from '@/components/common/Spinner';
import { formatDate, formatFileSize } from '@/utils/formatters';
import {
  CATEGORY_LABELS,
  STATUS_COLORS,
  CONFIDENTIALITY_COLORS,
  CONFIDENTIALITY_LABELS,
  STATUS_LABELS,
} from '@/utils/constants';
import { documentService } from '@/services/documentService';
import type { Document } from '@/types/document.types';

type DocumentViewerProps = {
  document: Document;
};

export function DocumentViewer({ document: doc }: DocumentViewerProps) {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDownloadUrl(null);
    setCopied(false);
  }, [doc.id]);

  const isPdf = useMemo(() => doc.mimeType === 'application/pdf', [doc.mimeType]);
  const isImage = useMemo(() => doc.mimeType?.startsWith('image/'), [doc.mimeType]);
  const canPreview = Boolean(downloadUrl && (isPdf || isImage));

  const handleFetchUrl = async () => {
    setLoadingUrl(true);
    try {
      const url = await documentService.getDownloadUrl(doc.id);
      setDownloadUrl(url);
      return url;
    } catch {
      toast.error('Erreur lors du téléchargement');
      return null;
    } finally {
      setLoadingUrl(false);
    }
  };

  const handleDownload = async () => {
    const url = downloadUrl ?? (await handleFetchUrl());
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePreview = async () => {
    const url = downloadUrl ?? (await handleFetchUrl());
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = async () => {
    if (!downloadUrl) {
      toast.error('Générez le lien d’abord via Télécharger');
      return;
    }
    try {
      await navigator.clipboard.writeText(downloadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
      toast.success('Lien copié');
    } catch {
      toast.error('Impossible de copier le lien');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold text-white">{doc.title}</h2>
          <p className="mt-1 truncate text-sm text-slate-500">{doc.fileName}</p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {canPreview && (
            <button className="btn-secondary px-3 py-2 text-xs" onClick={handlePreview}>
              <Eye className="h-4 w-4" />
              Prévisualiser
            </button>
          )}

          <button className="btn-primary px-3 py-2 text-xs" onClick={handleDownload} disabled={loadingUrl}>
            <Download className="h-4 w-4" />
            {loadingUrl ? 'Chargement…' : 'Télécharger'}
          </button>

          {downloadUrl && (
            <button className="btn-secondary px-3 py-2 text-xs" onClick={handleCopy} title="Copier le lien">
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {downloadUrl && isPdf && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
          <iframe
            src={downloadUrl}
            className="h-[520px] w-full"
            title="Aperçu du document PDF"
            sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
          />
        </div>
      )}

      {downloadUrl && isImage && (
        <div className="flex items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <img src={downloadUrl} alt={doc.title} className="max-h-[520px] max-w-full object-contain" />
        </div>
      )}

      {!downloadUrl && !loadingUrl && (
        <div className="empty-state py-16">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
            {isPdf ? (
              <FileText className="h-6 w-6 text-blue-400" />
            ) : isImage ? (
              <ImageIcon className="h-6 w-6 text-blue-400" />
            ) : (
              <ExternalLink className="h-6 w-6 text-slate-500" />
            )}
          </div>

          <p className="text-sm font-medium text-slate-300">
            Aperçu sécurisé non encore généré
          </p>
          <p className="mt-1 max-w-md text-center text-sm text-slate-500">
            Cliquez sur “Télécharger” pour générer un lien sécurisé et accéder au contenu du document.
          </p>
        </div>
      )}

      {loadingUrl && (
        <div className="flex justify-center py-8">
          <Spinner size="lg" className="text-blue-400" />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <InfoItem label="Catégorie" value={CATEGORY_LABELS[doc.category] ?? doc.category} />
        <InfoItem label="Statut">
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[doc.status]}`}>
            {STATUS_LABELS[doc.status] ?? doc.status}
          </span>
        </InfoItem>
        <InfoItem label="Confidentialité">
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${CONFIDENTIALITY_COLORS[doc.confidentialityLevel]}`}
          >
            {CONFIDENTIALITY_LABELS[doc.confidentialityLevel] ?? doc.confidentialityLevel}
          </span>
        </InfoItem>
        <InfoItem label="Taille" value={formatFileSize(doc.fileSize)} />
        <InfoItem label="Version" value={`v${doc.currentVersion ?? 1}`} />
        <InfoItem label="Créé le" value={formatDate(doc.createdAt)} />
      </div>

      {doc.description && (
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-300">
            <Shield className="h-4 w-4 text-blue-400" />
            Description
          </h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-400">{doc.description}</p>
        </div>
      )}

      {doc.tags?.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-300">Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {doc.tags.map((t) => (
              <Badge key={t} variant="info">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      {children ?? <p className="text-sm font-medium text-white">{value || '—'}</p>}
    </div>
  );
}