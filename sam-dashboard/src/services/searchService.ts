/**
 * Enhanced search service with autocomplete and faceted search
 */

const API_BASE = '/api/search';

export interface SearchSuggestion {
    text: string;
    type: 'opportunity' | 'agency' | 'naics' | 'keyword';
    matchCount: number;
    highlight: string;
}

export interface SearchSuggestionResponse {
    query: string;
    suggestions: SearchSuggestion[];
    recentSearches: string[];
}

export interface FacetBucket {
    key: string;
    label: string;
    count: number;
}

export interface FacetedSearchRequest {
    query?: string;
    naicsCodes?: string[];
    setAsideCodes?: string[];
    types?: string[];
    agencies?: string[];
    responseDateFrom?: string;
    responseDateTo?: string;
    valueMin?: number;
    valueMax?: number;
    active?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page: number;
    size: number;
}

export interface FacetedSearchResponse<T> {
    opportunities: {
        content: T[];
        totalElements: number;
        totalPages: number;
        number: number;
        size: number;
    };
    facets: Record<string, FacetBucket[]>;
    totalCount: number;
    queryTimeMs: number;
}

/**
 * Get search suggestions for autocomplete
 */
export async function fetchSearchSuggestions(
    token: string,
    query: string,
    limit = 10
): Promise<SearchSuggestionResponse> {
    const params = new URLSearchParams({q: query, limit: String(limit)});
    const response = await fetch(`${API_BASE}/suggestions?${params}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.ok === false) {
        throw new Error('Failed to fetch suggestions');
    }

    return response.json();
}

/**
 * Perform faceted search
 */
export async function facetedSearch<T>(
    token: string,
    request: FacetedSearchRequest
): Promise<FacetedSearchResponse<T>> {
    const response = await fetch(`${API_BASE}/faceted`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });

    if (response.ok === false) {
        throw new Error('Search failed');
    }

    return response.json();
}

/**
 * Debounced search suggestions hook helper
 */
export function createSuggestionsDebouncer(delayMs = 300) {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (callback: () => void) => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(callback, delayMs);
    };
}
