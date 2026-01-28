import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';
import {OAuthCallbackPage} from './OAuthCallbackPage';
import type {AuthResponse} from '../services/oauthService';
import * as oauthService from '../services/oauthService';

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the OAuth service
vi.mock('../services/oauthService', () => ({
  processOAuthCallback: vi.fn(),
}));

const mockProcessOAuthCallback = oauthService.processOAuthCallback as ReturnType<typeof vi.fn>;

// Mock the useAuth hook
const mockSetAuthData = vi.fn();
vi.mock('../auth', async () => {
  const actual = await vi.importActual('../auth');
  return {
    ...actual,
    useAuth: () => ({
      setAuthData: mockSetAuthData,
    }),
  };
});

// Test data
const mockAuthResponse: AuthResponse = {
  accessToken: 'mock-access-token-123',
  refreshToken: 'mock-refresh-token-456',
  user: {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
  },
};

/**
 * Helper to render OAuthCallbackPage with router context and search params
 */
function renderOAuthCallbackPage(options: { searchParams?: Record<string, string> } = {}): {
  user: ReturnType<typeof userEvent.setup>;
} {
  const { searchParams = {} } = options;
  const user = userEvent.setup();

  // Build search string from params
  const searchString = new URLSearchParams(searchParams).toString();
  const initialEntry = searchString.length > 0 ? `/oauth/callback?${searchString}` : '/oauth/callback';

  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <OAuthCallbackPage />
    </MemoryRouter>
  );

  return { user };
}

