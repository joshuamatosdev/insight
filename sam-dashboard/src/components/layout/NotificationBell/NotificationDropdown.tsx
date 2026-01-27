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
      return 'var(--color-danger)';
    case 'SYSTEM':
      return 'var(--color-warning)';
    case 'INFO':
    default:
      return 'var(--color-info)';
  }
}

function NotificationItem({ notification, onMarkAsRead, style }: NotificationItemProps) {
  const itemStyles: CSSProperties = {
    display: 'flex',
    gap: '12px',
    padding: '12px 16px',
    cursor: 'pointer',
    backgroundColor: notification.read === false ? 'var(--color-gray-50)' : 'transparent',
    borderBottom: '1px solid var(--color-gray-200)',
    transition: 'background-color var(--transition-fast)',
    ...style,
  };

  const iconContainerStyles: CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: getTypeColor(notification.type),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-white)',
    fontWeight: 'var(--font-weight-bold)' as unknown as number,
    fontSize: 'var(--font-size-xs)',
    flexShrink: 0,
  };

  const contentStyles: CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const titleStyles: CSSProperties = {
    fontWeight: notification.read === false
      ? ('var(--font-weight-semibold)' as unknown as number)
      : ('var(--font-weight-normal)' as unknown as number),
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-gray-900)',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const messageStyles: CSSProperties = {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-gray-600)',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const timeStyles: CSSProperties = {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-gray-500)',
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
    backgroundColor: 'var(--color-white)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--color-gray-200)',
    overflow: 'hidden',
    zIndex: 'var(--z-dropdown)' as unknown as number,
    ...style,
  };

  const headerStyles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid var(--color-gray-200)',
    backgroundColor: 'var(--color-white)',
  };

  const titleStyles: CSSProperties = {
    fontWeight: 'var(--font-weight-semibold)' as unknown as number,
    fontSize: 'var(--font-size-base)',
    color: 'var(--color-gray-900)',
  };

  const markAllButtonStyles: CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'var(--color-primary)',
    fontSize: 'var(--font-size-sm)',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 'var(--radius-md)',
    transition: 'background-color var(--transition-fast)',
  };

  const listStyles: CSSProperties = {
    maxHeight: '400px',
    overflowY: 'auto',
  };

  const emptyStyles: CSSProperties = {
    padding: '32px 16px',
    textAlign: 'center',
    color: 'var(--color-gray-500)',
    fontSize: 'var(--font-size-sm)',
  };

  const loadingStyles: CSSProperties = {
    padding: '32px 16px',
    textAlign: 'center',
    color: 'var(--color-gray-500)',
    fontSize: 'var(--font-size-sm)',
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
