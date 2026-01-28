/**
 * Financial Management Hook - React state management for financial data
 */
import {useCallback, useEffect, useState} from 'react';
import type {
    BudgetItem,
    CreateBudgetItemRequest,
    CreateInvoiceRequest,
    CreateLaborRateRequest,
    Invoice,
    InvoiceStatus,
    LaborRate,
    TenantFinancialSummary,
    UpdateBudgetItemRequest,
    UpdateLaborRateRequest,
} from '../types/financial.types';
import {
    createBudget,
    createInvoice,
    createLaborRate,
    deleteBudget,
    deleteInvoice,
    deleteLaborRate,
    fetchBudget,
    fetchBudgets,
    fetchFinancialSummary,
    fetchInvoice,
    fetchInvoices,
    fetchInvoicesByStatus,
    fetchLaborRate,
    fetchLaborRates,
    fetchOverBudgetItems,
    fetchOverdueInvoices,
    setLaborRateActive,
    submitInvoice,
    updateBudget,
    updateLaborRate,
} from '../services/financialService';

// ==================== Invoices Hook ====================

interface UseInvoicesReturn {
  invoices: Invoice[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: Error | null;
  loadInvoices: (page?: number, size?: number) => Promise<void>;
  loadInvoicesByStatus: (status: InvoiceStatus, page?: number) => Promise<void>;
  loadOverdueInvoices: () => Promise<void>;
  createNewInvoice: (request: CreateInvoiceRequest) => Promise<Invoice>;
  submitInvoiceById: (id: string) => Promise<void>;
  deleteInvoiceById: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useInvoices(): UseInvoicesReturn {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadInvoices = useCallback(async (page: number = 0, size: number = 20) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchInvoices(page, size);
      setInvoices(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
      setCurrentPage(response.number);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load invoices'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadInvoicesByStatus = useCallback(
    async (status: InvoiceStatus, page: number = 0) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchInvoicesByStatus(status, page);
        setInvoices(response.content);
        setTotalElements(response.totalElements);
        setTotalPages(response.totalPages);
        setCurrentPage(response.number);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load invoices'));
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const loadOverdueInvoices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const overdueList = await fetchOverdueInvoices();
      setInvoices(overdueList);
      setTotalElements(overdueList.length);
      setTotalPages(1);
      setCurrentPage(0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load overdue invoices'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNewInvoice = useCallback(async (request: CreateInvoiceRequest) => {
    const invoice = await createInvoice(request);
    await loadInvoices(currentPage);
    return invoice;
  }, [currentPage, loadInvoices]);

  const submitInvoiceById = useCallback(async (id: string) => {
    await submitInvoice(id);
    await loadInvoices(currentPage);
  }, [currentPage, loadInvoices]);

  const deleteInvoiceById = useCallback(async (id: string) => {
    await deleteInvoice(id);
    await loadInvoices(currentPage);
  }, [currentPage, loadInvoices]);

  const refresh = useCallback(async () => {
    await loadInvoices(currentPage);
  }, [currentPage, loadInvoices]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  return {
    invoices,
    totalElements,
    totalPages,
    currentPage,
    isLoading,
    error,
    loadInvoices,
    loadInvoicesByStatus,
    loadOverdueInvoices,
    createNewInvoice,
    submitInvoiceById,
    deleteInvoiceById,
    refresh,
  };
}

// ==================== Single Invoice Hook ====================

interface UseInvoiceReturn {
  invoice: Invoice | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useInvoice(id: string): UseInvoiceReturn {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadInvoice = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchInvoice(id);
      setInvoice(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load invoice'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  return {
    invoice,
    isLoading,
    error,
    refresh: loadInvoice,
  };
}

// ==================== Budgets Hook ====================

interface UseBudgetsReturn {
  budgets: BudgetItem[];
  overBudgetItems: BudgetItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: Error | null;
  loadBudgets: (page?: number, size?: number, category?: string) => Promise<void>;
  loadOverBudgetItems: () => Promise<void>;
  createNewBudget: (request: CreateBudgetItemRequest) => Promise<BudgetItem>;
  updateBudgetById: (id: string, request: UpdateBudgetItemRequest) => Promise<BudgetItem>;
  deleteBudgetById: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useBudgets(): UseBudgetsReturn {
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [overBudgetItems, setOverBudgetItems] = useState<BudgetItem[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadBudgets = useCallback(
    async (page: number = 0, size: number = 20, category?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchBudgets(page, size, category);
        setBudgets(response.content);
        setTotalElements(response.totalElements);
        setTotalPages(response.totalPages);
        setCurrentPage(response.number);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load budgets'));
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const loadOverBudgetItems = useCallback(async () => {
    try {
      const items = await fetchOverBudgetItems();
      setOverBudgetItems(items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load over-budget items'));
    }
  }, []);

  const createNewBudget = useCallback(
    async (request: CreateBudgetItemRequest) => {
      const budget = await createBudget(request);
      await loadBudgets(currentPage);
      return budget;
    },
    [currentPage, loadBudgets]
  );

  const updateBudgetById = useCallback(
    async (id: string, request: UpdateBudgetItemRequest) => {
      const budget = await updateBudget(id, request);
      await loadBudgets(currentPage);
      return budget;
    },
    [currentPage, loadBudgets]
  );

  const deleteBudgetById = useCallback(
    async (id: string) => {
      await deleteBudget(id);
      await loadBudgets(currentPage);
    },
    [currentPage, loadBudgets]
  );

  const refresh = useCallback(async () => {
    await loadBudgets(currentPage);
    await loadOverBudgetItems();
  }, [currentPage, loadBudgets, loadOverBudgetItems]);

  useEffect(() => {
    loadBudgets();
    loadOverBudgetItems();
  }, [loadBudgets, loadOverBudgetItems]);

  return {
    budgets,
    overBudgetItems,
    totalElements,
    totalPages,
    currentPage,
    isLoading,
    error,
    loadBudgets,
    loadOverBudgetItems,
    createNewBudget,
    updateBudgetById,
    deleteBudgetById,
    refresh,
  };
}

// ==================== Single Budget Hook ====================

interface UseBudgetReturn {
  budget: BudgetItem | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useBudget(id: string): UseBudgetReturn {
  const [budget, setBudget] = useState<BudgetItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadBudget = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchBudget(id);
      setBudget(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load budget'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBudget();
  }, [loadBudget]);

  return {
    budget,
    isLoading,
    error,
    refresh: loadBudget,
  };
}

// ==================== Labor Rates Hook ====================

interface UseLaborRatesReturn {
  laborRates: LaborRate[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: Error | null;
  loadLaborRates: (page?: number, size?: number, activeOnly?: boolean) => Promise<void>;
  createNewLaborRate: (request: CreateLaborRateRequest) => Promise<LaborRate>;
  updateLaborRateById: (id: string, request: UpdateLaborRateRequest) => Promise<LaborRate>;
  toggleLaborRateActive: (id: string, active: boolean) => Promise<void>;
  deleteLaborRateById: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useLaborRates(): UseLaborRatesReturn {
  const [laborRates, setLaborRates] = useState<LaborRate[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadLaborRates = useCallback(
    async (page: number = 0, size: number = 20, activeOnly: boolean = false) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchLaborRates(page, size, activeOnly);
        setLaborRates(response.content);
        setTotalElements(response.totalElements);
        setTotalPages(response.totalPages);
        setCurrentPage(response.number);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load labor rates'));
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const createNewLaborRate = useCallback(
    async (request: CreateLaborRateRequest) => {
      const rate = await createLaborRate(request);
      await loadLaborRates(currentPage);
      return rate;
    },
    [currentPage, loadLaborRates]
  );

  const updateLaborRateById = useCallback(
    async (id: string, request: UpdateLaborRateRequest) => {
      const rate = await updateLaborRate(id, request);
      await loadLaborRates(currentPage);
      return rate;
    },
    [currentPage, loadLaborRates]
  );

  const toggleLaborRateActive = useCallback(
    async (id: string, active: boolean) => {
      await setLaborRateActive(id, active);
      await loadLaborRates(currentPage);
    },
    [currentPage, loadLaborRates]
  );

  const deleteLaborRateById = useCallback(
    async (id: string) => {
      await deleteLaborRate(id);
      await loadLaborRates(currentPage);
    },
    [currentPage, loadLaborRates]
  );

  const refresh = useCallback(async () => {
    await loadLaborRates(currentPage);
  }, [currentPage, loadLaborRates]);

  useEffect(() => {
    loadLaborRates();
  }, [loadLaborRates]);

  return {
    laborRates,
    totalElements,
    totalPages,
    currentPage,
    isLoading,
    error,
    loadLaborRates,
    createNewLaborRate,
    updateLaborRateById,
    toggleLaborRateActive,
    deleteLaborRateById,
    refresh,
  };
}

// ==================== Single Labor Rate Hook ====================

interface UseLaborRateReturn {
  laborRate: LaborRate | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useLaborRate(id: string): UseLaborRateReturn {
  const [laborRate, setLaborRate] = useState<LaborRate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadLaborRate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchLaborRate(id);
      setLaborRate(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load labor rate'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadLaborRate();
  }, [loadLaborRate]);

  return {
    laborRate,
    isLoading,
    error,
    refresh: loadLaborRate,
  };
}

// ==================== Financial Summary Hook ====================

interface UseFinancialSummaryReturn {
  summary: TenantFinancialSummary | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useFinancialSummary(): UseFinancialSummaryReturn {
  const [summary, setSummary] = useState<TenantFinancialSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchFinancialSummary();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load financial summary'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return {
    summary,
    isLoading,
    error,
    refresh: loadSummary,
  };
}
