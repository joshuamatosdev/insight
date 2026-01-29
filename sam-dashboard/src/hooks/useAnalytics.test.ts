/**
 * Tests for useAnalytics hook
 */

import {describe, it, expect, beforeEach, vi} from 'vitest';
import {renderHook, waitFor} from '@testing-library/react';
import type {
    ActivityItem,
    DashboardStats,
    TopPerformer,
} from '../types/analytics.types';
import {useAnalyticsDashboard} from './useAnalytics';
import * as analyticsService from '../services/analyticsService';

// Mock the service
vi.mock('../services/analyticsService');

describe('useAnalytics', () => {
    const mockStats: DashboardStats = {
        opportunitiesViewed: 142,
        opportunitiesSaved: 38,
        pipelineValue: 2500000,
        winRate: 32.5,
        activeUsers: 12,
        recentActivity: 234,
        eventCounts: {
            OPPORTUNITY_VIEWED: 142,
            OPPORTUNITY_SAVED: 38,
        },
        viewsTrend: [
            {date: '2026-01-21', value: 18},
            {date: '2026-01-22', value: 22},
            {date: '2026-01-23', value: 15},
        ],
    };

    const mockActivities: ActivityItem[] = [
        {
            id: '1',
            userId: 'user-1',
            userName: 'John Doe',
            eventType: 'OPPORTUNITY_VIEWED',
            entityType: 'OPPORTUNITY',
            entityId: 'opp-123',
            description: 'Viewed opportunity',
            timestamp: '2026-01-27T10:30:00Z',
        },
    ];

    const mockPerformers: TopPerformer[] = [
        {
            userId: 'user-1',
            userName: 'John Doe',
            actionCount: 45,
            value: 1500000,
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('useAnalyticsDashboard', () => {
        it('loads dashboard data on mount', async () => {
            vi.spyOn(analyticsService, 'fetchDashboardStats').mockResolvedValue(mockStats);
            vi.spyOn(analyticsService, 'fetchActivityFeed').mockResolvedValue(mockActivities);
            vi.spyOn(analyticsService, 'fetchTopPerformers').mockResolvedValue(mockPerformers);

            const {result} = renderHook(() => useAnalyticsDashboard());

            // Initially loading
            expect(result.current.isLoading).toBe(true);
            expect(result.current.stats).toBe(null);
            expect(result.current.activities).toEqual([]);
            expect(result.current.performers).toEqual([]);
            expect(result.current.error).toBe(null);

            // Wait for data to load
            await waitFor(() => {
                return result.current.isLoading === false;
            });

            // Data loaded
            expect(result.current.stats).toEqual(mockStats);
            expect(result.current.activities).toEqual(mockActivities);
            expect(result.current.performers).toEqual(mockPerformers);
            expect(result.current.trendData).toEqual(mockStats.viewsTrend);
            expect(result.current.error).toBe(null);
        });

        it('makes parallel API calls', async () => {
            vi.spyOn(analyticsService, 'fetchDashboardStats').mockResolvedValue(mockStats);
            vi.spyOn(analyticsService, 'fetchActivityFeed').mockResolvedValue(mockActivities);
            vi.spyOn(analyticsService, 'fetchTopPerformers').mockResolvedValue(mockPerformers);

            renderHook(() => useAnalyticsDashboard());

            // Wait for calls to complete
            await waitFor(() => {
                return analyticsService.fetchDashboardStats as ReturnType<typeof vi.fn>;
            });

            // All three functions should be called
            expect(analyticsService.fetchDashboardStats).toHaveBeenCalledTimes(1);
            expect(analyticsService.fetchActivityFeed).toHaveBeenCalledWith(20);
            expect(analyticsService.fetchTopPerformers).toHaveBeenCalledWith(10);
        });

        it('handles empty trend data gracefully', async () => {
            const statsWithoutTrend: DashboardStats = {
                ...mockStats,
                viewsTrend: [],
            };

            vi.spyOn(analyticsService, 'fetchDashboardStats').mockResolvedValue(statsWithoutTrend);
            vi.spyOn(analyticsService, 'fetchActivityFeed').mockResolvedValue(mockActivities);
            vi.spyOn(analyticsService, 'fetchTopPerformers').mockResolvedValue(mockPerformers);

            const {result} = renderHook(() => useAnalyticsDashboard());

            await waitFor(() => {
                return result.current.isLoading === false;
            });

            expect(result.current.trendData).toEqual([]);
        });

        it('handles errors from fetchDashboardStats', async () => {
            const error = new Error('Failed to fetch stats');
            vi.spyOn(analyticsService, 'fetchDashboardStats').mockRejectedValue(error);
            vi.spyOn(analyticsService, 'fetchActivityFeed').mockResolvedValue(mockActivities);
            vi.spyOn(analyticsService, 'fetchTopPerformers').mockResolvedValue(mockPerformers);

            const {result} = renderHook(() => useAnalyticsDashboard());

            await waitFor(() => {
                return result.current.isLoading === false;
            });

            expect(result.current.error).toBeInstanceOf(Error);
            expect(result.current.error?.message).toBe('Failed to fetch stats');
            expect(result.current.stats).toBe(null);
        });

        it('handles errors from fetchActivityFeed', async () => {
            const error = new Error('Failed to fetch activities');
            vi.spyOn(analyticsService, 'fetchDashboardStats').mockResolvedValue(mockStats);
            vi.spyOn(analyticsService, 'fetchActivityFeed').mockRejectedValue(error);
            vi.spyOn(analyticsService, 'fetchTopPerformers').mockResolvedValue(mockPerformers);

            const {result} = renderHook(() => useAnalyticsDashboard());

            await waitFor(() => {
                return result.current.isLoading === false;
            });

            expect(result.current.error).toBeInstanceOf(Error);
            expect(result.current.error?.message).toBe('Failed to fetch activities');
            expect(result.current.activities).toEqual([]);
        });

        it('handles errors from fetchTopPerformers', async () => {
            const error = new Error('Failed to fetch performers');
            vi.spyOn(analyticsService, 'fetchDashboardStats').mockResolvedValue(mockStats);
            vi.spyOn(analyticsService, 'fetchActivityFeed').mockResolvedValue(mockActivities);
            vi.spyOn(analyticsService, 'fetchTopPerformers').mockRejectedValue(error);

            const {result} = renderHook(() => useAnalyticsDashboard());

            await waitFor(() => {
                return result.current.isLoading === false;
            });

            expect(result.current.error).toBeInstanceOf(Error);
            expect(result.current.error?.message).toBe('Failed to fetch performers');
            expect(result.current.performers).toEqual([]);
        });

        it('handles non-Error exceptions', async () => {
            vi.spyOn(analyticsService, 'fetchDashboardStats').mockRejectedValue('String error');
            vi.spyOn(analyticsService, 'fetchActivityFeed').mockResolvedValue(mockActivities);
            vi.spyOn(analyticsService, 'fetchTopPerformers').mockResolvedValue(mockPerformers);

            const {result} = renderHook(() => useAnalyticsDashboard());

            await waitFor(() => {
                return result.current.isLoading === false;
            });

            expect(result.current.error).toBeInstanceOf(Error);
            expect(result.current.error?.message).toBe('Failed to load dashboard data');
        });

        it('clears error on successful refresh', async () => {
            // First call fails
            const error = new Error('Network error');
            vi.spyOn(analyticsService, 'fetchDashboardStats').mockRejectedValueOnce(error);
            vi.spyOn(analyticsService, 'fetchActivityFeed').mockResolvedValue(mockActivities);
            vi.spyOn(analyticsService, 'fetchTopPerformers').mockResolvedValue(mockPerformers);

            const {result} = renderHook(() => useAnalyticsDashboard());

            await waitFor(() => {
                return result.current.isLoading === false;
            });

            expect(result.current.error).toBeInstanceOf(Error);

            // Second call succeeds
            vi.spyOn(analyticsService, 'fetchDashboardStats').mockResolvedValue(mockStats);

            // Call refresh
            await result.current.refresh();

            await waitFor(() => {
                return result.current.error === null;
            });

            expect(result.current.error).toBe(null);
            expect(result.current.stats).toEqual(mockStats);
        });

        it('refresh function reloads data', async () => {
            vi.spyOn(analyticsService, 'fetchDashboardStats').mockResolvedValue(mockStats);
            vi.spyOn(analyticsService, 'fetchActivityFeed').mockResolvedValue(mockActivities);
            vi.spyOn(analyticsService, 'fetchTopPerformers').mockResolvedValue(mockPerformers);

            const {result} = renderHook(() => useAnalyticsDashboard());

            await waitFor(() => {
                return result.current.isLoading === false;
            });

            // Clear mocks to track refresh calls
            vi.clearAllMocks();

            vi.spyOn(analyticsService, 'fetchDashboardStats').mockResolvedValue(mockStats);
            vi.spyOn(analyticsService, 'fetchActivityFeed').mockResolvedValue(mockActivities);
            vi.spyOn(analyticsService, 'fetchTopPerformers').mockResolvedValue(mockPerformers);

            // Call refresh
            await result.current.refresh();

            // Should call all three APIs again
            expect(analyticsService.fetchDashboardStats).toHaveBeenCalledTimes(1);
            expect(analyticsService.fetchActivityFeed).toHaveBeenCalledTimes(1);
            expect(analyticsService.fetchTopPerformers).toHaveBeenCalledTimes(1);
        });

        it('sets loading state during refresh', async () => {
            vi.spyOn(analyticsService, 'fetchDashboardStats').mockResolvedValue(mockStats);
            vi.spyOn(analyticsService, 'fetchActivityFeed').mockResolvedValue(mockActivities);
            vi.spyOn(analyticsService, 'fetchTopPerformers').mockResolvedValue(mockPerformers);

            const {result} = renderHook(() => useAnalyticsDashboard());

            await waitFor(() => {
                return result.current.isLoading === false;
            });

            expect(result.current.isLoading).toBe(false);

            // Start refresh (don't await yet)
            const refreshPromise = result.current.refresh();

            // Should be loading
            await waitFor(() => {
                return result.current.isLoading === true;
            });

            // Wait for refresh to complete
            await refreshPromise;

            // Should not be loading
            await waitFor(() => {
                return result.current.isLoading === false;
            });
        });
    });
});
