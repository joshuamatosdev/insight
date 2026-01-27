/**
 * Types for Compliance Management - Certifications, Clearances, and SBOM
 */

// ==================== Certification Types ====================

export type CertificationType =
  | 'SAM_REGISTRATION'
  | 'EIGHT_A'
  | 'HUBZONE'
  | 'WOSB'
  | 'EDWOSB'
  | 'SDVOSB'
  | 'VOSB'
  | 'SBA_MENTOR_PROTEGE'
  | 'DBE'
  | 'MBE'
  | 'WBE'
  | 'SBE'
  | 'STATE_CERTIFICATION'
  | 'ISO_9001'
  | 'ISO_27001'
  | 'ISO_20000'
  | 'CMMI'
  | 'SOC2'
  | 'FEDRAMP'
  | 'FACILITY_CLEARANCE'
  | 'CMMC'
  | 'OTHER';

export type CertificationStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'RENEWAL_IN_PROGRESS'
  | 'SUSPENDED'
  | 'REVOKED'
  | 'GRADUATED';

export interface Certification {
  id: string;
  certificationType: CertificationType;
  name: string;
  description: string | null;
  status: CertificationStatus;
  certificateNumber: string | null;
  issuingAgency: string | null;
  issueDate: string | null;
  expirationDate: string | null;
  renewalDate: string | null;
  naicsCode: string | null;
  sizeStandard: string | null;
  uei: string | null;
  cageCode: string | null;
  samRegistrationDate: string | null;
  samExpirationDate: string | null;
  eightAEntryDate: string | null;
  eightAGraduationDate: string | null;
  hubzoneCertificationDate: string | null;
  documentUrl: string | null;
  notes: string | null;
  reminderDaysBefore: number;
  reminderSent: boolean;
  daysUntilExpiration: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCertificationRequest {
  certificationType: CertificationType;
  name: string;
  description?: string;
  certificateNumber?: string;
  issuingAgency?: string;
  issueDate?: string;
  expirationDate?: string;
  renewalDate?: string;
  naicsCode?: string;
  sizeStandard?: string;
  uei?: string;
  cageCode?: string;
  samRegistrationDate?: string;
  samExpirationDate?: string;
  eightAEntryDate?: string;
  eightAGraduationDate?: string;
  hubzoneCertificationDate?: string;
  documentUrl?: string;
  notes?: string;
  reminderDaysBefore?: number;
}

export interface UpdateCertificationRequest extends CreateCertificationRequest {
  status?: CertificationStatus;
}

// ==================== Security Clearance Types ====================

export type ClearanceType =
  | 'PERSONNEL'
  | 'FACILITY'
  | 'INTERIM_PERSONNEL'
  | 'INTERIM_FACILITY';

export type ClearanceLevel =
  | 'CONFIDENTIAL'
  | 'SECRET'
  | 'TOP_SECRET'
  | 'TOP_SECRET_SCI'
  | 'Q_CLEARANCE'
  | 'L_CLEARANCE';

export type ClearanceStatus =
  | 'PENDING'
  | 'INTERIM'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'SUSPENDED'
  | 'REVOKED'
  | 'INACTIVE';

export interface SecurityClearance {
  id: string;
  userId: string | null;
  entityName: string | null;
  userName: string | null;
  clearanceType: ClearanceType;
  clearanceLevel: ClearanceLevel;
  status: ClearanceStatus;
  investigationDate: string | null;
  grantDate: string | null;
  expirationDate: string | null;
  reinvestigationDate: string | null;
  polygraphType: string | null;
  polygraphDate: string | null;
  sponsoringAgency: string | null;
  caseNumber: string | null;
  cageCode: string | null;
  facilityAddress: string | null;
  fsoName: string | null;
  fsoEmail: string | null;
  fsoPhone: string | null;
  sciAccess: boolean;
  sciPrograms: string | null;
  sapAccess: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClearanceRequest {
  userId?: string;
  entityName?: string;
  clearanceType: ClearanceType;
  clearanceLevel: ClearanceLevel;
  investigationDate?: string;
  grantDate?: string;
  expirationDate?: string;
  reinvestigationDate?: string;
  polygraphType?: string;
  polygraphDate?: string;
  sponsoringAgency?: string;
  caseNumber?: string;
  cageCode?: string;
  facilityAddress?: string;
  fsoName?: string;
  fsoEmail?: string;
  fsoPhone?: string;
  sciAccess?: boolean;
  sciPrograms?: string;
  sapAccess?: boolean;
  notes?: string;
}

export interface UpdateClearanceRequest extends CreateClearanceRequest {
  status?: ClearanceStatus;
}

// ==================== SBOM Types ====================

export interface SbomInfo {
  application: string;
  sbomVersion: string;
  formats: Record<string, string>;
  cyclonedxAvailable: boolean;
  spdxAvailable: boolean;
  standard: string;
  generationCommand: string;
}

export interface SbomVulnerabilityInfo {
  status: string;
  message: string;
  recommendation: string;
}

export interface SbomComponent {
  name: string;
  version: string;
  type: string;
  purl?: string;
  license?: string;
  description?: string;
  author?: string;
  dependencies?: SbomDependency[];
}

export interface SbomDependency {
  ref: string;
  dependsOn: string[];
}

export interface CycloneDxBom {
  bomFormat: string;
  specVersion: string;
  serialNumber: string;
  version: number;
  metadata: {
    timestamp: string;
    tools: Array<{ vendor: string; name: string; version: string }>;
    component: { type: string; name: string; version: string };
  };
  components: SbomComponent[];
  dependencies: SbomDependency[];
}

// ==================== Compliance Overview Types ====================

export interface ComplianceOverview {
  totalCertifications: number;
  activeCertifications: number;
  expiringCertifications: number;
  expiredCertifications: number;
  totalClearances: number;
  activeClearances: number;
  expiringClearances: number;
}

// ==================== Paginated Response ====================

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ==================== Form State Types ====================

export interface CertificationFormState {
  certificationType: CertificationType;
  name: string;
  description: string;
  certificateNumber: string;
  issuingAgency: string;
  issueDate: string;
  expirationDate: string;
  renewalDate: string;
  naicsCode: string;
  sizeStandard: string;
  uei: string;
  cageCode: string;
  samRegistrationDate: string;
  samExpirationDate: string;
  eightAEntryDate: string;
  eightAGraduationDate: string;
  hubzoneCertificationDate: string;
  documentUrl: string;
  notes: string;
  reminderDaysBefore: string;
}

export interface CertificationFormErrors {
  name?: string;
  certificationType?: string;
  expirationDate?: string;
  general?: string;
}

export interface ClearanceFormState {
  userId: string;
  entityName: string;
  clearanceType: ClearanceType;
  clearanceLevel: ClearanceLevel;
  investigationDate: string;
  grantDate: string;
  expirationDate: string;
  reinvestigationDate: string;
  polygraphType: string;
  polygraphDate: string;
  sponsoringAgency: string;
  caseNumber: string;
  cageCode: string;
  facilityAddress: string;
  fsoName: string;
  fsoEmail: string;
  fsoPhone: string;
  sciAccess: boolean;
  sciPrograms: string;
  sapAccess: boolean;
  notes: string;
}

export interface ClearanceFormErrors {
  clearanceType?: string;
  clearanceLevel?: string;
  expirationDate?: string;
  general?: string;
}
