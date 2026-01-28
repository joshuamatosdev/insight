/**
 * Contract Service - API calls for contract management
 */

import {apiClient} from './apiClient';
import type {ApiResult} from './types';
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
): Promise<ApiResult<PaginatedResponse<Contract>>> {
  return apiClient.get<PaginatedResponse<Contract>>('/contracts', {
    params: { page, size, sortBy, sortDir },
  });
}

export async function fetchActiveContracts(
  page: number = 0,
  size: number = 20
): Promise<ApiResult<PaginatedResponse<Contract>>> {
  return apiClient.get<PaginatedResponse<Contract>>('/contracts/active', {
    params: { page, size },
  });
}

export async function searchContracts(
  keyword: string,
  page: number = 0,
  size: number = 20
): Promise<ApiResult<PaginatedResponse<Contract>>> {
  return apiClient.get<PaginatedResponse<Contract>>('/contracts/search', {
    params: { keyword, page, size },
  });
}

export async function fetchExpiringContracts(
  daysAhead: number = 90
): Promise<ApiResult<Contract[]>> {
  return apiClient.get<Contract[]>('/contracts/expiring', {
    params: { daysAhead },
  });
}

export async function fetchContract(contractId: string): Promise<ApiResult<Contract>> {
  return apiClient.get<Contract>(`/contracts/${contractId}`);
}

export async function fetchContractSummary(
  contractId: string
): Promise<ApiResult<ContractSummary>> {
  return apiClient.get<ContractSummary>(`/contracts/${contractId}/summary`);
}

export async function createContract(
  request: CreateContractRequest
): Promise<ApiResult<Contract>> {
  return apiClient.post<Contract, CreateContractRequest>('/contracts', request);
}

export async function updateContract(
  contractId: string,
  request: UpdateContractRequest
): Promise<ApiResult<Contract>> {
  return apiClient.put<Contract, UpdateContractRequest>(
    `/contracts/${contractId}`,
    request
  );
}

export async function updateContractStatus(
  contractId: string,
  status: ContractStatus
): Promise<ApiResult<void>> {
  return apiClient.post<void, Record<string, never>>(
    `/contracts/${contractId}/status?status=${status}`,
    {}
  );
}

// ==================== CLIN Endpoints ====================

export async function fetchClins(contractId: string): Promise<ApiResult<ContractClin[]>> {
  return apiClient.get<ContractClin[]>(`/contracts/${contractId}/clins`);
}

export async function createClin(
  contractId: string,
  request: CreateClinRequest
): Promise<ApiResult<ContractClin>> {
  return apiClient.post<ContractClin, CreateClinRequest>(
    `/contracts/${contractId}/clins`,
    request
  );
}

export async function updateClin(
  contractId: string,
  clinId: string,
  request: UpdateClinRequest
): Promise<ApiResult<ContractClin>> {
  return apiClient.put<ContractClin, UpdateClinRequest>(
    `/contracts/${contractId}/clins/${clinId}`,
    request
  );
}

// ==================== Modification Endpoints ====================

export async function fetchModifications(
  contractId: string
): Promise<ApiResult<ContractModification[]>> {
  return apiClient.get<ContractModification[]>(`/contracts/${contractId}/modifications`);
}

export async function createModification(
  contractId: string,
  request: CreateModificationRequest
): Promise<ApiResult<ContractModification>> {
  return apiClient.post<ContractModification, CreateModificationRequest>(
    `/contracts/${contractId}/modifications`,
    request
  );
}

export async function executeModification(
  contractId: string,
  modificationId: string
): Promise<ApiResult<ContractModification>> {
  return apiClient.post<ContractModification, Record<string, never>>(
    `/contracts/${contractId}/modifications/${modificationId}/execute`,
    {}
  );
}

// ==================== Deliverable Endpoints ====================

export async function fetchDeliverables(
  contractId: string
): Promise<ApiResult<ContractDeliverable[]>> {
  return apiClient.get<ContractDeliverable[]>(`/contracts/${contractId}/deliverables`);
}

export async function fetchOverdueDeliverables(
  contractId: string
): Promise<ApiResult<ContractDeliverable[]>> {
  return apiClient.get<ContractDeliverable[]>(
    `/contracts/${contractId}/deliverables/overdue`
  );
}

export async function createDeliverable(
  contractId: string,
  request: CreateDeliverableRequest
): Promise<ApiResult<ContractDeliverable>> {
  return apiClient.post<ContractDeliverable, CreateDeliverableRequest>(
    `/contracts/${contractId}/deliverables`,
    request
  );
}

export async function updateDeliverableStatus(
  contractId: string,
  deliverableId: string,
  status: DeliverableStatus
): Promise<ApiResult<ContractDeliverable>> {
  return apiClient.post<ContractDeliverable, Record<string, never>>(
    `/contracts/${contractId}/deliverables/${deliverableId}/status?status=${status}`,
    {}
  );
}

// ==================== Option Endpoints ====================

export async function fetchApproachingOptionDeadlines(
  daysAhead: number = 60
): Promise<ApiResult<Contract[]>> {
  return apiClient.get<Contract[]>('/contracts/options/approaching-deadlines', {
    params: { daysAhead },
  });
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
