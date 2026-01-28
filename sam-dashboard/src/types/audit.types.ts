/**
 * Audit log action types - mirrors backend AuditAction enum
 */
export type AuditAction =
// Authentication
    | 'LOGIN'
    | 'LOGOUT'
    | 'LOGIN_FAILED'
    | 'PASSWORD_RESET_REQUESTED'
    | 'PASSWORD_RESET_COMPLETED'
    | 'PASSWORD_CHANGED'
    | 'MFA_ENABLED'
    | 'MFA_DISABLED'
    // User management
    | 'USER_CREATED'
    | 'USER_UPDATED'
    | 'USER_ACTIVATED'
    | 'USER_SUSPENDED'
    | 'USER_DELETED'
    | 'USER_INVITED'
    | 'INVITATION_ACCEPTED'
    | 'INVITATION_CANCELLED'
    // Tenant management
    | 'TENANT_CREATED'
    | 'TENANT_UPDATED'
    | 'TENANT_SUSPENDED'
    | 'TENANT_ACTIVATED'
    | 'TENANT_SETTINGS_CHANGED'
    // Role management
    | 'ROLE_ASSIGNED'
    | 'ROLE_REMOVED'
    | 'ROLE_CHANGED'
    | 'ROLE_CREATED'
    | 'ROLE_UPDATED'
    | 'ROLE_DELETED'
    // Opportunity management
    | 'OPPORTUNITY_VIEWED'
    | 'OPPORTUNITY_SAVED'
    | 'OPPORTUNITY_REMOVED_FROM_SAVED'
    | 'OPPORTUNITY_ADDED_TO_PIPELINE'
    | 'OPPORTUNITY_STAGE_CHANGED'
    // Pipeline management
    | 'PIPELINE_CREATED'
    | 'PIPELINE_UPDATED'
    | 'PIPELINE_DELETED'
    | 'PIPELINE_ARCHIVED'
    | 'PIPELINE_DEFAULT_SET'
    | 'OPPORTUNITY_REMOVED_FROM_PIPELINE'
    | 'BID_DECISION_SET'
    // Document management
    | 'DOCUMENT_UPLOADED'
    | 'DOCUMENT_DOWNLOADED'
    | 'DOCUMENT_DELETED'
    | 'DOCUMENT_CREATED'
    | 'DOCUMENT_UPDATED'
    // Template management
    | 'TEMPLATE_CREATED'
    | 'TEMPLATE_UPDATED'
    | 'TEMPLATE_DELETED'
    // Content library
    | 'CONTENT_CREATED'
    | 'CONTENT_UPDATED'
    | 'CONTENT_DELETED'
    // Contract management
    | 'CONTRACT_CREATED'
    | 'CONTRACT_UPDATED'
    | 'CONTRACT_DELETED'
    | 'CONTRACT_STATUS_CHANGED'
    | 'CLIN_CREATED'
    | 'CLIN_UPDATED'
    | 'MODIFICATION_CREATED'
    | 'OPTION_EXERCISED'
    | 'DELIVERABLE_CREATED'
    | 'DELIVERABLE_COMPLETED'
    // Compliance
    | 'CERTIFICATION_CREATED'
    | 'CERTIFICATION_UPDATED'
    | 'CERTIFICATION_DELETED'
    | 'CERTIFICATION_EXPIRED'
    | 'CLEARANCE_CREATED'
    | 'CLEARANCE_UPDATED'
    | 'COMPLIANCE_ITEM_CREATED'
    | 'COMPLIANCE_STATUS_CHANGED'
    // Financial
    | 'INVOICE_CREATED'
    | 'INVOICE_SUBMITTED'
    | 'INVOICE_PAID'
    | 'BUDGET_ITEM_CREATED'
    | 'LABOR_RATE_CREATED'
    | 'LABOR_RATE_UPDATED'
    | 'LABOR_RATE_DELETED'
    // Export/Report
    | 'DATA_EXPORTED'
    | 'REPORT_GENERATED'
    | 'REPORT_CREATED'
    | 'REPORT_UPDATED'
    | 'REPORT_DELETED'
    | 'REPORT_RAN'
    // System
    | 'SETTINGS_CHANGED'
    | 'API_KEY_CREATED'
    | 'API_KEY_REVOKED'
    // Competitor management
    | 'COMPETITOR_CREATED'
    | 'COMPETITOR_UPDATED'
    | 'COMPETITOR_DELETED'
    // Company profile
    | 'PROFILE_CREATED'
    | 'PROFILE_UPDATED'
    // Session management
    | 'SESSION_CREATED'
    | 'SESSION_EXPIRED'
    | 'SESSION_TERMINATED'
    // Alert management
    | 'ALERT_CREATED'
    | 'ALERT_UPDATED'
    | 'ALERT_DELETED'
    | 'ALERT_TRIGGERED'
    // Saved search management
    | 'SEARCH_CREATED'
    | 'SEARCH_UPDATED'
    | 'SEARCH_DELETED'
    // Webhook management
    | 'WEBHOOK_CREATED'
    | 'WEBHOOK_UPDATED'
    | 'WEBHOOK_DELETED'
    // Match management
    | 'MATCH_UPDATED';

