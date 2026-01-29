/**
 * Zod schemas for analytics type validation
 *
 * These schemas provide runtime validation for analytics data structures,
 * ensuring type safety when parsing API responses or validating external data.
 *
 * @module test/schemas/analytics.schema
 */

import { z } from 'zod';

// ==================== Event Type Schemas ====================

/**
 * Schema for EventType - all possible analytics event types
 */
export const EventTypeSchema = z.enum([
  // Page views
  'PAGE_VIEW',
  // Search & Discovery
  'SEARCH_PERFORMED',
  'FILTER_APPLIED',
  'SORT_CHANGED',
  // Opportunity interactions
  'OPPORTUNITY_VIEWED',
  'OPPORTUNITY_SAVED',
  'OPPORTUNITY_UNSAVED',
  'OPPORTUNITY_EXPORTED',
  'OPPORTUNITY_SHARED',
  // Pipeline actions
  'PIPELINE_OPPORTUNITY_ADDED',
  'PIPELINE_OPPORTUNITY_MOVED',
  'PIPELINE_OPPORTUNITY_REMOVED',
  'BID_DECISION_MADE',
  // Contract actions
  'CONTRACT_VIEWED',
  'CONTRACT_CREATED',
  'CONTRACT_UPDATED',
  'DELIVERABLE_COMPLETED',
  'INVOICE_SUBMITTED',
  // Document actions
  'DOCUMENT_UPLOADED',
  'DOCUMENT_DOWNLOADED',
  'DOCUMENT_VIEWED',
  // User actions
  'USER_LOGIN',
  'USER_LOGOUT',
  'PROFILE_UPDATED',
  'SETTINGS_CHANGED',
  // Dashboard interactions
  'DASHBOARD_VIEWED',
  'REPORT_GENERATED',
  'REPORT_EXPORTED',
  'WIDGET_INTERACTED',
  // Alert interactions
  'ALERT_CREATED',
  'ALERT_TRIGGERED',
  'ALERT_DISMISSED',
  // Custom events
  'CUSTOM',
]);

/**
 * Schema for AnalyticsEntityType - entity types associated with events
 */
export const AnalyticsEntityTypeSchema = z.enum([
  'OPPORTUNITY',
  'CONTRACT',
  'PIPELINE',
  'PIPELINE_OPPORTUNITY',
  'DOCUMENT',
  'INVOICE',
  'REPORT',
  'DASHBOARD',
  'ALERT',
  'SEARCH',
  'USER',
  'COMPANY_PROFILE',
]);

/**
 * Schema for AnalyticsEvent - complete analytics event structure
 *
 * Validates analytics events from the backend, including:
 * - Event identification (id, tenantId, userId)
 * - Event type and entity association
 * - Metadata (properties, sessionId, ipAddress, userAgent)
 * - Timestamp
 */
export const AnalyticsEventSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  userId: z.string().nullable(),
  eventType: EventTypeSchema,
  entityType: AnalyticsEntityTypeSchema.nullable(),
  entityId: z.string().nullable(),
  properties: z.string().nullable(),
  timestamp: z.string(),
  sessionId: z.string().nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
});

// ==================== Metric Schemas ====================

/**
 * Schema for MetricName - available metric names for aggregation
 */
export const MetricNameSchema = z.enum([
  // Opportunity metrics
  'OPPORTUNITIES_VIEWED',
  'OPPORTUNITIES_SAVED',
  'OPPORTUNITIES_IN_PIPELINE',
  'OPPORTUNITIES_WON',
  'OPPORTUNITIES_LOST',
  // Pipeline metrics
  'PIPELINE_VALUE_TOTAL',
  'PIPELINE_VALUE_WEIGHTED',
  'PIPELINE_CONVERSION_RATE',
  'AVERAGE_DEAL_SIZE',
  'AVERAGE_TIME_IN_STAGE',
  // Contract metrics
  'ACTIVE_CONTRACTS',
  'CONTRACT_VALUE_TOTAL',
  'INVOICES_SUBMITTED',
  'INVOICES_PAID',
  'REVENUE_RECOGNIZED',
  'OUTSTANDING_RECEIVABLES',
  // Engagement metrics
  'PAGE_VIEWS',
  'SEARCHES_PERFORMED',
  'DOCUMENTS_DOWNLOADED',
  'REPORTS_GENERATED',
  'ACTIVE_USERS',
  'SESSION_DURATION_AVG',
  // Win/Loss metrics
  'WIN_RATE',
  'WIN_VALUE',
  'LOSS_VALUE',
  // Custom metrics
  'CUSTOM',
]);

