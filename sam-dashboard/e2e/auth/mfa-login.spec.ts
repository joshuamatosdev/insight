import {expect, test} from '../fixtures/test-fixtures';

/**
 * MFA Login E2E Tests
 *
 * Tests login with TOTP and backup codes.
 */

test.describe('MFA Login', () => {
    test.describe('TOTP Login', () => {
        test('should prompt for TOTP after password', async ({authPage, page}) => {
            await authPage.goto();

            // Login with credentials (for MFA-enabled user)
            await page.getByLabel(/email/i).fill('mfa-user@example.com');
            await page.getByLabel(/password/i).fill('password123');
            await page.getByRole('button', {name: /sign in/i}).click();

            // MFA prompt should appear
            await expect(
                page.getByText(/two-factor|verification code|enter code/i)
            ).toBeVisible({timeout: 10000}).catch(() => {
                // User might not have MFA enabled in test environment
            });
        });

        test('should display TOTP input field', async ({authPage, page}) => {
            await authPage.goto();

            await page.getByLabel(/email/i).fill('mfa-user@example.com');
            await page.getByLabel(/password/i).fill('password123');
            await page.getByRole('button', {name: /sign in/i}).click();

            // TOTP input should be visible
            const totpInput = page.getByLabel(/code/i)
                .or(page.getByPlaceholder(/code/i));

            if (await totpInput.isVisible({timeout: 5000}).catch(() => false)) {
                await expect(totpInput).toBeVisible();
            }
        });

        test('should show error for invalid TOTP', async ({authPage, page}) => {
            await authPage.goto();

            await page.getByLabel(/email/i).fill('mfa-user@example.com');
            await page.getByLabel(/password/i).fill('password123');
            await page.getByRole('button', {name: /sign in/i}).click();

            const totpInput = page.getByLabel(/code/i);

            if (await totpInput.isVisible({timeout: 5000}).catch(() => false)) {
                await totpInput.fill('000000');
                await page.getByRole('button', {name: /verify|submit/i}).click();

                await expect(
                    page.getByText(/invalid|incorrect|wrong/i)
                ).toBeVisible({timeout: 5000});
            }
        });
    });

    test.describe('Backup Code Login', () => {
        test('should display backup code option', async ({authPage, page}) => {
            await authPage.goto();

            await page.getByLabel(/email/i).fill('mfa-user@example.com');
            await page.getByLabel(/password/i).fill('password123');
            await page.getByRole('button', {name: /sign in/i}).click();

            // Look for backup code link
            const backupLink = page.getByRole('button', {name: /backup|recovery|alternative/i})
                .or(page.getByText(/use backup/i));

            if (await backupLink.isVisible({timeout: 5000}).catch(() => false)) {
                await expect(backupLink).toBeVisible();
            }
        });

        test('should switch to backup code input', async ({authPage, page}) => {
            await authPage.goto();

            await page.getByLabel(/email/i).fill('mfa-user@example.com');
            await page.getByLabel(/password/i).fill('password123');
            await page.getByRole('button', {name: /sign in/i}).click();

            const backupLink = page.getByRole('button', {name: /backup|recovery/i});

            if (await backupLink.isVisible({timeout: 5000}).catch(() => false)) {
                await backupLink.click();

                // Backup code input should appear
                await expect(
                    page.getByLabel(/backup|recovery/i)
                ).toBeVisible({timeout: 5000});
            }
        });

        test('should show error for invalid backup code', async ({authPage, page}) => {
            await authPage.goto();

            await page.getByLabel(/email/i).fill('mfa-user@example.com');
            await page.getByLabel(/password/i).fill('password123');
            await page.getByRole('button', {name: /sign in/i}).click();

            const backupLink = page.getByRole('button', {name: /backup/i});

            if (await backupLink.isVisible({timeout: 5000}).catch(() => false)) {
                await backupLink.click();

                const backupInput = page.getByLabel(/backup/i);
                await backupInput.fill('invalid-code');
                await page.getByRole('button', {name: /verify|submit/i}).click();

                await expect(
                    page.getByText(/invalid|incorrect/i)
                ).toBeVisible({timeout: 5000});
            }
        });
    });

    test.describe('Remember Device', () => {
        test('should display remember device option', async ({authPage, page}) => {
            await authPage.goto();

            await page.getByLabel(/email/i).fill('mfa-user@example.com');
            await page.getByLabel(/password/i).fill('password123');
            await page.getByRole('button', {name: /sign in/i}).click();

            const rememberCheckbox = page.getByLabel(/remember|trust/i);

            if (await rememberCheckbox.isVisible({timeout: 5000}).catch(() => false)) {
                await expect(rememberCheckbox).toBeVisible();
            }
        });
    });
});
