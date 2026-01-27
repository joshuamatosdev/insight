/**
 * Financial Management Types
 */

// Invoice Types
export type InvoiceType =
  | 'PROGRESS'
  | 'MILESTONE'
  | 'FIXED_PRICE'
  | 'FINAL'
  | 'RETAINAGE_RELEASE'
  | 'ADJUSTMENT'
  | 'REIMBURSEMENT';

export type InvoiceStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'SUBMITTED'
  | 'RECEIVED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'DISPUTED'
  | 'REJECTED'
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'CANCELLED';

export type LineItemType =
  | 'DIRECT_LABOR'
  | 'SUBCONTRACTOR_LABOR'
  | 'MATERIALS'
  | 'EQUIPMENT'
  | 'TRAVEL'
  | 'ODC'
  | 'FIXED_PRICE'
  | 'MILESTONE'
  | 'FEE'
  | 'ADJUSTMENT'
  | 'OTHER';

export type BudgetCategory =
  | 'DIRECT_LABOR'
  | 'SUBCONTRACTOR'
  | 'MATERIALS'
  | 'EQUIPMENT'
  | 'TRAVEL'
  | 'ODC'
  | 'INDIRECT'
  | 'FEE'
  | 'CONTINGENCY'
  | 'OTHER';

// Invoice DTOs
export interface Invoice {
  id: string;
  contractId: string;
  contractNumber: string;
  invoiceNumber: string;
  invoiceType: InvoiceType;
  status: InvoiceStatus;
  invoiceDate: string;
  periodStart: string | null;
  periodEnd: string | null;
  dueDate: string | null;
  submittedDate: string | null;
  paidDate: string | null;
  subtotal: number;
  adjustments: number;
  totalAmount: number;
  amountPaid: number;
  retainage: number;
  balance: number;
  paymentMethod: string | null;
  paymentReference: string | null;
  voucherNumber: string | null;
  notes: string | null;
  isOverdue: boolean;
  daysOutstanding: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  clinId: string | null;
  lineNumber: number | null;
  description: string;
  lineType: LineItemType;
  laborCategory: string | null;
  employeeName: string | null;
  hours: number | null;
  hourlyRate: number | null;
  quantity: number | null;
  unitOfMeasure: string | null;
  unitPrice: number | null;
  amount: number;
  directCost: number | null;
  indirectCost: number | null;
  fee: number | null;
  notes: string | null;
}

export interface CreateInvoiceRequest {
  contractId: string;
  invoiceNumber: string;
  invoiceType: InvoiceType;
  invoiceDate: string;
  periodStart?: string;
  periodEnd?: string;
  dueDate?: string;
  notes?: string;
}

export interface UpdateInvoiceRequest {
  invoiceDate?: string;
  periodStart?: string;
  periodEnd?: string;
  dueDate?: string;
  adjustments?: number;
  notes?: string;
}

export interface CreateLineItemRequest {
  clinId?: string;
  lineNumber?: number;
  description: string;
  lineType: LineItemType;
  laborCategory?: string;
  employeeName?: string;
  hours?: number;
  hourlyRate?: number;
  quantity?: number;
  unitOfMeasure?: string;
  unitPrice?: number;
  amount: number;
  directCost?: number;
  indirectCost?: number;
  fee?: number;
  notes?: string;
}

// Budget DTOs
export interface BudgetItem {
  id: string;
  contractId: string;
  clinId: string | null;
  clinNumber: string | null;
  name: string;
  description: string | null;
  category: BudgetCategory;
  budgetedAmount: number;
  actualAmount: number;
  committedAmount: number;
  forecastAmount: number | null;
  variance: number;
  variancePercentage: number;
  remainingBudget: number;
  isOverBudget: boolean;
  periodStart: string | null;
  periodEnd: string | null;
  fiscalYear: number | null;
  fiscalPeriod: number | null;
  lastUpdatedDate: string | null;
  notes: string | null;
}

export interface CreateBudgetItemRequest {
  contractId: string;
  clinId?: string;
  name: string;
  description?: string;
  category: BudgetCategory;
  budgetedAmount: number;
  forecastAmount?: number;
  periodStart?: string;
  periodEnd?: string;
  fiscalYear?: number;
  fiscalPeriod?: number;
  notes?: string;
}

