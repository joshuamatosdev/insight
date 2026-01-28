/**
 * User Roles Management Page
 * Lists users with their assigned roles and allows role assignment
 */

import {ChangeEvent, useCallback, useEffect, useState} from 'react';
import {Badge, Button, Input, Select, Text,} from '../../components/catalyst/primitives';
import {SearchIcon} from '../../components/catalyst/primitives/Icon';
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
import {fetchRoles, fetchUsersWithRoles, updateUserRole} from '../../services';
import type {AdminPageState, Role, UserWithRoles} from '../../types';

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

    const options = [
        {value: '', label: 'Select role...'},
        ...availableRoles.map((role) => ({value: role.name, label: role.name})),
    ];

    return (
        <Select
            value={currentRole ?? ''}
            onChange={handleChange}
            disabled={isLoading}
            options={options}
        />
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
                <Flex justify="center" align="center">
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
                <Flex justify="center" align="center">
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
            <SectionHeader title="User Role Management"/>

            {/* Search Bar */}
            <Card variant="filled">
                <CardBody padding="md">
                    <Stack spacing="sm">
                        <Flex gap="sm" align="center">
                            <Box>
                                <Input
                                    type="text"
                                    value={searchInput}
                                    onChange={handleSearchInputChange}
                                    onKeyDown={handleSearchKeyDown}
                                    placeholder="Search by name or email..."
                                />
                            </Box>
                            <Button variant="primary" onClick={handleSearch}>
                                <HStack spacing="xs" align="center">
                                    <SearchIcon size="sm"/>
                                    <Text as="span" variant="bodySmall" color="white">
                                        Search
                                    </Text>
                                </HStack>
                            </Button>
                            {searchQuery.length > 0 && (
                                <Button variant="outline" onClick={handleClearSearch}>
                                    Clear
                                </Button>
                            )}
                        </Flex>
                        {searchQuery.length > 0 && (
                            <Text variant="caption" color="muted">
                                Showing results for &quot;{searchQuery}&quot; ({totalUsers} user
                                {totalUsers !== 1 ? 's' : ''} found)
                            </Text>
                        )}
                    </Stack>
                </CardBody>
            </Card>

            {error !== null && (
                <Card variant="outlined">
                    <CardBody padding="md">
                        <Text variant="bodySmall" color="danger">
                            {error}
                        </Text>
                    </CardBody>
                </Card>
            )}

            <Card variant="elevated">
                <CardBody padding="none">
                    <Table striped>
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>User</TableHeaderCell>
                                <TableHeaderCell>Email</TableHeaderCell>
                                <TableHeaderCell>Current Role</TableHeaderCell>
                                <TableHeaderCell>Status</TableHeaderCell>
                                <TableHeaderCell>Joined</TableHeaderCell>
                                <TableHeaderCell>Change Role</TableHeaderCell>
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
                                                <Badge color="cyan">{currentRole.name}</Badge>
                                            ) : (
                                                <Badge color="zinc">No role</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge color={user.isActive ? 'green' : 'amber'}>
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
                                    <TableCell colSpan={6}>
                                        <Flex justify="center" padding="lg">
                                            <Text variant="body" color="muted">
                                                {searchQuery.length > 0
                                                    ? 'No users found matching your search.'
                                                    : 'No users found.'}
                                            </Text>
                                        </Flex>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <Flex justify="between" align="center">
                    <Text variant="bodySmall" color="muted">
                        Showing {currentPage * PAGE_SIZE + 1} -{' '}
                        {Math.min((currentPage + 1) * PAGE_SIZE, totalUsers)} of {totalUsers} users
                    </Text>
                    <HStack spacing="sm">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevPage}
                            disabled={hasPrevPage === false}
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
                            disabled={hasNextPage === false}
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
