import { CSSProperties } from 'react';

export type NotificationType = 'ALERT' | 'SYSTEM' | 'INFO';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationBellProps {
  className?: string;
  style?: CSSProperties;
}

export interface NotificationDropdownProps {
  isOpen: boolean;
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  isLoading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  className?: string;
  style?: CSSProperties;
}