/**
 * Schema for Period - time periods for metric aggregation
 */
export const PeriodSchema = z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']);

/**
 * Schema for Metric - single metric with period-over-period comparison
 *
 * Validates metrics with:
 * - Metric name and current value
 * - Previous period value for comparison
 * - Change percentage calculation
 * - Aggregation period
 */
export const MetricSchema = z.object({
  name: MetricNameSchema,
  value: z.number(),
  previousValue: z.number().nullable(),
  changePercent: z.number().nullable(),
  period: PeriodSchema,
});

// ==================== Trend Schemas ====================

/**
 * Schema for TrendPoint - single data point in a time series trend
 *
 * Used for visualizing metrics over time in charts
 */
export const TrendPointSchema = z.object({
  date: z.string(),
  value: z.number(),
});

/**
 * Schema for TrendData - complete trend data for a metric
 *
 * Includes:
 * - Metric identification
 * - Array of data points over time
 * - Total and average calculations
 */
export const TrendDataSchema = z.object({
  metricName: MetricNameSchema,
  dataPoints: z.array(TrendPointSchema),
  total: z.number(),
  average: z.number(),
});

// ==================== Dashboard Stats Schema ====================

/**
 * Schema for DashboardStats - main dashboard statistics
 *
 * Validates the primary dashboard metrics for quick loading, including:
 * - Key performance indicators (opportunities, pipeline value, win rate)
 * - User engagement metrics (active users, recent activity)
 * - Event count breakdown by type
 * - Views trend data for charting
 */
export const DashboardStatsSchema = z.object({
  opportunitiesViewed: z.number(),
  opportunitiesSaved: z.number(),
  pipelineValue: z.number(),
  winRate: z.number().nullable(),
  activeUsers: z.number(),
  recentActivity: z.number(),
  eventCounts: z.record(z.string(), z.number()),
  viewsTrend: z.array(TrendPointSchema),
});

// ==================== Activity Feed Schema ====================

/**
 * Schema for ActivityItem - single activity item for the feed
 *
 * Validates activity feed entries with:
 * - User identification (userId, userName)
 * - Event type and entity association
 * - Human-readable description
 * - Timestamp for chronological ordering
 */
export const ActivityItemSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  userName: z.string(),
  eventType: EventTypeSchema,
  entityType: z.string().nullable(),
  entityId: z.string().nullable(),
  description: z.string(),
  timestamp: z.string(),
});

// ==================== Top Performers Schema ====================

/**
 * Schema for TopPerformer - top performer entry for leaderboards
 *
 * Validates top performer data with:
 * - User identification (userId, userName)
 * - Action count (number of events/activities)
 * - Value (monetary value or score associated with actions)
 */
export const TopPerformerSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  actionCount: z.number(),
  value: z.number(),
});

// ==================== Request Schemas ====================

/**
 * Schema for TrackEventRequest - request to track a custom analytics event
 *
 * Validates event tracking requests with:
 * - Required event type
 * - Optional entity association (type and ID)
 * - Optional custom properties (JSON string)
 * - Optional session ID for grouping related events
 */
export const TrackEventRequestSchema = z.object({
  eventType: EventTypeSchema,
  entityType: AnalyticsEntityTypeSchema.optional(),
  entityId: z.string().optional(),
  properties: z.string().optional(),
  sessionId: z.string().optional(),
});

/**
 * Schema for MetricsQueryParams - parameters for querying metrics
 *
 * Validates metric query requests with:
 * - Array of metric names to retrieve
 * - Date range (startDate, endDate) for filtering
 */
export const MetricsQueryParamsSchema = z.object({
  metricNames: z.array(MetricNameSchema),
  startDate: z.string(),
  endDate: z.string(),
});

/**
 * Schema for TrendsQueryParams - parameters for querying trend data
 *
 * Validates trend query requests with:
 * - Single metric name to retrieve trend for
 * - Date range (startDate, endDate) for filtering
 */
