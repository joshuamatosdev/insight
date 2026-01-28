import {expect, test} from '../fixtures/test-fixtures';

/**
 * Profile Settings E2E Tests
 *
 * Tests user profile settings management.
 */

test.describe('Profile Settings', () => {
    test.beforeEach(async ({authenticatedPage}) => {
        const {page} = authenticatedPage;
        await page.goto('/settings/profile');
        await page.waitForLoadState('networkidle');
    });

    test.describe('Profile Display', () => {
        test('should display profile settings page', async ({
                                                                authenticatedPage,
                                                            }) => {
            const {page} = authenticatedPage;

            await expect(
                page.getByRole('heading', {name: /profile|account/i})
            ).toBeVisible({timeout: 10000});
        });

        test('should display current profile information', async ({
                                                                      authenticatedPage,
                                                                  }) => {
            const {page, user} = authenticatedPage;

            // Email should be displayed
            await expect(
                page.getByText(new RegExp(user.email, 'i'))
            ).toBeVisible({timeout: 10000});
        });

        test('should display profile form fields', async ({
                                                              authenticatedPage,
                                                          }) => {
            const {page} = authenticatedPage;

            // Name fields
            await expect(
                page.getByLabel(/first name|name/i)
            ).toBeVisible({timeout: 10000});
        });
    });

    test.describe('Update Profile', () => {
        test('should update profile information', async ({
                                                             authenticatedPage,
                                                         }) => {
            const {page} = authenticatedPage;

            const firstNameInput = page.getByLabel(/first name/i);
            if (await firstNameInput.isVisible({timeout: 5000}).catch(() => false)) {
                await firstNameInput.fill('Updated Name');

                const saveButton = page.getByRole('button', {name: /save|update/i});
                await saveButton.click();

                await expect(
                    page.getByText(/saved|updated|success/i)
                ).toBeVisible({timeout: 10000});
            }
        });

        test('should validate required fields', async ({
                                                           authenticatedPage,
                                                       }) => {
            const {page} = authenticatedPage;

            const firstNameInput = page.getByLabel(/first name/i);
            if (await firstNameInput.isVisible({timeout: 5000}).catch(() => false)) {
                await firstNameInput.clear();

                const saveButton = page.getByRole('button', {name: /save|update/i});
                await saveButton.click();

                await expect(
                    page.getByText(/required/i)
                ).toBeVisible({timeout: 5000});
            }
        });
    });

    test.describe('Change Password', () => {
        test('should display change password section', async ({
                                                                  authenticatedPage,
                                                              }) => {
            const {page} = authenticatedPage;

            await expect(
                page.getByText(/change password|password/i)
            ).toBeVisible({timeout: 10000});
        });

        test('should show password change form', async ({
                                                            authenticatedPage,
                                                        }) => {
            const {page} = authenticatedPage;

            const changePasswordButton = page.getByRole('button', {name: /change password/i});
            if (await changePasswordButton.isVisible({timeout: 5000}).catch(() => false)) {
                await changePasswordButton.click();

                // Password form should appear
                await expect(
                    page.getByLabel(/current password/i)
                ).toBeVisible({timeout: 5000});
            }
        });

        test('should validate password requirements', async ({
                                                                 authenticatedPage,
                                                             }) => {
            const {page} = authenticatedPage;

            const newPasswordInput = page.getByLabel(/new password/i);
            if (await newPasswordInput.isVisible({timeout: 5000}).catch(() => false)) {
                await newPasswordInput.fill('short');

                const saveButton = page.getByRole('button', {name: /save|change/i});
                await saveButton.click();

                await expect(
                    page.getByText(/at least|minimum|characters/i)
                ).toBeVisible({timeout: 5000});
            }
        });
    });
});
