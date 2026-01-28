/**
 * Types for Compliance Domain Components
 */

import type {
    Certification,
    CertificationFormErrors,
    CertificationFormState,
    CertificationStatus,
    CertificationType,
    ClearanceFormErrors,
    ClearanceFormState,
    ClearanceLevel,
    ClearanceStatus,
    ClearanceType,
    CycloneDxBom,
    SbomComponent,
    SecurityClearance,
} from '../../../types/compliance.types';

// ==================== Certification Component Props ====================

export interface CertificationCardProps {
  certification: Certification;
  onEdit?: (certification: Certification) => void;
  onDelete?: (id: string) => void;
  onViewDetails?: (certification: Certification) => void;
}

export interface CertificationFormProps {
  initialData?: CertificationFormState;
  onSubmit: (data: CertificationFormState) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export interface CertificationListProps {
  certifications: Certification[];
  onEdit?: (certification: Certification) => void;
  onDelete?: (id: string) => void;
  onViewDetails?: (certification: Certification) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

// ==================== Clearance Component Props ====================

export interface ClearanceCardProps {
  clearance: SecurityClearance;
  onEdit?: (clearance: SecurityClearance) => void;
  onDelete?: (id: string) => void;
}

export interface ClearanceFormProps {
  initialData?: ClearanceFormState;
  onSubmit: (data: ClearanceFormState) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export interface ClearanceListProps {
  clearances: SecurityClearance[];
  onEdit?: (clearance: SecurityClearance) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

// ==================== Status Badge Props ====================

export type ComplianceStatusType = 'certification' | 'clearance';

export interface ComplianceStatusBadgeProps {
  status: CertificationStatus | ClearanceStatus;
  type?: ComplianceStatusType;
  size?: 'sm' | 'md' | 'lg';
}

// ==================== SBOM Component Props ====================

export interface SbomViewerProps {
  bom: CycloneDxBom | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export interface SbomComponentCardProps {
  component: SbomComponent;
  level?: number;
}

// ==================== Expiration Alert Props ====================

export interface ExpirationAlertProps {
  expiringCertifications: Certification[];
  expiringClearances: SecurityClearance[];
  daysThreshold?: number;
  onViewCertification?: (certification: Certification) => void;
  onViewClearance?: (clearance: SecurityClearance) => void;
}

export interface ExpirationAlertItemProps {
  type: 'certification' | 'clearance';
  name: string;
  expirationDate: string;
  daysUntilExpiration: number;
  onClick?: () => void;
}

// ==================== Helper Types ====================

export interface CertificationTypeOption {
  value: CertificationType;
  label: string;
  category: 'federal' | 'state' | 'industry' | 'security';
}

export interface ClearanceLevelOption {
  value: ClearanceLevel;
  label: string;
  abbreviation: string;
}

export interface ClearanceTypeOption {
  value: ClearanceType;
  label: string;
}

// Re-export types from compliance.types for convenience
export type {
  Certification,
  CertificationFormState,
  CertificationFormErrors,
  CertificationType,
  CertificationStatus,
  SecurityClearance,
  ClearanceFormState,
  ClearanceFormErrors,
  ClearanceType,
  ClearanceLevel,
  ClearanceStatus,
  SbomComponent,
  CycloneDxBom,
};
