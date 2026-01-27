import { test as base, Page, Locator } from '@playwright/test';

/**
 * Common test fixtures and page objects for SAMGov E2E tests
 *
 * IMPORTANT: These tests are designed to run against the local development server.
 * Do NOT run these tests against production. Use mock data or test backend for
 * authentication-related tests.
 */

// ============================================================================
// Types
// ============================================================================

export interface TestUser {
  email: string;
  password: string;
  name?: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthenticatedPageFixture {
  page: Page;
  user: TestUser;
}

// ============================================================================
// Environment Configuration
// ============================================================================

/**
 * Test environment configuration
 * These values can be overridden with environment variables
 */
const TEST_CONFIG = {
  // Test user credentials - override with E2E_TEST_USER_EMAIL and E2E_TEST_USER_PASSWORD
  testUserEmail: process.env.E2E_TEST_USER_EMAIL ?? 'test@example.com',
  testUserPassword: process.env.E2E_TEST_USER_PASSWORD ?? 'testpassword123',
  testUserFirstName: process.env.E2E_TEST_USER_FIRST_NAME ?? 'Test',
  testUserLastName: process.env.E2E_TEST_USER_LAST_NAME ?? 'User',

  // Auth storage key (must match the app's localStorage key)
  authStorageKey: 'sam_auth_state',

  // Timeouts
  defaultTimeout: 10000,
  shortTimeout: 5000,
};

// ============================================================================
// Page Objects
// ============================================================================

/**
 * Page object for authentication-related pages (login, register)
 */
export class AuthPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly signOutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.submitButton = page.getByRole('button', { name: /sign in|log in|submit/i });
    this.errorMessage = page.getByRole('alert');
    this.signOutButton = page.getByRole('button', { name: /sign out|log out/i });
  }

  /**
   * Navigate to login page
   */
  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  /**
   * Fill and submit login form
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /**
   * Wait for successful login (redirect away from login page)
   */
  async waitForLoginSuccess(timeout: number = TEST_CONFIG.defaultTimeout): Promise<void> {
    await this.page.waitForURL(/^\/$|dashboard/, { timeout });
  }

  /**
   * Perform logout
   */
  async logout(): Promise<void> {
    await this.signOutButton.click();
    await this.page.waitForURL(/login/, { timeout: TEST_CONFIG.shortTimeout });
  }

  /**
   * Check if currently on login page
   */
  async isOnLoginPage(): Promise<boolean> {
    return this.page.url().includes('/login');
  }
}

/**
 * Page object for opportunities-related pages
 */
export class OpportunitiesPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly filterButton: Locator;
  readonly opportunityList: Locator;
  readonly opportunityCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByRole('searchbox').or(page.getByPlaceholder(/search/i));
    this.filterButton = page.getByRole('button', { name: /filter/i });
    this.opportunityList = page.getByRole('list');
    this.opportunityCards = page.locator('[data-testid="opportunity-card"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/opportunities');
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }
}

/**
 * Page object for the main dashboard
 */
export class DashboardPage {
  readonly page: Page;
  readonly sidebar: Locator;
  readonly mainContent: Locator;
  readonly userInfo: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.locator('[data-testid="sidebar"]').or(page.locator('nav'));
    this.mainContent = page.locator('main');
    this.userInfo = page.locator('[data-testid="user-info"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async navigateTo(section: string): Promise<void> {
    await this.page.getByRole('button', { name: new RegExp(section, 'i') }).click();
  }
}

// ============================================================================
// Test Fixtures
// ============================================================================

type Fixtures = {
  authPage: AuthPage;
  opportunitiesPage: OpportunitiesPage;
  dashboardPage: DashboardPage;
  testUser: TestUser;
  authenticatedPage: AuthenticatedPageFixture;
};

/**
 * Extended test with common fixtures
 */
