/**
 * Financial Service - API calls for financial management
 */
import type {
  Invoice,
  InvoiceLineItem,
  BudgetItem,
  LaborRate,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  CreateLineItemRequest,
  CreateBudgetItemRequest,
  UpdateBudgetItemRequest,
  CreateLaborRateRequest,
  UpdateLaborRateRequest,
  BudgetSummary,
  ContractFinancialSummary,
  TenantFinancialSummary,
  PaginatedResponse,
  InvoiceStatus,
} from '../types/financial.types';

const API_BASE = '/api';
const AUTH_STORAGE_KEY = 'sam_auth_state';

/**
 * Gets the auth token from localStorage
 */
function getAuthToken(): string | null {
  try {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored === null) {
      return null;
    }
    const parsed = JSON.parse(stored);
    return parsed.token ?? null;
  } catch {
    return null;
  }
}

/**
 * Creates headers with auth token if available
 */
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token !== null) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Authenticated fetch wrapper
 */
async function authFetch(url: string, options?: RequestInit): Promise<Response> {
  const headers = {
    ...getAuthHeaders(),
    ...options?.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Handles API errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok === false) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ?? `API request failed: ${response.statusText}`
    );
  }
  return response.json();
}

// ==================== Invoice API ====================

export async function fetchInvoices(
  page: number = 0,
  size: number = 20
): Promise<PaginatedResponse<Invoice>> {
  const response = await authFetch(
    `${API_BASE}/v1/invoices?page=${page}&size=${size}`
  );
  return handleResponse<PaginatedResponse<Invoice>>(response);
}

export async function fetchInvoice(id: string): Promise<Invoice> {
  const response = await authFetch(`${API_BASE}/v1/invoices/${id}`);
  return handleResponse<Invoice>(response);
}

export async function fetchInvoicesByContract(
  contractId: string,
  page: number = 0,
  size: number = 20
): Promise<PaginatedResponse<Invoice>> {
  const response = await authFetch(
    `${API_BASE}/v1/invoices/contract/${contractId}?page=${page}&size=${size}`
  );
  return handleResponse<PaginatedResponse<Invoice>>(response);
}

export async function fetchInvoicesByStatus(
  status: InvoiceStatus,
  page: number = 0,
  size: number = 20
): Promise<PaginatedResponse<Invoice>> {
  const response = await authFetch(
    `${API_BASE}/v1/invoices?status=${status}&page=${page}&size=${size}`
  );
  return handleResponse<PaginatedResponse<Invoice>>(response);
}

export async function fetchOverdueInvoices(): Promise<Invoice[]> {
  const response = await authFetch(`${API_BASE}/v1/invoices/overdue`);
  return handleResponse<Invoice[]>(response);
}

