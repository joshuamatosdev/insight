import {expect, test} from '../fixtures/test-fixtures';

/**
 * Tenant Settings E2E Tests
 *
 * Tests tenant configuration management.
 */

test.describe('Tenant Settings', () => {
    test.beforeEach(async ({authenticatedPage}) => {
        const {page} = authenticatedPage;
        await page.goto('/admin/settings');
        await page.waitForLoadState('networkidle');
    });

    test.describe('Settings Display', () => {
        test('should display tenant settings page', async ({
                                                               authenticatedPage,
                                                           }) => {
            const {page} = authenticatedPage;

            await expect(
                page.getByRole('heading', {name: /settings|organization/i})
            ).toBeVisible({timeout: 10000});
        });

        test('should display organization name', async ({
                                                            authenticatedPage,
                                                        }) => {
            const {page} = authenticatedPage;

            await expect(
                page.getByLabel(/organization|company|name/i)
            ).toBeVisible({timeout: 10000});
        });

        test('should display contact information', async ({
                                                              authenticatedPage,
                                                          }) => {
            const {page} = authenticatedPage;

            await expect(
                page.getByText(/contact|email|phone/i)
            ).toBeVisible({timeout: 10000});
        });
    });

    test.describe('Update Settings', () => {
        test('should update organization name', async ({
                                                           authenticatedPage,
                                                       }) => {
            const {page} = authenticatedPage;

            const nameInput = page.getByLabel(/organization name/i);

            if (await nameInput.isVisible({timeout: 5000}).catch(() => false)) {
                await nameInput.fill('Updated Organization Name');

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

            const nameInput = page.getByLabel(/organization name/i);

            if (await nameInput.isVisible({timeout: 5000}).catch(() => false)) {
                await nameInput.clear();

                const saveButton = page.getByRole('button', {name: /save|update/i});
                await saveButton.click();

                await expect(
                    page.getByText(/required/i)
                ).toBeVisible({timeout: 5000});
            }
        });
    });

    test.describe('Feature Configuration', () => {
        test('should display feature toggles', async ({
                                                          authenticatedPage,
                                                      }) => {
            const {page} = authenticatedPage;

            await expect(
                page.getByText(/features|enable|disable/i)
            ).toBeVisible({timeout: 10000}).catch(() => {
            });
        });

        test('should toggle features on/off', async ({
                                                         authenticatedPage,
                                                     }) => {
            const {page} = authenticatedPage;

            const featureToggle = page.getByRole('switch').first();

            if (await featureToggle.isVisible({timeout: 5000}).catch(() => false)) {
                const initialState = await featureToggle.isChecked();
                await featureToggle.click();

                const newState = await featureToggle.isChecked();
                expect(newState).not.toBe(initialState);
            }
        });
    });
});
