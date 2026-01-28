/**
 * React Query hooks for Compliance Management
 */

import {useCallback, useEffect, useState} from 'react';
import type {
    Certification,
    CertificationType,
    ClearanceLevel,
    CreateCertificationRequest,
    CreateClearanceRequest,
    CycloneDxBom,
    SbomInfo,
    SbomVulnerabilityInfo,
    SecurityClearance,
    UpdateCertificationRequest,
    UpdateClearanceRequest,
} from '../types/compliance.types';
import {
    createCertification,
    createClearance,
    deleteCertification,
    deleteClearance,
    fetchCertification,
    fetchCertifications,
    fetchClearances,
    fetchComplianceItems,
    fetchExpiringCertifications,
    fetchExpiringClearances,
    fetchSbomData,
    updateCertification,
    updateClearance,
} from '../services/complianceService';

// ==================== Types ====================

export interface UseCertificationsReturn {
  certifications: Certification[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
  create: (data: CreateCertificationRequest) => Promise<Certification | null>;
  update: (id: string, data: UpdateCertificationRequest) => Promise<Certification | null>;
  remove: (id: string) => Promise<boolean>;
}

export interface UseCertificationReturn {
  certification: Certification | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export interface UseExpiringCertificationsReturn {
  certifications: Certification[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export interface UseClearancesReturn {
  clearances: SecurityClearance[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
  create: (data: CreateClearanceRequest) => Promise<SecurityClearance | null>;
  update: (id: string, data: UpdateClearanceRequest) => Promise<SecurityClearance | null>;
  remove: (id: string) => Promise<boolean>;
}

export interface UseExpiringClearancesReturn {
  clearances: SecurityClearance[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export interface UseSbomReturn {
  info: SbomInfo | null;
  bom: CycloneDxBom | null;
  vulnerabilities: SbomVulnerabilityInfo | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export interface UseComplianceOverviewReturn {
  certifications: Certification[];
  clearances: SecurityClearance[];
  expiringCertifications: Certification[];
  expiringClearances: SecurityClearance[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

// ==================== Certifications Hooks ====================

/**
 * Hook for managing certifications list
 */
export function useCertifications(
  type?: CertificationType,
  pageSize: number = 20
): UseCertificationsReturn {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCertifications = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchCertifications(page, pageSize, type);
      if (result.success) {
        setCertifications(result.data.content);
        setTotalElements(result.data.totalElements);
        setTotalPages(result.data.totalPages);
        setCurrentPage(result.data.number);
      } else {
        setError(new Error(result.error.message));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch certifications'));
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, type]);

  useEffect(() => {
    loadCertifications(0);
  }, [loadCertifications]);

  const refresh = useCallback(async () => {
    await loadCertifications(currentPage);
  }, [loadCertifications, currentPage]);

  const setPage = useCallback((page: number) => {
    loadCertifications(page);
  }, [loadCertifications]);

  const create = useCallback(async (data: CreateCertificationRequest): Promise<Certification | null> => {
    try {
      const result = await createCertification(data);
      if (result.success) {
        await refresh();
        return result.data;
      }
      setError(new Error(result.error.message));
      return null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create certification'));
      return null;
    }
  }, [refresh]);

  const update = useCallback(async (
    id: string,
    data: UpdateCertificationRequest
  ): Promise<Certification | null> => {
    try {
      const result = await updateCertification(id, data);
      if (result.success) {
        await refresh();
        return result.data;
      }
      setError(new Error(result.error.message));
      return null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update certification'));
      return null;
    }
  }, [refresh]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      const result = await deleteCertification(id);
      if (result.success) {
        await refresh();
        return true;
      }
      setError(new Error(result.error.message));
      return false;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete certification'));
      return false;
    }
  }, [refresh]);

  return {
    certifications,
    totalElements,
    totalPages,
    currentPage,
    isLoading,
    error,
    refresh,
    setPage,
    create,
    update,
    remove,
  };
}

/**
 * Hook for fetching a single certification
 */
export function useCertification(id: string | null): UseCertificationReturn {
  const [certification, setCertification] = useState<Certification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCertification = useCallback(async () => {
    if (id === null) {
      setCertification(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchCertification(id);
      if (result.success) {
        setCertification(result.data);
      } else {
        setError(new Error(result.error.message));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch certification'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCertification();
  }, [loadCertification]);

  const refresh = useCallback(async () => {
    await loadCertification();
  }, [loadCertification]);

  return { certification, isLoading, error, refresh };
}

/**
 * Hook for fetching expiring certifications
 */
export function useExpiringCertifications(
  daysAhead: number = 30
): UseExpiringCertificationsReturn {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCertifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchExpiringCertifications(daysAhead);
      if (result.success) {
        setCertifications(result.data);
      } else {
        setError(new Error(result.error.message));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch expiring certifications'));
    } finally {
      setIsLoading(false);
    }
  }, [daysAhead]);

  useEffect(() => {
    loadCertifications();
  }, [loadCertifications]);

  const refresh = useCallback(async () => {
    await loadCertifications();
  }, [loadCertifications]);

  return { certifications, isLoading, error, refresh };
}

// ==================== Clearances Hooks ====================

/**
 * Hook for managing security clearances list
 */
export function useClearances(
  level?: ClearanceLevel,
  pageSize: number = 20
): UseClearancesReturn {
  const [clearances, setClearances] = useState<SecurityClearance[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadClearances = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchClearances(page, pageSize, level);
      if (result.success) {
        setClearances(result.data.content);
        setTotalElements(result.data.totalElements);
        setTotalPages(result.data.totalPages);
        setCurrentPage(result.data.number);
      } else {
        setError(new Error(result.error.message));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch clearances'));
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, level]);

  useEffect(() => {
    loadClearances(0);
  }, [loadClearances]);

  const refresh = useCallback(async () => {
    await loadClearances(currentPage);
  }, [loadClearances, currentPage]);

  const setPage = useCallback((page: number) => {
    loadClearances(page);
  }, [loadClearances]);

  const create = useCallback(async (data: CreateClearanceRequest): Promise<SecurityClearance | null> => {
    try {
      const result = await createClearance(data);
      if (result.success) {
        await refresh();
        return result.data;
      }
      setError(new Error(result.error.message));
      return null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create clearance'));
      return null;
    }
  }, [refresh]);

  const update = useCallback(async (
    id: string,
    data: UpdateClearanceRequest
  ): Promise<SecurityClearance | null> => {
    try {
      const result = await updateClearance(id, data);
      if (result.success) {
        await refresh();
        return result.data;
      }
      setError(new Error(result.error.message));
      return null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update clearance'));
      return null;
    }
  }, [refresh]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      const result = await deleteClearance(id);
      if (result.success) {
        await refresh();
        return true;
      }
      setError(new Error(result.error.message));
      return false;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete clearance'));
      return false;
    }
  }, [refresh]);

  return {
    clearances,
    totalElements,
    totalPages,
    currentPage,
    isLoading,
    error,
    refresh,
    setPage,
    create,
    update,
    remove,
  };
}

/**
 * Hook for fetching expiring clearances
 */
export function useExpiringClearances(
  daysAhead: number = 90
): UseExpiringClearancesReturn {
  const [clearances, setClearances] = useState<SecurityClearance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadClearances = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchExpiringClearances(daysAhead);
      if (result.success) {
        setClearances(result.data);
      } else {
        setError(new Error(result.error.message));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch expiring clearances'));
    } finally {
      setIsLoading(false);
    }
  }, [daysAhead]);

  useEffect(() => {
    loadClearances();
  }, [loadClearances]);

  const refresh = useCallback(async () => {
    await loadClearances();
  }, [loadClearances]);

  return { clearances, isLoading, error, refresh };
}

// ==================== SBOM Hook ====================

/**
 * Hook for fetching SBOM data
 */
export function useSbom(): UseSbomReturn {
  const [info, setInfo] = useState<SbomInfo | null>(null);
  const [bom, setBom] = useState<CycloneDxBom | null>(null);
  const [vulnerabilities, setVulnerabilities] = useState<SbomVulnerabilityInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSbomData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchSbomData();
      if (result.success) {
        setInfo(result.data.info);
        setBom(result.data.bom);
        setVulnerabilities(result.data.vulnerabilities);
      } else {
        setError(new Error(result.error.message));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch SBOM data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSbomData();
  }, [loadSbomData]);

  const refresh = useCallback(async () => {
    await loadSbomData();
  }, [loadSbomData]);

  return { info, bom, vulnerabilities, isLoading, error, refresh };
}

// ==================== Compliance Overview Hook ====================

/**
 * Hook for fetching compliance overview data
 */
export function useComplianceOverview(): UseComplianceOverviewReturn {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [clearances, setClearances] = useState<SecurityClearance[]>([]);
  const [expiringCertifications, setExpiringCertifications] = useState<Certification[]>([]);
  const [expiringClearances, setExpiringClearances] = useState<SecurityClearance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchComplianceItems();
      if (result.success) {
        setCertifications(result.data.certifications);
        setClearances(result.data.clearances);
        setExpiringCertifications(result.data.expiringCertifications);
        setExpiringClearances(result.data.expiringClearances);
      } else {
        setError(new Error(result.error.message));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch compliance data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return {
    certifications,
    clearances,
    expiringCertifications,
    expiringClearances,
    isLoading,
    error,
    refresh,
  };
}

export default {
  useCertifications,
  useCertification,
  useExpiringCertifications,
  useClearances,
  useExpiringClearances,
  useSbom,
  useComplianceOverview,
};
