import {apiClient} from './apiClient';

export interface FileMetadata {
  id: string;
  filename: string;
  originalFilename: string;
  contentType: string;
  size: number;
  folderId: string | null;
  folderPath: string | null;
  uploadedById: string;
  uploadedByName: string;
  createdAt: string;
  updatedAt: string;
  downloadUrl: string | null;
}

export interface FileFolder {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFolderRequest {
  name: string;
  parentId?: string;
}

export interface UploadResponse {
  file: FileMetadata;
  presignedUrl?: string;
}

const FILE_BASE = '/files';

export async function uploadFile(
  file: File,
  folderId?: string,
  onProgress?: (progress: number) => void
): Promise<FileMetadata> {
  const formData = new FormData();
  formData.append('file', file);
  if (folderId !== undefined) {
    formData.append('folderId', folderId);
  }

  const response = await apiClient.upload<FileMetadata>(`${FILE_BASE}/upload`, formData, onProgress);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function downloadFile(id: string): Promise<Blob> {
  const response = await apiClient.getBlob(`${FILE_BASE}/${id}/download`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function getPresignedUrl(id: string): Promise<string> {
  const response = await apiClient.get<{ url: string }>(`${FILE_BASE}/${id}/presigned-url`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data.url;
}

export async function fetchFiles(folderId?: string): Promise<FileMetadata[]> {
  const params = new URLSearchParams();
  if (folderId !== undefined) {
    params.set('folderId', folderId);
  }
  const query = params.toString();
  const url = query !== '' ? `${FILE_BASE}?${query}` : FILE_BASE;
  const response = await apiClient.get<FileMetadata[]>(url);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function fetchFile(id: string): Promise<FileMetadata> {
  const response = await apiClient.get<FileMetadata>(`${FILE_BASE}/${id}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function deleteFile(id: string): Promise<void> {
  const response = await apiClient.delete<void>(`${FILE_BASE}/${id}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
}

export async function moveFile(id: string, targetFolderId: string | null): Promise<FileMetadata> {
  const response = await apiClient.patch<FileMetadata, { targetFolderId: string | null }>(
    `${FILE_BASE}/${id}/move`,
    { targetFolderId }
  );
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function renameFile(id: string, newName: string): Promise<FileMetadata> {
  const response = await apiClient.patch<FileMetadata, { filename: string }>(
    `${FILE_BASE}/${id}/rename`,
    { filename: newName }
  );
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

// Folder operations
export async function fetchFolders(parentId?: string): Promise<FileFolder[]> {
  const params = new URLSearchParams();
  if (parentId !== undefined) {
    params.set('parentId', parentId);
  }
  const query = params.toString();
  const url = query !== '' ? `${FILE_BASE}/folders?${query}` : `${FILE_BASE}/folders`;
  const response = await apiClient.get<FileFolder[]>(url);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function createFolder(data: CreateFolderRequest): Promise<FileFolder> {
  const response = await apiClient.post<FileFolder, CreateFolderRequest>(
    `${FILE_BASE}/folders`,
    data
  );
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function deleteFolder(id: string): Promise<void> {
  const response = await apiClient.delete<void>(`${FILE_BASE}/folders/${id}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
}

export async function renameFolder(id: string, newName: string): Promise<FileFolder> {
  const response = await apiClient.patch<FileFolder, { name: string }>(
    `${FILE_BASE}/folders/${id}/rename`,
    { name: newName }
  );
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}
