import {useEffect, useRef} from 'react';
import clsx from 'clsx';
import {Notification, NotificationDropdownProps, NotificationItemProps,} from './NotificationBell.types';

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

/** Map notification type to Tailwind background class */
function getTypeColorClass(type: Notification['type']): string {
    switch (type) {
        case 'ALERT':
            return 'bg-red-500';
        case 'SYSTEM':
            return 'bg-amber-500';
        case 'INFO':
        default:
            return 'bg-blue-500';
    }
}

function NotificationItem({notification, onMarkAsRead, style}: NotificationItemProps) {
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
            className={clsx(
                'flex gap-3 px-4 py-3 cursor-pointer border-b border-zinc-200 transition-colors duration-150 hover:bg-zinc-100',
                notification.read === false ? 'bg-zinc-50' : 'bg-transparent'
            )}
            style={style}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            aria-label={`${notification.read === false ? 'Unread' : 'Read'} notification: ${notification.title}`}
            data-testid="notification-item"
        >
            <div
                className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0',
                    getTypeColorClass(notification.type)
                )}
            >
                {getTypeIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
                <div
                    className={clsx(
                        'text-sm text-zinc-900 mb-1 overflow-hidden text-ellipsis whitespace-nowrap',
                        notification.read === false ? 'font-semibold' : 'font-normal'
                    )}
                >
                    {notification.title}
                </div>
                {notification.message !== null && notification.message.length > 0 ? (
                    <div className="text-xs text-zinc-600 mb-1 overflow-hidden text-ellipsis whitespace-nowrap">
                        {notification.message}
                    </div>
                ) : null}
                <div className="text-xs text-zinc-500">{formatRelativeTime(notification.createdAt)}</div>
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

    const unreadCount = notifications.filter((n) => n.read === false).length;

    return (
        <div
            ref={dropdownRef}
            className="absolute top-full right-0 mt-2 w-[360px] max-h-[480px] bg-white rounded-lg shadow-lg border border-zinc-200 overflow-hidden z-50"
            style={style}
            role="menu"
            aria-label="Notifications"
            data-testid="notification-panel"
        >
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-white">
                <span className="font-semibold text-base text-zinc-900">Notifications</span>
                {unreadCount > 0 ? (
                    <button
                        type="button"
                        className="bg-transparent border-none text-blue-600 text-sm cursor-pointer px-2 py-1 rounded-md transition-colors duration-150 hover:bg-blue-50"
                        onClick={onMarkAllAsRead}
                        aria-label="Mark all notifications as read"
                    >
                        Mark all as read
                    </button>
                ) : null}
            </div>
            <div className="max-h-[400px] overflow-y-auto">
                {isLoading ? (
                    <div className="px-4 py-8 text-center text-zinc-500 text-sm">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-zinc-500 text-sm">No notifications</div>
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
