/**
 * Modal for creating and editing roles
 */

import { useState, useCallback, useEffect, FormEvent, ChangeEvent, CSSProperties } from 'react';
import { Text, Button, Input } from '../../primitives';
import { Card, CardHeader, CardBody, CardFooter, Stack, Flex, Box, HStack } from '../../layout';
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

/**
 * Modal overlay styles
 */
const overlayStyles: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

/**
 * Modal content styles
 */
const modalStyles: CSSProperties = {
  width: '100%',
  maxWidth: '700px',
  maxHeight: '90vh',
  overflow: 'auto',
};

/**
 * Checkbox group styles
 */
const checkboxGroupStyles: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--spacing-2)',
};

/**
 * Checkbox label styles
 */
const checkboxLabelStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-1)',
  padding: 'var(--spacing-1) var(--spacing-2)',
  borderRadius: 'var(--radius-sm)',
  backgroundColor: 'var(--color-gray-50)',
  cursor: 'pointer',
  fontSize: 'var(--font-size-sm)',
};

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

  if (isOpen === false) {
    return null;
  }

  const isEditMode = role !== null;
  const isSystemRole = role?.isSystemRole === true;

  return (
    <div
      style={overlayStyles}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-modal-title"
    >
      <Card variant="elevated" style={modalStyles}>
        <CardHeader>
          <Flex justify="between" align="center">
            <Text id="role-modal-title" variant="heading5" weight="semibold">
              {isEditMode ? 'Edit Role' : 'Create New Role'}
            </Text>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close modal"
            >
              &times;
            </Button>
          </Flex>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardBody>
            <Stack spacing="var(--spacing-4)">
              {errors.general !== undefined && (
                <Box
                  style={{
                    padding: 'var(--spacing-3)',
                    backgroundColor: 'var(--color-danger-light)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-danger)',
                  }}
                >
                  <Text variant="bodySmall" color="danger">
                    {errors.general}
                  </Text>
                </Box>
              )}

              {isSystemRole && (
                <Box
                  style={{
                    padding: 'var(--spacing-3)',
                    backgroundColor: 'var(--color-warning-light)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-warning)',
                  }}
                >
                  <Text variant="bodySmall" color="warning">
                    System roles cannot be modified. You can only view their permissions.
                  </Text>
                </Box>
              )}

              {/* Role Name */}
              <Box>
                <Text
                  as="label"
                  variant="bodySmall"
                  weight="medium"
                  style={{ display: 'block', marginBottom: 'var(--spacing-1)' }}
                >
                  Role Name *
                </Text>
                <Input
                  type="text"
                  value={form.name}
                  onChange={handleInputChange('name')}
                  placeholder="e.g., CONTRACT_MANAGER"
                  fullWidth
                  isInvalid={errors.name !== undefined}
                  disabled={isSystemRole}
                />
                <Text
                  variant="caption"
                  color={errors.name !== undefined ? 'danger' : 'muted'}
                  style={{ marginTop: 'var(--spacing-1)' }}
                >
                  {errors.name ?? 'Uppercase letters and underscores only'}
                </Text>
              </Box>

              {/* Description */}
              <Box>
                <Text
                  as="label"
                  variant="bodySmall"
                  weight="medium"
                  style={{ display: 'block', marginBottom: 'var(--spacing-1)' }}
                >
                  Description
                </Text>
                <Input
                  type="text"
                  value={form.description}
                  onChange={handleInputChange('description')}
                  placeholder="Brief description of this role"
                  fullWidth
                  disabled={isSystemRole}
                />
                {errors.description !== undefined && (
                  <Text
                    variant="caption"
                    color="danger"
                    style={{ marginTop: 'var(--spacing-1)' }}
                  >
                    {errors.description}
                  </Text>
                )}
              </Box>

              {/* Permissions */}
              <Box>
                <Text
                  as="label"
                  variant="bodySmall"
                  weight="medium"
                  style={{ display: 'block', marginBottom: 'var(--spacing-2)' }}
                >
                  Permissions
                </Text>

                <Stack spacing="var(--spacing-3)">
                  {Object.entries(permissions).map(([category, categoryPermissions]) => {
                    const allSelected = categoryPermissions.every((p) =>
                      form.permissions.includes(p.code)
                    );
                    const someSelected =
                      allSelected === false &&
                      categoryPermissions.some((p) => form.permissions.includes(p.code));

                    return (
                      <Box
                        key={category}
                        style={{
                          padding: 'var(--spacing-3)',
                          backgroundColor: 'var(--color-gray-50)',
                          borderRadius: 'var(--radius-md)',
                        }}
                      >
                        <HStack justify="between" align="center" style={{ marginBottom: 'var(--spacing-2)' }}>
                          <Text variant="bodySmall" weight="semibold">
                            {formatCategoryName(category)}
                          </Text>
                          {isSystemRole === false && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSelectAllInCategory(categoryPermissions)}
                            >
                              {allSelected ? 'Deselect All' : 'Select All'}
                            </Button>
                          )}
                        </HStack>

                        <div style={checkboxGroupStyles}>
                          {categoryPermissions.map((permission) => {
                            const isChecked = form.permissions.includes(permission.code);
                            return (
                              <label
                                key={permission.id}
                                style={{
                                  ...checkboxLabelStyles,
                                  backgroundColor: isChecked
                                    ? 'var(--color-primary-light)'
                                    : 'var(--color-white)',
                                  opacity: isSystemRole ? 0.7 : 1,
                                  cursor: isSystemRole ? 'default' : 'pointer',
                                }}
                                title={permission.description}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handlePermissionToggle(permission.code)}
                                  disabled={isSystemRole}
                                  style={{ cursor: isSystemRole ? 'default' : 'pointer' }}
                                />
                                <span>{permission.displayName}</span>
                              </label>
                            );
                          })}
                        </div>
                      </Box>
                    );
                  })}
                </Stack>

                <Text
                  variant="caption"
                  color="muted"
                  style={{ marginTop: 'var(--spacing-2)' }}
                >
                  {form.permissions.length} permission
                  {form.permissions.length !== 1 ? 's' : ''} selected
                </Text>
              </Box>
            </Stack>
          </CardBody>

          <CardFooter>
            <HStack justify="end" spacing="var(--spacing-2)">
              <Button variant="outline" type="button" onClick={onClose}>
                {isSystemRole ? 'Close' : 'Cancel'}
              </Button>
              {isSystemRole === false && (
                <Button
                  variant="primary"
                  type="submit"
                  isLoading={isSubmitting}
                  isDisabled={isSubmitting}
                >
                  {isEditMode ? 'Update Role' : 'Create Role'}
                </Button>
              )}
            </HStack>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default RoleFormModal;
