import type {ApiResult} from './apiClient';
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

const DOCUMENTS_BASE = '/api/documents';

/**
 * Helper to make API calls to /api/documents endpoints
 * DocumentController uses /api/documents
 */
async function documentApiGet<T>(path: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(path, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('auth') !== null
          ? {
              Authorization: `Bearer ${JSON.parse(localStorage.getItem('auth') ?? '{}').accessToken ?? ''}`,
            }
          : {}),
      },
    });

    if (response.ok === false) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      return {
        success: false,
        error: {
          message: error.message ?? 'An error occurred',
          status: response.status,
        },
      };
    }

    const data = (await response.json()) as T;
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: {
        message: err instanceof Error ? err.message : 'Network error',
        status: 0,
      },
    };
  }
}

async function documentApiPost<T, B = unknown>(path: string, body: B): Promise<ApiResult<T>> {
  try {
    const response = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('auth') !== null
          ? {
              Authorization: `Bearer ${JSON.parse(localStorage.getItem('auth') ?? '{}').accessToken ?? ''}`,
            }
          : {}),
      },
      body: JSON.stringify(body),
    });

    if (response.ok === false) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      return {
        success: false,
        error: {
          message: error.message ?? 'An error occurred',
          status: response.status,
        },
      };
    }

    const data = (await response.json()) as T;
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: {
        message: err instanceof Error ? err.message : 'Network error',
        status: 0,
      },
    };
  }
}

async function documentApiPut<T, B = unknown>(path: string, body: B): Promise<ApiResult<T>> {
  try {
    const response = await fetch(path, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('auth') !== null
          ? {
              Authorization: `Bearer ${JSON.parse(localStorage.getItem('auth') ?? '{}').accessToken ?? ''}`,
            }
          : {}),
      },
      body: JSON.stringify(body),
    });

    if (response.ok === false) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      return {
        success: false,
        error: {
          message: error.message ?? 'An error occurred',
          status: response.status,
        },
      };
    }

    const data = (await response.json()) as T;
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: {
        message: err instanceof Error ? err.message : 'Network error',
        status: 0,
      },
    };
  }
}

async function documentApiDelete<T = void>(path: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(path, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('auth') !== null
          ? {
              Authorization: `Bearer ${JSON.parse(localStorage.getItem('auth') ?? '{}').accessToken ?? ''}`,
            }
          : {}),
      },
    });

    if (response.ok === false) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      return {
        success: false,
        error: {
          message: error.message ?? 'An error occurred',
          status: response.status,
        },
      };
    }

    const text = await response.text();
    if (text.length === 0) {
      return { success: true, data: undefined as T };
    }

    const data = JSON.parse(text) as T;
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: {
        message: err instanceof Error ? err.message : 'Network error',
        status: 0,
      },
    };
  }
}

// ============ Documents ============

export async function fetchDocuments(
  page: number = 0,
  size: number = 20,
  filters?: DocumentFilters
): Promise<Page<Document>> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('size', size.toString());

  if (filters?.search !== undefined && filters.search !== '') {
    params.set('keyword', filters.search);
  }
  if (filters?.documentType !== undefined) {
    params.set('documentType', filters.documentType);
  }
  if (filters?.status !== undefined) {
    params.set('status', filters.status);
  }
  if (filters?.folderId !== undefined) {
    params.set('folderId', filters.folderId);
  }

  const response = await documentApiGet<Page<Document>>(`${DOCUMENTS_BASE}?${params.toString()}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as Page<Document>;
}

export async function fetchDocument(id: string): Promise<Document> {
  const response = await documentApiGet<Document>(`${DOCUMENTS_BASE}/${id}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as Document;
}

export async function createDocument(request: CreateDocumentRequest): Promise<Document> {
  const response = await documentApiPost<Document, CreateDocumentRequest>(`${DOCUMENTS_BASE}`, request);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as Document;
}

export async function updateDocument(id: string, request: UpdateDocumentRequest): Promise<Document> {
  const response = await documentApiPut<Document, UpdateDocumentRequest>(`${DOCUMENTS_BASE}/${id}`, request);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as Document;
}

