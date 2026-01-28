/**
 * Opportunity Service - Type-safe using openapi-fetch
 */

import {apiClient} from './apiClient';
import type {Opportunity} from '../components/domain/opportunity';

// ==================== Opportunities API ====================

export async function fetchOpportunities(): Promise<Opportunity[]> {
    const {data, error} = await apiClient.GET('/opportunities');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    // Handle both array and paginated response formats
    if (Array.isArray(data)) {
        return data as Opportunity[];
    }

    // Handle paginated response { content: [], totalElements: N }
    if (data !== null && typeof data === 'object' && 'content' in data && Array.isArray(data.content)) {
        return data.content as Opportunity[];
    }

    // Fallback to empty array if format is unexpected
    console.warn('Unexpected opportunities API response format:', data);
    return [];
}

export async function fetchSbirOpportunities(phase?: string): Promise<Opportunity[]> {
    const queryParams: Record<string, string> = {};
    if (phase !== undefined) {
        queryParams.phase = phase;
    }

    const {data, error} = await apiClient.GET('/opportunities/sbir', {
        params: {query: queryParams},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    // Handle both array and paginated response formats
    if (Array.isArray(data)) {
        return data as Opportunity[];
    }

    // Handle paginated response { content: [], totalElements: N }
    if (data !== null && typeof data === 'object' && 'content' in data && Array.isArray(data.content)) {
        return data.content as Opportunity[];
    }

    // Fallback to empty array if format is unexpected
    console.warn('Unexpected SBIR opportunities API response format:', data);
    return [];
}

// ==================== Ingest API ====================

export async function triggerIngest(): Promise<void> {
    const {error} = await apiClient.POST('/ingest', {
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function triggerFullIngest(): Promise<void> {
    const {error} = await apiClient.POST('/ingest/full', {
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function triggerSbirIngest(): Promise<void> {
    const {error} = await apiClient.POST('/ingest/sbir', {
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}
