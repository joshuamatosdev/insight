/**
 * Dashboard Summary Hook
 * Aggregates data from multiple services for the main dashboard
 */

import {useCallback, useEffect, useState} from 'react';
import {fetchActiveContracts, fetchExpiringContracts} from '../services/contractService';
import {fetchExpiringCertifications, fetchExpiringClearances} from '../services/complianceService';
import type {Contract} from '../components/domain/contracts/Contract.types';
import type {Certification, SecurityClearance} from '../types/compliance.types';

// Dashboard summary metrics
export interface DashboardMetrics {
  // Pipeline metrics (from opportunities)
  pipelineValue: number;
  pipelineCount: number;

  // Contract metrics
  activeContracts: number;
  totalContractValue: number;

  // Expiring items (next 30 days)
  expiringContracts: number;
  expiringCertifications: number;
  expiringClearances: number;
  totalExpiringSoon: number;

  // Win rate (calculated from historical data)
  winRate: number;
  winsCount: number;
  lossesCount: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  expiringContractsList: Contract[];
  expiringCertificationsList: Certification[];
  expiringClearancesList: SecurityClearance[];
  activeContractsList: Contract[];
}

export interface UseDashboardSummaryReturn {
  data: DashboardData | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useDashboardSummary(): UseDashboardSummaryReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        activeContractsResult,
        expiringContractsResult,
        expiringCertsResult,
        expiringClearancesResult,
      ] = await Promise.all([
        fetchActiveContracts(0, 100),
        fetchExpiringContracts(30),
        fetchExpiringCertifications(30),
        fetchExpiringClearances(30),
      ]);

      // Process contracts
      const activeContracts = activeContractsResult.success
        ? activeContractsResult.data.content
        : [];
      const expiringContracts = expiringContractsResult.success
        ? expiringContractsResult.data
        : [];

      // Process compliance
      const expiringCerts = expiringCertsResult.success
        ? expiringCertsResult.data
        : [];
      const expiringClearances = expiringClearancesResult.success
        ? expiringClearancesResult.data
        : [];

      // Calculate total contract value
      const totalContractValue = activeContracts.reduce(
        (sum, c) => sum + (c.totalValue ?? 0),
        0
      );

      // Calculate metrics
      const metrics: DashboardMetrics = {
        // Pipeline metrics (placeholder - would come from pipeline service)
        pipelineValue: 0,
        pipelineCount: 0,

        // Contract metrics
        activeContracts: activeContracts.length,
        totalContractValue,

        // Expiring items
        expiringContracts: expiringContracts.length,
        expiringCertifications: expiringCerts.length,
        expiringClearances: expiringClearances.length,
        totalExpiringSoon: expiringContracts.length + expiringCerts.length + expiringClearances.length,

        // Win rate (placeholder - would come from pipeline analytics)
        winRate: 0,
        winsCount: 0,
        lossesCount: 0,
      };

      setData({
        metrics,
        expiringContractsList: expiringContracts,
        expiringCertificationsList: expiringCerts,
        expiringClearancesList: expiringClearances,
        activeContractsList: activeContracts,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load dashboard data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  return {
    data,
    isLoading,
    error,
    refresh,
  };
}

export default useDashboardSummary;
