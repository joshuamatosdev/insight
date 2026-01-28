import type {components} from '@/types/api.generated';
import {apiClient} from './apiClient';

/**
 * User Service - Type-safe using openapi-fetch
 */

// ==================== Type Aliases from OpenAPI ====================

export type User = components['schemas']['UserDto'];
export type UserStatus = NonNullable<User['status']>;
export type CreateUserRequest = components['schemas']['CreateUserRequest'];
export type InviteUserRequest = components['schemas']['InviteUserRequest'];

// ==================== Derived Types ====================

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

export async function fetchUsers(
    page: number = 0,
    size: number = 20,
    filters?: UserFilters
): Promise<Page<User>> {
    const queryParams: Record<string, string | number> = {
        page,
        size,
    };

    if (filters?.search !== undefined && filters.search !== '') {
        queryParams.search = filters.search;
    }
    if (filters?.status !== undefined) {
        queryParams.status = filters.status;
    }
    if (filters?.role !== undefined) {
        queryParams.role = filters.role;
    }

    const {data, error} = await apiClient.GET('/users', {
        params: {query: queryParams},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Page<User>;
}

export async function fetchUser(id: string): Promise<User> {
    const {data, error} = await apiClient.GET('/users/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as User;
}

export async function fetchCurrentUser(): Promise<User> {
    const {data, error} = await apiClient.GET('/users/me');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as User;
}

export async function createUser(data: CreateUserRequest): Promise<User> {
    const {data: responseData, error} = await apiClient.POST('/users', {
        body: data,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return responseData as User;
}

export async function updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const {data: responseData, error} = await apiClient.PUT('/users/{id}', {
        params: {path: {id}},
        body: data,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return responseData as User;
}

export async function updateCurrentUser(data: UpdateUserRequest): Promise<User> {
    const {data: responseData, error} = await apiClient.PUT('/users/me', {
        body: data,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return responseData as User;
}

export async function deleteUser(id: string): Promise<void> {
    const {error} = await apiClient.DELETE('/users/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function updateUserStatus(id: string, status: UserStatus): Promise<User> {
    // Check if there's a specific endpoint for status updates
    const {data, error} = await apiClient.PATCH('/users/{id}', {
        params: {path: {id}},
        body: {status},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as User;
}

export async function resetUserPassword(id: string): Promise<void> {
    const {error} = await apiClient.POST('/users/{id}/reset-password', {
        params: {path: {id}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function resendVerificationEmail(id: string): Promise<void> {
    const {error} = await apiClient.POST('/users/{id}/resend-verification', {
        params: {path: {id}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function updateUserRoles(id: string, roles: string[]): Promise<User> {
    const {data, error} = await apiClient.PUT('/users/{id}/roles', {
        params: {path: {id}},
        body: {roles},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as User;
}
