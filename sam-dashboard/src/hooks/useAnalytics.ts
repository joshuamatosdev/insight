/**
 * React hooks for Analytics Dashboard
 */

import {useCallback, useEffect, useState} from 'react';
import type {ActivityItem, DashboardStats, TopPerformer, TrendPoint} from '../types/analytics.types';
import {fetchActivityFeed, fetchDashboardStats, fetchTopPerformers} from '../services/analyticsService';

// ==================== Types ====================

export interface UseAnalyticsDashboardReturn {
    stats: DashboardStats | null;
    activities: ActivityItem[];
    performers: TopPerformer[];
    trendData: TrendPoint[];
    isLoading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
}

// ==================== Hooks ====================

/**
 * Hook for managing analytics dashboard data
 */
export function useAnalyticsDashboard(): UseAnalyticsDashboardReturn {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [performers, setPerformers] = useState<TopPerformer[]>([]);
    const [trendData, setTrendData] = useState<TrendPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadDashboardData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Parallel fetch
            const [statsResult, activitiesResult, performersResult] = await Promise.all([
                fetchDashboardStats(),
                fetchActivityFeed(20),
                fetchTopPerformers(10),
            ]);

            setStats(statsResult);
            setActivities(activitiesResult);
            setPerformers(performersResult);

            if (statsResult.viewsTrend !== undefined && statsResult.viewsTrend !== null) {
                setTrendData(statsResult.viewsTrend);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
            setError(new Error(errorMessage));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadDashboardData();
    }, [loadDashboardData]);

    const refresh = useCallback(async () => {
        await loadDashboardData();
    }, [loadDashboardData]);

    return {
        stats,
        activities,
        performers,
        trendData,
        isLoading,
        error,
        refresh,
    };
}

export default {
    useAnalyticsDashboard,
};
