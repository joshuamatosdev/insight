import {CSSProperties} from 'react';

// ==================== Enums ====================

export type ContractType =
  | 'FIRM_FIXED_PRICE'
  | 'TIME_AND_MATERIALS'
  | 'COST_PLUS_FIXED_FEE'
  | 'COST_PLUS_INCENTIVE_FEE'
  | 'COST_PLUS_AWARD_FEE'
  | 'COST_REIMBURSEMENT'
  | 'INDEFINITE_DELIVERY'
  | 'BLANKET_PURCHASE_AGREEMENT'
  | 'BASIC_ORDERING_AGREEMENT'
  | 'TASK_ORDER'
  | 'DELIVERY_ORDER'
  | 'GRANT'
  | 'COOPERATIVE_AGREEMENT'
  | 'OTHER';

export type ContractStatus =
  | 'DRAFT'
  | 'AWARDED'
  | 'PENDING_SIGNATURE'
  | 'ACTIVE'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'TERMINATED'
  | 'CANCELLED'
  | 'CLOSED';

export type ClinType = 'BASE' | 'OPTION' | 'DATA' | 'SERVICES' | 'SUPPLIES' | 'OTHER';

export type PricingType =
  | 'FIRM_FIXED_PRICE'
  | 'TIME_AND_MATERIALS'
  | 'LABOR_HOUR'
  | 'COST_PLUS_FIXED_FEE'
  | 'COST_PLUS_INCENTIVE_FEE'
  | 'COST_REIMBURSEMENT';

export type ModificationType =
  | 'ADMINISTRATIVE'
  | 'BILATERAL'
  | 'UNILATERAL'
  | 'SUPPLEMENTAL'
  | 'INCREMENTAL_FUNDING'
  | 'NO_COST_EXTENSION'
  | 'OPTION_EXERCISE'
  | 'TERMINATION'
  | 'SCOPE_CHANGE'
  | 'OTHER';

export type ModificationStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'EXECUTED'
  | 'REJECTED'
  | 'CANCELLED';

export type DeliverableType =
  | 'REPORT'
  | 'DATA'
  | 'SOFTWARE'
  | 'DOCUMENTATION'
  | 'HARDWARE'
  | 'SERVICES'
  | 'MILESTONE'
  | 'STATUS_REPORT'
  | 'FINANCIAL_REPORT'
  | 'TECHNICAL_REPORT'
  | 'OTHER';

export type DeliverableStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'REVISION_REQUIRED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WAIVED';

export type DeliverableFrequency =
  | 'ONE_TIME'
  | 'DAILY'
  | 'WEEKLY'
  | 'BI_WEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'SEMI_ANNUALLY'
  | 'ANNUALLY'
  | 'AS_REQUIRED';

export type OptionStatus = 'PENDING' | 'EXERCISED' | 'DECLINED' | 'EXPIRED';

// ==================== DTOs ====================

export interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  description: string | null;
  contractType: ContractType;
  status: ContractStatus;
  parentContractId: string | null;
  opportunityId: string | null;
  agency: string | null;
  agencyCode: string | null;
  subAgency: string | null;
  office: string | null;
  popStartDate: string | null;
  popEndDate: string | null;
  basePeriodEndDate: string | null;
  finalOptionEndDate: string | null;
  baseValue: number | null;
  totalValue: number | null;
  ceilingValue: number | null;
  fundedValue: number | null;
  naicsCode: string | null;
  pscCode: string | null;
  placeOfPerformanceCity: string | null;
  placeOfPerformanceState: string | null;
  placeOfPerformanceCountry: string | null;
  contractingOfficerName: string | null;
  contractingOfficerEmail: string | null;
  corName: string | null;
  corEmail: string | null;
  primeContractor: string | null;
  isSubcontract: boolean;
  contractVehicle: string | null;
  setAsideType: string | null;
  requiresClearance: boolean;
  clearanceLevel: string | null;
  programManagerId: string | null;
  programManagerName: string | null;
  contractManagerId: string | null;
  contractManagerName: string | null;
  awardDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContractClin {
  id: string;
  clinNumber: string;
  description: string | null;
  clinType: ClinType;
  pricingType: PricingType | null;
  unitOfIssue: string | null;
  quantity: number | null;
  unitPrice: number | null;
  totalValue: number | null;
  fundedAmount: number | null;
  obligatedAmount: number | null;
  invoicedAmount: number | null;
  remainingFunds: number | null;
  naicsCode: string | null;
  pscCode: string | null;
  isOption: boolean;
  optionPeriod: number | null;
  notes: string | null;
}

export interface ContractModification {
  id: string;
  modificationNumber: string;
  title: string | null;
  description: string | null;
  modificationType: ModificationType;
  status: ModificationStatus;
  effectiveDate: string | null;
  executedDate: string | null;
  valueChange: number | null;
  fundingChange: number | null;
  newTotalValue: number | null;
  popExtensionDays: number | null;
  newPopEndDate: string | null;
  scopeChangeSummary: string | null;
  requestingOffice: string | null;
  contractingOfficerName: string | null;
  reason: string | null;
  createdAt: string;
}

