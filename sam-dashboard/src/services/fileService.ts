/**
 * File Service - Type-safe using openapi-fetch (with legacy upload/download)
 */

import {upload, getBlob} from './apiClient';
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

// File upload uses legacy method for FormData/progress tracking
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

    const response = await upload<FileMetadata>('/files/upload', formData, onProgress);
    if (response.success === false) {
        throw new Error(response.error.message);
    }
    return response.data;
}

// File download uses legacy method for Blob handling
export async function downloadFile(id: string): Promise<Blob> {
    const response = await getBlob(`/files/${id}/download`);
    if (response.success === false) {
        throw new Error(response.error.message);
    }
    return response.data;
}

export async function getPresignedUrl(id: string): Promise<string> {
    const {data, error} = await apiClient.GET('/files/{id}/presigned-url', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return (data as {url: string}).url;
}

export async function fetchFiles(folderId?: string): Promise<FileMetadata[]> {
    const queryParams: Record<string, string> = {};
    if (folderId !== undefined) {
        queryParams.folderId = folderId;
    }

    const {data, error} = await apiClient.GET('/files', {
        params: {query: queryParams},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as FileMetadata[];
}

export async function fetchFile(id: string): Promise<FileMetadata> {
    const {data, error} = await apiClient.GET('/files/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as FileMetadata;
}

export async function deleteFile(id: string): Promise<void> {
    const {error} = await apiClient.DELETE('/files/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function moveFile(id: string, targetFolderId: string | null): Promise<FileMetadata> {
    const {data, error} = await apiClient.PATCH('/files/{id}/move', {
        params: {path: {id}},
        body: {targetFolderId},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as FileMetadata;
}

export async function renameFile(id: string, newName: string): Promise<FileMetadata> {
    const {data, error} = await apiClient.PATCH('/files/{id}/rename', {
        params: {path: {id}},
        body: {filename: newName},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as FileMetadata;
}

// Folder operations
export async function fetchFolders(parentId?: string): Promise<FileFolder[]> {
    const queryParams: Record<string, string> = {};
    if (parentId !== undefined) {
        queryParams.parentId = parentId;
    }

    const {data, error} = await apiClient.GET('/files/folders', {
        params: {query: queryParams},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as FileFolder[];
}

export async function createFolder(data: CreateFolderRequest): Promise<FileFolder> {
    const {data: responseData, error} = await apiClient.POST('/files/folders', {
        body: data,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return responseData as FileFolder;
}

export async function deleteFolder(id: string): Promise<void> {
    const {error} = await apiClient.DELETE('/files/folders/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function renameFolder(id: string, newName: string): Promise<FileFolder> {
    const {data, error} = await apiClient.PATCH('/files/folders/{id}/rename', {
        params: {path: {id}},
        body: {name: newName},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as FileFolder;
}
