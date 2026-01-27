// Document types aligned with Java backend

export type DocumentType =
  | 'RFP'
  | 'RFQ'
  | 'RFI'
  | 'SOURCES_SOUGHT'
  | 'AMENDMENT'
  | 'QUESTIONS_ANSWERS'
  | 'PROPOSAL_VOLUME'
  | 'PROPOSAL_TECHNICAL'
  | 'PROPOSAL_MANAGEMENT'
  | 'PROPOSAL_COST'
  | 'PROPOSAL_PAST_PERFORMANCE'
  | 'COVER_LETTER'
  | 'EXECUTIVE_SUMMARY'
  | 'CONTRACT'
  | 'TASK_ORDER'
  | 'MODIFICATION'
  | 'STATEMENT_OF_WORK'
  | 'PERFORMANCE_WORK_STATEMENT'
  | 'CONTRACT_DATA_REQUIREMENTS_LIST'
  | 'QUALITY_ASSURANCE_PLAN'
  | 'SECURITY_PLAN'
  | 'NDA'
  | 'TEAMING_AGREEMENT'
  | 'SUBCONTRACT'
  | 'LETTER_OF_INTENT'
  | 'ORGANIZATIONAL_CHART'
  | 'CERTIFICATE'
  | 'LICENSE'
  | 'POLICY'
  | 'PROCEDURE'
  | 'AUDIT_REPORT'
  | 'INVOICE'
  | 'RECEIPT'
  | 'PURCHASE_ORDER'
  | 'BUDGET_DOCUMENT'
  | 'RATE_SCHEDULE'
  | 'RESUME'
  | 'BIOGRAPHY'
  | 'TRAINING_CERTIFICATE'
  | 'CLEARANCE_VERIFICATION'
  | 'DELIVERABLE'
  | 'REPORT'
  | 'PRESENTATION'
  | 'MEETING_MINUTES'
  | 'STATUS_REPORT'
  | 'CORRESPONDENCE'
  | 'EMAIL'
  | 'ATTACHMENT'
  | 'TEMPLATE'
  | 'OTHER';

export type DocumentStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'ARCHIVED'
  | 'SUPERSEDED';

export type AccessLevel =
  | 'PUBLIC'
  | 'INTERNAL'
  | 'RESTRICTED'
  | 'CONFIDENTIAL'
  | 'SECRET';

export interface Document {
  id: string;
  name: string;
  description: string | null;
  documentType: DocumentType;
  status: DocumentStatus;
  accessLevel: AccessLevel;
  fileName: string;
  filePath: string;
  fileSize: number | null;
  contentType: string | null;
  fileHash: string | null;
  versionNumber: number;
  parentDocumentId: string | null;
  isLatestVersion: boolean;
  isCheckedOut: boolean;
  checkedOutById: string | null;
  checkedOutByName: string | null;
  checkedOutAt: string | null;
  tags: string | null;
  keywords: string | null;
  author: string | null;
  source: string | null;
  effectiveDate: string | null;
  expirationDate: string | null;
  approvedById: string | null;
  approvedByName: string | null;
  approvedAt: string | null;
  approvalNotes: string | null;
  folderId: string | null;
  folderName: string | null;
  opportunityId: string | null;
  contractId: string | null;
  createdById: string | null;
  createdByName: string | null;
  updatedById: string | null;
  updatedByName: string | null;
  createdAt: string;
  updatedAt: string;
  retentionDate: string | null;
  isArchived: boolean;
}

export interface CreateDocumentRequest {
  name: string;
  description?: string;
  documentType: DocumentType;
  status?: DocumentStatus;
  accessLevel?: AccessLevel;
  fileName: string;
  filePath: string;
  fileSize?: number;
  contentType?: string;
  tags?: string;
  keywords?: string;
  author?: string;
  source?: string;
  effectiveDate?: string;
  expirationDate?: string;
  folderId?: string;
  opportunityId?: string;
  contractId?: string;
}

export interface UpdateDocumentRequest {
  name?: string;
  description?: string;
  documentType?: DocumentType;
  status?: DocumentStatus;
  accessLevel?: AccessLevel;
  tags?: string;
  keywords?: string;
  author?: string;
  source?: string;
  effectiveDate?: string;
  expirationDate?: string;
  folderId?: string;
}

export interface DocumentFilters {
  search?: string;
  documentType?: DocumentType;
  status?: DocumentStatus;
  folderId?: string;
  opportunityId?: string;
  contractId?: string;
}

export interface DocumentStorageSummary {
  totalDocuments: number;
  totalSizeBytes: number;
  byType: Record<DocumentType, number>;
  byStatus: Record<DocumentStatus, number>;
}
