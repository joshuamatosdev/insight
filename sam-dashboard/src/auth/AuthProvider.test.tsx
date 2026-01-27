import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from './AuthProvider';
import { useAuth } from './AuthContext';
import { Stack } from '../components/layout';
import { Text, Button } from '../components/primitives';
import type { LoginResponse, User, StoredAuthState } from './Auth.types';

// Mock the auth service
vi.mock('../services/auth', () => ({
  login: vi.fn(),
  validateToken: vi.fn(),
}));

// Import mocked modules
import * as authService from '../services/auth';

const mockLogin = authService.login as ReturnType<typeof vi.fn>;
const mockValidateToken = authService.validateToken as ReturnType<typeof vi.fn>;

// Test data
const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
};

const mockLoginResponse: LoginResponse = {
  token: 'mock-jwt-token',
  refreshToken: 'mock-refresh-token',
  user: mockUser,
  mfaRequired: false,
};

const mockStoredAuth: StoredAuthState = {
  token: 'stored-jwt-token',
  refreshToken: 'stored-refresh-token',
  user: mockUser,
};

const AUTH_STORAGE_KEY = 'sam_auth_state';

// Test component that displays auth state using project components
function TestConsumer(): React.ReactElement {
  const auth = useAuth();

  return (
    <Stack gap={8}>
      <Text data-testid="is-authenticated">
        {auth.isAuthenticated ? 'authenticated' : 'not-authenticated'}
      </Text>
      <Text data-testid="is-loading">{auth.isLoading ? 'loading' : 'ready'}</Text>
      <Text data-testid="user-email">{auth.user?.email ?? 'no-user'}</Text>
      <Text data-testid="token">{auth.token ?? 'no-token'}</Text>
      <Text data-testid="error">{auth.error?.message ?? 'no-error'}</Text>
      <Button
        data-testid="login-button"
        onClick={() => auth.login('test@example.com', 'password123')}
      >
        Login
      </Button>
      <Button data-testid="logout-button" onClick={() => auth.logout()}>
        Logout
      </Button>
      <Button data-testid="clear-error-button" onClick={() => auth.clearError()}>
        Clear Error
      </Button>
    </Stack>
  );
}

