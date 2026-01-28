import {useCallback, useEffect, useState} from 'react';
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
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState<string | null>(null);

  const loadContracts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = searchKeyword !== null && searchKeyword.length > 0
        ? await searchContracts(searchKeyword, page, size)
        : await fetchContracts(page, size);

      if (result.success) {
        setContracts(result.data.content);
        setTotalElements(result.data.totalElements);
        setTotalPages(result.data.totalPages);
      } else {
        setError(new Error(result.error.message));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch contracts'));
    } finally {
      setIsLoading(false);
    }
  }, [page, size, searchKeyword]);

  const refresh = useCallback(async () => {
    await loadContracts();
  }, [loadContracts]);

  const search = useCallback(async (keyword: string) => {
    setSearchKeyword(keyword.length > 0 ? keyword : null);
    setPage(0);
  }, []);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  return {
    contracts,
    isLoading,
    error,
    pagination: {
      page,
      size,
      totalElements,
      totalPages,
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
  const [contract, setContract] = useState<Contract | null>(null);
  const [summary, setSummary] = useState<ContractSummary | null>(null);
  const [clins, setClins] = useState<ContractClin[]>([]);
  const [modifications, setModifications] = useState<ContractModification[]>([]);
  const [deliverables, setDeliverables] = useState<ContractDeliverable[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadContract = useCallback(async () => {
    if (contractId === null) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [contractResult, summaryResult, clinsResult, modsResult, deliverablesResult] =
        await Promise.all([
          fetchContract(contractId),
          fetchContractSummary(contractId),
          fetchClins(contractId),
          fetchModifications(contractId),
          fetchDeliverables(contractId),
        ]);

      if (contractResult.success) {
        setContract(contractResult.data);
      } else {
        setError(new Error(contractResult.error.message));
        return;
      }

      if (summaryResult.success) {
        setSummary(summaryResult.data);
      }

      if (clinsResult.success) {
        setClins(clinsResult.data);
      }

      if (modsResult.success) {
        setModifications(modsResult.data);
      }

      if (deliverablesResult.success) {
        setDeliverables(deliverablesResult.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch contract'));
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  const refresh = useCallback(async () => {
    await loadContract();
  }, [loadContract]);

  const updateContractData = useCallback(
    async (data: UpdateContractRequest): Promise<boolean> => {
      if (contractId === null) {
        return false;
      }

      try {
        const result = await updateContract(contractId, data);
        if (result.success) {
          setContract(result.data);
          return true;
        }
        setError(new Error(result.error.message));
        return false;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update contract'));
        return false;
      }
    },
    [contractId]
  );

  const addClin = useCallback(
    async (data: CreateClinRequest): Promise<ContractClin | null> => {
      if (contractId === null) {
        return null;
      }

      try {
        const result = await createClin(contractId, data);
        if (result.success) {
          setClins((prev) => [...prev, result.data]);
          return result.data;
        }
        setError(new Error(result.error.message));
        return null;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create CLIN'));
        return null;
      }
    },
    [contractId]
  );

  const updateClinData = useCallback(
    async (clinId: string, data: UpdateClinRequest): Promise<ContractClin | null> => {
      if (contractId === null) {
        return null;
      }

      try {
        const result = await updateClin(contractId, clinId, data);
        if (result.success) {
          setClins((prev) =>
            prev.map((c) => (c.id === clinId ? result.data : c))
          );
          return result.data;
        }
        setError(new Error(result.error.message));
        return null;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update CLIN'));
        return null;
      }
    },
    [contractId]
  );

  const addModification = useCallback(
    async (data: CreateModificationRequest): Promise<ContractModification | null> => {
      if (contractId === null) {
        return null;
      }

      try {
        const result = await createModification(contractId, data);
        if (result.success) {
          setModifications((prev) => [result.data, ...prev]);
          return result.data;
        }
        setError(new Error(result.error.message));
        return null;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create modification'));
        return null;
      }
    },
    [contractId]
  );

  const executeModificationAction = useCallback(
    async (modificationId: string): Promise<boolean> => {
      if (contractId === null) {
        return false;
      }

      try {
        const result = await executeModification(contractId, modificationId);
        if (result.success) {
          setModifications((prev) =>
            prev.map((m) => (m.id === modificationId ? result.data : m))
          );
          await refresh();
          return true;
        }
        setError(new Error(result.error.message));
        return false;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to execute modification'));
        return false;
      }
    },
    [contractId, refresh]
  );

  const addDeliverable = useCallback(
    async (data: CreateDeliverableRequest): Promise<ContractDeliverable | null> => {
      if (contractId === null) {
        return null;
      }

      try {
        const result = await createDeliverable(contractId, data);
        if (result.success) {
          setDeliverables((prev) => [...prev, result.data]);
          return result.data;
        }
        setError(new Error(result.error.message));
        return null;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create deliverable'));
        return null;
      }
    },
    [contractId]
  );

  const updateDeliverableStatusAction = useCallback(
    async (deliverableId: string, status: DeliverableStatus): Promise<boolean> => {
      if (contractId === null) {
        return false;
      }

      try {
        const result = await updateDeliverableStatus(contractId, deliverableId, status);
        if (result.success) {
          setDeliverables((prev) =>
            prev.map((d) => (d.id === deliverableId ? result.data : d))
          );
          return true;
        }
        setError(new Error(result.error.message));
        return false;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update deliverable status'));
        return false;
      }
    },
    [contractId]
  );

  useEffect(() => {
    loadContract();
  }, [loadContract]);

  return {
    contract,
    summary,
    clins,
    modifications,
    deliverables,
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
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createContractAction = useCallback(
    async (data: CreateContractRequest): Promise<Contract | null> => {
      try {
        setIsCreating(true);
        setError(null);

        const result = await createContract(data);
        if (result.success) {
          return result.data;
        }
        setError(new Error(result.error.message));
        return null;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create contract'));
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  return {
    createContractAction,
    isCreating,
    error,
  };
}

export default useContracts;
