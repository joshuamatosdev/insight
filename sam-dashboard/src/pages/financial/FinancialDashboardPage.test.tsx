import {beforeEach, describe, expect, it, type Mock, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {FinancialDashboardPage} from './FinancialDashboardPage';
import * as financialHooks from '../../hooks/useFinancial';
import type {BudgetItem, Invoice, TenantFinancialSummary} from '../../types/financial.types';

// Mock the hooks
vi.mock('../../hooks/useFinancial', () => ({
  useFinancialSummary: vi.fn(),
  useInvoices: vi.fn(),
  useBudgets: vi.fn(),
}));

const mockSummary: TenantFinancialSummary = {
  totalInvoiced: 2500000,
  totalOutstanding: 500000,
  draftInvoices: 3,
  submittedInvoices: 5,
  overdueInvoices: 2,
};

const mockInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2025-001',
    contractId: 'contract-1',
    contractNumber: 'FA8771-25-C-0001',
    invoiceType: 'PROGRESS',
    status: 'SUBMITTED',
    invoiceDate: '2025-01-01',
    periodStart: '2024-12-01',
    periodEnd: '2024-12-31',
    dueDate: '2025-01-15',
    submittedDate: '2025-01-01',
    paidDate: null,
    subtotal: 75000,
    adjustments: 0,
    totalAmount: 75000,
    amountPaid: 0,
    retainage: 0,
    balance: 75000,
    paymentMethod: null,
    paymentReference: null,
    voucherNumber: null,
    notes: null,
    isOverdue: true,
    daysOutstanding: 12,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2025-002',
    contractId: 'contract-1',
    contractNumber: 'FA8771-25-C-0001',
    invoiceType: 'PROGRESS',
    status: 'SUBMITTED',
    invoiceDate: '2024-12-28',
    periodStart: '2024-11-01',
    periodEnd: '2024-11-30',
    dueDate: '2025-01-10',
    submittedDate: '2024-12-28',
    paidDate: null,
    subtotal: 25000,
    adjustments: 0,
    totalAmount: 25000,
    amountPaid: 0,
    retainage: 0,
    balance: 25000,
    paymentMethod: null,
    paymentReference: null,
    voucherNumber: null,
    notes: null,
    isOverdue: true,
    daysOutstanding: 17,
    createdAt: '2024-12-28T00:00:00Z',
    updatedAt: '2024-12-28T00:00:00Z',
  },
];

const mockOverBudgetItems: BudgetItem[] = [
  {
    id: 'budget-1',
    contractId: 'contract-1',
    clinId: null,
    clinNumber: null,
    name: 'Travel Budget',
    description: null,
    category: 'TRAVEL',
    budgetedAmount: 50000,
    actualAmount: 55000,
    committedAmount: 5000,
    forecastAmount: null,
    variance: -10000,
    variancePercentage: -20,
    remainingBudget: -10000,
    isOverBudget: true,
    periodStart: '2025-01-01',
    periodEnd: '2025-12-31',
    fiscalYear: 2025,
    fiscalPeriod: null,
    lastUpdatedDate: '2025-01-15',
    notes: null,
  },
];

const mockOnNavigate = vi.fn();

function renderFinancialDashboardPage(props = {}) {
  return render(
    <FinancialDashboardPage onNavigate={mockOnNavigate} {...props} />
  );
}

