import type {components} from '@/types/api.generated';

/**
 * RBAC (Role-Based Access Control) Types - uses OpenAPI-generated types
 */

// ==================== Type Aliases from OpenAPI ====================

export type Permission = components['schemas']['PermissionDto'];
export type Role = components['schemas']['RoleResponse'];
export type CreateRoleRequest = components['schemas']['CreateRoleRequest'];

// ==================== Enum Types ====================

/**
 * Permission category from backend
 */
export type PermissionCategory =
    | 'OPPORTUNITIES'
    | 'CONTRACTS'
    | 'PIPELINE'
    | 'DOCUMENTS'
    | 'COMPLIANCE'
    | 'FINANCIAL'
    | 'REPORTS'
    | 'USERS'
    | 'SETTINGS'
    | 'AUDIT'
    | 'SYSTEM';

// ==================== Derived Types ====================

/**
 * Permissions grouped by category
 */
export interface PermissionsByCategory {
    [category: string]: Permission[];
}

/**
 * User with roles from API
 */
export interface UserWithRoles {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    roles: RoleSummary[];
    isActive: boolean;
    createdAt: string;
}

/**
 * Simplified role info for user listing
 */
export interface RoleSummary {
    id: string;
    name: string;
}

/**
 * Form state for creating/editing a role
 */
export interface RoleFormState {
    name: string;
    description: string;
    permissions: string[];
}

/**
 * Form validation errors
 */
export interface RoleFormErrors {
    name?: string;
    description?: string;
    permissions?: string;
    general?: string;
}

/**
 * Request to update a role
 */
export interface UpdateRoleRequest {
    name: string;
    description?: string;
    permissions: string[];
}

/**
 * Request to assign/remove role from user
 */
export interface UserRoleRequest {
    userId: string;
    roleName: string;
}

/**
 * Page state for admin pages
 */
export type AdminPageState = 'loading' | 'loaded' | 'error';

/**
 * Paginated response from API
 */
export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}
