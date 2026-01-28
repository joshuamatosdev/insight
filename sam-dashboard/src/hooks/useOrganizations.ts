import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useCallback, useState} from 'react';
import {queryKeys} from '../lib/query-keys';
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
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [filters, setFilters] = useState<OrganizationFilters>(initialFilters ?? {});
    const [searchKeyword, setSearchKeyword] = useState<string | null>(null);

    const query = useQuery({
        queryKey: queryKeys.organizations.list({page, filters, searchKeyword}),
        queryFn: async () => {
            if (searchKeyword !== null && searchKeyword.length > 0) {
                return searchOrganizations(searchKeyword, page, 20);
            }
            return fetchOrganizations(page, 20, filters);
        },
    });

    const createMutation = useMutation({
        mutationFn: createOrganizationApi,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.organizations.all});
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({id, request}: { id: string; request: UpdateOrganizationRequest }) =>
            updateOrganizationApi(id, request),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.organizations.all});
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteOrganizationApi,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.organizations.all});
        },
    });

    const refresh = useCallback(async () => {
        await query.refetch();
    }, [query]);

    const search = useCallback(async (keyword: string) => {
        setSearchKeyword(keyword.length > 0 ? keyword : null);
        setPage(0);
    }, []);

    const create = useCallback(
        async (request: CreateOrganizationRequest): Promise<Organization> => {
            return createMutation.mutateAsync(request);
        },
        [createMutation]
    );

    const update = useCallback(
        async (id: string, request: UpdateOrganizationRequest): Promise<Organization> => {
            return updateMutation.mutateAsync({id, request});
        },
        [updateMutation]
    );

    const remove = useCallback(
        async (id: string): Promise<void> => {
            await deleteMutation.mutateAsync(id);
        },
        [deleteMutation]
    );

    return {
        organizations: query.data?.content ?? [],
        isLoading: query.isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
        error: query.error ?? createMutation.error ?? updateMutation.error ?? deleteMutation.error ?? null,
        page,
        totalPages: query.data?.totalPages ?? 0,
        totalElements: query.data?.totalElements ?? 0,
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
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: queryKeys.organizations.detail(id),
        queryFn: () => fetchOrganization(id),
        enabled: id !== '',
    });

    const updateMutation = useMutation({
        mutationFn: (request: UpdateOrganizationRequest) => updateOrganizationApi(id, request),
        onSuccess: (data) => {
            queryClient.setQueryData(queryKeys.organizations.detail(id), data);
            queryClient.invalidateQueries({queryKey: queryKeys.organizations.all});
        },
    });

    const refresh = useCallback(async () => {
        await query.refetch();
    }, [query]);

    const update = useCallback(
        async (request: UpdateOrganizationRequest): Promise<Organization> => {
            return updateMutation.mutateAsync(request);
        },
        [updateMutation]
    );

    return {
        organization: query.data ?? null,
        isLoading: query.isLoading || updateMutation.isPending,
        error: query.error ?? updateMutation.error ?? null,
        refresh,
        update,
    };
}