describe('FinancialDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (financialHooks.useFinancialSummary as Mock).mockReturnValue({
      summary: mockSummary,
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    (financialHooks.useInvoices as Mock).mockReturnValue({
      invoices: mockInvoices,
      isLoading: false,
      error: null,
      loadOverdueInvoices: vi.fn(),
    });

    (financialHooks.useBudgets as Mock).mockReturnValue({
      budgets: [],
      overBudgetItems: mockOverBudgetItems,
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });
  });

  describe('Rendering', () => {
    it('should render the Financial Dashboard section', () => {
      renderFinancialDashboardPage();
      expect(screen.getByText(/financial dashboard/i)).toBeInTheDocument();
    });

    it('should render section header with title', () => {
      renderFinancialDashboardPage();
      expect(screen.getByText(/financial dashboard/i)).toBeInTheDocument();
    });

    it('should render refresh button', () => {
      renderFinancialDashboardPage();
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    });
  });

  describe('Key Metrics', () => {
    it('should display total invoiced amount', () => {
      renderFinancialDashboardPage();
      expect(screen.getByText(/total invoiced/i)).toBeInTheDocument();
    });

    it('should display outstanding amount', () => {
      renderFinancialDashboardPage();
      expect(screen.getByText(/outstanding/i)).toBeInTheDocument();
    });

    it('should display draft invoices count', () => {
      renderFinancialDashboardPage();
      expect(screen.getByText(/draft invoices/i)).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should display overdue invoices count', () => {
      renderFinancialDashboardPage();
      expect(screen.getByText(/overdue invoices/i)).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should display loading message when data is loading', () => {
      (financialHooks.useFinancialSummary as Mock).mockReturnValue({
        summary: null,
        isLoading: true,
        error: null,
        refresh: vi.fn(),
      });

      (financialHooks.useInvoices as Mock).mockReturnValue({
        invoices: [],
        isLoading: true,
        error: null,
        loadOverdueInvoices: vi.fn(),
      });

      (financialHooks.useBudgets as Mock).mockReturnValue({
        budgets: [],
        overBudgetItems: [],
        isLoading: true,
        error: null,
        refresh: vi.fn(),
      });

      renderFinancialDashboardPage();
      expect(screen.getByText(/loading financial data/i)).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when loading fails', () => {
      const errorMessage = 'Failed to load financial data';
      (financialHooks.useFinancialSummary as Mock).mockReturnValue({
        summary: null,
        isLoading: false,
        error: new Error(errorMessage),
        refresh: vi.fn(),
      });

      renderFinancialDashboardPage();
      expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
    });
  });

  describe('Charts', () => {
    it('should render overall budget status chart', () => {
      renderFinancialDashboardPage();
      expect(screen.getByText(/overall budget status/i)).toBeInTheDocument();
    });

    it('should render cost distribution chart', () => {
      renderFinancialDashboardPage();
      expect(screen.getByText(/cost distribution/i)).toBeInTheDocument();
    });
  });

  describe('Overdue Invoices Section', () => {
    it('should display overdue invoices section header', () => {
      renderFinancialDashboardPage();
      expect(screen.getByText('Overdue Invoices')).toBeInTheDocument();
    });

    it('should display View All button for invoices', () => {
      renderFinancialDashboardPage();
      const viewAllButtons = screen.getAllByRole('button', { name: /view all/i });
      expect(viewAllButtons.length).toBeGreaterThan(0);
    });

    it('should display no overdue invoices message when empty', () => {
      (financialHooks.useInvoices as Mock).mockReturnValue({
        invoices: [],
        isLoading: false,
        error: null,
        loadOverdueInvoices: vi.fn(),
      });

      renderFinancialDashboardPage();
      expect(screen.getByText(/no overdue invoices/i)).toBeInTheDocument();
    });
  });

  describe('Over Budget Items Section', () => {
    it('should display over budget items section header', () => {
      renderFinancialDashboardPage();
      expect(screen.getByText(/over budget items/i)).toBeInTheDocument();
    });

    it('should display over budget count badge', () => {
      renderFinancialDashboardPage();
      // Should show badge with count
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should display all budgets on track message when no over budget items', () => {
      (financialHooks.useBudgets as Mock).mockReturnValue({
        budgets: [],
        overBudgetItems: [],
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      });

      renderFinancialDashboardPage();
      expect(screen.getByText(/all budgets on track/i)).toBeInTheDocument();
    });

    it('should display over budget item details', () => {
      renderFinancialDashboardPage();
      expect(screen.getByText('Travel Budget')).toBeInTheDocument();
      expect(screen.getByText('TRAVEL')).toBeInTheDocument();
    });
  });

  describe('Refresh', () => {
    it('should call refresh functions when refresh button is clicked', async () => {
      const refreshSummary = vi.fn();
      const refreshBudgets = vi.fn();
      const loadOverdueInvoices = vi.fn();

      (financialHooks.useFinancialSummary as Mock).mockReturnValue({
        summary: mockSummary,
        isLoading: false,
        error: null,
        refresh: refreshSummary,
      });

      (financialHooks.useInvoices as Mock).mockReturnValue({
        invoices: mockInvoices,
        isLoading: false,
        error: null,
        loadOverdueInvoices,
      });

      (financialHooks.useBudgets as Mock).mockReturnValue({
        budgets: [],
        overBudgetItems: mockOverBudgetItems,
        isLoading: false,
        error: null,
        refresh: refreshBudgets,
      });

      const user = userEvent.setup();
      renderFinancialDashboardPage();

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(refreshSummary).toHaveBeenCalled();
        expect(refreshBudgets).toHaveBeenCalled();
        expect(loadOverdueInvoices).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation', () => {
    it('should call onNavigate with "invoices" when View All invoices is clicked', async () => {
      const user = userEvent.setup();
      renderFinancialDashboardPage();

      const viewAllButtons = screen.getAllByRole('button', { name: /view all/i });
      // First View All button should be for invoices
      await user.click(viewAllButtons[0]);

      expect(mockOnNavigate).toHaveBeenCalledWith('invoices');
    });

    it('should call onNavigate with "budgets" when View All budgets is clicked', async () => {
      const user = userEvent.setup();
      renderFinancialDashboardPage();

      const viewAllButtons = screen.getAllByRole('button', { name: /view all/i });
      // Second View All button should be for budgets
      await user.click(viewAllButtons[1]);

      expect(mockOnNavigate).toHaveBeenCalledWith('budgets');
    });
  });
});
