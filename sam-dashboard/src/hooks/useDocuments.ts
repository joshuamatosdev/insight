import { useState, useCallback, useEffect } from 'react';
import type {
  Document,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DocumentFilters,
  DocumentFolder,
  CreateFolderRequest,
  UpdateFolderRequest,
  DocumentTemplate,
} from '../types/documents';
import {
  fetchDocuments,
  fetchDocument,
  createDocument as createDocumentApi,
  updateDocument as updateDocumentApi,
  deleteDocument as deleteDocumentApi,
  searchDocuments,
  fetchDocumentsByFolder,
  checkoutDocument as checkoutDocumentApi,
  updateDocumentStatus as updateDocumentStatusApi,
  fetchFolders,
  fetchFolder,
  fetchChildFolders,
  createFolder as createFolderApi,
  deleteFolder as deleteFolderApi,
  fetchFolderBreadcrumb,
  fetchTemplates,
} from '../services/documentService';
import type { DocumentStatus } from '../types/documents';

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
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState<DocumentFilters>(initialFilters ?? {});

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let result;
      if (filters.folderId !== undefined) {
        result = await fetchDocumentsByFolder(filters.folderId, page, 20);
      } else {
        result = await fetchDocuments(page, 20, filters);
      }
      setDocuments(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load documents';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const refresh = useCallback(async () => {
    await loadDocuments();
  }, [loadDocuments]);

  const search = useCallback(async (keyword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await searchDocuments(keyword, page, 20);
      setDocuments(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  const create = useCallback(async (request: CreateDocumentRequest): Promise<Document> => {
    const newDocument = await createDocumentApi(request);
    setDocuments((prev) => [newDocument, ...prev]);
    setTotalElements((prev) => prev + 1);
    return newDocument;
  }, []);

  const update = useCallback(async (id: string, request: UpdateDocumentRequest): Promise<Document> => {
    const updatedDocument = await updateDocumentApi(id, request);
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? updatedDocument : d))
    );
    return updatedDocument;
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    await deleteDocumentApi(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setTotalElements((prev) => prev - 1);
  }, []);

  const checkout = useCallback(async (id: string): Promise<Document> => {
    const updatedDocument = await checkoutDocumentApi(id);
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? updatedDocument : d))
    );
    return updatedDocument;
  }, []);

  const updateStatus = useCallback(async (
    id: string,
    status: DocumentStatus,
    notes?: string
  ): Promise<Document> => {
    const updatedDocument = await updateDocumentStatusApi(id, status, notes);
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? updatedDocument : d))
    );
    return updatedDocument;
  }, []);

  return {
    documents,
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
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadDocument = useCallback(async () => {
    if (id === '') {
      setDocument(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchDocument(id);
      setDocument(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load document';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadDocument();
  }, [loadDocument]);

  const refresh = useCallback(async () => {
    await loadDocument();
  }, [loadDocument]);

  const update = useCallback(async (request: UpdateDocumentRequest): Promise<Document> => {
    const updatedDocument = await updateDocumentApi(id, request);
    setDocument(updatedDocument);
    return updatedDocument;
  }, [id]);

  return {
    document,
    isLoading,
    error,
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
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<DocumentFolder | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<DocumentFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadRootFolders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const rootFolders = await fetchFolders();
      setFolders(rootFolders);
      setCurrentFolder(null);
      setBreadcrumb([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load folders';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRootFolders();
  }, [loadRootFolders]);

  const loadFolder = useCallback(async (folderId: string | null) => {
    setIsLoading(true);
    setError(null);
    try {
      if (folderId === null) {
        await loadRootFolders();
        return;
      }

      const [folder, children, crumbs] = await Promise.all([
        fetchFolder(folderId),
        fetchChildFolders(folderId),
        fetchFolderBreadcrumb(folderId),
      ]);

      setCurrentFolder(folder);
      setFolders(children);
      setBreadcrumb(crumbs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load folder';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [loadRootFolders]);

  const refresh = useCallback(async () => {
    if (currentFolder !== null) {
      await loadFolder(currentFolder.id);
    } else {
      await loadRootFolders();
    }
  }, [currentFolder, loadFolder, loadRootFolders]);

  const create = useCallback(async (request: CreateFolderRequest): Promise<DocumentFolder> => {
    const newFolder = await createFolderApi(request);
    setFolders((prev) => [...prev, newFolder]);
    return newFolder;
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    await deleteFolderApi(id);
    setFolders((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return {
    folders,
    currentFolder,
    breadcrumb,
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
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchTemplates(page, 20);
      setTemplates(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load templates';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  const refresh = useCallback(async () => {
    await loadTemplates();
  }, [loadTemplates]);

  return {
    templates,
    isLoading,
    error,
    page,
    totalPages,
    totalElements,
    setPage,
    refresh,
  };
}
