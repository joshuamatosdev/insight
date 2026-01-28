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

const USER_BASE = '/users';

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

  const response = await apiClient.get<Page<User>>(`${USER_BASE}?${params.toString()}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function fetchUser(id: string): Promise<User> {
  const response = await apiClient.get<User>(`${USER_BASE}/${id}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>(`${USER_BASE}/me`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function createUser(data: CreateUserRequest): Promise<User> {
  const response = await apiClient.post<User, CreateUserRequest>(USER_BASE, data);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function updateUser(id: string, data: UpdateUserRequest): Promise<User> {
  const response = await apiClient.put<User, UpdateUserRequest>(`${USER_BASE}/${id}`, data);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function updateCurrentUser(data: UpdateUserRequest): Promise<User> {
  const response = await apiClient.put<User, UpdateUserRequest>(`${USER_BASE}/me`, data);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function deleteUser(id: string): Promise<void> {
  const response = await apiClient.delete<void>(`${USER_BASE}/${id}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
}

export async function updateUserStatus(id: string, status: UserStatus): Promise<User> {
  const response = await apiClient.patch<User, { status: UserStatus }>(`${USER_BASE}/${id}/status`, { status });
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function resetUserPassword(id: string): Promise<void> {
  const response = await apiClient.post<void, Record<string, never>>(`${USER_BASE}/${id}/reset-password`, {});
  if (response.success === false) {
    throw new Error(response.error.message);
  }
}

export async function resendVerificationEmail(id: string): Promise<void> {
  const response = await apiClient.post<void, Record<string, never>>(`${USER_BASE}/${id}/resend-verification`, {});
  if (response.success === false) {
    throw new Error(response.error.message);
  }
}

export async function updateUserRoles(id: string, roles: string[]): Promise<User> {
  const response = await apiClient.put<User, { roles: string[] }>(`${USER_BASE}/${id}/roles`, { roles });
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}
