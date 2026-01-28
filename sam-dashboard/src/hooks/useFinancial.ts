/**
 * Financial Management Hook - React state management for financial data using TanStack Query
 */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useCallback, useState} from 'react';
import {queryKeys} from '../lib/query-keys';
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
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(20);
    const [statusFilter, setStatusFilter] = useState<InvoiceStatus | null>(null);
    const [showOverdue, setShowOverdue] = useState(false);

    const regularQuery = useQuery({
        queryKey: queryKeys.invoices.list({page, size, statusFilter}),
        queryFn: async () => {
            if (statusFilter !== null) {
                return fetchInvoicesByStatus(statusFilter, page);
            }
            return fetchInvoices(page, size);
        },
        enabled: showOverdue === false,
    });

    const overdueQuery = useQuery({
        queryKey: [...queryKeys.invoices.all, 'overdue'],
        queryFn: fetchOverdueInvoices,
        enabled: showOverdue,
    });

    const createMutation = useMutation({
        mutationFn: createInvoice,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.invoices.all});
        },
    });

    const submitMutation = useMutation({
        mutationFn: submitInvoice,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.invoices.all});
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteInvoice,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.invoices.all});
        },
    });

    const loadInvoices = useCallback(async (newPage: number = 0, newSize: number = 20) => {
        setPage(newPage);
        setSize(newSize);
        setStatusFilter(null);
        setShowOverdue(false);
    }, []);

    const loadInvoicesByStatus = useCallback(async (status: InvoiceStatus, newPage: number = 0) => {
        setPage(newPage);
        setStatusFilter(status);
        setShowOverdue(false);
    }, []);

    const loadOverdueInvoices = useCallback(async () => {
        setShowOverdue(true);
        setStatusFilter(null);
    }, []);

    const createNewInvoice = useCallback(
        async (request: CreateInvoiceRequest): Promise<Invoice> => {
            return createMutation.mutateAsync(request);
        },
        [createMutation]
    );

    const submitInvoiceById = useCallback(
        async (id: string): Promise<void> => {
            await submitMutation.mutateAsync(id);
        },
        [submitMutation]
    );

    const deleteInvoiceById = useCallback(
        async (id: string): Promise<void> => {
            await deleteMutation.mutateAsync(id);
        },
        [deleteMutation]
    );

    const refresh = useCallback(async () => {
        if (showOverdue) {
            await overdueQuery.refetch();
        } else {
            await regularQuery.refetch();
        }
    }, [showOverdue, overdueQuery, regularQuery]);

    // Determine which query data to use
    const activeQuery = showOverdue ? overdueQuery : regularQuery;
    const invoices = showOverdue
        ? (overdueQuery.data ?? [])
        : (regularQuery.data?.content ?? []);

    return {
        invoices,
        totalElements: showOverdue
            ? (overdueQuery.data?.length ?? 0)
            : (regularQuery.data?.totalElements ?? 0),
        totalPages: showOverdue ? 1 : (regularQuery.data?.totalPages ?? 0),
        currentPage: showOverdue ? 0 : (regularQuery.data?.number ?? page),
        isLoading: activeQuery.isLoading || createMutation.isPending || submitMutation.isPending || deleteMutation.isPending,
        error: activeQuery.error ?? createMutation.error ?? submitMutation.error ?? deleteMutation.error ?? null,
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
    const query = useQuery({
        queryKey: queryKeys.invoices.detail(id),
        queryFn: () => fetchInvoice(id),
        enabled: id !== '',
    });

    const refresh = useCallback(async () => {
        await query.refetch();
    }, [query]);

    return {
        invoice: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error ?? null,
        refresh,
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
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(20);
    const [category, setCategory] = useState<string | undefined>(undefined);

    const budgetsQuery = useQuery({
        queryKey: queryKeys.budgets.list({page, size, category}),
        queryFn: () => fetchBudgets(page, size, category),
    });

    const overBudgetQuery = useQuery({
        queryKey: [...queryKeys.budgets.all, 'overBudget'],
        queryFn: fetchOverBudgetItems,
    });

    const createMutation = useMutation({
        mutationFn: createBudget,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.budgets.all});
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({id, request}: { id: string; request: UpdateBudgetItemRequest }) =>
            updateBudget(id, request),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.budgets.all});
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteBudget,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.budgets.all});
        },
    });

    const loadBudgets = useCallback(
        async (newPage: number = 0, newSize: number = 20, newCategory?: string) => {
            setPage(newPage);
            setSize(newSize);
            setCategory(newCategory);
        },
        []
    );

    const loadOverBudgetItems = useCallback(async () => {
        await overBudgetQuery.refetch();
    }, [overBudgetQuery]);

    const createNewBudget = useCallback(
        async (request: CreateBudgetItemRequest): Promise<BudgetItem> => {
            return createMutation.mutateAsync(request);
        },
        [createMutation]
    );

    const updateBudgetById = useCallback(
        async (id: string, request: UpdateBudgetItemRequest): Promise<BudgetItem> => {
            return updateMutation.mutateAsync({id, request});
        },
        [updateMutation]
    );

    const deleteBudgetById = useCallback(
        async (id: string): Promise<void> => {
            await deleteMutation.mutateAsync(id);
        },
        [deleteMutation]
    );

    const refresh = useCallback(async () => {
        await Promise.all([budgetsQuery.refetch(), overBudgetQuery.refetch()]);
    }, [budgetsQuery, overBudgetQuery]);

    const isLoading =
        budgetsQuery.isLoading ||
        overBudgetQuery.isLoading ||
        createMutation.isPending ||
        updateMutation.isPending ||
        deleteMutation.isPending;

    const error =
        budgetsQuery.error ??
        overBudgetQuery.error ??
        createMutation.error ??
        updateMutation.error ??
        deleteMutation.error ??
        null;

    return {
        budgets: budgetsQuery.data?.content ?? [],
        overBudgetItems: overBudgetQuery.data ?? [],
        totalElements: budgetsQuery.data?.totalElements ?? 0,
        totalPages: budgetsQuery.data?.totalPages ?? 0,
        currentPage: budgetsQuery.data?.number ?? page,
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
    const query = useQuery({
        queryKey: queryKeys.budgets.detail(id),
        queryFn: () => fetchBudget(id),
        enabled: id !== '',
    });

    const refresh = useCallback(async () => {
        await query.refetch();
    }, [query]);

    return {
        budget: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error ?? null,
        refresh,
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
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(20);
    const [activeOnly, setActiveOnly] = useState(false);

    const query = useQuery({
        queryKey: queryKeys.laborRates.list({page, size, activeOnly}),
        queryFn: () => fetchLaborRates(page, size, activeOnly),
    });

    const createMutation = useMutation({
        mutationFn: createLaborRate,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.laborRates.all});
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({id, request}: { id: string; request: UpdateLaborRateRequest }) =>
            updateLaborRate(id, request),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.laborRates.all});
        },
    });

    const toggleActiveMutation = useMutation({
        mutationFn: ({id, active}: { id: string; active: boolean }) => setLaborRateActive(id, active),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.laborRates.all});
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteLaborRate,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.laborRates.all});
        },
    });

    const loadLaborRates = useCallback(
        async (newPage: number = 0, newSize: number = 20, newActiveOnly: boolean = false) => {
            setPage(newPage);
            setSize(newSize);
            setActiveOnly(newActiveOnly);
        },
        []
    );

    const createNewLaborRate = useCallback(
        async (request: CreateLaborRateRequest): Promise<LaborRate> => {
            return createMutation.mutateAsync(request);
        },
        [createMutation]
    );

    const updateLaborRateById = useCallback(
        async (id: string, request: UpdateLaborRateRequest): Promise<LaborRate> => {
            return updateMutation.mutateAsync({id, request});
        },
        [updateMutation]
    );

    const toggleLaborRateActive = useCallback(
        async (id: string, active: boolean): Promise<void> => {
            await toggleActiveMutation.mutateAsync({id, active});
        },
        [toggleActiveMutation]
    );

    const deleteLaborRateById = useCallback(
        async (id: string): Promise<void> => {
            await deleteMutation.mutateAsync(id);
        },
        [deleteMutation]
    );

    const refresh = useCallback(async () => {
        await query.refetch();
    }, [query]);

    const isLoading =
        query.isLoading ||
        createMutation.isPending ||
        updateMutation.isPending ||
        toggleActiveMutation.isPending ||
        deleteMutation.isPending;

    const error =
        query.error ??
        createMutation.error ??
        updateMutation.error ??
        toggleActiveMutation.error ??
        deleteMutation.error ??
        null;

    return {
        laborRates: query.data?.content ?? [],
        totalElements: query.data?.totalElements ?? 0,
        totalPages: query.data?.totalPages ?? 0,
        currentPage: query.data?.number ?? page,
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
    const query = useQuery({
        queryKey: [...queryKeys.laborRates.all, 'detail', id],
        queryFn: () => fetchLaborRate(id),
        enabled: id !== '',
    });

    const refresh = useCallback(async () => {
        await query.refetch();
    }, [query]);

    return {
        laborRate: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error ?? null,
        refresh,
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
    const query = useQuery({
        queryKey: [...queryKeys.dashboard.all, 'financial'],
        queryFn: fetchFinancialSummary,
    });

    const refresh = useCallback(async () => {
        await query.refetch();
    }, [query]);

    return {
        summary: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error ?? null,
        refresh,
    };
}
