import {useCallback, useEffect, useState} from 'react';
import {Card, CardBody, Flex, Grid, GridItem, Section, SectionHeader, Stack,} from '../components/catalyst/layout';
import {Badge, Button, InlineAlert, InlineAlertDescription, Text,} from '../components/catalyst/primitives';
import type {PermissionsByCategory, Role, RolesPageState} from './types';


/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
    try {
        const authData = localStorage.getItem('sam_auth_state');
        if (authData !== null) {
            const parsed = JSON.parse(authData) as { token?: string };
            return parsed.token ?? null;
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Roles management page
 */
export function RolesPage(): React.ReactElement {
    const [pageState, setPageState] = useState<RolesPageState>('loading');
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<PermissionsByCategory>({});
    const [error, setError] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    const fetchData = useCallback(async () => {
        const token = getAuthToken();
        if (token === null) {
            setError('Not authenticated');
            setPageState('error');
            return;
        }

        try {
            const [rolesRes, permsRes] = await Promise.all([
                fetch(`${API_BASE}/roles`, {
                    headers: {Authorization: `Bearer ${token}`},
                }),
                fetch(`${API_BASE}/permissions`, {
                    headers: {Authorization: `Bearer ${token}`},
                }),
            ]);

            if (rolesRes.ok === false || permsRes.ok === false) {
                throw new Error('Failed to fetch data');
            }

            const rolesData = (await rolesRes.json()) as Role[];
            const permsData = (await permsRes.json()) as PermissionsByCategory;

            setRoles(rolesData);
            setPermissions(permsData);
            setPageState('loaded');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load roles');
            setPageState('error');
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const renderRoleCard = (role: Role): React.ReactElement => {
        const isSelected = selectedRole?.id === role.id;

        return (
            <Card
                key={role.id}
                variant={isSelected ? 'elevated' : 'default'}
                onClick={() => setSelectedRole(isSelected ? null : role)}
            >
                <CardBody padding="md">
                    <Stack spacing="sm">
                        <Flex justify="space-between" align="center">
                            <Text variant="heading5" weight="semibold">
                                {role.name}
                            </Text>
                            {role.isSystemRole === true && (
                                <Badge color="zinc">System</Badge>
                            )}
                        </Flex>
                        <Text variant="bodySmall" color="muted">
                            {role.description ?? 'No description'}
                        </Text>
                        <Text variant="caption" color="muted">
                            {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                        </Text>
                    </Stack>
                </CardBody>
            </Card>
        );
    };

    const renderPermissions = (): React.ReactElement => {
        if (selectedRole === null) {
            return (
                <Flex justify="center" align="center" padding="xl">
                    <Text variant="body" color="muted">
                        Select a role to view its permissions
                    </Text>
                </Flex>
            );
        }

        const rolePermissions = new Set(selectedRole.permissions);
        const hasWildcard = rolePermissions.has('*');

        return (
            <Stack spacing="md">
                <Text variant="heading5" weight="semibold">
                    Permissions for {selectedRole.name}
                </Text>

                {hasWildcard === true && (
                    <InlineAlert color="warning">
                        <InlineAlertDescription>
                            This role has full system access (*).
                        </InlineAlertDescription>
                    </InlineAlert>
                )}

                {Object.entries(permissions).map(([category, perms]) => (
                    <Card key={category} variant="outlined">
                        <CardBody padding="md">
                            <Stack spacing="sm">
                                <Text variant="bodySmall" weight="semibold">
                                    {category.replace(/_/g, ' ')}
                                </Text>
                                <Flex gap="sm">
                                    {perms.map((perm) => {
                                        const hasPermission = hasWildcard || rolePermissions.has(perm.code);
                                        return (
                                            <Badge
                                                key={perm.id}
                                                color={hasPermission ? 'green' : 'zinc'}
                                                title={perm.description}
                                            >
                                                {perm.displayName}
                                            </Badge>
                                        );
                                    })}
                                </Flex>
                            </Stack>
                        </CardBody>
                    </Card>
                ))}
            </Stack>
        );
    };

    if (pageState === 'loading') {
        return (
            <Section id="roles-page">
                <Flex justify="center" align="center">
                    <Text variant="body" color="muted">
                        Loading roles...
                    </Text>
                </Flex>
            </Section>
        );
    }

    if (pageState === 'error') {
        return (
            <Section id="roles-page">
                <Flex justify="center" align="center">
                    <Stack spacing="md" align="center">
                        <Text variant="body" color="danger">
                            {error}
                        </Text>
                        <Button variant="primary" onClick={fetchData}>
                            Retry
                        </Button>
                    </Stack>
                </Flex>
            </Section>
        );
    }

    return (
        <Section id="roles-page">
            <SectionHeader
                title="Roles & Permissions"
                description="Manage roles and their associated permissions"
            />

            <Grid columns={3} gap="lg">
                {/* Roles List */}
                <GridItem>
                    <Stack spacing="md">
                        <Text variant="bodySmall" weight="semibold" color="muted">
                            ROLES ({roles.length})
                        </Text>
                        {roles.map(renderRoleCard)}
                    </Stack>
                </GridItem>

                {/* Permissions Panel */}
                <GridItem colSpan={2}>
                    <Card variant="elevated">
                        <CardBody padding="lg">
                            {renderPermissions()}
                        </CardBody>
                    </Card>
                </GridItem>
            </Grid>
        </Section>
    );
}

export default RolesPage;
