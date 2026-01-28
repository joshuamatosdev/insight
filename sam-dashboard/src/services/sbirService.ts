/**
 * SBIR Service - Type-safe using openapi-fetch
 */

import {apiClient} from './apiClient';
import type {SbirAward, SbirStats} from '../components/domain/sbir';

// ==================== SBIR.gov API ====================

export async function fetchSbirAwards(
    agency?: string,
    phase?: string
): Promise<SbirAward[]> {
    const queryParams: Record<string, string> = {};
    if (agency !== undefined) {
        queryParams.agency = agency;
    }
    if (phase !== undefined) {
        queryParams.phase = phase;
    }

    const {data, error} = await apiClient.GET('/sbir/awards', {
        params: {query: queryParams},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as SbirAward[];
}

export async function fetchSbirStats(): Promise<SbirStats> {
    const {data, error} = await apiClient.GET('/sbir/stats');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as SbirStats;
}

export async function searchSbirAwards(keyword: string): Promise<SbirAward[]> {
    const {data, error} = await apiClient.GET('/sbir/awards/search', {
        params: {query: {q: keyword}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as SbirAward[];
}

export async function triggerSbirGovIngest(): Promise<void> {
    const {error} = await apiClient.POST('/sbir/ingest', {
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function fetchSbirAgencies(): Promise<Record<string, number>> {
    const {data, error} = await apiClient.GET('/sbir/agencies');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Record<string, number>;
}
