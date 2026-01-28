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

const API_KEY_BASE = '/api-keys';

export async function fetchApiKeys(): Promise<ApiKey[]> {
  const response = await apiClient.get<ApiKey[]>(API_KEY_BASE);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function fetchApiKey(id: string): Promise<ApiKey> {
  const response = await apiClient.get<ApiKey>(`${API_KEY_BASE}/${id}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function createApiKey(data: CreateApiKeyRequest): Promise<ApiKeyWithSecret> {
  const response = await apiClient.post<ApiKeyWithSecret, CreateApiKeyRequest>(API_KEY_BASE, data);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function revokeApiKey(id: string): Promise<void> {
  const response = await apiClient.delete<void>(`${API_KEY_BASE}/${id}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
}

export async function regenerateApiKey(id: string): Promise<ApiKeyWithSecret> {
  const response = await apiClient.post<ApiKeyWithSecret, Record<string, never>>(`${API_KEY_BASE}/${id}/regenerate`, {});
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function updateApiKeyScopes(id: string, scopes: ApiKeyScope[]): Promise<ApiKey> {
  const response = await apiClient.patch<ApiKey, { scopes: ApiKeyScope[] }>(`${API_KEY_BASE}/${id}/scopes`, { scopes });
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function updateApiKeyIpWhitelist(
  id: string,
  ipWhitelist: string[]
): Promise<ApiKey> {
  const response = await apiClient.patch<ApiKey, { ipWhitelist: string[] }>(`${API_KEY_BASE}/${id}/ip-whitelist`, { ipWhitelist });
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function fetchApiKeyUsage(
  id: string,
  startDate: string,
  endDate: string
): Promise<{ date: string; count: number }[]> {
  const params = new URLSearchParams();
  params.set('startDate', startDate);
  params.set('endDate', endDate);
  const response = await apiClient.get<{ date: string; count: number }[]>(`${API_KEY_BASE}/${id}/usage?${params.toString()}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}
