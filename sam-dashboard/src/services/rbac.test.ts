/**
 * Tests for RBAC service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchRoles,
  fetchRole,
  createRole,
  updateRole,
  deleteRole,
  fetchPermissions,
  fetchPermissionCodes,
  fetchMyPermissions,
  fetchUsersWithRoles,
  updateUserRole,
  removeUserRole,
} from './rbac';
import type { Role, PermissionsByCategory, PaginatedResponse, UserWithRoles } from '../types';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => mockLocalStorage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage[key];
  }),
  clear: vi.fn(() => {
    Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);
  }),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('RBAC Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    // Set up auth token
    mockLocalStorage['sam_auth_state'] = JSON.stringify({ token: 'test-token' });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('fetchRoles', () => {
    it('fetches roles successfully', async () => {
      const mockRoles: Role[] = [
        {
          id: '1',
          name: 'ADMIN',
          description: 'Admin role',
          permissions: ['*'],
          isSystemRole: true,
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRoles),
      });

      const result = await fetchRoles();

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/roles',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
      expect(result).toEqual(mockRoles);
    });

    it('throws error on fetch failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Forbidden',
        json: () => Promise.resolve({ message: 'Access denied' }),
      });

      await expect(fetchRoles()).rejects.toThrow('Access denied');
    });
  });

  describe('createRole', () => {
    it('creates a role successfully', async () => {
      const newRole: Role = {
        id: '2',
        name: 'NEW_ROLE',
        description: 'New role',
        permissions: ['opportunities:read'],
        isSystemRole: false,
        createdAt: '2024-01-02T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(newRole),
      });

      const result = await createRole({
        name: 'NEW_ROLE',
        description: 'New role',
        permissions: ['opportunities:read'],
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/roles',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            name: 'NEW_ROLE',
            description: 'New role',
            permissions: ['opportunities:read'],
          }),
        })
      );
      expect(result).toEqual(newRole);
    });
  });

  describe('updateRole', () => {
    it('updates a role successfully', async () => {
      const updatedRole: Role = {
        id: '1',
        name: 'UPDATED_ROLE',
        description: 'Updated description',
        permissions: ['opportunities:read', 'opportunities:write'],
        isSystemRole: false,
        createdAt: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedRole),
      });

      const result = await updateRole('1', {
        name: 'UPDATED_ROLE',
        description: 'Updated description',
        permissions: ['opportunities:read', 'opportunities:write'],
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/roles/1',
        expect.objectContaining({
          method: 'PUT',
        })
      );
      expect(result).toEqual(updatedRole);
    });
  });

  describe('deleteRole', () => {
    it('deletes a role successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await deleteRole('1');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/roles/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('throws error on delete failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'Role not found' }),
      });

      await expect(deleteRole('999')).rejects.toThrow('Role not found');
    });
  });

  describe('fetchPermissions', () => {
    it('fetches permissions grouped by category', async () => {
      const mockPermissions: PermissionsByCategory = {
        OPPORTUNITIES: [
          {
            id: 'p1',
            code: 'opportunities:read',
            displayName: 'Read Opportunities',
            description: 'View opportunities',
            category: 'OPPORTUNITIES',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPermissions),
      });

      const result = await fetchPermissions();

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/permissions',
        expect.anything()
      );
      expect(result).toEqual(mockPermissions);
    });
  });

  describe('fetchUsersWithRoles', () => {
    it('fetches users with pagination', async () => {
      const mockResponse: PaginatedResponse<UserWithRoles> = {
        content: [
          {
            id: 'u1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            roles: [{ id: 'r1', name: 'ADMIN' }],
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
          },
        ],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 20,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fetchUsersWithRoles(0, 20);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/users?page=0&size=20',
        expect.anything()
      );
      expect(result).toEqual(mockResponse);
    });

    it('includes search query when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 }),
      });

      await fetchUsersWithRoles(0, 20, 'test@example.com');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/users?page=0&size=20&search=test%40example.com',
        expect.anything()
      );
    });
  });

  describe('updateUserRole', () => {
    it('updates user role successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await updateUserRole('u1', 'ADMIN');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/users/u1/role',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ role: 'ADMIN' }),
        })
      );
    });
  });
});
