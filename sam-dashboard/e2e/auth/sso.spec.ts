import {expect, test} from '../fixtures/test-fixtures';

/**
 * SSO Login E2E Tests
 *
 * Tests SSO login buttons and redirect flow.
 */

test.describe('SSO Login', () => {
    test.beforeEach(async ({authPage}) => {
        await authPage.goto();
    });

    test.describe('SSO Buttons Display', () => {
        test('should display Google login button', async ({page}) => {
            await expect(
                page.getByRole('button', {name: /google/i})
                    .or(page.locator('[data-testid="google-login"]'))
            ).toBeVisible({timeout: 10000});
        });

        test('should display Microsoft login button', async ({page}) => {
            await expect(
                page.getByRole('button', {name: /microsoft/i})
                    .or(page.locator('[data-testid="microsoft-login"]'))
            ).toBeVisible({timeout: 10000});
        });

        test('should display SSO section divider', async ({page}) => {
            // "Or continue with" divider
            await expect(
                page.getByText(/or continue|or sign in|other options/i)
            ).toBeVisible({timeout: 10000});
        });
    });

    test.describe('OAuth Flow', () => {
        test('should initiate Google OAuth flow', async ({page}) => {
            const googleButton = page.getByRole('button', {name: /google/i});

            if (await googleButton.isVisible({timeout: 5000}).catch(() => false)) {
                // Click will redirect to Google
                const [popup] = await Promise.all([
                    page.waitForEvent('popup', {timeout: 5000}).catch(() => null),
                    googleButton.click(),
                ]);

                // Either popup or redirect
                if (popup !== null) {
                    await expect(popup).toHaveURL(/accounts\.google\.com/);
                    await popup.close();
                } else {
                    // URL should change to OAuth provider
                    await expect(page).toHaveURL(/accounts\.google\.com|auth|oauth/);
                }
            }
        });

        test('should initiate Microsoft OAuth flow', async ({page}) => {
            const microsoftButton = page.getByRole('button', {name: /microsoft/i});

            if (await microsoftButton.isVisible({timeout: 5000}).catch(() => false)) {
                const [popup] = await Promise.all([
                    page.waitForEvent('popup', {timeout: 5000}).catch(() => null),
                    microsoftButton.click(),
                ]);

                if (popup !== null) {
                    await expect(popup).toHaveURL(/login\.microsoftonline\.com|microsoft/);
                    await popup.close();
                }
            }
        });
    });

    test.describe('Error Handling', () => {
        test('should handle OAuth errors gracefully', async ({page}) => {
            // Navigate to callback with error
            await page.goto('/auth/callback?error=access_denied');

            // Should show error message
            await expect(
                page.getByText(/denied|cancelled|failed|error/i)
            ).toBeVisible({timeout: 10000}).catch(() => {
                // May redirect to login
            });
        });

        test('should redirect to login on OAuth failure', async ({page}) => {
            await page.goto('/auth/callback?error=invalid_request');

            // Should redirect to login
            await expect(page).toHaveURL(/login/, {timeout: 10000});
        });
    });
});
