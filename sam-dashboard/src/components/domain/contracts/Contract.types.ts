import {CSSProperties} from 'react';
import type {components} from '@/types/api.generated';

/**
 * Contract types - uses the generated DTOs from the backend API
 */

// ==================== Type Aliases from OpenAPI ====================

export type Contract = components['schemas']['ContractDto'];
export type ContractSummary = components['schemas']['ContractSummaryDto'];
export type ContractClin = components['schemas']['ClinDto'];
export type ContractModification = components['schemas']['ModificationDto'];
export type ContractDeliverable = components['schemas']['DeliverableDto'];
export type ContractOption = components['schemas']['OptionDto'];

// ==================== Request Types ====================

export type CreateContractRequest = components['schemas']['CreateContractRequest'];
export type UpdateContractRequest = components['schemas']['UpdateContractRequest'];
export type CreateClinRequest = components['schemas']['CreateClinRequest'];
export type UpdateClinRequest = components['schemas']['UpdateClinRequest'];
export type CreateModificationRequest = components['schemas']['CreateModificationRequest'];
export type CreateDeliverableRequest = components['schemas']['CreateDeliverableRequest'];
export type CreateOptionRequest = components['schemas']['CreateOptionRequest'];

// ==================== Enum Types ====================

export type ContractType = NonNullable<Contract['contractType']>;
export type ContractStatus = NonNullable<Contract['status']>;
export type ClinType = NonNullable<ContractClin['clinType']>;
export type PricingType = NonNullable<ContractClin['pricingType']>;
export type ModificationType = NonNullable<ContractModification['modificationType']>;
export type ModificationStatus = NonNullable<ContractModification['status']>;
export type DeliverableType = NonNullable<ContractDeliverable['deliverableType']>;
export type DeliverableStatus = NonNullable<ContractDeliverable['status']>;
export type DeliverableFrequency = NonNullable<ContractDeliverable['frequency']>;
export type OptionStatus = NonNullable<ContractOption['status']>;

// ==================== Paginated Response ====================

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ==================== Component Props ====================

export interface ContractCardProps {
  contract: Contract;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}

export interface ContractListProps {
  contracts: Contract[];
  onContractClick?: (contract: Contract) => void;
  emptyMessage?: string;
  className?: string;
  style?: CSSProperties;
}

export interface ContractFormProps {
  contract?: Contract;
  onSubmit: (data: CreateContractRequest | UpdateContractRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface ContractStatusBadgeProps {
  status: ContractStatus;
  className?: string;
  style?: CSSProperties;
}

export interface ClinTableProps {
  clins: ContractClin[];
  onEditClin?: (clin: ContractClin) => void;
  className?: string;
  style?: CSSProperties;
}

export interface ClinFormProps {
  clin?: ContractClin;
  onSubmit: (data: CreateClinRequest | UpdateClinRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface DeliverableCardProps {
  deliverable: ContractDeliverable;
  onStatusChange?: (deliverableId: string, status: DeliverableStatus) => void;
  className?: string;
  style?: CSSProperties;
}

export interface DeliverableTrackerProps {
  deliverables: ContractDeliverable[];
  onStatusChange?: (deliverableId: string, status: DeliverableStatus) => void;
  className?: string;
  style?: CSSProperties;
}

export interface ModificationTimelineProps {
  modifications: ContractModification[];
  onExecuteModification?: (modificationId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export interface ContractValueChartProps {
  summary: ContractSummary;
  className?: string;
  style?: CSSProperties;
}

// ==================== Utility Functions ====================

export function getContractTypeLabel(type: ContractType): string {
  const labels: Record<ContractType, string> = {
    FIRM_FIXED_PRICE: 'Firm Fixed Price (FFP)',
    TIME_AND_MATERIALS: 'Time and Materials (T&M)',
    COST_PLUS_FIXED_FEE: 'Cost Plus Fixed Fee (CPFF)',
    COST_PLUS_INCENTIVE_FEE: 'Cost Plus Incentive Fee (CPIF)',
    COST_PLUS_AWARD_FEE: 'Cost Plus Award Fee (CPAF)',
    COST_REIMBURSEMENT: 'Cost Reimbursement (CR)',
    INDEFINITE_DELIVERY: 'Indefinite Delivery (IDIQ)',
    BLANKET_PURCHASE_AGREEMENT: 'Blanket Purchase Agreement (BPA)',
    BASIC_ORDERING_AGREEMENT: 'Basic Ordering Agreement (BOA)',
    TASK_ORDER: 'Task Order',
    DELIVERY_ORDER: 'Delivery Order',
    GRANT: 'Grant',
    COOPERATIVE_AGREEMENT: 'Cooperative Agreement',
    OTHER: 'Other',
  };
  return labels[type];
}

export function getContractStatusLabel(status: ContractStatus): string {
  const labels: Record<ContractStatus, string> = {
    DRAFT: 'Draft',
    AWARDED: 'Awarded',
    PENDING_SIGNATURE: 'Pending Signature',
    ACTIVE: 'Active',
    ON_HOLD: 'On Hold',
    COMPLETED: 'Completed',
    TERMINATED: 'Terminated',
    CANCELLED: 'Cancelled',
    CLOSED: 'Closed',
  };
  return labels[status];
}

export function getModificationTypeLabel(type: ModificationType): string {
  const labels: Record<ModificationType, string> = {
    ADMINISTRATIVE: 'Administrative',
    BILATERAL: 'Bilateral',
    UNILATERAL: 'Unilateral',
    SUPPLEMENTAL: 'Supplemental',
    INCREMENTAL_FUNDING: 'Incremental Funding',
    NO_COST_EXTENSION: 'No-Cost Extension',
    OPTION_EXERCISE: 'Option Exercise',
    TERMINATION: 'Termination',
    SCOPE_CHANGE: 'Scope Change',
    OTHER: 'Other',
  };
  return labels[type];
}

export function getDeliverableStatusLabel(status: DeliverableStatus): string {
  const labels: Record<DeliverableStatus, string> = {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    SUBMITTED: 'Submitted',
    UNDER_REVIEW: 'Under Review',
    REVISION_REQUIRED: 'Revision Required',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected',
    WAIVED: 'Waived',
  };
  return labels[status];
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (dateStr === null || dateStr === undefined) {
    return 'N/A';
  }
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
