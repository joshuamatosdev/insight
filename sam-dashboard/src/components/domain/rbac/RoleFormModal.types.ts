/**
 * Types for RoleFormModal component
 */

import type { Role, PermissionsByCategory, RoleFormState, RoleFormErrors } from '../../../types';

/**
 * Props for RoleFormModal
 */
export interface RoleFormModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Role being edited (null for create mode) */
  role: Role | null;
  /** Permissions grouped by category */
  permissions: PermissionsByCategory;
  /** Whether form is currently submitting */
  isSubmitting: boolean;
  /** Callback when form is submitted */
  onSubmit: (data: RoleFormState) => void;
  /** Callback when modal is closed */
  onClose: () => void;
}

export type { RoleFormState, RoleFormErrors };
