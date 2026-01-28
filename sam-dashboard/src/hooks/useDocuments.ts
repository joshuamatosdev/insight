import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useCallback, useState} from 'react';
import {queryKeys} from '../lib/query-keys';
import type {
    CreateDocumentRequest,
    CreateFolderRequest,
    Document,
    DocumentFilters,
    DocumentFolder,
    DocumentStatus,
    DocumentTemplate,
    UpdateDocumentRequest,
} from '../types/documents';
import {
    checkoutDocument as checkoutDocumentApi,
    createDocument as createDocumentApi,
    createFolder as createFolderApi,
    deleteDocument as deleteDocumentApi,
    deleteFolder as deleteFolderApi,
    fetchChildFolders,
    fetchDocument,
    fetchDocuments,
    fetchDocumentsByFolder,
    fetchFolder,
    fetchFolderBreadcrumb,
    fetchFolders,
    fetchTemplates,
    searchDocuments,
    updateDocument as updateDocumentApi,
    updateDocumentStatus as updateDocumentStatusApi,
} from '../services/documentService';

// ============ Folder Query Keys ============
const folderKeys = {
    all: ['folders'] as const,
    root: () => [...folderKeys.all, 'root'] as const,
    detail: (id: string) => [...folderKeys.all, 'detail', id] as const,
    children: (id: string) => [...folderKeys.all, 'children', id] as const,
    breadcrumb: (id: string) => [...folderKeys.all, 'breadcrumb', id] as const,
};

const templateKeys = {
    all: ['templates'] as const,
    list: (page: number) => [...templateKeys.all, 'list', page] as const,
};

export interface UseDocumentsReturn {
    documents: Document[];
    isLoading: boolean;
    error: Error | null;
    page: number;
    totalPages: number;
    totalElements: number;
    filters: DocumentFilters;
    setFilters: (filters: DocumentFilters) => void;
    setPage: (page: number) => void;
    refresh: () => Promise<void>;
    search: (keyword: string) => Promise<void>;
    create: (request: CreateDocumentRequest) => Promise<Document>;
    update: (id: string, request: UpdateDocumentRequest) => Promise<Document>;
    remove: (id: string) => Promise<void>;
    checkout: (id: string) => Promise<Document>;
    updateStatus: (id: string, status: DocumentStatus, notes?: string) => Promise<Document>;
}

export function useDocuments(initialFilters?: DocumentFilters): UseDocumentsReturn {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [filters, setFilters] = useState<DocumentFilters>(initialFilters ?? {});
    const [searchKeyword, setSearchKeyword] = useState<string | null>(null);

    const query = useQuery({
        queryKey: queryKeys.documents.list({page, filters, searchKeyword}),
        queryFn: async () => {
            if (searchKeyword !== null && searchKeyword.length > 0) {
                return searchDocuments(searchKeyword, page, 20);
            }
            if (filters.folderId !== undefined) {
                return fetchDocumentsByFolder(filters.folderId, page, 20);
            }
            return fetchDocuments(page, 20, filters);
        },
    });

    const createMutation = useMutation({
        mutationFn: createDocumentApi,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.documents.all});
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({id, request}: { id: string; request: UpdateDocumentRequest }) =>
            updateDocumentApi(id, request),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.documents.all});
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteDocumentApi,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.documents.all});
        },
    });

    const checkoutMutation = useMutation({
        mutationFn: checkoutDocumentApi,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.documents.all});
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({id, status, notes}: { id: string; status: DocumentStatus; notes?: string }) =>
            updateDocumentStatusApi(id, status, notes),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.documents.all});
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
        async (request: CreateDocumentRequest): Promise<Document> => {
            return createMutation.mutateAsync(request);
        },
        [createMutation]
    );

    const update = useCallback(
        async (id: string, request: UpdateDocumentRequest): Promise<Document> => {
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

    const checkout = useCallback(
        async (id: string): Promise<Document> => {
            return checkoutMutation.mutateAsync(id);
        },
        [checkoutMutation]
    );

    const updateStatus = useCallback(
        async (id: string, status: DocumentStatus, notes?: string): Promise<Document> => {
            return updateStatusMutation.mutateAsync({id, status, notes});
        },
        [updateStatusMutation]
    );

    const isLoading =
        query.isLoading ||
        createMutation.isPending ||
        updateMutation.isPending ||
        deleteMutation.isPending ||
        checkoutMutation.isPending ||
        updateStatusMutation.isPending;

    const error =
        query.error ??
        createMutation.error ??
        updateMutation.error ??
        deleteMutation.error ??
        checkoutMutation.error ??
        updateStatusMutation.error ??
        null;

    return {
        documents: query.data?.content ?? [],
        isLoading,
        error,
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
        checkout,
        updateStatus,
    };
}

export interface UseDocumentReturn {
    document: Document | null;
    isLoading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
    update: (request: UpdateDocumentRequest) => Promise<Document>;
}

export function useDocument(id: string): UseDocumentReturn {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: queryKeys.documents.detail(id),
        queryFn: () => fetchDocument(id),
        enabled: id !== '',
    });

    const updateMutation = useMutation({
        mutationFn: (request: UpdateDocumentRequest) => updateDocumentApi(id, request),
        onSuccess: (data) => {
            queryClient.setQueryData(queryKeys.documents.detail(id), data);
            queryClient.invalidateQueries({queryKey: queryKeys.documents.all});
        },
    });

    const refresh = useCallback(async () => {
        await query.refetch();
    }, [query]);

    const update = useCallback(
        async (request: UpdateDocumentRequest): Promise<Document> => {
            return updateMutation.mutateAsync(request);
        },
        [updateMutation]
    );

    return {
        document: query.data ?? null,
        isLoading: query.isLoading || updateMutation.isPending,
        error: query.error ?? updateMutation.error ?? null,
        refresh,
        update,
    };
}

