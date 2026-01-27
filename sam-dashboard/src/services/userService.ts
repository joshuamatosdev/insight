import { apiClient } from './apiClient';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED' | 'LOCKED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl: string | null;
  status: UserStatus;
  emailVerified: boolean;
  mfaEnabled: boolean;
  lastLoginAt: string | null;
  roles: string[];
  permissions: string[];
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  roles?: string[];
  sendInvitation?: boolean;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatarUrl?: string;
  roles?: string[];
}

export interface UserFilters {
  search?: string;
  status?: UserStatus;
  role?: string;
}

interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const USER_BASE = '/api/users';

export async function fetchUsers(
  page: number = 0,
  size: number = 20,
  filters?: UserFilters
): Promise<Page<User>> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('size', size.toString());

  if (filters?.search !== undefined && filters.search !== '') {
    params.set('search', filters.search);
  }
  if (filters?.status !== undefined) {
    params.set('status', filters.status);
  }
  if (filters?.role !== undefined) {
    params.set('role', filters.role);
  }

  const response = await apiClient.get(`${USER_BASE}?${params.toString()}`);
  return response as Page<User>;
}

export async function fetchUser(id: string): Promise<User> {
  const response = await apiClient.get(`${USER_BASE}/${id}`);
  return response as User;
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await apiClient.get(`${USER_BASE}/me`);
  return response as User;
}

export async function createUser(data: CreateUserRequest): Promise<User> {
  const response = await apiClient.post(USER_BASE, data);
  return response as User;
}

export async function updateUser(id: string, data: UpdateUserRequest): Promise<User> {
  const response = await apiClient.put(`${USER_BASE}/${id}`, data);
  return response as User;
}

export async function updateCurrentUser(data: UpdateUserRequest): Promise<User> {
  const response = await apiClient.put(`${USER_BASE}/me`, data);
  return response as User;
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`${USER_BASE}/${id}`);
}

export async function updateUserStatus(id: string, status: UserStatus): Promise<User> {
  const response = await apiClient.patch(`${USER_BASE}/${id}/status`, { status });
  return response as User;
}

export async function resetUserPassword(id: string): Promise<void> {
  await apiClient.post(`${USER_BASE}/${id}/reset-password`);
}

export async function resendVerificationEmail(id: string): Promise<void> {
  await apiClient.post(`${USER_BASE}/${id}/resend-verification`);
}

export async function updateUserRoles(id: string, roles: string[]): Promise<User> {
  const response = await apiClient.put(`${USER_BASE}/${id}/roles`, { roles });
  return response as User;
}
