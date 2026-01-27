import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ContractsPage } from './ContractsPage';
import * as hooks from '../../hooks';
import type { Contract } from '../../types/contracts.types';

// Mock the hooks
vi.mock('../../hooks', async () => {
  const actual = await vi.importActual('../../hooks');
  return {
    ...actual,
    useContracts: vi.fn(),
  };
});

const mockContracts: Contract[] = [
  {
    id: 'contract-1',
    contractNumber: 'FA8771-25-C-0001',
    title: 'IT Modernization Services',
    status: 'ACTIVE',
    contractType: 'FIRM_FIXED_PRICE',
    awardDate: '2024-06-01',
    startDate: '2024-07-01',
    endDate: '2025-06-30',
    totalValue: 5000000,
    fundedAmount: 2500000,
    obligatedAmount: 2500000,
    contractingOfficeName: 'Jane Smith',
    contractingOfficeEmail: 'jane.smith@agency.gov',
    contractingOfficePhone: '555-123-4567',
    performancePeriods: [],
    clins: [],
    modifications: [],
    deliverables: [],
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'contract-2',
    contractNumber: 'GS-35F-0001',
    title: 'GSA Schedule Support',
    status: 'ACTIVE',
    contractType: 'TIME_AND_MATERIALS',
    awardDate: '2023-01-01',
    startDate: '2023-01-15',
    endDate: '2028-01-14',
    totalValue: 10000000,
    fundedAmount: 3000000,
    obligatedAmount: 2000000,
    contractingOfficeName: 'John Doe',
    contractingOfficeEmail: 'john.doe@gsa.gov',
    contractingOfficePhone: '555-987-6543',
    performancePeriods: [],
    clins: [],
    modifications: [],
    deliverables: [],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
];

const mockOnContractSelect = vi.fn();

function renderContractsPage(props = {}) {
  return render(
    <BrowserRouter>
      <ContractsPage onContractSelect={mockOnContractSelect} {...props} />
    </BrowserRouter>
  );
}

describe('ContractsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (hooks.useContracts as Mock).mockReturnValue({
      contracts: mockContracts,
      isLoading: false,
      error: null,
      page: 0,
      totalPages: 1,
      totalElements: 2,
      filters: {},
      setFilters: vi.fn(),
      setPage: vi.fn(),
      refresh: vi.fn(),
    });
  });

  describe('Rendering', () => {
    it('should render the Contracts section', () => {
      renderContractsPage();
      expect(screen.getByText(/contract management/i)).toBeInTheDocument();
    });

    it('should render section header with title', () => {
      renderContractsPage();
      expect(screen.getByText(/contract management/i)).toBeInTheDocument();
    });

    it('should render search input', () => {
      renderContractsPage();
      expect(screen.getByPlaceholderText(/search contracts/i)).toBeInTheDocument();
    });

    it('should render status filter', () => {
      renderContractsPage();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should render contracts in the list', () => {
      renderContractsPage();
      expect(screen.getByText('FA8771-25-C-0001')).toBeInTheDocument();
      expect(screen.getByText('GS-35F-0001')).toBeInTheDocument();
    });
  });

  describe('Contract List', () => {
    it('should display contract titles', () => {
      renderContractsPage();
      expect(screen.getByText('IT Modernization Services')).toBeInTheDocument();
      expect(screen.getByText('GSA Schedule Support')).toBeInTheDocument();
    });

    it('should display contract status badges', () => {
      renderContractsPage();
      const activeBadges = screen.getAllByText(/active/i);
      expect(activeBadges.length).toBeGreaterThan(0);
    });

    it('should display contract values', () => {
      renderContractsPage();
      // Look for formatted currency values
      expect(screen.getByText(/\$5,000,000/)).toBeInTheDocument();
      expect(screen.getByText(/\$10,000,000/)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should display loading message when contracts are loading', () => {
      (hooks.useContracts as Mock).mockReturnValue({
        contracts: [],
        isLoading: true,
        error: null,
        page: 0,
        totalPages: 0,
        totalElements: 0,
        filters: {},
        setFilters: vi.fn(),
        setPage: vi.fn(),
        refresh: vi.fn(),
      });

      renderContractsPage();
      expect(screen.getByText(/loading contracts/i)).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when loading fails', () => {
      const errorMessage = 'Failed to load contracts';
      (hooks.useContracts as Mock).mockReturnValue({
        contracts: [],
        isLoading: false,
        error: new Error(errorMessage),
        page: 0,
        totalPages: 0,
        totalElements: 0,
        filters: {},
        setFilters: vi.fn(),
        setPage: vi.fn(),
        refresh: vi.fn(),
      });

      renderContractsPage();
      expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no contracts exist', () => {
      (hooks.useContracts as Mock).mockReturnValue({
        contracts: [],
        isLoading: false,
        error: null,
        page: 0,
        totalPages: 0,
        totalElements: 0,
        filters: {},
        setFilters: vi.fn(),
        setPage: vi.fn(),
        refresh: vi.fn(),
      });

      renderContractsPage();
      expect(screen.getByText(/no contracts found/i)).toBeInTheDocument();
    });
  });

  describe('Search and Filtering', () => {
    it('should call setFilters when search input changes', async () => {
      const setFiltersMock = vi.fn();
      (hooks.useContracts as Mock).mockReturnValue({
        contracts: mockContracts,
        isLoading: false,
        error: null,
        page: 0,
        totalPages: 1,
        totalElements: 2,
        filters: {},
        setFilters: setFiltersMock,
        setPage: vi.fn(),
        refresh: vi.fn(),
      });

      const user = userEvent.setup();
      renderContractsPage();

      const searchInput = screen.getByPlaceholderText(/search contracts/i);
      await user.type(searchInput, 'FA8771');

      await waitFor(() => {
        expect(setFiltersMock).toHaveBeenCalled();
      });
    });

    it('should call setFilters when status filter changes', async () => {
      const setFiltersMock = vi.fn();
      (hooks.useContracts as Mock).mockReturnValue({
        contracts: mockContracts,
        isLoading: false,
        error: null,
        page: 0,
        totalPages: 1,
        totalElements: 2,
        filters: {},
        setFilters: setFiltersMock,
        setPage: vi.fn(),
        refresh: vi.fn(),
      });

      const user = userEvent.setup();
      renderContractsPage();

      const statusFilter = screen.getByRole('combobox');
      await user.selectOptions(statusFilter, 'ACTIVE');

      expect(setFiltersMock).toHaveBeenCalled();
    });
  });

  describe('Contract Selection', () => {
    it('should call onContractSelect when a contract is clicked', async () => {
      const user = userEvent.setup();
      renderContractsPage();

      const contractItem = screen.getByText('FA8771-25-C-0001');
      await user.click(contractItem);

      expect(mockOnContractSelect).toHaveBeenCalledWith('contract-1');
    });
  });

  describe('Pagination', () => {
    it('should display pagination when multiple pages exist', () => {
      (hooks.useContracts as Mock).mockReturnValue({
        contracts: mockContracts,
        isLoading: false,
        error: null,
        page: 0,
        totalPages: 3,
        totalElements: 25,
        filters: {},
        setFilters: vi.fn(),
        setPage: vi.fn(),
        refresh: vi.fn(),
      });

      renderContractsPage();
      expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument();
    });

    it('should call setPage when next button is clicked', async () => {
      const setPageMock = vi.fn();
      (hooks.useContracts as Mock).mockReturnValue({
        contracts: mockContracts,
        isLoading: false,
        error: null,
        page: 0,
        totalPages: 3,
        totalElements: 25,
        filters: {},
        setFilters: vi.fn(),
        setPage: setPageMock,
        refresh: vi.fn(),
      });

      const user = userEvent.setup();
      renderContractsPage();

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      expect(setPageMock).toHaveBeenCalledWith(1);
    });
  });
});
