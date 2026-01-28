import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {login, refreshToken, register, validateToken} from './auth';
import type {LoginCredentials, RegisterData} from '../auth/Auth.types';

// Test data factories
const createMockUser = () => ({
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
});

const createMockApiUser = () => ({
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    avatarUrl: 'https://example.com/avatar.png',
    status: 'active',
    emailVerified: true,
    mfaEnabled: false,
    lastLoginAt: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
});

const createMockApiAuthResponse = () => ({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    tokenType: 'Bearer',
    expiresIn: 3600,
    user: createMockApiUser(),
    mfaRequired: false,
});

const createValidJwtToken = (expiresInSeconds: number) => {
    const header = btoa(JSON.stringify({alg: 'HS256', typ: 'JWT'}));
    const payload = btoa(
        JSON.stringify({
            sub: 'user-123',
            exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
        })
    );
    const signature = 'mock-signature';
    return `${header}.${payload}.${signature}`;
};

const createExpiredJwtToken = () => {
    const header = btoa(JSON.stringify({alg: 'HS256', typ: 'JWT'}));
    const payload = btoa(
        JSON.stringify({
            sub: 'user-123',
            exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
        })
    );
    const signature = 'mock-signature';
    return `${header}.${payload}.${signature}`;
};

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('auth service', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('login', () => {
        const credentials: LoginCredentials = {
            email: 'test@example.com',
            password: 'password123',
        };

        it('should call the correct endpoint with credentials', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => createMockApiAuthResponse(),
            });

            await login(credentials);

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(mockFetch).toHaveBeenCalledWith('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });
        });

        it('should return user data on success', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => createMockApiAuthResponse(),
            });

            const result = await login(credentials);

            expect(result.token).toBe('mock-access-token');
            expect(result.refreshToken).toBe('mock-refresh-token');
            expect(result.user).toEqual(createMockUser());
            expect(result.mfaRequired).toBe(false);
        });

        it('should handle invalid credentials error', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                statusText: 'Unauthorized',
                json: async () => ({
                    message: 'Invalid email or password',
                    code: 'INVALID_CREDENTIALS',
                }),
            });

            await expect(login(credentials)).rejects.toEqual({
                message: 'Invalid email or password',
                code: 'INVALID_CREDENTIALS',
                field: undefined,
            });
        });

        it('should handle network errors', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(login(credentials)).rejects.toThrow('Network error');
        });

        it('should handle error response with field information', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                json: async () => ({
                    message: 'Email is required',
                    field: 'email',
                    code: 'VALIDATION_ERROR',
                }),
            });

            await expect(login(credentials)).rejects.toEqual({
                message: 'Email is required',
                field: 'email',
                code: 'VALIDATION_ERROR',
            });
        });

        it('should handle non-JSON error response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                json: async () => {
                    throw new Error('Not JSON');
                },
            });

            await expect(login(credentials)).rejects.toEqual({
                message: 'Internal Server Error',
                code: '500',
                field: undefined,
            });
        });
    });

    describe('register', () => {
        const registerData: RegisterData = {
            email: 'newuser@example.com',
            password: 'securePassword123',
            firstName: 'Jane',
            lastName: 'Smith',
            companyName: 'Acme Corp',
        };

        it('should call register endpoint with all fields', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => createMockApiAuthResponse(),
            });

            await register(registerData);

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(mockFetch).toHaveBeenCalledWith('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: registerData.email,
                    password: registerData.password,
                    firstName: registerData.firstName,
                    lastName: registerData.lastName,
                    organizationName: registerData.companyName,
                }),
            });
        });

        it('should return user data on success', async () => {
            const mockResponse = createMockApiAuthResponse();
            mockResponse.user.email = 'newuser@example.com';
            mockResponse.user.firstName = 'Jane';
            mockResponse.user.lastName = 'Smith';

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await register(registerData);

            expect(result.token).toBe('mock-access-token');
            expect(result.refreshToken).toBe('mock-refresh-token');
            expect(result.user.email).toBe('newuser@example.com');
            expect(result.user.firstName).toBe('Jane');
            expect(result.user.lastName).toBe('Smith');
        });

        it('should handle duplicate email error', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 409,
                statusText: 'Conflict',
                json: async () => ({
                    message: 'An account with this email already exists',
                    field: 'email',
                    code: 'DUPLICATE_EMAIL',
                }),
            });

            await expect(register(registerData)).rejects.toEqual({
                message: 'An account with this email already exists',
                field: 'email',
                code: 'DUPLICATE_EMAIL',
            });
        });

        it('should handle validation errors', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                json: async () => ({
                    message: 'Password must be at least 8 characters',
                    field: 'password',
                    code: 'VALIDATION_ERROR',
                }),
            });

            await expect(register(registerData)).rejects.toEqual({
                message: 'Password must be at least 8 characters',
                field: 'password',
                code: 'VALIDATION_ERROR',
            });
        });

        it('should handle registration without company name', async () => {
            const dataWithoutCompany: RegisterData = {
                email: 'user@example.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => createMockApiAuthResponse(),
            });

            await register(dataWithoutCompany);

            expect(mockFetch).toHaveBeenCalledWith('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: dataWithoutCompany.email,
                    password: dataWithoutCompany.password,
                    firstName: dataWithoutCompany.firstName,
                    lastName: dataWithoutCompany.lastName,
                    organizationName: undefined,
                }),
            });
        });
    });

    describe('refreshToken', () => {
        const currentRefreshToken = 'current-refresh-token';

        it('should refresh with valid token', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => createMockApiAuthResponse(),
            });

            const result = await refreshToken(currentRefreshToken);

            expect(mockFetch).toHaveBeenCalledWith('/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentRefreshToken}`,
                },
            });
            expect(result.token).toBe('mock-access-token');
            expect(result.refreshToken).toBe('mock-refresh-token');
        });

        it('should handle expired token', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                statusText: 'Unauthorized',
                json: async () => ({
                    message: 'Refresh token has expired',
                    code: 'TOKEN_EXPIRED',
                }),
            });

            await expect(refreshToken(currentRefreshToken)).rejects.toEqual({
                message: 'Refresh token has expired',
                code: 'TOKEN_EXPIRED',
                field: undefined,
            });
        });

        it('should handle invalid refresh token', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                statusText: 'Unauthorized',
                json: async () => ({
                    message: 'Invalid refresh token',
                    code: 'INVALID_TOKEN',
                }),
            });

            await expect(refreshToken('invalid-token')).rejects.toEqual({
                message: 'Invalid refresh token',
                code: 'INVALID_TOKEN',
                field: undefined,
            });
        });

        it('should handle server error during refresh', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                json: async () => ({
                    message: 'Unable to refresh token at this time',
                }),
            });

            await expect(refreshToken(currentRefreshToken)).rejects.toEqual({
                message: 'Unable to refresh token at this time',
                code: undefined,
                field: undefined,
            });
        });
    });

    describe('validateToken', () => {
        it('should return true for valid non-expired token', async () => {
            const validToken = createValidJwtToken(3600); // Expires in 1 hour

            const result = await validateToken(validToken);

            expect(result).toBe(true);
        });

        it('should return false for expired token', async () => {
            const expiredToken = createExpiredJwtToken();

            const result = await validateToken(expiredToken);

            expect(result).toBe(false);
        });

        it('should return false for malformed token', async () => {
            const malformedToken = 'not.a.valid.jwt.token';

            const result = await validateToken(malformedToken);

            expect(result).toBe(false);
        });

        it('should return false for empty token', async () => {
            const result = await validateToken('');

            expect(result).toBe(false);
        });

        it('should return false for token with only two parts', async () => {
            const incompleteToken = 'header.payload';

            const result = await validateToken(incompleteToken);

            expect(result).toBe(false);
        });

        it('should return false for token with invalid base64 payload', async () => {
            const invalidBase64Token = 'header.!!!invalid-base64!!!.signature';

            const result = await validateToken(invalidBase64Token);

            expect(result).toBe(false);
        });

        it('should return true for token without expiration', async () => {
            const header = btoa(JSON.stringify({alg: 'HS256', typ: 'JWT'}));
            const payload = btoa(JSON.stringify({sub: 'user-123'})); // No exp claim
            const signature = 'mock-signature';
            const tokenWithoutExp = `${header}.${payload}.${signature}`;

            const result = await validateToken(tokenWithoutExp);

            expect(result).toBe(true);
        });

        it('should return false for token with non-JSON payload', async () => {
            const header = btoa(JSON.stringify({alg: 'HS256', typ: 'JWT'}));
            const payload = btoa('not-json-content');
            const signature = 'mock-signature';
            const invalidPayloadToken = `${header}.${payload}.${signature}`;

            const result = await validateToken(invalidPayloadToken);

            expect(result).toBe(false);
        });

        it('should correctly compare expiration time against current time', async () => {
            // Token that expires in 1 second
            const almostExpiredToken = createValidJwtToken(1);

            const resultBeforeExpiry = await validateToken(almostExpiredToken);
            expect(resultBeforeExpiry).toBe(true);
        });
    });
});
