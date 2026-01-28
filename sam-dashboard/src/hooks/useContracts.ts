import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useCallback, useState} from 'react';
import type {
  Contract,
  ContractClin,
  ContractDeliverable,
  ContractModification,
  ContractSummary,
  CreateClinRequest,
  CreateContractRequest,
  CreateDeliverableRequest,
  CreateModificationRequest,
  DeliverableStatus,
  UpdateClinRequest,
  UpdateContractRequest,
} from '../components/domain/contracts/Contract.types';
import {queryKeys} from '../lib/query-keys';
import {
  createClin,
  createContract,
  createDeliverable,
  createModification,
  executeModification,
  fetchClins,
  fetchContract,
  fetchContracts,
  fetchContractSummary,
  fetchDeliverables,
  fetchModifications,
  searchContracts,
  updateClin,
  updateContract,
  updateDeliverableStatus,
} from '../services/contractService';

// ==================== useContracts - List Hook ====================

export interface UseContractsReturn {
  contracts: Contract[];
  isLoading: boolean;
  error: Error | null;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  setPage: (page: number) => void;
  setSize: (size: number) => void;
  refresh: () => Promise<void>;
  search: (keyword: string) => Promise<void>;
}

export function useContracts(initialPage: number = 0, initialSize: number = 20): UseContractsReturn {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [searchKeyword, setSearchKeyword] = useState<string | null>(null);

  const query = useQuery({
    queryKey: queryKeys.contracts.list({page, size, searchKeyword}),
    queryFn: async () => {
      const result =
        searchKeyword !== null && searchKeyword.length > 0
          ? await searchContracts(searchKeyword, page, size)
          : await fetchContracts(page, size);

      if (result.success) {
        return result.data;
      }
      throw new Error(result.error.message);
    },
  });

  const refresh = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const search = useCallback(async (keyword: string) => {
    setSearchKeyword(keyword.length > 0 ? keyword : null);
    setPage(0);
  }, []);

  return {
    contracts: query.data?.content ?? [],
    isLoading: query.isLoading,
    error: query.error ?? null,
    pagination: {
      page,
      size,
      totalElements: query.data?.totalElements ?? 0,
      totalPages: query.data?.totalPages ?? 0,
    },
    setPage,
    setSize,
    refresh,
    search,
  };
}

// ==================== useContract - Single Contract Hook ====================

export interface UseContractReturn {
  contract: Contract | null;
  summary: ContractSummary | null;
  clins: ContractClin[];
  modifications: ContractModification[];
  deliverables: ContractDeliverable[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  updateContractData: (data: UpdateContractRequest) => Promise<boolean>;
  addClin: (data: CreateClinRequest) => Promise<ContractClin | null>;
  updateClinData: (clinId: string, data: UpdateClinRequest) => Promise<ContractClin | null>;
  addModification: (data: CreateModificationRequest) => Promise<ContractModification | null>;
  executeModificationAction: (modificationId: string) => Promise<boolean>;
  addDeliverable: (data: CreateDeliverableRequest) => Promise<ContractDeliverable | null>;
  updateDeliverableStatusAction: (deliverableId: string, status: DeliverableStatus) => Promise<boolean>;
}

export function useContract(contractId: string | null): UseContractReturn {
  const queryClient = useQueryClient();

  const contractQuery = useQuery({
    queryKey: queryKeys.contracts.detail(contractId ?? ''),
    queryFn: async () => {
      if (contractId === null) {
        return null;
      }
      const result = await fetchContract(contractId);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error.message);
    },
    enabled: contractId !== null,
  });

  const summaryQuery = useQuery({
    queryKey: queryKeys.contracts.summary(contractId ?? ''),
    queryFn: async () => {
      if (contractId === null) {
        return null;
      }
      const result = await fetchContractSummary(contractId);
      if (result.success) {
        return result.data;
      }
      return null;
    },
    enabled: contractId !== null,
  });

  const clinsQuery = useQuery({
    queryKey: queryKeys.contracts.clins(contractId ?? ''),
    queryFn: async () => {
      if (contractId === null) {
        return [];
      }
      const result = await fetchClins(contractId);
      if (result.success) {
        return result.data;
      }
      return [];
    },
    enabled: contractId !== null,
  });

  const modificationsQuery = useQuery({
    queryKey: queryKeys.contracts.modifications(contractId ?? ''),
    queryFn: async () => {
      if (contractId === null) {
        return [];
      }
      const result = await fetchModifications(contractId);
      if (result.success) {
        return result.data;
      }
      return [];
    },
    enabled: contractId !== null,
  });

  const deliverablesQuery = useQuery({
    queryKey: queryKeys.contracts.deliverables(contractId ?? ''),
    queryFn: async () => {
      if (contractId === null) {
        return [];
      }
      const result = await fetchDeliverables(contractId);
      if (result.success) {
        return result.data;
      }
      return [];
    },
    enabled: contractId !== null,
  });

