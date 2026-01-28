/**
 * Usage tracking API service - Type-safe using openapi-fetch
 */
import {apiClient} from './apiClient';
import type {DailyUsage, MetricType, UsageHistoryResponse, UsageLimits, UsageSummary} from '../types';

/**
 * Fetch current billing period usage summary
 */
export async function fetchCurrentUsage(): Promise<UsageSummary> {
    const {data, error} = await apiClient.GET('/usage/current');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as UsageSummary;
}

/**
 * Fetch usage for a specific billing period
 */
export async function fetchUsageForPeriod(
    periodStart: string,
    periodEnd: string
): Promise<UsageSummary> {
    const {data, error} = await apiClient.GET('/usage/period', {
        params: {query: {periodStart, periodEnd}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as UsageSummary;
}

/**
 * Fetch usage history with pagination
 */
export async function fetchUsageHistory(
    startDate: string,
    endDate: string,
    page: number = 0,
    size: number = 20
): Promise<UsageHistoryResponse> {
    const {data, error} = await apiClient.GET('/usage/history', {
        params: {query: {startDate, endDate, page, size}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as UsageHistoryResponse;
}

/**
 * Fetch current usage limits and status
 */
export async function fetchUsageLimits(): Promise<UsageLimits> {
    const {data, error} = await apiClient.GET('/usage/limits');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as UsageLimits;
}

/**
 * Fetch daily usage trend for a metric
 */
export async function fetchUsageTrend(metricType: MetricType, days: number = 30): Promise<DailyUsage[]> {
    const {data, error} = await apiClient.GET('/usage/trend/{metricType}', {
        params: {path: {metricType}, query: {days}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as DailyUsage[];
}

/**
 * Calculate percentage of limit used
 */
export function calculatePercentage(current: number, limit: number): number {
    if (limit <= 0) {
        return 0; // Unlimited
    }
    return Math.min((current / limit) * 100, 100);
}

/**
 * Format large numbers for display
 */
export function formatUsageNumber(value: number): string {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
}

/**
 * Get status color based on usage percentage
 */
export function getUsageStatusColor(percentage: number): string {
    if (percentage >= 100) {
        return 'var(--color-danger)';
    }
    if (percentage >= 80) {
        return 'var(--color-warning)';
    }
    return 'var(--color-success)';
}

/**
 * Get status variant based on usage percentage
 */
export function getUsageStatusVariant(percentage: number): 'success' | 'warning' | 'danger' {
    if (percentage >= 100) {
        return 'danger';
    }
    if (percentage >= 80) {
        return 'warning';
    }
    return 'success';
}
