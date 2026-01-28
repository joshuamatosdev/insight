/**
 * Analytics types for the SAMGov Contract Intelligence Platform
 */

// ==================== Event Types ====================

/**
 * Event types that can be tracked
 */
export type EventType =
  // Page views
  | 'PAGE_VIEW'
  // Search & Discovery
  | 'SEARCH_PERFORMED'
  | 'FILTER_APPLIED'
  | 'SORT_CHANGED'
  // Opportunity interactions
  | 'OPPORTUNITY_VIEWED'
  | 'OPPORTUNITY_SAVED'
  | 'OPPORTUNITY_UNSAVED'
  | 'OPPORTUNITY_EXPORTED'
  | 'OPPORTUNITY_SHARED'
  // Pipeline actions
  | 'PIPELINE_OPPORTUNITY_ADDED'
  | 'PIPELINE_OPPORTUNITY_MOVED'
  | 'PIPELINE_OPPORTUNITY_REMOVED'
  | 'BID_DECISION_MADE'
  // Contract actions
  | 'CONTRACT_VIEWED'
  | 'CONTRACT_CREATED'
  | 'CONTRACT_UPDATED'
  | 'DELIVERABLE_COMPLETED'
  | 'INVOICE_SUBMITTED'
  // Document actions
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_DOWNLOADED'
  | 'DOCUMENT_VIEWED'
  // User actions
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'PROFILE_UPDATED'
  | 'SETTINGS_CHANGED'
  // Dashboard interactions
  | 'DASHBOARD_VIEWED'
  | 'REPORT_GENERATED'
  | 'REPORT_EXPORTED'
  | 'WIDGET_INTERACTED'
  // Alert interactions
  | 'ALERT_CREATED'
  | 'ALERT_TRIGGERED'
  | 'ALERT_DISMISSED'
  // Custom events
  | 'CUSTOM';

/**
 * Entity types that can be associated with analytics events
 */
export type AnalyticsEntityType =
  | 'OPPORTUNITY'
  | 'CONTRACT'
  | 'PIPELINE'
  | 'PIPELINE_OPPORTUNITY'
  | 'DOCUMENT'
  | 'INVOICE'
  | 'REPORT'
  | 'DASHBOARD'
  | 'ALERT'
  | 'SEARCH'
  | 'USER'
  | 'COMPANY_PROFILE';

/**
 * Analytics event from the backend
 */
