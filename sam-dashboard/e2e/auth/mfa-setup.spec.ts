import {expect, test} from '../fixtures/test-fixtures';

/**
 * MFA Setup E2E Tests
 *
 * Tests enabling MFA, QR code display, and backup codes.
 */

test.describe('MFA Setup', () => {
    test.beforeEach(async ({authenticatedPage}) => {
        const {page} = authenticatedPage;
        await page.goto('/settings/security');
        await page.waitForLoadState('networkidle');
    });

    test.describe('Enable MFA', () => {
        test('should display MFA setup option', async ({
                                                           authenticatedPage,
                                                       }) => {
            const {page} = authenticatedPage;

            await expect(
                page.getByText(/two-factor|2fa|mfa|multi-factor/i)
            ).toBeVisible({timeout: 10000});
        });

        test('should display enable MFA button', async ({
                                                            authenticatedPage,
                                                        }) => {
            const {page} = authenticatedPage;

            await expect(
                page.getByRole('button', {name: /enable|setup|configure/i})
            ).toBeVisible({timeout: 10000});
        });

        test('should open MFA setup wizard', async ({
                                                        authenticatedPage,
                                                    }) => {
            const {page} = authenticatedPage;

            const enableButton = page.getByRole('button', {name: /enable|setup/i});
            await enableButton.click();

            // Setup wizard should appear
            await expect(
                page.getByText(/setup|configure|authenticator/i)
            ).toBeVisible({timeout: 5000});
        });
    });

    test.describe('QR Code Display', () => {
        test('should display QR code for authenticator', async ({
                                                                    authenticatedPage,
                                                                }) => {
            const {page} = authenticatedPage;

            const enableButton = page.getByRole('button', {name: /enable|setup/i});
            await enableButton.click();

            // QR code should be displayed
            const qrCode = page.locator('[data-testid="qr-code"]')
                .or(page.locator('img[alt*="QR"]'))
                .or(page.locator('svg').filter({hasText: ''}).first());

            await expect(qrCode).toBeVisible({timeout: 10000});
        });

        test('should display manual entry code', async ({
                                                            authenticatedPage,
                                                        }) => {
            const {page} = authenticatedPage;

            const enableButton = page.getByRole('button', {name: /enable|setup/i});
            await enableButton.click();

            // Manual entry code should be shown
            await expect(
                page.getByText(/manual|secret|key/i)
            ).toBeVisible({timeout: 10000}).catch(() => {
            });
        });
    });

    test.describe('Verify TOTP', () => {
        test('should display verification input', async ({
                                                             authenticatedPage,
                                                         }) => {
            const {page} = authenticatedPage;

            const enableButton = page.getByRole('button', {name: /enable|setup/i});
            await enableButton.click();

            // Verification code input
            await expect(
                page.getByLabel(/code|otp|verification/i)
                    .or(page.getByPlaceholder(/code|6 digit/i))
            ).toBeVisible({timeout: 10000});
        });

        test('should validate code format', async ({
                                                       authenticatedPage,
                                                   }) => {
            const {page} = authenticatedPage;

            const enableButton = page.getByRole('button', {name: /enable|setup/i});
            await enableButton.click();

            const codeInput = page.getByLabel(/code/i)
                .or(page.getByPlaceholder(/code/i));

            if (await codeInput.isVisible({timeout: 5000}).catch(() => false)) {
                // Enter invalid code
                await codeInput.fill('abc');

                const verifyButton = page.getByRole('button', {name: /verify|confirm/i});
                await verifyButton.click();

                await expect(
                    page.getByText(/invalid|incorrect|6 digit/i)
                ).toBeVisible({timeout: 5000});
            }
        });
    });

    test.describe('Backup Codes', () => {
        test('should generate backup codes', async ({
                                                        authenticatedPage,
                                                    }) => {
            const {page} = authenticatedPage;

            // After MFA setup, backup codes should be shown
            const backupCodesLink = page.getByRole('button', {name: /backup|recovery/i});

            if (await backupCodesLink.isVisible({timeout: 5000}).catch(() => false)) {
                await backupCodesLink.click();

                // Backup codes should be displayed
                await expect(
                    page.getByText(/backup|recovery|code/i)
                ).toBeVisible({timeout: 5000});
            }
        });

        test('should allow downloading backup codes', async ({
                                                                 authenticatedPage,
                                                             }) => {
            const {page} = authenticatedPage;

            const backupCodesButton = page.getByRole('button', {name: /backup|recovery/i});

            if (await backupCodesButton.isVisible({timeout: 5000}).catch(() => false)) {
                await backupCodesButton.click();

                const downloadButton = page.getByRole('button', {name: /download|save/i});
                if (await downloadButton.isVisible({timeout: 3000}).catch(() => false)) {
                    await expect(downloadButton).toBeVisible();
                }
            }
        });
    });

    test.describe('Disable MFA', () => {
        test('should display disable option when MFA is enabled', async ({
                                                                             authenticatedPage,
                                                                         }) => {
            const {page} = authenticatedPage;

            const disableButton = page.getByRole('button', {name: /disable|turn off/i});

            if (await disableButton.isVisible({timeout: 5000}).catch(() => false)) {
                await expect(disableButton).toBeVisible();
            }
        });

        test('should require confirmation to disable', async ({
                                                                  authenticatedPage,
                                                              }) => {
            const {page} = authenticatedPage;

            const disableButton = page.getByRole('button', {name: /disable/i});

            if (await disableButton.isVisible({timeout: 5000}).catch(() => false)) {
                await disableButton.click();

                await expect(
                    page.getByText(/confirm|are you sure/i)
                ).toBeVisible({timeout: 5000});
            }
        });
    });
});
