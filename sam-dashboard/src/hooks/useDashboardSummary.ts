/**
 * Dashboard Summary Hook
 * Aggregates data from multiple services for the main dashboard using TanStack Query
 */

import {useQuery} from '@tanstack/react-query';
import {useCallback} from 'react';
import type {Contract} from '../components/domain/contracts/Contract.types';
import type {Certification, SecurityClearance} from '../types/compliance.types';
import {queryKeys} from '../lib/query-keys';
import {fetchActiveContracts, fetchExpiringContracts} from '../services/contractService';
import {fetchExpiringCertifications, fetchExpiringClearances} from '../services/complianceService';

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

async function fetchDashboardData(): Promise<DashboardData> {
    // Fetch all data in parallel - use Promise.allSettled to handle partial failures
    const [
        activeContractsResult,
        expiringContractsResult,
        expiringCertsResult,
        expiringClearancesResult,
    ] = await Promise.allSettled([
        fetchActiveContracts(0, 100),
        fetchExpiringContracts(30),
        fetchExpiringCertifications(30),
        fetchExpiringClearances(30),
    ]);

    // Process contracts - handle both success and failure
    const activeContracts =
        activeContractsResult.status === 'fulfilled' && activeContractsResult.value.success
            ? activeContractsResult.value.data.content
            : [];
    const expiringContracts =
        expiringContractsResult.status === 'fulfilled' && expiringContractsResult.value.success
            ? expiringContractsResult.value.data
            : [];

    // Process compliance - handle both success and failure (clearances may fail due to permissions)
    const expiringCerts =
        expiringCertsResult.status === 'fulfilled' && expiringCertsResult.value.success
            ? expiringCertsResult.value.data
            : [];
    const expiringClearances =
        expiringClearancesResult.status === 'fulfilled' && expiringClearancesResult.value.success
            ? expiringClearancesResult.value.data
            : [];

    // Log warnings for failed requests (helpful for debugging)
    if (activeContractsResult.status === 'rejected' || (activeContractsResult.status === 'fulfilled' && activeContractsResult.value.success === false)) {
        console.warn('Failed to fetch active contracts:', activeContractsResult.status === 'rejected' ? activeContractsResult.reason : activeContractsResult.value.error);
    }
    if (expiringContractsResult.status === 'rejected' || (expiringContractsResult.status === 'fulfilled' && expiringContractsResult.value.success === false)) {
        console.warn('Failed to fetch expiring contracts:', expiringContractsResult.status === 'rejected' ? expiringContractsResult.reason : expiringContractsResult.value.error);
    }
    if (expiringCertsResult.status === 'rejected' || (expiringCertsResult.status === 'fulfilled' && expiringCertsResult.value.success === false)) {
        console.warn('Failed to fetch expiring certifications:', expiringCertsResult.status === 'rejected' ? expiringCertsResult.reason : expiringCertsResult.value.error);
    }
    if (expiringClearancesResult.status === 'rejected' || (expiringClearancesResult.status === 'fulfilled' && expiringClearancesResult.value.success === false)) {
        console.warn('Failed to fetch expiring clearances (may require ADMIN role):', expiringClearancesResult.status === 'rejected' ? expiringClearancesResult.reason : expiringClearancesResult.value.error);
    }

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

    return {
        metrics,
        expiringContractsList: expiringContracts,
        expiringCertificationsList: expiringCerts,
        expiringClearancesList: expiringClearances,
        activeContractsList: activeContracts,
    };
}

export function useDashboardSummary(): UseDashboardSummaryReturn {
    const query = useQuery({
        queryKey: queryKeys.dashboard.summary(),
        queryFn: fetchDashboardData,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });

    const refresh = useCallback(async () => {
        await query.refetch();
    }, [query]);

    return {
        data: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error ?? null,
        refresh,
    };
}

export default useDashboardSummary;
