/**
 * Document Service - Type-safe using openapi-fetch
 */

import {apiClient} from './apiClient';
import type {
    CreateDocumentRequest,
    CreateFolderRequest,
    CreateTemplateRequest,
    Document,
    DocumentFilters,
    DocumentFolder,
    DocumentStatus,
    DocumentStorageSummary,
    DocumentTemplate,
    TemplateType,
    UpdateDocumentRequest,
    UpdateFolderRequest,
    UpdateTemplateRequest,
} from '../types/documents';

interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

// ============ Documents ============

export async function fetchDocuments(
    page: number = 0,
    size: number = 20,
    filters?: DocumentFilters
): Promise<Page<Document>> {
    const queryParams: Record<string, string | number> = {page, size};

    if (filters?.search !== undefined && filters.search !== '') {
        queryParams.keyword = filters.search;
    }
    if (filters?.documentType !== undefined) {
        queryParams.documentType = filters.documentType;
    }
    if (filters?.status !== undefined) {
        queryParams.status = filters.status;
    }
    if (filters?.folderId !== undefined) {
        queryParams.folderId = filters.folderId;
    }

    const {data, error} = await apiClient.GET('/portal/documents', {
        params: {query: queryParams},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Page<Document>;
}

export async function fetchDocument(id: string): Promise<Document> {
    const {data, error} = await apiClient.GET('/documents/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Document;
}

export async function createDocument(request: CreateDocumentRequest): Promise<Document> {
    const {data, error} = await apiClient.POST('/portal/documents', {
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Document;
}

export async function updateDocument(id: string, request: UpdateDocumentRequest): Promise<Document> {
    const {data, error} = await apiClient.PUT('/documents/{id}', {
        params: {path: {id}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Document;
}

export async function deleteDocument(id: string): Promise<void> {
    const {error} = await apiClient.DELETE('/documents/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function searchDocuments(
    keyword: string,
    page: number = 0,
    size: number = 20
): Promise<Page<Document>> {
    const {data, error} = await apiClient.GET('/documents/search', {
        params: {query: {keyword, page, size}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Page<Document>;
}

export async function fetchDocumentsByFolder(
    folderId: string,
    page: number = 0,
    size: number = 20
): Promise<Page<Document>> {
    const {data, error} = await apiClient.GET('/documents/folder/{folderId}', {
        params: {path: {folderId}, query: {page, size}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Page<Document>;
}

export async function fetchDocumentsByOpportunity(
    opportunityId: string,
    page: number = 0,
    size: number = 20
): Promise<Page<Document>> {
    const {data, error} = await apiClient.GET('/documents/opportunity/{opportunityId}', {
        params: {path: {opportunityId}, query: {page, size}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Page<Document>;
}

export async function fetchDocumentsByContract(
    contractId: string,
    page: number = 0,
    size: number = 20
): Promise<Page<Document>> {
    const {data, error} = await apiClient.GET('/documents/contract/{contractId}', {
        params: {path: {contractId}, query: {page, size}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Page<Document>;
}

export async function fetchDocumentVersions(documentId: string): Promise<Document[]> {
    const {data, error} = await apiClient.GET('/documents/{documentId}/versions', {
        params: {path: {documentId}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Document[];
}

export async function checkoutDocument(id: string): Promise<Document> {
    const {data, error} = await apiClient.POST('/documents/{id}/checkout', {
        params: {path: {id}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Document;
}

export async function checkinDocument(
    id: string,
    newFilePath: string,
    newFileSize: number
): Promise<Document> {
    const {data, error} = await apiClient.POST('/documents/{id}/checkin', {
        params: {path: {id}, query: {newFilePath, newFileSize}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Document;
}

export async function updateDocumentStatus(
    id: string,
    status: DocumentStatus,
    notes?: string
): Promise<Document> {
    const queryParams: Record<string, string> = {status};
    if (notes !== undefined) {
        queryParams.notes = notes;
    }

    const {data, error} = await apiClient.POST('/documents/{id}/status', {
        params: {path: {id}, query: queryParams},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Document;
}

export async function fetchExpiringDocuments(daysAhead: number = 30): Promise<Document[]> {
    const {data, error} = await apiClient.GET('/documents/expiring', {
        params: {query: {daysAhead}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Document[];
}

export async function fetchStorageSummary(): Promise<DocumentStorageSummary> {
    const {data, error} = await apiClient.GET('/documents/storage-summary');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as DocumentStorageSummary;
}

// ============ Folders ============

export async function fetchFolders(): Promise<DocumentFolder[]> {
    const {data, error} = await apiClient.GET('/documents/folders');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as DocumentFolder[];
}

export async function fetchFolder(id: string): Promise<DocumentFolder> {
    const {data, error} = await apiClient.GET('/documents/folders/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as DocumentFolder;
}

export async function fetchChildFolders(parentId: string): Promise<DocumentFolder[]> {
    const {data, error} = await apiClient.GET('/documents/folders/{parentId}/children', {
        params: {path: {parentId}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as DocumentFolder[];
}

export async function createFolder(request: CreateFolderRequest): Promise<DocumentFolder> {
    const {data, error} = await apiClient.POST('/documents/folders', {
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as DocumentFolder;
}

export async function updateFolder(id: string, request: UpdateFolderRequest): Promise<DocumentFolder> {
    const {data, error} = await apiClient.PUT('/documents/folders/{id}', {
        params: {path: {id}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as DocumentFolder;
}

export async function deleteFolder(id: string): Promise<void> {
    const {error} = await apiClient.DELETE('/documents/folders/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function searchFolders(keyword: string): Promise<DocumentFolder[]> {
    const {data, error} = await apiClient.GET('/documents/folders/search', {
        params: {query: {keyword}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as DocumentFolder[];
}

export async function fetchFolderBreadcrumb(folderId: string): Promise<DocumentFolder[]> {
    const {data, error} = await apiClient.GET('/documents/folders/{folderId}/breadcrumb', {
        params: {path: {folderId}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as DocumentFolder[];
}

// ============ Templates ============

export async function fetchTemplates(page: number = 0, size: number = 20): Promise<Page<DocumentTemplate>> {
    const {data, error} = await apiClient.GET('/documents/templates', {
        params: {query: {page, size}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Page<DocumentTemplate>;
}

export async function fetchTemplate(id: string): Promise<DocumentTemplate> {
    const {data, error} = await apiClient.GET('/documents/templates/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as DocumentTemplate;
}

export async function createTemplate(request: CreateTemplateRequest): Promise<DocumentTemplate> {
    const {data, error} = await apiClient.POST('/documents/templates', {
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as DocumentTemplate;
}

export async function updateTemplate(id: string, request: UpdateTemplateRequest): Promise<DocumentTemplate> {
    const {data, error} = await apiClient.PUT('/documents/templates/{id}', {
        params: {path: {id}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as DocumentTemplate;
}

export async function deleteTemplate(id: string): Promise<void> {
    const {error} = await apiClient.DELETE('/documents/templates/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function approveTemplate(id: string): Promise<DocumentTemplate> {
    const {data, error} = await apiClient.POST('/documents/templates/{id}/approve', {
        params: {path: {id}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as DocumentTemplate;
}

export async function setDefaultTemplate(id: string): Promise<DocumentTemplate> {
    const {data, error} = await apiClient.POST('/documents/templates/{id}/set-default', {
        params: {path: {id}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as DocumentTemplate;
}

export async function recordTemplateUsage(id: string): Promise<void> {
    const {error} = await apiClient.POST('/documents/templates/{id}/use', {
        params: {path: {id}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function searchTemplates(
    keyword: string,
    page: number = 0,
    size: number = 20
): Promise<Page<DocumentTemplate>> {
    const {data, error} = await apiClient.GET('/documents/templates/search', {
        params: {query: {keyword, page, size}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Page<DocumentTemplate>;
}

export async function fetchTemplatesByType(type: TemplateType): Promise<DocumentTemplate[]> {
    const {data, error} = await apiClient.GET('/documents/templates/type/{type}', {
        params: {path: {type}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as DocumentTemplate[];
}

export async function fetchTemplateCategories(): Promise<string[]> {
    const {data, error} = await apiClient.GET('/documents/templates/categories');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as string[];
}

// ============ Helper Functions ============

export function formatFileSize(bytes: number | null): string {
    if (bytes === null || bytes === 0) {
        return '0 B';
    }
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    return `${size.toFixed(i > 0 ? 1 : 0)} ${units[i] ?? 'B'}`;
}

export function getDocumentTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        RFP: 'RFP',
        RFQ: 'RFQ',
        RFI: 'RFI',
        SOURCES_SOUGHT: 'Sources Sought',
        AMENDMENT: 'Amendment',
        QUESTIONS_ANSWERS: 'Q&A',
        PROPOSAL_VOLUME: 'Proposal Volume',
        PROPOSAL_TECHNICAL: 'Technical Proposal',
        PROPOSAL_MANAGEMENT: 'Management Proposal',
        PROPOSAL_COST: 'Cost Proposal',
        PROPOSAL_PAST_PERFORMANCE: 'Past Performance',
        COVER_LETTER: 'Cover Letter',
        EXECUTIVE_SUMMARY: 'Executive Summary',
        CONTRACT: 'Contract',
        TASK_ORDER: 'Task Order',
        MODIFICATION: 'Modification',
        STATEMENT_OF_WORK: 'SOW',
        PERFORMANCE_WORK_STATEMENT: 'PWS',
        CONTRACT_DATA_REQUIREMENTS_LIST: 'CDRL',
        QUALITY_ASSURANCE_PLAN: 'QA Plan',
        SECURITY_PLAN: 'Security Plan',
        NDA: 'NDA',
        TEAMING_AGREEMENT: 'Teaming Agreement',
        SUBCONTRACT: 'Subcontract',
        LETTER_OF_INTENT: 'Letter of Intent',
        ORGANIZATIONAL_CHART: 'Org Chart',
        CERTIFICATE: 'Certificate',
        LICENSE: 'License',
        POLICY: 'Policy',
        PROCEDURE: 'Procedure',
        AUDIT_REPORT: 'Audit Report',
        INVOICE: 'Invoice',
        RECEIPT: 'Receipt',
        PURCHASE_ORDER: 'PO',
        BUDGET_DOCUMENT: 'Budget',
        RATE_SCHEDULE: 'Rate Schedule',
        RESUME: 'Resume',
        BIOGRAPHY: 'Biography',
        TRAINING_CERTIFICATE: 'Training Cert',
        CLEARANCE_VERIFICATION: 'Clearance',
        DELIVERABLE: 'Deliverable',
        REPORT: 'Report',
        PRESENTATION: 'Presentation',
        MEETING_MINUTES: 'Meeting Minutes',
        STATUS_REPORT: 'Status Report',
        CORRESPONDENCE: 'Correspondence',
        EMAIL: 'Email',
        ATTACHMENT: 'Attachment',
        TEMPLATE: 'Template',
        OTHER: 'Other',
    };
    return labels[type] ?? type;
}

export function getDocumentStatusVariant(
    status: string
): 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple' {
    const variants: Record<string, 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple'> = {
        DRAFT: 'gray',
        PENDING_REVIEW: 'yellow',
        IN_REVIEW: 'blue',
        APPROVED: 'green',
        REJECTED: 'red',
        ARCHIVED: 'gray',
        SUPERSEDED: 'purple',
    };
    return variants[status] ?? 'gray';
}

export function getAccessLevelVariant(
    level: string
): 'blue' | 'green' | 'yellow' | 'red' | 'gray' {
    const variants: Record<string, 'blue' | 'green' | 'yellow' | 'red' | 'gray'> = {
        PUBLIC: 'green',
        INTERNAL: 'blue',
        RESTRICTED: 'yellow',
        CONFIDENTIAL: 'red',
        SECRET: 'red',
    };
    return variants[level] ?? 'gray';
}

export function getFileIcon(contentType: string | null, fileName: string): string {
    if (contentType !== null) {
        if (contentType.includes('pdf')) return 'pdf';
        if (contentType.includes('word') || contentType.includes('document')) return 'word';
        if (contentType.includes('excel') || contentType.includes('spreadsheet')) return 'excel';
        if (contentType.includes('powerpoint') || contentType.includes('presentation')) return 'powerpoint';
        if (contentType.includes('image')) return 'image';
        if (contentType.includes('text')) return 'text';
        if (contentType.includes('zip') || contentType.includes('archive')) return 'archive';
    }

    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
    const extMap: Record<string, string> = {
        pdf: 'pdf',
        doc: 'word',
        docx: 'word',
        xls: 'excel',
        xlsx: 'excel',
        ppt: 'powerpoint',
        pptx: 'powerpoint',
        txt: 'text',
        md: 'text',
        jpg: 'image',
        jpeg: 'image',
        png: 'image',
        gif: 'image',
        zip: 'archive',
        rar: 'archive',
    };
    return extMap[ext] ?? 'file';
}
