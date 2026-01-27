/**
 * User Roles Management Page
 * Lists users with their assigned roles and allows role assignment
 */

import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Text, Button, Input, Badge, SearchIcon } from '../../components/catalyst/primitives';
import {
  Section,
  SectionHeader,
  Card,
  CardBody,
  Stack,
  Flex,
  Box,
  HStack,
} from '../../components/catalyst/layout';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from '../../components/catalyst';
import { fetchUsersWithRoles, fetchRoles, updateUserRole } from '../../services';
import type { Role, UserWithRoles, AdminPageState, PaginatedResponse } from '../../types';

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
 * Get user display name
 */
function getUserDisplayName(user: UserWithRoles): string {
  if (user.firstName !== null && user.lastName !== null) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.firstName !== null) {
    return user.firstName;
  }
  return user.email.split('@')[0] ?? user.email;
}

/**
 * Role Select Dropdown Component
 */
function RoleSelect({
  currentRole,
  availableRoles,
  onRoleChange,
  isLoading,
}: {
  currentRole: string | null;
  availableRoles: Role[];
  onRoleChange: (roleName: string) => void;
  isLoading: boolean;
}): React.ReactElement {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value;
      if (value !== currentRole) {
        onRoleChange(value);
      }
    },
    [currentRole, onRoleChange]
  );

  return (
    <select
      value={currentRole ?? ''}
      onChange={handleChange}
      disabled={isLoading}
      style={{
        padding: '0.25rem 0.5rem',
        fontSize: '0.875rem',
        borderRadius: '0.375rem',
        border: '1px solid #d4d4d8',
        backgroundColor: '#ffffff',
        cursor: isLoading ? 'wait' : 'pointer',
        minWidth: '150px',
      }}
    >
      <option value="" disabled>
        Select role...
      </option>
      {availableRoles.map((role) => (
        <option key={role.id} value={role.name}>
          {role.name}
        </option>
      ))}
    </select>
  );
}

/**
 * User Roles Admin Page Component
 */