/**
 * Audit log entry from the backend
 */
export interface AuditLog {
    id: string;
    userId: string | null;
    tenantId: string | null;
    action: AuditAction;
    entityType: string | null;
    entityId: string | null;
    description: string | null;
    details: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
}

/**
 * Paginated response for audit logs
 */
export interface AuditLogPage {
    content: AuditLog[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

/**
 * Filter state for audit log page
 */
export interface AuditLogFilterState {
    search: string;
    actionType: AuditAction | '';
    entityType: string;
    dateFrom: string;
    dateTo: string;
}

/**
 * Categories of audit actions for filtering
 */
export const AUDIT_ACTION_CATEGORIES: Record<string, AuditAction[]> = {
    Authentication: [
        'LOGIN',
        'LOGOUT',
        'LOGIN_FAILED',
        'PASSWORD_RESET_REQUESTED',
        'PASSWORD_RESET_COMPLETED',
        'PASSWORD_CHANGED',
        'MFA_ENABLED',
        'MFA_DISABLED',
    ],
    'User Management': [
        'USER_CREATED',
        'USER_UPDATED',
        'USER_ACTIVATED',
        'USER_SUSPENDED',
        'USER_DELETED',
        'USER_INVITED',
        'INVITATION_ACCEPTED',
        'INVITATION_CANCELLED',
    ],
    'Role Management': [
        'ROLE_ASSIGNED',
        'ROLE_REMOVED',
        'ROLE_CHANGED',
        'ROLE_CREATED',
        'ROLE_UPDATED',
        'ROLE_DELETED',
    ],
    'Pipeline & Opportunities': [
        'OPPORTUNITY_VIEWED',
        'OPPORTUNITY_SAVED',
        'OPPORTUNITY_REMOVED_FROM_SAVED',
        'OPPORTUNITY_ADDED_TO_PIPELINE',
        'OPPORTUNITY_STAGE_CHANGED',
        'PIPELINE_CREATED',
        'PIPELINE_UPDATED',
        'PIPELINE_DELETED',
        'PIPELINE_ARCHIVED',
        'PIPELINE_DEFAULT_SET',
        'OPPORTUNITY_REMOVED_FROM_PIPELINE',
        'BID_DECISION_SET',
    ],
    Documents: [
        'DOCUMENT_UPLOADED',
        'DOCUMENT_DOWNLOADED',
        'DOCUMENT_DELETED',
        'DOCUMENT_CREATED',
        'DOCUMENT_UPDATED',
        'TEMPLATE_CREATED',
        'TEMPLATE_UPDATED',
        'TEMPLATE_DELETED',
        'CONTENT_CREATED',
        'CONTENT_UPDATED',
        'CONTENT_DELETED',
    ],
    Contracts: [
        'CONTRACT_CREATED',
        'CONTRACT_UPDATED',
        'CONTRACT_DELETED',
        'CONTRACT_STATUS_CHANGED',
        'CLIN_CREATED',
        'CLIN_UPDATED',
        'MODIFICATION_CREATED',
        'OPTION_EXERCISED',
        'DELIVERABLE_CREATED',
        'DELIVERABLE_COMPLETED',
    ],
    Compliance: [
        'CERTIFICATION_CREATED',
        'CERTIFICATION_UPDATED',
        'CERTIFICATION_DELETED',
        'CERTIFICATION_EXPIRED',
        'CLEARANCE_CREATED',
        'CLEARANCE_UPDATED',
        'COMPLIANCE_ITEM_CREATED',
        'COMPLIANCE_STATUS_CHANGED',
    ],
    Financial: [
        'INVOICE_CREATED',
        'INVOICE_SUBMITTED',
        'INVOICE_PAID',
        'BUDGET_ITEM_CREATED',
        'LABOR_RATE_CREATED',
        'LABOR_RATE_UPDATED',
        'LABOR_RATE_DELETED',
    ],
    System: [
        'SETTINGS_CHANGED',
        'API_KEY_CREATED',
        'API_KEY_REVOKED',
        'DATA_EXPORTED',
        'REPORT_GENERATED',
        'REPORT_CREATED',
        'REPORT_UPDATED',
        'REPORT_DELETED',
        'REPORT_RAN',
        'SESSION_CREATED',
        'SESSION_EXPIRED',
        'SESSION_TERMINATED',
    ],
};

/**
 * List of entity types for filtering
 */
export const ENTITY_TYPES = [
    'User',
    'Tenant',
    'Opportunity',
    'Pipeline',
    'Contract',
    'Document',
    'Invoice',
    'Alert',
    'Certification',
    'Competitor',
    'CompanyProfile',
] as const;
