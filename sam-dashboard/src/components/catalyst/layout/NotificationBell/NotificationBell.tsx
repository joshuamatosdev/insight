import {useCallback, useEffect, useState} from 'react';
import clsx from 'clsx';
import {BellIcon} from '../../primitives/Icon';
import {NotificationDropdown} from './NotificationDropdown';
import {Notification, NotificationBellProps} from './NotificationBell.types';

const AUTH_STORAGE_KEY = 'sam_auth_state';

function getAuthToken(): string | null {
    try {
        const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored === null) {
            return null;
        }
        const parsed = JSON.parse(stored);
        return parsed.token ?? null;
    } catch {
        return null;
    }
}

function getAuthHeaders(): HeadersInit {
    const token = getAuthToken();
    if (token !== null) {
        return {
            Authorization: `Bearer ${token}`,
        };
    }
    return {};
}

async function authFetch(url: string, options?: RequestInit): Promise<Response> {
    const headers = {
        ...getAuthHeaders(),
        ...options?.headers,
    };

    return fetch(url, {
        ...options,
        headers,
    });
}

export function NotificationBell({className, style}: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await authFetch(`${API_BASE}/notifications/unread-count`);
            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.count);
            }
        } catch {
            // Silently fail - notifications are not critical
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await authFetch(`${API_BASE}/notifications?page=0&size=20`);
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.content ?? []);
            }
        } catch {
            // Silently fail
        } finally {
            setIsLoading(false);
        }
    }, []);

    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            const response = await authFetch(`${API_BASE}/notifications/${notificationId}/read`, {
                method: 'PUT',
            });
            if (response.ok) {
                setNotifications((prev) =>
                    prev.map((n) => (n.id === notificationId ? {...n, read: true} : n))
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        } catch {
            // Silently fail
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            const response = await authFetch(`${API_BASE}/notifications/read-all`, {
                method: 'PUT',
            });
            if (response.ok) {
                setNotifications((prev) => prev.map((n) => ({...n, read: true})));
                setUnreadCount(0);
            }
        } catch {
            // Silently fail
        }
    }, []);

    useEffect(() => {
        fetchUnreadCount();
        // Poll for unread count every 60 seconds
        const interval = setInterval(fetchUnreadCount, 60000);
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    const handleToggle = () => {
        setIsOpen((prev) => prev === false);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <div className={clsx('relative inline-block', className)} style={style}>
            <button
                type="button"
                className="bg-transparent border-none cursor-pointer p-2 rounded-md flex items-center justify-center relative transition-colors duration-150 hover:bg-zinc-100"
                onClick={handleToggle}
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                aria-expanded={isOpen}
                aria-haspopup="true"
                data-testid="notification-bell"
            >
                <BellIcon size="md" color="inherit"/>
                {unreadCount > 0 ? (
                    <span
                        className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center px-1"
                        aria-hidden="true"
                        data-testid="unread-count"
                    >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
                ) : null}
            </button>
            <NotificationDropdown
                isOpen={isOpen}
                notifications={notifications}
                onClose={handleClose}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                isLoading={isLoading}
            />
        </div>
    );
}

export default NotificationBell;
