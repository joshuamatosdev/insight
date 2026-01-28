/**
 * Can Component - Declarative Permission-Based Rendering
 *
 * Provides a clean, declarative way to conditionally render UI
 * based on user permissions without complex ternary operators.
 *
 * @example
 * <Can I="delete" a="opportunity">
 *   <button onClick={handleDelete}>Delete</button>
 * </Can>
 *
 * @example
 * <Can I="edit" a="contract" fallback={<span>View Only</span>}>
 *   <button onClick={handleEdit}>Edit Contract</button>
 * </Can>
 */

import type {ReactNode} from 'react';
import {useAuth} from '../../auth';
import {useUserRole} from '../../hooks';

/**
 * Permission action types
 */
export type PermissionAction =
    | 'view'
    | 'create'
    | 'edit'
    | 'delete'
    | 'manage'
    | 'export'
    | 'approve'
    | 'submit';

/**
 * Resource types that can be protected
 */
export type PermissionResource =
    // Intelligence face
    | 'opportunity'
    | 'pipeline'
    | 'alert'
    | 'saved-search'
    | 'report'
    // Portal face
    | 'contract'
    | 'deliverable'
    | 'invoice'
    | 'milestone'
    | 'sprint'
    | 'scope-item'
    // Shared
    | 'document'
    | 'user'
    | 'role'
    | 'tenant'
    | 'settings'
    | 'audit-log';

/**
 * Props for the Can component
 */
export interface CanProps {
    /**
     * The action/capability to check (e.g., 'edit', 'delete')
     */
    I: PermissionAction;

    /**
     * The resource type (e.g., 'opportunity', 'contract')
     */
    a: PermissionResource;

    /**
     * Content to render if permission is granted
     */
    children: ReactNode;

    /**
     * Optional fallback content if permission is denied
     */
    fallback?: ReactNode;

    /**
     * Optional: Check against a specific entity ID
     */
    this?: string;
}

/**
 * Permission matrix based on user role
 * Maps role -> resource -> allowed actions
 */
