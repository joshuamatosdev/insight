/**
 * Modal for creating and editing roles
 */

import {ChangeEvent, FormEvent, useCallback, useEffect, useState} from 'react';

import {
    Button,
    Dialog,
    DialogActions,
    DialogBody,
    DialogTitle,
    Field,
    FieldGroup,
    Fieldset,
    Input,
    Label,
    Text,
} from '../../catalyst';
import type {RoleFormErrors, RoleFormModalProps, RoleFormState} from './RoleFormModal.types';

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
            setForm((prev) => ({...prev, [field]: value}));

            // Clear error for this field
            if (errors[field as keyof RoleFormErrors] !== undefined) {
                setErrors((prev) => ({...prev, [field]: undefined}));
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
                    <div>
                        {errors.general !== undefined && (
                            <div>
                                <Text>
                                    {errors.general}
                                </Text>
                            </div>
                        )}

                        {isSystemRole && (
                            <div>
                                <Text>
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
                                    <Text>
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
                                        <Text>
                                            {errors.description}
                                        </Text>
                                    )}
                                </Field>
                            </FieldGroup>
                        </Fieldset>

                        {/* Permissions */}
                        <div>
                            <Label>Permissions</Label>

                            <div>
                                {Object.entries(permissions).map(([category, categoryPermissions]) => {
                                    const allSelected = categoryPermissions.every((p) =>
                                        form.permissions.includes(p.code)
                                    );

                                    return (
                                        <div
                                            key={category}
                                        >
                                            <div>
                                                <Text>
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

                                            <div>
                                                {categoryPermissions.map((permission) => {
                                                    const isChecked = form.permissions.includes(permission.code);
                                                    return (
                                                        <label
                                                            key={permission.id}
                                                            title={permission.description}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => handlePermissionToggle(permission.code)}
                                                                disabled={isSystemRole}
                                                            />
                                                            <span>{permission.displayName}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <Text>
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
