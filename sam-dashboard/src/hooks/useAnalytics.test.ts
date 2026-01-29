/**
 * Tests for useAnalytics hook - State Management Only
 *
 * These tests verify state management behavior without mocking services.
 * Service integration is tested via E2E tests.
 */

import {describe, it, expect} from 'vitest';
import {renderHook} from '@testing-library/react';
import {useAnalyticsDashboard} from './useAnalytics';

describe('useAnalyticsDashboard - State Management', () => {
    describe('Loading states', () => {
        it('initializes with loading=true', () => {
            const {result} = renderHook(() => useAnalyticsDashboard());
            expect(result.current.isLoading).toBe(true);
        });

        it('initializes with null stats', () => {
            const {result} = renderHook(() => useAnalyticsDashboard());
            expect(result.current.stats).toBe(null);
        });

        it('initializes with empty activities array', () => {
            const {result} = renderHook(() => useAnalyticsDashboard());
            expect(result.current.activities).toEqual([]);
        });

        it('initializes with empty performers array', () => {
            const {result} = renderHook(() => useAnalyticsDashboard());
            expect(result.current.performers).toEqual([]);
        });

        it('initializes with empty trendData array', () => {
            const {result} = renderHook(() => useAnalyticsDashboard());
            expect(result.current.trendData).toEqual([]);
        });

        it('initializes with null error', () => {
            const {result} = renderHook(() => useAnalyticsDashboard());
            expect(result.current.error).toBe(null);
        });
    });

    describe('Refresh functionality', () => {
        it('provides refresh callback', () => {
            const {result} = renderHook(() => useAnalyticsDashboard());
            expect(typeof result.current.refresh).toBe('function');
        });

        it('refresh callback is defined on mount', () => {
            const {result} = renderHook(() => useAnalyticsDashboard());
            expect(result.current.refresh).toBeDefined();
        });
    });

    describe('Hook return shape', () => {
        it('returns all expected properties', () => {
            const {result} = renderHook(() => useAnalyticsDashboard());

            expect(result.current).toHaveProperty('isLoading');
            expect(result.current).toHaveProperty('stats');
            expect(result.current).toHaveProperty('activities');
            expect(result.current).toHaveProperty('performers');
            expect(result.current).toHaveProperty('trendData');
            expect(result.current).toHaveProperty('error');
            expect(result.current).toHaveProperty('refresh');
        });

        it('returns correct initial types', () => {
            const {result} = renderHook(() => useAnalyticsDashboard());

            expect(typeof result.current.isLoading).toBe('boolean');
            expect(result.current.stats === null || typeof result.current.stats === 'object').toBe(true);
            expect(Array.isArray(result.current.activities)).toBe(true);
            expect(Array.isArray(result.current.performers)).toBe(true);
            expect(Array.isArray(result.current.trendData)).toBe(true);
            expect(result.current.error === null || result.current.error instanceof Error).toBe(true);
            expect(typeof result.current.refresh).toBe('function');
        });
    });
});
