/**
 * Contract Service - Type-safe using openapi-fetch
 */

import {apiClient} from './apiClient';
import type {
    Contract,
    ContractClin,
    ContractDeliverable,
    ContractModification,
    ContractStatus,
    ContractSummary,
    CreateClinRequest,
    CreateContractRequest,
    CreateDeliverableRequest,
    CreateModificationRequest,
    DeliverableStatus,
    PaginatedResponse,
    UpdateClinRequest,
    UpdateContractRequest,
} from '../components/domain/contracts/Contract.types';

// ==================== Contract Endpoints ====================

export async function fetchContracts(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'contractNumber',
    sortDir: 'asc' | 'desc' = 'asc'
): Promise<PaginatedResponse<Contract>> {
    const {data, error} = await apiClient.GET('/contracts', {
        params: {query: {page, size, sortBy, sortDir}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as PaginatedResponse<Contract>;
}

export async function fetchActiveContracts(
    page: number = 0,
    size: number = 20
): Promise<PaginatedResponse<Contract>> {
    const {data, error} = await apiClient.GET('/contracts/active', {
        params: {query: {page, size}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as PaginatedResponse<Contract>;
}

export async function searchContracts(
    keyword: string,
    page: number = 0,
    size: number = 20
): Promise<PaginatedResponse<Contract>> {
    const {data, error} = await apiClient.GET('/contracts/search', {
        params: {query: {keyword, page, size}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as PaginatedResponse<Contract>;
}

export async function fetchExpiringContracts(daysAhead: number = 90): Promise<Contract[]> {
    const {data, error} = await apiClient.GET('/contracts/expiring', {
        params: {query: {daysAhead}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Contract[];
}

export async function fetchContract(contractId: string): Promise<Contract> {
    const {data, error} = await apiClient.GET('/contracts/{contractId}', {
        params: {path: {contractId}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Contract;
}

export async function fetchContractSummary(contractId: string): Promise<ContractSummary> {
    const {data, error} = await apiClient.GET('/contracts/{contractId}/summary', {
        params: {path: {contractId}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as ContractSummary;
}

export async function createContract(request: CreateContractRequest): Promise<Contract> {
    const {data, error} = await apiClient.POST('/contracts', {
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Contract;
}

export async function updateContract(
    contractId: string,
    request: UpdateContractRequest
): Promise<Contract> {
    const {data, error} = await apiClient.PUT('/contracts/{contractId}', {
        params: {path: {contractId}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Contract;
}

export async function updateContractStatus(
    contractId: string,
    status: ContractStatus
): Promise<void> {
    const {error} = await apiClient.PUT('/contracts/{contractId}/status', {
        params: {path: {contractId}, query: {status}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

// ==================== CLIN Endpoints ====================

export async function fetchClins(contractId: string): Promise<ContractClin[]> {
    const {data, error} = await apiClient.GET('/contracts/{contractId}/clins', {
        params: {path: {contractId}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as ContractClin[];
}

export async function createClin(
    contractId: string,
    request: CreateClinRequest
): Promise<ContractClin> {
    const {data, error} = await apiClient.POST('/contracts/{contractId}/clins', {
        params: {path: {contractId}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as ContractClin;
}

export async function updateClin(
    contractId: string,
    clinId: string,
    request: UpdateClinRequest
): Promise<ContractClin> {
    const {data, error} = await apiClient.PUT('/contracts/{contractId}/clins/{clinId}', {
        params: {path: {contractId, clinId}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as ContractClin;
}

// ==================== Modification Endpoints ====================

export async function fetchModifications(contractId: string): Promise<ContractModification[]> {
    const {data, error} = await apiClient.GET('/contracts/{contractId}/modifications', {
        params: {path: {contractId}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as ContractModification[];
}

export async function createModification(
    contractId: string,
    request: CreateModificationRequest
): Promise<ContractModification> {
    const {data, error} = await apiClient.POST('/contracts/{contractId}/modifications', {
        params: {path: {contractId}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as ContractModification;
}

export async function executeModification(
    contractId: string,
    modificationId: string
): Promise<ContractModification> {
    const {data, error} = await apiClient.POST(
        '/contracts/{contractId}/modifications/{modificationId}/execute',
        {
            params: {path: {contractId, modificationId}},
            body: {},
        }
    );

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as ContractModification;
}

// ==================== Deliverable Endpoints ====================

export async function fetchDeliverables(contractId: string): Promise<ContractDeliverable[]> {
    const {data, error} = await apiClient.GET('/contracts/{contractId}/deliverables', {
        params: {path: {contractId}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as ContractDeliverable[];
}

export async function fetchOverdueDeliverables(
    contractId: string
): Promise<ContractDeliverable[]> {
    const {data, error} = await apiClient.GET(
        '/contracts/{contractId}/deliverables/overdue',
        {
            params: {path: {contractId}},
        }
    );

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as ContractDeliverable[];
}

export async function createDeliverable(
    contractId: string,
    request: CreateDeliverableRequest
): Promise<ContractDeliverable> {
    const {data, error} = await apiClient.POST('/contracts/{contractId}/deliverables', {
        params: {path: {contractId}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as ContractDeliverable;
}

export async function updateDeliverableStatus(
    contractId: string,
    deliverableId: string,
    status: DeliverableStatus
): Promise<ContractDeliverable> {
    const {data, error} = await apiClient.PUT(
        '/contracts/{contractId}/deliverables/{deliverableId}/status',
        {
            params: {path: {contractId, deliverableId}, query: {status}},
            body: {},
        }
    );

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as ContractDeliverable;
}

// ==================== Option Endpoints ====================

export async function fetchApproachingOptionDeadlines(
    daysAhead: number = 60
): Promise<Contract[]> {
    const {data, error} = await apiClient.GET(
        '/contracts/options/approaching-deadlines',
        {
            params: {query: {daysAhead}},
        }
    );

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Contract[];
}

// ==================== Export all functions ====================

export const contractService = {
    // Contracts
    fetchContracts,
    fetchActiveContracts,
    searchContracts,
    fetchExpiringContracts,
    fetchContract,
    fetchContractSummary,
    createContract,
    updateContract,
    updateContractStatus,
    // CLINs
    fetchClins,
    createClin,
    updateClin,
    // Modifications
    fetchModifications,
    createModification,
    executeModification,
    // Deliverables
    fetchDeliverables,
    fetchOverdueDeliverables,
    createDeliverable,
    updateDeliverableStatus,
    // Options
    fetchApproachingOptionDeadlines,
};

export default contractService;
