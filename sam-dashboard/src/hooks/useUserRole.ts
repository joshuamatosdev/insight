/**
 * User Role Detection Hook
 *
 * Provides utilities for detecting the current user's role
 * to enable role-based UI variations between Portal and Intelligence faces.
 */

import {useCallback, useEffect, useState} from 'react';
import {useAuth} from '../auth';
import {API_BASE} from '../services/apiClient';

/**
 * User role types for the dual-face application
 */
export type UserRole = 'INTEL_USER' | 'PORTAL_USER' | 'ADMIN' | 'OWNER';

/**
 * Tenant membership response from the API
 */
interface TenantMembership {
    id: string;
    userId: string;
    userEmail: string;
    userFullName: string | null;
    tenantId: string;
    tenantName: string;
    roleName: string;
    isDefault: boolean;
    invitedAt: string | null;
    acceptedAt: string | null;
}
const AUTH_STORAGE_KEY = 'sam_auth_state';

/**
 * Gets the auth token from localStorage
 */
function getAuthToken(): string | null {
    try {
        const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored === null) {
            return null;
        }
        const parsed = JSON.parse(stored);
        return parsed.token ?? null;
    } catch {
        return null;
    }
}

/**
 * Authenticated fetch wrapper
 */
async function authFetch(url: string): Promise<Response> {
    const token = getAuthToken();
    const headers: HeadersInit = token !== null ? {Authorization: `Bearer ${token}`} : {};

    return fetch(url, {headers});
}

/**
 * Maps API role name to our UserRole type
 */
function mapRoleName(roleName: string): UserRole {
    const upperRole = roleName.toUpperCase();

    if (upperRole.includes('ADMIN')) {
        return 'ADMIN';
    }
    if (upperRole.includes('OWNER')) {
        return 'OWNER';
    }
    if (upperRole.includes('PORTAL') || upperRole.includes('CONTRACTOR') || upperRole.includes('CLIENT')) {
        return 'PORTAL_USER';
    }
    // Default to INTEL_USER for business development / opportunity discovery
    return 'INTEL_USER';
}

/**
 * Hook return type
 */
export interface UseUserRoleReturn {
    role: UserRole | undefined;
    isLoading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
}

/**
 * Hook to detect the current user's role based on their tenant membership
 *
 * @returns The user's role, loading state, error, and refresh function
 */
export function useUserRole(): UseUserRoleReturn {
    const {user, isAuthenticated} = useAuth();
    const [role, setRole] = useState<UserRole | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchRole = useCallback(async () => {
        if (isAuthenticated === false || user === null) {
            setRole(undefined);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await authFetch(`${API_BASE}/users/me/memberships`);

            if (response.ok === false) {
                // If endpoint doesn't exist or fails, default to INTEL_USER
                setRole('INTEL_USER');
                return;
            }

            const memberships: TenantMembership[] = await response.json();

            if (memberships.length === 0) {
                // No memberships, default to INTEL_USER
                setRole('INTEL_USER');
                return;
            }

            // Find the default membership or use the first one
            const defaultMembership = memberships.find((m) => m.isDefault === true);
            const activeMembership = defaultMembership ?? memberships.at(0);

            if (activeMembership !== undefined && activeMembership.roleName !== undefined) {
                setRole(mapRoleName(activeMembership.roleName));
            } else {
                setRole('INTEL_USER');
            }
        } catch (err) {
            // On error, default to INTEL_USER to not break the UI
            setRole('INTEL_USER');
            setError(err instanceof Error ? err : new Error('Failed to fetch user role'));
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        void fetchRole();
    }, [fetchRole]);

    return {role, isLoading, error, refresh: fetchRole};
}

/**
 * Hook to check if the current user is a Portal user (contractor/client)
 *
 * @returns true if the user is a Portal user, false otherwise
 */
export function useIsPortalUser(): boolean {
    const {role} = useUserRole();
    return role === 'PORTAL_USER';
}

/**
 * Hook to check if the current user is an Intelligence user (BD team)
 *
 * @returns true if the user is an Intelligence user, false otherwise
 */
export function useIsIntelUser(): boolean {
    const {role} = useUserRole();
    return role === 'INTEL_USER' || role === undefined;
}

/**
 * Hook to check if the current user is an Admin
 *
 * @returns true if the user is an Admin, false otherwise
 */
export function useIsAdmin(): boolean {
    const {role} = useUserRole();
    return role === 'ADMIN' || role === 'OWNER';
}
