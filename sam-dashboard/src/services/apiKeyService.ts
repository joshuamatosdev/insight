/**
 * API Key Service - Type-safe using openapi-fetch
 */

import {apiClient} from './apiClient';

export type ApiKeyScope = 'READ' | 'WRITE' | 'ADMIN';

export interface ApiKey {
    id: string;
    name: string;
    prefix: string;
    scopes: ApiKeyScope[];
    expiresAt: string | null;
    lastUsedAt: string | null;
    usageCount: number;
    ipWhitelist: string[] | null;
    createdAt: string;
    createdById: string;
    createdByName: string;
    isActive: boolean;
}

export interface ApiKeyWithSecret extends ApiKey {
    key: string;
}

export interface CreateApiKeyRequest {
    name: string;
    scopes: ApiKeyScope[];
    expiresAt?: string;
    ipWhitelist?: string[];
}

export async function fetchApiKeys(): Promise<ApiKey[]> {
    const {data, error} = await apiClient.GET('/api-keys');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as ApiKey[];
}

export async function fetchApiKey(id: string): Promise<ApiKey> {
    const {data, error} = await apiClient.GET('/api-keys/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as ApiKey;
}

export async function createApiKey(data: CreateApiKeyRequest): Promise<ApiKeyWithSecret> {
    const {data: responseData, error} = await apiClient.POST('/api-keys', {
        body: data,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return responseData as ApiKeyWithSecret;
}

export async function revokeApiKey(id: string): Promise<void> {
    const {error} = await apiClient.POST('/api-keys/{id}/revoke', {
        params: {path: {id}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function regenerateApiKey(id: string): Promise<ApiKeyWithSecret> {
    const {data, error} = await apiClient.POST('/api-keys/{id}/regenerate', {
        params: {path: {id}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as ApiKeyWithSecret;
}

export async function updateApiKeyScopes(id: string, scopes: ApiKeyScope[]): Promise<ApiKey> {
    const {data, error} = await apiClient.PATCH('/api-keys/{id}', {
        params: {path: {id}},
        body: {scopes},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as ApiKey;
}

export async function updateApiKeyIpWhitelist(
    id: string,
    ipWhitelist: string[]
): Promise<ApiKey> {
    const {data, error} = await apiClient.PATCH('/api-keys/{id}', {
        params: {path: {id}},
        body: {ipWhitelist},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as ApiKey;
}

export async function fetchApiKeyUsage(
    id: string,
    startDate: string,
    endDate: string
): Promise<{date: string; count: number}[]> {
    const {data, error} = await apiClient.GET('/api-keys/{id}/usage', {
        params: {path: {id}, query: {startDate, endDate}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as {date: string; count: number}[];
}
