import type {AuthError, LoginCredentials, LoginResponse, RegisterData, User,} from '../auth/Auth.types';

const API_BASE = '/api/auth';

/**
 * API response wrapper format from backend
 */
interface ApiResponse<T> {
    success: boolean;
    data: T;
    meta?: {
        timestamp: string;
    };
}

/**
 * Raw auth response from API (camelCase - Spring Boot default)
 */
interface ApiAuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    user: User;
    mfaRequired: boolean;
}

/**
 * Transforms API auth response to frontend LoginResponse type
 * Note: Backend returns response directly (not wrapped in ApiResponse)
 */
function transformAuthResponse(apiResponse: ApiAuthResponse): LoginResponse {
    return {
        token: apiResponse.accessToken,
        refreshToken: apiResponse.refreshToken,
        user: apiResponse.user,
        mfaRequired: apiResponse.mfaRequired,
    };
}

/**
 * Parses error response from auth API
 */
async function parseAuthError(response: Response): Promise<AuthError> {
    try {
        const data = await response.json();
        return {
            message: data.message ?? data.error ?? 'Authentication failed',
            field: data.field,
            code: data.code,
        };
    } catch {
        return {
            message: response.statusText ?? 'Authentication failed',
            code: String(response.status),
        };
    }
}

/**
 * Authenticates user with email and password
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    if (response.ok === false) {
        const error = await parseAuthError(response);
        throw error;
    }

    const apiResponse: ApiAuthResponse = await response.json();
    return transformAuthResponse(apiResponse);
}

/**
 * Registers a new user account
 */
export async function register(data: RegisterData): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            organizationName: data.companyName,
        }),
    });

    if (response.ok === false) {
        const error = await parseAuthError(response);
        throw error;
    }

    const apiResponse: ApiAuthResponse = await response.json();
    return transformAuthResponse(apiResponse);
}

/**
 * Refreshes the authentication token
 */
export async function refreshToken(currentRefreshToken: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/refresh`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentRefreshToken}`,
        },
    });

    if (response.ok === false) {
        const error = await parseAuthError(response);
        throw error;
    }

    const apiResponse: ApiAuthResponse = await response.json();
    return transformAuthResponse(apiResponse);
}

/**
 * Validates if a token is still valid
 * Note: Backend doesn't have a dedicated validate endpoint,
 * so we just check if the token exists and is not expired (basic check)
 */
export async function validateToken(token: string): Promise<boolean> {
    if (token.length === 0) {
        return false;
    }

    // Try to decode JWT and check expiration
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return false;
        }

        const payload = JSON.parse(atob(parts[1] ?? ''));
        const exp = payload.exp as number | undefined;

        if (exp === undefined) {
            return true; // No expiration, assume valid
        }

        // Check if token is expired (exp is in seconds)
        return Date.now() < exp * 1000;
    } catch {
        return false;
    }
}

/**
 * Creates a fetch wrapper that includes auth header
 */
export function createAuthenticatedFetch(token: string): typeof fetch {
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const headers = new Headers(init?.headers);
        headers.set('Authorization', `Bearer ${token}`);

        return fetch(input, {
            ...init,
            headers,
        });
    };
}

/**
 * Gets the authorization header for a token
 */
export function getAuthHeader(token: string): Record<string, string> {
    return {
        Authorization: `Bearer ${token}`,
    };
}
