import { apiClient } from './apiClient';

export type WebhookEventType =
  | 'OPPORTUNITY_CREATED'
  | 'OPPORTUNITY_UPDATED'
  | 'OPPORTUNITY_DEADLINE'
  | 'CONTRACT_CREATED'
  | 'CONTRACT_UPDATED'
  | 'INVOICE_CREATED'
  | 'DELIVERABLE_DUE'
  | 'COMPLIANCE_EXPIRING'
  | 'USER_CREATED'
  | 'USER_UPDATED';

export type WebhookStatus = 'ACTIVE' | 'INACTIVE' | 'FAILED';

export interface Webhook {
  id: string;
  name: string;
  url: string;
  secret: string | null;
  events: WebhookEventType[];
  status: WebhookStatus;
  headers: Record<string, string> | null;
  retryCount: number;
  lastTriggeredAt: string | null;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  failureCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebhookRequest {
  name: string;
  url: string;
  secret?: string;
  events: WebhookEventType[];
  headers?: Record<string, string>;
}

export interface UpdateWebhookRequest {
  name?: string;
  url?: string;
  secret?: string;
  events?: WebhookEventType[];
  headers?: Record<string, string>;
  status?: WebhookStatus;
}

export interface WebhookTestResult {
  success: boolean;
  statusCode: number | null;
  responseTime: number;
  errorMessage: string | null;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEventType;
  payload: Record<string, unknown>;
  statusCode: number | null;
  responseBody: string | null;
  success: boolean;
  errorMessage: string | null;
  attemptCount: number;
  createdAt: string;
  deliveredAt: string | null;
}

const WEBHOOK_BASE = '/webhooks';

export async function fetchWebhooks(): Promise<Webhook[]> {
  const response = await apiClient.get(WEBHOOK_BASE);
  return response as Webhook[];
}

export async function fetchWebhook(id: string): Promise<Webhook> {
  const response = await apiClient.get(`${WEBHOOK_BASE}/${id}`);
  return response as Webhook;
}

export async function createWebhook(data: CreateWebhookRequest): Promise<Webhook> {
  const response = await apiClient.post(WEBHOOK_BASE, data);
  return response as Webhook;
}

export async function updateWebhook(id: string, data: UpdateWebhookRequest): Promise<Webhook> {
  const response = await apiClient.put(`${WEBHOOK_BASE}/${id}`, data);
  return response as Webhook;
}

export async function deleteWebhook(id: string): Promise<void> {
  await apiClient.delete(`${WEBHOOK_BASE}/${id}`);
}

export async function testWebhook(id: string): Promise<WebhookTestResult> {
  const response = await apiClient.post(`${WEBHOOK_BASE}/${id}/test`);
  return response as WebhookTestResult;
}

export async function fetchWebhookDeliveries(
  webhookId: string,
  page: number = 0,
  size: number = 20
): Promise<{ content: WebhookDelivery[]; totalElements: number }> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('size', size.toString());
  const response = await apiClient.get(
    `${WEBHOOK_BASE}/${webhookId}/deliveries?${params.toString()}`
  );
  return response as { content: WebhookDelivery[]; totalElements: number };
}

export async function retryWebhookDelivery(webhookId: string, deliveryId: string): Promise<void> {
  await apiClient.post(`${WEBHOOK_BASE}/${webhookId}/deliveries/${deliveryId}/retry`);
}

export async function toggleWebhookStatus(id: string): Promise<Webhook> {
  const response = await apiClient.patch(`${WEBHOOK_BASE}/${id}/toggle`);
  return response as Webhook;
}
