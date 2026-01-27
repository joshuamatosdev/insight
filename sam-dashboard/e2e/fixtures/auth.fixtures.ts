import { Page, BrowserContext, APIRequestContext } from '@playwright/test';

/**
 * Authentication fixtures and helpers for E2E tests
 *
 * IMPORTANT: These tests are designed to run against the local development server.
 * Do NOT run these tests against production. Use mock data or test backend.
 */

// ============================================================================
// Types
// ============================================================================

export interface TestCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface MockAuthResponse {
  token: string;
  refreshToken: string;
  user: MockUser;
  mfaRequired?: boolean;
}

export interface MockErrorResponse {
  message: string;
  code?: string;
  field?: string;
}

// ============================================================================
// Test User Credentials
// ============================================================================

/**
 * Default test user credentials
 * These are used when environment variables are not set
 *
 * IMPORTANT: In a real testing environment, you should:
 * 1. Use environment variables for credentials
 * 2. Have a separate test database with known test users
 * 3. Use API mocking for isolated tests
 */
export const TEST_USERS = {
  /**
   * Standard test user for normal login scenarios
   */
  standard: {
    email: process.env.E2E_TEST_USER_EMAIL ?? 'test@example.com',
    password: process.env.E2E_TEST_USER_PASSWORD ?? 'testpassword123',
    firstName: 'Test',
    lastName: 'User',
  } as TestCredentials,

  /**
   * Admin test user for elevated privilege scenarios
   */
  admin: {
    email: process.env.E2E_ADMIN_USER_EMAIL ?? 'admin@example.com',
    password: process.env.E2E_ADMIN_USER_PASSWORD ?? 'adminpassword123',
    firstName: 'Admin',
    lastName: 'User',
  } as TestCredentials,

  /**
   * Invalid credentials for testing error scenarios
   */
  invalid: {
    email: 'invalid@example.com',
    password: 'wrongpassword123',
    firstName: 'Invalid',
    lastName: 'User',
  } as TestCredentials,

  /**
   * User with short password for validation testing
   */
  shortPassword: {
    email: 'test@example.com',
    password: 'short',
    firstName: 'Test',
    lastName: 'User',
  } as TestCredentials,

  /**
   * User with invalid email format for validation testing
   */
  invalidEmail: {
    email: 'not-an-email',
    password: 'validpassword123',
    firstName: 'Test',
    lastName: 'User',
  } as TestCredentials,
};

// ============================================================================
// Storage Keys
// ============================================================================

/**
 * LocalStorage keys used by the application
 * These must match the keys used in the actual application
 */
export const STORAGE_KEYS = {
  authState: 'sam_auth_state',
  token: 'sam_token',
  refreshToken: 'sam_refresh_token',
  user: 'sam_user',
};

// ============================================================================
// API Endpoints
// ============================================================================

/**
 * API endpoints for authentication
 * Update these if your API paths differ
 */
export const AUTH_ENDPOINTS = {
  login: '**/api/auth/login',
  logout: '**/api/auth/logout',
  refresh: '**/api/auth/refresh',
  me: '**/api/auth/me',
  register: '**/api/auth/register',
  forgotPassword: '**/api/auth/forgot-password',
  resetPassword: '**/api/auth/reset-password',
};

// ============================================================================
// Mock Response Generators
// ============================================================================

/**
 * Generate a mock successful login response
 */
export function createMockLoginResponse(user: TestCredentials): MockAuthResponse {
  return {
    token: `mock-jwt-token-${Date.now()}`,
    refreshToken: `mock-refresh-token-${Date.now()}`,
    user: {
      id: '1',
      email: user.email,
      firstName: user.firstName ?? 'Test',
      lastName: user.lastName ?? 'User',
    },
  };
}

/**
 * Generate a mock error response
 */
export function createMockErrorResponse(
  message: string,
  code?: string,
  field?: string
): MockErrorResponse {
  return {
    message,
    code,
    field,
  };
}

// ============================================================================
// Route Handlers for API Mocking
// ============================================================================

/**
 * Set up mock for login endpoint that validates credentials
 */
export async function mockLoginEndpoint(
  page: Page,
  validUsers: TestCredentials[] = [TEST_USERS.standard]
): Promise<void> {
  await page.route(AUTH_ENDPOINTS.login, async (route) => {
    const request = route.request();
    let postData: { email?: string; password?: string };

    try {
      postData = request.postDataJSON();
    } catch {
      postData = {};
    }

    const matchingUser = validUsers.find(
      (user) => user.email === postData?.email && user.password === postData?.password
    );

    if (matchingUser !== undefined) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createMockLoginResponse(matchingUser)),
      });
    } else {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify(
          createMockErrorResponse('Invalid email or password', 'INVALID_CREDENTIALS')
        ),
      });
    }
  });
}

/**
 * Set up mock for login endpoint that always succeeds
 */
export async function mockLoginSuccess(page: Page, user?: TestCredentials): Promise<void> {
  await page.route(AUTH_ENDPOINTS.login, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(createMockLoginResponse(user ?? TEST_USERS.standard)),
    });
  });
}

/**
 * Set up mock for login endpoint that always fails
 */