export const test = base.extend<Fixtures>({
  /**
   * AuthPage fixture - provides login/logout page object
   */
  authPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    await use(authPage);
  },

  /**
   * OpportunitiesPage fixture - provides opportunities page object
   */
  opportunitiesPage: async ({ page }, use) => {
    const opportunitiesPage = new OpportunitiesPage(page);
    await use(opportunitiesPage);
  },

  /**
   * DashboardPage fixture - provides dashboard page object
   */
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  /**
   * Test user fixture - provides test user credentials
   * Override with environment variables for different environments
   */
  testUser: async ({}, use) => {
    const testUser: TestUser = {
      email: TEST_CONFIG.testUserEmail,
      password: TEST_CONFIG.testUserPassword,
      firstName: TEST_CONFIG.testUserFirstName,
      lastName: TEST_CONFIG.testUserLastName,
      name: `${TEST_CONFIG.testUserFirstName} ${TEST_CONFIG.testUserLastName}`,
    };
    await use(testUser);
  },

  /**
   * Authenticated page fixture - provides a page that is already logged in
   * Use this when you need to test features that require authentication
   */
  authenticatedPage: async ({ page, testUser }, use) => {
    // Navigate to login page
    await page.goto('/login');

    // Perform login
    const authPage = new AuthPage(page);
    await authPage.login(testUser.email, testUser.password);

    // Wait for successful login
    await page.waitForURL(/^\/$|dashboard/, { timeout: TEST_CONFIG.defaultTimeout });

    // Provide the authenticated page to the test
    await use({ page, user: testUser });

    // Cleanup: logout after test (if still authenticated)
    try {
      const isAuthenticated = !page.url().includes('/login');
      if (isAuthenticated) {
        const signOutButton = page.getByRole('button', { name: /sign out/i });
        if (await signOutButton.isVisible().catch(() => false)) {
          await signOutButton.click();
          await page.waitForURL(/login/, { timeout: TEST_CONFIG.shortTimeout }).catch(() => {});
        }
      }
    } catch {
      // Ignore cleanup errors
    }
  },
});

export { expect } from '@playwright/test';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Wait for the page to be fully loaded
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `playwright-report/screenshots/${name}.png` });
}

/**
 * Clear all auth-related storage
 */
export async function clearAuthStorage(page: Page): Promise<void> {
  await page.evaluate((key) => {
    localStorage.removeItem(key);
    sessionStorage.clear();
  }, TEST_CONFIG.authStorageKey);
}

/**
 * Check if the page is authenticated by looking for auth state in localStorage
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const authData = await page.evaluate((key) => {
    return localStorage.getItem(key);
  }, TEST_CONFIG.authStorageKey);

  return authData !== null;
}

/**
 * Mock API response for authentication
 * Use this to test different API response scenarios
 */
export async function mockAuthResponse(
  page: Page,
  scenario: 'success' | 'invalid' | 'error' | 'timeout'
): Promise<void> {
  switch (scenario) {
    case 'success':
      await page.route('**/api/auth/login', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            token: 'mock-jwt-token',
            refreshToken: 'mock-refresh-token',
            user: {
              id: '1',
              email: TEST_CONFIG.testUserEmail,
              firstName: TEST_CONFIG.testUserFirstName,
              lastName: TEST_CONFIG.testUserLastName,
            },
          }),
        });
      });
      break;

    case 'invalid':
      await page.route('**/api/auth/login', async (route) => {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Invalid email or password',
            code: 'INVALID_CREDENTIALS',
          }),
        });
      });
      break;

    case 'error':
      await page.route('**/api/auth/login', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Internal server error',
            code: 'SERVER_ERROR',
          }),
        });
      });
      break;

    case 'timeout':
      await page.route('**/api/auth/login', async (route) => {
        // Simulate a timeout by delaying the response
        await new Promise((resolve) => setTimeout(resolve, 30000));
        await route.abort('timedout');
      });
      break;
  }
}

/**
 * Set up mock for all auth-related API endpoints
 */
export async function setupAuthMocks(page: Page): Promise<void> {
  // Mock login endpoint
  await page.route('**/api/auth/login', async (route) => {
    const request = route.request();
    const postData = request.postDataJSON();

    if (
      postData?.email === TEST_CONFIG.testUserEmail &&
      postData?.password === TEST_CONFIG.testUserPassword
    ) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token',
          user: {
            id: '1',
            email: TEST_CONFIG.testUserEmail,
            firstName: TEST_CONFIG.testUserFirstName,
            lastName: TEST_CONFIG.testUserLastName,
          },
        }),
      });
    } else {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        }),
      });
    }
  });

  // Mock logout endpoint
  await page.route('**/api/auth/logout', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  // Mock user profile endpoint
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: '1',
        email: TEST_CONFIG.testUserEmail,
        firstName: TEST_CONFIG.testUserFirstName,
        lastName: TEST_CONFIG.testUserLastName,
      }),
    });
  });

  // Mock token refresh endpoint
  await page.route('**/api/auth/refresh', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'mock-new-jwt-token',
        refreshToken: 'mock-new-refresh-token',
      }),
    });
  });
}
