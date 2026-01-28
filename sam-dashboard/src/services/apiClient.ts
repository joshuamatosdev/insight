/**
 * Type-safe API client using openapi-fetch
 *
 * This module provides both:
 * 1. Direct access to the type-safe openapi-fetch client (recommended for new code)
 * 2. Backward-compatible methods for gradual migration
 *
 * New code should use the openapi-fetch client directly:
 *   import { apiClient } from '@/services/apiClient';
 *   const { data, error } = await apiClient.GET('/opportunities');
 *
 * Existing code can continue using the legacy methods during migration:
 *   import { get } from '@/services/apiClient';
 *   const result = await get<Opportunity[]>('/opportunities');
 */

import createClient from 'openapi-fetch';

import type {paths} from '../types/api.generated';
import type {ApiError, ApiResult} from './types';

// Re-export types for convenience
export type {ApiError, ApiResult} from './types';

export const API_BASE = '/api';

/**
 * Get the stored auth token
 */
function getAuthToken(): string | null {
    try {
        const authData = localStorage.getItem('sam_auth_state');
        if (authData !== null) {
            const parsed = JSON.parse(authData) as {token?: string};
            return parsed.token ?? null;
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Type-safe API client using openapi-fetch
 *
 * All types are automatically inferred from the OpenAPI spec.
 */
const client = createClient<paths>({baseUrl: API_BASE});

/**
 * Add auth token middleware
 */
client.use({
    onRequest({request}) {
        const token = getAuthToken();
        if (token !== null) {
            request.headers.set('Authorization', `Bearer ${token}`);
        }
        request.headers.set('Content-Type', 'application/json');
        return request;
    },
});

/**
 * Export the type-safe client (recommended for new code)
 */
export const apiClient = client;

// ============================================================================
// BACKWARD-COMPATIBLE METHODS (for gradual migration)
// ============================================================================

/**
 * Build request headers (legacy)
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
 * Parse error response (legacy)
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
 * Make a GET request (legacy - use apiClient.GET instead)
 */
export async function get<T>(
    path: string,
    options: {auth?: boolean; params?: Record<string, string | number | boolean>} = {}
): Promise<ApiResult<T>> {
    const {auth = true, params} = options;

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
            return {success: false, error};
        }

        const data = (await response.json()) as T;
        return {success: true, data};
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
 * Make a POST request (legacy - use apiClient.POST instead)
 */
export async function post<T, B = unknown>(
    path: string,
    body: B,
    options: {auth?: boolean} = {}
): Promise<ApiResult<T>> {
    const {auth = true} = options;

    try {
        const response = await fetch(`${API_BASE}${path}`, {
            method: 'POST',
            headers: buildHeaders(auth),
            body: JSON.stringify(body),
        });

        if (response.ok === false) {
            const error = await parseError(response);
            return {success: false, error};
        }

        const data = (await response.json()) as T;
        return {success: true, data};
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
 * Make a PUT request (legacy - use apiClient.PUT instead)
 */
export async function put<T, B = unknown>(
    path: string,
    body: B,
    options: {auth?: boolean} = {}
): Promise<ApiResult<T>> {
    const {auth = true} = options;

    try {
        const response = await fetch(`${API_BASE}${path}`, {
            method: 'PUT',
            headers: buildHeaders(auth),
            body: JSON.stringify(body),
        });

        if (response.ok === false) {
            const error = await parseError(response);
            return {success: false, error};
        }

        const data = (await response.json()) as T;
        return {success: true, data};
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
 * Make a PATCH request (legacy - use apiClient.PATCH instead)
 */
export async function patch<T, B = unknown>(
    path: string,
    body: B,
    options: {auth?: boolean} = {}
): Promise<ApiResult<T>> {
    const {auth = true} = options;

    try {
        const response = await fetch(`${API_BASE}${path}`, {
            method: 'PATCH',
            headers: buildHeaders(auth),
            body: JSON.stringify(body),
        });

        if (response.ok === false) {
            const error = await parseError(response);
            return {success: false, error};
        }

        const data = (await response.json()) as T;
        return {success: true, data};
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
 * Make a DELETE request (legacy - use apiClient.DELETE instead)
 */
export async function del<T = void>(
    path: string,
    body?: unknown,
    options: {auth?: boolean} = {}
): Promise<ApiResult<T>> {
    const {auth = true} = options;

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
            return {success: false, error};
        }

        // Handle empty response
        const text = await response.text();
        if (text.length === 0) {
            return {success: true, data: undefined as T};
        }

        const data = JSON.parse(text) as T;
        return {success: true, data};
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
 * Upload a file with multipart/form-data (legacy)
 */
export async function upload<T>(
    path: string,
    formData: FormData,
    onProgress?: (progress: number) => void,
    options: {auth?: boolean} = {}
): Promise<ApiResult<T>> {
    const {auth = true} = options;

    try {
        // Build headers without Content-Type (browser sets it with boundary for FormData)
        const headers: HeadersInit = {};
        if (auth) {
            const token = getAuthToken();
            if (token !== null) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        // Use XMLHttpRequest for progress tracking if callback provided
        if (onProgress !== undefined) {
            return new Promise((resolve) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', `${API_BASE}${path}`);

                Object.entries(headers).forEach(([key, value]) => {
                    xhr.setRequestHeader(key, value);
                });

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = (event.loaded / event.total) * 100;
                        onProgress(percentComplete);
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const data = JSON.parse(xhr.responseText) as T;
                        resolve({success: true, data});
                    } else {
                        resolve({
                            success: false,
                            error: {
                                message: xhr.statusText || 'Upload failed',
                                status: xhr.status,
                            },
                        });
                    }
                };

                xhr.onerror = () => {
                    resolve({
                        success: false,
                        error: {
                            message: 'Network error during upload',
                            status: 0,
                        },
                    });
                };

                xhr.send(formData);
            });
        }

        // Standard fetch for uploads without progress
        const response = await fetch(`${API_BASE}${path}`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (response.ok === false) {
            const error = await parseError(response);
            return {success: false, error};
        }

        const data = (await response.json()) as T;
        return {success: true, data};
    } catch (err) {
        return {
            success: false,
            error: {
                message: err instanceof Error ? err.message : 'Upload error',
                status: 0,
            },
        };
    }
}

/**
 * Download a file as Blob (legacy)
 */
export async function getBlob(
    path: string,
    options: {auth?: boolean} = {}
): Promise<ApiResult<Blob>> {
    const {auth = true} = options;

    try {
        const response = await fetch(`${API_BASE}${path}`, {
            method: 'GET',
            headers: buildHeaders(auth),
        });

        if (response.ok === false) {
            const error = await parseError(response);
            return {success: false, error};
        }

        const blob = await response.blob();
        return {success: true, data: blob};
    } catch (err) {
        return {
            success: false,
            error: {
                message: err instanceof Error ? err.message : 'Download error',
                status: 0,
            },
        };
    }
}

/**
 * Legacy API client object (for backward compatibility)
 *
 * @deprecated Use the typed apiClient directly instead
 */
export const legacyApiClient = {
    get,
    post,
    put,
    patch,
    delete: del,
    upload,
    getBlob,
};

export default apiClient;
