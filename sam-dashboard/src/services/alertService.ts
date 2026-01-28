/**
 * Alert Service - Type-safe using openapi-fetch
 */

import {apiClient} from './apiClient';
import type {
    CreateAlertRequest,
    OpportunityAlert,
    PaginatedResponse,
    UpdateAlertRequest,
} from '../pages/AlertsPage.types';

// ==================== Opportunity Alerts API ====================

export async function fetchOpportunityAlerts(
    page: number = 0,
    size: number = 20
): Promise<PaginatedResponse<OpportunityAlert>> {
    const {data, error} = await apiClient.GET('/opportunity-alerts', {
        params: {query: {page, size}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as PaginatedResponse<OpportunityAlert>;
}

export async function fetchOpportunityAlert(id: string): Promise<OpportunityAlert> {
    const {data, error} = await apiClient.GET('/opportunity-alerts/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as OpportunityAlert;
}

export async function createOpportunityAlert(
    request: CreateAlertRequest
): Promise<OpportunityAlert> {
    const {data, error} = await apiClient.POST('/opportunity-alerts', {
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as OpportunityAlert;
}

export async function updateOpportunityAlert(
    id: string,
    request: UpdateAlertRequest
): Promise<OpportunityAlert> {
    const {data, error} = await apiClient.PUT('/opportunity-alerts/{id}', {
        params: {path: {id}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as OpportunityAlert;
}

export async function deleteOpportunityAlert(id: string): Promise<void> {
    const {error} = await apiClient.DELETE('/opportunity-alerts/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function toggleOpportunityAlert(id: string): Promise<OpportunityAlert> {
    const {data, error} = await apiClient.POST('/opportunity-alerts/{id}/toggle', {
        params: {path: {id}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as OpportunityAlert;
}
