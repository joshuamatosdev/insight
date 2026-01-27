import { CSSProperties, useEffect, useRef } from 'react';
import {
  NotificationDropdownProps,
  NotificationItemProps,
  Notification,
} from './NotificationBell.types';

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'Just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  return date.toLocaleDateString();
}

function getTypeIcon(type: Notification['type']): string {
  switch (type) {
    case 'ALERT':
      return '!';
    case 'SYSTEM':
      return 'S';
    case 'INFO':
    default:
      return 'i';
  }
}

function getTypeColor(type: Notification['type']): string {
  switch (type) {
    case 'ALERT':
      return '#ef4444';
    case 'SYSTEM':
      return '#f59e0b';
    case 'INFO':
    default:
      return '#3b82f6';
  }
}

function NotificationItem({ notification, onMarkAsRead, style }: NotificationItemProps) {
  const itemStyles: CSSProperties = {
    display: 'flex',
    gap: '12px',
    padding: '12px 16px',
    cursor: 'pointer',
    backgroundColor: notification.read === false ? '#fafafa' : 'transparent',
    borderBottom: '1px solid #e4e4e7',
    transition: 'background-color 0.15s ease',
    ...style,
  };

  const iconContainerStyles: CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: '9999px',
    backgroundColor: getTypeColor(notification.type),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '0.75rem',
    flexShrink: 0,
  };

  const contentStyles: CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const titleStyles: CSSProperties = {
    fontWeight: notification.read === false
      ? (600)
      : (400),
    fontSize: '0.875rem',
    color: '#18181b',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const messageStyles: CSSProperties = {
    fontSize: '0.75rem',
    color: '#52525b',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const timeStyles: CSSProperties = {
    fontSize: '0.75rem',
    color: '#71717a',
  };

  const handleClick = () => {
    if (notification.read === false) {
      onMarkAsRead(notification.id);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      style={itemStyles}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`${notification.read === false ? 'Unread' : 'Read'} notification: ${notification.title}`}
    >
      <div style={iconContainerStyles}>{getTypeIcon(notification.type)}</div>
      <div style={contentStyles}>
        <div style={titleStyles}>{notification.title}</div>
        {notification.message !== null && notification.message.length > 0 ? (
          <div style={messageStyles}>{notification.message}</div>
        ) : null}
        <div style={timeStyles}>{formatRelativeTime(notification.createdAt)}</div>
      </div>
    </div>
  );
}

export function NotificationDropdown({
  isOpen,
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  isLoading = false,
  style,
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (dropdownRef.current !== null && dropdownRef.current.contains(target) === false) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (isOpen === false) {
    return null;
  }

  const dropdownStyles: CSSProperties = {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    width: '360px',
    maxHeight: '480px',
    backgroundColor: '#ffffff',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e4e4e7',
    overflow: 'hidden',
    zIndex: '50' as unknown as number,
    ...style,
  };

  const headerStyles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid #e4e4e7',
    backgroundColor: '#ffffff',
  };

  const titleStyles: CSSProperties = {
    fontWeight: 600,
    fontSize: '1rem',
    color: '#18181b',
  };

  const markAllButtonStyles: CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    fontSize: '0.875rem',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '0.375rem',
    transition: 'background-color 0.15s ease',
  };

  const listStyles: CSSProperties = {
    maxHeight: '400px',
    overflowY: 'auto',
  };

  const emptyStyles: CSSProperties = {
    padding: '32px 16px',
    textAlign: 'center',
    color: '#71717a',
    fontSize: '0.875rem',
  };

  const loadingStyles: CSSProperties = {
    padding: '32px 16px',
    textAlign: 'center',
    color: '#71717a',
    fontSize: '0.875rem',
  };

  const unreadCount = notifications.filter((n) => n.read === false).length;

  return (
    <div ref={dropdownRef} style={dropdownStyles} role="menu" aria-label="Notifications">
      <div style={headerStyles}>
        <span style={titleStyles}>Notifications</span>
        {unreadCount > 0 ? (
          <button
            type="button"
            style={markAllButtonStyles}
            onClick={onMarkAllAsRead}
            aria-label="Mark all notifications as read"
          >
            Mark all as read
          </button>
        ) : null}
      </div>
      <div style={listStyles}>
        {isLoading ? (
          <div style={loadingStyles}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div style={emptyStyles}>No notifications</div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationDropdown;
