/**
 * Report Builder Types
 * Types for the custom report builder with drag-and-drop column configuration.
 */

/**
 * Entity types that can be reported on
 */
export type EntityType =
    | 'OPPORTUNITY'
    | 'CONTRACT'
    | 'PIPELINE'
    | 'INVOICE'
    | 'CONTACT'
    | 'ORGANIZATION'
    | 'CERTIFICATION'
    | 'COMPLIANCE'
    | 'DELIVERABLE'
    | 'BUDGET';

/**
 * Sort direction for report data
 */
export type SortDirection = 'ASC' | 'DESC';

/**
 * Filter operators for report filters
 */
export type FilterOperator =
    | 'EQUALS'
    | 'NOT_EQUALS'
    | 'CONTAINS'
    | 'NOT_CONTAINS'
    | 'STARTS_WITH'
    | 'ENDS_WITH'
    | 'GREATER_THAN'
    | 'LESS_THAN'
    | 'GREATER_THAN_OR_EQUALS'
    | 'LESS_THAN_OR_EQUALS'
    | 'IS_NULL'
    | 'IS_NOT_NULL'
    | 'IN'
    | 'BETWEEN';

/**
 * Export format options
 */
export type ExportFormat = 'CSV' | 'EXCEL' | 'PDF';

/**
 * Column definition for a report
 */
export interface ColumnDefinition {
    field: string;
    label: string;
    width: number;
    visible: boolean;
}

/**
 * Filter condition for a report
 */
export interface FilterCondition {
    field: string;
    operator: FilterOperator;
    value: string;
}

/**
 * Filter operator option for UI dropdown
 */
export interface FilterOperatorOption {
    value: FilterOperator;
    label: string;
}

/**
 * Request to create a new report
 */
export interface CreateReportRequest {
    name: string;
    description: string | null;
    entityType: EntityType;
    columns: ColumnDefinition[];
    filters: FilterCondition[];
    sortBy: string | null;
    sortDirection: SortDirection | null;
    isPublic: boolean;
}

/**
 * Request to update an existing report
 */
export interface UpdateReportRequest {
    name: string;
    description: string | null;
    columns: ColumnDefinition[];
    filters: FilterCondition[];
    sortBy: string | null;
    sortDirection: SortDirection | null;
    isPublic: boolean;
}

/**
 * Report definition response from API
 */
export interface ReportDefinition {
    id: string;
    name: string;
    description: string | null;
    entityType: EntityType;
    columns: ColumnDefinition[];
    filters: FilterCondition[];
    sortBy: string | null;
    sortDirection: SortDirection | null;
    isPublic: boolean;
    runCount: number;
    lastRunAt: string | null;
    createdByName: string;
    createdById: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Report execution result
 */
export interface ReportExecutionResult {
    reportId: string;
    reportName: string;
    entityType: EntityType;
    columns: ColumnDefinition[];
    data: Record<string, unknown>[];
    totalRecords: number;
    executedAt: string;
}

/**
 * Paginated response from API
 */
export interface PaginatedReportResponse {
    content: ReportDefinition[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

/**
 * Page state for report pages
 */
export type ReportPageState = 'loading' | 'loaded' | 'error' | 'executing' | 'previewing';

/**
 * Report builder form state
 */
export interface ReportBuilderFormState {
    name: string;
    description: string;
    entityType: EntityType | null;
    selectedColumns: ColumnDefinition[];
    filters: FilterCondition[];
    sortBy: string;
    sortDirection: SortDirection;
    isPublic: boolean;
}

/**
 * Report builder form errors
 */
export interface ReportBuilderFormErrors {
    name?: string;
    entityType?: string;
    columns?: string;
    general?: string;
}

/**
 * Drag item for drag-and-drop
 */
export interface DragItem {
    type: 'COLUMN';
    column: ColumnDefinition;
    index: number;
}

/**
 * Available columns grouped by entity type
 */
export interface AvailableColumnsByEntity {
    entityType: EntityType;
    columns: ColumnDefinition[];
}
