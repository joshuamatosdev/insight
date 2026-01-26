import type {
  LoginCredentials,
  LoginResponse,
  RegisterData,
  AuthError,
} from '../auth/Auth.types';

const API_BASE = '/api/v1/auth';

/**
 * Parses error response from auth API
 */
async function parseAuthError(response: Response): Promise<AuthError> {
  try {
    const data = await response.json();
    return {
      message: data.message ?? 'Authentication failed',
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

  return response.json();
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
    body: JSON.stringify(data),
  });

  if (response.ok === false) {
    const error = await parseAuthError(response);
    throw error;
  }

  return response.json();
}

/**
 * Refreshes the authentication token
 */
export async function refreshToken(currentRefreshToken: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken: currentRefreshToken }),
  });

  if (response.ok === false) {
    const error = await parseAuthError(response);
    throw error;
  }

  return response.json();
}

/**
 * Validates if a token is still valid
 */
export async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/validate`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.ok;
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