// Mock localStorage
const localStorageMock: Storage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string): string | null => store[key] ?? null),
    setItem: vi.fn((key: string, value: string): void => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string): void => {
      delete store[key];
    }),
    clear: vi.fn((): void => {
      store = {};
    }),
    get length(): number {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number): string | null => Object.keys(store)[index] ?? null),
  };
})();

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    localStorageMock.clear();
    mockValidateToken.mockResolvedValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Context Provision', () => {
    it('should provide auth context to children', async () => {
      mockValidateToken.mockResolvedValue(false);

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('ready');
      });

      // Verify context values are accessible
      expect(screen.getByTestId('is-authenticated')).toBeInTheDocument();
      expect(screen.getByTestId('user-email')).toBeInTheDocument();
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    });

    it('should start in loading state and transition to ready', async () => {
      mockValidateToken.mockResolvedValue(false);

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      // Should eventually transition to ready
      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('ready');
      });
    });
  });

  describe('localStorage Initialization', () => {
    it('should initialize as unauthenticated when no stored token exists', async () => {
      mockValidateToken.mockResolvedValue(false);

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('ready');
      });

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('not-authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
      expect(screen.getByTestId('token')).toHaveTextContent('no-token');
    });

    it('should restore auth state from localStorage when valid token exists', async () => {
      // Pre-populate localStorage with valid auth state
      localStorageMock.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockStoredAuth));
      mockValidateToken.mockResolvedValue(true);

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('ready');
      });

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email);
      expect(screen.getByTestId('token')).toHaveTextContent(mockStoredAuth.token);
      expect(mockValidateToken).toHaveBeenCalledWith(mockStoredAuth.token);
    });

    it('should clear state and storage when stored token is invalid', async () => {
      // Pre-populate localStorage with expired auth state
      localStorageMock.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockStoredAuth));
      mockValidateToken.mockResolvedValue(false);

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('ready');
      });

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('not-authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(AUTH_STORAGE_KEY);
    });

    it('should handle corrupted localStorage data gracefully', async () => {
      // Store invalid JSON
      localStorageMock.setItem(AUTH_STORAGE_KEY, 'not-valid-json');
      mockValidateToken.mockResolvedValue(false);

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('ready');
      });

      // Should gracefully fallback to unauthenticated state
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('not-authenticated');
    });
  });

  describe('Login Behavior', () => {
    it('should update state and persist to localStorage on successful login', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue(mockLoginResponse);

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('ready');
      });

      // Perform login
      await user.click(screen.getByTestId('login-button'));

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('authenticated');
      });

      // Verify state updated
      expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email);
      expect(screen.getByTestId('token')).toHaveTextContent(mockLoginResponse.token);
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');

      // Verify localStorage was updated
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        AUTH_STORAGE_KEY,
        expect.stringContaining(mockLoginResponse.token)
      );
    });

    it('should show loading state during login', async () => {
      const user = userEvent.setup();
      let resolveLogin: (value: LoginResponse) => void;
      const loginPromise = new Promise<LoginResponse>((resolve) => {
        resolveLogin = resolve;
      });
      mockLogin.mockReturnValue(loginPromise);

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('ready');
      });

      // Start login
      const loginPromiseFromClick = user.click(screen.getByTestId('login-button'));

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('loading');
      });

      // Resolve login
      resolveLogin!(mockLoginResponse);
      await loginPromiseFromClick;

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('ready');
      });
    });

    it('should set error state on login failure', async () => {
      const user = userEvent.setup();
      const loginError = { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' };
      mockLogin.mockRejectedValue(loginError);

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('ready');
      });

      await user.click(screen.getByTestId('login-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
      });

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('not-authenticated');
    });

    it('should handle MFA required response', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({
        ...mockLoginResponse,
        mfaRequired: true,
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('ready');
      });

      await user.click(screen.getByTestId('login-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(
          'MFA is required but not yet implemented'
        );
      });

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('not-authenticated');
    });

    it('should clear previous error before new login attempt', async () => {
      const user = userEvent.setup();

      // First login fails
      mockLogin.mockRejectedValueOnce({ message: 'First error' });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('ready');
      });

      await user.click(screen.getByTestId('login-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('First error');
      });

      // Second login succeeds
      mockLogin.mockResolvedValueOnce(mockLoginResponse);
      await user.click(screen.getByTestId('login-button'));

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('authenticated');
      });

      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });
  });

  describe('Logout Behavior', () => {
    it('should clear state and localStorage on logout', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue(mockLoginResponse);

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('ready');
      });

      // Login first
      await user.click(screen.getByTestId('login-button'));

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('authenticated');
      });

      // Now logout
      await user.click(screen.getByTestId('logout-button'));

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('not-authenticated');
      });

      expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
      expect(screen.getByTestId('token')).toHaveTextContent('no-token');
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(AUTH_STORAGE_KEY);
    });

    it('should clear error on logout', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValue({ message: 'Login failed' });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('ready');
      });

      // Trigger error via failed login
      await user.click(screen.getByTestId('login-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Login failed');
      });

      // Logout should clear error
      await user.click(screen.getByTestId('logout-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('no-error');
      });
    });
  });

  describe('Error Handling', () => {
    it('should allow clearing errors via clearError', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValue({ message: 'Some error' });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('ready');
      });

      // Trigger error
      await user.click(screen.getByTestId('login-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Some error');
      });

      // Clear error
      await user.click(screen.getByTestId('clear-error-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('no-error');
      });
    });

    it('should handle errors without message property', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValue({});

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('ready');
      });

      await user.click(screen.getByTestId('login-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Login failed');
      });
    });
  });

  describe('isAuthenticated Computation', () => {
    it('should return false when user is null', async () => {
      mockValidateToken.mockResolvedValue(false);

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('ready');
      });

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('not-authenticated');
    });

    it('should return true only when both user and token are present', async () => {
      mockLogin.mockResolvedValue(mockLoginResponse);
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('ready');
      });

      await user.click(screen.getByTestId('login-button'));

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('authenticated');
      });

      // Both user and token should be present
      expect(screen.getByTestId('user-email')).not.toHaveTextContent('no-user');
      expect(screen.getByTestId('token')).not.toHaveTextContent('no-token');
    });
  });
});
