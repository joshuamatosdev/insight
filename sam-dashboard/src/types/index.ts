/**
 * Barrel export for types
 *
 * Note: Some types have the same name in multiple files.
 * We explicitly re-export to avoid conflicts:
 * - EntityType: Use AnalyticsEntityType or ReportEntityType for disambiguation
 * - PaginatedResponse: Canonical version from rbac.types
 */
export * from './api.generated';
export * from './audit.types';
export * from './billing.types';
export * from './crm';
export * from './portal';
export * from './usage.types';
export * from './documents';
export * from './pipeline';

// Re-export analytics.types (EntityType is already named AnalyticsEntityType in the source)
export {
  type EventType,
  type AnalyticsEntityType,
  type AnalyticsEvent,
  type MetricName,
  type Period,
  type Metric,
  type DashboardStats,
  type TrendPoint,
  type TrendData,
  type ActivityItem,
  type TopPerformer,
  type TrackEventRequest,
  type MetricsQueryParams,
  type TrendsQueryParams,
  type AnalyticsEventPage,
  type LineChartData,
  type LineChartDataset,
  type BarChartData,
  type BarChartDataset,
  type AnalyticsFilterState,
  formatEventType,
  formatMetricName,
  getChangeColor,
  formatChangePercent,
} from './analytics.types';

// Re-export report.types with EntityType renamed to ReportEntityType
export {
  type EntityType as ReportEntityType,
  type SortDirection,
  type FilterOperator,
  type ExportFormat,
  type ColumnDefinition,
  type FilterCondition,
  type FilterOperatorOption,
  type CreateReportRequest,
  type UpdateReportRequest,
  type ReportDefinition,
  type ReportExecutionResult,
  type PaginatedReportResponse,
  type ReportPageState,
  type ReportBuilderFormState,
  type ReportBuilderFormErrors,
  type DragItem,
  type AvailableColumnsByEntity,
} from './report.types';

// Re-export rbac.types (canonical PaginatedResponse)
export * from './rbac.types';

// Re-export compliance.types WITHOUT its PaginatedResponse (use rbac.types version)
export {
  type CertificationType,
  type CertificationStatus,
  type Certification,
  type CreateCertificationRequest,
  type UpdateCertificationRequest,
  type ClearanceType,
  type ClearanceLevel,
  type ClearanceStatus,
  type SecurityClearance,
  type CreateClearanceRequest,
  type UpdateClearanceRequest,
  type SbomInfo,
  type SbomVulnerabilityInfo,
  type SbomComponent,
  type SbomDependency,
  type CycloneDxBom,
  type ComplianceOverview,
  type CertificationFormState,
  type CertificationFormErrors,
  type ClearanceFormState,
  type ClearanceFormErrors,
} from './compliance.types';