  const updateContractMutation = useMutation({
    mutationFn: async (data: UpdateContractRequest) => {
      if (contractId === null) {
        throw new Error('Contract ID is required');
      }
      const result = await updateContract(contractId, data);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error.message);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.contracts.detail(contractId ?? ''), data);
    },
  });

  const addClinMutation = useMutation({
    mutationFn: async (data: CreateClinRequest) => {
      if (contractId === null) {
        throw new Error('Contract ID is required');
      }
      const result = await createClin(contractId, data);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.contracts.clins(contractId ?? '')});
    },
  });

  const updateClinMutation = useMutation({
    mutationFn: async ({clinId, data}: {clinId: string; data: UpdateClinRequest}) => {
      if (contractId === null) {
        throw new Error('Contract ID is required');
      }
      const result = await updateClin(contractId, clinId, data);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.contracts.clins(contractId ?? '')});
    },
  });

  const addModificationMutation = useMutation({
    mutationFn: async (data: CreateModificationRequest) => {
      if (contractId === null) {
        throw new Error('Contract ID is required');
      }
      const result = await createModification(contractId, data);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.contracts.modifications(contractId ?? '')});
    },
  });

  const executeModificationMutation = useMutation({
    mutationFn: async (modificationId: string) => {
      if (contractId === null) {
        throw new Error('Contract ID is required');
      }
      const result = await executeModification(contractId, modificationId);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.contracts.detail(contractId ?? '')});
      queryClient.invalidateQueries({queryKey: queryKeys.contracts.modifications(contractId ?? '')});
    },
  });

  const addDeliverableMutation = useMutation({
    mutationFn: async (data: CreateDeliverableRequest) => {
      if (contractId === null) {
        throw new Error('Contract ID is required');
      }
      const result = await createDeliverable(contractId, data);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.contracts.deliverables(contractId ?? '')});
    },
  });

  const updateDeliverableStatusMutation = useMutation({
    mutationFn: async ({deliverableId, status}: {deliverableId: string; status: DeliverableStatus}) => {
      if (contractId === null) {
        throw new Error('Contract ID is required');
      }
      const result = await updateDeliverableStatus(contractId, deliverableId, status);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.contracts.deliverables(contractId ?? '')});
    },
  });

  const refresh = useCallback(async () => {
    await Promise.all([
      contractQuery.refetch(),
      summaryQuery.refetch(),
      clinsQuery.refetch(),
      modificationsQuery.refetch(),
      deliverablesQuery.refetch(),
    ]);
  }, [contractQuery, summaryQuery, clinsQuery, modificationsQuery, deliverablesQuery]);

  const updateContractData = useCallback(
    async (data: UpdateContractRequest): Promise<boolean> => {
      try {
        await updateContractMutation.mutateAsync(data);
        return true;
      } catch {
        return false;
      }
    },
    [updateContractMutation]
  );

  const addClin = useCallback(
    async (data: CreateClinRequest): Promise<ContractClin | null> => {
      try {
        return await addClinMutation.mutateAsync(data);
      } catch {
        return null;
      }
    },
    [addClinMutation]
  );

  const updateClinData = useCallback(
    async (clinId: string, data: UpdateClinRequest): Promise<ContractClin | null> => {
      try {
        return await updateClinMutation.mutateAsync({clinId, data});
      } catch {
        return null;
      }
    },
    [updateClinMutation]
  );

  const addModification = useCallback(
    async (data: CreateModificationRequest): Promise<ContractModification | null> => {
      try {
        return await addModificationMutation.mutateAsync(data);
      } catch {
        return null;
      }
    },
    [addModificationMutation]
  );

  const executeModificationAction = useCallback(
    async (modificationId: string): Promise<boolean> => {
      try {
        await executeModificationMutation.mutateAsync(modificationId);
        return true;
      } catch {
        return false;
      }
    },
    [executeModificationMutation]
  );

  const addDeliverable = useCallback(
    async (data: CreateDeliverableRequest): Promise<ContractDeliverable | null> => {
      try {
        return await addDeliverableMutation.mutateAsync(data);
      } catch {
        return null;
      }
    },
    [addDeliverableMutation]
  );

  const updateDeliverableStatusAction = useCallback(
    async (deliverableId: string, status: DeliverableStatus): Promise<boolean> => {
      try {
        await updateDeliverableStatusMutation.mutateAsync({deliverableId, status});
        return true;
      } catch {
        return false;
      }
    },
    [updateDeliverableStatusMutation]
  );

  const isLoading =
    contractQuery.isLoading ||
    summaryQuery.isLoading ||
    clinsQuery.isLoading ||
    modificationsQuery.isLoading ||
    deliverablesQuery.isLoading;

  const error =
    contractQuery.error ??
    summaryQuery.error ??
    clinsQuery.error ??
    modificationsQuery.error ??
    deliverablesQuery.error ??
    updateContractMutation.error ??
    null;

  return {
    contract: contractQuery.data ?? null,
    summary: summaryQuery.data ?? null,
    clins: clinsQuery.data ?? [],
    modifications: modificationsQuery.data ?? [],
    deliverables: deliverablesQuery.data ?? [],
    isLoading,
    error,
    refresh,
    updateContractData,
    addClin,
    updateClinData,
    addModification,
    executeModificationAction,
    addDeliverable,
    updateDeliverableStatusAction,
  };
}

// ==================== useCreateContract Hook ====================

export interface UseCreateContractReturn {
  createContractAction: (data: CreateContractRequest) => Promise<Contract | null>;
  isCreating: boolean;
  error: Error | null;
}

export function useCreateContract(): UseCreateContractReturn {
  const queryClient = useQueryClient();

  const createContractMutation = useMutation({
    mutationFn: async (data: CreateContractRequest) => {
      const result = await createContract(data);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.contracts.all});
    },
  });

  const createContractAction = useCallback(
    async (data: CreateContractRequest): Promise<Contract | null> => {
      try {
        return await createContractMutation.mutateAsync(data);
      } catch {
        return null;
      }
    },
    [createContractMutation]
  );

  return {
    createContractAction,
    isCreating: createContractMutation.isPending,
    error: createContractMutation.error ?? null,
  };
}

export default useContracts;
