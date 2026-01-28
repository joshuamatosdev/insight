/**
 * Types for Financial Domain Components
 */
import {CSSProperties, ReactNode} from 'react';
import type {
    BudgetCategory,
    BudgetFormState,
    BudgetItem,
    Invoice,
    InvoiceFormState,
    LaborRate,
    LaborRateFormState,
    TenantFinancialSummary,
} from '../../../types/financial.types';

// Budget Card Props
export interface BudgetCardProps {
  budget: BudgetItem;
  onEdit?: (budget: BudgetItem) => void;
  onDelete?: (id: string) => void;
  className?: string;
  style?: CSSProperties;
}

// Budget Form Props
export interface BudgetFormProps {
  initialData: BudgetFormState;
  onSubmit: (data: BudgetFormState) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  categories: BudgetCategory[];
}

// Budget Chart Props
export interface BudgetChartProps {
  budgeted: number;
  actual: number;
  committed: number;
  title?: string;
  className?: string;
  style?: CSSProperties;
}

// Invoice Card Props
export interface InvoiceCardProps {
  invoice: Invoice;
  onView?: (invoice: Invoice) => void;
  onSubmit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
  style?: CSSProperties;
}

// Invoice Form Props
export interface InvoiceFormProps {
  initialData: InvoiceFormState;
  onSubmit: (data: InvoiceFormState) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  contracts: Array<{ id: string; contractNumber: string }>;
}

// Invoice Line Items Props
export interface InvoiceLineItemsProps {
  invoiceId: string;
  items: Array<{
    id: string;
    lineNumber: number | null;
    description: string;
    lineType: string;
    hours: number | null;
    hourlyRate: number | null;
    quantity: number | null;
    unitPrice: number | null;
    amount: number;
  }>;
  onAddItem?: () => void;
  onDeleteItem?: (id: string) => void;
  className?: string;
  style?: CSSProperties;
}

// Labor Rate Table Props
export interface LaborRateTableProps {
  rates: LaborRate[];
  onEdit?: (rate: LaborRate) => void;
  onToggleActive?: (id: string, active: boolean) => void;
  onDelete?: (id: string) => void;
  className?: string;
  style?: CSSProperties;
}

// Labor Rate Form Props
export interface LaborRateFormProps {
  initialData: LaborRateFormState;
  onSubmit: (data: LaborRateFormState) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

// Financial Summary Card Props
export interface FinancialSummaryCardProps {
  summary: TenantFinancialSummary;
  className?: string;
  style?: CSSProperties;
}

// Cost Breakdown Chart Props
export interface CostBreakdownChartProps {
  data: Array<{
    category: string;
    amount: number;
    color: string;
  }>;
  total: number;
  title?: string;
  className?: string;
  style?: CSSProperties;
}

// Financial Metric Props
export interface FinancialMetricProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
  style?: CSSProperties;
}
