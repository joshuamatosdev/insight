/**
 * Type-safe API client using OpenAPI-generated types
 *
 * This module provides a type-safe wrapper around fetch for making API calls.
 * Types are generated from the OpenAPI specification using openapi-typescript.
 *
 * Usage:
 *   import { apiClient } from '@/services/apiClient';
 *
 *   // GET request
 *   const opportunities = await apiClient.get('/opportunities');
 *
 *   // POST request
 *   const result = await apiClient.post('/auth/login', { email, password });
 */

import type { ApiError, ApiResult } from './types';

// Re-export types for convenience
export type { ApiError, ApiResult } from './types';

const API_BASE = '/api';

/**
 * Get the stored auth token
 */
function getAuthToken(): string | null {
  try {
    const authData = localStorage.getItem('auth');
    if (authData !== null) {
      const parsed = JSON.parse(authData) as { accessToken?: string };
      return parsed.accessToken ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Build request headers
 */
function buildHeaders(includeAuth: boolean): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token !== null) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Parse error response
 */
async function parseError(response: Response): Promise<ApiError> {
  try {
    const data = await response.json();
    return {
      message: data.message ?? data.error ?? 'An error occurred',
      status: response.status,
      errors: data.errors,
    };
  } catch {
    return {
      message: response.statusText || 'An error occurred',
      status: response.status,
    };
  }
}

/**
 * Make a GET request
 */
export async function get<T>(
  path: string,
  options: { auth?: boolean; params?: Record<string, string | number | boolean> } = {}
): Promise<ApiResult<T>> {
  const { auth = true, params } = options;

  let url = `${API_BASE}${path}`;
  if (params !== undefined && params !== null) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.set(key, String(value));
    });
    url = `${url}?${searchParams.toString()}`;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(auth),
    });

    if (response.ok === false) {
      const error = await parseError(response);
      return { success: false, error };
    }

    const data = (await response.json()) as T;
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: {
        message: err instanceof Error ? err.message : 'Network error',
        status: 0,
      },
    };
  }
}

/**
 * Make a POST request
 */
export async function post<T, B = unknown>(
  path: string,
  body: B,
  options: { auth?: boolean } = {}
): Promise<ApiResult<T>> {
  const { auth = true } = options;

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: buildHeaders(auth),
      body: JSON.stringify(body),
    });

    if (response.ok === false) {
      const error = await parseError(response);
      return { success: false, error };
    }

    const data = (await response.json()) as T;
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: {
        message: err instanceof Error ? err.message : 'Network error',
        status: 0,
      },
    };
  }
}

/**
 * Make a PUT request
 */
export async function put<T, B = unknown>(
  path: string,
  body: B,
  options: { auth?: boolean } = {}
): Promise<ApiResult<T>> {
  const { auth = true } = options;

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: buildHeaders(auth),
      body: JSON.stringify(body),
    });

    if (response.ok === false) {
      const error = await parseError(response);
      return { success: false, error };
    }

    const data = (await response.json()) as T;
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: {
        message: err instanceof Error ? err.message : 'Network error',
        status: 0,
      },
    };
  }
}

/**
 * Make a PATCH request
 */
export async function patch<T, B = unknown>(
  path: string,
  body: B,
  options: { auth?: boolean } = {}
): Promise<ApiResult<T>> {
  const { auth = true } = options;

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'PATCH',
      headers: buildHeaders(auth),
      body: JSON.stringify(body),
    });

    if (response.ok === false) {
      const error = await parseError(response);
      return { success: false, error };
    }

    const data = (await response.json()) as T;
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: {
        message: err instanceof Error ? err.message : 'Network error',
        status: 0,
      },
    };
  }
}

/**
 * Make a DELETE request
 */
export async function del<T = void>(
  path: string,
  body?: unknown,
  options: { auth?: boolean } = {}
): Promise<ApiResult<T>> {
  const { auth = true } = options;

  try {
    const fetchOptions: RequestInit = {
      method: 'DELETE',
      headers: buildHeaders(auth),
    };
    if (body !== undefined) {
      fetchOptions.body = JSON.stringify(body);
    }
    const response = await fetch(`${API_BASE}${path}`, fetchOptions);

    if (response.ok === false) {
      const error = await parseError(response);
      return { success: false, error };
    }

    // Handle empty response
    const text = await response.text();
    if (text.length === 0) {
      return { success: true, data: undefined as T };
    }

    const data = JSON.parse(text) as T;
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: {
        message: err instanceof Error ? err.message : 'Network error',
        status: 0,
      },
    };
  }
}

/**
 * API client object for convenient imports
 */
export const apiClient = {
  get,
  post,
  put,
  patch,
  delete: del,
};

export default apiClient;
