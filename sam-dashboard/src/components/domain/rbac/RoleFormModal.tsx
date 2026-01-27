/**
 * Modal for creating and editing roles
 */

import { useState, useCallback, useEffect, FormEvent, ChangeEvent } from 'react';
import clsx from 'clsx';
import {
  Dialog,
  DialogTitle,
  DialogBody,
  DialogActions,
  Button,
  Field,
  FieldGroup,
  Fieldset,
  Input,
  Label,
  Badge,
  Text,
} from '../../catalyst';
import type { RoleFormModalProps, RoleFormState, RoleFormErrors } from './RoleFormModal.types';

const INITIAL_FORM_STATE: RoleFormState = {
  name: '',
  description: '',
  permissions: [],
};

/**
 * Validates the role form
 */
function validateForm(form: RoleFormState): RoleFormErrors {
  const errors: RoleFormErrors = {};

  if (form.name.trim().length === 0) {
    errors.name = 'Role name is required';
  } else if (form.name.length < 2) {
    errors.name = 'Role name must be at least 2 characters';
  } else if (form.name.length > 50) {
    errors.name = 'Role name must be less than 50 characters';
  } else if (/^[A-Z_]+$/.test(form.name) === false) {
    errors.name = 'Role name must be uppercase with underscores only';
  }

  if (form.description.length > 255) {
    errors.description = 'Description must be less than 255 characters';
  }

  return errors;
}

/**
 * Format category name for display
 */
function formatCategoryName(category: string): string {
  return category.replace(/_/g, ' ');
}

export function RoleFormModal({
  isOpen,
  role,
  permissions,
  isSubmitting,
  onSubmit,
  onClose,
}: RoleFormModalProps): React.ReactElement | null {
  const [form, setForm] = useState<RoleFormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<RoleFormErrors>({});

  // Reset form when modal opens/closes or role changes
  useEffect(() => {
    if (isOpen) {
      if (role !== null) {
        setForm({
          name: role.name,
          description: role.description ?? '',
          permissions: [...role.permissions],
        });
      } else {
        setForm(INITIAL_FORM_STATE);
      }
      setErrors({});
    }
  }, [isOpen, role]);

  const handleInputChange = useCallback(
    (field: keyof RoleFormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));

      // Clear error for this field
      if (errors[field as keyof RoleFormErrors] !== undefined) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const handlePermissionToggle = useCallback((permissionCode: string) => {
    setForm((prev) => {
      const hasPermission = prev.permissions.includes(permissionCode);
      if (hasPermission) {
        return {
          ...prev,
          permissions: prev.permissions.filter((p) => p !== permissionCode),
        };
      }
      return {
        ...prev,
        permissions: [...prev.permissions, permissionCode],
      };
    });
  }, []);

  const handleSelectAllInCategory = useCallback(
    (categoryPermissions: Array<{ code: string }>) => {
      const codes = categoryPermissions.map((p) => p.code);
      const allSelected = codes.every((code) => form.permissions.includes(code));

      setForm((prev) => {
        if (allSelected) {
          // Deselect all in category
          return {
            ...prev,
            permissions: prev.permissions.filter((p) => codes.includes(p) === false),
          };
        }
        // Select all in category
        const newPermissions = new Set([...prev.permissions, ...codes]);
        return {
          ...prev,
          permissions: Array.from(newPermissions),
        };
      });
    },
    [form.permissions]
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const validationErrors = validateForm(form);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      onSubmit(form);
    },
    [form, onSubmit]
  );

  const handleOverlayClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const isEditMode = role !== null;
  const isSystemRole = role?.isSystemRole === true;

  return (
    <Dialog open={isOpen} onClose={onClose} size="3xl">
      <DialogTitle>{isEditMode ? 'Edit Role' : 'Create New Role'}</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogBody>
          <div className="space-y-6">
            {errors.general !== undefined && (
              <div className="rounded-lg bg-danger-bg px-4 py-3 ring-1 ring-danger/20">
                <Text className="text-sm text-danger-text">
                  {errors.general}
                </Text>
              </div>
            )}

            {isSystemRole && (
              <div className="rounded-lg bg-warning-bg px-4 py-3 ring-1 ring-warning/20">
                <Text className="text-sm text-warning-text">
                  System roles cannot be modified. You can only view their permissions.
                </Text>
              </div>
            )}

            <Fieldset>
              <FieldGroup>
                {/* Role Name */}
                <Field>
                  <Label>Role Name *</Label>
                  <Input
                    type="text"
                    value={form.name}
                    onChange={handleInputChange('name')}
                    placeholder="e.g., CONTRACT_MANAGER"
                    invalid={errors.name !== undefined}
                    disabled={isSystemRole}
                  />
                  <Text className={clsx(
                    'mt-1 text-xs',
                    errors.name !== undefined ? 'text-danger' : 'text-on-surface-muted'
                  )}>
                    {errors.name ?? 'Uppercase letters and underscores only'}
                  </Text>
                </Field>

                {/* Description */}
                <Field>
                  <Label>Description</Label>
                  <Input
                    type="text"
                    value={form.description}
                    onChange={handleInputChange('description')}
                    placeholder="Brief description of this role"
                    disabled={isSystemRole}
                  />
                  {errors.description !== undefined && (
                    <Text className="mt-1 text-xs text-danger">
                      {errors.description}
                    </Text>
                  )}
                </Field>
              </FieldGroup>
            </Fieldset>

            {/* Permissions */}
            <div>
              <Label className="mb-3">Permissions</Label>

              <div className="space-y-4">
                {Object.entries(permissions).map(([category, categoryPermissions]) => {
                  const allSelected = categoryPermissions.every((p) =>
                    form.permissions.includes(p.code)
                  );

                  return (
                    <div
                      key={category}
                      className="rounded-lg bg-zinc-50 p-4 ring-1 ring-zinc-950/5 dark:bg-zinc-800/50 dark:ring-white/10"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <Text className="text-sm font-semibold text-zinc-950 dark:text-white">
                          {formatCategoryName(category)}
                        </Text>
                        {isSystemRole === false && (
                          <Button
                            type="button"
                            plain
                            onClick={() => handleSelectAllInCategory(categoryPermissions)}
                          >
                            {allSelected ? 'Deselect All' : 'Select All'}
                          </Button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {categoryPermissions.map((permission) => {
                          const isChecked = form.permissions.includes(permission.code);
                          return (
                            <label
                              key={permission.id}
                              className={clsx(
                                'flex cursor-pointer items-center gap-2 rounded px-3 py-1.5 text-sm ring-1 transition-colors',
                                isChecked
                                  ? 'bg-blue-50 ring-blue-600/20 dark:bg-blue-950/50 dark:ring-blue-400/20'
                                  : 'bg-white ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10',
                                isSystemRole && 'cursor-default opacity-70'
                              )}
                              title={permission.description}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handlePermissionToggle(permission.code)}
                                disabled={isSystemRole}
                                className={clsx(
                                  'h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-600 dark:border-zinc-600 dark:bg-zinc-900',
                                  isSystemRole ? 'cursor-default' : 'cursor-pointer'
                                )}
                              />
                              <span className="text-zinc-950 dark:text-white">{permission.displayName}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Text className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
                {form.permissions.length} permission
                {form.permissions.length !== 1 ? 's' : ''} selected
              </Text>
            </div>
          </div>
        </DialogBody>

        <DialogActions>
          <Button plain onClick={onClose}>
            {isSystemRole ? 'Close' : 'Cancel'}
          </Button>
          {isSystemRole === false && (
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isEditMode ? 'Update Role' : 'Create Role'}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default RoleFormModal;
