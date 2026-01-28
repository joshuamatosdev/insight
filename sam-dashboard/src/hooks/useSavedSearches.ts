import {useCallback, useEffect, useState} from 'react';
import type {CreateSavedSearchRequest, SavedSearch, SearchResult, UpdateSavedSearchRequest,} from '../services';
import {
    createSavedSearch,
    deleteSavedSearch,
    duplicateSavedSearch,
    executeSavedSearch,
    fetchSavedSearch,
    fetchSavedSearches,
    setDefaultSearch,
    updateSavedSearch,
} from '../services';

interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface UseSavedSearchesReturn {
  savedSearches: SavedSearch[];
  isLoading: boolean;
  error: Error | null;
  create: (data: CreateSavedSearchRequest) => Promise<SavedSearch>;
  update: (id: string, data: UpdateSavedSearchRequest) => Promise<SavedSearch>;
  remove: (id: string) => Promise<void>;
  setDefault: (id: string) => Promise<SavedSearch>;
  duplicate: (id: string, newName: string) => Promise<SavedSearch>;
  refresh: () => Promise<void>;
}

export function useSavedSearches(): UseSavedSearchesReturn {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSavedSearches = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchSavedSearches();
      setSavedSearches(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load saved searches'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSavedSearches();
  }, [loadSavedSearches]);

  const create = useCallback(async (data: CreateSavedSearchRequest) => {
    const search = await createSavedSearch(data);
    await loadSavedSearches();
    return search;
  }, [loadSavedSearches]);

  const update = useCallback(async (id: string, data: UpdateSavedSearchRequest) => {
    const search = await updateSavedSearch(id, data);
    await loadSavedSearches();
    return search;
  }, [loadSavedSearches]);

  const remove = useCallback(async (id: string) => {
    await deleteSavedSearch(id);
    await loadSavedSearches();
  }, [loadSavedSearches]);

  const setDefault = useCallback(async (id: string) => {
    const search = await setDefaultSearch(id);
    await loadSavedSearches();
    return search;
  }, [loadSavedSearches]);

  const duplicate = useCallback(async (id: string, newName: string) => {
    const search = await duplicateSavedSearch(id, newName);
    await loadSavedSearches();
    return search;
  }, [loadSavedSearches]);

  return {
    savedSearches,
    isLoading,
    error,
    create,
    update,
    remove,
    setDefault,
    duplicate,
    refresh: loadSavedSearches,
  };
}

export interface UseSavedSearchReturn {
  savedSearch: SavedSearch | null;
  isLoading: boolean;
  error: Error | null;
  update: (data: UpdateSavedSearchRequest) => Promise<SavedSearch>;
  refresh: () => Promise<void>;
}

export function useSavedSearch(id: string | null): UseSavedSearchReturn {
  const [savedSearch, setSavedSearch] = useState<SavedSearch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSavedSearch = useCallback(async () => {
    if (id === null || id === '') {
      setSavedSearch(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchSavedSearch(id);
      setSavedSearch(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load saved search'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadSavedSearch();
  }, [loadSavedSearch]);

  const update = useCallback(async (data: UpdateSavedSearchRequest) => {
    if (id === null) throw new Error('No saved search ID');
    const updated = await updateSavedSearch(id, data);
    setSavedSearch(updated);
    return updated;
  }, [id]);

  return {
    savedSearch,
    isLoading,
    error,
    update,
    refresh: loadSavedSearch,
  };
}

export interface UseSavedSearchResultsReturn {
  results: SearchResult[];
  totalElements: number;
  totalPages: number;
  page: number;
  isLoading: boolean;
  error: Error | null;
  setPage: (page: number) => void;
  execute: () => Promise<void>;
}

export function useSavedSearchResults(
  savedSearchId: string | null,
  pageSize: number = 20
): UseSavedSearchResultsReturn {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    if (savedSearchId === null || savedSearchId === '') {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data: Page<SearchResult> = await executeSavedSearch(savedSearchId, page, pageSize);
      setResults(data.content);
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to execute search'));
    } finally {
      setIsLoading(false);
    }
  }, [savedSearchId, page, pageSize]);

  return {
    results,
    totalElements,
    totalPages,
    page,
    isLoading,
    error,
    setPage,
    execute,
  };
}
