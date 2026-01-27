// DocumentTemplate types aligned with Java backend

export type TemplateType =
  | 'PROPOSAL_COVER_LETTER'
  | 'PROPOSAL_EXECUTIVE_SUMMARY'
  | 'PROPOSAL_TECHNICAL_VOLUME'
  | 'PROPOSAL_MANAGEMENT_VOLUME'
  | 'PROPOSAL_PAST_PERFORMANCE_VOLUME'
  | 'PROPOSAL_COST_VOLUME'
  | 'COMPLIANCE_MATRIX'
  | 'STATEMENT_OF_WORK'
  | 'PERFORMANCE_WORK_STATEMENT'
  | 'QUALITY_ASSURANCE_PLAN'
  | 'SECURITY_PLAN'
  | 'PROJECT_MANAGEMENT_PLAN'
  | 'NDA_MUTUAL'
  | 'NDA_ONE_WAY'
  | 'TEAMING_AGREEMENT'
  | 'SUBCONTRACT_AGREEMENT'
  | 'LETTER_OF_INTENT'
  | 'CONSULTING_AGREEMENT'
  | 'STATUS_REPORT_WEEKLY'
  | 'STATUS_REPORT_MONTHLY'
  | 'FINANCIAL_REPORT'
  | 'PROGRESS_REPORT'
  | 'INCIDENT_REPORT'
  | 'RESUME_TEMPLATE'
  | 'KEY_PERSONNEL_BIO'
  | 'ORG_CHART'
  | 'LETTER_FORMAL'
  | 'LETTER_RESPONSE'
  | 'EMAIL_TEMPLATE'
  | 'CHECKLIST'
  | 'FORM'
  | 'OTHER';

export type TemplateFormat =
  | 'WORD'
  | 'PDF'
  | 'EXCEL'
  | 'POWERPOINT'
  | 'HTML'
  | 'MARKDOWN'
  | 'TEXT';

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string | null;
  templateType: TemplateType;
  templateFormat: TemplateFormat;
  category: string;
  fileName: string;
  filePath: string;
  fileSize: number | null;
  contentType: string | null;
  templateContent: string | null;
  mergeFields: string | null;
  version: string;
  versionNotes: string | null;
  usageCount: number;
  lastUsedAt: string | null;
  isActive: boolean;
  isDefault: boolean;
  isSystemTemplate: boolean;
  tags: string | null;
  keywords: string | null;
  isApproved: boolean;
  approvedById: string | null;
  approvedByName: string | null;
  approvedAt: string | null;
  createdById: string | null;
  createdByName: string | null;
  updatedById: string | null;
  updatedByName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  templateType: TemplateType;
  templateFormat: TemplateFormat;
  category: string;
  fileName: string;
  filePath: string;
  fileSize?: number;
  contentType?: string;
  templateContent?: string;
  mergeFields?: string;
  version?: string;
  versionNotes?: string;
  tags?: string;
  keywords?: string;
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  templateType?: TemplateType;
  templateFormat?: TemplateFormat;
  category?: string;
  templateContent?: string;
  mergeFields?: string;
  version?: string;
  versionNotes?: string;
  tags?: string;
  keywords?: string;
  isActive?: boolean;
}
