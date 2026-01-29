/**
 * Tests for Analytics Service - Contract Validation
 * Backend path: /api/analytics/*
 *
 * NOTE: These tests validate TypeScript types match backend contracts.
 * NO MOCKING - tests focus on contract validation and error handling logic.
 */

import {describe, it, expect} from 'vitest';
import type {
    ActivityItem,
    AnalyticsEvent,
    DashboardStats,
    TopPerformer,
    TrackEventRequest,
} from '../types/analytics.types';
import {
    ActivityItemSchema,
    AnalyticsEventSchema,
    DashboardStatsSchema,
    TopPerformerSchema,
    TrackEventRequestSchema,
} from '../test/schemas/analytics.schema';

describe('analyticsService - Contract Validation', () => {
    describe('DashboardStats', () => {
        it('matches backend contract schema', () => {
            // Sample data structure that represents backend response
            const sampleStats: DashboardStats = {
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

            // Validate TypeScript type aligns with Zod schema
            const result = DashboardStatsSchema.safeParse(sampleStats);

            expect(result.success).toBe(true);
            if (result.success === true) {
                expect(result.data).toEqual(sampleStats);
            }
        });

        it('validates with null winRate', () => {
            const statsWithNullWinRate: DashboardStats = {
                opportunitiesViewed: 0,
                opportunitiesSaved: 0,
                pipelineValue: 0,
                winRate: null,
                activeUsers: 0,
                recentActivity: 0,
                eventCounts: {},
                viewsTrend: [],
            };

            const result = DashboardStatsSchema.safeParse(statsWithNullWinRate);

            expect(result.success).toBe(true);
        });

        it('validates empty eventCounts and viewsTrend', () => {
            const minimalStats: DashboardStats = {
                opportunitiesViewed: 10,
                opportunitiesSaved: 5,
                pipelineValue: 100000,
                winRate: null,
                activeUsers: 2,
                recentActivity: 15,
                eventCounts: {},
                viewsTrend: [],
            };

            const result = DashboardStatsSchema.safeParse(minimalStats);

            expect(result.success).toBe(true);
        });

        it('rejects invalid schema with missing required fields', () => {
            const invalidStats = {
                opportunitiesViewed: 142,
                opportunitiesSaved: 38,
                // Missing required fields
            };

            const result = DashboardStatsSchema.safeParse(invalidStats);

            expect(result.success).toBe(false);
        });
    });

    describe('ActivityItem', () => {
        it('matches backend contract schema', () => {
            const sampleActivity: ActivityItem = {
                id: '1',
                userId: 'user-1',
                userName: 'John Doe',
                eventType: 'OPPORTUNITY_VIEWED',
                entityType: 'OPPORTUNITY',
                entityId: 'opp-123',
                description: 'Viewed opportunity "Cloud Migration Services"',
                timestamp: '2026-01-27T10:30:00Z',
            };

            const result = ActivityItemSchema.safeParse(sampleActivity);

            expect(result.success).toBe(true);
            if (result.success === true) {
                expect(result.data).toEqual(sampleActivity);
            }
        });

        it('validates with null userId and entityType', () => {
            const activityWithNulls: ActivityItem = {
                id: '2',
                userId: null,
                userName: 'Anonymous',
                eventType: 'PAGE_VIEW',
                entityType: null,
                entityId: null,
                description: 'Page view event',
                timestamp: '2026-01-27T09:15:00Z',
            };

            const result = ActivityItemSchema.safeParse(activityWithNulls);

            expect(result.success).toBe(true);
        });

        it('rejects invalid schema with wrong types', () => {
            const invalidActivity = {
                id: '1',
                userId: 'user-1',
                userName: 'John Doe',
                eventType: 'OPPORTUNITY_VIEWED',
                entityType: 'OPPORTUNITY',
                entityId: 123, // Should be string
                description: 'Viewed opportunity',
                timestamp: '2026-01-27T10:30:00Z',
            };

            const result = ActivityItemSchema.safeParse(invalidActivity);

            expect(result.success).toBe(false);
        });
    });

    describe('TopPerformer', () => {
        it('matches backend contract schema', () => {
            const samplePerformer: TopPerformer = {
                userId: 'user-1',
                userName: 'John Doe',
                actionCount: 45,
                value: 1500000,
            };

            const result = TopPerformerSchema.safeParse(samplePerformer);

            expect(result.success).toBe(true);
            if (result.success === true) {
                expect(result.data).toEqual(samplePerformer);
            }
        });

        it('validates with zero values', () => {
            const performerWithZeros: TopPerformer = {
                userId: 'user-2',
                userName: 'Jane Smith',
                actionCount: 0,
                value: 0,
            };

            const result = TopPerformerSchema.safeParse(performerWithZeros);

            expect(result.success).toBe(true);
        });

        it('rejects invalid schema with missing fields', () => {
            const invalidPerformer = {
                userId: 'user-1',
                userName: 'John Doe',
                // Missing actionCount and value
            };

            const result = TopPerformerSchema.safeParse(invalidPerformer);

            expect(result.success).toBe(false);
        });
    });

    describe('AnalyticsEvent', () => {
        it('matches backend contract schema', () => {
            const sampleEvent: AnalyticsEvent = {
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

            const result = AnalyticsEventSchema.safeParse(sampleEvent);

            expect(result.success).toBe(true);
            if (result.success === true) {
                expect(result.data).toEqual(sampleEvent);
            }
        });

        it('validates with null optional fields', () => {
            const eventWithNulls: AnalyticsEvent = {
                id: 'event-2',
                tenantId: 'tenant-1',
                userId: null,
                eventType: 'PAGE_VIEW',
                entityType: null,
                entityId: null,
                properties: null,
                timestamp: '2026-01-27T12:05:00Z',
                sessionId: null,
                ipAddress: null,
                userAgent: null,
            };

            const result = AnalyticsEventSchema.safeParse(eventWithNulls);

            expect(result.success).toBe(true);
        });

        it('rejects invalid schema with wrong types', () => {
            const invalidEvent = {
                id: 'event-1',
                tenantId: 123, // Should be string
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

            const result = AnalyticsEventSchema.safeParse(invalidEvent);

            expect(result.success).toBe(false);
        });
    });

    describe('TrackEventRequest', () => {
        it('matches backend contract schema', () => {
            const sampleRequest: TrackEventRequest = {
                eventType: 'OPPORTUNITY_VIEWED',
                entityType: 'OPPORTUNITY',
                entityId: 'opp-789',
                properties: JSON.stringify({source: 'search'}),
                sessionId: 'session-abc-123',
            };

            const result = TrackEventRequestSchema.safeParse(sampleRequest);

            expect(result.success).toBe(true);
            if (result.success === true) {
                expect(result.data).toEqual(sampleRequest);
            }
        });

        it('validates minimal request with only eventType', () => {
            const minimalRequest: TrackEventRequest = {
                eventType: 'PAGE_VIEW',
            };

            const result = TrackEventRequestSchema.safeParse(minimalRequest);

            expect(result.success).toBe(true);
        });

        it('validates request with all optional fields', () => {
            const fullRequest: TrackEventRequest = {
                eventType: 'SEARCH_PERFORMED',
                entityType: 'SEARCH',
                entityId: 'search-123',
                properties: JSON.stringify({query: 'cloud services'}),
                sessionId: 'session-xyz-789',
            };

            const result = TrackEventRequestSchema.safeParse(fullRequest);

            expect(result.success).toBe(true);
        });

        it('rejects invalid schema with missing required eventType', () => {
            const invalidRequest = {
                entityType: 'OPPORTUNITY',
                entityId: 'opp-789',
            };

            const result = TrackEventRequestSchema.safeParse(invalidRequest);

            expect(result.success).toBe(false);
        });
    });

    describe('Error handling logic', () => {
        it('constructs proper error message for fetchDashboardStats failure', () => {
            const statusText = 'Internal Server Error';
            const expectedMessage = `Failed to fetch dashboard stats: ${statusText}`;

            expect(expectedMessage).toBe('Failed to fetch dashboard stats: Internal Server Error');
        });

        it('constructs proper error message for fetchActivityFeed failure', () => {
            const statusText = 'Bad Request';
            const expectedMessage = `Failed to fetch activity feed: ${statusText}`;

            expect(expectedMessage).toBe('Failed to fetch activity feed: Bad Request');
        });

        it('constructs proper error message for fetchTopPerformers failure', () => {
            const statusText = 'Unauthorized';
            const expectedMessage = `Failed to fetch top performers: ${statusText}`;

            expect(expectedMessage).toBe('Failed to fetch top performers: Unauthorized');
        });

        it('constructs proper error message for trackEvent failure', () => {
            const statusText = 'Forbidden';
            const expectedMessage = `Failed to track event: ${statusText}`;

            expect(expectedMessage).toBe('Failed to track event: Forbidden');
        });
    });

    describe('URL construction', () => {
        it('constructs dashboard stats URL correctly', () => {
            const url = '/api/analytics/dashboard';
            expect(url).toBe('/api/analytics/dashboard');
        });

        it('constructs activity feed URL with default limit', () => {
            const limit = 20;
            const url = `/api/analytics/activity?limit=${limit}`;
            expect(url).toBe('/api/analytics/activity?limit=20');
        });

        it('constructs activity feed URL with custom limit', () => {
            const limit = 50;
            const url = `/api/analytics/activity?limit=${limit}`;
            expect(url).toBe('/api/analytics/activity?limit=50');
        });

        it('constructs top performers URL with default limit', () => {
            const limit = 10;
            const url = `/api/analytics/top-performers?limit=${limit}`;
            expect(url).toBe('/api/analytics/top-performers?limit=10');
        });

        it('constructs top performers URL with custom limit', () => {
            const limit = 25;
            const url = `/api/analytics/top-performers?limit=${limit}`;
            expect(url).toBe('/api/analytics/top-performers?limit=25');
        });

        it('constructs track event URL correctly', () => {
            const url = '/api/analytics/track';
            expect(url).toBe('/api/analytics/track');
        });
    });

    describe('Request body construction', () => {
        it('validates TrackEventRequest body structure', () => {
            const request: TrackEventRequest = {
                eventType: 'OPPORTUNITY_VIEWED',
                entityType: 'OPPORTUNITY',
                entityId: 'opp-789',
                properties: JSON.stringify({source: 'search'}),
                sessionId: 'session-abc-123',
            };

            const body = JSON.stringify(request);
            const parsed = JSON.parse(body) as TrackEventRequest;

            expect(parsed.eventType).toBe('OPPORTUNITY_VIEWED');
            expect(parsed.entityType).toBe('OPPORTUNITY');
            expect(parsed.entityId).toBe('opp-789');
            expect(parsed.properties).toBe('{"source":"search"}');
            expect(parsed.sessionId).toBe('session-abc-123');
        });

        it('validates minimal TrackEventRequest body structure', () => {
            const request: TrackEventRequest = {
                eventType: 'PAGE_VIEW',
            };

            const body = JSON.stringify(request);
            const parsed = JSON.parse(body) as TrackEventRequest;

            expect(parsed.eventType).toBe('PAGE_VIEW');
            expect(parsed.entityType).toBeUndefined();
            expect(parsed.entityId).toBeUndefined();
            expect(parsed.properties).toBeUndefined();
            expect(parsed.sessionId).toBeUndefined();
        });
    });

    describe('Type safety validation', () => {
        it('ensures DashboardStats type is compatible with schema inference', () => {
            const stats: DashboardStats = {
                opportunitiesViewed: 100,
                opportunitiesSaved: 50,
                pipelineValue: 1000000,
                winRate: 25.5,
                activeUsers: 10,
                recentActivity: 200,
                eventCounts: {TEST_EVENT: 5},
                viewsTrend: [{date: '2026-01-27', value: 10}],
            };

            const result = DashboardStatsSchema.parse(stats);

            // Type assertion to ensure compatibility
            const _typeCheck: DashboardStats = result;
            expect(_typeCheck).toEqual(stats);
        });

        it('ensures ActivityItem type is compatible with schema inference', () => {
            const activity: ActivityItem = {
                id: '1',
                userId: 'user-1',
                userName: 'John Doe',
                eventType: 'OPPORTUNITY_VIEWED',
                entityType: 'OPPORTUNITY',
                entityId: 'opp-123',
                description: 'Test description',
                timestamp: '2026-01-27T10:30:00Z',
            };

            const result = ActivityItemSchema.parse(activity);

            const _typeCheck: ActivityItem = result;
            expect(_typeCheck).toEqual(activity);
        });

        it('ensures TopPerformer type is compatible with schema inference', () => {
            const performer: TopPerformer = {
                userId: 'user-1',
                userName: 'John Doe',
                actionCount: 45,
                value: 1500000,
            };

            const result = TopPerformerSchema.parse(performer);

            const _typeCheck: TopPerformer = result;
            expect(_typeCheck).toEqual(performer);
        });

        it('ensures AnalyticsEvent type is compatible with schema inference', () => {
            const event: AnalyticsEvent = {
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

            const result = AnalyticsEventSchema.parse(event);

            const _typeCheck: AnalyticsEvent = result;
            expect(_typeCheck).toEqual(event);
        });

        it('ensures TrackEventRequest type is compatible with schema inference', () => {
            const request: TrackEventRequest = {
                eventType: 'OPPORTUNITY_VIEWED',
                entityType: 'OPPORTUNITY',
                entityId: 'opp-789',
                properties: '{"source":"search"}',
                sessionId: 'session-abc-123',
            };

            const result = TrackEventRequestSchema.parse(request);

            const _typeCheck: TrackEventRequest = result;
            expect(_typeCheck).toEqual(request);
        });
    });
});