export const TrendsQueryParamsSchema = z.object({
  metricName: MetricNameSchema,
  startDate: z.string(),
  endDate: z.string(),
});

// ==================== Paginated Response Schema ====================

/**
 * Schema for AnalyticsEventPage - paginated response for analytics events
 *
 * Validates paginated API responses with:
 * - Array of analytics events (content)
 * - Pagination metadata (total elements, pages, current page)
 * - Navigation flags (first, last, empty)
 */
export const AnalyticsEventPageSchema = z.object({
  content: z.array(AnalyticsEventSchema),
  totalElements: z.number(),
  totalPages: z.number(),
  size: z.number(),
  number: z.number(),
  first: z.boolean(),
  last: z.boolean(),
  empty: z.boolean(),
});

// ==================== Chart Data Schemas ====================

/**
 * Schema for LineChartDataset - single dataset in a line chart
 */
export const LineChartDatasetSchema = z.object({
  label: z.string(),
  data: z.array(z.number()),
  borderColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  fill: z.boolean().optional(),
  tension: z.number().optional(),
});

/**
 * Schema for LineChartData - complete line chart data structure
 *
 * Validates line chart data with:
 * - Array of x-axis labels
 * - Array of datasets (each with data points and styling)
 */
export const LineChartDataSchema = z.object({
  labels: z.array(z.string()),
  datasets: z.array(LineChartDatasetSchema),
});

/**
 * Schema for BarChartDataset - single dataset in a bar chart
 */
export const BarChartDatasetSchema = z.object({
  label: z.string(),
  data: z.array(z.number()),
  backgroundColor: z.union([z.string(), z.array(z.string())]).optional(),
  borderColor: z.union([z.string(), z.array(z.string())]).optional(),
  borderWidth: z.number().optional(),
});

/**
 * Schema for BarChartData - complete bar chart data structure
 *
 * Validates bar chart data with:
 * - Array of x-axis labels
 * - Array of datasets (each with data points and styling)
 */
export const BarChartDataSchema = z.object({
  labels: z.array(z.string()),
  datasets: z.array(BarChartDatasetSchema),
});

// ==================== Filter State Schema ====================

/**
 * Schema for AnalyticsFilterState - filter state for analytics dashboard
 *
 * Validates dashboard filter state with:
 * - Date range selection (predefined or custom)
 * - Custom date range dates (when dateRange is 'custom')
 * - Array of selected metric names to display
 */
export const AnalyticsFilterStateSchema = z.object({
  dateRange: z.enum(['today', '7days', '30days', '90days', 'custom']),
  customStartDate: z.string(),
  customEndDate: z.string(),
  metricNames: z.array(MetricNameSchema),
});

// ==================== Type Exports ====================

/**
 * Export inferred TypeScript types from schemas
 * These can be used instead of importing from analytics.types.ts
 */
export type EventType = z.infer<typeof EventTypeSchema>;
export type AnalyticsEntityType = z.infer<typeof AnalyticsEntityTypeSchema>;
export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;
export type MetricName = z.infer<typeof MetricNameSchema>;
export type Period = z.infer<typeof PeriodSchema>;
export type Metric = z.infer<typeof MetricSchema>;
export type TrendPoint = z.infer<typeof TrendPointSchema>;
export type TrendData = z.infer<typeof TrendDataSchema>;
export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
export type ActivityItem = z.infer<typeof ActivityItemSchema>;
export type TopPerformer = z.infer<typeof TopPerformerSchema>;
export type TrackEventRequest = z.infer<typeof TrackEventRequestSchema>;
export type MetricsQueryParams = z.infer<typeof MetricsQueryParamsSchema>;
export type TrendsQueryParams = z.infer<typeof TrendsQueryParamsSchema>;
export type AnalyticsEventPage = z.infer<typeof AnalyticsEventPageSchema>;
export type LineChartDataset = z.infer<typeof LineChartDatasetSchema>;
export type LineChartData = z.infer<typeof LineChartDataSchema>;
export type BarChartDataset = z.infer<typeof BarChartDatasetSchema>;
export type BarChartData = z.infer<typeof BarChartDataSchema>;
export type AnalyticsFilterState = z.infer<typeof AnalyticsFilterStateSchema>;
