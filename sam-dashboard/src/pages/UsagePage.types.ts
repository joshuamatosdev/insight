/**
 * Types for UsagePage component
 */
import type {MetricType, SubscriptionTier} from '../types';

/**
 * Props for the UsagePage component
 */
export interface UsagePageProps {
  /** Optional tenant ID for admin view */
  tenantId?: string;
}

/**
 * State for the usage page
 */
export interface UsagePageState {
  isLoading: boolean;
  error: string | null;
  selectedMetric: MetricType;
  trendDays: number;
}

/**
 * Props for the usage metric card
 */
export interface UsageMetricCardProps {
  metricType: MetricType;
  current: number;
  limit: number;
  percentageUsed: number;
  warning: boolean;
  exceeded: boolean;
  onClick?: () => void;
  isSelected?: boolean;
}

/**
 * Props for the usage trend chart
 */
export interface UsageTrendChartProps {
  metricType: MetricType;
  data: Array<{
    date: string;
    total: number;
  }>;
  isLoading: boolean;
}

/**
 * Props for the subscription tier badge
 */
export interface SubscriptionTierBadgeProps {
  tier: SubscriptionTier;
}

/**
 * Props for the limit warning banner
 */
export interface LimitWarningBannerProps {
  warnings: Array<{
    metricType: MetricType;
    percentageUsed: number;
    exceeded: boolean;
  }>;
}