export async function deleteDocument(id: string): Promise<void> {
  const response = await documentApiDelete<void>(`${DOCUMENTS_BASE}/${id}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
}

export async function searchDocuments(
  keyword: string,
  page: number = 0,
  size: number = 20
): Promise<Page<Document>> {
  const params = new URLSearchParams();
  params.set('keyword', keyword);
  params.set('page', page.toString());
  params.set('size', size.toString());

  const response = await documentApiGet<Page<Document>>(`${DOCUMENTS_BASE}/search?${params.toString()}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as Page<Document>;
}

export async function fetchDocumentsByFolder(
  folderId: string,
  page: number = 0,
  size: number = 20
): Promise<Page<Document>> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('size', size.toString());

  const response = await documentApiGet<Page<Document>>(`${DOCUMENTS_BASE}/folder/${folderId}?${params.toString()}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as Page<Document>;
}

export async function fetchDocumentsByOpportunity(
  opportunityId: string,
  page: number = 0,
  size: number = 20
): Promise<Page<Document>> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('size', size.toString());

  const response = await documentApiGet<Page<Document>>(`${DOCUMENTS_BASE}/opportunity/${opportunityId}?${params.toString()}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as Page<Document>;
}

export async function fetchDocumentsByContract(
  contractId: string,
  page: number = 0,
  size: number = 20
): Promise<Page<Document>> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('size', size.toString());

  const response = await documentApiGet<Page<Document>>(`${DOCUMENTS_BASE}/contract/${contractId}?${params.toString()}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as Page<Document>;
}

export async function fetchDocumentVersions(documentId: string): Promise<Document[]> {
  const response = await documentApiGet<Document[]>(`${DOCUMENTS_BASE}/${documentId}/versions`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as Document[];
}

export async function checkoutDocument(id: string): Promise<Document> {
  const response = await documentApiPost<Document>(`${DOCUMENTS_BASE}/${id}/checkout`, {});
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as Document;
}

export async function checkinDocument(
  id: string,
  newFilePath: string,
  newFileSize: number
): Promise<Document> {
  const params = new URLSearchParams();
  params.set('newFilePath', newFilePath);
  params.set('newFileSize', newFileSize.toString());

  const response = await documentApiPost<Document>(`${DOCUMENTS_BASE}/${id}/checkin?${params.toString()}`, {});
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as Document;
}

export async function updateDocumentStatus(
  id: string,
  status: DocumentStatus,
  notes?: string
): Promise<Document> {
  const params = new URLSearchParams();
  params.set('status', status);
  if (notes !== undefined) {
    params.set('notes', notes);
  }

  const response = await documentApiPost<Document>(`${DOCUMENTS_BASE}/${id}/status?${params.toString()}`, {});
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as Document;
}

export async function fetchExpiringDocuments(daysAhead: number = 30): Promise<Document[]> {
  const params = new URLSearchParams();
  params.set('daysAhead', daysAhead.toString());

  const response = await documentApiGet<Document[]>(`${DOCUMENTS_BASE}/expiring?${params.toString()}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as Document[];
}

export async function fetchStorageSummary(): Promise<DocumentStorageSummary> {
  const response = await documentApiGet<DocumentStorageSummary>(`${DOCUMENTS_BASE}/storage-summary`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as DocumentStorageSummary;
}

// ============ Folders ============

export async function fetchFolders(): Promise<DocumentFolder[]> {
  const response = await documentApiGet<DocumentFolder[]>(`${DOCUMENTS_BASE}/folders`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as DocumentFolder[];
}

export async function fetchFolder(id: string): Promise<DocumentFolder> {
  const response = await documentApiGet<DocumentFolder>(`${DOCUMENTS_BASE}/folders/${id}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as DocumentFolder;
}

export async function fetchChildFolders(parentId: string): Promise<DocumentFolder[]> {
  const response = await documentApiGet<DocumentFolder[]>(`${DOCUMENTS_BASE}/folders/${parentId}/children`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as DocumentFolder[];
}

export async function createFolder(request: CreateFolderRequest): Promise<DocumentFolder> {
  const response = await documentApiPost<DocumentFolder, CreateFolderRequest>(`${DOCUMENTS_BASE}/folders`, request);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as DocumentFolder;
}

export async function updateFolder(id: string, request: UpdateFolderRequest): Promise<DocumentFolder> {
  const response = await documentApiPut<DocumentFolder, UpdateFolderRequest>(`${DOCUMENTS_BASE}/folders/${id}`, request);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as DocumentFolder;
}

export async function deleteFolder(id: string): Promise<void> {
  const response = await documentApiDelete<void>(`${DOCUMENTS_BASE}/folders/${id}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
}

export async function searchFolders(keyword: string): Promise<DocumentFolder[]> {
  const params = new URLSearchParams();
  params.set('keyword', keyword);

  const response = await documentApiGet<DocumentFolder[]>(`${DOCUMENTS_BASE}/folders/search?${params.toString()}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as DocumentFolder[];
}

export async function fetchFolderBreadcrumb(folderId: string): Promise<DocumentFolder[]> {
  const response = await documentApiGet<DocumentFolder[]>(`${DOCUMENTS_BASE}/folders/${folderId}/breadcrumb`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as DocumentFolder[];
}

// ============ Templates ============

export async function fetchTemplates(page: number = 0, size: number = 20): Promise<Page<DocumentTemplate>> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('size', size.toString());

  const response = await documentApiGet<Page<DocumentTemplate>>(`${DOCUMENTS_BASE}/templates?${params.toString()}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as Page<DocumentTemplate>;
}

export async function fetchTemplate(id: string): Promise<DocumentTemplate> {
  const response = await documentApiGet<DocumentTemplate>(`${DOCUMENTS_BASE}/templates/${id}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as DocumentTemplate;
}

export async function createTemplate(request: CreateTemplateRequest): Promise<DocumentTemplate> {
  const response = await documentApiPost<DocumentTemplate, CreateTemplateRequest>(`${DOCUMENTS_BASE}/templates`, request);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as DocumentTemplate;
}

export async function updateTemplate(id: string, request: UpdateTemplateRequest): Promise<DocumentTemplate> {
  const response = await documentApiPut<DocumentTemplate, UpdateTemplateRequest>(`${DOCUMENTS_BASE}/templates/${id}`, request);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as DocumentTemplate;
}

export async function deleteTemplate(id: string): Promise<void> {
  const response = await documentApiDelete<void>(`${DOCUMENTS_BASE}/templates/${id}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
}

export async function approveTemplate(id: string): Promise<DocumentTemplate> {
  const response = await documentApiPost<DocumentTemplate>(`${DOCUMENTS_BASE}/templates/${id}/approve`, {});
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as DocumentTemplate;
}

export async function setDefaultTemplate(id: string): Promise<DocumentTemplate> {
  const response = await documentApiPost<DocumentTemplate>(`${DOCUMENTS_BASE}/templates/${id}/set-default`, {});
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as DocumentTemplate;
}

export async function recordTemplateUsage(id: string): Promise<void> {
  const response = await documentApiPost<void>(`${DOCUMENTS_BASE}/templates/${id}/use`, {});
  if (response.success === false) {
    throw new Error(response.error.message);
  }
}

export async function searchTemplates(
  keyword: string,
  page: number = 0,
  size: number = 20
): Promise<Page<DocumentTemplate>> {
  const params = new URLSearchParams();
  params.set('keyword', keyword);
  params.set('page', page.toString());
  params.set('size', size.toString());

  const response = await documentApiGet<Page<DocumentTemplate>>(`${DOCUMENTS_BASE}/templates/search?${params.toString()}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as Page<DocumentTemplate>;
}

export async function fetchTemplatesByType(type: TemplateType): Promise<DocumentTemplate[]> {
  const response = await documentApiGet<DocumentTemplate[]>(`${DOCUMENTS_BASE}/templates/type/${type}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as DocumentTemplate[];
}

export async function fetchTemplateCategories(): Promise<string[]> {
  const response = await documentApiGet<string[]>(`${DOCUMENTS_BASE}/templates/categories`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data as string[];
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