const PERMISSION_MATRIX: Record<string, Record<string, PermissionAction[]>> = {
    ADMIN: {
        // Admins can do everything
        opportunity: ['view', 'create', 'edit', 'delete', 'manage', 'export'],
        pipeline: ['view', 'create', 'edit', 'delete', 'manage'],
        alert: ['view', 'create', 'edit', 'delete'],
        'saved-search': ['view', 'create', 'edit', 'delete'],
        report: ['view', 'create', 'edit', 'delete', 'export'],
        contract: ['view', 'create', 'edit', 'delete', 'manage', 'approve'],
        deliverable: ['view', 'create', 'edit', 'delete', 'approve', 'submit'],
        invoice: ['view', 'create', 'edit', 'delete', 'approve', 'submit'],
        milestone: ['view', 'create', 'edit', 'delete'],
        sprint: ['view', 'create', 'edit', 'delete', 'manage'],
        'scope-item': ['view', 'create', 'edit', 'delete', 'approve'],
        document: ['view', 'create', 'edit', 'delete', 'export'],
        user: ['view', 'create', 'edit', 'delete', 'manage'],
        role: ['view', 'create', 'edit', 'delete'],
        tenant: ['view', 'edit', 'manage'],
        settings: ['view', 'edit'],
        'audit-log': ['view', 'export'],
    },
    OWNER: {
        // Owners have same permissions as Admin
        opportunity: ['view', 'create', 'edit', 'delete', 'manage', 'export'],
        pipeline: ['view', 'create', 'edit', 'delete', 'manage'],
        alert: ['view', 'create', 'edit', 'delete'],
        'saved-search': ['view', 'create', 'edit', 'delete'],
        report: ['view', 'create', 'edit', 'delete', 'export'],
        contract: ['view', 'create', 'edit', 'delete', 'manage', 'approve'],
        deliverable: ['view', 'create', 'edit', 'delete', 'approve', 'submit'],
        invoice: ['view', 'create', 'edit', 'delete', 'approve', 'submit'],
        milestone: ['view', 'create', 'edit', 'delete'],
        sprint: ['view', 'create', 'edit', 'delete', 'manage'],
        'scope-item': ['view', 'create', 'edit', 'delete', 'approve'],
        document: ['view', 'create', 'edit', 'delete', 'export'],
        user: ['view', 'create', 'edit', 'delete', 'manage'],
        role: ['view', 'create', 'edit', 'delete'],
        tenant: ['view', 'edit', 'manage'],
        settings: ['view', 'edit'],
        'audit-log': ['view', 'export'],
    },
    INTEL_USER: {
        // Intelligence users focus on opportunity discovery
        opportunity: ['view', 'create', 'edit', 'export'],
        pipeline: ['view', 'create', 'edit', 'delete'],
        alert: ['view', 'create', 'edit', 'delete'],
        'saved-search': ['view', 'create', 'edit', 'delete'],
        report: ['view', 'create', 'edit', 'export'],
        contract: ['view'],
        deliverable: ['view'],
        invoice: ['view'],
        milestone: ['view'],
        sprint: ['view'],
        'scope-item': ['view'],
        document: ['view', 'create', 'edit', 'export'],
        user: ['view'],
        role: [],
        tenant: ['view'],
        settings: ['view', 'edit'],
        'audit-log': ['view'],
    },
    PORTAL_USER: {
        // Portal users focus on contract execution
        opportunity: ['view'],
        pipeline: ['view'],
        alert: ['view', 'create', 'edit', 'delete'],
        'saved-search': ['view'],
        report: ['view', 'export'],
        contract: ['view', 'edit'],
        deliverable: ['view', 'create', 'edit', 'submit'],
        invoice: ['view', 'create', 'edit', 'submit'],
        milestone: ['view', 'edit'],
        sprint: ['view', 'create', 'edit'],
        'scope-item': ['view', 'create', 'edit'],
        document: ['view', 'create', 'edit', 'export'],
        user: ['view'],
        role: [],
        tenant: ['view'],
        settings: ['view', 'edit'],
        'audit-log': ['view'],
    },
};

/**
 * Checks if a user has permission for an action on a resource
 */
function checkPermission(
    role: string | undefined,
    action: PermissionAction,
    resource: PermissionResource
): boolean {
    if (role === undefined) {
        return false;
    }

    const rolePermissions = PERMISSION_MATRIX[role];
    if (rolePermissions === undefined) {
        return false;
    }

    const resourcePermissions = rolePermissions[resource];
    if (resourcePermissions === undefined) {
        return false;
    }

    return resourcePermissions.includes(action);
}

/**
 * Declarative permission-based rendering component
 *
 * Renders children only if the current user has the specified permission.
 * Provides a clean alternative to ternary operators for permission checks.
 */
export function Can({I, a, children, fallback = null}: CanProps): ReactNode {
    const {user} = useAuth();
    const {role} = useUserRole();

    // Not authenticated - deny access
    if (user === null) {
        return fallback;
    }

    // Check permission
    const hasPermission = checkPermission(role, I, a);

    return hasPermission ? children : fallback;
}

/**
 * Hook version for programmatic permission checks
 *
 * @example
 * const canDeleteOpportunity = useCanI('delete', 'opportunity');
 * if (canDeleteOpportunity) { ... }
 */
export function useCanI(action: PermissionAction, resource: PermissionResource): boolean {
    const {user} = useAuth();
    const {role} = useUserRole();

    if (user === null) {
        return false;
    }

    return checkPermission(role, action, resource);
}

/**
 * Hook that returns a permission checker function
 *
 * @example
 * const can = useCan();
 * if (can('edit', 'contract')) { ... }
 */
export function useCan(): (action: PermissionAction, resource: PermissionResource) => boolean {
    const {user} = useAuth();
    const {role} = useUserRole();

    return (action: PermissionAction, resource: PermissionResource): boolean => {
        if (user === null) {
            return false;
        }
        return checkPermission(role, action, resource);
    };
}

export default Can;