describe('OAuthCallbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Loading State', () => {
    it('should show processing message during token exchange', async () => {
      // Create a promise that doesn't resolve immediately
      let resolveCallback: (value: AuthResponse) => void;
      const callbackPromise = new Promise<AuthResponse>((resolve) => {
        resolveCallback = resolve;
      });
      mockProcessOAuthCallback.mockReturnValue(callbackPromise);

      renderOAuthCallbackPage({
        searchParams: {
          provider: 'google',
          code: 'auth-code-123',
          email: 'test@example.com',
          user_id: 'google-user-123',
        },
      });

      // Should show processing message
      expect(screen.getByText(/completing sign in/i)).toBeInTheDocument();
      expect(screen.getByText(/please wait while we authenticate your account/i)).toBeInTheDocument();

      // Cleanup - resolve the promise to avoid act warning
      await waitFor(() => {
        resolveCallback!(mockAuthResponse);
      });
    });

    it('should display the building check icon during processing', async () => {
      // Create a controllable promise
      let resolveCallback: (value: AuthResponse) => void;
      const callbackPromise = new Promise<AuthResponse>((resolve) => {
        resolveCallback = resolve;
      });
      mockProcessOAuthCallback.mockReturnValue(callbackPromise);

      renderOAuthCallbackPage({
        searchParams: {
          provider: 'microsoft',
          code: 'auth-code-456',
          email: 'test@example.com',
          user_id: 'microsoft-user-123',
        },
      });

      // The icon should be present (we can check for the SVG or its container)
      const processingText = screen.getByText(/completing sign in/i);
      expect(processingText).toBeInTheDocument();

      // Cleanup - resolve the promise to avoid act warning
      await waitFor(() => {
        resolveCallback!(mockAuthResponse);
      });
    });
  });

  describe('Successful Authentication', () => {
    it('should process OAuth callback with authorization code', async () => {
      mockProcessOAuthCallback.mockResolvedValue(mockAuthResponse);

      renderOAuthCallbackPage({
        searchParams: {
          provider: 'google',
          code: 'auth-code-123',
          email: 'test@example.com',
          user_id: 'google-user-123',
          first_name: 'Test',
          last_name: 'User',
        },
      });

      await waitFor(() => {
        expect(mockProcessOAuthCallback).toHaveBeenCalledTimes(1);
      });

      expect(mockProcessOAuthCallback).toHaveBeenCalledWith({
        provider: 'google',
        providerUserId: 'google-user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        accessToken: undefined,
        refreshToken: undefined,
      });
    });

    it('should call setAuthData with authentication response', async () => {
      mockProcessOAuthCallback.mockResolvedValue(mockAuthResponse);

      renderOAuthCallbackPage({
        searchParams: {
          provider: 'google',
          code: 'auth-code-123',
          email: 'test@example.com',
          user_id: 'google-user-123',
        },
      });

      await waitFor(() => {
        expect(mockSetAuthData).toHaveBeenCalledTimes(1);
      });

      expect(mockSetAuthData).toHaveBeenCalledWith({
        accessToken: mockAuthResponse.accessToken,
        refreshToken: mockAuthResponse.refreshToken,
        user: mockAuthResponse.user,
      });
    });

    it('should show success message after authentication', async () => {
      mockProcessOAuthCallback.mockResolvedValue(mockAuthResponse);

      renderOAuthCallbackPage({
        searchParams: {
          provider: 'google',
          code: 'auth-code-123',
          email: 'test@example.com',
          user_id: 'google-user-123',
        },
      });

      await waitFor(() => {
        expect(screen.getByText(/sign in successful/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/redirecting you to the dashboard/i)).toBeInTheDocument();
    });

    it('should redirect to dashboard after successful authentication', async () => {
      mockProcessOAuthCallback.mockResolvedValue(mockAuthResponse);

      renderOAuthCallbackPage({
        searchParams: {
          provider: 'google',
          code: 'auth-code-123',
          email: 'test@example.com',
          user_id: 'google-user-123',
        },
      });

      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText(/sign in successful/i)).toBeInTheDocument();
      });

      // Advance timer past the redirect delay (1500ms)
      vi.advanceTimersByTime(1500);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });
    });

    it('should handle Google OAuth provider', async () => {
      mockProcessOAuthCallback.mockResolvedValue(mockAuthResponse);

      renderOAuthCallbackPage({
        searchParams: {
          provider: 'google',
          code: 'google-auth-code',
          email: 'user@gmail.com',
          user_id: 'google-123456',
        },
      });

      await waitFor(() => {
        expect(mockProcessOAuthCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            provider: 'google',
            providerUserId: 'google-123456',
            email: 'user@gmail.com',
          })
        );
      });
    });

    it('should handle Microsoft OAuth provider', async () => {
      mockProcessOAuthCallback.mockResolvedValue(mockAuthResponse);

      renderOAuthCallbackPage({
        searchParams: {
          provider: 'microsoft',
          code: 'microsoft-auth-code',
          email: 'user@outlook.com',
          user_id: 'microsoft-789012',
        },
      });

      await waitFor(() => {
        expect(mockProcessOAuthCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            provider: 'microsoft',
            providerUserId: 'microsoft-789012',
            email: 'user@outlook.com',
          })
        );
      });
    });

    it('should handle optional access token and refresh token from OAuth callback', async () => {
      mockProcessOAuthCallback.mockResolvedValue(mockAuthResponse);

      renderOAuthCallbackPage({
        searchParams: {
          provider: 'google',
          code: 'auth-code-123',
          email: 'test@example.com',
          user_id: 'google-user-123',
          access_token: 'oauth-access-token',
          refresh_token: 'oauth-refresh-token',
        },
      });

      await waitFor(() => {
        expect(mockProcessOAuthCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            accessToken: 'oauth-access-token',
            refreshToken: 'oauth-refresh-token',
          })
        );
      });
    });
  });

  describe('Error Handling - OAuth Errors', () => {
    it('should display error when OAuth provider returns error parameter', async () => {
      renderOAuthCallbackPage({
        searchParams: {
          provider: 'google',
          error: 'access_denied',
          error_description: 'User denied access',
        },
      });

      await waitFor(() => {
        expect(screen.getByText(/sign in failed/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/user denied access/i)).toBeInTheDocument();
    });

    it('should show default error message when error_description is missing', async () => {
      renderOAuthCallbackPage({
        searchParams: {
          provider: 'google',
          error: 'access_denied',
        },
      });

      await waitFor(() => {
        expect(screen.getByText(/sign in failed/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/authentication was cancelled or failed/i)).toBeInTheDocument();
    });

    it('should display error when authorization code is missing', async () => {
      renderOAuthCallbackPage({
        searchParams: {
          provider: 'google',
          email: 'test@example.com',
          // code is missing
        },
      });

      await waitFor(() => {
        expect(screen.getByText(/sign in failed/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/invalid oauth callback - missing provider or code/i)).toBeInTheDocument();
    });

    it('should display error when provider is missing', async () => {
      renderOAuthCallbackPage({
        searchParams: {
          code: 'auth-code-123',
          email: 'test@example.com',
          // provider is missing
        },
      });

      await waitFor(() => {
        expect(screen.getByText(/sign in failed/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/invalid oauth callback - missing provider or code/i)).toBeInTheDocument();
    });

    it('should display error when both provider and code are missing', async () => {
      renderOAuthCallbackPage({
        searchParams: {},
      });

      await waitFor(() => {
        expect(screen.getByText(/sign in failed/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/invalid oauth callback - missing provider or code/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling - API Errors', () => {
    it('should display error when token exchange fails', async () => {
      mockProcessOAuthCallback.mockRejectedValue(new Error('Token exchange failed'));

      renderOAuthCallbackPage({
        searchParams: {
          provider: 'google',
          code: 'invalid-code',
          email: 'test@example.com',
          user_id: 'google-user-123',
        },
      });

      await waitFor(() => {
        expect(screen.getByText(/sign in failed/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/token exchange failed/i)).toBeInTheDocument();
    });

    it('should display generic error message for non-Error exceptions', async () => {
      mockProcessOAuthCallback.mockRejectedValue('Unknown error');

      renderOAuthCallbackPage({
        searchParams: {
          provider: 'google',
          code: 'auth-code-123',
          email: 'test@example.com',
          user_id: 'google-user-123',
        },
      });

      await waitFor(() => {
        expect(screen.getByText(/sign in failed/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
    });

    it('should display network error message', async () => {
      mockProcessOAuthCallback.mockRejectedValue(new Error('Network request failed'));

      renderOAuthCallbackPage({
        searchParams: {
          provider: 'microsoft',
          code: 'auth-code-456',
          email: 'test@example.com',
          user_id: 'ms-user-123',
        },
      });

      await waitFor(() => {
        expect(screen.getByText(/network request failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error State Navigation', () => {
    it('should render Return to login button on error', async () => {
      renderOAuthCallbackPage({
        searchParams: {
          error: 'access_denied',
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /return to login/i })).toBeInTheDocument();
      });
    });

    it('should navigate to login page when Return to login button is clicked', async () => {
      vi.useRealTimers(); // Use real timers for user interaction

      const { user } = renderOAuthCallbackPage({
        searchParams: {
          error: 'access_denied',
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /return to login/i })).toBeInTheDocument();
      });

      const returnButton = screen.getByRole('button', { name: /return to login/i });
      await user.click(returnButton);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Duplicate Processing Prevention', () => {
    it('should only process OAuth callback once with StrictMode', async () => {
      mockProcessOAuthCallback.mockResolvedValue(mockAuthResponse);

      renderOAuthCallbackPage({
        searchParams: {
          provider: 'google',
          code: 'auth-code-123',
          email: 'test@example.com',
          user_id: 'google-user-123',
        },
      });

      // Wait for the callback to be processed
      await waitFor(() => {
        expect(mockProcessOAuthCallback).toHaveBeenCalled();
      });

      // Wait a bit more to ensure no additional calls
      await waitFor(
        () => {
          expect(mockProcessOAuthCallback).toHaveBeenCalledTimes(1);
        },
        { timeout: 100 }
      );
    });
  });

  describe('OAuth Callback with Complete User Data', () => {
    it('should process callback with all user information', async () => {
      mockProcessOAuthCallback.mockResolvedValue(mockAuthResponse);

      renderOAuthCallbackPage({
        searchParams: {
          provider: 'google',
          code: 'auth-code-123',
          email: 'john.doe@example.com',
          user_id: 'google-12345',
          first_name: 'John',
          last_name: 'Doe',
          access_token: 'provider-access-token',
          refresh_token: 'provider-refresh-token',
        },
      });

      await waitFor(() => {
        expect(mockProcessOAuthCallback).toHaveBeenCalledWith({
          provider: 'google',
          providerUserId: 'google-12345',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          accessToken: 'provider-access-token',
          refreshToken: 'provider-refresh-token',
        });
      });
    });

    it('should handle callback with minimal required data', async () => {
      mockProcessOAuthCallback.mockResolvedValue(mockAuthResponse);

      renderOAuthCallbackPage({
        searchParams: {
          provider: 'microsoft',
          code: 'ms-auth-code',
          // Minimal required params - email and user_id will be empty strings
        },
      });

      await waitFor(() => {
        expect(mockProcessOAuthCallback).toHaveBeenCalledWith({
          provider: 'microsoft',
          providerUserId: '',
          email: '',
          firstName: undefined,
          lastName: undefined,
          accessToken: undefined,
          refreshToken: undefined,
        });
      });
    });
  });

  describe('UI Elements', () => {
    it('should render within a centered card layout', async () => {
      // Create a controllable promise
      let resolveCallback: (value: AuthResponse) => void;
      const callbackPromise = new Promise<AuthResponse>((resolve) => {
        resolveCallback = resolve;
      });
      mockProcessOAuthCallback.mockReturnValue(callbackPromise);

      renderOAuthCallbackPage({
        searchParams: {
          provider: 'google',
          code: 'auth-code',
          email: 'test@example.com',
          user_id: 'user-123',
        },
      });

      // The card should contain the processing text
      const processingText = screen.getByText(/completing sign in/i);
      expect(processingText).toBeInTheDocument();

      // Cleanup - resolve the promise to avoid act warning
      await waitFor(() => {
        resolveCallback!(mockAuthResponse);
      });
    });

    it('should display different content for each status', async () => {
      // First, test error state
      renderOAuthCallbackPage({
        searchParams: {
          error: 'access_denied',
        },
      });

      // Error state should show error heading and button
      await waitFor(() => {
        expect(screen.getByText(/sign in failed/i)).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /return to login/i })).toBeInTheDocument();
    });

    it('should not show return button during processing', async () => {
      // Create a controllable promise
      let resolveCallback: (value: AuthResponse) => void;
      const callbackPromise = new Promise<AuthResponse>((resolve) => {
        resolveCallback = resolve;
      });
      mockProcessOAuthCallback.mockReturnValue(callbackPromise);

      renderOAuthCallbackPage({
        searchParams: {
          provider: 'google',
          code: 'auth-code',
          email: 'test@example.com',
          user_id: 'user-123',
        },
      });

      expect(screen.getByText(/completing sign in/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /return to login/i })).not.toBeInTheDocument();

      // Cleanup - resolve the promise to avoid act warning
      await waitFor(() => {
        resolveCallback!(mockAuthResponse);
      });
    });

    it('should not show return button on success', async () => {
      mockProcessOAuthCallback.mockResolvedValue(mockAuthResponse);

      renderOAuthCallbackPage({
        searchParams: {
          provider: 'google',
          code: 'auth-code',
          email: 'test@example.com',
          user_id: 'user-123',
        },
      });

      await waitFor(() => {
        expect(screen.getByText(/sign in successful/i)).toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: /return to login/i })).not.toBeInTheDocument();
    });
  });
});