export interface AnalyticsEvent {
  id: string;
  tenantId: string;
  userId: string | null;
  eventType: EventType;
  entityType: AnalyticsEntityType | null;
  entityId: string | null;
  properties: string | null;
  timestamp: string;
  sessionId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

// ==================== Metric Types ====================

/**
 * Available metric names for aggregation
 */
export type MetricName =
  // Opportunity metrics
  | 'OPPORTUNITIES_VIEWED'
  | 'OPPORTUNITIES_SAVED'
  | 'OPPORTUNITIES_IN_PIPELINE'
  | 'OPPORTUNITIES_WON'
  | 'OPPORTUNITIES_LOST'
  // Pipeline metrics
  | 'PIPELINE_VALUE_TOTAL'
  | 'PIPELINE_VALUE_WEIGHTED'
  | 'PIPELINE_CONVERSION_RATE'
  | 'AVERAGE_DEAL_SIZE'
  | 'AVERAGE_TIME_IN_STAGE'
  // Contract metrics
  | 'ACTIVE_CONTRACTS'
  | 'CONTRACT_VALUE_TOTAL'
  | 'INVOICES_SUBMITTED'
  | 'INVOICES_PAID'
  | 'REVENUE_RECOGNIZED'
  | 'OUTSTANDING_RECEIVABLES'
  // Engagement metrics
  | 'PAGE_VIEWS'
  | 'SEARCHES_PERFORMED'
  | 'DOCUMENTS_DOWNLOADED'
  | 'REPORTS_GENERATED'
  | 'ACTIVE_USERS'
  | 'SESSION_DURATION_AVG'
  // Win/Loss metrics
  | 'WIN_RATE'
  | 'WIN_VALUE'
  | 'LOSS_VALUE'
  // Custom metrics
  | 'CUSTOM';

/**
 * Time periods for aggregation
 */
export type Period = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

/**
 * A single metric with comparison to previous period
 */
export interface Metric {
  name: MetricName;
  value: number;
  previousValue: number | null;
  changePercent: number | null;
  period: Period;
}

// ==================== Dashboard Stats ====================

/**
 * Dashboard statistics for quick loading
 */
export interface DashboardStats {
  opportunitiesViewed: number;
  opportunitiesSaved: number;
  pipelineValue: number;
  winRate: number | null;
  activeUsers: number;
  recentActivity: number;
  eventCounts: Record<string, number>;
  viewsTrend: TrendPoint[];
}

/**
 * A single data point in a trend
 */
export interface TrendPoint {
  date: string;
  value: number;
}

/**
 * Trend data for charts
 */
export interface TrendData {
  metricName: MetricName;
  dataPoints: TrendPoint[];
  total: number;
  average: number;
}

// ==================== Activity Feed ====================

/**
 * Activity item for the feed
 */
export interface ActivityItem {
  id: string;
  userId: string | null;
  userName: string;
  eventType: EventType;
  entityType: string | null;
  entityId: string | null;
  description: string;
  timestamp: string;
}

// ==================== Top Performers ====================

/**
 * Top performer entry
 */
export interface TopPerformer {
  userId: string;
  userName: string;
  actionCount: number;
  value: number;
}

// ==================== Request Types ====================

/**
 * Request to track a custom event
 */
export interface TrackEventRequest {
  eventType: EventType;
  entityType?: AnalyticsEntityType;
  entityId?: string;
  properties?: string;
  sessionId?: string;
}

/**
 * Request parameters for metrics query
 */
export interface MetricsQueryParams {
  metricNames: MetricName[];
  startDate: string;
  endDate: string;
}

/**
 * Request parameters for trends query
 */
export interface TrendsQueryParams {
  metricName: MetricName;
  startDate: string;
  endDate: string;
}

// ==================== Paginated Response ====================

/**
 * Paginated response for analytics events
 */
export interface AnalyticsEventPage {
  content: AnalyticsEvent[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ==================== Chart Data Types ====================

/**
 * Line chart data for trends
 */
export interface LineChartData {
  labels: string[];
  datasets: LineChartDataset[];
}

export interface LineChartDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  fill?: boolean;
  tension?: number;
}

/**
 * Bar chart data for comparisons
 */
export interface BarChartData {
  labels: string[];
  datasets: BarChartDataset[];
}

export interface BarChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

// ==================== Filter State ====================

/**
 * Filter state for analytics dashboard
 */
export interface AnalyticsFilterState {
  dateRange: 'today' | '7days' | '30days' | '90days' | 'custom';
  customStartDate: string;
  customEndDate: string;
  metricNames: MetricName[];
}

// ==================== Utility Functions ====================

/**
 * Format event type for display
 */
export function formatEventType(eventType: EventType): string {
  return eventType
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format metric name for display
 */
export function formatMetricName(metricName: MetricName): string {
  return metricName
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get color for change percentage
 */
export function getChangeColor(changePercent: number | null): string {
  if (changePercent === null) return 'var(--color-text-secondary)';
  if (changePercent > 0) return 'var(--color-success)';
  if (changePercent < 0) return 'var(--color-error)';
  return 'var(--color-text-secondary)';
}

/**
 * Format change percentage for display
 */
export function formatChangePercent(changePercent: number | null): string {
  if (changePercent === null) return '--';
  const sign = changePercent > 0 ? '+' : '';
  return `${sign}${changePercent.toFixed(1)}%`;
}
