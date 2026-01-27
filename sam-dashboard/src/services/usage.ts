/**
 * Usage tracking API service
 */
import { apiClient } from './apiClient';
import type {
  UsageSummary,
  UsageLimits,
  DailyUsage,
  UsageHistoryResponse,
  MetricType,
} from '../types';

/**
 * Fetch current billing period usage summary
 */
export async function fetchCurrentUsage(): Promise<UsageSummary> {
  const result = await apiClient.get<UsageSummary>('/usage/current');

  if (result.success === false) {
    throw new Error(result.error.message);
  }

  return result.data;
}

/**
 * Fetch usage for a specific billing period
 */
export async function fetchUsageForPeriod(
  periodStart: string,
  periodEnd: string
): Promise<UsageSummary> {
  const result = await apiClient.get<UsageSummary>('/usage/period', {
    params: { periodStart, periodEnd },
  });

  if (result.success === false) {
    throw new Error(result.error.message);
  }

  return result.data;
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
  const result = await apiClient.get<UsageHistoryResponse>('/usage/history', {
    params: { startDate, endDate, page, size },
  });

  if (result.success === false) {
    throw new Error(result.error.message);
  }

  return result.data;
}

/**
 * Fetch current usage limits and status
 */
export async function fetchUsageLimits(): Promise<UsageLimits> {
  const result = await apiClient.get<UsageLimits>('/usage/limits');

  if (result.success === false) {
    throw new Error(result.error.message);
  }

  return result.data;
}

/**
 * Fetch daily usage trend for a metric
 */
export async function fetchUsageTrend(
  metricType: MetricType,
  days: number = 30
): Promise<DailyUsage[]> {
  const result = await apiClient.get<DailyUsage[]>(`/usage/trend/${metricType}`, {
    params: { days },
  });

  if (result.success === false) {
    throw new Error(result.error.message);
  }

  return result.data;
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
export function getUsageStatusVariant(
  percentage: number
): 'success' | 'warning' | 'danger' {
  if (percentage >= 100) {
    return 'danger';
  }
  if (percentage >= 80) {
    return 'warning';
  }
  return 'success';
}