export function UserRolesPage(): React.ReactElement {
  const [pageState, setPageState] = useState<AdminPageState>('loading');
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const PAGE_SIZE = 20;

  const loadData = useCallback(async () => {
    setPageState('loading');
    setError(null);
    try {
      const [usersData, rolesData] = await Promise.all([
        fetchUsersWithRoles(currentPage, PAGE_SIZE, searchQuery.length > 0 ? searchQuery : undefined),
        fetchRoles(),
      ]);
      setUsers(usersData.content);
      setTotalUsers(usersData.totalElements);
      setRoles(rolesData);
      setPageState('loaded');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setPageState('error');
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearchInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  }, []);

  const handleSearch = useCallback(() => {
    setSearchQuery(searchInput);
    setCurrentPage(0);
  }, [searchInput]);

  const handleSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(0);
  }, []);

  const handleRoleChange = useCallback(
    async (userId: string, roleName: string) => {
      setUpdatingUserId(userId);
      setError(null);
      try {
        await updateUserRole(userId, roleName);
        // Refresh users list
        const usersData = await fetchUsersWithRoles(
          currentPage,
          PAGE_SIZE,
          searchQuery.length > 0 ? searchQuery : undefined
        );
        setUsers(usersData.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update user role');
      } finally {
        setUpdatingUserId(null);
      }
    },
    [currentPage, searchQuery]
  );

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    const maxPage = Math.ceil(totalUsers / PAGE_SIZE) - 1;
    setCurrentPage((prev) => Math.min(maxPage, prev + 1));
  }, [totalUsers]);

  const totalPages = Math.ceil(totalUsers / PAGE_SIZE);
  const hasNextPage = currentPage < totalPages - 1;
  const hasPrevPage = currentPage > 0;

  if (pageState === 'loading' && users.length === 0) {
    return (
      <Section id="user-roles-admin">
        <Flex justify="center" align="center" style={{ minHeight: '300px' }}>
          <Text variant="body" color="muted">
            Loading users...
          </Text>
        </Flex>
      </Section>
    );
  }

  if (pageState === 'error' && users.length === 0) {
    return (
      <Section id="user-roles-admin">
        <Flex justify="center" align="center" style={{ minHeight: '300px' }}>
          <Stack spacing="md" align="center">
            <Text variant="body" color="danger">
              {error ?? 'Failed to load users'}
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
    <Section id="user-roles-admin">
      <SectionHeader title="User Role Management" />

      {/* Search Bar */}
      <Card variant="filled" className="mb-4">
        <CardBody padding="md">
          <Flex gap="sm" align="center">
            <Box style={{ flex: 1 }}>
              <Input
                type="text"
                value={searchInput}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search by name or email..."
                fullWidth
                leftIcon={<SearchIcon size="sm" color="muted" />}
              />
            </Box>
            <Button variant="primary" onClick={handleSearch}>
              Search
            </Button>
            {searchQuery.length > 0 && (
              <Button variant="outline" onClick={handleClearSearch}>
                Clear
              </Button>
            )}
          </Flex>
          {searchQuery.length > 0 && (
            <Text variant="caption" color="muted" className="mt-2">
              Showing results for &quot;{searchQuery}&quot; ({totalUsers} user
              {totalUsers !== 1 ? 's' : ''} found)
            </Text>
          )}
        </CardBody>
      </Card>

      {error !== null && (
        <Box
          style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            backgroundColor: '#fef2f2',
            borderRadius: '0.375rem',
            border: '1px solid #ef4444',
          }}
        >
          <Text variant="bodySmall" color="danger">
            {error}
          </Text>
        </Box>
      )}

      <Card variant="default">
        <CardBody padding="none">
          <Table striped>
            <TableHead>
              <TableRow>
                <TableHeader>User</TableHeader>
                <TableHeader>Email</TableHeader>
                <TableHeader>Current Role</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Joined</TableHeader>
                <TableHeader>Change Role</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => {
                const currentRole = user.roles.length > 0 ? user.roles[0] : null;
                const isUpdating = updatingUserId === user.id;

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Text variant="bodySmall" weight="medium">
                        {getUserDisplayName(user)}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Text variant="bodySmall" color="muted">
                        {user.email}
                      </Text>
                    </TableCell>
                    <TableCell>
                      {currentRole !== null ? (
                        <Badge variant="info" size="sm">
                          {currentRole.name}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" size="sm">
                          No role
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.isActive ? 'success' : 'warning'}
                        size="sm"
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Text variant="caption" color="muted">
                        {formatDate(user.createdAt)}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <RoleSelect
                        currentRole={currentRole?.name ?? null}
                        availableRoles={roles}
                        onRoleChange={(roleName) => handleRoleChange(user.id, roleName)}
                        isLoading={isUpdating}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {users.length === 0 && (
                <TableRow>
                  <TableCell>
                    <Text
                      variant="body"
                      color="muted"
                      className="p-8 text-center"
                    >
                      {searchQuery.length > 0
                        ? 'No users found matching your search.'
                        : 'No users found.'}
                    </Text>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Flex justify="between" align="center" className="mt-4">
          <Text variant="bodySmall" color="muted">
            Showing {currentPage * PAGE_SIZE + 1} -{' '}
            {Math.min((currentPage + 1) * PAGE_SIZE, totalUsers)} of {totalUsers} users
          </Text>
          <HStack spacing="sm">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              isDisabled={hasPrevPage === false}
            >
              Previous
            </Button>
            <Text variant="bodySmall">
              Page {currentPage + 1} of {totalPages}
            </Text>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              isDisabled={hasNextPage === false}
            >
              Next
            </Button>
          </HStack>
        </Flex>
      )}
    </Section>
  );
}

export default UserRolesPage;
