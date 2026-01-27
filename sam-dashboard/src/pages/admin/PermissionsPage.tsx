/**
 * Permissions Page
 * Lists all permissions grouped by category with role associations
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Text, Button, Badge } from '../../components/catalyst/primitives';
import {
  Section,
  SectionHeader,
  Card,
  CardHeader,
  CardBody,
  Stack,
  Flex,
  Box,
  Grid,
  GridItem,
  HStack,
} from '../../components/catalyst/layout';
import { fetchRoles, fetchPermissions } from '../../services';
import type { Role, PermissionsByCategory, Permission, AdminPageState } from '../../types';

/**
 * Format category name for display
 */
function formatCategoryName(category: string): string {
  return category.replace(/_/g, ' ');
}

/**
 * Get roles that have a specific permission
 */
function getRolesWithPermission(roles: Role[], permissionCode: string): Role[] {
  return roles.filter((role) => {
    // Check for wildcard permission
    if (role.permissions.includes('*')) {
      return true;
    }
    // Check for exact match
    if (role.permissions.includes(permissionCode)) {
      return true;
    }
    // Check for resource-level wildcard (e.g., "opportunities:*")
    const [resource] = permissionCode.split(':');
    if (role.permissions.includes(`${resource}:*`)) {
      return true;
    }
    return false;
  });
}

/**
 * Permission Card Component
 */
function PermissionCard({
  permission,
  roles,
}: {
  permission: Permission;
  roles: Role[];
}): React.ReactElement {
  const rolesWithPermission = useMemo(
    () => getRolesWithPermission(roles, permission.code),
    [roles, permission.code]
  );

  return (
    <Card variant="outlined">
      <CardBody padding="md">
        <Stack spacing="sm">
          <HStack justify="between" align="start">
            <Stack spacing="xs">
              <Text variant="bodySmall" weight="medium">
                {permission.displayName}
              </Text>
              <Text variant="caption" color="muted" style={{ fontFamily: 'monospace' }}>
                {permission.code}
              </Text>
            </Stack>
            <Badge variant="secondary" size="sm">
              {rolesWithPermission.length} role{rolesWithPermission.length !== 1 ? 's' : ''}
            </Badge>
          </HStack>

          {permission.description !== null && permission.description.length > 0 && (
            <Text variant="caption" color="muted">
              {permission.description}
            </Text>
          )}

          {rolesWithPermission.length > 0 && (
            <Flex gap="0.25rem" style={{ flexWrap: 'wrap', marginTop: '0.25rem' }}>
              {rolesWithPermission.map((role) => (
                <Badge
                  key={role.id}
                  variant={role.isSystemRole ? 'info' : 'success'}
                  size="sm"
                >
                  {role.name}
                </Badge>
              ))}
            </Flex>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
}

/**
 * Category Section Component
 */
function CategorySection({
  category,
  permissions,
  roles,
}: {
  category: string;
  permissions: Permission[];
  roles: Role[];
}): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => prev === false);
  }, []);

  return (
    <Card variant="default">
      <CardHeader>
        <Flex justify="between" align="center">
          <HStack spacing="sm" align="center">
            <Text variant="heading6" weight="semibold">
              {formatCategoryName(category)}
            </Text>
            <Badge variant="secondary" size="sm">
              {permissions.length}
            </Badge>
          </HStack>
          <Button variant="ghost" size="sm" onClick={toggleExpanded}>
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </Flex>
      </CardHeader>

      {isExpanded && (
        <CardBody>
          <Grid columns="repeat(auto-fill, minmax(300px, 1fr))" gap="md">
            {permissions.map((permission) => (
              <GridItem key={permission.id}>
                <PermissionCard permission={permission} roles={roles} />
              </GridItem>
            ))}
          </Grid>
        </CardBody>
      )}
    </Card>
  );
}

/**
 * Permissions Admin Page Component
 */
export function PermissionsPage(): React.ReactElement {
  const [pageState, setPageState] = useState<AdminPageState>('loading');
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<PermissionsByCategory>({});
  const [error, setError] = useState<string | null>(null);

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

  // Calculate statistics
  const stats = useMemo(() => {
    const categories = Object.keys(permissions);
    const totalPermissions = Object.values(permissions).reduce(
      (sum, perms) => sum + perms.length,
      0
    );
    return {
      categories: categories.length,
      totalPermissions,
    };
  }, [permissions]);

  if (pageState === 'loading') {
    return (
      <Section id="permissions-admin">
        <Flex justify="center" align="center" style={{ minHeight: '300px' }}>
          <Text variant="body" color="muted">
            Loading permissions...
          </Text>
        </Flex>
      </Section>
    );
  }

  if (pageState === 'error') {
    return (
      <Section id="permissions-admin">
        <Flex justify="center" align="center" style={{ minHeight: '300px' }}>
          <Stack spacing="md" align="center">
            <Text variant="body" color="danger">
              {error ?? 'Failed to load permissions'}
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
    <Section id="permissions-admin">
      <SectionHeader title="Permissions" />

      {/* Stats Summary */}
      <Grid columns="repeat(auto-fit, minmax(200px, 1fr))" gap="md" className="mb-6">
        <GridItem>
          <Card variant="filled">
            <CardBody padding="md">
              <Stack spacing="xs">
                <Text variant="heading3" weight="bold">
                  {stats.categories}
                </Text>
                <Text variant="bodySmall" color="muted">
                  Permission Categories
                </Text>
              </Stack>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem>
          <Card variant="filled">
            <CardBody padding="md">
              <Stack spacing="xs">
                <Text variant="heading3" weight="bold">
                  {stats.totalPermissions}
                </Text>
                <Text variant="bodySmall" color="muted">
                  Total Permissions
                </Text>
              </Stack>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem>
          <Card variant="filled">
            <CardBody padding="md">
              <Stack spacing="xs">
                <Text variant="heading3" weight="bold">
                  {roles.length}
                </Text>
                <Text variant="bodySmall" color="muted">
                  Defined Roles
                </Text>
              </Stack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Permissions by Category */}
      <Stack spacing="md">
        {Object.entries(permissions).map(([category, categoryPermissions]) => (
          <CategorySection
            key={category}
            category={category}
            permissions={categoryPermissions}
            roles={roles}
          />
        ))}
      </Stack>

      {Object.keys(permissions).length === 0 && (
        <Card variant="default">
          <CardBody>
            <Flex direction="column" align="center" gap="md" className="p-8">
              <Text variant="body" color="muted" style={{ textAlign: 'center' }}>
                No permissions found. Permissions are typically seeded automatically.
              </Text>
            </Flex>
          </CardBody>
        </Card>
      )}
    </Section>
  );
}

export default PermissionsPage;
