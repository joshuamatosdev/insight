/**
 * Notification Service - Type-safe using openapi-fetch
 */

import {apiClient} from './apiClient';

export type NotificationType =
    | 'OPPORTUNITY_MATCH'
    | 'DEADLINE_REMINDER'
    | 'SYSTEM_ALERT'
    | 'TASK_ASSIGNED'
    | 'CONTRACT_UPDATE'
    | 'COMPLIANCE_WARNING'
    | 'MESSAGE'
    | 'OTHER';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Notification {
    id: string;
    type: NotificationType;
    priority: NotificationPriority;
    title: string;
    message: string;
    read: boolean;
    readAt: string | null;
    actionUrl: string | null;
    actionLabel: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
    expiresAt: string | null;
}

export interface NotificationPreferences {
    emailEnabled: boolean;
    pushEnabled: boolean;
    opportunityAlerts: boolean;
    deadlineReminders: boolean;
    systemAlerts: boolean;
    digestFrequency: 'REALTIME' | 'DAILY' | 'WEEKLY' | 'NONE';
}

interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export async function fetchNotifications(
    page: number = 0,
    size: number = 20,
    unreadOnly: boolean = false
): Promise<Page<Notification>> {
    const queryParams: Record<string, string | number | boolean> = {
        page,
        size,
    };

    if (unreadOnly === true) {
        queryParams.unreadOnly = true;
    }

    const {data, error} = await apiClient.GET('/notifications', {
        params: {query: queryParams},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Page<Notification>;
}

export async function fetchNotification(id: string): Promise<Notification> {
    const {data, error} = await apiClient.GET('/notifications/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Notification;
}

export async function markAsRead(id: string): Promise<Notification> {
    const {data, error} = await apiClient.PATCH('/notifications/{id}/read', {
        params: {path: {id}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Notification;
}

export async function markAllAsRead(): Promise<void> {
    const {error} = await apiClient.POST('/notifications/read-all', {
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function deleteNotification(id: string): Promise<void> {
    const {error} = await apiClient.DELETE('/notifications/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function deleteAllRead(): Promise<void> {
    const {error} = await apiClient.DELETE('/notifications/read');

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function getUnreadCount(): Promise<number> {
    const {data, error} = await apiClient.GET('/notifications/unread-count');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return (data as {count: number}).count;
}

export async function fetchPreferences(): Promise<NotificationPreferences> {
    const {data, error} = await apiClient.GET('/notifications/preferences');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as NotificationPreferences;
}

export async function updatePreferences(
    preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
    const {data, error} = await apiClient.PUT('/notifications/preferences', {
        body: preferences,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as NotificationPreferences;
}
