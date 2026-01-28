import {describe, expect, it, vi} from 'vitest';
import {renderHook} from '@testing-library/react';
import {AuthContext, useAuth} from './AuthContext';
import type {AuthContextType, User} from './Auth.types';

// Test user data
const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
};

// Create a mock authenticated context
function createMockAuthContext(overrides?: Partial<AuthContextType>): AuthContextType {
  return {
    user: mockUser,
    token: 'mock-token',
    isAuthenticated: true,
    isLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    clearError: vi.fn(),
    setAuthData: vi.fn(),
    ...overrides,
  };
}

describe('useAuth Hook', () => {
  describe('Context Requirements', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test as React will log the error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        /* noop */
      });

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });

    it('should not throw when used inside AuthProvider', () => {
      const mockContext = createMockAuthContext();

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={mockContext}>{children}</AuthContext.Provider>
      );

      expect(() => {
        renderHook(() => useAuth(), { wrapper });
      }).not.toThrow();
    });
  });

  describe('Return Values', () => {
    it('should return all context values when authenticated', () => {
      const mockContext = createMockAuthContext();

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={mockContext}>{children}</AuthContext.Provider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe('mock-token');
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });

    it('should return unauthenticated state values', () => {
      const mockContext = createMockAuthContext({
        user: null,
        token: null,
        isAuthenticated: false,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={mockContext}>{children}</AuthContext.Provider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should return loading state', () => {
      const mockContext = createMockAuthContext({
        isLoading: true,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={mockContext}>{children}</AuthContext.Provider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isLoading).toBe(true);
    });

    it('should return error state', () => {
      const mockError = { message: 'Authentication failed', code: 'AUTH_ERROR' };
      const mockContext = createMockAuthContext({
        error: mockError,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={mockContext}>{children}</AuthContext.Provider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.error).toEqual(mockError);
      expect(result.current.error?.message).toBe('Authentication failed');
      expect(result.current.error?.code).toBe('AUTH_ERROR');
    });
  });

  describe('Action Functions', () => {
    it('should provide callable login function', async () => {
      const mockLogin = vi.fn().mockResolvedValue(undefined);
      const mockContext = createMockAuthContext({
        login: mockLogin,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={mockContext}>{children}</AuthContext.Provider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await result.current.login('test@example.com', 'password');

      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password');
      expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    it('should provide callable logout function', () => {
      const mockLogout = vi.fn();
      const mockContext = createMockAuthContext({
        logout: mockLogout,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={mockContext}>{children}</AuthContext.Provider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      result.current.logout();

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('should provide callable clearError function', () => {
      const mockClearError = vi.fn();
      const mockContext = createMockAuthContext({
        clearError: mockClearError,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={mockContext}>{children}</AuthContext.Provider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      result.current.clearError();

      expect(mockClearError).toHaveBeenCalledTimes(1);
    });
  });

  describe('User Object Access', () => {
    it('should provide access to user properties when authenticated', () => {
      const mockContext = createMockAuthContext();

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={mockContext}>{children}</AuthContext.Provider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user?.id).toBe('user-123');
      expect(result.current.user?.email).toBe('test@example.com');
      expect(result.current.user?.firstName).toBe('Test');
      expect(result.current.user?.lastName).toBe('User');
    });

    it('should provide user with optional role when present', () => {
      const userWithRole: User = {
        ...mockUser,
        role: 'admin',
      };
      const mockContext = createMockAuthContext({
        user: userWithRole,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={mockContext}>{children}</AuthContext.Provider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user?.role).toBe('admin');
    });
  });
});
