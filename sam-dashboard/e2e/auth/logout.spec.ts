import {expect, test} from '../fixtures/test-fixtures';

/**
 * Logout Flow E2E Tests
 *
 * Tests the complete logout flow including clicking the sign out button,
 * session cleanup, and redirect behavior.
 */

test.describe('Logout Flow', () => {
    test.describe('Logout Button', () => {
        test('should display sign out option in sidebar', async ({
                                                                     authenticatedPage,
                                                                 }) => {
            const {page} = authenticatedPage;

            // Sign Out should be visible in the sidebar
            await expect(page.getByRole('button', {name: /sign out/i})).toBeVisible();
        });

        test('should logout when clicking sign out button', async ({
                                                                       authenticatedPage,
                                                                   }) => {
            const {page} = authenticatedPage;

            // Click Sign Out
            await page.getByRole('button', {name: /sign out/i}).click();

            // Should be redirected to login page
            await expect(page).toHaveURL(/login/, {timeout: 5000});
        });

        test('should clear user info from UI after logout', async ({
                                                                       authenticatedPage,
                                                                       testUser,
                                                                   }) => {
            const {page} = authenticatedPage;

            // Verify user info is visible before logout
            await expect(page.getByText(testUser.email)).toBeVisible();

            // Click Sign Out
            await page.getByRole('button', {name: /sign out/i}).click();

            // Wait for redirect to login
            await page.waitForURL(/login/, {timeout: 5000});

            // User info should no longer be visible
            await expect(page.getByText(testUser.email)).not.toBeVisible();
        });
    });

    test.describe('Redirect After Logout', () => {
        test('should redirect to login page after logout', async ({
                                                                      authenticatedPage,
                                                                  }) => {
            const {page} = authenticatedPage;

            // Perform logout
            await page.getByRole('button', {name: /sign out/i}).click();

            // Verify redirect to login
            await expect(page).toHaveURL(/login/);

            // Login form should be visible
            await expect(page.getByLabel(/email/i)).toBeVisible();
            await expect(page.getByLabel(/password/i)).toBeVisible();
        });

        test('should not auto-redirect back to dashboard after logout', async ({
                                                                                   authenticatedPage,
                                                                               }) => {
            const {page} = authenticatedPage;

            // Perform logout
            await page.getByRole('button', {name: /sign out/i}).click();
            await page.waitForURL(/login/, {timeout: 5000});

            // Wait a moment to ensure no auto-redirect happens
            await page.waitForTimeout(1000);

            // Should still be on login page
            await expect(page).toHaveURL(/login/);
        });
    });

    test.describe('Protected Routes After Logout', () => {
        test('should redirect to login when accessing root after logout', async ({
                                                                                     authenticatedPage,
                                                                                 }) => {
            const {page} = authenticatedPage;

            // Perform logout
            await page.getByRole('button', {name: /sign out/i}).click();
            await page.waitForURL(/login/, {timeout: 5000});

            // Try to access root (protected)
            await page.goto('/');

            // Should be redirected to login
            await expect(page).toHaveURL(/login/);
        });

        test('should redirect to login when accessing protected route after logout', async ({
                                                                                                authenticatedPage,
                                                                                            }) => {
            const {page} = authenticatedPage;

            // Perform logout
            await page.getByRole('button', {name: /sign out/i}).click();
            await page.waitForURL(/login/, {timeout: 5000});

            // Try to access various protected routes
            const protectedRoutes = ['/', '/dashboard', '/opportunities'];

            for (const route of protectedRoutes) {
                await page.goto(route);

                // Should be redirected to login for all protected routes
                await expect(page).toHaveURL(/login/);
            }
        });

        test('should not access dashboard content after logout via browser back', async ({
                                                                                             authenticatedPage,
                                                                                         }) => {
            const {page} = authenticatedPage;

            // Verify we're on the dashboard
            await expect(page).toHaveURL(/^\/$|dashboard/);

            // Perform logout
            await page.getByRole('button', {name: /sign out/i}).click();
            await page.waitForURL(/login/, {timeout: 5000});

            // Try browser back button
            await page.goBack();

            // Should either stay on login or redirect back to login
            // (depending on implementation - cache vs auth check)
            await page.waitForTimeout(500);

            // After going back, the page should redirect to login
            // because the auth state is cleared
            await expect(page).toHaveURL(/login/);
        });
    });

    test.describe('Session Cleanup', () => {
        test('should clear localStorage auth data after logout', async ({
                                                                            authenticatedPage,
                                                                        }) => {
            const {page} = authenticatedPage;

            // Verify auth data exists in localStorage before logout
            const authDataBefore = await page.evaluate(() => {
                return localStorage.getItem('sam_auth_state');
            });
            expect(authDataBefore).not.toBeNull();

            // Perform logout
            await page.getByRole('button', {name: /sign out/i}).click();
            await page.waitForURL(/login/, {timeout: 5000});

            // Verify auth data is cleared from localStorage
            const authDataAfter = await page.evaluate(() => {
                return localStorage.getItem('sam_auth_state');
            });
            expect(authDataAfter).toBeNull();
        });

        test('should not maintain session in new tab after logout', async ({
                                                                               authenticatedPage,
                                                                               context,
                                                                           }) => {
            const {page} = authenticatedPage;

            // Perform logout
            await page.getByRole('button', {name: /sign out/i}).click();
            await page.waitForURL(/login/, {timeout: 5000});

            // Open new tab
            const newPage = await context.newPage();
            await newPage.goto('/');

            // New tab should also be on login page
            await expect(newPage).toHaveURL(/login/);

            // Clean up
            await newPage.close();
        });

        test('should require re-authentication after logout', async ({
                                                                         authenticatedPage,
                                                                         testUser,
                                                                     }) => {
            const {page} = authenticatedPage;

            // Perform logout
            await page.getByRole('button', {name: /sign out/i}).click();
            await page.waitForURL(/login/, {timeout: 5000});

            // Login form should be empty
            const emailValue = await page.getByLabel(/email/i).inputValue();
            const passwordValue = await page.getByLabel(/password/i).inputValue();

            expect(emailValue).toBe('');
            expect(passwordValue).toBe('');

            // Fill in credentials and login again
            await page.getByLabel(/email/i).fill(testUser.email);
            await page.getByLabel(/password/i).fill(testUser.password);
            await page.getByRole('button', {name: /sign in/i}).click();

            // Should be able to access dashboard again
            await expect(page).toHaveURL(/^\/$|dashboard/, {timeout: 10000});
        });
    });

    test.describe('Multi-Tab Logout', () => {
        test('should logout from all tabs when logging out from one', async ({
                                                                                 authenticatedPage,
                                                                                 context,
                                                                             }) => {
            const {page: firstTab} = authenticatedPage;

            // Open second tab
            const secondTab = await context.newPage();
            await secondTab.goto('/');

            // Verify second tab is authenticated
            await expect(secondTab).toHaveURL(/^\/$|dashboard/);

            // Logout from first tab
            await firstTab.getByRole('button', {name: /sign out/i}).click();
            await firstTab.waitForURL(/login/, {timeout: 5000});

            // Wait for storage event to propagate
            await secondTab.waitForTimeout(1000);

            // Reload second tab to check auth state
            await secondTab.reload();

            // Second tab should also be logged out (redirected to login)
            await expect(secondTab).toHaveURL(/login/);

            // Clean up
            await secondTab.close();
        });
    });
});
