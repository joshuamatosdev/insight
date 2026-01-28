/**
 * OAuth service for social login integration
 */

const API_BASE = '/api/oauth';

export interface OAuthProvider {
    id: string;
    name: string;
    icon: string;
}

export interface OAuthConnection {
    id: string;
    provider: string;
    email: string;
    connectedAt: string;
    lastLoginAt: string | null;
}

export interface OAuthProvidersResponse {
    providers: string[];
    enabled: boolean;
}

export interface OAuthCallbackRequest {
    provider: string;
    providerUserId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
}

/**
 * Get list of enabled OAuth providers
 */
export async function fetchOAuthProviders(): Promise<OAuthProvidersResponse> {
    const response = await fetch(`${API_BASE}/providers`);

    if (response.ok === false) {
        throw new Error('Failed to fetch OAuth providers');
    }

    return response.json();
}

/**
 * Process OAuth callback after provider redirect
 */
export async function processOAuthCallback(
    request: OAuthCallbackRequest
): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/callback`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });

    if (response.ok === false) {
        const error = await response.json();
        throw new Error(error.message ?? 'OAuth authentication failed');
    }

    return response.json();
}

/**
 * Get user's linked OAuth connections
 */
export async function fetchOAuthConnections(token: string): Promise<OAuthConnection[]> {
    const response = await fetch(`${API_BASE}/connections`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.ok === false) {
        throw new Error('Failed to fetch OAuth connections');
    }

    return response.json();
}

/**
 * Unlink an OAuth provider from user's account
 */
export async function unlinkOAuthProvider(
    token: string,
    provider: string
): Promise<void> {
    const response = await fetch(`${API_BASE}/connections/${provider}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.ok === false) {
        const error = await response.json();
        throw new Error(error.message ?? 'Failed to unlink provider');
    }
}

/**
 * Get OAuth provider display info
 */
export function getProviderInfo(providerId: string): OAuthProvider {
    const providers: Record<string, OAuthProvider> = {
        google: {
            id: 'google',
            name: 'Google',
            icon: 'google',
        },
        microsoft: {
            id: 'microsoft',
            name: 'Microsoft',
            icon: 'microsoft',
        },
        saml: {
            id: 'saml',
            name: 'Enterprise SSO',
            icon: 'building',
        },
    };

    return providers[providerId] ?? {
        id: providerId,
        name: providerId,
        icon: 'key',
    };
}

/**
 * Initiate OAuth login flow by redirecting to provider
 */
export function initiateOAuthLogin(provider: string): void {
    // In a real implementation, this would redirect to the backend OAuth endpoint
    // which would then redirect to the provider's authorization URL
    const backendOAuthUrl = `/oauth/authorize/${provider}`;
    window.location.href = backendOAuthUrl;
}
