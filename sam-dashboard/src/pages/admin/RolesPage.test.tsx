/**
 * Tests for RolesPage component
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {RolesPage} from './RolesPage';
import type {PermissionsByCategory, Role} from '../../types';
// Import mocked functions
import {createRole, deleteRole, fetchPermissions, fetchRoles} from '../../services';

// Mock the services
vi.mock('../../services', () => ({
    fetchRoles: vi.fn(),
    fetchPermissions: vi.fn(),
    createRole: vi.fn(),
    updateRole: vi.fn(),
    deleteRole: vi.fn(),
}));

const mockRoles: Role[] = [
    {
        id: '1',
        name: 'ADMIN',
        description: 'Full system access',
        permissions: ['*'],
        isSystemRole: true,
        createdAt: '2024-01-01T00:00:00Z',
    },
    {
        id: '2',
        name: 'MANAGER',
        description: 'Management access',
        permissions: ['opportunities:read', 'opportunities:write'],
        isSystemRole: false,
        createdAt: '2024-01-02T00:00:00Z',
    },
];

const mockPermissions: PermissionsByCategory = {
    OPPORTUNITIES: [
        {
            id: 'p1',
            code: 'opportunities:read',
            displayName: 'Read Opportunities',
            description: 'View opportunities',
            category: 'OPPORTUNITIES',
        },
        {
            id: 'p2',
            code: 'opportunities:write',
            displayName: 'Write Opportunities',
            description: 'Create/edit opportunities',
            category: 'OPPORTUNITIES',
        },
    ],
};

describe('RolesPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (fetchRoles as ReturnType<typeof vi.fn>).mockResolvedValue(mockRoles);
        (fetchPermissions as ReturnType<typeof vi.fn>).mockResolvedValue(mockPermissions);
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('renders loading state initially', () => {
        render(<RolesPage/>);
        expect(screen.getByText('Loading roles...')).toBeInTheDocument();
    });

    it('renders roles after loading', async () => {
        render(<RolesPage/>);

        await waitFor(() => {
            expect(screen.getByText('ADMIN')).toBeInTheDocument();
        });

        expect(screen.getByText('MANAGER')).toBeInTheDocument();
        expect(screen.getByText('Full system access')).toBeInTheDocument();
    });

    it('shows system badge for system roles', async () => {
        render(<RolesPage/>);

        await waitFor(() => {
            expect(screen.getByText('ADMIN')).toBeInTheDocument();
        });

        const systemBadges = screen.getAllByText('System');
        expect(systemBadges.length).toBeGreaterThan(0);
    });

    it('shows error state when fetch fails', async () => {
        (fetchRoles as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

        render(<RolesPage/>);

        await waitFor(() => {
            expect(screen.getByText('Network error')).toBeInTheDocument();
        });

        expect(screen.getByRole('button', {name: 'Retry'})).toBeInTheDocument();
    });

    it('opens create modal when Create Role button is clicked', async () => {
        const user = userEvent.setup();
        render(<RolesPage/>);

        await waitFor(() => {
            expect(screen.getByText('ADMIN')).toBeInTheDocument();
        });

        const createButton = screen.getByRole('button', {name: /create role/i});
        await user.click(createButton);

        expect(screen.getByText('Create New Role')).toBeInTheDocument();
    });

    it('opens edit modal when edit button is clicked', async () => {
        const user = userEvent.setup();
        render(<RolesPage/>);

        await waitFor(() => {
            expect(screen.getByText('MANAGER')).toBeInTheDocument();
        });

        const editButtons = screen.getAllByLabelText(/edit/i);
        // Click the edit button for MANAGER (non-system role)
        await user.click(editButtons[1]);

        expect(screen.getByText('Edit Role')).toBeInTheDocument();
    });

    it('prevents deletion of system roles', async () => {
        render(<RolesPage/>);

        await waitFor(() => {
            expect(screen.getByText('ADMIN')).toBeInTheDocument();
        });

        // Find the delete button for the system role (ADMIN) - it should be disabled
        const deleteButtons = screen.getAllByLabelText(/delete/i);
        expect(deleteButtons[0]).toBeDisabled();
    });

    it('confirms before deleting a role', async () => {
        const user = userEvent.setup();
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
        (deleteRole as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

        render(<RolesPage/>);

        await waitFor(() => {
            expect(screen.getByText('MANAGER')).toBeInTheDocument();
        });

        const deleteButtons = screen.getAllByLabelText(/delete/i);
        // Click delete for MANAGER (the enabled delete button)
        await user.click(deleteButtons[1]);

        expect(confirmSpy).toHaveBeenCalledWith(
            expect.stringContaining('Are you sure you want to delete')
        );
        expect(deleteRole).not.toHaveBeenCalled();

        confirmSpy.mockRestore();
    });

    it('deletes role when confirmed', async () => {
        const user = userEvent.setup();
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        (deleteRole as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

        render(<RolesPage/>);

        await waitFor(() => {
            expect(screen.getByText('MANAGER')).toBeInTheDocument();
        });

        const deleteButtons = screen.getAllByLabelText(/delete/i);
        await user.click(deleteButtons[1]);

        expect(deleteRole).toHaveBeenCalledWith('2');

        confirmSpy.mockRestore();
    });

    it('creates a new role when form is submitted', async () => {
        const user = userEvent.setup();
        (createRole as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: '3',
            name: 'NEW_ROLE',
            description: 'Test role',
            permissions: ['opportunities:read'],
            isSystemRole: false,
            createdAt: '2024-01-03T00:00:00Z',
        });

        render(<RolesPage/>);

        await waitFor(() => {
            expect(screen.getByText('ADMIN')).toBeInTheDocument();
        });

        // Open create modal
        const createButton = screen.getByRole('button', {name: /create role/i});
        await user.click(createButton);

        // Fill in the form
        const nameInput = screen.getByPlaceholderText(/CONTRACT_MANAGER/i);
        await user.clear(nameInput);
        await user.type(nameInput, 'NEW_ROLE');

        // Submit the form
        const submitButton = screen.getByRole('button', {name: /create role/i});
        await user.click(submitButton);

        await waitFor(() => {
            expect(createRole).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'NEW_ROLE',
                })
            );
        });
    });
});
