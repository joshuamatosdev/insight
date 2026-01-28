import {useCallback, useEffect, useState} from 'react';
import type {
    CreateOrganizationRequest,
    Organization,
    OrganizationFilters,
    UpdateOrganizationRequest,
} from '../types/crm';
import {
    createOrganization as createOrganizationApi,
    deleteOrganization as deleteOrganizationApi,
    fetchOrganization,
    fetchOrganizations,
    searchOrganizations,
    updateOrganization as updateOrganizationApi,
} from '../services/crmService';

export interface UseOrganizationsReturn {
  organizations: Organization[];
  isLoading: boolean;
  error: Error | null;
  page: number;
  totalPages: number;
  totalElements: number;
  filters: OrganizationFilters;
  setFilters: (filters: OrganizationFilters) => void;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
  search: (keyword: string) => Promise<void>;
  create: (request: CreateOrganizationRequest) => Promise<Organization>;
  update: (id: string, request: UpdateOrganizationRequest) => Promise<Organization>;
  remove: (id: string) => Promise<void>;
}

export function useOrganizations(initialFilters?: OrganizationFilters): UseOrganizationsReturn {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState<OrganizationFilters>(initialFilters ?? {});

  const loadOrganizations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchOrganizations(page, 20, filters);
      setOrganizations(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load organizations';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    void loadOrganizations();
  }, [loadOrganizations]);

  const refresh = useCallback(async () => {
    await loadOrganizations();
  }, [loadOrganizations]);

  const search = useCallback(async (keyword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await searchOrganizations(keyword, page, 20);
      setOrganizations(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  const create = useCallback(async (request: CreateOrganizationRequest): Promise<Organization> => {
    const newOrg = await createOrganizationApi(request);
    setOrganizations((prev) => [newOrg, ...prev]);
    setTotalElements((prev) => prev + 1);
    return newOrg;
  }, []);

  const update = useCallback(async (id: string, request: UpdateOrganizationRequest): Promise<Organization> => {
    const updatedOrg = await updateOrganizationApi(id, request);
    setOrganizations((prev) =>
      prev.map((o) => (o.id === id ? updatedOrg : o))
    );
    return updatedOrg;
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    await deleteOrganizationApi(id);
    setOrganizations((prev) => prev.filter((o) => o.id !== id));
    setTotalElements((prev) => prev - 1);
  }, []);

  return {
    organizations,
    isLoading,
    error,
    page,
    totalPages,
    totalElements,
    filters,
    setFilters,
    setPage,
    refresh,
    search,
    create,
    update,
    remove,
  };
}

export interface UseOrganizationReturn {
  organization: Organization | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  update: (request: UpdateOrganizationRequest) => Promise<Organization>;
}

export function useOrganization(id: string): UseOrganizationReturn {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadOrganization = useCallback(async () => {
    if (id === '') {
      setOrganization(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchOrganization(id);
      setOrganization(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load organization';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadOrganization();
  }, [loadOrganization]);

  const refresh = useCallback(async () => {
    await loadOrganization();
  }, [loadOrganization]);

  const update = useCallback(async (request: UpdateOrganizationRequest): Promise<Organization> => {
    const updatedOrg = await updateOrganizationApi(id, request);
    setOrganization(updatedOrg);
    return updatedOrg;
  }, [id]);

  return {
    organization,
    isLoading,
    error,
    refresh,
    update,
  };
}
