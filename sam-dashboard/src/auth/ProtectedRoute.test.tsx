import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { Box } from '../components/catalyst/layout';
import type { AuthContextType, User } from './Auth.types';

// Test user data
const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
};

// Create a mock auth context with configurable state
function createMockAuthContext(overrides?: Partial<AuthContextType>): AuthContextType {
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    clearError: vi.fn(),
    ...overrides,
  };
}

// Helper to render ProtectedRoute with necessary providers
type RenderOptions = {
  authContext: AuthContextType;
  initialPath?: string;
};

function renderProtectedRoute({ authContext, initialPath = '/protected' }: RenderOptions) {
  return render(
    <AuthContext.Provider value={authContext}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <Box data-testid="protected-content">Protected Content</Box>
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={<Box data-testid="login-page">Login Page</Box>}
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('ProtectedRoute', () => {
  describe('When Authenticated', () => {
    it('should render children when user is authenticated', () => {
      const authContext = createMockAuthContext({
        user: mockUser,
        token: 'valid-token',
        isAuthenticated: true,
        isLoading: false,
      });

      renderProtectedRoute({ authContext });

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });

    it('should render children regardless of user role', () => {
      const adminUser: User = { ...mockUser, role: 'admin' };
      const authContext = createMockAuthContext({
        user: adminUser,
        token: 'admin-token',
        isAuthenticated: true,
        isLoading: false,
      });

      renderProtectedRoute({ authContext });

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should render nested content when authenticated', () => {
      const authContext = createMockAuthContext({
        user: mockUser,
        token: 'valid-token',
        isAuthenticated: true,
        isLoading: false,
      });

      render(
        <AuthContext.Provider value={authContext}>
          <MemoryRouter initialEntries={['/protected']}>
            <Routes>
              <Route
                path="/protected"
                element={
                  <ProtectedRoute>
                    <Box data-testid="outer">
                      <Box data-testid="nested">Nested Content</Box>
                    </Box>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      );

      expect(screen.getByTestId('outer')).toBeInTheDocument();
      expect(screen.getByTestId('nested')).toBeInTheDocument();
      expect(screen.getByText('Nested Content')).toBeInTheDocument();
    });
  });

  describe('When Not Authenticated', () => {
    it('should redirect to login when not authenticated', () => {
      const authContext = createMockAuthContext({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });

      renderProtectedRoute({ authContext });

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should not render protected content when isAuthenticated is false', () => {
      const authContext = createMockAuthContext({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });

      renderProtectedRoute({ authContext });

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should redirect even if user exists but isAuthenticated is false', () => {
      // Edge case: user object exists but isAuthenticated is explicitly false
      const authContext = createMockAuthContext({
        user: mockUser,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });

      renderProtectedRoute({ authContext });

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading state while checking authentication', () => {
      const authContext = createMockAuthContext({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
      });

      renderProtectedRoute({ authContext });

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });

    it('should not redirect during loading state', () => {
      const authContext = createMockAuthContext({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
      });

      renderProtectedRoute({ authContext });

      // Should show loading, not login page
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });

    it('should show loading when isLoading is true even with user data', () => {
      // Scenario: token validation in progress
      const authContext = createMockAuthContext({
        user: mockUser,
        token: 'token-being-validated',
        isAuthenticated: false,
        isLoading: true,
      });

      renderProtectedRoute({ authContext });

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('Location State for Redirect', () => {
    it('should preserve attempted location for redirect after login', () => {
      const authContext = createMockAuthContext({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });

      // Access a deep protected route
      render(
        <AuthContext.Provider value={authContext}>
          <MemoryRouter initialEntries={['/protected/deep/path']}>
            <Routes>
              <Route
                path="/protected/*"
                element={
                  <ProtectedRoute>
                    <Box data-testid="protected-content">Protected Content</Box>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/login"
                element={<Box data-testid="login-page">Login Page</Box>}
              />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      );

      // Should redirect to login
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  describe('Multiple Protected Routes', () => {
    it('should handle multiple protected routes correctly', () => {
      const authContext = createMockAuthContext({
        user: mockUser,
        token: 'valid-token',
        isAuthenticated: true,
        isLoading: false,
      });

      render(
        <AuthContext.Provider value={authContext}>
          <MemoryRouter initialEntries={['/dashboard']}>
            <Routes>
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Box data-testid="dashboard">Dashboard</Box>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Box data-testid="settings">Settings</Box>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/login"
                element={<Box data-testid="login-page">Login Page</Box>}
              />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      );

      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  describe('Error State Handling', () => {
    it('should still show content when authenticated with error', () => {
      // User is authenticated but there's an error in state (e.g., profile fetch failed)
      const authContext = createMockAuthContext({
        user: mockUser,
        token: 'valid-token',
        isAuthenticated: true,
        isLoading: false,
        error: { message: 'Profile fetch failed' },
      });

      renderProtectedRoute({ authContext });

      // Should still show protected content - auth errors don't block route
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should redirect when not authenticated even with error', () => {
      const authContext = createMockAuthContext({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: { message: 'Login failed' },
      });

      renderProtectedRoute({ authContext });

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });
});
