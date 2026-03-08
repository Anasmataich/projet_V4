import { useCallback, useEffect } from 'react';
import { useDocumentStore } from '@/store/documentStore';
import type { DocumentFilters } from '@/types/document.types';

export function useDocuments(autoFetch = true) {
  const {
    documents,
    total,
    filters,
    isLoading,
    error,
    setFilters,
    fetchDocuments,
    resetFilters,
  } = useDocumentStore();

  useEffect(() => {
    if (!autoFetch) return;
    fetchDocuments();
  }, [autoFetch, fetchDocuments]);

  const search = useCallback(
    (searchTerm: string) => {
      setFilters({ search: searchTerm || undefined, page: 1 });
    },
    [setFilters]
  );

  const changePage = useCallback(
    (page: number) => {
      setFilters({ page });
    },
    [setFilters]
  );

  const applyFilters = useCallback(
    (partial: Partial<DocumentFilters>) => {
      setFilters({ ...partial, page: 1 });
    },
    [setFilters]
  );

  const refresh = useCallback(() => fetchDocuments(), [fetchDocuments]);

  return {
    documents,
    total,
    filters,
    isLoading,
    error,
    search,
    changePage,
    applyFilters,
    resetFilters,
    refresh,
  };
}