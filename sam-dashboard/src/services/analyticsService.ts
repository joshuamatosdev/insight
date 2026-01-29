/**
 * Analytics Service - API calls for Analytics Dashboard
 * Backend path: /api/analytics/*
 */

import type {
    ActivityItem,
    AnalyticsEvent,
    DashboardStats,
    TopPerformer,
    TrackEventRequest,
} from '../types/analytics.types';

const ANALYTICS_BASE = '/api/analytics';
const AUTH_STORAGE_KEY = 'sam_auth_state';

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
    try {
        const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored === null) {
            return null;
        }
        const parsed = JSON.parse(stored);
        return parsed.token ?? null;
    } catch {
        return null;
    }
}

/**
 * Authenticated fetch wrapper
 */
async function authFetch(url: string, options?: RequestInit): Promise<Response> {
    const token = getAuthToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options?.headers,
    };
    if (token !== null) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(url, {...options, headers});
}

/**
 * Fetch dashboard statistics
 * GET /api/analytics/dashboard
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
    const response = await authFetch(`${ANALYTICS_BASE}/dashboard`);

    if (response.ok === false) {
        throw new Error(`Failed to fetch dashboard stats: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Fetch activity feed
 * GET /api/analytics/activity?limit=20
 */
export async function fetchActivityFeed(limit: number = 20): Promise<ActivityItem[]> {
    const response = await authFetch(`${ANALYTICS_BASE}/activity?limit=${limit}`);

    if (response.ok === false) {
        throw new Error(`Failed to fetch activity feed: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Fetch top performers
 * GET /api/analytics/top-performers?limit=10
 */
export async function fetchTopPerformers(limit: number = 10): Promise<TopPerformer[]> {
    const response = await authFetch(`${ANALYTICS_BASE}/top-performers?limit=${limit}`);

    if (response.ok === false) {
        throw new Error(`Failed to fetch top performers: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Track an analytics event
 * POST /api/analytics/track
 */
export async function trackEvent(request: TrackEventRequest): Promise<AnalyticsEvent> {
    const response = await authFetch(`${ANALYTICS_BASE}/track`, {
        method: 'POST',
        body: JSON.stringify(request),
    });

    if (response.ok === false) {
        throw new Error(`Failed to track event: ${response.statusText}`);
    }

    return response.json();
}
