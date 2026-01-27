import { apiClient } from './apiClient';

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

const NOTIFICATION_BASE = '/api/notifications';

export async function fetchNotifications(
  page: number = 0,
  size: number = 20,
  unreadOnly: boolean = false
): Promise<Page<Notification>> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('size', size.toString());
  if (unreadOnly === true) {
    params.set('unreadOnly', 'true');
  }
  const response = await apiClient.get(`${NOTIFICATION_BASE}?${params.toString()}`);
  return response as Page<Notification>;
}

export async function fetchNotification(id: string): Promise<Notification> {
  const response = await apiClient.get(`${NOTIFICATION_BASE}/${id}`);
  return response as Notification;
}

export async function markAsRead(id: string): Promise<Notification> {
  const response = await apiClient.patch(`${NOTIFICATION_BASE}/${id}/read`);
  return response as Notification;
}

export async function markAllAsRead(): Promise<void> {
  await apiClient.post(`${NOTIFICATION_BASE}/read-all`);
}

export async function deleteNotification(id: string): Promise<void> {
  await apiClient.delete(`${NOTIFICATION_BASE}/${id}`);
}

export async function deleteAllRead(): Promise<void> {
  await apiClient.delete(`${NOTIFICATION_BASE}/read`);
}

export async function getUnreadCount(): Promise<number> {
  const response = await apiClient.get(`${NOTIFICATION_BASE}/unread-count`);
  return (response as { count: number }).count;
}

export async function fetchPreferences(): Promise<NotificationPreferences> {
  const response = await apiClient.get(`${NOTIFICATION_BASE}/preferences`);
  return response as NotificationPreferences;
}

export async function updatePreferences(
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const response = await apiClient.put(`${NOTIFICATION_BASE}/preferences`, preferences);
  return response as NotificationPreferences;
}
