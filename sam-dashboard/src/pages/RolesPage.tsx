import { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, Flex, Stack, Box, Grid } from '../components/catalyst/layout';
import { Text, Button, Badge } from '../components/catalyst/primitives';
import type { Role, PermissionsByCategory, RolesPageState } from './types';

const API_BASE = '/api/v1';

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  try {
    const authData = localStorage.getItem('auth');
    if (authData !== null) {
      const parsed = JSON.parse(authData) as { accessToken?: string };
      return parsed.accessToken ?? null;
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
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/permissions`, {
          headers: { Authorization: `Bearer ${token}` },
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
        style={{
          cursor: 'pointer',
          border: isSelected ? '2px solid #2563eb' : undefined,
        }}
        onClick={() => setSelectedRole(isSelected ? null : role)}
      >
        <CardBody padding="md">
          <Stack spacing="sm">
            <Flex justify="space-between" align="center">
              <Text variant="heading5" weight="semibold">
                {role.name}
              </Text>
              {role.isSystemRole === true && (
                <Badge color="zinc">
                  System
                </Badge>
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
        <Box className="p-8 text-center">
          <Text variant="body" color="muted">
            Select a role to view its permissions
          </Text>
        </Box>
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
          <Box
            style={{
              padding: '0.75rem',
              backgroundColor: '#fffbeb',
              borderRadius: '0.375rem',
            }}
          >
            <Text variant="bodySmall" weight="medium">
              This role has full system access (*).
            </Text>
          </Box>
        )}

        {Object.entries(permissions).map(([category, perms]) => (
          <Card key={category} variant="default">
            <CardBody padding="md">
              <Text variant="bodySmall" weight="semibold" className="mb-2">
                {category.replace(/_/g, ' ')}
              </Text>
              <Flex gap="sm" style={{ flexWrap: 'wrap' }}>
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
            </CardBody>
          </Card>
        ))}
      </Stack>
    );
  };

  if (pageState === 'loading') {
    return (
      <Flex justify="center" align="center" style={{ minHeight: '200px' }}>
        <Text variant="body">Loading roles...</Text>
      </Flex>
    );
  }

  if (pageState === 'error') {
    return (
      <Flex justify="center" align="center" style={{ minHeight: '200px' }}>
        <Stack spacing="md" style={{ textAlign: 'center' }}>
          <Text variant="body" color="danger">
            {error}
          </Text>
          <Button variant="primary" onClick={fetchData}>
            Retry
          </Button>
        </Stack>
      </Flex>
    );
  }

  return (
    <Stack spacing="lg">
      <Flex justify="space-between" align="center">
        <Stack spacing="xs">
          <Text variant="heading3">Roles & Permissions</Text>
          <Text variant="bodySmall" color="muted">
            Manage roles and their associated permissions
          </Text>
        </Stack>
      </Flex>

      <Grid columns={3} gap="lg">
        {/* Roles List */}
        <Stack spacing="md">
          <Text variant="bodySmall" weight="semibold" color="muted">
            ROLES ({roles.length})
          </Text>
          {roles.map(renderRoleCard)}
        </Stack>

        {/* Permissions Panel */}
        <Box style={{ gridColumn: 'span 2' }}>
          <Card variant="default">
            <CardBody padding="lg">
              {renderPermissions()}
            </CardBody>
          </Card>
        </Box>
      </Grid>
    </Stack>
  );
}

export default RolesPage;