export async function mockLoginFailure(
  page: Page,
  errorMessage: string = 'Invalid email or password',
  statusCode: number = 401
): Promise<void> {
  await page.route(AUTH_ENDPOINTS.login, async (route) => {
    await route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify(createMockErrorResponse(errorMessage, 'INVALID_CREDENTIALS')),
    });
  });
}

/**
 * Set up mock for login endpoint that simulates a server error
 */
export async function mockLoginServerError(page: Page): Promise<void> {
  await page.route(AUTH_ENDPOINTS.login, async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify(createMockErrorResponse('Internal server error', 'SERVER_ERROR')),
    });
  });
}

/**
 * Set up mock for login endpoint that simulates a network timeout
 */
export async function mockLoginTimeout(page: Page, delayMs: number = 30000): Promise<void> {
  await page.route(AUTH_ENDPOINTS.login, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    await route.abort('timedout');
  });
}

/**
 * Set up mock for logout endpoint
 */
export async function mockLogoutEndpoint(page: Page): Promise<void> {
  await page.route(AUTH_ENDPOINTS.logout, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });
}

/**
 * Set up mock for user profile endpoint
 */
export async function mockUserProfileEndpoint(page: Page, user?: TestCredentials): Promise<void> {
  await page.route(AUTH_ENDPOINTS.me, async (route) => {
    const userData = user ?? TEST_USERS.standard;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: '1',
        email: userData.email,
        firstName: userData.firstName ?? 'Test',
        lastName: userData.lastName ?? 'User',
      }),
    });
  });
}

/**
 * Set up mock for token refresh endpoint
 */
export async function mockRefreshEndpoint(page: Page): Promise<void> {
  await page.route(AUTH_ENDPOINTS.refresh, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: `mock-new-jwt-token-${Date.now()}`,
        refreshToken: `mock-new-refresh-token-${Date.now()}`,
      }),
    });
  });
}

/**
 * Set up all auth-related mocks for comprehensive testing
 */
export async function setupAllAuthMocks(
  page: Page,
  validUsers: TestCredentials[] = [TEST_USERS.standard]
): Promise<void> {
  await mockLoginEndpoint(page, validUsers);
  await mockLogoutEndpoint(page);
  await mockUserProfileEndpoint(page);
  await mockRefreshEndpoint(page);
}

// ============================================================================
// Storage Helpers
// ============================================================================

/**
 * Set auth state in localStorage
 */
export async function setAuthState(
  page: Page,
  token: string,
  refreshToken: string,
  user: MockUser
): Promise<void> {
  await page.evaluate(
    ({ keys, authData }) => {
      localStorage.setItem(
        keys.authState,
        JSON.stringify({
          token: authData.token,
          refreshToken: authData.refreshToken,
          user: authData.user,
        })
      );
    },
    {
      keys: STORAGE_KEYS,
      authData: { token, refreshToken, user },
    }
  );
}

/**
 * Clear all auth-related storage
 */
export async function clearAuthState(page: Page): Promise<void> {
  await page.evaluate((keys) => {
    Object.values(keys).forEach((key) => {
      localStorage.removeItem(key);
    });
    sessionStorage.clear();
  }, STORAGE_KEYS);
}

/**
 * Get current auth state from localStorage
 */
export async function getAuthState(page: Page): Promise<MockAuthResponse | null> {
  const authData = await page.evaluate((key) => {
    const data = localStorage.getItem(key);
    return data !== null ? JSON.parse(data) : null;
  }, STORAGE_KEYS.authState);

  return authData as MockAuthResponse | null;
}

/**
 * Check if user is authenticated (has valid auth state in storage)
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const authState = await getAuthState(page);
  return authState !== null && authState.token !== undefined;
}

// ============================================================================
// Login Helpers
// ============================================================================

/**
 * Perform login via UI
 */
export async function loginViaUI(
  page: Page,
  credentials: TestCredentials = TEST_USERS.standard
): Promise<void> {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(credentials.email);
  await page.getByLabel(/password/i).fill(credentials.password);
  await page.getByRole('button', { name: /sign in/i }).click();
}

/**
 * Perform login and wait for redirect
 */
export async function loginAndWaitForDashboard(
  page: Page,
  credentials: TestCredentials = TEST_USERS.standard,
  timeout: number = 10000
): Promise<void> {
  await loginViaUI(page, credentials);
  await page.waitForURL(/^\/$|dashboard/, { timeout });
}

/**
 * Bypass UI login by setting auth state directly
 * Useful for tests that don't need to test the login flow itself
 */
export async function loginViaStorage(
  page: Page,
  user: TestCredentials = TEST_USERS.standard
): Promise<void> {
  const mockResponse = createMockLoginResponse(user);
  await setAuthState(page, mockResponse.token, mockResponse.refreshToken, mockResponse.user);
}

// ============================================================================
// Logout Helpers
// ============================================================================

/**
 * Perform logout via UI
 */
export async function logoutViaUI(page: Page): Promise<void> {
  const signOutButton = page.getByRole('button', { name: /sign out/i });
  await signOutButton.click();
}

/**
 * Perform logout and wait for redirect
 */
export async function logoutAndWaitForLogin(page: Page, timeout: number = 5000): Promise<void> {
  await logoutViaUI(page);
  await page.waitForURL(/login/, { timeout });
}

/**
 * Bypass UI logout by clearing auth state directly
 */
export async function logoutViaStorage(page: Page): Promise<void> {
  await clearAuthState(page);
}
