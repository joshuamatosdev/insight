/**
 * Compliance Service - API calls for Certifications, Clearances, and SBOM
 */

import { apiClient } from './apiClient';
import type { ApiResult } from './types';
import type {
  Certification,
  CreateCertificationRequest,
  UpdateCertificationRequest,
  CertificationType,
  CertificationStatus,
  SecurityClearance,
  CreateClearanceRequest,
  UpdateClearanceRequest,
  ClearanceLevel,
  ClearanceStatus,
  SbomInfo,
  SbomVulnerabilityInfo,
  CycloneDxBom,
} from '../types/compliance.types';
import type { PaginatedResponse } from '../types/financial.types';

// ==================== Certification API ====================

/**
 * Fetches paginated list of certifications
 */
export async function fetchCertifications(
  page: number = 0,
  size: number = 20,
  type?: CertificationType
): Promise<ApiResult<PaginatedResponse<Certification>>> {
  const params: Record<string, string | number> = { page, size };
  if (type !== undefined) {
    params.type = type;
  }
  return apiClient.get<PaginatedResponse<Certification>>('/certifications', { params });
}

/**
 * Fetches a single certification by ID
 */
export async function fetchCertification(id: string): Promise<ApiResult<Certification>> {
  return apiClient.get<Certification>(`/certifications/${id}`);
}

/**
 * Fetches certifications expiring within the specified days
 */
export async function fetchExpiringCertifications(
  daysAhead: number = 30
): Promise<ApiResult<Certification[]>> {
  return apiClient.get<Certification[]>('/certifications/expiring', {
    params: { daysAhead },
  });
}

/**
 * Creates a new certification
 */
export async function createCertification(
  request: CreateCertificationRequest
): Promise<ApiResult<Certification>> {
  return apiClient.post<Certification, CreateCertificationRequest>(
    '/certifications',
    request
  );
}

/**
 * Updates an existing certification
 */
export async function updateCertification(
  id: string,
  request: UpdateCertificationRequest
): Promise<ApiResult<Certification>> {
  return apiClient.put<Certification, UpdateCertificationRequest>(
    `/certifications/${id}`,
    request
  );
}

/**
 * Updates certification status
 */
export async function updateCertificationStatus(
  id: string,
  status: CertificationStatus
): Promise<ApiResult<void>> {
  return apiClient.post<void, Record<string, never>>(
    `/certifications/${id}/status?status=${status}`,
    {}
  );
}

/**
 * Deletes a certification
 */
export async function deleteCertification(id: string): Promise<ApiResult<void>> {
  return apiClient.delete<void>(`/certifications/${id}`);
}

/**
 * Fetches available certification types
 */
export async function fetchCertificationTypes(): Promise<ApiResult<CertificationType[]>> {
  return apiClient.get<CertificationType[]>('/certifications/types');
}

// ==================== Security Clearance API ====================

/**
 * Fetches paginated list of security clearances
 */
export async function fetchClearances(
  page: number = 0,
  size: number = 20,
  level?: ClearanceLevel
): Promise<ApiResult<PaginatedResponse<SecurityClearance>>> {
  const params: Record<string, string | number> = { page, size };
  if (level !== undefined) {
    params.level = level;
  }
  return apiClient.get<PaginatedResponse<SecurityClearance>>('/clearances', { params });
}

/**
 * Fetches a clearance by user ID
 */
export async function fetchClearanceByUser(
  userId: string
): Promise<ApiResult<SecurityClearance>> {
  return apiClient.get<SecurityClearance>(`/clearances/user/${userId}`);
}

/**
 * Fetches clearances expiring within the specified days
 */
export async function fetchExpiringClearances(
  daysAhead: number = 90
): Promise<ApiResult<SecurityClearance[]>> {
  return apiClient.get<SecurityClearance[]>('/clearances/expiring', {
    params: { daysAhead },
  });
}

/**
 * Fetches clearances at or above a minimum level
 */
export async function fetchClearancesByMinLevel(
  minLevel: ClearanceLevel
): Promise<ApiResult<SecurityClearance[]>> {
  return apiClient.get<SecurityClearance[]>(`/clearances/level/${minLevel}`);
}

/**
 * Creates a new security clearance
 */
export async function createClearance(
  request: CreateClearanceRequest
): Promise<ApiResult<SecurityClearance>> {
  return apiClient.post<SecurityClearance, CreateClearanceRequest>(
    '/clearances',
    request
  );
}

