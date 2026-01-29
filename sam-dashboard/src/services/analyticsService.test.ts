/**
 * Tests for Analytics Service
 * Backend path: /api/analytics/*
 */

import {describe, it, expect, beforeEach, vi} from 'vitest';
import type {
    ActivityItem,
    AnalyticsEvent,
    DashboardStats,
    TopPerformer,
    TrackEventRequest,
} from '../types/analytics.types';
import {
    fetchActivityFeed,
    fetchDashboardStats,
    fetchTopPerformers,
    trackEvent,
} from './analyticsService';

// Mock fetch
global.fetch = vi.fn();

describe('analyticsService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock localStorage
        const mockStorage: Record<string, string> = {
            sam_auth_state: JSON.stringify({token: 'test-token-123'}),
        };
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
            return mockStorage[key] ?? null;
        });
    });

    describe('fetchDashboardStats', () => {
        it('fetches dashboard statistics successfully', async () => {
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
                    SEARCH_PERFORMED: 89,
                },
                viewsTrend: [
                    {date: '2026-01-21', value: 18},
                    {date: '2026-01-22', value: 22},
                    {date: '2026-01-23', value: 15},
                    {date: '2026-01-24', value: 29},
                    {date: '2026-01-25', value: 24},
                    {date: '2026-01-26', value: 19},
                    {date: '2026-01-27', value: 15},
                ],
            };

            (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                ok: true,
                json: async () => mockStats,
            });

            const result = await fetchDashboardStats();

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/analytics/dashboard',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer test-token-123',
                    }),
                })
            );
            expect(result).toEqual(mockStats);
        });

        it('throws error on failed request', async () => {
            (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                ok: false,
                statusText: 'Internal Server Error',
            });

            await expect(fetchDashboardStats()).rejects.toThrow(
                'Failed to fetch dashboard stats: Internal Server Error'
            );
        });

        it('includes auth token in headers', async () => {
            const mockStats: DashboardStats = {
                opportunitiesViewed: 0,
                opportunitiesSaved: 0,
                pipelineValue: 0,
                winRate: null,
                activeUsers: 0,
                recentActivity: 0,
                eventCounts: {},
                viewsTrend: [],
            };

            (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                ok: true,
                json: async () => mockStats,
            });

            await fetchDashboardStats();

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/analytics/dashboard',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer test-token-123',
                    }),
                })
            );
        });

        it('handles missing auth token gracefully', async () => {
            // Override mock to return null
            vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

            const mockStats: DashboardStats = {
                opportunitiesViewed: 0,
                opportunitiesSaved: 0,
                pipelineValue: 0,
                winRate: null,
                activeUsers: 0,
                recentActivity: 0,
                eventCounts: {},
                viewsTrend: [],
            };

            (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                ok: true,
                json: async () => mockStats,
            });

            await fetchDashboardStats();

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/analytics/dashboard',
                expect.objectContaining({
                    headers: expect.not.objectContaining({
                        Authorization: expect.anything(),
                    }),
                })
            );
        });
    });

    describe('fetchActivityFeed', () => {
        it('fetches activity feed with default limit', async () => {
            const mockActivities: ActivityItem[] = [
                {
                    id: '1',
                    userId: 'user-1',
                    userName: 'John Doe',
                    eventType: 'OPPORTUNITY_VIEWED',
                    entityType: 'OPPORTUNITY',
                    entityId: 'opp-123',
                    description: 'Viewed opportunity "Cloud Migration Services"',
                    timestamp: '2026-01-27T10:30:00Z',
                },
                {
                    id: '2',
                    userId: 'user-2',
                    userName: 'Jane Smith',
                    eventType: 'OPPORTUNITY_SAVED',
                    entityType: 'OPPORTUNITY',
                    entityId: 'opp-456',
                    description: 'Saved opportunity "DevSecOps Support"',
                    timestamp: '2026-01-27T09:15:00Z',
                },
            ];

            (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                ok: true,
                json: async () => mockActivities,
            });

            const result = await fetchActivityFeed();

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/analytics/activity?limit=20',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer test-token-123',
                    }),
                })
            );
            expect(result).toEqual(mockActivities);
        });

        it('fetches activity feed with custom limit', async () => {
            const mockActivities: ActivityItem[] = [];

            (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                ok: true,
                json: async () => mockActivities,
            });

            await fetchActivityFeed(50);

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/analytics/activity?limit=50',
                expect.anything()
            );
        });

        it('throws error on failed request', async () => {
            (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                ok: false,
                statusText: 'Bad Request',
            });

            await expect(fetchActivityFeed(20)).rejects.toThrow(
                'Failed to fetch activity feed: Bad Request'
            );
        });
    });

    describe('fetchTopPerformers', () => {
        it('fetches top performers with default limit', async () => {
            const mockPerformers: TopPerformer[] = [
                {
                    userId: 'user-1',
                    userName: 'John Doe',
                    actionCount: 45,
                    value: 1500000,
                },
                {
                    userId: 'user-2',
                    userName: 'Jane Smith',
                    actionCount: 38,
                    value: 1200000,
                },
            ];

            (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                ok: true,
                json: async () => mockPerformers,
            });

            const result = await fetchTopPerformers();

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/analytics/top-performers?limit=10',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer test-token-123',
                    }),
                })
            );
            expect(result).toEqual(mockPerformers);
        });

        it('fetches top performers with custom limit', async () => {
            const mockPerformers: TopPerformer[] = [];

            (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                ok: true,
                json: async () => mockPerformers,
            });

            await fetchTopPerformers(25);

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/analytics/top-performers?limit=25',
                expect.anything()
            );
        });

        it('throws error on failed request', async () => {
            (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                ok: false,
                statusText: 'Unauthorized',
            });

            await expect(fetchTopPerformers(10)).rejects.toThrow(
                'Failed to fetch top performers: Unauthorized'
            );
        });
    });

    describe('trackEvent', () => {
        it('tracks event successfully', async () => {
            const request: TrackEventRequest = {
                eventType: 'OPPORTUNITY_VIEWED',
                entityType: 'OPPORTUNITY',
                entityId: 'opp-789',
                properties: JSON.stringify({source: 'search'}),
                sessionId: 'session-abc-123',
            };

            const mockEvent: AnalyticsEvent = {
                id: 'event-1',
                tenantId: 'tenant-1',
                userId: 'user-1',
                eventType: 'OPPORTUNITY_VIEWED',
                entityType: 'OPPORTUNITY',
                entityId: 'opp-789',
                properties: '{"source":"search"}',
                timestamp: '2026-01-27T12:00:00Z',
                sessionId: 'session-abc-123',
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0',
            };

            (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                ok: true,
                json: async () => mockEvent,
            });

            const result = await trackEvent(request);

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/analytics/track',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer test-token-123',
                    }),
                    body: JSON.stringify(request),
                })
            );
            expect(result).toEqual(mockEvent);
        });

        it('tracks minimal event without optional fields', async () => {
            const request: TrackEventRequest = {
                eventType: 'PAGE_VIEW',
            };

            const mockEvent: AnalyticsEvent = {
                id: 'event-2',
                tenantId: 'tenant-1',
                userId: 'user-1',
                eventType: 'PAGE_VIEW',
                entityType: null,
                entityId: null,
                properties: null,
                timestamp: '2026-01-27T12:05:00Z',
                sessionId: null,
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0',
            };

            (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                ok: true,
                json: async () => mockEvent,
            });

            const result = await trackEvent(request);

            expect(result).toEqual(mockEvent);
        });

        it('throws error on failed request', async () => {
            const request: TrackEventRequest = {
                eventType: 'OPPORTUNITY_VIEWED',
            };

            (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                ok: false,
                statusText: 'Forbidden',
            });

            await expect(trackEvent(request)).rejects.toThrow(
                'Failed to track event: Forbidden'
            );
        });

        it('includes POST method and request body', async () => {
            const request: TrackEventRequest = {
                eventType: 'SEARCH_PERFORMED',
                properties: JSON.stringify({query: 'cloud services'}),
            };

            const mockEvent: AnalyticsEvent = {
                id: 'event-3',
                tenantId: 'tenant-1',
                userId: 'user-1',
                eventType: 'SEARCH_PERFORMED',
                entityType: null,
                entityId: null,
                properties: '{"query":"cloud services"}',
                timestamp: '2026-01-27T12:10:00Z',
                sessionId: null,
                ipAddress: null,
                userAgent: null,
            };

            (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                ok: true,
                json: async () => mockEvent,
            });

            await trackEvent(request);

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/analytics/track',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(request),
                })
            );
        });
    });
});