export async function createInvoice(request: CreateInvoiceRequest): Promise<Invoice> {
  const response = await authFetch(`${API_BASE}/v1/invoices`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return handleResponse<Invoice>(response);
}

export async function updateInvoice(
  id: string,
  request: UpdateInvoiceRequest
): Promise<Invoice> {
  const response = await authFetch(`${API_BASE}/v1/invoices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  });
  return handleResponse<Invoice>(response);
}

export async function deleteInvoice(id: string): Promise<void> {
  const response = await authFetch(`${API_BASE}/v1/invoices/${id}`, {
    method: 'DELETE',
  });
  if (response.ok === false) {
    throw new Error(`Failed to delete invoice: ${response.statusText}`);
  }
}

export async function submitInvoice(id: string): Promise<void> {
  const response = await authFetch(`${API_BASE}/v1/invoices/${id}/submit`, {
    method: 'POST',
  });
  if (response.ok === false) {
    throw new Error(`Failed to submit invoice: ${response.statusText}`);
  }
}

export async function approveInvoice(id: string): Promise<void> {
  const response = await authFetch(`${API_BASE}/v1/invoices/${id}/approve`, {
    method: 'POST',
  });
  if (response.ok === false) {
    throw new Error(`Failed to approve invoice: ${response.statusText}`);
  }
}

export async function markInvoicePaid(
  id: string,
  paidDate: string,
  paidAmount: number
): Promise<void> {
  const response = await authFetch(
    `${API_BASE}/v1/invoices/${id}/pay?paidDate=${paidDate}&paidAmount=${paidAmount}`,
    { method: 'POST' }
  );
  if (response.ok === false) {
    throw new Error(`Failed to mark invoice as paid: ${response.statusText}`);
  }
}

export async function rejectInvoice(id: string, reason: string): Promise<void> {
  const response = await authFetch(
    `${API_BASE}/v1/invoices/${id}/reject?reason=${encodeURIComponent(reason)}`,
    { method: 'POST' }
  );
  if (response.ok === false) {
    throw new Error(`Failed to reject invoice: ${response.statusText}`);
  }
}

export async function fetchInvoiceSummary(): Promise<{
  totalCount: number;
  draftCount: number;
  submittedCount: number;
  overdueCount: number;
  totalAmount: number;
  outstandingAmount: number;
}> {
  const response = await authFetch(`${API_BASE}/v1/invoices/summary`);
  return handleResponse(response);
}

// ==================== Invoice Line Items API ====================

export async function fetchInvoiceLineItems(
  invoiceId: string
): Promise<InvoiceLineItem[]> {
  const response = await authFetch(
    `${API_BASE}/financial/invoices/${invoiceId}/line-items`
  );
  return handleResponse<InvoiceLineItem[]>(response);
}

export async function addInvoiceLineItem(
  invoiceId: string,
  request: CreateLineItemRequest
): Promise<InvoiceLineItem> {
  const response = await authFetch(
    `${API_BASE}/financial/invoices/${invoiceId}/line-items`,
    {
      method: 'POST',
      body: JSON.stringify(request),
    }
  );
  return handleResponse<InvoiceLineItem>(response);
}

export async function deleteInvoiceLineItem(
  invoiceId: string,
  lineItemId: string
): Promise<void> {
  const response = await authFetch(
    `${API_BASE}/financial/invoices/${invoiceId}/line-items/${lineItemId}`,
    { method: 'DELETE' }
  );
  if (response.ok === false) {
    throw new Error(`Failed to delete line item: ${response.statusText}`);
  }
}

// ==================== Budget API ====================

export async function fetchBudgets(
  page: number = 0,
  size: number = 20,
  category?: string
): Promise<PaginatedResponse<BudgetItem>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (category !== undefined) {
    params.append('category', category);
  }
  const response = await authFetch(`${API_BASE}/v1/budgets?${params}`);
  return handleResponse<PaginatedResponse<BudgetItem>>(response);
}

export async function fetchBudget(id: string): Promise<BudgetItem> {
  const response = await authFetch(`${API_BASE}/v1/budgets/${id}`);
  return handleResponse<BudgetItem>(response);
}

export async function fetchBudgetsByContract(
  contractId: string,
  page: number = 0,
  size: number = 20
): Promise<PaginatedResponse<BudgetItem>> {
  const response = await authFetch(
    `${API_BASE}/v1/budgets/contract/${contractId}?page=${page}&size=${size}`
  );
  return handleResponse<PaginatedResponse<BudgetItem>>(response);
}

export async function fetchContractBudgetSummary(
  contractId: string
): Promise<BudgetSummary> {
  const response = await authFetch(
    `${API_BASE}/v1/budgets/contract/${contractId}/summary`
  );
  return handleResponse<BudgetSummary>(response);
}

export async function fetchOverBudgetItems(): Promise<BudgetItem[]> {
  const response = await authFetch(`${API_BASE}/v1/budgets/over-budget`);
  return handleResponse<BudgetItem[]>(response);
}

export async function fetchBudgetCategories(): Promise<string[]> {
  const response = await authFetch(`${API_BASE}/v1/budgets/categories`);
  return handleResponse<string[]>(response);
}

export async function createBudget(
  request: CreateBudgetItemRequest
): Promise<BudgetItem> {
  const response = await authFetch(`${API_BASE}/v1/budgets`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return handleResponse<BudgetItem>(response);
}

export async function updateBudget(
  id: string,
  request: UpdateBudgetItemRequest
): Promise<BudgetItem> {
  const response = await authFetch(`${API_BASE}/v1/budgets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  });
  return handleResponse<BudgetItem>(response);
}

export async function recordExpense(
  id: string,
  amount: number
): Promise<void> {
  const response = await authFetch(
    `${API_BASE}/v1/budgets/${id}/expense?amount=${amount}`,
    { method: 'POST' }
  );
  if (response.ok === false) {
    throw new Error(`Failed to record expense: ${response.statusText}`);
  }
}

export async function deleteBudget(id: string): Promise<void> {
  const response = await authFetch(`${API_BASE}/v1/budgets/${id}`, {
    method: 'DELETE',
  });
  if (response.ok === false) {
    throw new Error(`Failed to delete budget item: ${response.statusText}`);
  }
}

// ==================== Labor Rates API ====================

export async function fetchLaborRates(
  page: number = 0,
  size: number = 20,
  activeOnly: boolean = false
): Promise<PaginatedResponse<LaborRate>> {
  const response = await authFetch(
    `${API_BASE}/v1/labor-rates?page=${page}&size=${size}&activeOnly=${activeOnly}`
  );
  return handleResponse<PaginatedResponse<LaborRate>>(response);
}

export async function fetchLaborRate(id: string): Promise<LaborRate> {
  const response = await authFetch(`${API_BASE}/v1/labor-rates/${id}`);
  return handleResponse<LaborRate>(response);
}

