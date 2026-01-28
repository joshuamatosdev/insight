/**
 * Roles Management Page
 * Lists all roles with ability to create, edit, and delete
 */

import {useCallback, useEffect, useState} from 'react';
import {Badge, Button, InlineAlert, InlineAlertDescription, Text,} from '../../components/catalyst/primitives';
import {PencilIcon, PlusIcon, TrashIcon} from '../../components/catalyst/primitives/Icon';
import {
    Box,
    Card,
    CardBody,
    Flex,
    HStack,
    Section,
    SectionHeader,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
} from '../../components/catalyst/layout';
import {RoleFormModal} from '../../components/domain/rbac';
import {createRole, deleteRole, fetchPermissions, fetchRoles, updateRole} from '../../services';
import type {
    AdminPageState,
    CreateRoleRequest,
    PermissionsByCategory,
    Role,
    RoleFormState,
    UpdateRoleRequest,
} from '../../types';

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

/**
 * Roles Admin Page Component
 */
export function RolesPage(): React.ReactElement {
    const [pageState, setPageState] = useState<AdminPageState>('loading');
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<PermissionsByCategory>({});
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadData = useCallback(async () => {
        setPageState('loading');
        setError(null);
        try {
            const [rolesData, permissionsData] = await Promise.all([
                fetchRoles(),
                fetchPermissions(),
            ]);
            setRoles(rolesData);
            setPermissions(permissionsData);
            setPageState('loaded');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
            setPageState('error');
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCreateClick = useCallback(() => {
        setEditingRole(null);
        setIsModalOpen(true);
    }, []);

    const handleEditClick = useCallback((role: Role) => {
        setEditingRole(role);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingRole(null);
    }, []);

    const handleSubmitRole = useCallback(
        async (formData: RoleFormState) => {
            setIsSubmitting(true);
            setError(null);
            try {
                if (editingRole !== null) {
                    // Update existing role
                    const request: UpdateRoleRequest = {
                        name: formData.name,
                        description: formData.description.length > 0 ? formData.description : undefined,
                        permissions: formData.permissions,
                    };
                    await updateRole(editingRole.id, request);
                } else {
                    // Create new role
                    const request: CreateRoleRequest = {
                        name: formData.name,
                        description: formData.description.length > 0 ? formData.description : undefined,
                        permissions: formData.permissions,
                    };
                    await createRole(request);
                }

                setIsModalOpen(false);
                setEditingRole(null);
                await loadData();
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to save role');
            } finally {
                setIsSubmitting(false);
            }
        },
        [editingRole, loadData]
    );

    const handleDeleteRole = useCallback(
        async (role: Role) => {
            if (role.isSystemRole) {
                setError('System roles cannot be deleted');
                return;
            }

            const confirmed = window.confirm(
                `Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`
            );
            if (confirmed === false) {
                return;
            }

            setError(null);
            try {
                await deleteRole(role.id);
                await loadData();
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete role');
            }
        },
        [loadData]
    );

    if (pageState === 'loading') {
        return (
            <Section id="roles-admin">
                <Flex justify="center" align="center">
                    <Text variant="body" color="muted">
                        Loading roles...
                    </Text>
                </Flex>
            </Section>
        );
    }

    if (pageState === 'error' && roles.length === 0) {
        return (
            <Section id="roles-admin">
                <Flex justify="center" align="center">
                    <Stack spacing="md" align="center">
                        <Text variant="body" color="danger">
                            {error ?? 'Failed to load roles'}
                        </Text>
                        <Button variant="primary" onClick={loadData}>
                            Retry
                        </Button>
                    </Stack>
                </Flex>
            </Section>
        );
    }

    return (
        <Section id="roles-admin">
            <SectionHeader
                title="Role Management"
                actions={
                    <Button variant="primary" onClick={handleCreateClick}>
                        <HStack spacing="xs" align="center">
                            <PlusIcon size="sm"/>
                            <Text as="span" variant="bodySmall" color="white">
                                Create Role
                            </Text>
                        </HStack>
                    </Button>
                }
            />

            {error !== null && (
                <Box>
                    <InlineAlert color="error">
                        <InlineAlertDescription>{error}</InlineAlertDescription>
                    </InlineAlert>
                </Box>
            )}

            <Card variant="elevated">
                <CardBody padding="none">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>Role Name</TableHeaderCell>
                                <TableHeaderCell>Description</TableHeaderCell>
                                <TableHeaderCell>Permissions</TableHeaderCell>
                                <TableHeaderCell>Created</TableHeaderCell>
                                <TableHeaderCell>Actions</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {roles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell>
                                        <HStack spacing="sm" align="center">
                                            <Text variant="bodySmall" weight="medium">
                                                {role.name}
                                            </Text>
                                            {role.isSystemRole && (
                                                <Badge color="zinc">System</Badge>
                                            )}
                                        </HStack>
                                    </TableCell>
                                    <TableCell>
                                        <Text variant="bodySmall" color="muted">
                                            {role.description ?? '-'}
                                        </Text>
                                    </TableCell>
                                    <TableCell>
                                        <Badge color="cyan">{role.permissions.length}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Text variant="caption" color="muted">
                                            {formatDate(role.createdAt)}
                                        </Text>
                                    </TableCell>
                                    <TableCell>
                                        <HStack spacing="xs" justify="center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditClick(role)}
                                                aria-label={`Edit ${role.name}`}
                                            >
                                                <PencilIcon size="sm"/>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteRole(role)}
                                                aria-label={`Delete ${role.name}`}
                                                disabled={role.isSystemRole}
                                            >
                                                <TrashIcon size="sm" color={role.isSystemRole ? 'muted' : 'danger'}/>
                                            </Button>
                                        </HStack>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {roles.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <Flex justify="center" padding="lg">
                                            <Text variant="body" color="muted">
                                                No roles found. Create your first role to get started.
                                            </Text>
                                        </Flex>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            <RoleFormModal
                isOpen={isModalOpen}
                role={editingRole}
                permissions={permissions}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmitRole}
                onClose={handleCloseModal}
            />
        </Section>
    );
}

export default RolesPage;
