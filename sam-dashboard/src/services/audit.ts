import {AuditLog, AuditLogPage} from '../types';

const API_BASE = '/api';
const AUTH_STORAGE_KEY = 'sam_auth_state';

/**
 * Gets the auth token from localStorage
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
 * Creates headers with auth token if available
 */
function getAuthHeaders(): HeadersInit {
    const token = getAuthToken();
    if (token !== null) {
        return {
            Authorization: `Bearer ${token}`,
        };
    }
    return {};
}

/**
 * Authenticated fetch wrapper
 */
async function authFetch(url: string, options?: RequestInit): Promise<Response> {
    const headers = {
        ...getAuthHeaders(),
        ...options?.headers,
    };

    return fetch(url, {
        ...options,
        headers,
    });
}

/**
 * Fetch audit logs for the current user
 */
export async function fetchMyAuditLogs(
    page: number = 0,
    size: number = 50
): Promise<AuditLogPage> {
    const response = await authFetch(`${API_BASE}/v1/audit/me?page=${page}&size=${size}`);
    if (response.ok === false) {
        throw new Error(`Failed to fetch audit logs: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Fetch audit logs for a specific user
 */
export async function fetchUserAuditLogs(
    userId: string,
    page: number = 0,
    size: number = 50
): Promise<AuditLogPage> {
    const response = await authFetch(
        `${API_BASE}/v1/audit/user/${userId}?page=${page}&size=${size}`
    );
    if (response.ok === false) {
        throw new Error(`Failed to fetch user audit logs: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Fetch audit logs for a specific tenant
 */
export async function fetchTenantAuditLogs(
    tenantId: string,
    page: number = 0,
    size: number = 50
): Promise<AuditLogPage> {
    const response = await authFetch(
        `${API_BASE}/v1/audit/tenant/${tenantId}?page=${page}&size=${size}`
    );
    if (response.ok === false) {
        throw new Error(`Failed to fetch tenant audit logs: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Fetch audit logs for a specific tenant within a date range
 */
export async function fetchTenantAuditLogsByDateRange(
    tenantId: string,
    startDate: string,
    endDate: string
): Promise<AuditLog[]> {
    const response = await authFetch(
        `${API_BASE}/v1/audit/tenant/${tenantId}/range?startDate=${startDate}&endDate=${endDate}`
    );
    if (response.ok === false) {
        throw new Error(`Failed to fetch tenant audit logs: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Fetch audit logs for a specific entity
 */
export async function fetchEntityAuditLogs(
    entityType: string,
    entityId: string
): Promise<AuditLog[]> {
    const response = await authFetch(
        `${API_BASE}/v1/audit/entity/${entityType}/${entityId}`
    );
    if (response.ok === false) {
        throw new Error(`Failed to fetch entity audit logs: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Export format type
 */
export type ExportFormat = 'CSV';

/**
 * Formats an action type to a human-readable string
 */
function formatAction(action: string): string {
    return action
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Escapes a CSV field value
 */
function escapeCSVField(value: string | null): string {
    if (value === null) {
        return '';
    }
    // Escape quotes by doubling them
    const escaped = value.replace(/"/g, '""');
    // Wrap in quotes if contains comma, newline, or quote
    if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
        return `"${escaped}"`;
    }
    return escaped;
}

/**
 * Converts audit logs to CSV format
 */
function auditLogsToCSV(logs: AuditLog[]): string {
    const headers = [
        'Timestamp',
        'Action',
        'Entity Type',
        'Entity ID',
        'Description',
        'User ID',
        'Tenant ID',
        'IP Address',
        'User Agent',
        'Details',
    ];

    const rows = logs.map((log) => [
        escapeCSVField(log.createdAt),
        escapeCSVField(formatAction(log.action)),
        escapeCSVField(log.entityType),
        escapeCSVField(log.entityId),
        escapeCSVField(log.description),
        escapeCSVField(log.userId),
        escapeCSVField(log.tenantId),
        escapeCSVField(log.ipAddress),
        escapeCSVField(log.userAgent),
        escapeCSVField(log.details),
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
    ].join('\n');

    return csvContent;
}

/**
 * Triggers a file download in the browser
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], {type: mimeType});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Exports audit logs to a file
 */
export async function exportAuditLogs(
    logs: AuditLog[],
    format: ExportFormat
): Promise<void> {
    if (logs.length === 0) {
        throw new Error('No audit logs to export');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    if (format === 'CSV') {
        const csvContent = auditLogsToCSV(logs);
        downloadFile(csvContent, `audit-log-${timestamp}.csv`, 'text/csv;charset=utf-8');
    }
}