export interface UpdateBudgetItemRequest {
  budgetedAmount?: number;
  actualAmount?: number;
  committedAmount?: number;
  forecastAmount?: number;
  notes?: string;
}

export interface BudgetSummary {
  contractId: string;
  totalBudget: number;
  actualSpent: number;
  committed: number;
  remaining: number;
  variancePercent: number;
  itemCount: number;
  overBudgetCount: number;
}

// Labor Rate DTOs
export interface LaborRate {
  id: string;
  contractId: string | null;
  laborCategory: string;
  laborCategoryDescription: string | null;
  minYearsExperience: number | null;
  maxYearsExperience: number | null;
  educationRequirement: string | null;
  baseRate: number;
  fringeRate: number | null;
  overheadRate: number | null;
  gaRate: number | null;
  feeRate: number | null;
  fullyBurdenedRate: number | null;
  billingRate: number | null;
  rateType: string | null;
  effectiveDate: string | null;
  endDate: string | null;
  fiscalYear: number | null;
  scaCode: string | null;
  scaWageDetermination: string | null;
  notes: string | null;
  isActive: boolean;
}

export interface CreateLaborRateRequest {
  contractId?: string;
  laborCategory: string;
  laborCategoryDescription?: string;
  minYearsExperience?: number;
  maxYearsExperience?: number;
  educationRequirement?: string;
  baseRate: number;
  fringeRate?: number;
  overheadRate?: number;
  gaRate?: number;
  feeRate?: number;
  billingRate?: number;
  rateType?: string;
  effectiveDate?: string;
  endDate?: string;
  fiscalYear?: number;
  scaCode?: string;
  scaWageDetermination?: string;
  notes?: string;
}

export interface UpdateLaborRateRequest {
  baseRate?: number;
  fringeRate?: number;
  overheadRate?: number;
  gaRate?: number;
  feeRate?: number;
  billingRate?: number;
  effectiveDate?: string;
  endDate?: string;
  isActive?: boolean;
  notes?: string;
}

// Financial Summary DTOs
export interface ContractFinancialSummary {
  contractId: string;
  contractNumber: string;
  totalContractValue: number;
  fundedValue: number;
  totalBudget: number;
  actualSpent: number;
  committed: number;
  remainingBudget: number;
  totalInvoiced: number;
  totalPaid: number;
  outstandingBalance: number;
  unpaidInvoiceCount: number;
}

export interface TenantFinancialSummary {
  totalInvoiced: number;
  totalOutstanding: number;
  draftInvoices: number;
  submittedInvoices: number;
  overdueInvoices: number;
}

// Paginated Response
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// Form States
export interface InvoiceFormState {
  contractId: string;
  invoiceNumber: string;
  invoiceType: InvoiceType;
  invoiceDate: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  notes: string;
}

export interface InvoiceFormErrors {
  contractId?: string;
  invoiceNumber?: string;
  invoiceType?: string;
  invoiceDate?: string;
  general?: string;
}

export interface BudgetFormState {
  contractId: string;
  clinId: string;
  name: string;
  description: string;
  category: BudgetCategory;
  budgetedAmount: string;
  forecastAmount: string;
  periodStart: string;
  periodEnd: string;
  fiscalYear: string;
  fiscalPeriod: string;
  notes: string;
}

export interface BudgetFormErrors {
  name?: string;
  category?: string;
  budgetedAmount?: string;
  general?: string;
}

export interface LaborRateFormState {
  contractId: string;
  laborCategory: string;
  laborCategoryDescription: string;
  minYearsExperience: string;
  maxYearsExperience: string;
  educationRequirement: string;
  baseRate: string;
  fringeRate: string;
  overheadRate: string;
  gaRate: string;
  feeRate: string;
  billingRate: string;
  rateType: string;
  effectiveDate: string;
  endDate: string;
  fiscalYear: string;
  notes: string;
}

export interface LaborRateFormErrors {
  laborCategory?: string;
  baseRate?: string;
  general?: string;
}