export interface ContractDeliverable {
  id: string;
  cdrlNumber: string | null;
  title: string;
  description: string | null;
  deliverableType: DeliverableType;
  status: DeliverableStatus;
  dueDate: string | null;
  submittedDate: string | null;
  acceptedDate: string | null;
  frequency: DeliverableFrequency | null;
  nextDueDate: string | null;
  clinId: string | null;
  clinNumber: string | null;
  ownerId: string | null;
  ownerName: string | null;
  reviewerName: string | null;
  reviewComments: string | null;
  formatRequirements: string | null;
  notes: string | null;
  isOverdue: boolean;
  isDueSoon: boolean;
}

export interface ContractOption {
  id: string;
  optionNumber: number;
  optionYear: number | null;
  description: string | null;
  status: OptionStatus;
  startDate: string | null;
  endDate: string | null;
  exerciseDeadline: string | null;
  exercisedDate: string | null;
  optionValue: number | null;
  durationMonths: number | null;
  exerciseModificationNumber: string | null;
  notes: string | null;
  isDeadlineApproaching: boolean;
}

export interface ContractSummary {
  contractId: string;
  contractNumber: string;
  title: string;
  status: ContractStatus;
  totalValue: number | null;
  fundedValue: number | null;
  clinTotalValue: number;
  clinFundedAmount: number;
  clinInvoicedAmount: number;
  remainingFunds: number;
  modificationCount: number;
  pendingModifications: number;
  pendingOptions: number;
  pendingOptionValue: number;
  pendingDeliverables: number;
  overdueDeliverables: number;
  popStartDate: string | null;
  popEndDate: string | null;
}

// ==================== Request DTOs ====================

export interface CreateContractRequest {
  contractNumber: string;
  title: string;
  description?: string;
  contractType: ContractType;
  parentContractId?: string;
  opportunityId?: string;
  agency?: string;
  agencyCode?: string;
  subAgency?: string;
  office?: string;
  popStartDate?: string;
  popEndDate?: string;
  basePeriodEndDate?: string;
  finalOptionEndDate?: string;
  baseValue?: number;
  totalValue?: number;
  ceilingValue?: number;
  fundedValue?: number;
  naicsCode?: string;
  pscCode?: string;
  placeOfPerformanceCity?: string;
  placeOfPerformanceState?: string;
  placeOfPerformanceCountry?: string;
  contractingOfficerName?: string;
  contractingOfficerEmail?: string;
  contractingOfficerPhone?: string;
  corName?: string;
  corEmail?: string;
  corPhone?: string;
  primeContractor?: string;
  isSubcontract?: boolean;
  contractVehicle?: string;
  setAsideType?: string;
  smallBusinessGoalPercentage?: number;
  requiresClearance?: boolean;
  clearanceLevel?: string;
  programManagerId?: string;
  contractManagerId?: string;
  awardDate?: string;
  internalNotes?: string;
}

export interface UpdateContractRequest {
  title?: string;
  description?: string;
  status?: ContractStatus;
  agency?: string;
  popStartDate?: string;
  popEndDate?: string;
  totalValue?: number;
  fundedValue?: number;
  contractingOfficerName?: string;
  contractingOfficerEmail?: string;
  corName?: string;
  corEmail?: string;
  programManagerId?: string;
  contractManagerId?: string;
  internalNotes?: string;
}

export interface CreateClinRequest {
  clinNumber: string;
  description?: string;
  clinType: ClinType;
  pricingType?: PricingType;
  unitOfIssue?: string;
  quantity?: number;
  unitPrice?: number;
  totalValue?: number;
  fundedAmount?: number;
  naicsCode?: string;
  pscCode?: string;
  isOption?: boolean;
  optionPeriod?: number;
  notes?: string;
}

export interface UpdateClinRequest {
  description?: string;
  totalValue?: number;
  fundedAmount?: number;
  invoicedAmount?: number;
  notes?: string;
}

export interface CreateModificationRequest {
  modificationNumber: string;
  title?: string;
  description?: string;
  modificationType: ModificationType;
  effectiveDate?: string;
  valueChange?: number;
  fundingChange?: number;
  newTotalValue?: number;
  popExtensionDays?: number;
  newPopEndDate?: string;
  scopeChangeSummary?: string;
  requestingOffice?: string;
  contractingOfficerName?: string;
  reason?: string;
  internalNotes?: string;
}

export interface CreateDeliverableRequest {
  cdrlNumber?: string;
  title: string;
  description?: string;
  deliverableType: DeliverableType;
  dueDate?: string;
  frequency?: DeliverableFrequency;
  clinId?: string;
  ownerId?: string;
  formatRequirements?: string;
  distributionList?: string;
  copiesRequired?: number;
  notes?: string;
}

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
