/**
 * Export service for batch and scheduled exports
 */

import {API_BASE} from './apiClient';
const EXPORT_PATH = `${API_BASE}/export`;

export type ExportFormat = 'PDF' | 'EXCEL' | 'CSV' | 'JSON';

export interface ExportRequest {
    format: ExportFormat;
    ids: string[];
    templateId?: string;
    includeAttachments?: boolean;
}

export interface ExportTemplate {
    id: string;
    name: string;
    description: string;
    entityType: string;
    format: string;
    isDefault: boolean;
}

export interface ScheduledExport {
    id: string;
    name: string;
    entityType: string;
    format: string;
    templateId: string | null;
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    dayOfWeek: number | null;
    dayOfMonth: number | null;
    hourOfDay: number;
    recipients: string;
    active: boolean;
    lastRunAt: string | null;
    nextRunAt: string | null;
}

/**
 * Export opportunities
 */
export async function exportOpportunities(
    token: string,
    request: ExportRequest
): Promise<Blob> {
    const response = await fetch(`${EXPORT_PATH}/opportunities`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });

    if (response.ok === false) {
        throw new Error('Export failed');
    }

    return response.blob();
}

/**
 * Get export templates
 */
export async function fetchExportTemplates(
    token: string,
    entityType?: string
): Promise<ExportTemplate[]> {
    const params = entityType !== undefined ? `?entityType=${entityType}` : '';
    const response = await fetch(`${EXPORT_PATH}/templates${params}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.ok === false) {
        throw new Error('Failed to fetch templates');
    }

    return response.json();
}

/**
 * Get scheduled exports
 */
export async function fetchScheduledExports(
    token: string
): Promise<ScheduledExport[]> {
    const response = await fetch(`${EXPORT_PATH}/scheduled`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.ok === false) {
        throw new Error('Failed to fetch scheduled exports');
    }

    return response.json();
}

/**
 * Create scheduled export
 */
export async function createScheduledExport(
    token: string,
    export_: Omit<ScheduledExport, 'id' | 'lastRunAt' | 'nextRunAt'>
): Promise<ScheduledExport> {
    const response = await fetch(`${EXPORT_PATH}/scheduled`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(export_),
    });

    if (response.ok === false) {
        throw new Error('Failed to create scheduled export');
    }

    return response.json();
}

/**
 * Trigger download of exported file
 */
export function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