/**
 * Updates an existing security clearance
 */
export async function updateClearance(
  id: string,
  request: UpdateClearanceRequest
): Promise<ApiResult<SecurityClearance>> {
  return apiClient.put<SecurityClearance, UpdateClearanceRequest>(
    `/clearances/${id}`,
    request
  );
}

/**
 * Updates clearance status
 */
export async function updateClearanceStatus(
  id: string,
  status: ClearanceStatus
): Promise<ApiResult<void>> {
  return apiClient.post<void, Record<string, never>>(
    `/clearances/${id}/status?status=${status}`,
    {}
  );
}

/**
 * Deletes a security clearance
 */
export async function deleteClearance(id: string): Promise<ApiResult<void>> {
  return apiClient.delete<void>(`/clearances/${id}`);
}

/**
 * Fetches available clearance levels
 */
export async function fetchClearanceLevels(): Promise<ApiResult<ClearanceLevel[]>> {
  return apiClient.get<ClearanceLevel[]>('/clearances/levels');
}

// ==================== SBOM API ====================

/**
 * Fetches SBOM overview information
 */
export async function fetchSbomInfo(): Promise<ApiResult<SbomInfo>> {
  return apiClient.get<SbomInfo>('/sbom');
}

/**
 * Fetches CycloneDX SBOM data
 */
export async function fetchCycloneDxSbom(): Promise<ApiResult<CycloneDxBom>> {
  return apiClient.get<CycloneDxBom>('/sbom/cyclonedx');
}

/**
 * Fetches SPDX SBOM data
 */
export async function fetchSpdxSbom(): Promise<ApiResult<unknown>> {
  return apiClient.get<unknown>('/sbom/spdx');
}

/**
 * Fetches SBOM vulnerability information
 */
export async function fetchSbomVulnerabilities(): Promise<ApiResult<SbomVulnerabilityInfo>> {
  return apiClient.get<SbomVulnerabilityInfo>('/sbom/vulnerabilities');
}

// ==================== Compliance Overview ====================

/**
 * Fetches compliance items (combined certifications and clearances summary)
 */
export async function fetchComplianceItems(): Promise<
  ApiResult<{
    certifications: Certification[];
    clearances: SecurityClearance[];
    expiringCertifications: Certification[];
    expiringClearances: SecurityClearance[];
  }>
> {
  // Fetch all data in parallel
  const [certsResult, clearancesResult, expiringCertsResult, expiringClearancesResult] =
    await Promise.all([
      fetchCertifications(0, 100),
      fetchClearances(0, 100),
      fetchExpiringCertifications(90),
      fetchExpiringClearances(90),
    ]);

  if (certsResult.success === false) {
    return { success: false, error: certsResult.error };
  }
  if (clearancesResult.success === false) {
    return { success: false, error: clearancesResult.error };
  }
  if (expiringCertsResult.success === false) {
    return { success: false, error: expiringCertsResult.error };
  }
  if (expiringClearancesResult.success === false) {
    return { success: false, error: expiringClearancesResult.error };
  }

  return {
    success: true,
    data: {
      certifications: certsResult.data.content,
      clearances: clearancesResult.data.content,
      expiringCertifications: expiringCertsResult.data,
      expiringClearances: expiringClearancesResult.data,
    },
  };
}

/**
 * Fetches SBOM data for visualization
 */
export async function fetchSbomData(): Promise<
  ApiResult<{
    info: SbomInfo;
    bom: CycloneDxBom | null;
    vulnerabilities: SbomVulnerabilityInfo | null;
  }>
> {
  const infoResult = await fetchSbomInfo();
  if (infoResult.success === false) {
    return { success: false, error: infoResult.error };
  }

  let bom: CycloneDxBom | null = null;
  let vulnerabilities: SbomVulnerabilityInfo | null = null;

  if (infoResult.data.cyclonedxAvailable) {
    const bomResult = await fetchCycloneDxSbom();
    if (bomResult.success) {
      bom = bomResult.data;
    }
  }

  const vulnResult = await fetchSbomVulnerabilities();
  if (vulnResult.success) {
    vulnerabilities = vulnResult.data;
  }

  return {
    success: true,
    data: {
      info: infoResult.data,
      bom,
      vulnerabilities,
    },
  };
}
