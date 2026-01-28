import {useCallback, useEffect, useState} from 'react';
import type {ApiKey, ApiKeyScope, ApiKeyWithSecret, CreateApiKeyRequest} from '../services';
import {
    createApiKey,
    fetchApiKey,
    fetchApiKeys,
    fetchApiKeyUsage,
    regenerateApiKey,
    revokeApiKey,
    updateApiKeyScopes,
} from '../services';

export interface UseApiKeysReturn {
  apiKeys: ApiKey[];
  isLoading: boolean;
  error: Error | null;
  create: (data: CreateApiKeyRequest) => Promise<ApiKeyWithSecret>;
  revoke: (id: string) => Promise<void>;
  regenerate: (id: string) => Promise<ApiKeyWithSecret>;
  updateScopes: (id: string, scopes: ApiKeyScope[]) => Promise<ApiKey>;
  refresh: () => Promise<void>;
}

export function useApiKeys(): UseApiKeysReturn {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadApiKeys = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchApiKeys();
      setApiKeys(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load API keys'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApiKeys();
  }, [loadApiKeys]);

  const create = useCallback(async (data: CreateApiKeyRequest) => {
    const apiKey = await createApiKey(data);
    await loadApiKeys();
    return apiKey;
  }, [loadApiKeys]);

  const revoke = useCallback(async (id: string) => {
    await revokeApiKey(id);
    await loadApiKeys();
  }, [loadApiKeys]);

  const regenerate = useCallback(async (id: string) => {
    const apiKey = await regenerateApiKey(id);
    await loadApiKeys();
    return apiKey;
  }, [loadApiKeys]);

  const updateScopes = useCallback(async (id: string, scopes: ApiKeyScope[]) => {
    const apiKey = await updateApiKeyScopes(id, scopes);
    await loadApiKeys();
    return apiKey;
  }, [loadApiKeys]);

  return {
    apiKeys,
    isLoading,
    error,
    create,
    revoke,
    regenerate,
    updateScopes,
    refresh: loadApiKeys,
  };
}

export interface UseApiKeyReturn {
  apiKey: ApiKey | null;
  isLoading: boolean;
  error: Error | null;
  regenerate: () => Promise<ApiKeyWithSecret>;
  updateScopes: (scopes: ApiKeyScope[]) => Promise<ApiKey>;
  refresh: () => Promise<void>;
}

export function useApiKey(id: string | null): UseApiKeyReturn {
  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadApiKey = useCallback(async () => {
    if (id === null || id === '') {
      setApiKey(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchApiKey(id);
      setApiKey(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load API key'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadApiKey();
  }, [loadApiKey]);

  const regenerate = useCallback(async () => {
    if (id === null) throw new Error('No API key ID');
    const updated = await regenerateApiKey(id);
    setApiKey(updated);
    return updated;
  }, [id]);

  const updateScopes = useCallback(async (scopes: ApiKeyScope[]) => {
    if (id === null) throw new Error('No API key ID');
    const updated = await updateApiKeyScopes(id, scopes);
    setApiKey(updated);
    return updated;
  }, [id]);

  return {
    apiKey,
    isLoading,
    error,
    regenerate,
    updateScopes,
    refresh: loadApiKey,
  };
}

export interface UseApiKeyUsageReturn {
  usage: { date: string; count: number }[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useApiKeyUsage(
  apiKeyId: string | null,
  startDate: string,
  endDate: string
): UseApiKeyUsageReturn {
  const [usage, setUsage] = useState<{ date: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadUsage = useCallback(async () => {
    if (apiKeyId === null || apiKeyId === '') {
      setUsage([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchApiKeyUsage(apiKeyId, startDate, endDate);
      setUsage(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load usage'));
    } finally {
      setIsLoading(false);
    }
  }, [apiKeyId, startDate, endDate]);

  useEffect(() => {
    void loadUsage();
  }, [loadUsage]);

  return {
    usage,
    isLoading,
    error,
    refresh: loadUsage,
  };
}
