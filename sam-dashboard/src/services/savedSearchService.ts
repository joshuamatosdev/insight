/**
 * Saved Search Service - Type-safe using openapi-fetch
 */

import {apiClient} from './apiClient';

export interface SavedSearch {
    id: string;
    name: string;
    description: string | null;
    query: string;
    filters: SavedSearchFilters;
    isDefault: boolean;
    notifyOnNewResults: boolean;
    notifyFrequency: 'REALTIME' | 'DAILY' | 'WEEKLY' | 'NONE';
    lastExecutedAt: string | null;
    resultCount: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface SavedSearchFilters {
    keywords?: string[];
    naicsCodes?: string[];
    pscCodes?: string[];
    setAsides?: string[];
    states?: string[];
    agencies?: string[];
    opportunityTypes?: string[];
    postedDateRange?: {start: string; end: string};
    responseDateRange?: {start: string; end: string};
    valueRange?: {min: number; max: number};
}

export interface CreateSavedSearchRequest {
    name: string;
    description?: string;
    query: string;
    filters: SavedSearchFilters;
    isDefault?: boolean;
    notifyOnNewResults?: boolean;
    notifyFrequency?: 'REALTIME' | 'DAILY' | 'WEEKLY' | 'NONE';
}

export interface UpdateSavedSearchRequest {
    name?: string;
    description?: string;
    query?: string;
    filters?: SavedSearchFilters;
    isDefault?: boolean;
    notifyOnNewResults?: boolean;
    notifyFrequency?: 'REALTIME' | 'DAILY' | 'WEEKLY' | 'NONE';
}

export interface SearchResult {
    id: string;
    noticeId: string;
    title: string;
    agency: string;
    postedDate: string;
    responseDeadline: string | null;
    type: string;
    setAside: string | null;
    naicsCode: string | null;
    score: number;
}

interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export async function fetchSavedSearches(): Promise<SavedSearch[]> {
    const {data, error} = await apiClient.GET('/saved-searches');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as SavedSearch[];
}

export async function fetchSavedSearch(id: string): Promise<SavedSearch> {
    const {data, error} = await apiClient.GET('/saved-searches/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as SavedSearch;
}

export async function createSavedSearch(data: CreateSavedSearchRequest): Promise<SavedSearch> {
    const {data: responseData, error} = await apiClient.POST('/saved-searches', {
        body: data,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return responseData as SavedSearch;
}

export async function updateSavedSearch(
    id: string,
    data: UpdateSavedSearchRequest
): Promise<SavedSearch> {
    const {data: responseData, error} = await apiClient.PUT('/saved-searches/{id}', {
        params: {path: {id}},
        body: data,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return responseData as SavedSearch;
}

export async function deleteSavedSearch(id: string): Promise<void> {
    const {error} = await apiClient.DELETE('/saved-searches/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function executeSavedSearch(
    id: string,
    page: number = 0,
    size: number = 20
): Promise<Page<SearchResult>> {
    const {data, error} = await apiClient.GET('/saved-searches/{id}/execute', {
        params: {path: {id}, query: {page, size}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Page<SearchResult>;
}

export async function setDefaultSearch(id: string): Promise<SavedSearch> {
    const {data, error} = await apiClient.PATCH('/saved-searches/{id}/default', {
        params: {path: {id}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as SavedSearch;
}

export async function duplicateSavedSearch(id: string, newName: string): Promise<SavedSearch> {
    const {data, error} = await apiClient.POST('/saved-searches/{id}/duplicate', {
        params: {path: {id}},
        body: {name: newName},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as SavedSearch;
}
