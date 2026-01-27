import { CSSProperties, useState, useEffect, useCallback } from 'react';
import { BellIcon } from '../../primitives/Icon';
import { NotificationDropdown } from './NotificationDropdown';
import { NotificationBellProps, Notification } from './NotificationBell.types';

const API_BASE = '/api';
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

export function NotificationBell({ className, style }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await authFetch(`${API_BASE}/v1/notifications/unread-count`);
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
      const response = await authFetch(`${API_BASE}/v1/notifications?page=0&size=20`);
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
      const response = await authFetch(`${API_BASE}/v1/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // Silently fail
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await authFetch(`${API_BASE}/v1/notifications/read-all`, {
        method: 'PUT',
      });
      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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

  const containerStyles: CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    ...style,
  };

  const buttonStyles: CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '0.375rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    transition: 'background-color 0.15s ease',
  };

  const badgeStyles: CSSProperties = {
    position: 'absolute',
    top: '2px',
    right: '2px',
    minWidth: '18px',
    height: '18px',
    borderRadius: '9999px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
  };

  return (
    <div className={className} style={containerStyles}>
      <button
        type="button"
        style={buttonStyles}
        onClick={handleToggle}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <BellIcon size="md" color="inherit" />
        {unreadCount > 0 ? (
          <span style={badgeStyles} aria-hidden="true">
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
