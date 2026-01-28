import {useCallback, useEffect, useState} from 'react';
import type {Notification, NotificationPreferences} from '../services';
import {
    deleteNotification,
    fetchNotificationPreferences,
    fetchNotifications,
    getUnreadCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    updateNotificationPreferences,
} from '../services';

interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface UseNotificationsReturn {
    notifications: Notification[];
    totalElements: number;
    totalPages: number;
    page: number;
    isLoading: boolean;
    error: Error | null;
    unreadCount: number;
    setPage: (page: number) => void;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    remove: (id: string) => Promise<void>;
    refresh: () => Promise<void>;
    refreshUnreadCount: () => Promise<void>;
}

export function useNotifications(
    unreadOnly: boolean = false,
    initialPage: number = 0,
    pageSize: number = 20
): UseNotificationsReturn {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(initialPage);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadNotifications = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data: Page<Notification> = await fetchNotifications(page, pageSize, unreadOnly);
            setNotifications(data.content);
            setTotalElements(data.totalElements);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load notifications'));
        } finally {
            setIsLoading(false);
        }
    }, [page, pageSize, unreadOnly]);

    const loadUnreadCount = useCallback(async () => {
        try {
            const count = await getUnreadCount();
            setUnreadCount(count);
        } catch {
            // Silently fail for unread count
        }
    }, []);

    useEffect(() => {
        void loadNotifications();
        void loadUnreadCount();
    }, [loadNotifications, loadUnreadCount]);

    const markAsRead = useCallback(async (id: string) => {
        await markNotificationAsRead(id);
        await loadNotifications();
        await loadUnreadCount();
    }, [loadNotifications, loadUnreadCount]);

    const markAllAsRead = useCallback(async () => {
        await markAllNotificationsAsRead();
        await loadNotifications();
        setUnreadCount(0);
    }, [loadNotifications]);

    const remove = useCallback(async (id: string) => {
        await deleteNotification(id);
        await loadNotifications();
        await loadUnreadCount();
    }, [loadNotifications, loadUnreadCount]);

    return {
        notifications,
        totalElements,
        totalPages,
        page,
        isLoading,
        error,
        unreadCount,
        setPage,
        markAsRead,
        markAllAsRead,
        remove,
        refresh: loadNotifications,
        refreshUnreadCount: loadUnreadCount,
    };
}

export interface UseNotificationPreferencesReturn {
    preferences: NotificationPreferences | null;
    isLoading: boolean;
    error: Error | null;
    update: (preferences: Partial<NotificationPreferences>) => Promise<void>;
    refresh: () => Promise<void>;
}

export function useNotificationPreferences(): UseNotificationPreferencesReturn {
    const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadPreferences = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchNotificationPreferences();
            setPreferences(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load preferences'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadPreferences();
    }, [loadPreferences]);

    const update = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
        const updated = await updateNotificationPreferences(newPreferences);
        setPreferences(updated);
    }, []);

    return {
        preferences,
        isLoading,
        error,
        update,
        refresh: loadPreferences,
    };
}
