/**
 * RBAC (Role-Based Access Control) API Service
 */

import type {
    CreateRoleRequest,
    PaginatedResponse,
    PermissionsByCategory,
    Role,
    UpdateRoleRequest,
    UserWithRoles,
} from '../types/rbac.types';

const API_BASE = '/api/v1';
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
    const parsed = JSON.parse(stored) as { token?: string };
    return parsed.token ?? null;
  } catch {
    return null;
  }
}

/**
 * Creates headers with auth token
 */
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token !== null) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Authenticated fetch wrapper
 */
async function authFetch(url: string, options?: RequestInit): Promise<Response> {
  const headers = {
    ...getAuthHeaders(),
    ...options?.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

// ==================== Roles API ====================

/**
 * Fetch all roles for the current tenant
 */
export async function fetchRoles(): Promise<Role[]> {
  const response = await authFetch(`${API_BASE}/roles`);
  if (response.ok === false) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { message?: string }).message ?? `Failed to fetch roles: ${response.statusText}`
    );
  }
  return response.json();
}

/**
 * Fetch a single role by ID
 */
export async function fetchRole(id: string): Promise<Role> {
  const response = await authFetch(`${API_BASE}/roles/${id}`);
  if (response.ok === false) {
    throw new Error(`Failed to fetch role: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Create a new role
 */
export async function createRole(request: CreateRoleRequest): Promise<Role> {
  const response = await authFetch(`${API_BASE}/roles`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
  if (response.ok === false) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { message?: string }).message ?? `Failed to create role: ${response.statusText}`
    );
  }
  return response.json();
}

/**
 * Update an existing role
 */
export async function updateRole(id: string, request: UpdateRoleRequest): Promise<Role> {
  const response = await authFetch(`${API_BASE}/roles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  });
  if (response.ok === false) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { message?: string }).message ?? `Failed to update role: ${response.statusText}`
    );
  }
  return response.json();
}

/**
 * Delete a role
 */
export async function deleteRole(id: string): Promise<void> {
  const response = await authFetch(`${API_BASE}/roles/${id}`, {
    method: 'DELETE',
  });
  if (response.ok === false) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { message?: string }).message ?? `Failed to delete role: ${response.statusText}`
    );
  }
}

// ==================== Permissions API ====================

/**
 * Fetch all permissions grouped by category
 */
export async function fetchPermissions(): Promise<PermissionsByCategory> {
  const response = await authFetch(`${API_BASE}/permissions`);
  if (response.ok === false) {
    throw new Error(`Failed to fetch permissions: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch flat list of permission codes
 */
export async function fetchPermissionCodes(): Promise<string[]> {
  const response = await authFetch(`${API_BASE}/permissions/codes`);
  if (response.ok === false) {
    throw new Error(`Failed to fetch permission codes: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch current user's permissions
 */
export async function fetchMyPermissions(): Promise<string[]> {
  const response = await authFetch(`${API_BASE}/permissions/me`);
  if (response.ok === false) {
    throw new Error(`Failed to fetch user permissions: ${response.statusText}`);
  }
  return response.json();
}

// ==================== User-Role Management API ====================

/**
 * Fetch users with their roles
 */
export async function fetchUsersWithRoles(
  page: number = 0,
  size: number = 20,
  search?: string
): Promise<PaginatedResponse<UserWithRoles>> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (search !== undefined && search.length > 0) {
    params.append('search', search);
  }

  const response = await authFetch(`${API_BASE}/users?${params}`);
  if (response.ok === false) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Update user's role
 */
export async function updateUserRole(userId: string, roleName: string): Promise<void> {
  const response = await authFetch(`${API_BASE}/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role: roleName }),
  });
  if (response.ok === false) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { message?: string }).message ?? `Failed to update user role: ${response.statusText}`
    );
  }
}

/**
 * Remove role from user (set to default viewer role)
 */
export async function removeUserRole(userId: string): Promise<void> {
  const response = await authFetch(`${API_BASE}/users/${userId}/role`, {
    method: 'DELETE',
  });
  if (response.ok === false) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { message?: string }).message ?? `Failed to remove user role: ${response.statusText}`
    );
  }
}