export async function fetchLaborRatesByCategory(
  category: string
): Promise<LaborRate[]> {
  const response = await authFetch(
    `${API_BASE}/v1/labor-rates/category/${encodeURIComponent(category)}`
  );
  return handleResponse<LaborRate[]>(response);
}

export async function fetchLaborCategories(): Promise<string[]> {
  const response = await authFetch(`${API_BASE}/v1/labor-rates/categories`);
  return handleResponse<string[]>(response);
}

export async function fetchContractVehicles(): Promise<string[]> {
  const response = await authFetch(`${API_BASE}/v1/labor-rates/contract-vehicles`);
  return handleResponse<string[]>(response);
}

export async function createLaborRate(
  request: CreateLaborRateRequest
): Promise<LaborRate> {
  const response = await authFetch(`${API_BASE}/v1/labor-rates`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return handleResponse<LaborRate>(response);
}

export async function updateLaborRate(
  id: string,
  request: UpdateLaborRateRequest
): Promise<LaborRate> {
  const response = await authFetch(`${API_BASE}/v1/labor-rates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  });
  return handleResponse<LaborRate>(response);
}

export async function setLaborRateActive(
  id: string,
  active: boolean
): Promise<void> {
  const response = await authFetch(
    `${API_BASE}/v1/labor-rates/${id}/active?active=${active}`,
    { method: 'PATCH' }
  );
  if (response.ok === false) {
    throw new Error(`Failed to update labor rate status: ${response.statusText}`);
  }
}

export async function deleteLaborRate(id: string): Promise<void> {
  const response = await authFetch(`${API_BASE}/v1/labor-rates/${id}`, {
    method: 'DELETE',
  });
  if (response.ok === false) {
    throw new Error(`Failed to delete labor rate: ${response.statusText}`);
  }
}

// ==================== Financial Summary API ====================

export async function fetchFinancialSummary(): Promise<TenantFinancialSummary> {
  const response = await authFetch(`${API_BASE}/financial/tenant/summary`);
  return handleResponse<TenantFinancialSummary>(response);
}

export async function fetchContractFinancialSummary(
  contractId: string
): Promise<ContractFinancialSummary> {
  const response = await authFetch(
    `${API_BASE}/financial/contracts/${contractId}/summary`
  );
  return handleResponse<ContractFinancialSummary>(response);
}

export async function fetchCostAccounting(
  contractId: string
): Promise<{
  directLabor: number;
  subcontractorLabor: number;
  materials: number;
  travel: number;
  odc: number;
  indirect: number;
  fee: number;
  total: number;
}> {
  const response = await authFetch(
    `${API_BASE}/financial/contracts/${contractId}/cost-accounting`
  );
  return handleResponse(response);
}

// ==================== Utility Functions ====================

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCurrencyCompact(value: number | null | undefined): string {
  if (value === null || value === undefined) return '$0';
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return formatCurrency(value);
}

export function formatDate(dateString: string | null | undefined): string {
  if (dateString === null || dateString === undefined) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(1)}%`;
}

export function getStatusColor(
  status: InvoiceStatus
): 'primary' | 'success' | 'warning' | 'danger' | 'secondary' | 'info' {
  switch (status) {
    case 'DRAFT':
      return 'secondary';
    case 'PENDING_APPROVAL':
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
      return 'info';
    case 'RECEIVED':
    case 'APPROVED':
      return 'primary';
    case 'PAID':
      return 'success';
    case 'PARTIALLY_PAID':
      return 'warning';
    case 'DISPUTED':
    case 'REJECTED':
    case 'CANCELLED':
      return 'danger';
    default:
      return 'secondary';
  }
}

export function getStatusLabel(status: InvoiceStatus): string {
  const labels: Record<InvoiceStatus, string> = {
    DRAFT: 'Draft',
    PENDING_APPROVAL: 'Pending Approval',
    SUBMITTED: 'Submitted',
    RECEIVED: 'Received',
    UNDER_REVIEW: 'Under Review',
    APPROVED: 'Approved',
    DISPUTED: 'Disputed',
    REJECTED: 'Rejected',
    PAID: 'Paid',
    PARTIALLY_PAID: 'Partially Paid',
    CANCELLED: 'Cancelled',
  };
  return labels[status] ?? status;
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    DIRECT_LABOR: 'Direct Labor',
    SUBCONTRACTOR: 'Subcontractor',
    MATERIALS: 'Materials',
    EQUIPMENT: 'Equipment',
    TRAVEL: 'Travel',
    ODC: 'Other Direct Costs',
    INDIRECT: 'Indirect',
    FEE: 'Fee',
    CONTINGENCY: 'Contingency',
    OTHER: 'Other',
  };
  return labels[category] ?? category;
}
