import {useCallback, useEffect, useState} from 'react';
import type {FileFolder, FileMetadata} from '../services';
import {
    createFileFolder,
    deleteFile,
    deleteFileFolder,
    fetchFile,
    fetchFileFolders,
    fetchFiles,
    moveFile,
    renameFile,
    renameFolder,
    uploadFile,
} from '../services';

export interface UseFilesReturn {
  files: FileMetadata[];
  isLoading: boolean;
  error: Error | null;
  currentFolderId: string | null;
  setCurrentFolderId: (folderId: string | null) => void;
  upload: (file: File, onProgress?: (progress: number) => void) => Promise<FileMetadata>;
  remove: (id: string) => Promise<void>;
  move: (id: string, targetFolderId: string | null) => Promise<void>;
  rename: (id: string, newName: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useFiles(initialFolderId: string | null = null): UseFilesReturn {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(initialFolderId);

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchFiles(currentFolderId ?? undefined);
      setFiles(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load files'));
    } finally {
      setIsLoading(false);
    }
  }, [currentFolderId]);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  const upload = useCallback(async (file: File, onProgress?: (progress: number) => void) => {
    const uploaded = await uploadFile(file, currentFolderId ?? undefined, onProgress);
    await loadFiles();
    return uploaded;
  }, [currentFolderId, loadFiles]);

  const remove = useCallback(async (id: string) => {
    await deleteFile(id);
    await loadFiles();
  }, [loadFiles]);

  const move = useCallback(async (id: string, targetFolderId: string | null) => {
    await moveFile(id, targetFolderId);
    await loadFiles();
  }, [loadFiles]);

  const rename = useCallback(async (id: string, newName: string) => {
    await renameFile(id, newName);
    await loadFiles();
  }, [loadFiles]);

  return {
    files,
    isLoading,
    error,
    currentFolderId,
    setCurrentFolderId,
    upload,
    remove,
    move,
    rename,
    refresh: loadFiles,
  };
}

export interface UseFileReturn {
  file: FileMetadata | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useFile(id: string | null): UseFileReturn {
  const [file, setFile] = useState<FileMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadFile = useCallback(async () => {
    if (id === null || id === '') {
      setFile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchFile(id);
      setFile(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load file'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadFile();
  }, [loadFile]);

  return {
    file,
    isLoading,
    error,
    refresh: loadFile,
  };
}

export interface UseFoldersReturn {
  folders: FileFolder[];
  isLoading: boolean;
  error: Error | null;
  create: (name: string, parentId?: string) => Promise<FileFolder>;
  remove: (id: string) => Promise<void>;
  rename: (id: string, newName: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useFolders(parentId?: string): UseFoldersReturn {
  const [folders, setFolders] = useState<FileFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadFolders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchFileFolders(parentId);
      setFolders(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load folders'));
    } finally {
      setIsLoading(false);
    }
  }, [parentId]);

  useEffect(() => {
    void loadFolders();
  }, [loadFolders]);

  const create = useCallback(async (name: string, folderId?: string) => {
    const folder = await createFileFolder({ name, parentId: folderId });
    await loadFolders();
    return folder;
  }, [loadFolders]);

  const remove = useCallback(async (id: string) => {
    await deleteFileFolder(id);
    await loadFolders();
  }, [loadFolders]);

  const rename = useCallback(async (id: string, newName: string) => {
    await renameFolder(id, newName);
    await loadFolders();
  }, [loadFolders]);

  return {
    folders,
    isLoading,
    error,
    create,
    remove,
    rename,
    refresh: loadFolders,
  };
}
