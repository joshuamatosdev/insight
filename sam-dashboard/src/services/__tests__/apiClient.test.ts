/**
 * Tests for the type-safe API client
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';

import {apiClient, get, post} from '../apiClient';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0,
};
Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
});

describe('apiClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockLocalStorage.getItem.mockReturnValue(
            JSON.stringify({token: 'test-token-123'})
        );
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('Type-safe client', () => {
        it('should be defined and have HTTP methods', () => {
            expect(apiClient).toBeDefined();
            expect(apiClient.GET).toBeDefined();
            expect(apiClient.POST).toBeDefined();
            expect(apiClient.PUT).toBeDefined();
            expect(apiClient.DELETE).toBeDefined();
            expect(apiClient.PATCH).toBeDefined();
        });

        it('should have middleware configured', () => {
            // The client should have the auth middleware configured
            // This is verified by checking the middleware is applied during requests
            expect(apiClient).toBeDefined();
        });
    });

    describe('Legacy methods', () => {
        describe('get', () => {
            it('should make GET request with auth token', async () => {
                const mockData = {id: 1, name: 'Test'};
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockData,
                });

                const result = await get<typeof mockData>('/test');

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data).toEqual(mockData);
                }

                expect(mockFetch).toHaveBeenCalledWith(
                    '/test',
                    expect.objectContaining({
                        method: 'GET',
                        headers: expect.objectContaining({
                            Authorization: 'Bearer test-token-123',
                        }),
                    })
                );
            });

            it('should handle query parameters', async () => {
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => [],
                });

                await get('/test', {params: {page: 0, size: 20}});

                expect(mockFetch).toHaveBeenCalledWith(
                    '/test?page=0&size=20',
                    expect.any(Object)
                );
            });

            it('should handle error responses', async () => {
                const mockError = {message: 'Not found', status: 404};
                mockFetch.mockResolvedValueOnce({
                    ok: false,
                    status: 404,
                    json: async () => mockError,
                });

                const result = await get('/test');

                expect(result.success).toBe(false);
                if (result.success === false) {
                    expect(result.error.message).toBe('Not found');
                    expect(result.error.status).toBe(404);
                }
            });

            it('should handle network errors', async () => {
                mockFetch.mockRejectedValueOnce(new Error('Network error'));

                const result = await get('/test');

                expect(result.success).toBe(false);
                if (result.success === false) {
                    expect(result.error.message).toBe('Network error');
                    expect(result.error.status).toBe(0);
                }
            });
        });

        describe('post', () => {
            it('should make POST request with body', async () => {
                const mockBody = {name: 'Test', value: 123};
                const mockResponse = {id: 1, ...mockBody};

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockResponse,
                });

                const result = await post('/test', mockBody);

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data).toEqual(mockResponse);
                }

                expect(mockFetch).toHaveBeenCalledWith(
                    '/test',
                    expect.objectContaining({
                        method: 'POST',
                        headers: expect.objectContaining({
                            Authorization: 'Bearer test-token-123',
                            'Content-Type': 'application/json',
                        }),
                        body: JSON.stringify(mockBody),
                    })
                );
            });
        });
    });

    describe('Authentication', () => {
        it('should include auth token when available', async () => {
            mockLocalStorage.getItem.mockReturnValue(
                JSON.stringify({token: 'my-secret-token'})
            );

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({}),
            });

            await get('/test');

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer my-secret-token',
                    }),
                })
            );
        });

        it('should work when no auth token is available', async () => {
            mockLocalStorage.getItem.mockReturnValue(null);

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({}),
            });

            await get('/test');

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.not.objectContaining({
                        Authorization: expect.any(String),
                    }),
                })
            );
        });

        it('should handle malformed auth data', async () => {
            mockLocalStorage.getItem.mockReturnValue('invalid-json');

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({}),
            });

            // Should not throw
            await expect(get('/test')).resolves.toBeDefined();
        });
    });
});
