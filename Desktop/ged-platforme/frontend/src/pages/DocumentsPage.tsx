import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Grid3X3, List, Upload, Filter, Search, X, Dot } from 'lucide-react';

import { Pagination } from '@/components/common/Pagination';
import { DocumentTable } from '@/components/documents/DocumentTable';
import { DocumentCard } from '@/components/documents/DocumentCard';

import { useDocuments } from '@/hooks/useDocuments';
import { usePermissions } from '@/hooks/usePermissions';

import { CATEGORY_LABELS, STATUS_LABELS, CONFIDENTIALITY_LABELS } from '@/utils/constants';
import type { DocumentCategory, DocumentStatus, ConfidentialityLevel } from '@/types/document.types';
import { cn } from '@/utils/helpers';

type ViewMode = 'table' | 'grid';

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="badge-gray inline-flex items-center gap-1.5">
      {label}
      <button
        type="button"
        onClick={onClear}
        className="rounded-full p-0.5 hover:bg-white/10"
        aria-label="Supprimer filtre"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

export function DocumentsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { canUpload } = usePermissions();

  const {
    documents,
    total,
    filters,
    isLoading,
    search,
    changePage,
    applyFilters,
    resetFilters,
  } = useDocuments();

  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showFilters, setShowFilters] = useState(false);

  const urlSearch = searchParams.get('search') ?? '';
  const [searchValue, setSearchValue] = useState(urlSearch);

  useEffect(() => {
    setSearchValue(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const normalized = searchValue.trim();
      const current = filters.search ?? '';

      if (normalized === current) return;

      search(normalized);

      const nextParams = new URLSearchParams(searchParams);

      if (normalized) {
        nextParams.set('search', normalized);
      } else {
        nextParams.delete('search');
      }

      setSearchParams(nextParams, { replace: true });
    }, 250);

    return () => window.clearTimeout(t);
  }, [searchValue, search, filters.search, searchParams, setSearchParams]);

  useEffect(() => {
    const normalized = urlSearch.trim();
    const current = filters.search ?? '';

    if (normalized !== current) {
      search(normalized);
    }
  }, [urlSearch, filters.search, search]);

  const limit = filters.limit ?? 20;
  const page = filters.page ?? 1;

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.category) ||
    Boolean(filters.status) ||
    Boolean(filters.confidentialityLevel);

  const clearSearch = () => {
    setSearchValue('');
    search('');

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('search');
    setSearchParams(nextParams, { replace: true });
  };

  const handleResetFilters = () => {
    resetFilters();
    setSearchValue('');

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('search');
    setSearchParams(nextParams, { replace: true });
  };

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = [];

    if (filters.search) {
      chips.push({
        key: 'search',
        label: `Recherche: “${filters.search}”`,
        clear: clearSearch,
      });
    }

    if (filters.category) {
      chips.push({
        key: 'category',
        label: `Catégorie: ${CATEGORY_LABELS[filters.category] ?? filters.category}`,
        clear: () => applyFilters({ category: undefined }),
      });
    }

    if (filters.status) {
      chips.push({
        key: 'status',
        label: `Statut: ${STATUS_LABELS[filters.status] ?? filters.status}`,
        clear: () => applyFilters({ status: undefined }),
      });
    }

    if (filters.confidentialityLevel) {
      chips.push({
        key: 'conf',
        label: `Confidentialité: ${CONFIDENTIALITY_LABELS[filters.confidentialityLevel] ?? filters.confidentialityLevel}`,
        clear: () => applyFilters({ confidentialityLevel: undefined }),
      });
    }

    return chips;
  }, [filters, applyFilters, searchParams, setSearchParams]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Documents</h1>
          <p className="page-sub">{total.toLocaleString()} document(s) au total</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              'btn-secondary relative h-9 px-3 text-xs',
              showFilters && 'border-blue-500/50 text-blue-300'
            )}
          >
            <Filter className="h-3.5 w-3.5" />
            Filtres
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white">
                <Dot className="h-5 w-5" />
              </span>
            )}
          </button>

          <div className="flex overflow-hidden rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.10)' }}>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'flex h-9 w-9 items-center justify-center transition-colors',
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              )}
              title="Vue tableau"
              type="button"
            >
              <List className="h-4 w-4" />
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex h-9 w-9 items-center justify-center transition-colors',
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              )}
              title="Vue grille"
              type="button"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>

          {canUpload && (
            <button onClick={() => navigate('/upload')} className="btn-primary h-9 px-3 text-xs">
              <Upload className="h-4 w-4" />
              Uploader
            </button>
          )}
        </div>
      </div>

      <div className="card p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Rechercher par titre, catégorie…"
              className="input h-9 pl-9 pr-10"
            />
            {searchValue && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                aria-label="Effacer la recherche"
                type="button"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button onClick={handleResetFilters} className="btn-ghost h-9 px-3 text-xs" type="button">
              <X className="h-3.5 w-3.5" />
              Réinitialiser
            </button>
          )}
        </div>

        {activeChips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeChips.map((c) => (
              <Chip key={c.key} label={c.label} onClear={c.clear} />
            ))}
          </div>
        )}

        {showFilters && (
          <div
            className="mt-3 grid grid-cols-1 gap-3 pt-3 animate-fade-in sm:grid-cols-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div>
              <label className="label">Catégorie</label>
              <select
                className="select"
                value={filters.category ?? ''}
                onChange={(e) => applyFilters({ category: (e.target.value as DocumentCategory) || undefined })}
              >
                <option value="">Toutes</option>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Statut</label>
              <select
                className="select"
                value={filters.status ?? ''}
                onChange={(e) => applyFilters({ status: (e.target.value as DocumentStatus) || undefined })}
              >
                <option value="">Tous</option>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Confidentialité</label>
              <select
                className="select"
                value={filters.confidentialityLevel ?? ''}
                onChange={(e) =>
                  applyFilters({
                    confidentialityLevel: (e.target.value as ConfidentialityLevel) || undefined,
                  })
                }
              >
                <option value="">Tous niveaux</option>
                {Object.entries(CONFIDENTIALITY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {viewMode === 'table' ? (
        <div className="table-wrapper animate-fade-in">
          <DocumentTable documents={documents} isLoading={isLoading} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 animate-fade-in sm:grid-cols-2 xl:grid-cols-3">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}

      {total > limit && (
        <div className="flex justify-center">
          <Pagination page={page} total={total} limit={limit} onPageChange={changePage} />
        </div>
      )}
    </div>
  );
}