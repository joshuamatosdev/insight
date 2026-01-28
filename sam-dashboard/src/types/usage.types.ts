/**
 * Types for usage tracking and metered billing
 */

/**
 * Metric types tracked for billing
 */
export type MetricType =
    | 'API_CALLS'
    | 'STORAGE_GB'
    | 'USERS'
    | 'OPPORTUNITIES_VIEWED'
    | 'DOCUMENTS_UPLOADED'
    | 'REPORTS_GENERATED'
    | 'ALERTS_SENT'
    | 'SEARCH_QUERIES';

/**
 * Subscription tier types
 */
export type SubscriptionTier = 'FREE' | 'PRO' | 'ENTERPRISE';

/**
 * Usage summary for a billing period
 */
export interface UsageSummary {
    tenantId: string;
    periodStart: string;
    periodEnd: string;
    metrics: Record<MetricType, number>;
    subscriptionTier: SubscriptionTier;
}

/**
 * Individual usage record
 */
export interface UsageRecord {
    id: string;
    metricType: MetricType;
    quantity: number;
    recordedAt: string;
    billingPeriodStart: string;
    billingPeriodEnd: string;
    description: string | null;
}

/**
 * Status of a single usage limit
 */
export interface UsageLimitStatus {
    metricType: MetricType;
    current: number;
    limit: number;
    percentageUsed: number;
    warning: boolean;
    exceeded: boolean;
}

/**
 * Usage limits response
 */
export interface UsageLimits {
    tenantId: string;
    subscriptionTier: SubscriptionTier;
    limits: Record<MetricType, UsageLimitStatus>;
    hasWarnings: boolean;
    hasExceeded: boolean;
}

/**
 * Daily usage data point for trends
 */
export interface DailyUsage {
    date: string;
    total: number;
}

/**
 * Paginated usage history response
 */
export interface UsageHistoryResponse {
    content: UsageRecord[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

/**
 * Human-readable labels for metric types
 */
export const METRIC_LABELS: Record<MetricType, string> = {
    API_CALLS: 'API Calls',
    STORAGE_GB: 'Storage (GB)',
    USERS: 'Active Users',
    OPPORTUNITIES_VIEWED: 'Opportunities Viewed',
    DOCUMENTS_UPLOADED: 'Documents Uploaded',
    REPORTS_GENERATED: 'Reports Generated',
    ALERTS_SENT: 'Alerts Sent',
    SEARCH_QUERIES: 'Search Queries',
};

/**
 * Icons for metric types (for use with icon components)
 */
export const METRIC_ICONS: Record<MetricType, string> = {
    API_CALLS: 'server',
    STORAGE_GB: 'database',
    USERS: 'users',
    OPPORTUNITIES_VIEWED: 'eye',
    DOCUMENTS_UPLOADED: 'file',
    REPORTS_GENERATED: 'chart',
    ALERTS_SENT: 'bell',
    SEARCH_QUERIES: 'search',
};

/**
 * Colors for metric types
 */
export const METRIC_COLORS: Record<MetricType, string> = {
    API_CALLS: 'var(--color-primary)',
    STORAGE_GB: 'var(--color-warning)',
    USERS: 'var(--color-success)',
    OPPORTUNITIES_VIEWED: 'var(--color-info)',
    DOCUMENTS_UPLOADED: 'var(--color-secondary)',
    REPORTS_GENERATED: 'var(--color-accent)',
    ALERTS_SENT: 'var(--color-danger)',
    SEARCH_QUERIES: 'var(--color-primary-light)',
};

/**
 * List of all metric types for iteration
 */
export const ALL_METRIC_TYPES: MetricType[] = [
    'API_CALLS',
    'STORAGE_GB',
    'USERS',
    'OPPORTUNITIES_VIEWED',
    'DOCUMENTS_UPLOADED',
    'REPORTS_GENERATED',
    'ALERTS_SENT',
    'SEARCH_QUERIES',
];
