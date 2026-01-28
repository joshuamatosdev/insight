/**
 * Webhook Service - Type-safe using openapi-fetch
 */

import {apiClient} from './apiClient';

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

interface WebhookDeliveryPage {
    content: WebhookDelivery[];
    totalElements: number;
}

export async function fetchWebhooks(): Promise<Webhook[]> {
    const {data, error} = await apiClient.GET('/webhooks');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Webhook[];
}

export async function fetchWebhook(id: string): Promise<Webhook> {
    const {data, error} = await apiClient.GET('/webhooks/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Webhook;
}

export async function createWebhook(data: CreateWebhookRequest): Promise<Webhook> {
    const {data: responseData, error} = await apiClient.POST('/webhooks', {
        body: data,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return responseData as Webhook;
}

export async function updateWebhook(id: string, data: UpdateWebhookRequest): Promise<Webhook> {
    const {data: responseData, error} = await apiClient.PUT('/webhooks/{id}', {
        params: {path: {id}},
        body: data,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return responseData as Webhook;
}

export async function deleteWebhook(id: string): Promise<void> {
    const {error} = await apiClient.DELETE('/webhooks/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function testWebhook(id: string): Promise<WebhookTestResult> {
    const {data, error} = await apiClient.POST('/webhooks/{id}/test', {
        params: {path: {id}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as WebhookTestResult;
}

export async function fetchWebhookDeliveries(
    webhookId: string,
    page: number = 0,
    size: number = 20
): Promise<WebhookDeliveryPage> {
    const {data, error} = await apiClient.GET('/webhooks/{id}/deliveries', {
        params: {path: {id: webhookId}, query: {page, size}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as WebhookDeliveryPage;
}

export async function retryWebhookDelivery(webhookId: string, deliveryId: string): Promise<void> {
    const {error} = await apiClient.POST(
        '/webhooks/{webhookId}/deliveries/{deliveryId}/retry',
        {
            params: {path: {webhookId, deliveryId}},
            body: {},
        }
    );

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function toggleWebhookStatus(id: string): Promise<Webhook> {
    const {data, error} = await apiClient.PATCH('/webhooks/{id}/toggle', {
        params: {path: {id}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Webhook;
}
