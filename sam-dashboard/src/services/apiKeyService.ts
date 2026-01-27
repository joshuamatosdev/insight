import { apiClient } from './apiClient';

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
  const response = await apiClient.get(API_KEY_BASE);
  return response as ApiKey[];
}

export async function fetchApiKey(id: string): Promise<ApiKey> {
  const response = await apiClient.get(`${API_KEY_BASE}/${id}`);
  return response as ApiKey;
}

export async function createApiKey(data: CreateApiKeyRequest): Promise<ApiKeyWithSecret> {
  const response = await apiClient.post(API_KEY_BASE, data);
  return response as ApiKeyWithSecret;
}

export async function revokeApiKey(id: string): Promise<void> {
  await apiClient.delete(`${API_KEY_BASE}/${id}`);
}

export async function regenerateApiKey(id: string): Promise<ApiKeyWithSecret> {
  const response = await apiClient.post(`${API_KEY_BASE}/${id}/regenerate`);
  return response as ApiKeyWithSecret;
}

export async function updateApiKeyScopes(id: string, scopes: ApiKeyScope[]): Promise<ApiKey> {
  const response = await apiClient.patch(`${API_KEY_BASE}/${id}/scopes`, { scopes });
  return response as ApiKey;
}

export async function updateApiKeyIpWhitelist(
  id: string,
  ipWhitelist: string[]
): Promise<ApiKey> {
  const response = await apiClient.patch(`${API_KEY_BASE}/${id}/ip-whitelist`, { ipWhitelist });
  return response as ApiKey;
}

export async function fetchApiKeyUsage(
  id: string,
  startDate: string,
  endDate: string
): Promise<{ date: string; count: number }[]> {
  const params = new URLSearchParams();
  params.set('startDate', startDate);
  params.set('endDate', endDate);
  const response = await apiClient.get(`${API_KEY_BASE}/${id}/usage?${params.toString()}`);
  return response as { date: string; count: number }[];
}
