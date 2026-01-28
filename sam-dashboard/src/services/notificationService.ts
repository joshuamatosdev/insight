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

const NOTIFICATION_BASE = '/notifications';

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
  const response = await apiClient.get<Page<Notification>>(
    `${NOTIFICATION_BASE}?${params.toString()}`
  );
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function fetchNotification(id: string): Promise<Notification> {
  const response = await apiClient.get<Notification>(`${NOTIFICATION_BASE}/${id}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function markAsRead(id: string): Promise<Notification> {
  const response = await apiClient.patch<Notification, Record<string, never>>(
    `${NOTIFICATION_BASE}/${id}/read`,
    {}
  );
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function markAllAsRead(): Promise<void> {
  const response = await apiClient.post<void, Record<string, never>>(
    `${NOTIFICATION_BASE}/read-all`,
    {}
  );
  if (response.success === false) {
    throw new Error(response.error.message);
  }
}

export async function deleteNotification(id: string): Promise<void> {
  const response = await apiClient.delete<void>(`${NOTIFICATION_BASE}/${id}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
}

export async function deleteAllRead(): Promise<void> {
  const response = await apiClient.delete<void>(`${NOTIFICATION_BASE}/read`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
}

export async function getUnreadCount(): Promise<number> {
  const response = await apiClient.get<{ count: number }>(`${NOTIFICATION_BASE}/unread-count`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data.count;
}

export async function fetchPreferences(): Promise<NotificationPreferences> {
  const response = await apiClient.get<NotificationPreferences>(`${NOTIFICATION_BASE}/preferences`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function updatePreferences(
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const response = await apiClient.put<NotificationPreferences, Partial<NotificationPreferences>>(
    `${NOTIFICATION_BASE}/preferences`,
    preferences
  );
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}