export interface UseFoldersReturn {
    folders: DocumentFolder[];
    currentFolder: DocumentFolder | null;
    breadcrumb: DocumentFolder[];
    isLoading: boolean;
    error: Error | null;
    loadFolder: (folderId: string | null) => Promise<void>;
    refresh: () => Promise<void>;
    create: (request: CreateFolderRequest) => Promise<DocumentFolder>;
    remove: (id: string) => Promise<void>;
}

export function useFolders(): UseFoldersReturn {
    const queryClient = useQueryClient();
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

    const rootFoldersQuery = useQuery({
        queryKey: folderKeys.root(),
        queryFn: fetchFolders,
        enabled: currentFolderId === null,
    });

    const currentFolderQuery = useQuery({
        queryKey: folderKeys.detail(currentFolderId ?? ''),
        queryFn: () => fetchFolder(currentFolderId!),
        enabled: currentFolderId !== null,
    });

    const childFoldersQuery = useQuery({
        queryKey: folderKeys.children(currentFolderId ?? ''),
        queryFn: () => fetchChildFolders(currentFolderId!),
        enabled: currentFolderId !== null,
    });

    const breadcrumbQuery = useQuery({
        queryKey: folderKeys.breadcrumb(currentFolderId ?? ''),
        queryFn: () => fetchFolderBreadcrumb(currentFolderId!),
        enabled: currentFolderId !== null,
    });

    const createMutation = useMutation({
        mutationFn: createFolderApi,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: folderKeys.all});
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteFolderApi,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: folderKeys.all});
        },
    });

    const loadFolder = useCallback(async (folderId: string | null) => {
        setCurrentFolderId(folderId);
    }, []);

    const refresh = useCallback(async () => {
        if (currentFolderId === null) {
            await rootFoldersQuery.refetch();
        } else {
            await Promise.all([
                currentFolderQuery.refetch(),
                childFoldersQuery.refetch(),
                breadcrumbQuery.refetch(),
            ]);
        }
    }, [currentFolderId, rootFoldersQuery, currentFolderQuery, childFoldersQuery, breadcrumbQuery]);

    const create = useCallback(
        async (request: CreateFolderRequest): Promise<DocumentFolder> => {
            return createMutation.mutateAsync(request);
        },
        [createMutation]
    );

    const remove = useCallback(
        async (id: string): Promise<void> => {
            await deleteMutation.mutateAsync(id);
        },
        [deleteMutation]
    );

    const folders =
        currentFolderId === null
            ? rootFoldersQuery.data ?? []
            : childFoldersQuery.data ?? [];

    const isLoading =
        rootFoldersQuery.isLoading ||
        currentFolderQuery.isLoading ||
        childFoldersQuery.isLoading ||
        breadcrumbQuery.isLoading ||
        createMutation.isPending ||
        deleteMutation.isPending;

    const error =
        rootFoldersQuery.error ??
        currentFolderQuery.error ??
        childFoldersQuery.error ??
        breadcrumbQuery.error ??
        createMutation.error ??
        deleteMutation.error ??
        null;

    return {
        folders,
        currentFolder: currentFolderQuery.data ?? null,
        breadcrumb: breadcrumbQuery.data ?? [],
        isLoading,
        error,
        loadFolder,
        refresh,
        create,
        remove,
    };
}

export interface UseTemplatesReturn {
    templates: DocumentTemplate[];
    isLoading: boolean;
    error: Error | null;
    page: number;
    totalPages: number;
    totalElements: number;
    setPage: (page: number) => void;
    refresh: () => Promise<void>;
}

export function useTemplates(): UseTemplatesReturn {
    const [page, setPage] = useState(0);

    const query = useQuery({
        queryKey: templateKeys.list(page),
        queryFn: () => fetchTemplates(page, 20),
    });

    const refresh = useCallback(async () => {
        await query.refetch();
    }, [query]);

    return {
        templates: query.data?.content ?? [],
        isLoading: query.isLoading,
        error: query.error ?? null,
        page,
        totalPages: query.data?.totalPages ?? 0,
        totalElements: query.data?.totalElements ?? 0,
        setPage,
        refresh,
    };
}
